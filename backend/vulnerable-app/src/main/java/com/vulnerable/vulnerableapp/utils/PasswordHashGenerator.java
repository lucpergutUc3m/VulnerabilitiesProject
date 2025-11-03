package com.vulnerable.vulnerableapp.utils;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

/**
 * Utility to generate BCrypt password hashes for seed data
 * Run this main method to generate hashes for data.sql
 */
public class PasswordHashGenerator {
    
    public static void main(String[] args) {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        
        // Generate hash for admin password
        String adminPassword = "admin123";
        String adminHash = encoder.encode(adminPassword);
        System.out.println("Admin password hash for 'admin123':");
        System.out.println(adminHash);
        System.out.println();
        
        // Generate hash for user password
        String userPassword = "user123";
        String userHash = encoder.encode(userPassword);
        System.out.println("User password hash for 'user123':");
        System.out.println(userHash);
    }
}
