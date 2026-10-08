package com.mantech.app.repository;

import com.mantech.app.domain.PreventivePlan;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PreventivePlanRepository extends JpaRepository<PreventivePlan, Long> {

    List<PreventivePlan> findAllByOrderByNextDueAtAsc();

    List<PreventivePlan> findByActiveTrueOrderByNextDueAtAsc();

    List<PreventivePlan> findByMachineIdOrderByNextDueAtAsc(Long machineId);
}
