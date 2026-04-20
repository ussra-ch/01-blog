package com.ussra._blog.model;
import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;
import jakarta.persistence.Id;

@Getter
@Setter
@Entity
@Table(name = "users")
public class User {

    @Id
    private Long id;
    private String username;
    private String email;
    private String password;
    private String role;
    @Column(name = "is_banned")
    private boolean isBanned;
    private String bio;
    @Column(name = "created_at")
    private LocalDateTime createdAt;
}