package com.mantech.app.controller;

import com.mantech.app.dto.PreventivePlanRequest;
import com.mantech.app.dto.PreventivePlanResponse;
import com.mantech.app.service.PreventivePlanService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/preventive-plans")
@RequiredArgsConstructor
public class PreventivePlanController {

    private final PreventivePlanService planService;

    @GetMapping
    public ResponseEntity<List<PreventivePlanResponse>> list(
            @RequestParam(required = false, defaultValue = "false") boolean activeOnly) {
        return ResponseEntity.ok(planService.list(activeOnly));
    }

    @GetMapping("/{id}")
    public ResponseEntity<PreventivePlanResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(planService.getById(id));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('SUPERVISOR','JEFE_PLANTA')")
    public ResponseEntity<PreventivePlanResponse> create(@Valid @RequestBody PreventivePlanRequest request) {
        return ResponseEntity.ok(planService.create(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPERVISOR','JEFE_PLANTA')")
    public ResponseEntity<PreventivePlanResponse> update(@PathVariable Long id,
                                                         @Valid @RequestBody PreventivePlanRequest request) {
        return ResponseEntity.ok(planService.update(id, request));
    }

    @PatchMapping("/{id}/active")
    @PreAuthorize("hasAnyRole('SUPERVISOR','JEFE_PLANTA')")
    public ResponseEntity<PreventivePlanResponse> setActive(@PathVariable Long id,
                                                            @RequestParam boolean value) {
        return ResponseEntity.ok(planService.setActive(id, value));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPERVISOR','JEFE_PLANTA')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        planService.delete(id);
        return ResponseEntity.noContent().build();
    }

    // Materializa los planes vencidos/próximos en órdenes preventivas programadas.
    @PostMapping("/generate-due")
    @PreAuthorize("hasAnyRole('SUPERVISOR','JEFE_PLANTA','MANTENIMIENTO')")
    public ResponseEntity<Map<String, Integer>> generateDue() {
        int generated = planService.generateDueWorkOrders();
        return ResponseEntity.ok(Map.of("generated", generated));
    }
}
