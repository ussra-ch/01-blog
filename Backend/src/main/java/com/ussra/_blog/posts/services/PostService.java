package com.ussra._blog.posts.services;

import java.io.IOException;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.ussra._blog.Authentication.FileStorageService;
import com.ussra._blog.notifications.NotificationService;
import com.ussra._blog.posts.dto.CommentResponse;
import com.ussra._blog.posts.dto.CreateCommentRequest;
import com.ussra._blog.posts.dto.CreatePostRequest;
import com.ussra._blog.posts.dto.FeedPostResponse;
import com.ussra._blog.posts.dto.PostLikeResponse;
import com.ussra._blog.posts.dto.UpdatePostRequest;
import com.ussra._blog.posts.dto.UserSummaryResponse;
import com.ussra._blog.posts.entity.PostComment;
import com.ussra._blog.posts.entity.PostLike;
import com.ussra._blog.posts.entity.Post;
import com.ussra._blog.User.UserRepository;
import com.ussra._blog.posts.repository.*;
import lombok.RequiredArgsConstructor;
import java.util.List;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.domain.PageRequest;


import com.ussra._blog.User.User;
@Service
@RequiredArgsConstructor
public class PostService {
    private final PostRepository postRepository;
    private final PostLikeRepository postLikeRepository;
    private final PostCommentRepository postCommentRepository;
    private final FileStorageService fileStorageService;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    public Post getPostById(Long id) {
        return postRepository.getPostById(id)
            .orElseThrow(() -> new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Post id does not exist: " + id
            ));
    }

    
    public Post createPost(CreatePostRequest request, Long userId) throws IOException {
        // title, description, image
        Post post = new Post();
        post.setTitle(request.getTitle());
        post.setDescription(request.getDescription());
        System.out.println("MEDIAAA FILE IS : " + request.getMediaFile());

        if (request.getMediaFile() != null && !request.getMediaFile().isEmpty()) {
            if (request.getMediaFile().getContentType().equals("image/jpeg")
                    || request.getMediaFile().getContentType().equals("image/png")) {
                String imageUrl = fileStorageService.saveFile(request.getMediaFile());
                post.setMediaUrl(imageUrl);
                post.setMediaType("IMAGE");
            } else if (request.getMediaFile().getContentType().equals("video/mp4")) {
                String videoUrl = fileStorageService.saveFile(request.getMediaFile());
                post.setMediaUrl(videoUrl);
                post.setMediaType("VIDEO");
            }
        }
        post.setUserId(userId);
        Post savedPost = postRepository.save(post);
        notificationService.notifySubscribersAboutNewPost(savedPost);
        return savedPost;
    }

    public Post updatePost(Long id, UpdatePostRequest request, Long userId) throws IOException {
        Post post = getPostById(id);
        if (!post.getUserId().equals(userId)) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "You are not the owner of this post.");
        }

        if (request.getTitle() != null && !request.getTitle().isBlank()) {
            post.setTitle(request.getTitle());
        }
        if (request.getDescription() != null && !request.getDescription().isBlank()) {
            post.setDescription(request.getDescription());
        }
        if (request.isRemoveMedia()) {
            fileStorageService.deleteFile(post.getMediaUrl());
            post.setMediaUrl(null);
            post.setMediaType(null);
        } else if (request.getMediaFile() != null && !request.getMediaFile().isEmpty()) {
            String oldMediaUrl = post.getMediaUrl();

            if (request.getMediaFile().getContentType().equals("image/jpeg")
                    || request.getMediaFile().getContentType().equals("image/png")) {
                String imageUrl = fileStorageService.saveFile(request.getMediaFile());
                post.setMediaUrl(imageUrl);
                post.setMediaType("IMAGE");
            } else if (request.getMediaFile().getContentType().equals("video/mp4")) {
                String videoUrl = fileStorageService.saveFile(request.getMediaFile());
                post.setMediaUrl(videoUrl);
                post.setMediaType("VIDEO");
            }

            if (!java.util.Objects.equals(oldMediaUrl, post.getMediaUrl())) {
                fileStorageService.deleteFile(oldMediaUrl);
            }
        }

        return postRepository.save(post);
    }

    public void deletePost(Long id, Long userId) {
        Post post = getPostById(id);

        if (!post.getUserId().equals(userId)) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "You are not the owner of this post.");
        }
        postRepository.delete(post);
    }

    public List<FeedPostResponse> getFeedPosts(Long currentUserId, int page, int size) {
        // System.out.println("befooooooooore");
        int safePage = Math.max(page, 0);
        int safeSize = Math.max(1, Math.min(size, 50));
        List<Post> posts = postRepository.getFeedPosts(currentUserId, PageRequest.of(safePage, safeSize));
        // System.out.println("afteeeeeeeeeer");
        // System.out.println("afteeeeeeeeeer :::");
        // System.out.println(posts);
        return posts.stream()
                .map(post -> mapToFeedResponse(post, currentUserId))
                .toList();
    }

    public List<FeedPostResponse> getExplorePosts(Long currentUserId, int page, int size) {
        int safePage = Math.max(page, 0);
        int safeSize = Math.max(1, Math.min(size, 50));

        return postRepository.getExplorePosts(currentUserId, PageRequest.of(safePage, safeSize)).stream()
                .map(post -> mapToFeedResponse(post, currentUserId))
                .toList();
    }

    public List<FeedPostResponse> getPostsByUser(Long userId, Long currentUserId) {
        if (!userRepository.existsById(userId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "User does not exist: " + userId);
        }

        return postRepository.findAllByUserIdAndIsHiddenFalseOrderByCreatedAtDesc(userId).stream()
                .map(post -> mapToFeedResponse(post, currentUserId))
                .toList();
    }

    public long countPostsByUser(Long userId) {
        return postRepository.countByUserIdAndIsHiddenFalse(userId);
    }

    @Transactional
    public PostLikeResponse toggleLike(Long postId, Long userId) {
        getPostById(postId);

        boolean likedByCurrentUser;
        if (postLikeRepository.existsByPostIdAndUserId(postId, userId)) {
            postLikeRepository.deleteByPostIdAndUserId(postId, userId);
            likedByCurrentUser = false;
        } else {
            PostLike postLike = new PostLike();
            postLike.setPostId(postId);
            postLike.setUserId(userId);
            postLikeRepository.save(postLike);
            likedByCurrentUser = true;
        }

        return new PostLikeResponse(
                postId,
                postLikeRepository.countByPostId(postId),
                likedByCurrentUser
        );
    }

    public List<CommentResponse> getComments(Long postId) {
        getPostById(postId);
        return postCommentRepository.findAllByPostIdOrderByCreatedAtAsc(postId).stream()
                .map(this::mapToCommentResponse)
                .toList();
    }

    public CommentResponse addComment(Long postId, CreateCommentRequest request, Long userId) {
        getPostById(postId);

        PostComment comment = new PostComment();
        comment.setPostId(postId);
        comment.setUserId(userId);
        comment.setContent(request.getContent().trim());

        return mapToCommentResponse(postCommentRepository.save(comment));
    }

    private FeedPostResponse mapToFeedResponse(Post post, Long currentUserId) {
            FeedPostResponse response = new FeedPostResponse();
            response.setPostId(post.getId());
            response.setDescription(post.getDescription());
            response.setMediaUrl(post.getMediaUrl());
            response.setCreatedAt(post.getCreatedAt());
            response.setTitle(post.getTitle());
            User user = userRepository.findById(post.getUserId())
                        .orElseThrow();
            UserSummaryResponse author = new UserSummaryResponse();
            author.setId(user.getId());
            author.setUsername(user.getUsername());
            author.setProfilePicture(user.getAvatarUrl());
            response.setAuthor(author);
            response.setLikeCount(postLikeRepository.countByPostId(post.getId()));
            response.setLikedByCurrentUser(postLikeRepository.existsByPostIdAndUserId(post.getId(), currentUserId));
            response.setCommentCount(postCommentRepository.countByPostId(post.getId()));
            response.setComments(new String[0]);
            return response;
        }

    private CommentResponse mapToCommentResponse(PostComment comment) {
        User user = userRepository.findById(comment.getUserId())
                .orElseThrow();

        UserSummaryResponse author = new UserSummaryResponse();
        author.setId(user.getId());
        author.setUsername(user.getUsername());
        author.setProfilePicture(user.getAvatarUrl());

        CommentResponse response = new CommentResponse();
        response.setCommentId(comment.getId());
        response.setPostId(comment.getPostId());
        response.setContent(comment.getContent());
        response.setCreatedAt(comment.getCreatedAt());
        response.setAuthor(author);
        return response;
    }
}
