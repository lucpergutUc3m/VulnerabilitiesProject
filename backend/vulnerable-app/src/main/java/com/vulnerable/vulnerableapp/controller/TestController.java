package com.vulnerable.vulnerableapp.controller;

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
        return ResponseEntity.ok(testService.createTest(request));
    }
    
    @DeleteMapping("/{testId}")
    public ResponseEntity<Map<String, String>> deleteTest(@PathVariable Long testId) {
        testService.deleteTest(testId);
        return ResponseEntity.ok(Map.of("message", "Test deleted successfully"));
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
}
