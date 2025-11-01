package com.vulnerable.vulnerableapp.controller;

import com.vulnerable.vulnerableapp.dto.UpdateRoleRequest;
import com.vulnerable.vulnerableapp.service.TestService;
import com.vulnerable.vulnerableapp.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {
    
    private final UserService userService;
    private final TestService testService;
    
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
}
