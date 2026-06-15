package com.ussra._blog.User;

import java.io.IOException;
import java.util.List;
import java.util.Set;

import javax.imageio.ImageIO;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import com.ussra._blog.Authentication.FileStorageService;
import com.ussra._blog.followers.services.SubscriptionService;
import com.ussra._blog.posts.services.PostService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserService {
    private final UserRepository userRepository;
    private final SubscriptionService subscriptionService;
    private final PostService postService;
    private final FileStorageService fileStorageService;

    private static final Set<String> ALLOWED_AVATAR_TYPES = Set.of("image/jpeg", "image/png");
    private static final long MAX_AVATAR_SIZE = 5 * 1024 * 1024;

    public UserProfileResponse getProfile(Long userId, Long currentUserId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "User does not exist: " + userId));

        return new UserProfileResponse(
                user.getId(),
                user.getUsername(),
                user.getBio(),
                user.getAvatarUrl(),
                user.getCreatedAt(),
                subscriptionService.countFollowers(userId),
                subscriptionService.countFollowing(userId),
                postService.countPostsByUser(userId),
                !userId.equals(currentUserId) && subscriptionService.isFollowing(currentUserId, userId),
                userId.equals(currentUserId));
    }

    public List<SuggestedUserResponse> getSuggestions(Long currentUserId) {
        Set<Long> excludedUserIds = Set.copyOf(subscriptionService.getFollowedUsers(currentUserId));

        return userRepository.findAll().stream()
                .filter(user -> !user.getId().equals(currentUserId))
                .filter(user -> !user.isBanned())
                .filter(user -> !excludedUserIds.contains(user.getId()))
                .limit(5)
                .map(user -> new SuggestedUserResponse(
                        user.getId(),
                        user.getUsername(),
                        user.getBio(),
                        user.getAvatarUrl(),
                        subscriptionService.countFollowers(user.getId())))
                .toList();
    }

    public UserProfileResponse updateAvatar(Long userId, MultipartFile avatar) throws IOException {
        if (avatar == null || avatar.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Please choose an image.");
        }

        if (!ALLOWED_AVATAR_TYPES.contains(avatar.getContentType())) {
            throw new ResponseStatusException(
                    HttpStatus.UNSUPPORTED_MEDIA_TYPE,
                    "Profile pictures must be JPEG or PNG images.");
        }

        if (avatar.getSize() > MAX_AVATAR_SIZE) {
            throw new ResponseStatusException(
                    HttpStatus.PAYLOAD_TOO_LARGE,
                    "Profile pictures must be smaller than 5 MB.");
        }

        if (ImageIO.read(avatar.getInputStream()) == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "The selected file is not a valid image.");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "User does not exist: " + userId));

        String previousAvatar = user.getAvatarUrl();
        String newAvatar = fileStorageService.saveFile(avatar);
        user.setAvatarUrl(newAvatar);
        userRepository.save(user);

        if (previousAvatar != null && !previousAvatar.equals(newAvatar)) {
            try {
                fileStorageService.deleteFile(previousAvatar);
            } catch (IOException exception) {
                log.warn("Could not delete previous avatar for user {}", userId, exception);
            }
        }

        return getProfile(userId, userId);
    }
}
