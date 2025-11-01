package com.vulnerable.vulnerableapp.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TestResponse {
    private Long id;
    private String title;
    private String description;
    private String questionsJson;
    private Integer timeLimitMinutes;
    private Long ownerId;
    private String ownerEmail;
    private String category;
    private String emoji;
}
