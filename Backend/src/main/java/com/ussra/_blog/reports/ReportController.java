package com.ussra._blog.reports;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.bind.annotation.ResponseStatus;

import com.ussra._blog.User.UserPrincipal;
import com.ussra._blog.User.UserRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportController {
    private final ReportRepository reportRepository;
    private final UserRepository userRepository;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public void createReport(
            @Valid @RequestBody CreateReportRequest request,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        Long reporterId = currentUser.getUser().getId();
        Long reportedUserId = request.getUserId();

        if (reportedUserId == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Choose a profile to report.");
        }
        if (reportedUserId.equals(reporterId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "You cannot report yourself.");
        }
        if (!userRepository.existsById(reportedUserId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "User does not exist.");
        }
        if (reportRepository.existsByReporterIdAndReportedUserId(reporterId, reportedUserId)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "You already reported this profile.");
        }

        Report report = new Report();
        report.setReporterId(reporterId);
        report.setReportedUserId(reportedUserId);
        report.setReason(request.getReason().trim());
        reportRepository.save(report);
    }
}
