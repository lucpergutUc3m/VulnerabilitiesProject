package com.vulnerable.vulnerableapp.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.MediaType;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

@Component
public class JwtAuthenticationEntryPoint implements AuthenticationEntryPoint {

    @Override
    public void commence(HttpServletRequest request, HttpServletResponse response,
                        AuthenticationException authException) throws IOException, ServletException {
        
        // Get the original exception message
        String message = "Unauthorized";
        Throwable ex = authException;
        
        // Unwrap the exception chain to find the root cause
        while (ex != null) {
            if (ex instanceof org.springframework.security.core.userdetails.UsernameNotFoundException) {
                message = ex.getMessage();
                break;
            }
            if (ex.getMessage() != null && !ex.getMessage().equals("Unauthorized")) {
                message = ex.getMessage();
                break;
            }
            ex = ex.getCause();
        }

        // Create error response
        Map<String, String> error = new HashMap<>();
        error.put("error", message);
        
        // Configure response
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        
        // Write error response
        new ObjectMapper().writeValue(response.getOutputStream(), error);
    }
}