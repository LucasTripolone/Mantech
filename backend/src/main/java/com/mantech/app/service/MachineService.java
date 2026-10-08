package com.mantech.app.service;

import com.mantech.app.domain.Machine;
import com.mantech.app.domain.MachineStatusHistory;
import com.mantech.app.domain.User;
import com.mantech.app.dto.MachineResponse;
import com.mantech.app.repository.MachineRepository;
import com.mantech.app.repository.MachineStatusHistoryRepository;
import com.mantech.app.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class MachineService {

    private final MachineRepository machineRepository;
    private final MachineStatusHistoryRepository statusHistoryRepository;
    private final UserRepository userRepository;

    public List<MachineResponse> listAll() {
        return machineRepository.findAll().stream().map(machine -> {
            String currentStatus = statusHistoryRepository
                    .findFirstByMachineIdOrderByCreatedAtDesc(machine.getId())
                    .map(MachineStatusHistory::getStatus)
                    .orElse("OPERATIVA");
            return toResponse(machine, currentStatus);
        }).toList();
    }

    public MachineResponse findByQrCode(String qrCode) {
        Machine machine = machineRepository.findByQrCode(qrCode)
                .orElseThrow(() -> new RuntimeException("Máquina no encontrada para QR: " + qrCode));

        String currentStatus = statusHistoryRepository
                .findFirstByMachineIdOrderByCreatedAtDesc(machine.getId())
                .map(MachineStatusHistory::getStatus)
                .orElse("OPERATIVA");

        return toResponse(machine, currentStatus);
    }

    public MachineResponse findById(Long id) {
        Machine machine = machineRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Máquina no encontrada: " + id));

        String currentStatus = statusHistoryRepository
                .findFirstByMachineIdOrderByCreatedAtDesc(machine.getId())
                .map(MachineStatusHistory::getStatus)
                .orElse("OPERATIVA");

        return toResponse(machine, currentStatus);
    }

    public List<MachineStatusHistory> getStatusHistory(Long machineId) {
        return statusHistoryRepository.findByMachineIdOrderByCreatedAtDesc(machineId);
    }

    /** Estados operativos válidos de una máquina. */
    private static final Set<String> VALID_STATUSES = Set.of("OPERATIVA", "PREVENTIVO", "FALLA");

    @Transactional
    public void updateStatus(Long machineId, String status, String reason) {
        // Sin esta validación se persiste cualquier texto, y como las métricas
        // comparan contra estos literales exactos, un valor fuera del dominio
        // desaparece de los cálculos sin producir ningún error.
        String normalized = status == null ? null : status.trim().toUpperCase();
        if (normalized == null || !VALID_STATUSES.contains(normalized)) {
            throw new IllegalArgumentException(
                    "Estado inválido. Valores permitidos: OPERATIVA, PREVENTIVO, FALLA.");
        }

        Machine machine = machineRepository.findById(machineId)
                .orElseThrow(() -> new RuntimeException("Máquina no encontrada: " + machineId));

        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User currentUser = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        MachineStatusHistory history = MachineStatusHistory.builder()
                .machine(machine)
                .changedByUser(currentUser)
                .status(normalized)
                .reason(reason)
                .build();

        statusHistoryRepository.save(history);
    }

    private MachineResponse toResponse(Machine machine, String currentStatus) {
        return MachineResponse.builder()
                .id(machine.getId())
                .name(machine.getName())
                .qrCode(machine.getQrCode())
                .sector(machine.getSector())
                .criticality(machine.getCriticality())
                .currentStatus(currentStatus)
                .plantName(machine.getPlant().getName())
                .build();
    }
}
