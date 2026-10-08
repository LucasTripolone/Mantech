package com.mantech.app.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * KPIs calculados para una máquina/activo.
 * Los valores en horas pueden ser null cuando no hay datos suficientes
 * (p.ej. MTBF requiere al menos 2 fallas).
 */
@Data
@Builder
public class MachineKpiResponse {
    private Long machineId;
    private String machineName;
    private String criticality;

    private long correctiveCount;        // órdenes correctivas (fallas)
    private long preventiveCount;        // órdenes preventivas
    private long openCount;              // órdenes abiertas/en proceso

    private Double mttrHours;            // Mean Time To Repair
    private Double mtbfHours;            // Mean Time Between Failures
    private Double availabilityPercent;  // MTBF / (MTBF + MTTR)
    private Double preventiveCompliancePercent;
    private Double criticalityIndex;     // fallas × MTTR × peso(criticidad)

    private LocalDateTime lastFailureAt;
}
