package com.vulnerable.vulnerableapp.service;

import com.vulnerable.vulnerableapp.dto.*;
import com.vulnerable.vulnerableapp.dto.auth.AuthResponse;
import com.vulnerable.vulnerableapp.dto.auth.LoginRequest;
import com.vulnerable.vulnerableapp.dto.auth.RegisterRequest;
import com.vulnerable.vulnerableapp.entity.AppUser;
import com.vulnerable.vulnerableapp.repository.AppUserRepository;
import com.vulnerable.vulnerableapp.security.JwtUtil;
import com.vulnerable.vulnerableapp.security.TokenBlacklist;
import com.vulnerable.vulnerableapp.utils.UserRoles;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {
    
    private final AppUserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;
    private final TokenBlacklist tokenBlacklist;
    
    public AuthResponse register(RegisterRequest request) {
        log.info("=== REGISTRATION REQUEST START ===");
        log.info("Email: {}", request.getEmail());
        log.info("Name: {}", request.getName());
        
        if (userRepository.existsByEmail(request.getEmail())) {
            log.error("❌ REGISTRATION FAILED: Email already exists - {}", request.getEmail());
            throw new RuntimeException("Email already exists");
        }
        
        log.info("✓ Email is available, creating new user...");
        
        AppUser user = AppUser.builder()
                .email(request.getEmail())
                .name(request.getName())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .role(UserRoles.USER.getValue()) // Normal user by default
                .build();
        
        userRepository.save(user);
        log.info("✓ User saved to database with ID: {}", user.getId());
        
        String token = jwtUtil.generateToken(user);
        String refreshToken = jwtUtil.generateRefreshToken(user);
        log.info("✓ Tokens generated");
        
        log.info("✅ REGISTRATION SUCCESSFUL for user: {}", request.getEmail());
        log.info("=== REGISTRATION REQUEST END ===");
        
        return AuthResponse.builder()
                .user(UserResponse.builder()
                        .id(user.getId())
                        .name(user.getName())
                        .email(user.getEmail())
                        .role(user.getRole())
                        .build())
                .token(token)
                .expiresIn(jwtUtil.getExpirationTime())
                .refreshToken(refreshToken)
                .refreshExpiresIn(jwtUtil.getRefreshExpirationTime())
                .build();
    }
    
    public AuthResponse login(LoginRequest request) {
        log.info("=== LOGIN REQUEST START ===");
        log.info("Email: {}", request.getEmail());
        
        try {
            log.info("Authenticating user...");
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
            );
            log.info("✓ Authentication successful");
        } catch (Exception e) {
            log.error("❌ LOGIN FAILED: Authentication failed for user: {}", request.getEmail());
            log.error("Error: {}", e.getMessage());
            throw e;
        }
        
        AppUser user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> {
                    log.error("❌ LOGIN FAILED: User not found - {}", request.getEmail());
                    return new RuntimeException("User not found");
                });
        
        log.info("✓ User found in database: {} (ID: {})", user.getName(), user.getId());
        
        String token = jwtUtil.generateToken(user);
        String refreshToken = jwtUtil.generateRefreshToken(user);
        log.info("✓ Tokens generated");
        
        log.info("✅ LOGIN SUCCESSFUL for user: {}", request.getEmail());
        log.info("=== LOGIN REQUEST END ===");
        
        return AuthResponse.builder()
                .user(UserResponse.builder()
                        .id(user.getId())
                        .name(user.getName())
                        .email(user.getEmail())
                        .role(user.getRole())
                        .build())
                .token(token)
                .expiresIn(jwtUtil.getExpirationTime())
                .refreshToken(refreshToken)
                .refreshExpiresIn(jwtUtil.getRefreshExpirationTime())
                .build();
    }
    
    public void logout(HttpServletRequest request) {
        log.info("=== LOGOUT REQUEST START ===");
        
        String authorizationHeader = request.getHeader("Authorization");
        if (authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {
            String token = authorizationHeader.substring(7);
            try {
                String userEmail = jwtUtil.extractUsername(token);
                tokenBlacklist.blacklistToken(token, userEmail);
                log.info("✓ Token added to blacklist for user: {}", userEmail);
            } catch (Exception e) {
                log.error("Failed to blacklist token: {}", e.getMessage());
            }
        }
        
        log.info("✅ LOGOUT SUCCESSFUL");
        log.info("=== LOGOUT REQUEST END ===");
    }
    
    public AuthResponse refreshToken(String refreshTokenString) {
        log.info("=== REFRESH TOKEN REQUEST START ===");
        
        try {
            // Extract username from refresh token
            String username = jwtUtil.extractUsername(refreshTokenString);
            log.info("✓ Extracted username from refresh token: {}", username);
            
            // Load user from database
            AppUser user = userRepository.findByEmail(username)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            log.info("✓ User loaded: {} (ID: {})", user.getEmail(), user.getId());
            
            // Validate refresh token
            if (!jwtUtil.validateRefreshToken(refreshTokenString, user)) {
                log.error("❌ Invalid or expired refresh token");
                throw new RuntimeException("Invalid or expired refresh token");
            }
            log.info("✓ Refresh token validated");
            
            // Generate new tokens
            String newAccessToken = jwtUtil.generateToken(user);
            String newRefreshToken = jwtUtil.generateRefreshToken(user);
            log.info("✓ New tokens generated");
            
            log.info("✅ TOKEN REFRESH SUCCESSFUL for user: {}", user.getEmail());
            log.info("=== REFRESH TOKEN REQUEST END ===");
            
            return AuthResponse.builder()
                    .user(UserResponse.builder()
                            .id(user.getId())
                            .name(user.getName())
                            .email(user.getEmail())
                            .role(user.getRole())
                            .build())
                    .token(newAccessToken)
                    .expiresIn(jwtUtil.getExpirationTime())
                    .refreshToken(newRefreshToken)
                    .refreshExpiresIn(jwtUtil.getRefreshExpirationTime())
                    .build();
        } catch (Exception e) {
            log.error("❌ TOKEN REFRESH FAILED: {}", e.getMessage());
            throw new RuntimeException("Failed to refresh token: " + e.getMessage());
        }
    }
}
