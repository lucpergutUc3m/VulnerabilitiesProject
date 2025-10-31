package com.vulnerable.vulnerableapp.service;

import com.vulnerable.vulnerableapp.dto.UpdateUserRequest;
import com.vulnerable.vulnerableapp.dto.UserResponse;
import com.vulnerable.vulnerableapp.entity.AppUser;
import com.vulnerable.vulnerableapp.repository.AppUserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserService {
    
    private final AppUserRepository userRepository;
    
    public UserResponse getCurrentUser(AppUser user) {
        return UserResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole())
                .build();
    }
    
    @Transactional
    public UserResponse updateCurrentUser(AppUser user, UpdateUserRequest request) {
        user.setFullName(request.getFullName());
        userRepository.save(user);
        
        return UserResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole())
                .build();
    }
    
    @Transactional
    public void updateUserRole(Long userId, Integer role) {
        AppUser user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        if (role < 0 || role > 2) {
            throw new RuntimeException("Invalid role value");
        }
        
        user.setRole(role);
        userRepository.save(user);
    }
}
