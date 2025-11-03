package com.vulnerable.vulnerableapp.seeder;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.vulnerable.vulnerableapp.entity.AppUser;
import com.vulnerable.vulnerableapp.entity.TestEntity;
import com.vulnerable.vulnerableapp.utils.UserRoles;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.*;

/**
 * Utilidades para crear datos de prueba de manera flexible
 */
@Slf4j
public class SeederUtils {

    private static final ObjectMapper objectMapper = new ObjectMapper();

    /**
     * Crea un usuario de prueba
     */
    public static AppUser createUser(String email, String name, String password, 
                                     Integer role, PasswordEncoder encoder) {
        return AppUser.builder()
                .email(email)
                .name(name)
                .passwordHash(encoder.encode(password))
                .role(role)
                .build();
    }

    /**
     * Crea un test con preguntas de opción múltiple
     */
    public static TestEntity createTest(String title, String topic, String emoji,
                                        String description, List<Question> questions,
                                        Integer timeLimitMinutes, AppUser owner,
                                        Boolean isPublic) {
        try {
            List<Map<String, Object>> questionsList = new ArrayList<>();
            for (Question q : questions) {
                Map<String, Object> qMap = new LinkedHashMap<>();
                qMap.put("question", q.getQuestion());
                qMap.put("options", q.getOptions());
                qMap.put("correctAnswer", q.getCorrectAnswer());
                questionsList.add(qMap);
            }
            
            String questionsJson = objectMapper.writeValueAsString(questionsList);
            
            return TestEntity.builder()
                    .title(title)
                    .topic(topic)
                    .emoji(emoji)
                    .description(description)
                    .questionsJson(questionsJson)
                    .timeLimitMinutes(timeLimitMinutes)
                    .owner(owner)
                    .isPublic(isPublic)
                    .build();
        } catch (Exception e) {
            log.error("Error creando test: {}", title, e);
            return null;
        }
    }

    /**
     * Clase auxiliar para representar una pregunta
     */
    public static class Question {
        private String question;
        private List<String> options;
        private Integer correctAnswer;

        public Question(String question, List<String> options, Integer correctAnswer) {
            this.question = question;
            this.options = options;
            this.correctAnswer = correctAnswer;
        }

        public String getQuestion() { return question; }
        public List<String> getOptions() { return options; }
        public Integer getCorrectAnswer() { return correctAnswer; }
    }
}
