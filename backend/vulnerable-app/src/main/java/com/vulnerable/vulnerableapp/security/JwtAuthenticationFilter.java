package com.vulnerable.vulnerableapp.security;

import com.vulnerable.vulnerableapp.service.CustomUserDetailsService;
import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collection;
import java.util.List;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    
    private final JwtUtil jwtUtil;
    private final CustomUserDetailsService userDetailsService;
    private final TokenBlacklist tokenBlacklist;
    
    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        
        final String authorizationHeader = request.getHeader("Authorization");
        
        String username = null;
        String jwt = null;
        
        if (authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {
            jwt = authorizationHeader.substring(7);
            
            // Check if token is blacklisted
            if (tokenBlacklist.isBlacklisted(jwt)) {
                chain.doFilter(request, response);
                return;
            }
            
            try {
                username = jwtUtil.extractUsername(jwt);
            } catch (Exception e) {
                // Invalid token
            }
        }
        
        if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            UserDetails userDetails = this.userDetailsService.loadUserByUsername(username);
            
            if (jwtUtil.validateToken(jwt, userDetails)) {
                // Extract authorities from JWT claims, with fallback to UserDetails
                Collection<? extends GrantedAuthority> authorities = extractAuthoritiesFromToken(jwt);
                
                // If JWT authorities are empty, use UserDetails authorities
                if (authorities.isEmpty()) {
                    authorities = userDetails.getAuthorities();
                }
                
                UsernamePasswordAuthenticationToken authenticationToken = 
                    new UsernamePasswordAuthenticationToken(userDetails, null, authorities);
                authenticationToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authenticationToken);
            }
        }
        chain.doFilter(request, response);
    }
    
    private Collection<? extends GrantedAuthority> extractAuthoritiesFromToken(String token) {
        try {
            Claims claims = jwtUtil.extractAllClaims(token);
            
            @SuppressWarnings("unchecked")
            List<String> authoritiesList = (List<String>) claims.get("authorities");
            
            if (authoritiesList != null && !authoritiesList.isEmpty()) {
                Collection<? extends GrantedAuthority> authorities = authoritiesList.stream()
                        .map(SimpleGrantedAuthority::new)
                        .collect(Collectors.toList());
                System.err.println("✅ JwtAuthenticationFilter: Extracted authorities from JWT: " + authoritiesList);
                return authorities;
            } else {
                System.err.println("⚠️ JwtAuthenticationFilter: No authorities found in JWT claims");
            }
        } catch (Exception e) {
            System.err.println("❌ JwtAuthenticationFilter: Error extracting authorities from JWT: " + e.getMessage());
            e.printStackTrace();
        }
        return List.of();
    }
}
