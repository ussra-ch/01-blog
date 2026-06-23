package com.ussra._blog.reports;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface ReportRepository extends JpaRepository<Report, Long> {
    List<Report> findAllByOrderByCreatedAtDesc();
    boolean existsByReporterIdAndReportedUserId(Long reporterId, Long reportedUserId);
    boolean existsByReporterIdAndReportedPostId(Long reporterId, Long reportedPostId);
}
