package com.ussra._blog.notifications;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class NotificationResponse {
    private Long id;
    private String type;
    private String message;
    private boolean read;
    private Long relatedPostId;
    private Long actorId;
    private String actorUsername;
    private String actorAvatarUrl;
    private LocalDateTime createdAt;
}
