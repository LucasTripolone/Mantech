package com.mantech.app.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ReportRequest {

    @NotNull(message = "El ID de máquina es obligatorio")
    private Long machineId;

    @NotBlank(message = "El tipo de reporte es obligatorio")
    // FALLA, PREVENTIVO, RUTINA
    private String type;

    private String description;

    // ALTA, MEDIA, BAJA
    private String priority;
}
