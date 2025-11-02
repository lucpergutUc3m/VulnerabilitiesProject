package com.vulnerable.vulnerableapp.controller;

import com.vulnerable.vulnerableapp.dto.UserResponse;
import com.vulnerable.vulnerableapp.dto.admin.AdminUpdateUserRequest;
import com.vulnerable.vulnerableapp.dto.tests.TestResponse;
import com.vulnerable.vulnerableapp.service.TestService;
import com.vulnerable.vulnerableapp.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
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
    
    private final UserService userService;
    private final TestService testService;
    
    @GetMapping("/users")
    public ResponseEntity<List<UserResponse>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }
    
    @PutMapping("/users/{userId}")
    public ResponseEntity<UserResponse> updateUser(
            @PathVariable Long userId,
            @Valid @RequestBody AdminUpdateUserRequest request) {
        return ResponseEntity.ok(userService.adminUpdateUser(userId, request));
    }
    
    @DeleteMapping("/users/{userId}")
    public ResponseEntity<Map<String, String>> deleteUser(@PathVariable Long userId) {
        userService.adminDeleteUser(userId);
        return ResponseEntity.ok(Map.of("message", "User deleted successfully"));
    }
    
    @GetMapping("/tests")
    public ResponseEntity<List<TestResponse>> getAllTests() {
        return ResponseEntity.ok(testService.getAllTests());
    }
}
