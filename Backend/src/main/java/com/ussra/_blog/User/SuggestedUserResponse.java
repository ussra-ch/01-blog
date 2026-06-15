package com.ussra._blog.User;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class SuggestedUserResponse {
    private Long id;
    private String username;
    private String bio;
    private String avatarUrl;
    private long followerCount;
}
