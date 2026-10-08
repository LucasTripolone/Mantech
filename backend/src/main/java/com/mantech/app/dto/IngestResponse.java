package com.mantech.app.dto;

import lombok.Builder;
import lombok.Data;

/**
 * Respuesta a la placa. Incluye `intervalSeconds` para poder cambiar el ritmo
 * de envío desde el servidor, sin reprogramar el dispositivo.
 */
@Data
@Builder
public class IngestResponse {
    private int accepted;
    private int rejected;
    private int intervalSeconds;
    private String serverTime;
    private String message;
}
