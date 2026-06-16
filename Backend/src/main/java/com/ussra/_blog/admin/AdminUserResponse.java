package com.ussra._blog.admin;

import java.time.LocalDateTime;

public record AdminUserResponse(
        Long id,
        String username,
        String email,
        String role,
        boolean banned,
        String avatarUrl,
        LocalDateTime createdAt) {
}
