package com.ussra._blog.posts.dto;

import java.time.LocalDateTime;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CommentResponse {
    private Long commentId;
    private Long postId;
    private String content;
    private LocalDateTime createdAt;
    private UserSummaryResponse author;
}
