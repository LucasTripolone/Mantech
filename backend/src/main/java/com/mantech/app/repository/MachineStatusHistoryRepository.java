package com.mantech.app.repository;

import com.mantech.app.domain.MachineStatusHistory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface MachineStatusHistoryRepository extends JpaRepository<MachineStatusHistory, Long> {
    List<MachineStatusHistory> findByMachineIdOrderByCreatedAtDesc(Long machineId);
    Optional<MachineStatusHistory> findFirstByMachineIdOrderByCreatedAtDesc(Long machineId);
}
