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
    List<Post> findAllByUserIdAndIsHiddenFalseOrderByCreatedAtDesc(Long userId);
    long countByUserIdAndIsHiddenFalse(Long userId);

    @Query("""
        SELECT p
        FROM Post p
        WHERE p.isHidden = false
        AND (p.userId IN (
            SELECT s.followingId
            FROM Subscription s
            WHERE s.followerId = :userId
        )
        OR p.userId = :userId)
        ORDER BY p.createdAt DESC
    """)
    List<Post> getFeedPosts(Long userId, Pageable pageable);

    @Query("""
        SELECT p
        FROM Post p, User u
        WHERE p.userId = u.id
        AND p.isHidden = false
        AND u.isBanned = false
        AND p.userId <> :userId
        AND p.userId NOT IN (
            SELECT s.followingId
            FROM Subscription s
            WHERE s.followerId = :userId
        )
        ORDER BY p.createdAt DESC
    """)
    List<Post> getExplorePosts(Long userId, Pageable pageable);

    @Query("""
        SELECT p
        FROM Post p, User u
        WHERE p.userId = u.id
        AND p.isHidden = false
        AND u.isBanned = false
        AND (
            LOWER(p.title) LIKE LOWER(CONCAT('%', :query, '%'))
            OR LOWER(COALESCE(p.description, '')) LIKE LOWER(CONCAT('%', :query, '%'))
        )
        ORDER BY p.createdAt DESC
    """)
    List<Post> searchPosts(String query, Pageable pageable);
}
