package com.mantech.app.controller;

import com.mantech.app.dto.KpiOverviewResponse;
import com.mantech.app.dto.MachineKpiResponse;
import com.mantech.app.service.KpiService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/kpis")
@RequiredArgsConstructor
public class KpiController {

    private final KpiService kpiService;

    // GET /api/kpis/overview — métricas agregadas para el dashboard
    @GetMapping("/overview")
    public ResponseEntity<KpiOverviewResponse> overview() {
        return ResponseEntity.ok(kpiService.overview());
    }

    // GET /api/kpis/machine/{id} — métricas de una máquina/activo
    @GetMapping("/machine/{id}")
    public ResponseEntity<MachineKpiResponse> forMachine(@PathVariable Long id) {
        return ResponseEntity.ok(kpiService.forMachine(id));
    }
}
