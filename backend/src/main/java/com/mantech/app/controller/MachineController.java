package com.mantech.app.controller;

import com.mantech.app.domain.MachineStatusHistory;
import com.mantech.app.dto.MachineResponse;
import com.mantech.app.service.MachineService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/machines")
@RequiredArgsConstructor
public class MachineController {

    private final MachineService machineService;

    // GET /api/machines/qr/{qrCode} — escaneo desde la app
    @GetMapping("/qr/{qrCode}")
    public ResponseEntity<MachineResponse> findByQrCode(@PathVariable String qrCode) {
        return ResponseEntity.ok(machineService.findByQrCode(qrCode));
    }

    // GET /api/machines/{id}
    @GetMapping("/{id}")
    public ResponseEntity<MachineResponse> findById(@PathVariable Long id) {
        return ResponseEntity.ok(machineService.findById(id));
    }

    // GET /api/machines/{id}/status-history
    @GetMapping("/{id}/status-history")
    public ResponseEntity<List<MachineStatusHistory>> getStatusHistory(@PathVariable Long id) {
        return ResponseEntity.ok(machineService.getStatusHistory(id));
    }

    // PATCH /api/machines/{id}/status
    @PatchMapping("/{id}/status")
    public ResponseEntity<Void> updateStatus(@PathVariable Long id,
                                             @RequestBody Map<String, String> body) {
        machineService.updateStatus(id, body.get("status"), body.get("reason"));
        return ResponseEntity.noContent().build();
    }
}
