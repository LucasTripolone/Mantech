package com.mantech.app.dto;

import lombok.Builder;
import lombok.Data;

import java.util.List;

/** Estado en vivo de un dispositivo y su última medición de cada magnitud. */
@Data
@Builder
public class IotDeviceResponse {
    private Long id;
    private String name;
    private String description;
    private Long machineId;
    private String machineName;
    private boolean online;
    private boolean active;
    private String lastSeenAt;
    private String firmwareVersion;
    private int intervalSeconds;
    /** NORMAL, ALERTA, CRITICO o SIN_DATOS: el peor estado entre sus lecturas. */
    private String overallStatus;
    private List<SensorReadingResponse> readings;
}
