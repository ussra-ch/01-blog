package com.ussra._blog.Authentication;

import lombok.Data;

@Data
public class LoginRequest {
    private String username;
    private String password;
}