package com.mantech.app.repository;

import com.mantech.app.domain.Report;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ReportRepository extends JpaRepository<Report, Long> {
    List<Report> findByMachineIdOrderByCreatedAtDesc(Long machineId);
    List<Report> findByReportedByUserIdOrderByCreatedAtDesc(Long userId);
}
