package com.ussra._blog.posts.dto;
import lombok.Getter;
import lombok.Setter;


@Getter
@Setter
public class UserSummaryResponse {
    private Long id;
    private String username;
    private String profilePicture;
}
