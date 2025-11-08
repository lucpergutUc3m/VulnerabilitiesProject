package com.vulnerable.vulnerableapp.dto.tests;

import edu.umd.cs.findbugs.annotations.SuppressFBWarnings;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@SuppressFBWarnings(value = {"EI_EXPOSE_REP", "EI_EXPOSE_REP2"}, justification = "DTO with immutable fields - builder pattern is safe for data transfer objects")
public class TestResponse {
    private Long id;
    private String title;
    private String topic;
    private String emoji;
    private String description;
    private List<QuestionResponse> questions;
    private Integer timeLimit;
    private String createdBy;
    private Boolean isPublic;
    private Double averageRating;
    private Integer ratingCount;
    private Integer userRating; // Current user's rating (null if not rated, most recent if TOCTOU created duplicates)
}
