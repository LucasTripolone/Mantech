package com.mantech.app.service;

import com.mantech.app.domain.Machine;
import com.mantech.app.domain.PreventivePlan;
import com.mantech.app.domain.User;
import com.mantech.app.domain.WorkOrder;
import com.mantech.app.dto.PreventivePlanRequest;
import com.mantech.app.dto.PreventivePlanResponse;
import com.mantech.app.repository.MachineRepository;
import com.mantech.app.repository.PreventivePlanRepository;
import com.mantech.app.repository.UserRepository;
import com.mantech.app.repository.WorkOrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PreventivePlanService {

    private static final int DEFAULT_HORIZON_DAYS = 14;
    private static final int MAX_GENERATIONS_PER_PLAN = 30;

    private final PreventivePlanRepository planRepository;
    private final MachineRepository machineRepository;
    private final UserRepository userRepository;
    private final WorkOrderRepository workOrderRepository;

    public List<PreventivePlanResponse> list(boolean activeOnly) {
        List<PreventivePlan> plans = activeOnly
                ? planRepository.findByActiveTrueOrderByNextDueAtAsc()
                : planRepository.findAllByOrderByNextDueAtAsc();
        return plans.stream().map(this::toResponse).toList();
    }

    public PreventivePlanResponse getById(Long id) {
        return toResponse(findOrThrow(id));
    }

    @Transactional
    public PreventivePlanResponse create(PreventivePlanRequest req) {
        Machine machine = machineRepository.findById(req.getMachineId())
                .orElseThrow(() -> new RuntimeException("Máquina no encontrada: " + req.getMachineId()));

        PreventivePlan plan = PreventivePlan.builder()
                .machine(machine)
                .title(req.getTitle())
                .description(req.getDescription())
                .frequencyType(req.getFrequencyType().toUpperCase())
                .frequencyValue(req.getFrequencyValue())
                .estimatedDurationMinutes(req.getEstimatedDurationMinutes())
                .nextDueAt(req.getNextDueAt() != null ? req.getNextDueAt() : LocalDateTime.now())
                .active(true)
                .build();

        if (req.getAssignedTechnicianId() != null) {
            plan.setAssignedTechnician(userRepository.findById(req.getAssignedTechnicianId())
                    .orElseThrow(() -> new RuntimeException("Técnico no encontrado: " + req.getAssignedTechnicianId())));
        }

        return toResponse(planRepository.save(plan));
    }

    @Transactional
    public PreventivePlanResponse update(Long id, PreventivePlanRequest req) {
        PreventivePlan plan = findOrThrow(id);
        plan.setTitle(req.getTitle());
        plan.setDescription(req.getDescription());
        plan.setFrequencyType(req.getFrequencyType().toUpperCase());
        plan.setFrequencyValue(req.getFrequencyValue());
        plan.setEstimatedDurationMinutes(req.getEstimatedDurationMinutes());
        if (req.getNextDueAt() != null) plan.setNextDueAt(req.getNextDueAt());
        if (req.getAssignedTechnicianId() != null) {
            plan.setAssignedTechnician(userRepository.findById(req.getAssignedTechnicianId())
                    .orElseThrow(() -> new RuntimeException("Técnico no encontrado: " + req.getAssignedTechnicianId())));
        }
        return toResponse(planRepository.save(plan));
    }

    @Transactional
    public PreventivePlanResponse setActive(Long id, boolean active) {
        PreventivePlan plan = findOrThrow(id);
        plan.setActive(active);
        return toResponse(planRepository.save(plan));
    }

    @Transactional
    public void delete(Long id) {
        planRepository.deleteById(id);
    }

    /**
     * Genera órdenes de trabajo preventivas para todos los planes activos cuya
     * próxima fecha cae dentro del horizonte (vencidas + próximas), avanzando la
     * fecha del plan según su frecuencia. Devuelve cuántas órdenes creó.
     */
    @Transactional
    public int generateDueWorkOrders() {
        User creator = currentUserOrNull();
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime horizon = now.plusDays(DEFAULT_HORIZON_DAYS);
        int generated = 0;

        for (PreventivePlan plan : planRepository.findByActiveTrueOrderByNextDueAtAsc()) {
            int iterations = 0;
            while (!plan.getNextDueAt().isAfter(horizon) && iterations < MAX_GENERATIONS_PER_PLAN) {
                WorkOrder wo = WorkOrder.builder()
                        .machine(plan.getMachine())
                        .plant(plan.getMachine().getPlant())
                        .createdByUser(creator)
                        .assignedTechnician(plan.getAssignedTechnician())
                        .type("PREVENTIVA")
                        .priority("MEDIA")
                        .description(plan.getTitle() + (plan.getDescription() != null ? " — " + plan.getDescription() : ""))
                        .failureType("PREVENTIVO")
                        .impact("BAJO")
                        .stoppedProduction(false)
                        .scheduledAt(plan.getNextDueAt())
                        .status(plan.getAssignedTechnician() != null ? "ASIGNADA" : "ABIERTA")
                        .build();
                workOrderRepository.save(wo);

                plan.setLastGeneratedAt(now);
                plan.setNextDueAt(plan.advance(plan.getNextDueAt()));
                iterations++;
                generated++;
            }
            planRepository.save(plan);
        }
        return generated;
    }

    // ---------- helpers ----------

    private PreventivePlan findOrThrow(Long id) {
        return planRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Plan preventivo no encontrado: " + id));
    }

    private User currentUserOrNull() {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null) return null;
        return userRepository.findByEmail(auth.getName()).orElse(null);
    }

    private String frequencyLabel(PreventivePlan p) {
        String unit = switch (p.getFrequencyType().toUpperCase()) {
            case "DIAS" -> "día(s)";
            case "SEMANAS" -> "semana(s)";
            case "MESES" -> "mes(es)";
            default -> p.getFrequencyType().toLowerCase();
        };
        return "Cada " + p.getFrequencyValue() + " " + unit;
    }

    private PreventivePlanResponse toResponse(PreventivePlan p) {
        User tech = p.getAssignedTechnician();
        return PreventivePlanResponse.builder()
                .id(p.getId())
                .machineId(p.getMachine().getId())
                .machineName(p.getMachine().getName())
                .title(p.getTitle())
                .description(p.getDescription())
                .frequencyType(p.getFrequencyType())
                .frequencyValue(p.getFrequencyValue())
                .frequencyLabel(frequencyLabel(p))
                .estimatedDurationMinutes(p.getEstimatedDurationMinutes())
                .nextDueAt(p.getNextDueAt())
                .lastGeneratedAt(p.getLastGeneratedAt())
                .active(p.isActive())
                .assignedTechnicianId(tech != null ? tech.getId() : null)
                .assignedTechnician(tech != null ? tech.getFirstName() + " " + tech.getLastName() : null)
                .build();
    }
}
