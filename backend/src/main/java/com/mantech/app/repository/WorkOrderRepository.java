package com.mantech.app.repository;

import com.mantech.app.domain.WorkOrder;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface WorkOrderRepository extends JpaRepository<WorkOrder, Long> {

    List<WorkOrder> findAllByOrderByCreatedAtDesc();

    List<WorkOrder> findByScheduledAtBetweenOrderByScheduledAtAsc(LocalDateTime from, LocalDateTime to);

    List<WorkOrder> findByStatusOrderByCreatedAtDesc(String status);

    List<WorkOrder> findByTypeOrderByCreatedAtDesc(String type);

    List<WorkOrder> findByMachineIdOrderByCreatedAtDesc(Long machineId);

    List<WorkOrder> findByAssignedTechnicianIdOrderByCreatedAtDesc(Long technicianId);
}
