package com.ussra._blog.notifications;

import com.ussra._blog.User.User;
import com.ussra._blog.User.UserRepository;
import com.ussra._blog.followers.entity.Subscription;
import com.ussra._blog.followers.repository.SubscriptionRepository;
import com.ussra._blog.posts.entity.Post;
import com.ussra._blog.posts.repository.PostRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;

@Service
@RequiredArgsConstructor
public class NotificationService {
    private static final long SSE_TIMEOUT = 30L * 60L * 1000L;

    private final NotificationRepository notificationRepository;
    private final SubscriptionRepository subscriptionRepository;
    private final UserRepository userRepository;
    private final PostRepository postRepository;
    private final Map<Long, List<SseEmitter>> emitters = new ConcurrentHashMap<>();

    public List<NotificationResponse> getNotifications(Long userId) {
        return notificationRepository.findAllByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(this::mapToResponse)
                .toList();
    }

    public long countUnread(Long userId) {
        return notificationRepository.countByUserIdAndReadFalse(userId);
    }

    public NotificationResponse markReadState(Long notificationId, Long userId, boolean read) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Notification not found"));

        if (!notification.getUserId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You cannot update this notification");
        }

        notification.setRead(read);
        NotificationResponse response = mapToResponse(notificationRepository.save(notification));
        sendUnreadCount(userId);
        return response;
    }

    public void markAllAsRead(Long userId) {
        List<Notification> notifications = notificationRepository.findAllByUserIdOrderByCreatedAtDesc(userId);
        notifications.forEach(notification -> notification.setRead(true));
        notificationRepository.saveAll(notifications);
        sendUnreadCount(userId);
    }

    public SseEmitter subscribe(Long userId) {
        SseEmitter emitter = new SseEmitter(SSE_TIMEOUT);
        emitters.computeIfAbsent(userId, id -> new CopyOnWriteArrayList<>()).add(emitter);

        emitter.onCompletion(() -> removeEmitter(userId, emitter));
        emitter.onTimeout(() -> removeEmitter(userId, emitter));
        emitter.onError(error -> removeEmitter(userId, emitter));

        try {
            emitter.send(SseEmitter.event()
                    .name("unread-count")
                    .data(countUnread(userId)));
        } catch (IOException exception) {
            removeEmitter(userId, emitter);
        }

        return emitter;
    }

    public void notifySubscribersAboutNewPost(Post post) {
        User author = userRepository.findById(post.getUserId()).orElseThrow();
        List<Subscription> subscriptions = subscriptionRepository.findAllByFollowingId(author.getId());

        for (Subscription subscription : subscriptions) {
            Notification notification = new Notification();
            notification.setUserId(subscription.getFollowerId());
            notification.setType("NEW_POST");
            notification.setMessage(author.getUsername() + " published a new post: " + post.getTitle());
            notification.setActorUserId(author.getId());
            notification.setRelatedPostId(post.getId());

            Notification saved = notificationRepository.save(notification);
            NotificationResponse response = mapToResponse(saved);
            sendNotification(subscription.getFollowerId(), response);
            sendUnreadCount(subscription.getFollowerId());
        }
    }

    public void notifyUserAboutNewFollower(Long followerId, Long followingId) {
        User follower = userRepository.findById(followerId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Follower not found"));

        Notification notification = new Notification();
        notification.setUserId(followingId);
        notification.setType("NEW_FOLLOW");
        notification.setMessage(follower.getUsername() + " started following you");
        notification.setActorUserId(follower.getId());

        Notification saved = notificationRepository.save(notification);
        NotificationResponse response = mapToResponse(saved);
        sendNotification(followingId, response);
        sendUnreadCount(followingId);
    }

    private NotificationResponse mapToResponse(Notification notification) {
        NotificationResponse response = new NotificationResponse();
        response.setId(notification.getId());
        response.setType(notification.getType());
        response.setMessage(notification.getMessage());
        response.setRead(notification.isRead());
        response.setRelatedPostId(notification.getRelatedPostId());
        response.setCreatedAt(notification.getCreatedAt());

        if (notification.getActorUserId() != null) {
            userRepository.findById(notification.getActorUserId())
                    .ifPresent(actor -> {
                        response.setActorId(actor.getId());
                        response.setActorUsername(actor.getUsername());
                        response.setActorAvatarUrl(actor.getAvatarUrl());
                    });
        } else if (notification.getRelatedPostId() != null) {
            postRepository.findById(notification.getRelatedPostId())
                    .flatMap(post -> userRepository.findById(post.getUserId()))
                    .ifPresent(author -> {
                        response.setActorId(author.getId());
                        response.setActorUsername(author.getUsername());
                        response.setActorAvatarUrl(author.getAvatarUrl());
                    });
        }

        return response;
    }

    private void sendNotification(Long userId, NotificationResponse notification) {
        sendEvent(userId, "notification", notification);
    }

    private void sendUnreadCount(Long userId) {
        sendEvent(userId, "unread-count", countUnread(userId));
    }

    private void sendEvent(Long userId, String eventName, Object data) {
        List<SseEmitter> userEmitters = emitters.get(userId);
        if (userEmitters == null) {
            return;
        }

        for (SseEmitter emitter : userEmitters) {
            try {
                emitter.send(SseEmitter.event().name(eventName).data(data));
            } catch (IOException exception) {
                removeEmitter(userId, emitter);
            }
        }
    }

    private void removeEmitter(Long userId, SseEmitter emitter) {
        List<SseEmitter> userEmitters = emitters.get(userId);
        if (userEmitters != null) {
            userEmitters.remove(emitter);
        }
    }
}
