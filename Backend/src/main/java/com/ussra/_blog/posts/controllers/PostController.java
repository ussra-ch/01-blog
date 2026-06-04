package com.ussra._blog.posts.controllers;

import java.io.IOException;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.ussra._blog.posts.dto.CreatePostRequest;
import com.ussra._blog.posts.dto.FeedPostResponse;
import com.ussra._blog.posts.dto.UpdatePostRequest;
import com.ussra._blog.posts.entity.Post;
import com.ussra._blog.posts.services.PostService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.security.core.annotation.AuthenticationPrincipal;

import com.ussra._blog.User.*;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import java.util.List;
// import org.springframework.web.bind.annotation.RequestBody;


@RestController
@RequestMapping("/api/posts")
@RequiredArgsConstructor
public class PostController {
    private final PostService postService;

    @GetMapping("/feed")
    public ResponseEntity<List<FeedPostResponse>> getFeed(@AuthenticationPrincipal UserPrincipal currentUser) {
        // User user = (User) authentication.getPrincipal();
        // System.out.println("-----------------------------------------------------");
        // System.out.println(currentUser.getUser());
        return ResponseEntity.ok(
                postService.getFeedPosts(currentUser.getUser().getId())
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<Post> getPostById(@PathVariable Long id) {
        Post post = postService.getPostById(id);
        return ResponseEntity.ok(post);
    }

    @PostMapping
    public ResponseEntity<Post> createPost(@ModelAttribute CreatePostRequest request, @AuthenticationPrincipal UserPrincipal currentUser) throws IOException {
        Post post = postService.createPost(request, currentUser.getUser().getId());
        return ResponseEntity.ok(post);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Post> updatePost(@PathVariable Long id, @ModelAttribute UpdatePostRequest request, @AuthenticationPrincipal UserPrincipal currentUser) throws IOException{
        return ResponseEntity.ok(postService.updatePost(id, request, currentUser.getUser().getId()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePost(@PathVariable Long id, @AuthenticationPrincipal UserPrincipal currentUSer){
        postService.deletePost(id, currentUSer.getUser().getId());
        return ResponseEntity.noContent().build();
    }
}
