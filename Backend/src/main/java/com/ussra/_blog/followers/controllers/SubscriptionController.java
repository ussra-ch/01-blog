package com.ussra._blog.followers.controllers;

import com.ussra._blog.posts.dto.CreatePostRequest;
import com.ussra._blog.posts.services.PostService;

import java.util.concurrent.Flow.Subscription;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.security.core.annotation.AuthenticationPrincipal;

import com.ussra._blog.User.UserPrincipal;
import com.ussra._blog.followers.services.SubscriptionService;

import lombok.RequiredArgsConstructor;





@RestController
@RequiredArgsConstructor
@RequestMapping("/api/subscriptions")
public class SubscriptionController {
    private final SubscriptionService subscriptionService;

    @PostMapping("/{followingId}")
    public ResponseEntity<Void> follow(@AuthenticationPrincipal UserPrincipal currentUser, @PathVariable Long followingId){
        subscriptionService.follow(currentUser.getUser().getId(), followingId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{followingId}")
    public ResponseEntity<Void> delete(@AuthenticationPrincipal UserPrincipal currentUser, @PathVariable Long followingId){
        subscriptionService.unfollow(currentUser.getUser().getId(), followingId);
        return ResponseEntity.noContent().build();
    }
}
