package com.mantech.app.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AssignTechnicianRequest {

    @NotNull(message = "El ID del técnico es obligatorio")
    private Long technicianId;
}
