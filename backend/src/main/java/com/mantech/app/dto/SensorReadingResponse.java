package com.mantech.app.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class SensorReadingResponse {
    private String metric;
    private String label;
    private double value;
    private String unit;
    private String status;
    private String recordedAt;
}
