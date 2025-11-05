package com.vulnerable.vulnerableapp.dto.tests;

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
    private String topic;
    private String emoji;
    private String description;
    private List<QuestionResponse> questions;
    private Integer timeLimit;
    private String createdBy;
    private Boolean isPublic;
}
