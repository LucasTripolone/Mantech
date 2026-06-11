package com.mantech.app.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class MachineResponse {
    private Long id;
    private String name;
    private String qrCode;
    private String sector;
    private String criticality;
    private String currentStatus;   // último estado del historial
    private String plantName;
}
