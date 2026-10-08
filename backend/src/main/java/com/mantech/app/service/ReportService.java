package com.mantech.app.service;

import com.mantech.app.domain.*;
import com.mantech.app.dto.ReportRequest;
import com.mantech.app.dto.ReportResponse;
import com.mantech.app.repository.MachineRepository;
import com.mantech.app.repository.ReportFileRepository;
import com.mantech.app.repository.ReportRepository;
import com.mantech.app.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
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
import java.util.Set;
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

    /** Tipos de adjunto que acepta la app (foto de la falla y nota de voz). */
    private static final Set<String> VALID_FILE_TYPES = Set.of("PHOTO", "AUDIO");

    /** Roles que pueden adjuntar evidencia a un reporte ajeno. */
    private static final Set<String> STAFF_ROLES = Set.of("MANTENIMIENTO", "SUPERVISOR", "JEFE_PLANTA");

    private static final long MAX_FILE_BYTES = 10L * 1024 * 1024;

    @Transactional
    public String attachFile(Long reportId, MultipartFile file, String fileType) throws IOException {
        String normalizedType = fileType == null ? null : fileType.trim().toUpperCase();
        if (normalizedType == null || !VALID_FILE_TYPES.contains(normalizedType)) {
            throw new IllegalArgumentException("Tipo de archivo inválido. Valores permitidos: PHOTO, AUDIO.");
        }
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("El archivo está vacío.");
        }
        if (file.getSize() > MAX_FILE_BYTES) {
            throw new IllegalArgumentException("El archivo supera el máximo de 10 MB.");
        }

        Report report = reportRepository.findById(reportId)
                .orElseThrow(() -> new RuntimeException("Reporte no encontrado: " + reportId));

        // El operario adjunta evidencia a SU reporte; mantenimiento y las jefaturas
        // pueden hacerlo sobre cualquiera. Sin este control, cualquier usuario podía
        // adjuntar archivos a reportes ajenos con sólo probar ids correlativos.
        User currentUser = currentUser();
        boolean isOwner = report.getReportedByUser() != null
                && report.getReportedByUser().getId().equals(currentUser.getId());
        boolean isStaff = currentUser.getRole() != null
                && STAFF_ROLES.contains(currentUser.getRole().getName());
        if (!isOwner && !isStaff) {
            throw new AccessDeniedException("No podés adjuntar archivos a un reporte de otro usuario.");
        }

        // El nombre que manda el cliente no se usa para construir la ruta: sólo se
        // conserva su extensión, ya validada. Así un nombre con "../" no puede
        // escribir fuera del directorio de subidas.
        String extension = extensionOf(file.getOriginalFilename(), normalizedType);
        String filename = UUID.randomUUID() + extension;

        Path uploadPath = Paths.get(UPLOAD_DIR).toAbsolutePath().normalize();
        Files.createDirectories(uploadPath);
        Path target = uploadPath.resolve(filename).normalize();
        if (!target.startsWith(uploadPath)) {
            throw new IllegalArgumentException("Nombre de archivo inválido.");
        }
        Files.copy(file.getInputStream(), target);

        String fileUrl = UPLOAD_DIR + filename;
        ReportFile reportFile = ReportFile.builder()
                .report(report)
                .fileType(normalizedType)
                .fileUrl(fileUrl)
                .build();
        reportFileRepository.save(reportFile);

        return fileUrl;
    }

    /** Extensión segura derivada del nombre original, con un default por tipo. */
    private String extensionOf(String originalName, String fileType) {
        if (originalName != null) {
            int dot = originalName.lastIndexOf('.');
            if (dot >= 0 && dot < originalName.length() - 1) {
                String ext = originalName.substring(dot + 1).toLowerCase();
                if (ext.matches("[a-z0-9]{1,5}")) {
                    return "." + ext;
                }
            }
        }
        return "PHOTO".equals(fileType) ? ".jpg" : ".m4a";
    }

    private User currentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
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
