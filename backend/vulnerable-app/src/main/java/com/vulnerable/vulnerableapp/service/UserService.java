package com.vulnerable.vulnerableapp.service;

import com.vulnerable.vulnerableapp.dto.UpdateUserRequest;
import com.vulnerable.vulnerableapp.dto.UserResponse;
import com.vulnerable.vulnerableapp.dto.admin.AdminUpdateUserRequest;
import com.vulnerable.vulnerableapp.entity.AppUser;
import com.vulnerable.vulnerableapp.mapper.UserMapper;
import com.vulnerable.vulnerableapp.repository.AppUserRepository;
import com.vulnerable.vulnerableapp.utils.UserRoles;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {
    
    private final AppUserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final UserMapper userMapper;
    
    /**
     * Get the currently authenticated user from SecurityContext
     * This is safe and thread-safe as SecurityContext is stored in ThreadLocal
     */
    private AppUser getCurrentAuthenticatedUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new RuntimeException("No authenticated user found");
        }
        return (AppUser) authentication.getPrincipal();
    }
    
    public List<UserResponse> getAllUsers() {
        return userRepository.findAll().stream()
                .map(userMapper::toUserResponse)
                .collect(Collectors.toList());
    }
    
    public UserResponse getCurrentUser() {
        AppUser user = getCurrentAuthenticatedUser();
        return userMapper.toUserResponse(user);
    }
    
    @Transactional
    public UserResponse updateCurrentUser(UpdateUserRequest request) {
        AppUser user = getCurrentAuthenticatedUser();
        
        System.out.println("Updating user: " + user);
        
        if (request.getName() != null && !request.getName().isBlank()) {
            user.setName(request.getName());
        }
        
        if (request.getOldPassword() != null && request.getNewPassword() != null && !request.getNewPassword().isBlank()) {
            // Verify old password
            if (!passwordEncoder.matches(request.getOldPassword(), user.getPasswordHash())) {
                throw new RuntimeException("Old password is incorrect");
            }
            user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        }
        
        userRepository.save(user);
        return userMapper.toUserResponse(user);
    }
    
    @Transactional
    public UserResponse adminUpdateUser(Long userId, AdminUpdateUserRequest request) {
        AppUser user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        if (request.getName() != null && !request.getName().isBlank()) {
            user.setName(request.getName());
        }
        
        if (request.getPassword() != null && !request.getPassword().isBlank()) {
            user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        }
        
        if (request.getRole() != null) {
            if (request.getRole() < UserRoles.USER.getValue() || request.getRole() > UserRoles.ADMIN.getValue()) {
                throw new RuntimeException("Invalid role value");
            }
            user.setRole(request.getRole());
        }
        
        userRepository.save(user);
        return userMapper.toUserResponse(user);
    }
    
    @Transactional
    public void adminDeleteUser(Long userId) {
        AppUser user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Note: If you want to prevent admins from deleting themselves, you would need
        // to pass the current admin user as a parameter to this method and check:
        // if (currentAdmin.getId().equals(userId)) {
        //     throw new RuntimeException("Cannot delete your own account");
        // }
        
        userRepository.delete(user);
    }
}