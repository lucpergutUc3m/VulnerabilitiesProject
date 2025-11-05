package com.vulnerable.vulnerableapp.dto.auth;

import com.vulnerable.vulnerableapp.dto.UserResponse;

import edu.umd.cs.findbugs.annotations.SuppressFBWarnings;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@SuppressFBWarnings(value = {"EI_EXPOSE_REP", "EI_EXPOSE_REP2"}, justification = "DTO with immutable fields - builder pattern is safe for data transfer objects")
public class AuthResponse {
    private UserResponse user;
    private String token;
    private Long expiresIn;
    private String refreshToken;
    private Long refreshExpiresIn;
}
