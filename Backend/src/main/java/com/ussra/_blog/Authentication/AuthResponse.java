package com.ussra._blog.Authentication;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class AuthResponse {
    private Long id;
    private String token;
    private Long expiresIn;
    private String username;
    private String role;
}