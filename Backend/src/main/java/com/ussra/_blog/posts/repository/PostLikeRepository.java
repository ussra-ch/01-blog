package com.ussra._blog.posts.repository;

import java.util.Optional;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.ussra._blog.posts.entity.PostLike;

@Repository
public interface PostLikeRepository extends JpaRepository<PostLike, Long> {
    Optional<PostLike> findByPostIdAndUserId(Long postId, Long userId);
    boolean existsByPostIdAndUserId(Long postId, Long userId);
    int countByPostId(Long postId);
    void deleteByPostIdAndUserId(Long postId, Long userId);

    @Query("""
        SELECT l.postId AS postId, COUNT(l.id) AS total
        FROM PostLike l
        WHERE l.postId IN :postIds
        GROUP BY l.postId
    """)
    List<PostCountView> countByPostIds(@Param("postIds") List<Long> postIds);

    @Query("""
        SELECT l.postId
        FROM PostLike l
        WHERE l.userId = :userId
        AND l.postId IN :postIds
    """)
    List<Long> findLikedPostIds(@Param("userId") Long userId, @Param("postIds") List<Long> postIds);

    interface PostCountView {
        Long getPostId();
        long getTotal();
    }
}
