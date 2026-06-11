package com.mantech.app.config;

import com.mantech.app.domain.Machine;
import com.mantech.app.domain.Plant;
import com.mantech.app.domain.Role;
import com.mantech.app.domain.User;
import com.mantech.app.domain.MachineStatusHistory;
import com.mantech.app.domain.Report;
import com.mantech.app.domain.ReportFile;
import com.mantech.app.repository.MachineRepository;
import com.mantech.app.repository.PlantRepository;
import com.mantech.app.repository.RoleRepository;
import com.mantech.app.repository.UserRepository;
import com.mantech.app.repository.MachineStatusHistoryRepository;
import com.mantech.app.repository.ReportRepository;
import com.mantech.app.repository.ReportFileRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

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

    private final Logger log = LoggerFactory.getLogger(DataSeeder.class);

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
                    .password(passwordEncoder.encode("mantech123"))
                    .shift("MANANA")
                    .active(true)
                    .build();
            userRepository.save(admin);
            log.info("Seeded admin user: {} (password: mantech123)", adminEmail);
        } else {
            log.info("Admin user already exists: {}", adminEmail);
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

        log.info("Data seeder finished.");
    }
}
