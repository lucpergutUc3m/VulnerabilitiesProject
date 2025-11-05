package com.vulnerable.vulnerableapp.security;

import com.vulnerable.vulnerableapp.entity.AppUser;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

@Component
public class JwtUtil {
    
    @Value("${jwt.secret}")
    private String secret;
    
    @Value("${jwt.expiration}")
    private Long expiration;
    
    @Value("${jwt.refresh.expiration:604800000}")
    private Long refreshExpiration;
    
    @Value("${jwt.issuer:VulnerableApp}")
    private String issuer;
    
    @Value("${jwt.audience:VulnerableApp-Users}")
    private String audience;
    
    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }
    
    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }
    
    public Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }
    
    public String extractTokenId(String token) {
        return extractClaim(token, Claims::getId);
    }
    
    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }
    
    public Claims extractAllClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
    
    private Boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }
    
    public String generateToken(UserDetails userDetails) {
        Map<String, Object> claims = new HashMap<>();
        
        // Add security-critical claims to prevent token forgery
        if (userDetails instanceof AppUser) {
            AppUser appUser = (AppUser) userDetails;
            claims.put("userId", appUser.getId());
            claims.put("role", appUser.getRole());
        }
        
        // Add roles/authorities to token
        claims.put("authorities", userDetails.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.toList()));
        
        return createToken(claims, userDetails.getUsername());
    }
    
    private String createToken(Map<String, Object> claims, String subject) {
        return Jwts.builder()
                .claims(claims)
                .subject(subject)
                .id(UUID.randomUUID().toString()) // Unique token ID (jti) - prevents token reuse/forgery
                .issuer(issuer) // Token issuer - ensures token is from our app
                .audience().add(audience).and() // Token audience - ensures token is for our app
                .issuedAt(new Date(System.currentTimeMillis()))
                .expiration(new Date(System.currentTimeMillis() + expiration))
                .signWith(getSigningKey())
                .compact();
    }
    
    public Boolean validateToken(String token, UserDetails userDetails) {
        final String username = extractUsername(token);
        
        // Validate username matches
        if (!username.equals(userDetails.getUsername()) || isTokenExpired(token)) {
            return false;
        }
        
        // Additional security: Validate userId and role claims match the actual user
        // This prevents token forgery even if someone knows the email
        if (userDetails instanceof AppUser) {
            AppUser appUser = (AppUser) userDetails;
            Claims claims = extractAllClaims(token);
            
            // Verify user ID matches (critical security check)
            Object userIdClaim = claims.get("userId");
            if (userIdClaim != null) {
                Long tokenUserId = ((Number) userIdClaim).longValue();
                if (!tokenUserId.equals(appUser.getId())) {
                    return false; // Token user ID doesn't match - possible forgery
                }
            }
            
            // Verify role matches (prevents privilege escalation)
            Object roleClaim = claims.get("role");
            if (roleClaim != null) {
                Integer tokenRole = ((Number) roleClaim).intValue();
                if (!tokenRole.equals(appUser.getRole())) {
                    System.err.println("[JWT ERROR] Role mismatch!");
                    System.err.println("  Token role: " + tokenRole);
                    System.err.println("  DB role: " + appUser.getRole());
                    System.err.println("  User: " + username);
                    return false; // Token role doesn't match - possible privilege escalation attempt
                }
            }
        }
        
        return true;
    }
    
    public Long getExpirationTime() {
        return expiration;
    }
    
    public Long getRefreshExpirationTime() {
        return refreshExpiration;
    }
    
    // Generate refresh token (simpler JWT with longer expiration)
    public String generateRefreshToken(UserDetails userDetails) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("type", "refresh");
        
        if (userDetails instanceof AppUser) {
            AppUser appUser = (AppUser) userDetails;
            claims.put("userId", appUser.getId());
        }
        
        return Jwts.builder()
                .claims(claims)
                .subject(userDetails.getUsername())
                .id(UUID.randomUUID().toString())
                .issuer(issuer)
                .issuedAt(new Date(System.currentTimeMillis()))
                .expiration(new Date(System.currentTimeMillis() + refreshExpiration))
                .signWith(getSigningKey())
                .compact();
    }
    
    // Validate refresh token
    public Boolean validateRefreshToken(String token, UserDetails userDetails) {
        try {
            final String username = extractUsername(token);
            Claims claims = extractAllClaims(token);
            
            // Check it's a refresh token
            if (!"refresh".equals(claims.get("type"))) {
                return false;
            }
            
            // Validate username and expiration
            return username.equals(userDetails.getUsername()) && !isTokenExpired(token);
        } catch (Exception e) {
            return false;
        }
    }
}