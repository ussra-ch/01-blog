package com.ussra._blog.search;

import java.util.List;

import com.ussra._blog.posts.dto.FeedPostResponse;

public record SearchResponse(
        String query,
        List<SearchUserResponse> users,
        List<FeedPostResponse> posts) {
}
