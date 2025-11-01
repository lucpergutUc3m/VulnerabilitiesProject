package com.vulnerable.vulnerableapp.service;

import com.vulnerable.vulnerableapp.dto.ShareTestRequest;
import com.vulnerable.vulnerableapp.dto.TestRequest;
import com.vulnerable.vulnerableapp.dto.TestResponse;
import com.vulnerable.vulnerableapp.entity.*;
import com.vulnerable.vulnerableapp.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TestService {
    
    private final TestEntityRepository testRepository;
    private final TestSharedWithRepository sharedRepository;
    private final AppUserRepository userRepository;
    
    @Transactional
    public TestResponse createTest(AppUser owner, TestRequest request) {
        TestEntity test = TestEntity.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .questionsJson(request.getQuestionsJson())
                .timeLimitMinutes(request.getTimeLimitMinutes())
                .owner(owner)
                .category(request.getCategory())
                .emoji(request.getEmoji())
                .build();
        
        test = testRepository.save(test);
        return convertToResponse(test);
    }
    
    @Transactional
    public void deleteTest(AppUser user, Long testId) {
        TestEntity test = testRepository.findById(testId)
                .orElseThrow(() -> new RuntimeException("Test not found"));
        
        if (!test.getOwner().getId().equals(user.getId())) {
            throw new RuntimeException("You don't have permission to delete this test");
        }
        
        testRepository.delete(test);
    }
    
    @Transactional
    public void adminDeleteTest(Long testId) {
        TestEntity test = testRepository.findById(testId)
                .orElseThrow(() -> new RuntimeException("Test not found"));
        testRepository.delete(test);
    }
    
    public TestResponse getTest(AppUser user, Long testId) {
        TestEntity test = testRepository.findById(testId)
                .orElseThrow(() -> new RuntimeException("Test not found"));
        
        // Check if user has access
        boolean hasAccess = test.getOwner().getId().equals(user.getId()) ||
                sharedRepository.existsByTestAndSharedWithUser(test, user);
        
        if (!hasAccess) {
            throw new RuntimeException("You don't have permission to view this test");
        }
        
        return convertToResponse(test);
    }
    
    public List<TestResponse> getMyTests(AppUser user) {
        return testRepository.findByOwner(user).stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }
    
    public List<TestResponse> getSharedTests(AppUser user) {
        return testRepository.findSharedWithUser(user).stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }
    
    @Transactional
    public void shareTest(AppUser owner, Long testId, ShareTestRequest request) {
        TestEntity test = testRepository.findById(testId)
                .orElseThrow(() -> new RuntimeException("Test not found"));
        
        if (!test.getOwner().getId().equals(owner.getId())) {
            throw new RuntimeException("You don't have permission to share this test");
        }
        
        AppUser userToShareWith = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        if (sharedRepository.existsByTestAndSharedWithUser(test, userToShareWith)) {
            throw new RuntimeException("Test already shared with this user");
        }
        
        TestSharedWith shared = TestSharedWith.builder()
                .test(test)
                .sharedWithUser(userToShareWith)
                .build();
        
        sharedRepository.save(shared);
    }
    
    @Transactional
    public void unshareTest(AppUser owner, Long testId, ShareTestRequest request) {
        TestEntity test = testRepository.findById(testId)
                .orElseThrow(() -> new RuntimeException("Test not found"));
        
        if (!test.getOwner().getId().equals(owner.getId())) {
            throw new RuntimeException("You don't have permission to unshare this test");
        }
        
        AppUser userToUnshareWith = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        sharedRepository.deleteByTestAndSharedWithUser(test, userToUnshareWith);
    }
    
    private TestResponse convertToResponse(TestEntity test) {
        return TestResponse.builder()
                .id(test.getId())
                .title(test.getTitle())
                .description(test.getDescription())
                .questionsJson(test.getQuestionsJson())
                .timeLimitMinutes(test.getTimeLimitMinutes())
                .ownerId(test.getOwner().getId())
                .ownerEmail(test.getOwner().getEmail())
                .category(test.getCategory())
                .emoji(test.getEmoji())
                .build();
    }
}
