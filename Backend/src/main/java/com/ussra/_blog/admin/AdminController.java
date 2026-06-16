package com.ussra._blog.admin;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {
    private final AdminService adminService;

    @GetMapping("/users")
    public List<AdminUserResponse> getUsers() {
        return adminService.getUsers();
    }

    @PutMapping("/users/{id}/ban")
    public AdminUserResponse setBanned(@PathVariable Long id, @RequestParam boolean banned) {
        return adminService.setBanned(id, banned);
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        adminService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/posts")
    public List<AdminPostResponse> getPosts() {
        return adminService.getPosts();
    }

    @PutMapping("/posts/{id}/hide")
    public AdminPostResponse setPostHidden(@PathVariable Long id, @RequestParam boolean hidden) {
        return adminService.setPostHidden(id, hidden);
    }

    @DeleteMapping("/posts/{id}")
    public ResponseEntity<Void> deletePost(@PathVariable Long id) {
        adminService.deletePost(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/reports")
    public List<AdminReportResponse> getReports() {
        return adminService.getReports();
    }

    @DeleteMapping("/reports/{id}")
    public ResponseEntity<Void> deleteReport(@PathVariable Long id) {
        adminService.deleteReport(id);
        return ResponseEntity.noContent().build();
    }
}
