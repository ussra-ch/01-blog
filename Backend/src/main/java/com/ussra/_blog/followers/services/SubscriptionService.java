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
import com.ussra._blog.User.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class SubscriptionService {
    private final SubscriptionRepository subscriptionRepository;
    private final UserRepository userRepository;

    public void follow(Long followerId, Long followingId) {
        if (followerId.equals(followingId)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "You cannot follow yourself.");
        }

        if (!userRepository.existsById(followingId)) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "User does not exist: " + followingId);
        }

        boolean alreadyFollowing = subscriptionRepository
                .existsByFollowerIdAndFollowingId(followerId, followingId);

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

    public boolean isFollowing(Long followerId, Long followingId) {
        return subscriptionRepository.existsByFollowerIdAndFollowingId(followerId, followingId);
    }

    public long countFollowers(Long userId) {
        return subscriptionRepository.countByFollowingId(userId);
    }

    public long countFollowing(Long userId) {
        return subscriptionRepository.countByFollowerId(userId);
    }
}
