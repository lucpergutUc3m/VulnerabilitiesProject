package com.vulnerable.vulnerableapp.controller;

import com.vulnerable.vulnerableapp.dto.ShareTestRequest;
import com.vulnerable.vulnerableapp.dto.TestRequest;
import com.vulnerable.vulnerableapp.dto.TestResponse;
import com.vulnerable.vulnerableapp.entity.AppUser;
import com.vulnerable.vulnerableapp.service.TestService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tests")
@RequiredArgsConstructor
public class TestController {
    
    private final TestService testService;
    
    @PostMapping
    public ResponseEntity<TestResponse> createTest(
            @AuthenticationPrincipal AppUser user,
            @Valid @RequestBody TestRequest request) {
        return ResponseEntity.ok(testService.createTest(user, request));
    }
    
    @PutMapping("/{testId}")
    public ResponseEntity<TestResponse> updateTest(
            @AuthenticationPrincipal AppUser user,
            @PathVariable Long testId,
            @Valid @RequestBody TestRequest request) {
        return ResponseEntity.ok(testService.updateTest(user, testId, request));
    }
    
    @DeleteMapping("/{testId}")
    public ResponseEntity<Map<String, String>> deleteTest(
            @AuthenticationPrincipal AppUser user,
            @PathVariable Long testId) {
        testService.deleteTest(user, testId);
        return ResponseEntity.ok(Map.of("message", "Test deleted successfully"));
    }
    
    @GetMapping("/{testId}")
    public ResponseEntity<TestResponse> getTest(
            @AuthenticationPrincipal AppUser user,
            @PathVariable Long testId) {
        return ResponseEntity.ok(testService.getTest(user, testId));
    }
    
    @GetMapping("/mine")
    public ResponseEntity<List<TestResponse>> getMyTests(@AuthenticationPrincipal AppUser user) {
        return ResponseEntity.ok(testService.getMyTests(user));
    }
    
    @GetMapping("/shared")
    public ResponseEntity<List<TestResponse>> getSharedTests(@AuthenticationPrincipal AppUser user) {
        return ResponseEntity.ok(testService.getSharedTests(user));
    }
    
    @GetMapping("/search")
    public ResponseEntity<List<TestResponse>> searchTests(
            @AuthenticationPrincipal AppUser user,
            @RequestParam String q) {
        return ResponseEntity.ok(testService.searchTests(user, q));
    }
    
    @PostMapping("/{testId}/share")
    public ResponseEntity<Map<String, String>> shareTest(
            @AuthenticationPrincipal AppUser user,
            @PathVariable Long testId,
            @Valid @RequestBody ShareTestRequest request) {
        testService.shareTest(user, testId, request);
        return ResponseEntity.ok(Map.of("message", "Test shared successfully"));
    }
    
    @PostMapping("/{testId}/unshare")
    public ResponseEntity<Map<String, String>> unshareTest(
            @AuthenticationPrincipal AppUser user,
            @PathVariable Long testId,
            @Valid @RequestBody ShareTestRequest request) {
        testService.unshareTest(user, testId, request);
        return ResponseEntity.ok(Map.of("message", "Test unshared successfully"));
    }
    
    @PostMapping("/{testId}/categories")
    public ResponseEntity<Map<String, String>> addCategoryToTest(
            @AuthenticationPrincipal AppUser user,
            @PathVariable Long testId,
            @RequestBody Map<String, Long> body) {
        testService.addCategoryToTest(user, testId, body.get("categoryId"));
        return ResponseEntity.ok(Map.of("message", "Category added successfully"));
    }
    
    @DeleteMapping("/{testId}/categories/{categoryId}")
    public ResponseEntity<Map<String, String>> removeCategoryFromTest(
            @AuthenticationPrincipal AppUser user,
            @PathVariable Long testId,
            @PathVariable Long categoryId) {
        testService.removeCategoryFromTest(user, testId, categoryId);
        return ResponseEntity.ok(Map.of("message", "Category removed successfully"));
    }
}
