package com.mantech.app.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class PreventivePlanResponse {
    private Long id;
    private Long machineId;
    private String machineName;

    private String title;
    private String description;

    private String frequencyType;
    private int frequencyValue;
    private String frequencyLabel;   // legible: "Cada 1 mes(es)"

    private Integer estimatedDurationMinutes;

    private LocalDateTime nextDueAt;
    private LocalDateTime lastGeneratedAt;
    private boolean active;

    private Long assignedTechnicianId;
    private String assignedTechnician;
}
