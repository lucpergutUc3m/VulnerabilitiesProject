package com.vulnerable.vulnerableapp.repository;

import com.vulnerable.vulnerableapp.entity.BlacklistedToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;

@Repository
public interface BlacklistedTokenRepository extends JpaRepository<BlacklistedToken, Long> {
    
    /**
     * Check if a token exists in the blacklist
     */
    boolean existsByToken(String token);
    
    /**
     * Delete all expired tokens (cleanup)
     */
    @Modifying
    @Query("DELETE FROM BlacklistedToken bt WHERE bt.expiresAt < :now")
    void deleteExpiredTokens(@Param("now") LocalDateTime now);
}
