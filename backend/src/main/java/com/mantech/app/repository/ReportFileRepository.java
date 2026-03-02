package com.mantech.app.repository;

import com.mantech.app.domain.ReportFile;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ReportFileRepository extends JpaRepository<ReportFile, Long> {
    List<ReportFile> findByReportId(Long reportId);
}
