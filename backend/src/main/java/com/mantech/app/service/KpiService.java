package com.mantech.app.service;

import com.mantech.app.domain.Machine;
import com.mantech.app.domain.WorkOrder;
import com.mantech.app.dto.KpiOverviewResponse;
import com.mantech.app.dto.MachineKpiResponse;
import com.mantech.app.repository.MachineRepository;
import com.mantech.app.repository.WorkOrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;

/**
 * Motor de KPIs (F2). Calcula las métricas en tiempo de lectura a partir de las
 * órdenes de trabajo. Definiciones según la spec del MVP:
 *  - MTTR = promedio (finishedAt - startedAt) de correctivas cerradas
 *  - MTBF = promedio de diferencias entre fallas (correctivas) consecutivas
 *  - Disponibilidad = MTBF / (MTBF + MTTR)
 *  - Cumplimiento Preventivo = preventivas hechas en fecha / programadas
 *  - Índice de Criticidad = fallas × MTTR × peso(criticidad)
 */
@Service
@RequiredArgsConstructor
public class KpiService {

    private static final String CORRECTIVA = "CORRECTIVA";
    private static final String PREVENTIVA = "PREVENTIVA";
    private static final String CERRADA = "CERRADA";
    private static final String CANCELADA = "CANCELADA";

    private final MachineRepository machineRepository;
    private final WorkOrderRepository workOrderRepository;

    public MachineKpiResponse forMachine(Long machineId) {
        Machine machine = machineRepository.findById(machineId)
                .orElseThrow(() -> new RuntimeException("Máquina no encontrada: " + machineId));
        List<WorkOrder> orders = workOrderRepository.findByMachineIdOrderByCreatedAtDesc(machineId);
        return computeForMachine(machine, orders);
    }

    public KpiOverviewResponse overview() {
        List<Machine> machines = machineRepository.findAll();
        List<WorkOrder> allOrders = workOrderRepository.findAllByOrderByCreatedAtDesc();

        List<MachineKpiResponse> perMachine = machines.stream()
                .map(m -> computeForMachine(m, ordersOf(allOrders, m.getId())))
                .toList();

        long totalWo = allOrders.size();
        long openWo = allOrders.stream().filter(this::isOpen).count();
        long closedWo = allOrders.stream().filter(o -> CERRADA.equals(o.getStatus())).count();
        long corrective = allOrders.stream().filter(o -> CORRECTIVA.equals(o.getType())).count();
        long preventive = allOrders.stream().filter(o -> PREVENTIVA.equals(o.getType())).count();

        Double avgMttr = average(perMachine.stream().map(MachineKpiResponse::getMttrHours));
        Double avgMtbf = average(perMachine.stream().map(MachineKpiResponse::getMtbfHours));
        Double avgAvail = average(perMachine.stream().map(MachineKpiResponse::getAvailabilityPercent));

        // Cumplimiento preventivo global (sólo preventivas ya vencidas)
        LocalDateTime now = LocalDateTime.now();
        List<WorkOrder> duePreventives = allOrders.stream().filter(this::isDuePreventive).toList();
        long compliant = duePreventives.stream().filter(this::isPreventiveCompliant).count();
        Double preventiveCompliance = duePreventives.isEmpty()
                ? null
                : round(100.0 * compliant / duePreventives.size());

        long overduePreventive = allOrders.stream()
                .filter(o -> PREVENTIVA.equals(o.getType())
                        && o.getScheduledAt() != null
                        && o.getScheduledAt().isBefore(now)
                        && !CERRADA.equals(o.getStatus())
                        && !CANCELADA.equals(o.getStatus()))
                .count();

        List<MachineKpiResponse> ranking = perMachine.stream()
                .sorted(Comparator.comparingDouble(
                        (MachineKpiResponse k) -> k.getCriticalityIndex() == null ? 0.0 : k.getCriticalityIndex())
                        .reversed())
                .limit(5)
                .toList();

        return KpiOverviewResponse.builder()
                .totalMachines(machines.size())
                .totalWorkOrders(totalWo)
                .openWorkOrders(openWo)
                .closedWorkOrders(closedWo)
                .correctiveCount(corrective)
                .preventiveCount(preventive)
                .avgMttrHours(avgMttr)
                .avgMtbfHours(avgMtbf)
                .avgAvailabilityPercent(avgAvail)
                .preventiveCompliancePercent(preventiveCompliance)
                .overduePreventiveCount(overduePreventive)
                .criticalMachines(ranking)
                .build();
    }

    // ---------- cálculo por máquina ----------

    private MachineKpiResponse computeForMachine(Machine machine, List<WorkOrder> orders) {
        List<WorkOrder> correctives = orders.stream()
                .filter(o -> CORRECTIVA.equals(o.getType()))
                .toList();
        long correctiveCount = correctives.size();
        long preventiveCount = orders.stream().filter(o -> PREVENTIVA.equals(o.getType())).count();
        long openCount = orders.stream().filter(this::isOpen).count();

        Double mttr = mttrHours(correctives);
        Double mtbf = mtbfHours(correctives);

        Double availability = null;
        if (mtbf != null && mttr != null && (mtbf + mttr) > 0) {
            availability = round(100.0 * mtbf / (mtbf + mttr));
        }

        // Cumplimiento preventivo de la máquina (sólo preventivas ya vencidas)
        List<WorkOrder> duePrev = orders.stream().filter(this::isDuePreventive).toList();
        Double prevCompliance = duePrev.isEmpty()
                ? null
                : round(100.0 * duePrev.stream().filter(this::isPreventiveCompliant).count() / duePrev.size());

        // Índice de criticidad = fallas × MTTR × peso(criticidad).
        // Si no hay MTTR aún (fallas abiertas), usamos 1.0 como neutral para no anular el peso de las fallas.
        double mttrFactor = mttr != null ? mttr : 1.0;
        double index = round(correctiveCount * mttrFactor * impactWeight(machine.getCriticality()));

        LocalDateTime lastFailure = correctives.stream()
                .map(this::failureTime)
                .filter(d -> d != null)
                .max(Comparator.naturalOrder())
                .orElse(null);

        return MachineKpiResponse.builder()
                .machineId(machine.getId())
                .machineName(machine.getName())
                .criticality(machine.getCriticality())
                .correctiveCount(correctiveCount)
                .preventiveCount(preventiveCount)
                .openCount(openCount)
                .mttrHours(mttr)
                .mtbfHours(mtbf)
                .availabilityPercent(availability)
                .preventiveCompliancePercent(prevCompliance)
                .criticalityIndex(index)
                .lastFailureAt(lastFailure)
                .build();
    }

    /** MTTR: promedio de (finishedAt - startedAt) en correctivas con ambos timestamps. */
    private Double mttrHours(List<WorkOrder> correctives) {
        List<Double> durations = correctives.stream()
                .filter(o -> o.getStartedAt() != null && o.getFinishedAt() != null
                        && !o.getFinishedAt().isBefore(o.getStartedAt()))
                .map(o -> Duration.between(o.getStartedAt(), o.getFinishedAt()).toMinutes() / 60.0)
                .toList();
        if (durations.isEmpty()) return null;
        return round(durations.stream().mapToDouble(Double::doubleValue).average().orElse(0));
    }

    /** MTBF: promedio de diferencias entre fechas de fallas consecutivas (>= 2 fallas). */
    private Double mtbfHours(List<WorkOrder> correctives) {
        List<LocalDateTime> failures = correctives.stream()
                .map(this::failureTime)
                .filter(d -> d != null)
                .sorted()
                .toList();
        if (failures.size() < 2) return null;
        double totalHours = 0;
        for (int i = 1; i < failures.size(); i++) {
            totalHours += Duration.between(failures.get(i - 1), failures.get(i)).toMinutes() / 60.0;
        }
        return round(totalHours / (failures.size() - 1));
    }

    // ---------- helpers ----------

    private List<WorkOrder> ordersOf(List<WorkOrder> all, Long machineId) {
        return all.stream()
                .filter(o -> o.getMachine() != null && machineId.equals(o.getMachine().getId()))
                .toList();
    }

    private boolean isOpen(WorkOrder o) {
        return !CERRADA.equals(o.getStatus()) && !CANCELADA.equals(o.getStatus());
    }

    /** Momento de la falla: preferimos startedAt (cuando se atendió); si no, createdAt. */
    private LocalDateTime failureTime(WorkOrder o) {
        return o.getStartedAt() != null ? o.getStartedAt() : o.getCreatedAt();
    }

    /** Preventiva ya vencida (programada en el pasado): cuenta para cumplimiento. */
    private boolean isDuePreventive(WorkOrder o) {
        return PREVENTIVA.equals(o.getType())
                && o.getScheduledAt() != null
                && o.getScheduledAt().isBefore(LocalDateTime.now());
    }

    /** Realizada en fecha: cerrada y terminada en el día programado o antes. */
    private boolean isPreventiveCompliant(WorkOrder o) {
        return CERRADA.equals(o.getStatus())
                && o.getFinishedAt() != null
                && o.getScheduledAt() != null
                && !o.getFinishedAt().toLocalDate().isAfter(o.getScheduledAt().toLocalDate());
    }

    private double impactWeight(String criticality) {
        if (criticality == null) return 1.0;
        return switch (criticality.toUpperCase()) {
            case "ALTA" -> 3.0;
            case "MEDIA" -> 2.0;
            default -> 1.0;
        };
    }

    private Double average(java.util.stream.Stream<Double> values) {
        List<Double> list = values.filter(v -> v != null).toList();
        if (list.isEmpty()) return null;
        return round(list.stream().mapToDouble(Double::doubleValue).average().orElse(0));
    }

    private double round(double v) {
        return Math.round(v * 100.0) / 100.0;
    }
}
