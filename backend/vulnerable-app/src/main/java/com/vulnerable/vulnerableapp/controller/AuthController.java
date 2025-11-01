package com.vulnerable.vulnerableapp.controller;

import com.vulnerable.vulnerableapp.dto.AuthResponse;
import com.vulnerable.vulnerableapp.dto.LoginRequest;
import com.vulnerable.vulnerableapp.dto.RegisterRequest;
import com.vulnerable.vulnerableapp.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Slf4j
public class AuthController {
    
    private final AuthService authService;
    
    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        log.info("🔵 POST /api/auth/register - Registration request received for email: {}", request.getEmail());
        try {
            AuthResponse response = authService.register(request);
            log.info("✅ POST /api/auth/register - Registration successful (200 OK)");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("❌ POST /api/auth/register - Registration failed: {}", e.getMessage());
            throw e;
        }
    }
    
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        log.info("🔵 POST /api/auth/login - Login request received for email: {}", request.getEmail());
        try {
            AuthResponse response = authService.login(request);
            log.info("✅ POST /api/auth/login - Login successful (200 OK)");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("❌ POST /api/auth/login - Login failed: {}", e.getMessage());
            throw e;
        }
    }
}
