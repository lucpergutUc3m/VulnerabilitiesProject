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
public class QuestionResponse {
    private Integer id;
    private String question;
    private List<String> options;
    private Integer correctAnswer;
    private String explanation;
}
