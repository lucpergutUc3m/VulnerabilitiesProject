package com.vulnerable.vulnerableapp.controller;

import com.vulnerable.vulnerableapp.dto.tests.TestResponse;
import com.vulnerable.vulnerableapp.service.TestService;
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
    private final TestService testService;
    
    @DeleteMapping("/tests/{testId}")
    public ResponseEntity<Map<String, String>> deleteUser(@PathVariable Long testId) {
    	testService.adminDeleteTest(testId);
        return ResponseEntity.ok(Map.of("message", "Test deleted successfully"));
    }
    
    @GetMapping("/tests")
    public ResponseEntity<List<TestResponse>> getAllTests() {
        return ResponseEntity.ok(testService.getAllTests());
    }
}
