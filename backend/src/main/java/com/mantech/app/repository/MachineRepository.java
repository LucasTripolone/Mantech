package com.mantech.app.repository;

import com.mantech.app.domain.Machine;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface MachineRepository extends JpaRepository<Machine, Long> {
    Optional<Machine> findByQrCode(String qrCode);
    List<Machine> findByPlantIdAndActiveTrue(Long plantId);
}
