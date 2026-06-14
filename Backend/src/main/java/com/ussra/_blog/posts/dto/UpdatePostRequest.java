package com.ussra._blog.posts.dto;

import org.springframework.web.multipart.MultipartFile;

import lombok.Data;

@Data
public class UpdatePostRequest {
    private String title;
    private String description;
    private MultipartFile mediaFile;
    private String mediaType;
    private boolean removeMedia;
}
