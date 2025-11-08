package com.vulnerable.vulnerableapp.mapper;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.vulnerable.vulnerableapp.dto.tests.QuestionResponse;
import com.vulnerable.vulnerableapp.dto.tests.TestRequest;
import com.vulnerable.vulnerableapp.dto.tests.TestResponse;
import com.vulnerable.vulnerableapp.entity.AppUser;
import com.vulnerable.vulnerableapp.entity.TestEntity;
import com.vulnerable.vulnerableapp.repository.AppUserRepository;
import com.vulnerable.vulnerableapp.repository.TestRatingRepository;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingConstants;
import org.mapstruct.Named;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.ArrayList;
import java.util.List;

/**
 * MapStruct mapper for converting between TestEntity and DTOs
 */
@Mapper(componentModel = MappingConstants.ComponentModel.SPRING)
public abstract class TestMapper {
    
    @Autowired
    protected AppUserRepository appUserRepository;
    
    /**
     * Convert TestRequest DTO to TestEntity
     * @param request The test request DTO
     * @param owner The owner of the test
     * @return TestEntity
     */
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "ownerId", source = "owner.id")
    @Mapping(target = "title", source = "request.title")
    @Mapping(target = "topic", source = "request.topic")
    @Mapping(target = "emoji", source = "request.emoji")
    @Mapping(target = "description", source = "request.description")
    @Mapping(target = "questionsJson", source = "request.questionsJson")
    @Mapping(target = "timeLimitMinutes", source = "request.timeLimit")
    @Mapping(target = "isPublic", constant = "false")
    public abstract TestEntity toEntity(TestRequest request, AppUser owner);
    
    /**
     * Convert ownerId to owner's name
     */
    @Named("ownerIdToName")
    protected String ownerIdToName(Long ownerId) {
        if (ownerId == null) {
            return "Unknown";
        }
        return appUserRepository.findById(ownerId)
                .map(AppUser::getName)
                .orElse("Unknown");
    }
    
    @Autowired
    protected TestRatingRepository testRatingRepository;
    
    /**
     * Convert TestEntity to TestResponse DTO
     * @param test The test entity
     * @return TestResponse DTO
     */
    @Mapping(target = "timeLimit", source = "timeLimitMinutes")
    @Mapping(target = "createdBy", source = "ownerId", qualifiedByName = "ownerIdToName")
    @Mapping(target = "questions", source = "questionsJson", qualifiedByName = "jsonToQuestions")
    @Mapping(target = "averageRating", source = "test", qualifiedByName = "calculateAverageRating")
    @Mapping(target = "ratingCount", source = "test", qualifiedByName = "calculateRatingCount")
    @Mapping(target = "userRating", source = "test", qualifiedByName = "getUserRating")
    public abstract TestResponse toTestResponse(TestEntity test);
    
    /**
     * Calculate average rating for a test
     */
    @Named("calculateAverageRating")
    protected Double calculateAverageRating(TestEntity test) {
        List<com.vulnerable.vulnerableapp.entity.TestRating> ratings = testRatingRepository.findByTestId(test.getId());
        if (ratings.isEmpty()) {
            return 0.0;
        }
        double sum = ratings.stream().mapToInt(com.vulnerable.vulnerableapp.entity.TestRating::getRating).sum();
        return sum / ratings.size();
    }
    
    /**
     * Calculate rating count for a test
     */
    @Named("calculateRatingCount")
    protected Integer calculateRatingCount(TestEntity test) {
        return (int) testRatingRepository.countByTestId(test.getId());
    }
    
    /**
     * Get current user's rating for a test
     * Handles TOCTOU vulnerability by getting the most recent rating if multiple exist
     * Returns null if user hasn't rated the test
     */
    @Named("getUserRating")
    protected Integer getUserRating(TestEntity test) {
        try {
            // Get current authenticated user
            org.springframework.security.core.Authentication authentication = 
                org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
            
            if (authentication == null || !authentication.isAuthenticated()) {
                return null;
            }
            
            AppUser currentUser = (AppUser) authentication.getPrincipal();
            Long userId = currentUser.getId();
            
            // Get all ratings by this user for this test (could be multiple due to TOCTOU)
            List<com.vulnerable.vulnerableapp.entity.TestRating> userRatings = 
                testRatingRepository.findByTestId(test.getId()).stream()
                    .filter(rating -> rating.getUserId().equals(userId))
                    .toList();
            
            if (userRatings.isEmpty()) {
                return null;
            }
            
            // If TOCTOU created multiple ratings, return the most recent one
            return userRatings.stream()
                .max(java.util.Comparator.comparing(com.vulnerable.vulnerableapp.entity.TestRating::getCreatedAt))
                .map(com.vulnerable.vulnerableapp.entity.TestRating::getRating)
                .orElse(null);
                
        } catch (Exception e) {
            // If we can't get the user (e.g., anonymous access), return null
            return null;
        }
    }
    
    /**
     * Parse questionsJson string to List of QuestionResponse
     */
    @Named("jsonToQuestions")
    protected List<QuestionResponse> parseQuestionsJson(String questionsJson) {
        if (questionsJson == null || questionsJson.isEmpty()) {
            return new ArrayList<>();
        }
        
        try {
            ObjectMapper objectMapper = new ObjectMapper();
            return objectMapper.readValue(
                questionsJson,
                new TypeReference<List<QuestionResponse>>() {}
            );
        } catch (Exception e) {
            return new ArrayList<>();
        }
    }
}
