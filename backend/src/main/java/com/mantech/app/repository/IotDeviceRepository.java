package com.mantech.app.repository;

import com.mantech.app.domain.IotDevice;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface IotDeviceRepository extends JpaRepository<IotDevice, Long> {

    Optional<IotDevice> findByDeviceKey(String deviceKey);

    List<IotDevice> findByActiveTrueOrderByNameAsc();

    List<IotDevice> findByMachineIdOrderByNameAsc(Long machineId);
}
