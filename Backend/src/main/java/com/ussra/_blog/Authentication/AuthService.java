package com.ussra._blog.Authentication;

import com.ussra._blog.User.User;
import com.ussra._blog.User.UserPrincipal;
import com.ussra._blog.User.UserRepository;

import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.io.IOException;

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
            String avatarUrl = fileStorageService.saveFile(request.getAvatar());
            user.setAvatarUrl(avatarUrl);
        }
        userRepository.save(user);
        User savedUser = userRepository.findByUsername(request.getUsername()).orElseThrow();

        UserPrincipal userPrincipal = new UserPrincipal(user);
        String token = jwtService.generateToken(userPrincipal);
        return new AuthResponse(token, jwtService.getJwtExpiration());
    }

    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword()));
        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow();
        UserPrincipal userPrincipal = new UserPrincipal(user);
        String token = jwtService.generateToken(userPrincipal);
        return new AuthResponse(token, jwtService.getJwtExpiration());
    }
}