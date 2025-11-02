package com.vulnerable.vulnerableapp.security;

import org.springframework.stereotype.Component;

import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Simple in-memory token blacklist for logout functionality.
 * In production, use Redis or a database for distributed systems.
 */
@Component
public class TokenBlacklist {
    
    private final Set<String> blacklistedTokens = ConcurrentHashMap.newKeySet();
    
    public void blacklistToken(String token) {
        blacklistedTokens.add(token);
    }
    
    public boolean isBlacklisted(String token) {
        return blacklistedTokens.contains(token);
    }
    
    public void cleanup() {
        // In production, implement cleanup of expired tokens
        // For now, tokens will be removed when server restarts
        blacklistedTokens.clear();
    }
}
