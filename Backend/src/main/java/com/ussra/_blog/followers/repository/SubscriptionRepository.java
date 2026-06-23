package com.ussra._blog.followers.repository;

import java.util.Optional;
import java.util.List;
import com.ussra._blog.followers.entity.*;
import org.springframework.data.jpa.repository.JpaRepository;


import org.springframework.stereotype.Repository;

@Repository
public interface SubscriptionRepository extends JpaRepository<Subscription, Long> {
    Optional<Subscription> findByFollowerIdAndFollowingId(Long followerId, Long followingId); 
    List<Subscription> findAllByFollowerId(Long followerId);
    List<Subscription> findAllByFollowingId(Long followingId);
    boolean existsByFollowerIdAndFollowingId(Long followerId, Long followingId);
    long countByFollowerId(Long followerId);
    long countByFollowingId(Long followingId);
    void deleteByFollowerIdAndFollowingId(Long followerId, Long followingId);
}
