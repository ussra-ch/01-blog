package com.ussra._blog.search;

import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;

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

        List<FeedPostResponse> posts = mapPosts(postRepository.searchPosts(query, PageRequest.of(0, 20)), currentUserId);

        return new SearchResponse(query, users, posts);
    }

    private List<FeedPostResponse> mapPosts(List<Post> posts, Long currentUserId) {
        if (posts.isEmpty()) {
            return List.of();
        }

        List<Long> postIds = posts.stream().map(Post::getId).toList();
        List<Long> userIds = posts.stream().map(Post::getUserId).distinct().toList();

        Map<Long, User> usersById = userRepository.findAllById(userIds).stream()
                .collect(Collectors.toMap(User::getId, Function.identity()));
        Map<Long, Long> likeCounts = postLikeRepository.countByPostIds(postIds).stream()
                .collect(Collectors.toMap(
                        PostLikeRepository.PostCountView::getPostId,
                        PostLikeRepository.PostCountView::getTotal
                ));
        Map<Long, Long> commentCounts = postCommentRepository.countByPostIds(postIds).stream()
                .collect(Collectors.toMap(
                        PostCommentRepository.PostCountView::getPostId,
                        PostCommentRepository.PostCountView::getTotal
                ));
        Set<Long> likedPostIds = currentUserId == null
                ? Set.of()
                : Set.copyOf(postLikeRepository.findLikedPostIds(currentUserId, postIds));

        return posts.stream()
                .map(post -> mapPost(post, usersById, likeCounts, commentCounts, likedPostIds))
                .toList();
    }

    private FeedPostResponse mapPost(
            Post post,
            Map<Long, User> usersById,
            Map<Long, Long> likeCounts,
            Map<Long, Long> commentCounts,
            Set<Long> likedPostIds) {
        User user = usersById.get(post.getUserId());
        if (user == null) {
            throw new IllegalStateException("Post author not found: " + post.getUserId());
        }

        UserSummaryResponse author = new UserSummaryResponse();
        author.setId(user.getId());
        author.setUsername(user.getUsername());
        author.setProfilePicture(user.getAvatarUrl());

        FeedPostResponse response = new FeedPostResponse();
        response.setPostId(post.getId());
        response.setTitle(post.getTitle());
        response.setDescription(post.getDescription());
        response.setMediaUrl(post.getMediaUrl());
        response.setMediaType(post.getMediaType());
        response.setCreatedAt(post.getCreatedAt());
        response.setAuthor(author);
        response.setLikeCount(Math.toIntExact(likeCounts.getOrDefault(post.getId(), 0L)));
        response.setCommentCount(Math.toIntExact(commentCounts.getOrDefault(post.getId(), 0L)));
        response.setLikedByCurrentUser(likedPostIds.contains(post.getId()));
        response.setComments(new String[0]);
        return response;
    }
}
