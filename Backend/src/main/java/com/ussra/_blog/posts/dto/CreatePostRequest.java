package com.ussra._blog.posts.dto;

import org.springframework.web.multipart.MultipartFile;
import jakarta.validation.constraints.NotBlank;
// import jakarta.validation.constraints.NotNull;

import lombok.Data;

@Data
public class CreatePostRequest {
    @NotBlank
    private String title;
    private String description;
    private MultipartFile mediaFile;
    private String mediaType;
}