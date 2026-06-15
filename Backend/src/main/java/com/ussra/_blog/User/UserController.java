package com.ussra._blog.User;

import java.io.IOException;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.ussra._blog.posts.dto.FeedPostResponse;
import com.ussra._blog.posts.services.PostService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {
    private final UserService userService;
    private final PostService postService;

    @GetMapping("/suggestions")
    public ResponseEntity<List<SuggestedUserResponse>> getSuggestions(
            @AuthenticationPrincipal UserPrincipal currentUser) {
        return ResponseEntity.ok(userService.getSuggestions(currentUser.getUser().getId()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserProfileResponse> getProfile(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        return ResponseEntity.ok(userService.getProfile(id, currentUser.getUser().getId()));
    }

    @GetMapping("/{id}/posts")
    public ResponseEntity<List<FeedPostResponse>> getUserPosts(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        return ResponseEntity.ok(postService.getPostsByUser(id, currentUser.getUser().getId()));
    }

    @PutMapping("/me/avatar")
    public ResponseEntity<UserProfileResponse> updateAvatar(
            @RequestParam("avatar") MultipartFile avatar,
            @AuthenticationPrincipal UserPrincipal currentUser) throws IOException {
        return ResponseEntity.ok(userService.updateAvatar(currentUser.getUser().getId(), avatar));
    }
}
