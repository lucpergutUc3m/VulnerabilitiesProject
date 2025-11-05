package com.vulnerable.vulnerableapp.service;

import com.vulnerable.vulnerableapp.dto.tests.TestRequest;
import com.vulnerable.vulnerableapp.dto.tests.TestResponse;
import com.vulnerable.vulnerableapp.dto.tests.UpdateTestRequest;
import com.vulnerable.vulnerableapp.entity.AppUser;
import com.vulnerable.vulnerableapp.entity.TestEntity;
import com.vulnerable.vulnerableapp.mapper.TestMapper;
import com.vulnerable.vulnerableapp.repository.TestEntityRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class TestService {
    
    private final TestEntityRepository testRepository;
    private final TestMapper testMapper;
    
    /**
     * Get the currently authenticated user from SecurityContext
     */
    private AppUser getCurrentAuthenticatedUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new RuntimeException("No authenticated user found");
        }
        return (AppUser) authentication.getPrincipal();
    }
    
    @Transactional
    public TestResponse createTest(TestRequest request) {
        AppUser owner = getCurrentAuthenticatedUser();
        
        TestEntity test = testMapper.toEntity(request, owner);
        test = testRepository.save(test);
        
        return testMapper.toTestResponse(test);
    }
    
    @Transactional
    public void deleteTest(Long testId) {
        AppUser user = getCurrentAuthenticatedUser();
        
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
    
    public TestResponse getTest(Long testId) {
        AppUser user = getCurrentAuthenticatedUser();
        
        TestEntity test = testRepository.findById(testId)
                .orElseThrow(() -> new RuntimeException("Test not found"));
        
        // Check if user has access (owner or public test)
        boolean hasAccess = test.getOwner().getId().equals(user.getId()) || test.getIsPublic();
        
        if (!hasAccess) {
            throw new RuntimeException("You don't have permission to view this test");
        }
        
        return testMapper.toTestResponse(test);
    }
    
    public List<TestResponse> getAllAccessibleTests() {
        AppUser user = getCurrentAuthenticatedUser();
        
        // Returns all public tests + user's own tests
        return testRepository.findAccessibleByUser(user).stream()
                .map(testMapper::toTestResponse)
                .collect(Collectors.toList());
    }
    
    public List<TestResponse> getTestsByUserId(Long userId) {
        AppUser currentUser = getCurrentAuthenticatedUser();
        
        // Verify that the user is requesting their own tests
        if (!currentUser.getId().equals(userId)) {
            throw new RuntimeException("You can only view your own tests");
        }
        
        // Returns all tests created by the user
        return testRepository.findByOwnerId(userId).stream()
                .map(testMapper::toTestResponse)
                .collect(Collectors.toList());
    }
    
    public List<TestResponse> getAllTests() {
        // Admin only - returns all tests
        List<TestEntity> allTests = testRepository.findAll();
        log.info("🔍 getAllTests() - Found {} tests in database", allTests.size());
        if (allTests.isEmpty()) {
            log.warn("⚠️ getAllTests() - Database returned empty list!");
        } else {
            allTests.forEach(test -> log.debug("  - Test ID: {}, Title: {}, Owner: {}", 
                test.getId(), test.getTitle(), test.getOwner().getEmail()));
        }
        return allTests.stream()
                .map(testMapper::toTestResponse)
                .collect(Collectors.toList());
    }
    
    @Transactional
    public TestResponse updateTest(Long testId, UpdateTestRequest request) {
        AppUser user = getCurrentAuthenticatedUser();
        
        TestEntity test = testRepository.findById(testId)
                .orElseThrow(() -> new RuntimeException("Test not found"));
        
        if (!test.getOwner().getId().equals(user.getId())) {
            throw new RuntimeException("You don't have permission to update this test");
        }
        
        if (request.getIsPublic() != null) {
            test.setIsPublic(request.getIsPublic());
        }
        
        test = testRepository.save(test);
        return testMapper.toTestResponse(test);
    }
}