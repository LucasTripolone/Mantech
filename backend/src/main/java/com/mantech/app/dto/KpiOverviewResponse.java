package com.mantech.app.dto;

import lombok.Builder;
import lombok.Data;

import java.util.List;

/**
 * KPIs agregados a nivel planta para el dashboard.
 */
@Data
@Builder
public class KpiOverviewResponse {
    private long totalMachines;

    private long totalWorkOrders;
    private long openWorkOrders;
    private long closedWorkOrders;
    private long correctiveCount;
    private long preventiveCount;

    private Double avgMttrHours;
    private Double avgMtbfHours;
    private Double avgAvailabilityPercent;
    private Double preventiveCompliancePercent;

    private long overduePreventiveCount;   // preventivas vencidas sin cerrar

    // Ranking de activos más críticos (por índice de criticidad, desc)
    private List<MachineKpiResponse> criticalMachines;
}
