package com.ussra._blog.admin;

import java.time.LocalDateTime;

public record AdminReportResponse(
        Long id,
        Long reporterId,
        String reporter,
        Long reportedUserId,
        String reportedUser,
        String reason,
        LocalDateTime createdAt) {
}
