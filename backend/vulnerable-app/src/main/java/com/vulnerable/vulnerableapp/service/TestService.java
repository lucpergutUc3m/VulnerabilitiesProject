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
        
        // Sanitize inputs to prevent XSS
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
        
        // Check if user has access (owner or public test)
        boolean hasAccess = test.getOwnerId().equals(user.getId()) || test.getIsPublic();
        
        if (!hasAccess) {
            throw new RuntimeException("You don't have permission to view this test");
        }
        
        return testMapper.toTestResponse(test);
    }
    
    public List<TestResponse> getAllAccessibleTests() {
        AppUser user = getCurrentAuthenticatedUser();
        
        // Returns all public tests + user's own tests
        return testRepository.findAccessibleByUserId(user.getId()).stream()
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
    
    public List<TestResponse> getCurrentUserTests() {
		AppUser currentUser = getCurrentAuthenticatedUser();
		return getTestsByUserId(currentUser.getId());
	}
    
    public List<TestResponse> getPublicTests() {
		// Returns only public tests
    	AppUser currentUser = getCurrentAuthenticatedUser();
		return testRepository.findByIsPublicTrueAndOwnerIdNot(currentUser.getId()).stream()
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
        log.info("⭐ User {} attempting to rate test {} with rating {}", user.getId(), testId, rating);
        
        // 🚨 VULNERABILITY: Time-of-Check (moved to beginning for maximum race window)
        boolean hasRated = testRatingRepository.existsByUserIdAndTestId(user.getId(), testId);
        log.info("📊 User has already rated: {}", hasRated);
        
        if (hasRated) {
            log.warn("❌ User {} has already rated test {}", user.getId(), testId);
            throw new ConflictException("You have already rated this test");
        }
        
        // 🚨 RACE CONDITION WINDOW WIDENS HERE - Heavy processing before the actual save
        
        // Verify test exists and get test info (database query adds latency)
        TestEntity test = testRepository.findById(testId)
                .orElseThrow(() -> new NotFoundException("Test", testId));
        
        // Check if user is the owner (owners cannot rate their own tests)
        if (test.getOwnerId().equals(user.getId())) {
            log.warn("❌ User {} tried to rate their own test {}", user.getId(), testId);
            throw new ConflictException("You cannot rate your own test");
        }
        
        // Fetch all existing ratings (another database query for latency)
        List<TestRating> existingRatings = testRatingRepository.findByTestId(testId);
        log.info("📈 Test {} currently has {} ratings", testId, existingRatings.size());
        
        // Calculate what the new average will be (complex computation adds time)
        double currentSum = existingRatings.stream().mapToInt(TestRating::getRating).sum();
        double projectedAverage = (currentSum + rating) / (existingRatings.size() + 1);
        log.info("📊 Projected new average: {}/5", projectedAverage);
        
        if (projectedAverage < 1 || projectedAverage > 5) {
			log.error("❌ Computed projected average rating is out of bounds: {}", projectedAverage);
			throw new RuntimeException("Computed average rating is invalid");
		}
        
        // Build the rating object (object construction)
        TestRating testRating = TestRating.builder()
                .userId(user.getId())
                .testId(testId)
                .rating(rating)
                .build();
        
        // 🚨 VULNERABILITY: Time-of-Use (finally saving after all the processing)
        testRatingRepository.save(testRating);
        log.info("✅ Rating saved: User {} rated test {} with {}/5", user.getId(), testId, rating);
        
        // Return test response (ratings will be calculated on-demand by the mapper)
        return testMapper.toTestResponse(test);
    }
    
    @Transactional
    public TestResponse deleteRating(Long testId) {
        AppUser user = getCurrentAuthenticatedUser();
        log.info("🗑️ User {} attempting to delete rating for test {}", user.getId(), testId);
        
        // Verify test exists
        TestEntity test = testRepository.findById(testId)
                .orElseThrow(() -> new NotFoundException("Test", testId));
        
        testRatingRepository.deleteByUserIdAndTestId(user.getId(), testId);
        log.info("✅ Rating deleted: User {} removed their rating from test {}", user.getId(), testId);
        
        // Return updated test response
        return testMapper.toTestResponse(test);
    }
}