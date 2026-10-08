import React, { useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import {
  AppHeader,
  Card,
  ChipSelect,
  EmptyState,
  ErrorState,
  Grid,
  LoadingState,
  Screen,
  SectionTitle,
  Txt,
} from '../src/ui';
import { SensorChart } from '../src/ui/SensorChart';
import { color, radius, sensorStatusTone, space, toneFor } from '../src/theme/tokens';
import { useResponsive } from '../src/theme/useResponsive';
import {
  formatUnit,
  getSensorSeries,
  listIotDevices,
  type IotDevice,
  type SensorMetric,
  type SensorReading,
  type SensorSeries,
} from '../src/api/iot.service';
import { ApiError } from '../src/api/client';

const METRIC_OPTIONS: { value: SensorMetric; label: string }[] = [
  { value: 'TEMPERATURA', label: 'Temperatura' },
  { value: 'VIBRACION', label: 'Vibración' },
  { value: 'INCLINACION', label: 'Inclinación' },
];

const METRIC_ICON: Record<string, keyof typeof Ionicons.glyphMap> = {
  TEMPERATURA: 'thermometer-outline',
  VIBRACION: 'pulse-outline',
  INCLINACION: 'analytics-outline',
};

const STATUS_LABEL: Record<string, string> = {
  NORMAL: 'Normal',
  ALERTA: 'Alerta',
  CRITICO: 'Crítico',
  SIN_DATOS: 'Sin datos',
};

/** Hora corta: en una pantalla que se refresca sola, la fecha estorba. */
function clock(iso?: string | null): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

function MetricTile({ reading }: { reading: SensorReading }) {
  const tone = toneFor(sensorStatusTone, reading.status);
  return (
    <Card style={styles.metricCard}>
      <View style={styles.metricHead}>
        <View style={styles.metricTitle}>
          <Ionicons
            name={METRIC_ICON[reading.metric] ?? 'speedometer-outline'}
            size={16}
            color={color.textMuted}
          />
          <Txt variant="overline" tone="muted">
            {reading.label.toUpperCase()}
          </Txt>
        </View>
        <View style={[styles.statusDot, { backgroundColor: tone.ink }]} />
      </View>

      <View style={styles.metricValueRow}>
        <Txt variant="metric" tabular style={{ color: tone.ink }}>
          {reading.value}
        </Txt>
        <Txt variant="bodyStrong" tone="muted" style={styles.metricUnit}>
          {formatUnit(reading.unit)}
        </Txt>
      </View>

      <Txt variant="caption" tone="muted">
        {STATUS_LABEL[reading.status] ?? reading.status} · {clock(reading.recordedAt)}
      </Txt>
    </Card>
  );
}

function DeviceHeader({ device }: { device: IotDevice }) {
  const tone = toneFor(sensorStatusTone, device.overallStatus);
  return (
    <Card tone="accent" accentColor={device.online ? tone.ink : color.textMuted} style={styles.deviceCard}>
      <View style={styles.deviceTop}>
        <View style={styles.deviceInfo}>
          <Txt variant="h3">{device.name}</Txt>
          {device.machineName ? (
            <Txt variant="caption" tone="secondary">
              {device.machineName}
            </Txt>
          ) : null}
        </View>

        <View style={[styles.pill, { backgroundColor: device.online ? tone.bg : color.surfaceMuted }]}>
          <View
            style={[
              styles.statusDot,
              { backgroundColor: device.online ? tone.ink : color.textMuted },
            ]}
          />
          <Txt
            variant="captionStrong"
            style={{ color: device.online ? tone.ink : color.textSecondary }}
          >
            {device.online ? 'En línea' : 'Sin conexión'}
          </Txt>
        </View>
      </View>

      <View style={styles.deviceMeta}>
        <Txt variant="caption" tone="muted">
          Último dato {clock(device.lastSeenAt)}
        </Txt>
        <Txt variant="caption" tone="muted">
          Reporta cada {device.intervalSeconds} s
        </Txt>
        {device.firmwareVersion ? (
          <Txt variant="caption" tone="muted">
            Firmware {device.firmwareVersion}
          </Txt>
        ) : null}
      </View>

      {!device.online ? (
        <Txt variant="caption" tone="secondary">
          La placa no está reportando. Revisá que tenga alimentación y señal de WiFi; los
          valores de abajo son los últimos que llegaron.
        </Txt>
      ) : null}
    </Card>
  );
}

export default function SensorScreen() {
  const { isWide } = useResponsive();

  const [devices, setDevices] = useState<IotDevice[]>([]);
  const [series, setSeries] = useState<SensorSeries | null>(null);
  const [metric, setMetric] = useState<SensorMetric>('TEMPERATURA');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  // El polling se detiene al salir de la pantalla: una vista en vivo que sigue
  // consultando en segundo plano gasta batería y datos sin que nadie la mire.
  const activeRef = useRef(true);
  const metricRef = useRef<SensorMetric>(metric);
  metricRef.current = metric;

  const load = useCallback(async (showSpinner: boolean) => {
    if (showSpinner) setLoading(true);
    try {
      const list = await listIotDevices();
      if (!activeRef.current) return;
      setDevices(list);
      setError(null);
      setLoaded(true);

      const first = list[0];
      if (first) {
        const s = await getSensorSeries(first.id, metricRef.current, 60);
        if (!activeRef.current) return;
        setSeries(s);
      } else {
        setSeries(null);
      }
    } catch (e) {
      if (!activeRef.current) return;
      const message =
        e instanceof ApiError ? e.message : 'No se pudo conectar con el servidor.';
      setError(message);
    } finally {
      if (activeRef.current) setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      activeRef.current = true;
      load(true);

      // El refresco acompaña el ritmo del dispositivo: pedir más seguido que lo
      // que la placa reporta sólo agrega tráfico sin datos nuevos.
      const intervalMs = 5000;
      const timer = setInterval(() => load(false), intervalMs);

      return () => {
        activeRef.current = false;
        clearInterval(timer);
      };
    }, [load]),
  );

  // Al cambiar de magnitud se pide la serie nueva sin esperar al próximo ciclo.
  useEffect(() => {
    const device = devices[0];
    if (!device) return;
    let cancelled = false;
    getSensorSeries(device.id, metric, 60)
      .then((s) => {
        if (!cancelled) setSeries(s);
      })
      .catch(() => {
        /* el ciclo de refresco vuelve a intentarlo */
      });
    return () => {
      cancelled = true;
    };
  }, [metric, devices]);

  const device = devices[0];

  function body() {
    if (loading && !loaded) return <LoadingState label="Buscando sensores…" />;

    if (error && !loaded) {
      return <ErrorState message={error} onRetry={() => load(true)} />;
    }

    if (devices.length === 0) {
      return (
        <EmptyState
          icon="hardware-chip-outline"
          title="Todavía no hay ningún sensor registrado"
          description="Cuando la placa de campo envíe su primera medición, va a aparecer acá automáticamente."
        />
      );
    }

    return (
      <>
        {error ? (
          <Card tone="accent" accentColor={color.warning}>
            <Txt variant="caption" tone="secondary">
              No se pudo actualizar: {error}. Se muestran los últimos datos recibidos.
            </Txt>
          </Card>
        ) : null}

        {devices.map((d) => (
          <DeviceHeader key={d.id} device={d} />
        ))}

        {device.readings.length === 0 ? (
          <EmptyState
            icon="time-outline"
            title="Esperando la primera medición"
            description="El sensor está registrado pero todavía no envió datos. En cuanto lo haga, aparecen acá."
          />
        ) : (
          <>
            <SectionTitle title="Lecturas actuales" />
            <Grid minItemWidth={isWide ? 200 : 150}>
              {device.readings.map((r) => (
                <MetricTile key={r.metric} reading={r} />
              ))}
            </Grid>

            <SectionTitle title="Evolución" />
            <ChipSelect
              options={METRIC_OPTIONS}
              value={metric}
              onChange={setMetric}
              accessibilityLabel="Elegir magnitud a graficar"
            />

            <Card>
              {series ? (
                <>
                  <View style={styles.seriesHead}>
                    <Txt variant="bodyStrong">{series.label}</Txt>
                    {series.average != null ? (
                      <Txt variant="caption" tone="muted" tabular>
                        promedio {series.average} {formatUnit(series.unit)}
                      </Txt>
                    ) : null}
                  </View>
                  <SensorChart
                    points={series.points}
                    unit={formatUnit(series.unit)}
                    warningThreshold={series.warningThreshold}
                    criticalThreshold={series.criticalThreshold}
                    height={isWide ? 180 : 140}
                  />
                  <Txt variant="caption" tone="muted">
                    Últimas {series.points.length} mediciones · se actualiza solo
                  </Txt>
                </>
              ) : (
                <LoadingState label="Cargando serie…" />
              )}
            </Card>
          </>
        )}
      </>
    );
  }

  return (
    <Screen
      header={
        <AppHeader
          title="Sensores en vivo"
          subtitle={device ? `Actualizado ${clock(device.lastSeenAt)}` : 'Monitoreo de planta'}
        />
      }
      onRefresh={() => load(false)}
    >
      {body()}
    </Screen>
  );
}

const styles = StyleSheet.create({
  deviceCard: { gap: space.sm },
  deviceTop: { flexDirection: 'row', alignItems: 'flex-start', gap: space.md },
  deviceInfo: { flex: 1, gap: 2 },
  deviceMeta: { flexDirection: 'row', flexWrap: 'wrap', gap: space.md },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.xs,
    paddingVertical: space.xs,
    paddingHorizontal: space.md,
    borderRadius: radius.pill,
  },
  statusDot: { width: 9, height: 9, borderRadius: radius.pill },
  metricCard: { gap: space.xs },
  metricHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  metricTitle: { flexDirection: 'row', alignItems: 'center', gap: space.xs, flex: 1 },
  metricValueRow: { flexDirection: 'row', alignItems: 'baseline', gap: space.xs },
  metricUnit: { marginBottom: 2 },
  seriesHead: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: space.sm,
    marginBottom: space.sm,
  },
});
