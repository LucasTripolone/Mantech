package com.mantech.app.controller;

import com.mantech.app.dto.ReportRequest;
import com.mantech.app.dto.ReportResponse;
import com.mantech.app.service.ReportService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;

    // POST /api/reports — crear reporte
    @PostMapping
    public ResponseEntity<ReportResponse> createReport(@Valid @RequestBody ReportRequest request) {
        return ResponseEntity.ok(reportService.createReport(request));
    }

    // GET /api/reports/machine/{machineId}
    @GetMapping("/machine/{machineId}")
    public ResponseEntity<List<ReportResponse>> getReportsByMachine(@PathVariable Long machineId) {
        return ResponseEntity.ok(reportService.getReportsByMachine(machineId));
    }

    // GET /api/reports/mine — reportes del usuario autenticado
    @GetMapping("/mine")
    public ResponseEntity<List<ReportResponse>> getMyReports() {
        return ResponseEntity.ok(reportService.getMyReports());
    }

    // PATCH /api/reports/{id}/resolve
    @PatchMapping("/{id}/resolve")
    public ResponseEntity<ReportResponse> resolveReport(@PathVariable Long id) {
        return ResponseEntity.ok(reportService.resolveReport(id));
    }

    // POST /api/reports/{id}/files — adjuntar foto o audio
    @PostMapping("/{id}/files")
    public ResponseEntity<Map<String, String>> attachFile(@PathVariable Long id,
                                                          @RequestParam("file") MultipartFile file,
                                                          @RequestParam("fileType") String fileType) throws IOException {
        String url = reportService.attachFile(id, file, fileType);
        return ResponseEntity.ok(Map.of("fileUrl", url));
    }
}
