package com.vulnerable.vulnerableapp.dto.tests;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TestRequest {
    
    @NotBlank(message = "Title is required")
    private String title;
    
    private String topic;
    private String emoji;
    private String description;
    private String questionsJson;
    private Integer timeLimit;
    
}
