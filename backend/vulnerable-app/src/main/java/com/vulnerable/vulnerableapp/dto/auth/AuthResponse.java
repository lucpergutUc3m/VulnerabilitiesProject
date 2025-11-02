package com.vulnerable.vulnerableapp.dto.auth;

import com.vulnerable.vulnerableapp.dto.UserResponse;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {
    private UserResponse user;
    private String token;
    private Long expiresIn;
}
