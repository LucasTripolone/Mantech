package com.mantech.app.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * Estado público de una máquina (sin autenticación), para escaneo de QR.
 */
@Data
@Builder
public class PublicMachineStatusResponse {
    private Long machineId;
    private String name;
    private String sector;
    private String criticality;
    private String qrCode;
    private String plantName;

    private String currentStatus;          // OPERATIVA, PREVENTIVO, FALLA

    private Double availabilityPercent;
    private Double mttrHours;
    private long openWorkOrders;
    private LocalDateTime lastFailureAt;
}
