package com.vulnerable.vulnerableapp.controller;

import com.vulnerable.vulnerableapp.dto.auth.AuthResponse;
import com.vulnerable.vulnerableapp.dto.auth.LoginRequest;
import com.vulnerable.vulnerableapp.dto.auth.RefreshTokenRequest;
import com.vulnerable.vulnerableapp.dto.auth.RegisterRequest;
import com.vulnerable.vulnerableapp.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
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
    
    @PostMapping("/logout")
    public ResponseEntity<Void> logout(HttpServletRequest request) {
        log.info("🔵 POST /api/auth/logout - Logout request received");
        try {
            authService.logout(request);
            log.info("✅ POST /api/auth/logout - Logout successful (200 OK)");
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            log.error("❌ POST /api/auth/logout - Logout failed: {}", e.getMessage());
            throw e;
        }
    }
    
    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refreshToken(@Valid @RequestBody RefreshTokenRequest request) {
        log.info("🔵 POST /api/auth/refresh - Token refresh request received");
        try {
            AuthResponse response = authService.refreshToken(request.getRefreshToken());
            log.info("✅ POST /api/auth/refresh - Token refresh successful (200 OK)");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("❌ POST /api/auth/refresh - Token refresh failed: {}", e.getMessage());
            throw e;
        }
    }
}
