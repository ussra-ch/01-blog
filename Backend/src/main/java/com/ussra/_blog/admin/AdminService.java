package com.ussra._blog.admin;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.ussra._blog.User.User;
import com.ussra._blog.User.UserRepository;
import com.ussra._blog.posts.entity.Post;
import com.ussra._blog.posts.repository.PostRepository;
import com.ussra._blog.reports.Report;
import com.ussra._blog.reports.ReportRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AdminService {
    private final UserRepository userRepository;
    private final PostRepository postRepository;
    private final ReportRepository reportRepository;

    public List<AdminUserResponse> getUsers() {
        return userRepository.findAll().stream().map(this::mapUser).toList();
    }

    public List<AdminPostResponse> getPosts() {
        return postRepository.findAll().stream()
                .sorted((left, right) -> right.getCreatedAt().compareTo(left.getCreatedAt()))
                .map(this::mapPost)
                .toList();
    }

    public List<AdminReportResponse> getReports() {
        return reportRepository.findAllByOrderByCreatedAtDesc().stream().map(this::mapReport).toList();
    }

    public AdminUserResponse setBanned(Long userId, boolean banned) {
        User user = getManageableUser(userId);
        user.setBanned(banned);
        return mapUser(userRepository.save(user));
    }

    @Transactional
    public void deleteUser(Long userId) {
        userRepository.delete(getManageableUser(userId));
    }

    public AdminPostResponse setPostHidden(Long postId, boolean hidden) {
        Post post = getPost(postId);
        post.setHidden(hidden);
        return mapPost(postRepository.save(post));
    }

    public void deletePost(Long postId) {
        postRepository.delete(getPost(postId));
    }

    public void deleteReport(Long reportId) {
        Report report = reportRepository.findById(reportId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Report does not exist."));
        reportRepository.delete(report);
    }

    private User getManageableUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User does not exist."));
        if ("ADMIN".equals(user.getRole())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Admin accounts cannot be moderated here.");
        }
        return user;
    }

    private Post getPost(Long postId) {
        return postRepository.findById(postId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Post does not exist."));
    }

    private AdminUserResponse mapUser(User user) {
        return new AdminUserResponse(user.getId(), user.getUsername(), user.getEmail(), user.getRole(),
                user.isBanned(), user.getAvatarUrl(), user.getCreatedAt());
    }

    private AdminPostResponse mapPost(Post post) {
        String author = userRepository.findById(post.getUserId()).map(User::getUsername).orElse("Deleted user");
        return new AdminPostResponse(post.getId(), post.getUserId(), author, post.getTitle(), post.getDescription(),
                post.getMediaUrl(), post.isHidden(), post.getCreatedAt());
    }

    private AdminReportResponse mapReport(Report report) {
        String reporter = userRepository.findById(report.getReporterId()).map(User::getUsername).orElse("Deleted user");
        String reportedUser = report.getReportedUserId() == null ? null
                : userRepository.findById(report.getReportedUserId()).map(User::getUsername).orElse("Deleted user");
        return new AdminReportResponse(report.getId(), report.getReporterId(), reporter, report.getReportedUserId(),
                reportedUser, report.getReason(), report.getCreatedAt());
    }
}
