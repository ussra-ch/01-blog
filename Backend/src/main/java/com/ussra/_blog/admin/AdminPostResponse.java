package com.ussra._blog.admin;

import java.time.LocalDateTime;

public record AdminPostResponse(
        Long id,
        Long userId,
        String author,
        String title,
        String description,
        String mediaUrl,
        boolean hidden,
        LocalDateTime createdAt) {
}
