package com.mantech.app.controller;

import com.mantech.app.dto.MachineKpiResponse;
import com.mantech.app.dto.MachineResponse;
import com.mantech.app.dto.PublicMachineStatusResponse;
import com.mantech.app.service.KpiService;
import com.mantech.app.service.MachineService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Endpoints públicos (sin autenticación) para el escaneo de QR en demos.
 * Sólo exponen el estado de una máquina; no permiten modificar nada.
 */
@RestController
@RequestMapping("/api/public")
@RequiredArgsConstructor
public class PublicController {

    private final MachineService machineService;
    private final KpiService kpiService;

    // GET /api/public/machines/qr/{qrCode}
    @GetMapping("/machines/qr/{qrCode}")
    public ResponseEntity<PublicMachineStatusResponse> machineStatus(@PathVariable String qrCode) {
        MachineResponse m = machineService.findByQrCode(qrCode);
        MachineKpiResponse kpi = kpiService.forMachine(m.getId());

        return ResponseEntity.ok(PublicMachineStatusResponse.builder()
                .machineId(m.getId())
                .name(m.getName())
                .sector(m.getSector())
                .criticality(m.getCriticality())
                .qrCode(m.getQrCode())
                .plantName(m.getPlantName())
                .currentStatus(m.getCurrentStatus())
                .availabilityPercent(kpi.getAvailabilityPercent())
                .mttrHours(kpi.getMttrHours())
                .openWorkOrders(kpi.getOpenCount())
                .lastFailureAt(kpi.getLastFailureAt())
                .build());
    }
}
