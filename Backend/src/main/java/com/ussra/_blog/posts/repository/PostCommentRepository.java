package com.ussra._blog.posts.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.ussra._blog.posts.entity.PostComment;

@Repository
public interface PostCommentRepository extends JpaRepository<PostComment, Long> {
    List<PostComment> findAllByPostIdOrderByCreatedAtAsc(Long postId);
    int countByPostId(Long postId);
}
