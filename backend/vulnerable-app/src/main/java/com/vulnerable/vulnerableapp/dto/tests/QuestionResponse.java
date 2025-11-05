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
public class QuestionResponse {
    private Integer id;
    private String question;
    private List<String> options;
    private Integer correctAnswer;
    private String explanation;
}
