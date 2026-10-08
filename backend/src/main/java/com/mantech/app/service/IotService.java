package com.mantech.app.service;

import com.mantech.app.domain.IotDevice;
import com.mantech.app.domain.SensorReading;
import com.mantech.app.dto.*;
import com.mantech.app.repository.IotDeviceRepository;
import com.mantech.app.repository.MachineRepository;
import com.mantech.app.repository.SensorReadingRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

/**
 * Capa IoT: recibe lo que miden las placas de campo y lo sirve a la app.
 *
 * La clasificación contra umbrales ocurre acá, al momento de recibir el dato,
 * y se guarda junto a la medición. Así la app no necesita conocer los umbrales
 * y queda registrado cómo se evaluó cada lectura.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class IotService {

    public static final String TEMPERATURA = "TEMPERATURA";
    public static final String VIBRACION = "VIBRACION";
    public static final String INCLINACION = "INCLINACION";

    public static final String NORMAL = "NORMAL";
    public static final String ALERTA = "ALERTA";
    public static final String CRITICO = "CRITICO";
    public static final String SIN_DATOS = "SIN_DATOS";

    private static final DateTimeFormatter ISO = DateTimeFormatter.ISO_LOCAL_DATE_TIME;

    /** Magnitud conocida: unidad canónica, etiqueta y umbrales. */
    private record MetricSpec(String label, String unit, double warning, double critical) {}

    private final IotDeviceRepository deviceRepository;
    private final SensorReadingRepository readingRepository;
    private final MachineRepository machineRepository;

    // Umbrales configurables por entorno: cada planta tiene su propio criterio.
    @Value("${app.iot.threshold.temperature.warning:60}")
    private double tempWarning;
    @Value("${app.iot.threshold.temperature.critical:80}")
    private double tempCritical;
    @Value("${app.iot.threshold.vibration.warning:0.5}")
    private double vibWarning;
    @Value("${app.iot.threshold.vibration.critical:1.5}")
    private double vibCritical;
    @Value("${app.iot.threshold.tilt.warning:5}")
    private double tiltWarning;
    @Value("${app.iot.threshold.tilt.critical:15}")
    private double tiltCritical;

    /** Días de lecturas crudas que se conservan. */
    @Value("${app.iot.retention-days:3}")
    private int retentionDays;

    private Map<String, MetricSpec> specs() {
        Map<String, MetricSpec> m = new LinkedHashMap<>();
        m.put(TEMPERATURA, new MetricSpec("Temperatura", "C", tempWarning, tempCritical));
        m.put(VIBRACION, new MetricSpec("Vibración", "g", vibWarning, vibCritical));
        m.put(INCLINACION, new MetricSpec("Inclinación", "deg", tiltWarning, tiltCritical));
        return m;
    }

    public boolean isKnownMetric(String metric) {
        return metric != null && specs().containsKey(metric.trim().toUpperCase());
    }

    /** NORMAL / ALERTA / CRITICO según los umbrales de la magnitud. */
    private String classify(String metric, double value) {
        MetricSpec spec = specs().get(metric);
        if (spec == null) return NORMAL;
        double v = Math.abs(value);
        if (v >= spec.critical()) return CRITICO;
        if (v >= spec.warning()) return ALERTA;
        return NORMAL;
    }

    // ------------------------------------------------------------------
    // Ingesta (la llama el dispositivo)
    // ------------------------------------------------------------------

    @Transactional
    public IngestResponse ingest(String deviceKey, IngestReadingRequest request) {
        IotDevice device = deviceRepository.findByDeviceKey(deviceKey)
                .orElseThrow(() -> new AccessDeniedException("Dispositivo no reconocido."));

        if (!device.isActive()) {
            throw new AccessDeniedException("El dispositivo está dado de baja.");
        }

        LocalDateTime now = LocalDateTime.now();
        Map<String, MetricSpec> specs = specs();
        int accepted = 0;
        int rejected = 0;

        for (IngestReadingRequest.Sample sample : request.getReadings()) {
            String metric = sample.getMetric() == null ? "" : sample.getMetric().trim().toUpperCase();
            MetricSpec spec = specs.get(metric);
            Double value = sample.getValue();

            // Una magnitud desconocida o un valor no finito se descarta sin
            // cortar el lote: una lectura mala no debe tirar las buenas.
            if (spec == null || value == null || !Double.isFinite(value)) {
                rejected++;
                continue;
            }

            readingRepository.save(SensorReading.builder()
                    .device(device)
                    .machine(device.getMachine())
                    .metric(metric)
                    .value(value)
                    .unit(sample.getUnit() != null && !sample.getUnit().isBlank()
                            ? sample.getUnit().trim() : spec.unit())
                    .status(classify(metric, value))
                    .recordedAt(now)
                    .build());
            accepted++;
        }

        device.setLastSeenAt(now);
        if (request.getFirmwareVersion() != null && !request.getFirmwareVersion().isBlank()) {
            device.setFirmwareVersion(request.getFirmwareVersion().trim());
        }
        deviceRepository.save(device);

        return IngestResponse.builder()
                .accepted(accepted)
                .rejected(rejected)
                .intervalSeconds(device.getIntervalSeconds())
                .serverTime(now.format(ISO))
                .message(accepted > 0 ? "ok" : "sin lecturas válidas")
                .build();
    }

    // ------------------------------------------------------------------
    // Lectura (la llama la app)
    // ------------------------------------------------------------------

    @Transactional(readOnly = true)
    public List<IotDeviceResponse> liveDevices() {
        LocalDateTime now = LocalDateTime.now();
        return deviceRepository.findByActiveTrueOrderByNameAsc().stream()
                .map(d -> toDeviceResponse(d, now))
                .toList();
    }

    @Transactional(readOnly = true)
    public IotDeviceResponse device(Long id) {
        IotDevice device = deviceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Dispositivo no encontrado: " + id));
        return toDeviceResponse(device, LocalDateTime.now());
    }

    private IotDeviceResponse toDeviceResponse(IotDevice device, LocalDateTime now) {
        Map<String, MetricSpec> specs = specs();
        List<SensorReading> latest = readingRepository.findLatestPerMetricByDevice(device.getId());
        boolean online = device.isOnline(now);

        // Orden de lectura, no alfabético: temperatura primero porque es la que
        // mira el operario, y así coincide con el selector de la app.
        List<String> order = List.of(TEMPERATURA, VIBRACION, INCLINACION);
        List<SensorReadingResponse> readings = latest.stream()
                .sorted(Comparator.comparingInt(r -> {
                    int i = order.indexOf(r.getMetric());
                    return i < 0 ? Integer.MAX_VALUE : i;
                }))
                .map(r -> SensorReadingResponse.builder()
                        .metric(r.getMetric())
                        .label(specs.containsKey(r.getMetric()) ? specs.get(r.getMetric()).label() : r.getMetric())
                        .value(round(r.getValue()))
                        .unit(r.getUnit())
                        .status(r.getStatus())
                        .recordedAt(r.getRecordedAt().format(ISO))
                        .build())
                .toList();

        // Con el dispositivo caído, el último valor conocido ya no describe la
        // máquina: se informa SIN_DATOS en vez de un estado que parecería vigente.
        String overall = !online || readings.isEmpty()
                ? SIN_DATOS
                : readings.stream().map(SensorReadingResponse::getStatus)
                    .reduce(NORMAL, IotService::worst);

        return IotDeviceResponse.builder()
                .id(device.getId())
                .name(device.getName())
                .description(device.getDescription())
                .machineId(device.getMachine() != null ? device.getMachine().getId() : null)
                .machineName(device.getMachine() != null ? device.getMachine().getName() : null)
                .online(online)
                .active(device.isActive())
                .lastSeenAt(device.getLastSeenAt() != null ? device.getLastSeenAt().format(ISO) : null)
                .firmwareVersion(device.getFirmwareVersion())
                .intervalSeconds(device.getIntervalSeconds())
                .overallStatus(overall)
                .readings(readings)
                .build();
    }

    private static String worst(String a, String b) {
        if (CRITICO.equals(a) || CRITICO.equals(b)) return CRITICO;
        if (ALERTA.equals(a) || ALERTA.equals(b)) return ALERTA;
        return NORMAL;
    }

    @Transactional(readOnly = true)
    public SensorSeriesResponse series(Long deviceId, String metricRaw, int limit) {
        String metric = metricRaw == null ? "" : metricRaw.trim().toUpperCase();
        MetricSpec spec = specs().get(metric);
        if (spec == null) {
            throw new IllegalArgumentException(
                    "Magnitud inválida. Valores permitidos: TEMPERATURA, VIBRACION, INCLINACION.");
        }

        IotDevice device = deviceRepository.findById(deviceId)
                .orElseThrow(() -> new RuntimeException("Dispositivo no encontrado: " + deviceId));

        int capped = Math.min(Math.max(limit, 1), 500);
        List<SensorReading> rows = readingRepository
                .findByDeviceIdOrderByRecordedAtDesc(device.getId(), PageRequest.of(0, capped * 3))
                .stream()
                .filter(r -> metric.equals(r.getMetric()))
                .limit(capped)
                .toList();

        // Llegan del más nuevo al más viejo; el gráfico los quiere al revés.
        List<SensorReading> chronological = new ArrayList<>(rows);
        Collections.reverse(chronological);

        DoubleSummaryStatistics stats = chronological.stream()
                .mapToDouble(SensorReading::getValue).summaryStatistics();

        return SensorSeriesResponse.builder()
                .metric(metric)
                .label(spec.label())
                .unit(spec.unit())
                .warningThreshold(spec.warning())
                .criticalThreshold(spec.critical())
                .min(chronological.isEmpty() ? null : round(stats.getMin()))
                .max(chronological.isEmpty() ? null : round(stats.getMax()))
                .average(chronological.isEmpty() ? null : round(stats.getAverage()))
                .points(chronological.stream()
                        .map(r -> SensorSeriesResponse.Point.builder()
                                .at(r.getRecordedAt().format(ISO))
                                .value(round(r.getValue()))
                                .status(r.getStatus())
                                .build())
                        .toList())
                .build();
    }

    private static double round(double v) {
        return Math.round(v * 100.0) / 100.0;
    }

    // ------------------------------------------------------------------
    // Mantenimiento de la tabla
    // ------------------------------------------------------------------

    /**
     * Borra lecturas viejas. Un sensor reportando cada 10 segundos genera unas
     * 26 mil filas por día y por magnitud: sin limpieza, la tabla crece sin
     * techo y las consultas de la pantalla en vivo se degradan.
     */
    @Transactional
    public int purgeOldReadings() {
        LocalDateTime cutoff = LocalDateTime.now().minusDays(Math.max(retentionDays, 1));
        int deleted = readingRepository.deleteOlderThan(cutoff);
        if (deleted > 0) {
            log.info("Limpieza IoT: {} lecturas anteriores a {} eliminadas", deleted, cutoff);
        }
        return deleted;
    }
}
