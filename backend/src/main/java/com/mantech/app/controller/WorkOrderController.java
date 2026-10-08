package com.mantech.app.controller;

import com.mantech.app.dto.AssignTechnicianRequest;
import com.mantech.app.dto.CloseWorkOrderRequest;
import com.mantech.app.dto.WorkOrderRequest;
import com.mantech.app.dto.WorkOrderResponse;
import com.mantech.app.service.WorkOrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/work-orders")
@RequiredArgsConstructor
public class WorkOrderController {

    private final WorkOrderService workOrderService;

    // GET /api/work-orders?status=&type=&machineId=
    @GetMapping
    public ResponseEntity<List<WorkOrderResponse>> list(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) Long machineId) {
        return ResponseEntity.ok(workOrderService.list(status, type, machineId));
    }

    // GET /api/work-orders/mine — órdenes asignadas al usuario autenticado
    @GetMapping("/mine")
    public ResponseEntity<List<WorkOrderResponse>> mine() {
        return ResponseEntity.ok(workOrderService.getMine());
    }

    // GET /api/work-orders/agenda?from=&to= — órdenes programadas (calendario)
    @GetMapping("/agenda")
    public ResponseEntity<List<WorkOrderResponse>> agenda(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime to) {
        LocalDateTime start = from != null ? from : LocalDateTime.now().minusDays(7);
        LocalDateTime end = to != null ? to : LocalDateTime.now().plusDays(30);
        return ResponseEntity.ok(workOrderService.agenda(start, end));
    }

    // GET /api/work-orders/{id}
    @GetMapping("/{id}")
    public ResponseEntity<WorkOrderResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(workOrderService.getById(id));
    }

    // POST /api/work-orders — crear orden (supervisores / jefe / mantenimiento)
    @PostMapping
    @PreAuthorize("hasAnyRole('SUPERVISOR','JEFE_PLANTA','MANTENIMIENTO')")
    public ResponseEntity<WorkOrderResponse> create(@Valid @RequestBody WorkOrderRequest request) {
        return ResponseEntity.ok(workOrderService.create(request));
    }

    // POST /api/work-orders/from-report/{reportId} — generar orden desde un reporte
    @PostMapping("/from-report/{reportId}")
    @PreAuthorize("hasAnyRole('SUPERVISOR','JEFE_PLANTA','MANTENIMIENTO')")
    public ResponseEntity<WorkOrderResponse> createFromReport(@PathVariable Long reportId) {
        return ResponseEntity.ok(workOrderService.createFromReport(reportId));
    }

    // PATCH /api/work-orders/{id}/assign — asignar técnico (supervisor / jefe)
    @PatchMapping("/{id}/assign")
    @PreAuthorize("hasAnyRole('SUPERVISOR','JEFE_PLANTA')")
    public ResponseEntity<WorkOrderResponse> assign(@PathVariable Long id,
                                                    @Valid @RequestBody AssignTechnicianRequest request) {
        return ResponseEntity.ok(workOrderService.assign(id, request.getTechnicianId()));
    }

    // PATCH /api/work-orders/{id}/start — registrar inicio de ejecución
    @PatchMapping("/{id}/start")
    @PreAuthorize("hasAnyRole('MANTENIMIENTO','SUPERVISOR','JEFE_PLANTA')")
    public ResponseEntity<WorkOrderResponse> start(@PathVariable Long id) {
        return ResponseEntity.ok(workOrderService.start(id));
    }

    // PATCH /api/work-orders/{id}/finish — cerrar la orden (registra fin + KPIs)
    @PatchMapping("/{id}/finish")
    @PreAuthorize("hasAnyRole('MANTENIMIENTO','SUPERVISOR','JEFE_PLANTA')")
    public ResponseEntity<WorkOrderResponse> finish(@PathVariable Long id,
                                                    @RequestBody(required = false) CloseWorkOrderRequest request) {
        return ResponseEntity.ok(workOrderService.finish(id, request));
    }

    // PATCH /api/work-orders/{id}/cancel
    @PatchMapping("/{id}/cancel")
    @PreAuthorize("hasAnyRole('SUPERVISOR','JEFE_PLANTA')")
    public ResponseEntity<WorkOrderResponse> cancel(@PathVariable Long id) {
        return ResponseEntity.ok(workOrderService.cancel(id));
    }
}
