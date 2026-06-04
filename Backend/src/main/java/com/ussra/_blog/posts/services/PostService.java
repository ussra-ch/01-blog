package com.ussra._blog.posts.services;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.ussra._blog.Authentication.FileStorageService;
import com.ussra._blog.posts.dto.CreatePostRequest;
import com.ussra._blog.posts.dto.FeedPostResponse;
import com.ussra._blog.posts.dto.UpdatePostRequest;
import com.ussra._blog.posts.dto.UserSummaryResponse;
import com.ussra._blog.posts.entity.Post;
import com.ussra._blog.User.UserRepository;
import com.ussra._blog.posts.repository.*;
import lombok.RequiredArgsConstructor;
import java.nio.file.Path;
import java.util.List;
import com.ussra._blog.User.User;
@Service
@RequiredArgsConstructor
public class PostService {
    private final PostRepository postRepository;
    private final FileStorageService fileStorageService;
    private final UserRepository userRepository;

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
        return postRepository.save(post);
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
        if (request.getMediaFile() == null){
            // important condition to keep the logic working as it should be 
        }else if (request.getMediaFile() != null && !request.getMediaFile().isEmpty()) {
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
        } else if (request.getMediaFile().isEmpty()) {
            String oldImagePath = post.getMediaUrl();
            if (oldImagePath != null) {
            Path path = Paths.get(oldImagePath);
                try {
                    Files.deleteIfExists(path);
                } catch (IOException e) {
                    throw new RuntimeException(e);
                }
            }
            System.out.println("999999999999999999999999");
            post.setMediaUrl(null);
            post.setMediaType(null);
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

    public List<FeedPostResponse> getFeedPosts(Long currentUserId) {
        // System.out.println("befooooooooore");
        List<Post> posts = postRepository.getFeedPosts(currentUserId);
        // System.out.println("afteeeeeeeeeer");
        // System.out.println("afteeeeeeeeeer :::");
        // System.out.println(posts);
        return posts.stream()
                .map(post -> mapToFeedResponse(post, currentUserId))
                .toList();
    }
    private FeedPostResponse mapToFeedResponse(Post post, Long currentUserId) {
            FeedPostResponse response = new FeedPostResponse();
            response.setPostId(post.getId());
            response.setDescription(post.getDescription());
            response.setMediaUrl(post.getMediaUrl());
            response.setCreatedAt(post.getCreatedAt());
            response.setTitle(post.getTitle());
            // response.setLikeCount(post.getLikes().size());
            // response.setCommentCount(post.getComments().size());
            // response.setLikedByCurrentUser(
            //     post.getLikes()
            //         .stream()
            //         .anyMatch(like -> like.getUser().getId().equals(currentUserId))
            // );
            User user = userRepository.findById(post.getUserId())
                        .orElseThrow();

            UserSummaryResponse author = new UserSummaryResponse();
            author.setId(user.getId());
            author.setUsername(user.getUsername());
            // author.setProfilePicture(post.getAuthor(user.getProfilePicture()));
            response.setAuthor(author);
            // System.out.println("response size = " + response.size());
            // System.out.println("------------------------------");
            // System.out.println("response is : " +  response);
            return response;
        }
}