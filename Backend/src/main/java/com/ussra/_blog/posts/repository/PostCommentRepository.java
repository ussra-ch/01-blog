package com.ussra._blog.posts.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.ussra._blog.posts.entity.PostComment;

@Repository
public interface PostCommentRepository extends JpaRepository<PostComment, Long> {
    List<PostComment> findAllByPostIdOrderByCreatedAtAsc(Long postId);
    int countByPostId(Long postId);

    @Query("""
        SELECT c.postId AS postId, COUNT(c.id) AS total
        FROM PostComment c
        WHERE c.postId IN :postIds
        GROUP BY c.postId
    """)
    List<PostCountView> countByPostIds(@Param("postIds") List<Long> postIds);

    interface PostCountView {
        Long getPostId();
        long getTotal();
    }
}
