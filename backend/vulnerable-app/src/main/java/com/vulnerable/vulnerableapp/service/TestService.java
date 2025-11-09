package com.vulnerable.vulnerableapp.service;

import com.vulnerable.vulnerableapp.dto.RateTestResponse;
import com.vulnerable.vulnerableapp.dto.tests.TestRequest;
import com.vulnerable.vulnerableapp.dto.tests.TestResponse;
import com.vulnerable.vulnerableapp.dto.tests.UpdateTestRequest;
import com.vulnerable.vulnerableapp.entity.AppUser;
import com.vulnerable.vulnerableapp.entity.TestEntity;
import com.vulnerable.vulnerableapp.entity.TestRating;
import com.vulnerable.vulnerableapp.exception.ConflictException;
import com.vulnerable.vulnerableapp.exception.NotFoundException;
import com.vulnerable.vulnerableapp.mapper.TestMapper;
import com.vulnerable.vulnerableapp.repository.TestEntityRepository;
import com.vulnerable.vulnerableapp.repository.TestRatingRepository;
import com.vulnerable.vulnerableapp.util.XssUtils;
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
    private final TestRatingRepository testRatingRepository;
    
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
        
        request.setTitle(XssUtils.sanitizeWithLimit(request.getTitle(), 200));
        request.setTopic(XssUtils.sanitizeWithLimit(request.getTopic(), 100));
        request.setDescription(XssUtils.sanitizeWithLimit(request.getDescription(), 1000));
        request.setEmoji(XssUtils.sanitizeWithLimit(request.getEmoji(), 10));
        
        
        request.setQuestionsJson(request.getQuestionsJson());
        
        TestEntity test = testMapper.toEntity(request, owner);
        test = testRepository.save(test);
        
        return testMapper.toTestResponse(test);
    }
    
    @Transactional
    public void deleteTest(Long testId) {
        AppUser user = getCurrentAuthenticatedUser();
        
        TestEntity test = testRepository.findById(testId)
                .orElseThrow(() -> new RuntimeException("Test not found"));
        
        if (!test.getOwnerId().equals(user.getId())) {
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
        
        boolean hasAccess = test.getOwnerId().equals(user.getId()) || test.getIsPublic();
        
        if (!hasAccess) {
            throw new RuntimeException("You don't have permission to view this test");
        }
        
        return testMapper.toTestResponse(test);
    }
    
    public List<TestResponse> getAllAccessibleTests() {
        AppUser user = getCurrentAuthenticatedUser();
        
        return testRepository.findAccessibleByUserId(user.getId()).stream()
                .map(testMapper::toTestResponse)
                .collect(Collectors.toList());
    }
    
    public List<TestResponse> getTestsByUserId(Long userId) {
        AppUser currentUser = getCurrentAuthenticatedUser();
        
        if (!currentUser.getId().equals(userId)) {
            throw new RuntimeException("You can only view your own tests");
        }
        
        return testRepository.findByOwnerId(userId).stream()
                .map(testMapper::toTestResponse)
                .collect(Collectors.toList());
    }
    
    public List<TestResponse> getCurrentUserTests() {
		AppUser currentUser = getCurrentAuthenticatedUser();
		return getTestsByUserId(currentUser.getId());
	}
    
    public List<TestResponse> getPublicTests() {
    	AppUser currentUser = getCurrentAuthenticatedUser();
		return testRepository.findByIsPublicTrueAndOwnerIdNot(currentUser.getId()).stream()
				.map(testMapper::toTestResponse)
				.collect(Collectors.toList());
	}
    
    public List<TestResponse> getAllTests() {
        List<TestEntity> allTests = testRepository.findAll();
        
        if (allTests.isEmpty()) {
            log.warn("⚠️ getAllTests() - Database returned empty list!");
        } else {
            allTests.forEach(test -> log.debug("  - Test ID: {}, Title: {}, Owner: {}", 
                test.getId(), test.getTitle(), test.getOwnerId()));
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
        
        if (!test.getOwnerId().equals(user.getId())) {
            throw new RuntimeException("You don't have permission to update this test");
        }
        
        if (request.getIsPublic() != null) {
            test.setIsPublic(request.getIsPublic());
        }
        
        test = testRepository.save(test);
        return testMapper.toTestResponse(test);
    }
    
    @Transactional
    public TestResponse rateTest(Long testId, Integer rating) {
        AppUser user = getCurrentAuthenticatedUser();
        
        boolean hasRated = testRatingRepository.existsByUserIdAndTestId(user.getId(), testId);
        
        if (hasRated) {
            throw new ConflictException("You have already rated this test");
        }
        
        TestEntity test = testRepository.findById(testId)
                .orElseThrow(() -> new NotFoundException("Test", testId));
        
        if (test.getOwnerId().equals(user.getId())) {
            throw new ConflictException("You cannot rate your own test");
        }
        
        List<TestRating> existingRatings = testRatingRepository.findByTestId(testId);
        
        double currentSum = existingRatings.stream().mapToInt(TestRating::getRating).sum();
        double projectedAverage = (currentSum + rating) / (existingRatings.size() + 1);
        
        if (projectedAverage < 1 || projectedAverage > 5) {
			throw new RuntimeException("Computed average rating is invalid");
		}
        
        TestRating testRating = TestRating.builder()
                .userId(user.getId())
                .testId(testId)
                .rating(rating)
                .build();
        
        testRatingRepository.save(testRating);
        
        return testMapper.toTestResponse(test);
    }
    
    @Transactional
    public TestResponse deleteRating(Long testId) {
        AppUser user = getCurrentAuthenticatedUser();
        
        TestEntity test = testRepository.findById(testId)
                .orElseThrow(() -> new NotFoundException("Test", testId));
        
        testRatingRepository.deleteByUserIdAndTestId(user.getId(), testId);
        
        return testMapper.toTestResponse(test);
    }
}