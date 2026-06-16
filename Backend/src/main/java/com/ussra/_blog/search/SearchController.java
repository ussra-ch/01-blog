package com.ussra._blog.search;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.ussra._blog.User.UserPrincipal;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/search")
@RequiredArgsConstructor
public class SearchController {
    private final SearchService searchService;

    @GetMapping
    public SearchResponse search(
            @RequestParam(defaultValue = "") String q,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        return searchService.search(q, currentUser.getUser().getId());
    }
}
