package com.mantech.app.service;

import com.mantech.app.domain.*;
import com.mantech.app.dto.ReportRequest;
import com.mantech.app.dto.ReportResponse;
import com.mantech.app.repository.MachineRepository;
import com.mantech.app.repository.ReportFileRepository;
import com.mantech.app.repository.ReportRepository;
import com.mantech.app.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ReportService {

    private static final String UPLOAD_DIR = "uploads/";

    private final ReportRepository reportRepository;
    private final ReportFileRepository reportFileRepository;
    private final MachineRepository machineRepository;
    private final UserRepository userRepository;

    @Transactional
    public ReportResponse createReport(ReportRequest request) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User currentUser = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        Machine machine = machineRepository.findById(request.getMachineId())
                .orElseThrow(() -> new RuntimeException("Máquina no encontrada: " + request.getMachineId()));

        Report report = Report.builder()
                .machine(machine)
                .reportedByUser(currentUser)
                .type(request.getType())
                .description(request.getDescription())
                .priority(request.getPriority())
                .status("PENDIENTE")
                .build();

        return toResponse(reportRepository.save(report));
    }

    public List<ReportResponse> getReportsByMachine(Long machineId) {
        return reportRepository.findByMachineIdOrderByCreatedAtDesc(machineId)
                .stream().map(this::toResponse).toList();
    }

    public List<ReportResponse> getMyReports() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User currentUser = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        return reportRepository.findByReportedByUserIdOrderByCreatedAtDesc(currentUser.getId())
                .stream().map(this::toResponse).toList();
    }

    @Transactional
    public ReportResponse resolveReport(Long reportId) {
        Report report = reportRepository.findById(reportId)
                .orElseThrow(() -> new RuntimeException("Reporte no encontrado: " + reportId));
        report.setStatus("RESUELTO");
        report.setResolvedAt(LocalDateTime.now());
        return toResponse(reportRepository.save(report));
    }

    @Transactional
    public String attachFile(Long reportId, MultipartFile file, String fileType) throws IOException {
        Report report = reportRepository.findById(reportId)
                .orElseThrow(() -> new RuntimeException("Reporte no encontrado: " + reportId));

        String filename = UUID.randomUUID() + "_" + file.getOriginalFilename();
        Path uploadPath = Paths.get(UPLOAD_DIR);
        Files.createDirectories(uploadPath);
        Files.copy(file.getInputStream(), uploadPath.resolve(filename));

        String fileUrl = UPLOAD_DIR + filename;
        ReportFile reportFile = ReportFile.builder()
                .report(report)
                .fileType(fileType.toUpperCase())
                .fileUrl(fileUrl)
                .build();
        reportFileRepository.save(reportFile);

        return fileUrl;
    }

    private ReportResponse toResponse(Report report) {
        List<String> fileUrls = report.getFiles().stream()
                .map(ReportFile::getFileUrl).toList();

        return ReportResponse.builder()
                .id(report.getId())
                .machineId(report.getMachine().getId())
                .machineName(report.getMachine().getName())
                .reportedBy(report.getReportedByUser().getFirstName() + " " + report.getReportedByUser().getLastName())
                .type(report.getType())
                .description(report.getDescription())
                .priority(report.getPriority())
                .status(report.getStatus())
                .createdAt(report.getCreatedAt())
                .resolvedAt(report.getResolvedAt())
                .fileUrls(fileUrls)
                .build();
    }
}
