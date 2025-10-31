package com.vulnerable.vulnerableapp.controller;

import com.vulnerable.vulnerableapp.dto.CategoryResponse;
import com.vulnerable.vulnerableapp.dto.UpdateRoleRequest;
import com.vulnerable.vulnerableapp.service.CategoryService;
import com.vulnerable.vulnerableapp.service.TestService;
import com.vulnerable.vulnerableapp.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {
    
    private final CategoryService categoryService;
    private final UserService userService;
    private final TestService testService;
    
    @Value("${app.vulnerability-mode}")
    private boolean vulnerabilityMode;
    
    @GetMapping("/categories/pending")
    public ResponseEntity<List<CategoryResponse>> getPendingCategories() {
        return ResponseEntity.ok(categoryService.getPendingCategories());
    }
    
    @PostMapping("/categories/{categoryId}/approve")
    public ResponseEntity<Map<String, String>> approveCategory(@PathVariable Long categoryId) {
        categoryService.approveCategory(categoryId);
        return ResponseEntity.ok(Map.of("message", "Category approved successfully"));
    }
    
    @PostMapping("/categories/{categoryId}/reject")
    public ResponseEntity<Map<String, String>> rejectCategory(@PathVariable Long categoryId) {
        categoryService.rejectCategory(categoryId);
        return ResponseEntity.ok(Map.of("message", "Category rejected successfully"));
    }
    
    @PostMapping("/users/{userId}/role")
    public ResponseEntity<Map<String, String>> updateUserRole(
            @PathVariable Long userId,
            @Valid @RequestBody UpdateRoleRequest request) {
        userService.updateUserRole(userId, request.getRole());
        return ResponseEntity.ok(Map.of("message", "User role updated successfully"));
    }
    
    @DeleteMapping("/tests/{testId}")
    public ResponseEntity<Map<String, String>> deleteTest(@PathVariable Long testId) {
        testService.adminDeleteTest(testId);
        return ResponseEntity.ok(Map.of("message", "Test deleted successfully"));
    }
    
    @PostMapping("/config/vuln-mode")
    public ResponseEntity<Map<String, Object>> toggleVulnerabilityMode(
            @RequestBody Map<String, Boolean> body) {
        boolean enabled = body.getOrDefault("enabled", false);
        // Note: This would require dynamic configuration changes
        // For now, it returns the current state
        return ResponseEntity.ok(Map.of(
            "vulnerabilityMode", vulnerabilityMode,
            "message", "Vulnerability mode configuration (requires application restart to change)"
        ));
    }
}
