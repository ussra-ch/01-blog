package com.ussra._blog.posts.repository;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.domain.Pageable;

import com.ussra._blog.posts.entity.*;
import org.springframework.stereotype.Repository;
import java.util.List;
// import java.util.Optional;

@Repository
public interface PostRepository extends JpaRepository<Post, Long>{
    Optional<Post> getPostById(Long id);
    List<Post> findAllByUserIdOrderByCreatedAtDesc(Long userId);
    long countByUserId(Long userId);

    @Query("""
        SELECT p
        FROM Post p
        WHERE p.userId IN (
            SELECT s.followingId
            FROM Subscription s
            WHERE s.followerId = :userId
        )
        OR p.userId = :userId
        ORDER BY p.createdAt DESC
    """)
    List<Post> getFeedPosts(Long userId, Pageable pageable);
}
