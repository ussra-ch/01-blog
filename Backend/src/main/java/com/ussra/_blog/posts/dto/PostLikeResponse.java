package com.ussra._blog.posts.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class PostLikeResponse {
    private Long postId;
    private int likeCount;
    private boolean likedByCurrentUser;
}
