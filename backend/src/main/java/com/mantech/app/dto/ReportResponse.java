package com.mantech.app.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class ReportResponse {
    private Long id;
    private Long machineId;
    private String machineName;
    private String reportedBy;
    private String type;
    private String description;
    private String priority;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime resolvedAt;
    private List<String> fileUrls;
}
