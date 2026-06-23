package com.ussra._blog.admin;

import java.time.LocalDateTime;

public record AdminReportResponse(
        Long id,
        Long reporterId,
        String reporter,
        Long reportedUserId,
        String reportedUser,
        Long reportedPostId,
        Long reportedPostAuthorId,
        String reportedPostAuthor,
        String reportedPostTitle,
        String reason,
        LocalDateTime createdAt) {
}
