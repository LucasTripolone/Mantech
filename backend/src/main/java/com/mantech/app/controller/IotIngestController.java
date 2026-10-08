package com.mantech.app.controller;

import com.mantech.app.dto.IngestReadingRequest;
import com.mantech.app.dto.IngestResponse;
import com.mantech.app.service.IotService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.annotation.*;

/**
 * Entrada de datos desde el campo.
 *
 * Va fuera de la cadena JWT a propósito: el que llama es un ESP32, que se
 * identifica con su propia clave en el header `X-Device-Key`. La ruta está en
 * la lista de acceso público de SecurityConfig, pero sin clave válida no
 * escribe nada.
 */
@RestController
@RequestMapping("/api/iot/ingest")
@RequiredArgsConstructor
public class IotIngestController {

    private final IotService iotService;

    // POST /api/iot/ingest/readings
    @PostMapping("/readings")
    public ResponseEntity<IngestResponse> ingest(
            @RequestHeader(value = "X-Device-Key", required = false) String deviceKey,
            @Valid @RequestBody IngestReadingRequest request) {

        if (deviceKey == null || deviceKey.isBlank()) {
            throw new AccessDeniedException("Falta la clave del dispositivo.");
        }
        return ResponseEntity.ok(iotService.ingest(deviceKey.trim(), request));
    }

    /**
     * Prueba de vida para el firmware: permite confirmar que la placa llega al
     * servidor y que su clave es válida, antes de empezar a mandar lecturas.
     */
    @GetMapping("/ping")
    public ResponseEntity<IngestResponse> ping(
            @RequestHeader(value = "X-Device-Key", required = false) String deviceKey) {

        if (deviceKey == null || deviceKey.isBlank()) {
            throw new AccessDeniedException("Falta la clave del dispositivo.");
        }
        IngestReadingRequest empty = new IngestReadingRequest();
        empty.setReadings(java.util.List.of());
        return ResponseEntity.ok(iotService.ingest(deviceKey.trim(), empty));
    }
}
