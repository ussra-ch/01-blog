import java.time.LocalDateTime;

import org.springframework.security.core.userdetails.UserDetails;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.persistence.Id;

@Entity
@Table(name = "users")
public class User{
    
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