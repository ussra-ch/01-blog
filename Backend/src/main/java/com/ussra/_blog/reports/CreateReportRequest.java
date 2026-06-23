package com.ussra._blog.reports;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreateReportRequest {
    private Long userId;
    private Long postId;

    @NotBlank
    @Size(max = 1000)
    private String reason;
}
