package com.vulnerable.vulnerableapp.mapper;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.vulnerable.vulnerableapp.dto.tests.QuestionResponse;
import com.vulnerable.vulnerableapp.dto.tests.TestRequest;
import com.vulnerable.vulnerableapp.dto.tests.TestResponse;
import com.vulnerable.vulnerableapp.entity.AppUser;
import com.vulnerable.vulnerableapp.entity.TestEntity;
import com.vulnerable.vulnerableapp.repository.AppUserRepository;
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
    
    /**
     * Convert TestEntity to TestResponse DTO
     * @param test The test entity
     * @return TestResponse DTO
     */
    @Mapping(target = "timeLimit", source = "timeLimitMinutes")
    @Mapping(target = "createdBy", source = "ownerId", qualifiedByName = "ownerIdToName")
    @Mapping(target = "questions", source = "questionsJson", qualifiedByName = "jsonToQuestions")
    public abstract TestResponse toTestResponse(TestEntity test);
    
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
