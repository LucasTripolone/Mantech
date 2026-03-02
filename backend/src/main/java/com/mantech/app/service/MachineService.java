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

import java.util.List;

@Service
@RequiredArgsConstructor
public class MachineService {

    private final MachineRepository machineRepository;
    private final MachineStatusHistoryRepository statusHistoryRepository;
    private final UserRepository userRepository;

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

    public void updateStatus(Long machineId, String status, String reason) {
        Machine machine = machineRepository.findById(machineId)
                .orElseThrow(() -> new RuntimeException("Máquina no encontrada: " + machineId));

        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User currentUser = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        MachineStatusHistory history = MachineStatusHistory.builder()
                .machine(machine)
                .changedByUser(currentUser)
                .status(status)
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
