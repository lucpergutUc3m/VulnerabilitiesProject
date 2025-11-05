package com.vulnerable.vulnerableapp.security;

import com.vulnerable.vulnerableapp.entity.BlacklistedToken;
import com.vulnerable.vulnerableapp.repository.BlacklistedTokenRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

/**
 * Database-backed token blacklist for logout functionality.
 * Tokens are persisted in the database and automatically cleaned up when expired.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class TokenBlacklist {
    
    private final BlacklistedTokenRepository blacklistedTokenRepository;
    private final JwtUtil jwtUtil;
    
    /**
     * Add a token to the blacklist
     */
    @Transactional
    public void blacklistToken(String token, String userEmail) {
        blacklistToken(token, userEmail, "LOGOUT");
    }
    
    /**
     * Add a token to the blacklist with a specific reason
     */
    @Transactional
    public void blacklistToken(String token, String userEmail, String reason) {
        try {
            // Extract the unique token ID (jti) from the JWT
            String tokenId = jwtUtil.extractTokenId(token);
            
            LocalDateTime expiresAt = jwtUtil.extractExpiration(token)
                    .toInstant()
                    .atZone(java.time.ZoneId.systemDefault())
                    .toLocalDateTime();
            
            BlacklistedToken blacklistedToken = BlacklistedToken.builder()
                    .token(token)
                    .tokenId(tokenId) // Store the unique token ID for efficient lookups
                    .blacklistedAt(LocalDateTime.now())
                    .expiresAt(expiresAt)
                    .userEmail(userEmail)
                    .reason(reason)
                    .build();
            
            blacklistedTokenRepository.save(blacklistedToken);
            log.info("Token [ID: {}] blacklisted for user: {} (Reason: {})", tokenId, userEmail, reason);
        } catch (Exception e) {
            log.error("Failed to blacklist token: {}", e.getMessage());
        }
    }
    
    /**
     * Check if a token is blacklisted
     */
    public boolean isBlacklisted(String token) {
        return blacklistedTokenRepository.existsByToken(token);
    }
    
    /**
     * Cleanup expired tokens - runs every hour
     */
    @Scheduled(cron = "0 0 * * * *")
    @Transactional
    public void cleanupExpiredTokens() {
        log.info("Running expired tokens cleanup...");
        blacklistedTokenRepository.deleteExpiredTokens(LocalDateTime.now());
        log.info("Expired tokens cleanup completed");
    }
}
