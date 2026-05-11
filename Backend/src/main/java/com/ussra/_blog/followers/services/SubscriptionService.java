package com.ussra._blog.followers.services;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.ussra._blog.followers.entity.*;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;
import jakarta.transaction.Transactional;

import com.ussra._blog.followers.repository.SubscriptionRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class SubscriptionService {
    private final SubscriptionRepository subscriptionRepository;

    public void follow(Long followerId, Long followingId) {
        boolean alreadyFollowing = subscriptionRepository
                .findByFollowerIdAndFollowingId(followerId, followingId)
                .isPresent();

        if (alreadyFollowing) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "You are already following this user.");
        }
        Subscription subscription = new Subscription();
        subscription.setFollowerId(followerId);
        subscription.setFollowingId(followingId);
        subscriptionRepository.save(subscription);
    }

    @Transactional
    public void unfollow(Long followerId, Long followingId) {
        Subscription subscription = subscriptionRepository
                .findByFollowerIdAndFollowingId(followerId, followingId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "You are not following this user."));

        subscriptionRepository.deleteByFollowerIdAndFollowingId(followerId, followingId);
    }

    public List<Long> getFollowedUsers(Long userId) {
        List<Subscription> list = subscriptionRepository.findAllByFollowerId(userId);
        return list.stream()
                .map(Subscription::getFollowingId)
                .collect(Collectors.toList());
    }
}
