package com.ussra._blog.dto;

import org.springframework.web.multipart.MultipartFile;

import lombok.Data;

@Data
public class RegisterRequest {
    private String username;
    private String email;
    private String password;
    private String bio;
    private MultipartFile avatar;
}