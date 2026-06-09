package com.ussra._blog.Authentication;

import com.ussra._blog.User.User;
import com.ussra._blog.User.UserPrincipal;
import com.ussra._blog.User.UserRepository;
import com.ussra._blog.Authentication.AuthResponse;

import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.io.IOException;
import org.springframework.http.HttpHeaders;
// import com.example.demo.auth.AuthResponse;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final FileStorageService fileStorageService;

    public AuthResponse register(RegisterRequest request) throws IOException {

    User user = new User();
    user.setUsername(request.getUsername());
    user.setEmail(request.getEmail());
    user.setPassword(passwordEncoder.encode(request.getPassword()));
    user.setBio(request.getBio());
    user.setRole("USER");

    if (request.getAvatar() != null && !request.getAvatar().isEmpty()) {
        if ("image/jpeg".equals(request.getAvatar().getContentType())
                || "image/png".equals(request.getAvatar().getContentType())) {

            String avatarUrl = fileStorageService.saveFile(request.getAvatar());
            user.setAvatarUrl(avatarUrl);
        }
    }
    User savedUser = userRepository.save(user);

    UserPrincipal userPrincipal = new UserPrincipal(savedUser);
    String token = jwtService.generateToken(userPrincipal);

    return new AuthResponse(
            savedUser.getId(),
            token,
            jwtService.getJwtExpiration(),
            savedUser.getUsername(),
            savedUser.getRole()
    );
}
    public AuthResponse login(LoginRequest request) {

    authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(
                    request.getUsername(),
                    request.getPassword()
            )
    );

    User user = userRepository
            .findByUsername(request.getUsername())
            .orElseThrow();

    UserPrincipal userPrincipal = new UserPrincipal(user);
    String token = jwtService.generateToken(userPrincipal);

    return new AuthResponse(
            user.getId(),
            token,
            jwtService.getJwtExpiration(),
            user.getUsername(),
            user.getRole()
    );
}
}