package com.vulnerable.vulnerableapp.controller;

import com.vulnerable.vulnerableapp.dto.RateTestRequest;
import com.vulnerable.vulnerableapp.dto.RateTestResponse;
import com.vulnerable.vulnerableapp.dto.tests.TestRequest;
import com.vulnerable.vulnerableapp.dto.tests.TestResponse;
import com.vulnerable.vulnerableapp.dto.tests.UpdateTestRequest;
import com.vulnerable.vulnerableapp.service.TestService;
import edu.umd.cs.findbugs.annotations.SuppressFBWarnings;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tests")
@RequiredArgsConstructor
public class TestController {
    
    @SuppressFBWarnings(value = "EI_EXPOSE_REP2", justification = "Spring-managed singleton bean injected via constructor")
    private final TestService testService;
    
    @PostMapping
    public ResponseEntity<TestResponse> createTest(@Valid @RequestBody TestRequest request) {
    	System.out.println("Creating test with title: " + request.getTitle());
    	System.out.println("Description: " + request.getDescription());
    	System.out.println("Questions JSON: " + request.getQuestionsJson());
        return ResponseEntity.ok(testService.createTest(request));
    }
    
    @DeleteMapping("/{testId}")
    public ResponseEntity<Map<String, String>> deleteTest(@PathVariable Long testId) {
        testService.deleteTest(testId);
        return ResponseEntity.ok(Map.of("message", "Test deleted successfully"));
    }
    
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<TestResponse>> getTestsByUser(@PathVariable Long userId) {
        return ResponseEntity.ok(testService.getTestsByUserId(userId));
    }
    
    @GetMapping("/mine")
    public ResponseEntity<List<TestResponse>> getCurrentUserTests() {
        return ResponseEntity.ok(testService.getCurrentUserTests());
    }
    
    @GetMapping("/public")
    public ResponseEntity<List<TestResponse>> getPublicTests() {
		return ResponseEntity.ok(testService.getPublicTests());
	}
    
    @GetMapping("/{testId}")
    public ResponseEntity<TestResponse> getTest(@PathVariable Long testId) {
        return ResponseEntity.ok(testService.getTest(testId));
    }
    
    @GetMapping
    public ResponseEntity<List<TestResponse>> getAllAccessibleTests() {
        return ResponseEntity.ok(testService.getAllAccessibleTests());
    }
    
    @PutMapping("/{testId}")
    public ResponseEntity<TestResponse> updateTest(
            @PathVariable Long testId,
            @Valid @RequestBody UpdateTestRequest request) {
        return ResponseEntity.ok(testService.updateTest(testId, request));
    }
    
    @PostMapping("/{testId}/rate")
    public ResponseEntity<TestResponse> rateTest(
            @PathVariable Long testId,
            @Valid @RequestBody RateTestRequest request) {
        return ResponseEntity.ok(testService.rateTest(testId, request.getRating()));
    }
    
    @DeleteMapping("/{testId}/rate")
    public ResponseEntity<TestResponse> deleteRating(@PathVariable Long testId) {
        return ResponseEntity.ok(testService.deleteRating(testId));
    }
}
