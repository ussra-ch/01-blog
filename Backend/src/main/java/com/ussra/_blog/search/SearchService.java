package com.ussra._blog.search;

import java.util.List;

import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import com.ussra._blog.User.User;
import com.ussra._blog.User.UserRepository;
import com.ussra._blog.posts.dto.FeedPostResponse;
import com.ussra._blog.posts.dto.UserSummaryResponse;
import com.ussra._blog.posts.entity.Post;
import com.ussra._blog.posts.repository.PostCommentRepository;
import com.ussra._blog.posts.repository.PostLikeRepository;
import com.ussra._blog.posts.repository.PostRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class SearchService {
    private final UserRepository userRepository;
    private final PostRepository postRepository;
    private final PostLikeRepository postLikeRepository;
    private final PostCommentRepository postCommentRepository;

    public SearchResponse search(String rawQuery, Long currentUserId) {
        String query = rawQuery == null ? "" : rawQuery.trim();
        if (query.length() < 2) {
            return new SearchResponse(query, List.of(), List.of());
        }

        List<SearchUserResponse> users = userRepository.searchUsers(query, PageRequest.of(0, 10)).stream()
                .map(user -> new SearchUserResponse(user.getId(), user.getUsername(), user.getBio(), user.getAvatarUrl()))
                .toList();

        List<FeedPostResponse> posts = postRepository.searchPosts(query, PageRequest.of(0, 20)).stream()
                .map(post -> mapPost(post, currentUserId))
                .toList();

        return new SearchResponse(query, users, posts);
    }

    private FeedPostResponse mapPost(Post post, Long currentUserId) {
        User user = userRepository.findById(post.getUserId()).orElseThrow();

        UserSummaryResponse author = new UserSummaryResponse();
        author.setId(user.getId());
        author.setUsername(user.getUsername());
        author.setProfilePicture(user.getAvatarUrl());

        FeedPostResponse response = new FeedPostResponse();
        response.setPostId(post.getId());
        response.setTitle(post.getTitle());
        response.setDescription(post.getDescription());
        response.setMediaUrl(post.getMediaUrl());
        response.setCreatedAt(post.getCreatedAt());
        response.setAuthor(author);
        response.setLikeCount(postLikeRepository.countByPostId(post.getId()));
        response.setCommentCount(postCommentRepository.countByPostId(post.getId()));
        response.setLikedByCurrentUser(postLikeRepository.existsByPostIdAndUserId(post.getId(), currentUserId));
        response.setComments(new String[0]);
        return response;
    }
}
