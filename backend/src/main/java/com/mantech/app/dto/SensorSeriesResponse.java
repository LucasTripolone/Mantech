package com.mantech.app.dto;

import lombok.Builder;
import lombok.Data;

import java.util.List;

/** Serie temporal de una magnitud, para el gráfico de la app. */
@Data
@Builder
public class SensorSeriesResponse {
    private String metric;
    private String label;
    private String unit;
    private Double warningThreshold;
    private Double criticalThreshold;
    private Double min;
    private Double max;
    private Double average;
    private List<Point> points;

    @Data
    @Builder
    public static class Point {
        private String at;
        private double value;
        private String status;
    }
}
