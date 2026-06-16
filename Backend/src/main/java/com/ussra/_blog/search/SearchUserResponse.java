package com.ussra._blog.search;

public record SearchUserResponse(
        Long id,
        String username,
        String bio,
        String avatarUrl) {
}
