package com.vulnerable.vulnerableapp.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "blacklisted_token")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BlacklistedToken {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, unique = true, length = 512)
    private String token;
    
    // Token ID (jti) - unique identifier for each token
    // This is more efficient than storing the full token for lookups
    @Column(name = "token_id", unique = true, length = 100)
    private String tokenId;
    
    @Column(name = "blacklisted_at", nullable = false)
    private LocalDateTime blacklistedAt;
    
    @Column(name = "expires_at", nullable = false)
    private LocalDateTime expiresAt;
    
    @Column(name = "user_email")
    private String userEmail;
    
    @Column(name = "reason")
    private String reason; // e.g., "LOGOUT", "SECURITY_BREACH", "PASSWORD_CHANGE"
}
