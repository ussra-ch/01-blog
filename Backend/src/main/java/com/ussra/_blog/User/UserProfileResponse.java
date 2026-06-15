package com.ussra._blog.User;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class UserProfileResponse {
    private Long id;
    private String username;
    private String bio;
    private String avatarUrl;
    private LocalDateTime createdAt;
    private long followerCount;
    private long followingCount;
    private long postCount;
    private boolean followedByCurrentUser;
    private boolean currentUser;
}
