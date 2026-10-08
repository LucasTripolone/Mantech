package com.mantech.app.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class WorkOrderRequest {

    @NotNull(message = "El ID de máquina es obligatorio")
    private Long machineId;

    @NotBlank(message = "El tipo es obligatorio")
    // CORRECTIVA, PREVENTIVA
    private String type;

    // ALTA, MEDIA, BAJA
    private String priority;

    private String description;

    // Bloque 3 - info operativa
    private String failureType;

    // ALTO, MEDIO, BAJO
    private String impact;

    private boolean stoppedProduction;

    private LocalDateTime scheduledAt;

    // Opcionales: asignar técnico al crear y/o vincular un reporte de origen.
    private Long assignedTechnicianId;

    private Long reportId;
}
