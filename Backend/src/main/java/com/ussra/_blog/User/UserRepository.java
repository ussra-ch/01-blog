package com.ussra._blog.User;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
    Optional<User> findByEmail(String email);

    @Query("""
        SELECT u
        FROM User u
        WHERE u.isBanned = false
        AND (
            LOWER(u.username) LIKE LOWER(CONCAT('%', :query, '%'))
            OR LOWER(COALESCE(u.bio, '')) LIKE LOWER(CONCAT('%', :query, '%'))
        )
        ORDER BY u.username ASC
    """)
    List<User> searchUsers(String query, Pageable pageable);
}
