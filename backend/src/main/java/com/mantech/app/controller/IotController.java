package com.mantech.app.controller;

import com.mantech.app.dto.IotDeviceResponse;
import com.mantech.app.dto.SensorSeriesResponse;
import com.mantech.app.service.IotService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/** Lectura de datos IoT para la app (requiere sesión). */
@RestController
@RequestMapping("/api/iot")
@RequiredArgsConstructor
public class IotController {

    private final IotService iotService;

    // GET /api/iot/devices — estado en vivo de todos los dispositivos
    @GetMapping("/devices")
    public ResponseEntity<List<IotDeviceResponse>> devices() {
        return ResponseEntity.ok(iotService.liveDevices());
    }

    // GET /api/iot/devices/{id}
    @GetMapping("/devices/{id}")
    public ResponseEntity<IotDeviceResponse> device(@PathVariable Long id) {
        return ResponseEntity.ok(iotService.device(id));
    }

    // GET /api/iot/devices/{id}/series?metric=TEMPERATURA&limit=60
    @GetMapping("/devices/{id}/series")
    public ResponseEntity<SensorSeriesResponse> series(
            @PathVariable Long id,
            @RequestParam String metric,
            @RequestParam(defaultValue = "60") int limit) {
        return ResponseEntity.ok(iotService.series(id, metric, limit));
    }
}
