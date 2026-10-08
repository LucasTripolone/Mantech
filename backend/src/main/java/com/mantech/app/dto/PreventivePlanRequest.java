package com.mantech.app.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class PreventivePlanRequest {

    @NotNull(message = "El ID de máquina es obligatorio")
    private Long machineId;

    @NotBlank(message = "El título es obligatorio")
    private String title;

    private String description;

    @NotBlank(message = "La frecuencia es obligatoria")
    // DIAS, SEMANAS, MESES
    private String frequencyType;

    @Positive(message = "La frecuencia debe ser mayor a 0")
    private int frequencyValue;

    private Integer estimatedDurationMinutes;

    // Primera fecha programada; si no se envía, se usa ahora.
    private LocalDateTime nextDueAt;

    private Long assignedTechnicianId;
}
