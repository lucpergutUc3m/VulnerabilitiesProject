package com.vulnerable.vulnerableapp.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RateTestResponse {
    private Long testId;
    private String testTitle;
    private Integer userRating;
    private Double averageRating;
    private Integer totalRatings;
    private String message;
    private Boolean success;
}
