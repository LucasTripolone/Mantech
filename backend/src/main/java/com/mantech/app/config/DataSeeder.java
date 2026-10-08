package com.mantech.app.config;

import com.mantech.app.domain.Machine;
import com.mantech.app.domain.Plant;
import com.mantech.app.domain.Role;
import com.mantech.app.domain.User;
import com.mantech.app.domain.MachineStatusHistory;
import com.mantech.app.domain.Report;
import com.mantech.app.domain.ReportFile;
import com.mantech.app.domain.WorkOrder;
import com.mantech.app.domain.PreventivePlan;
import com.mantech.app.domain.IotDevice;
import com.mantech.app.repository.MachineRepository;
import com.mantech.app.repository.PreventivePlanRepository;
import com.mantech.app.repository.IotDeviceRepository;
import com.mantech.app.repository.PlantRepository;
import com.mantech.app.repository.RoleRepository;
import com.mantech.app.repository.UserRepository;
import com.mantech.app.repository.MachineStatusHistoryRepository;
import com.mantech.app.repository.ReportRepository;
import com.mantech.app.repository.ReportFileRepository;
import com.mantech.app.repository.WorkOrderRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
public class DataSeeder {

    private final RoleRepository roleRepository;
    private final PlantRepository plantRepository;
    private final UserRepository userRepository;
    private final MachineRepository machineRepository;
    private final MachineStatusHistoryRepository machineStatusHistoryRepository;
    private final PasswordEncoder passwordEncoder;
    private final ReportRepository reportRepository;
    private final ReportFileRepository reportFileRepository;
    private final WorkOrderRepository workOrderRepository;
    private final PreventivePlanRepository preventivePlanRepository;
    private final IotDeviceRepository iotDeviceRepository;

    @org.springframework.beans.factory.annotation.Value("${app.seed.admin-password:}")
    private String adminSeedPassword;

    @org.springframework.beans.factory.annotation.Value("${app.seed.tech-password:}")
    private String techSeedPassword;

    /** Clave del dispositivo IoT de prueba. Vacía = se genera una al azar. */
    @org.springframework.beans.factory.annotation.Value("${app.seed.iot-device-key:}")
    private String iotDeviceKey;

    private final Logger log = LoggerFactory.getLogger(DataSeeder.class);


    /**
     * Devuelve la contraseña configurada o, si no hay ninguna, genera una al
     * azar y la deja en el log de arranque.
     *
     * Antes había una contraseña por defecto escrita en el repositorio, y era
     * la que terminaba corriendo en producción. Una clave aleatoria obliga a
     * mirar el log para conocerla, pero nunca queda publicada.
     */
    private String resolveSeedPassword(String configured, String accountLabel) {
        if (configured != null && !configured.isBlank()) {
            return configured;
        }
        String generated = java.util.UUID.randomUUID().toString().substring(0, 16);
        log.warn("No hay contrasena configurada para {}. Se genero esta: {}", accountLabel, generated);
        log.warn("Defini la variable de entorno correspondiente para fijarla.");
        return generated;
    }

    @EventListener(ApplicationReadyEvent.class)
    @Transactional
    public void seed() {
        log.info("Running application data seeder...");

        // Roles
        List<String> roles = List.of("OPERARIO", "SUPERVISOR", "MANTENIMIENTO", "JEFE_PLANTA");
        for (String r : roles) {
            roleRepository.findByName(r).orElseGet(() -> roleRepository.save(Role.builder().name(r).build()));
        }

        // Plant
        Plant plant = plantRepository.findAll().stream().findFirst().orElseGet(() -> {
            Plant p = Plant.builder().name("Planta Principal").location("Buenos Aires, Argentina").build();
            return plantRepository.save(p);
        });

        // Admin user
        String adminEmail = "admin@mantech.com";
        if (!userRepository.existsByEmail(adminEmail)) {
            Role jefe = roleRepository.findByName("JEFE_PLANTA").orElseThrow();
            User admin = User.builder()
                    .plant(plant)
                    .role(jefe)
                    .firstName("Admin")
                    .lastName("Mantech")
                    .email(adminEmail)
                    .password(passwordEncoder.encode(resolveSeedPassword(adminSeedPassword, "admin@mantech.com")))
                    .shift("MANANA")
                    .active(true)
                    .build();
            userRepository.save(admin);
            log.info("Seeded admin user: {}", adminEmail);
        } else {
            log.info("Admin user already exists: {}", adminEmail);
        }

        // Técnico de mantenimiento
        String techEmail = "tecnico@mantech.com";
        if (!userRepository.existsByEmail(techEmail)) {
            Role mantenimiento = roleRepository.findByName("MANTENIMIENTO").orElseThrow();
            User tech = User.builder()
                    .plant(plant)
                    .role(mantenimiento)
                    .firstName("Carlos")
                    .lastName("Técnico")
                    .email(techEmail)
                    .password(passwordEncoder.encode(resolveSeedPassword(techSeedPassword, "tecnico@mantech.com")))
                    .shift("MANANA")
                    .active(true)
                    .build();
            userRepository.save(tech);
            log.info("Seeded technician user: {}", techEmail);
        }

        // Machines
        if (machineRepository.count() == 0) {
            Machine m1 = Machine.builder().plant(plant).name("Prensa #14").qrCode("QR-PRENSA-14").sector("Linea de Produccion 1").criticality("ALTA").build();
            Machine m2 = Machine.builder().plant(plant).name("Mezcladora B1").qrCode("QR-MEZC-B1").sector("Linea de Produccion 2").criticality("MEDIA").build();
            Machine m3 = Machine.builder().plant(plant).name("Grua Puente C3").qrCode("QR-GRUA-C3").sector("Almacen").criticality("ALTA").build();
            machineRepository.saveAll(List.of(m1, m2, m3));
            log.info("Seeded {} machines", 3);
        } else {
            log.info("Machines table already has data (count={})", machineRepository.count());
        }

        // Machine status history (for each machine, add some entries if none exist)
        User admin = userRepository.findByEmail("admin@mantech.com").orElseThrow();
        for (Machine machine : machineRepository.findAll()) {
            var recent = machineStatusHistoryRepository.findFirstByMachineIdOrderByCreatedAtDesc(machine.getId());
            if (recent.isEmpty()) {
                MachineStatusHistory s1 = MachineStatusHistory.builder().machine(machine).changedByUser(admin).status("OPERATIVA").reason("Inicial").build();
                MachineStatusHistory s2 = MachineStatusHistory.builder().machine(machine).changedByUser(admin).status("PREVENTIVO").reason("Mantenimiento programado").build();
                MachineStatusHistory s3 = MachineStatusHistory.builder().machine(machine).changedByUser(admin).status("FALLA").reason("Reporte de ruido anómalo").build();
                machineStatusHistoryRepository.saveAll(List.of(s1, s2, s3));
                log.info("Seeded status history for machine {}", machine.getName());
            } else {
                log.info("Status history exists for machine {}", machine.getName());
            }
        }

        // Reports and files
        if (reportRepository.count() == 0) {
            List<Machine> machines = machineRepository.findAll();
            if (!machines.isEmpty()) {
                Machine target = machines.get(0);
                Report r1 = Report.builder()
                        .machine(target)
                        .reportedByUser(admin)
                        .type("FALLA")
                        .description("Se detectó pérdida de potencia en la prensa, requiere revisión inmediata.")
                        .priority("ALTA")
                        .status("PENDIENTE")
                        .build();
                reportRepository.save(r1);
                ReportFile f1 = ReportFile.builder().report(r1).fileType("PHOTO").fileUrl("/files/reports/prensa14-1.jpg").build();
                ReportFile f2 = ReportFile.builder().report(r1).fileType("PHOTO").fileUrl("/files/reports/prensa14-2.jpg").build();
                reportFileRepository.saveAll(List.of(f1, f2));

                if (machines.size() > 1) {
                    Machine target2 = machines.get(1);
                    Report r2 = Report.builder()
                            .machine(target2)
                            .reportedByUser(admin)
                            .type("PREVENTIVO")
                            .description("Check de rodamientos y sistemas de lubricación.")
                            .priority("MEDIA")
                            .status("EN_PROCESO")
                            .build();
                    reportRepository.save(r2);
                    ReportFile f3 = ReportFile.builder().report(r2).fileType("PHOTO").fileUrl("/files/reports/mezcladora-1.jpg").build();
                    reportFileRepository.save(f3);
                }

                log.info("Seeded {} reports", reportRepository.count());
            }
        } else {
            log.info("Reports table already has data (count={})", reportRepository.count());
        }

        // Work orders (órdenes de trabajo demo, con histórico realista para los KPIs)
        if (workOrderRepository.count() == 0) {
            List<Machine> machines = machineRepository.findAll();
            User tech = userRepository.findByEmail("tecnico@mantech.com").orElse(admin);
            if (machines.size() >= 3) {
                LocalDateTime now = LocalDateTime.now();
                Machine prensa = machines.get(0);    // ALTA
                Machine mezcla = machines.get(1);     // MEDIA
                Machine grua = machines.get(2);       // ALTA

                // --- Prensa #14: 3 fallas correctivas cerradas, espaciadas en el tiempo ---
                // MTBF ~ 14.5 días, MTTR ~ 1.5 h -> disponibilidad ~ 99.6%
                workOrderRepository.save(WorkOrder.builder()
                        .machine(prensa).plant(prensa.getPlant()).createdByUser(admin).assignedTechnician(tech)
                        .type("CORRECTIVA").priority("ALTA").failureType("MECANICA").impact("ALTO").stoppedProduction(true)
                        .description("Falla en eje principal: vibración excesiva.")
                        .startedAt(now.minusDays(35)).finishedAt(now.minusDays(35).plusHours(2))
                        .status("CERRADA").resolutionNotes("Alineación y balanceo del eje.").signature("Carlos Técnico").build());
                workOrderRepository.save(WorkOrder.builder()
                        .machine(prensa).plant(prensa.getPlant()).createdByUser(admin).assignedTechnician(tech)
                        .type("CORRECTIVA").priority("MEDIA").failureType("ELECTRICA").impact("MEDIO").stoppedProduction(false)
                        .description("Sobrecalentamiento del motor por filtro obstruido.")
                        .startedAt(now.minusDays(20)).finishedAt(now.minusDays(20).plusHours(1))
                        .status("CERRADA").resolutionNotes("Limpieza de filtros y ventilación.").signature("Carlos Técnico").build());
                workOrderRepository.save(WorkOrder.builder()
                        .machine(prensa).plant(prensa.getPlant()).createdByUser(admin).assignedTechnician(tech)
                        .type("CORRECTIVA").priority("ALTA").failureType("MECANICA").impact("ALTO").stoppedProduction(true)
                        .description("Reemplazo de rodamiento en eje principal.")
                        .startedAt(now.minusDays(6)).finishedAt(now.minusDays(6).plusMinutes(90))
                        .status("CERRADA").resolutionNotes("Rodamiento reemplazado y lubricado.").signature("Carlos Técnico").build());

                // --- Mezcladora B1: preventiva cumplida a tiempo + una preventiva en curso ---
                workOrderRepository.save(WorkOrder.builder()
                        .machine(mezcla).plant(mezcla.getPlant()).createdByUser(admin).assignedTechnician(tech)
                        .type("PREVENTIVA").priority("MEDIA").failureType("PREVENTIVO").impact("BAJO").stoppedProduction(false)
                        .description("Preventivo mensual: lubricación y ajuste de tensores.")
                        .scheduledAt(now.minusDays(10)).startedAt(now.minusDays(10)).finishedAt(now.minusDays(10).plusHours(1))
                        .status("CERRADA").resolutionNotes("Realizado según plan.").signature("Carlos Técnico").build());
                workOrderRepository.save(WorkOrder.builder()
                        .machine(mezcla).plant(mezcla.getPlant()).createdByUser(admin).assignedTechnician(tech)
                        .type("PREVENTIVA").priority("MEDIA").failureType("PREVENTIVO").impact("BAJO").stoppedProduction(false)
                        .description("Preventivo trimestral programado.")
                        .scheduledAt(now.plusDays(3)).startedAt(now.minusMinutes(30))
                        .status("EN_PROCESO").build());

                // --- Grúa Puente C3: falla correctiva abierta + preventiva VENCIDA sin hacer ---
                workOrderRepository.save(WorkOrder.builder()
                        .machine(grua).plant(grua.getPlant()).createdByUser(admin)
                        .type("CORRECTIVA").priority("ALTA").failureType("ELECTROMECANICA").impact("MEDIO").stoppedProduction(false)
                        .description("Ruido anómalo en el sistema de izaje, requiere inspección.")
                        .status("ABIERTA").build());
                workOrderRepository.save(WorkOrder.builder()
                        .machine(grua).plant(grua.getPlant()).createdByUser(admin).assignedTechnician(tech)
                        .type("PREVENTIVA").priority("MEDIA").failureType("PREVENTIVO").impact("BAJO").stoppedProduction(false)
                        .description("Inspección preventiva de cables y frenos (VENCIDA).")
                        .scheduledAt(now.minusDays(2))
                        .status("ASIGNADA").build());

                log.info("Seeded {} work orders", workOrderRepository.count());
            }
        } else {
            log.info("Work orders table already has data (count={})", workOrderRepository.count());
        }

        // Preventive plans (planes de mantenimiento preventivo)
        if (preventivePlanRepository.count() == 0) {
            List<Machine> machines = machineRepository.findAll();
            User tech = userRepository.findByEmail("tecnico@mantech.com").orElse(admin);
            if (machines.size() >= 3) {
                LocalDateTime now = LocalDateTime.now();
                preventivePlanRepository.save(PreventivePlan.builder()
                        .machine(machines.get(0)).assignedTechnician(tech)
                        .title("Inspección semanal de seguridad")
                        .description("Chequeo de protecciones, frenos y nivel de aceite.")
                        .frequencyType("SEMANAS").frequencyValue(1).estimatedDurationMinutes(30)
                        .nextDueAt(now.plusDays(2)).active(true).build());
                preventivePlanRepository.save(PreventivePlan.builder()
                        .machine(machines.get(1)).assignedTechnician(tech)
                        .title("Lubricación y ajuste mensual")
                        .description("Lubricación de rodamientos y ajuste de tensores.")
                        .frequencyType("MESES").frequencyValue(1).estimatedDurationMinutes(60)
                        .nextDueAt(now.plusDays(6)).active(true).build());
                preventivePlanRepository.save(PreventivePlan.builder()
                        .machine(machines.get(2)).assignedTechnician(tech)
                        .title("Inspección trimestral de cables")
                        .description("Revisión de cables de izaje y sistema de frenos.")
                        .frequencyType("MESES").frequencyValue(3).estimatedDurationMinutes(90)
                        .nextDueAt(now.minusDays(1)).active(true).build());
                log.info("Seeded {} preventive plans", preventivePlanRepository.count());
            }
        } else {
            log.info("Preventive plans table already has data (count={})", preventivePlanRepository.count());
        }

        // Dispositivo IoT de campo (la placa ESP32 del piloto).
        if (iotDeviceRepository.count() == 0) {
            List<Machine> machines = machineRepository.findAll();
            if (!machines.isEmpty()) {
                String key = (iotDeviceKey != null && !iotDeviceKey.isBlank())
                        ? iotDeviceKey.trim()
                        : java.util.UUID.randomUUID().toString().replace("-", "");
                iotDeviceRepository.save(IotDevice.builder()
                        .machine(machines.get(0))
                        .name("Sensor de planta 01")
                        .description("ESP32 con DS18B20 (temperatura) y MPU6050 (vibración e inclinación).")
                        .deviceKey(key)
                        .intervalSeconds(10)
                        .active(true)
                        .build());
                // La clave se loguea sólo cuando se generó al azar: si vino por
                // configuración, quien la puso ya la conoce y no debe quedar
                // escrita en los logs del servidor.
                if (iotDeviceKey == null || iotDeviceKey.isBlank()) {
                    log.warn("Dispositivo IoT de prueba creado con clave generada: {}", key);
                    log.warn("Cargala en el firmware o definí app.seed.iot-device-key para fijarla.");
                } else {
                    log.info("Dispositivo IoT de prueba creado sobre la máquina '{}'.", machines.get(0).getName());
                }
            }
        } else {
            log.info("IoT devices table already has data (count={})", iotDeviceRepository.count());
        }

        log.info("Data seeder finished.");
    }
}
