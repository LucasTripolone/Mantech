package com.mantech.app.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class WorkOrderResponse {
    private Long id;

    private Long machineId;
    private String machineName;
    private String machineSector;
    private String machineCriticality;
    private String plantName;

    private Long reportId;

    private String type;
    private String status;
    private String priority;
    private String description;

    private String failureType;
    private String impact;
    private boolean stoppedProduction;

    private String createdBy;
    private Long assignedTechnicianId;
    private String assignedTechnician;

    private LocalDateTime scheduledAt;
    private LocalDateTime startedAt;
    private LocalDateTime finishedAt;

    private String resolutionNotes;
    private String signature;

    private LocalDateTime createdAt;

    // Duración de la reparación en minutos (finishedAt - startedAt), si aplica.
    private Long durationMinutes;
}
