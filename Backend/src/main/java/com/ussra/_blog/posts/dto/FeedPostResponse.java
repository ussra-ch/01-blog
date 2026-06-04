package com.ussra._blog.posts.dto;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class FeedPostResponse {
    private Long postId;
    private String title;
    private String description;
    private String mediaUrl;
    private LocalDateTime createdAt;
    private int likeCount;
    private int commentCount;
    private boolean likedByCurrentUser;
    private UserSummaryResponse author;
}
