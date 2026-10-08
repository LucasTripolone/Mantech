package com.mantech.app.service;

import com.mantech.app.domain.Machine;
import com.mantech.app.domain.Report;
import com.mantech.app.domain.User;
import com.mantech.app.domain.WorkOrder;
import com.mantech.app.dto.CloseWorkOrderRequest;
import com.mantech.app.dto.WorkOrderRequest;
import com.mantech.app.dto.WorkOrderResponse;
import com.mantech.app.repository.MachineRepository;
import com.mantech.app.repository.ReportRepository;
import com.mantech.app.repository.UserRepository;
import com.mantech.app.repository.WorkOrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class WorkOrderService {

    private final WorkOrderRepository workOrderRepository;
    private final MachineRepository machineRepository;
    private final UserRepository userRepository;
    private final ReportRepository reportRepository;

    // ----- Lectura -----

    public List<WorkOrderResponse> list(String status, String type, Long machineId) {
        List<WorkOrder> orders;
        if (status != null) {
            orders = workOrderRepository.findByStatusOrderByCreatedAtDesc(status.toUpperCase());
        } else if (type != null) {
            orders = workOrderRepository.findByTypeOrderByCreatedAtDesc(type.toUpperCase());
        } else if (machineId != null) {
            orders = workOrderRepository.findByMachineIdOrderByCreatedAtDesc(machineId);
        } else {
            orders = workOrderRepository.findAllByOrderByCreatedAtDesc();
        }
        return orders.stream().map(this::toResponse).toList();
    }

    public WorkOrderResponse getById(Long id) {
        return toResponse(findOrThrow(id));
    }

    /** Agenda: órdenes con fecha programada dentro del rango, ordenadas por fecha. */
    public List<WorkOrderResponse> agenda(LocalDateTime from, LocalDateTime to) {
        return workOrderRepository.findByScheduledAtBetweenOrderByScheduledAtAsc(from, to)
                .stream().map(this::toResponse).toList();
    }

    public List<WorkOrderResponse> getMine() {
        User current = currentUser();
        return workOrderRepository.findByAssignedTechnicianIdOrderByCreatedAtDesc(current.getId())
                .stream().map(this::toResponse).toList();
    }

    // ----- Escritura / ciclo de vida -----

    @Transactional
    public WorkOrderResponse create(WorkOrderRequest request) {
        User creator = currentUser();
        Machine machine = machineRepository.findById(request.getMachineId())
                .orElseThrow(() -> new RuntimeException("Máquina no encontrada: " + request.getMachineId()));

        WorkOrder.WorkOrderBuilder builder = WorkOrder.builder()
                .machine(machine)
                .plant(machine.getPlant())
                .createdByUser(creator)
                .type(request.getType().toUpperCase())
                .priority(request.getPriority())
                .description(request.getDescription())
                .failureType(request.getFailureType())
                .impact(request.getImpact())
                .stoppedProduction(request.isStoppedProduction())
                .scheduledAt(request.getScheduledAt())
                .status("ABIERTA");

        if (request.getReportId() != null) {
            Report report = reportRepository.findById(request.getReportId())
                    .orElseThrow(() -> new RuntimeException("Reporte no encontrado: " + request.getReportId()));
            builder.report(report);
            report.setStatus("EN_PROCESO");
            reportRepository.save(report);
        }

        if (request.getAssignedTechnicianId() != null) {
            User tech = userRepository.findById(request.getAssignedTechnicianId())
                    .orElseThrow(() -> new RuntimeException("Técnico no encontrado: " + request.getAssignedTechnicianId()));
            builder.assignedTechnician(tech).status("ASIGNADA");
        }

        return toResponse(workOrderRepository.save(builder.build()));
    }

    /** Genera una orden correctiva a partir de un reporte de operario. */
    @Transactional
    public WorkOrderResponse createFromReport(Long reportId) {
        User creator = currentUser();
        Report report = reportRepository.findById(reportId)
                .orElseThrow(() -> new RuntimeException("Reporte no encontrado: " + reportId));

        WorkOrder order = WorkOrder.builder()
                .machine(report.getMachine())
                .plant(report.getMachine().getPlant())
                .report(report)
                .createdByUser(creator)
                .type("CORRECTIVA")
                .priority(report.getPriority())
                .description(report.getDescription())
                .failureType(report.getType())
                .status("ABIERTA")
                .build();

        report.setStatus("EN_PROCESO");
        reportRepository.save(report);

        return toResponse(workOrderRepository.save(order));
    }

    @Transactional
    public WorkOrderResponse assign(Long id, Long technicianId) {
        WorkOrder order = findOrThrow(id);
        User tech = userRepository.findById(technicianId)
                .orElseThrow(() -> new RuntimeException("Técnico no encontrado: " + technicianId));
        order.setAssignedTechnician(tech);
        if ("ABIERTA".equals(order.getStatus())) {
            order.setStatus("ASIGNADA");
        }
        return toResponse(workOrderRepository.save(order));
    }

    @Transactional
    public WorkOrderResponse start(Long id) {
        WorkOrder order = findOrThrow(id);
        if (order.getStartedAt() == null) {
            order.setStartedAt(LocalDateTime.now());
        }
        // Si nadie la había tomado, el técnico que la inicia queda asignado.
        if (order.getAssignedTechnician() == null) {
            order.setAssignedTechnician(currentUser());
        }
        order.setStatus("EN_PROCESO");
        return toResponse(workOrderRepository.save(order));
    }

    @Transactional
    public WorkOrderResponse finish(Long id, CloseWorkOrderRequest request) {
        WorkOrder order = findOrThrow(id);
        LocalDateTime now = LocalDateTime.now();
        // Si se cierra sin haber iniciado, registramos el inicio en el mismo momento.
        if (order.getStartedAt() == null) {
            order.setStartedAt(now);
        }
        order.setFinishedAt(now);
        order.setStatus("CERRADA");
        if (request != null) {
            order.setResolutionNotes(request.getResolutionNotes());
            order.setSignature(request.getSignature());
        }
        if (order.getSignature() == null) {
            User u = currentUser();
            order.setSignature(u.getFirstName() + " " + u.getLastName());
        }

        // Si la orden venía de un reporte, lo damos por resuelto.
        Report report = order.getReport();
        if (report != null && !"RESUELTO".equals(report.getStatus())) {
            report.setStatus("RESUELTO");
            report.setResolvedAt(now);
            reportRepository.save(report);
        }

        return toResponse(workOrderRepository.save(order));
    }

    @Transactional
    public WorkOrderResponse cancel(Long id) {
        WorkOrder order = findOrThrow(id);
        order.setStatus("CANCELADA");
        return toResponse(workOrderRepository.save(order));
    }

    // ----- Helpers -----

    private WorkOrder findOrThrow(Long id) {
        return workOrderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Orden de trabajo no encontrada: " + id));
    }

    private User currentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
    }

    private WorkOrderResponse toResponse(WorkOrder o) {
        Long duration = null;
        if (o.getStartedAt() != null && o.getFinishedAt() != null) {
            duration = Duration.between(o.getStartedAt(), o.getFinishedAt()).toMinutes();
        }

        User tech = o.getAssignedTechnician();
        User creator = o.getCreatedByUser();
        Machine machine = o.getMachine();

        return WorkOrderResponse.builder()
                .id(o.getId())
                .machineId(machine.getId())
                .machineName(machine.getName())
                .machineSector(machine.getSector())
                .machineCriticality(machine.getCriticality())
                .plantName(o.getPlant() != null ? o.getPlant().getName() : null)
                .reportId(o.getReport() != null ? o.getReport().getId() : null)
                .type(o.getType())
                .status(o.getStatus())
                .priority(o.getPriority())
                .description(o.getDescription())
                .failureType(o.getFailureType())
                .impact(o.getImpact())
                .stoppedProduction(o.isStoppedProduction())
                .createdBy(creator != null ? creator.getFirstName() + " " + creator.getLastName() : null)
                .assignedTechnicianId(tech != null ? tech.getId() : null)
                .assignedTechnician(tech != null ? tech.getFirstName() + " " + tech.getLastName() : null)
                .scheduledAt(o.getScheduledAt())
                .startedAt(o.getStartedAt())
                .finishedAt(o.getFinishedAt())
                .resolutionNotes(o.getResolutionNotes())
                .signature(o.getSignature())
                .createdAt(o.getCreatedAt())
                .durationMinutes(duration)
                .build();
    }
}
