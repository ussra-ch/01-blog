package com.ussra._blog.posts.services;

import java.io.IOException;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.ussra._blog.Authentication.FileStorageService;
import com.ussra._blog.posts.dto.CreatePostRequest;
import com.ussra._blog.posts.dto.UpdatePostRequest;
import com.ussra._blog.posts.entity.Post;
import com.ussra._blog.posts.repository.*;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PostService {
    private final PostRepository postRepository;
    private final FileStorageService fileStorageService;

    public Post getPostById(Long id) {
        return postRepository.getPostById(id)
                .orElseThrow(() -> new RuntimeException("Post id does not exist" + id));
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
        return postRepository.save(post);
    }

    public void deletePost(Long id, Long userId){
        Post post = getPostById(id);

        if (!post.getUserId().equals(userId)){
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "You are not the owner of this post.");
        }
        postRepository.delete(post);
    }


}