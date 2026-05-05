package com.ussra._blog.posts.repository;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import com.ussra._blog.posts.entity.*;
import org.springframework.stereotype.Repository;
// import java.util.Optional;

@Repository
public interface PostRepository extends JpaRepository<Post, Long>{
    Optional<Post> getPostById(Long id);
}
