package com.vulnerable.vulnerableapp.config;

import com.vulnerable.vulnerableapp.entity.AppUser;
import com.vulnerable.vulnerableapp.repository.AppUserRepository;
import com.vulnerable.vulnerableapp.utils.UserRoles;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * Seeds the database with initial admin and user accounts on application startup.
 * Only creates users if they don't already exist.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class DatabaseSeeder implements CommandLineRunner {
    
    private final AppUserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    
    @Override
    public void run(String... args) {
        log.info("🌱 Running database seeder...");
        
        seedAdminUser();
        seedRegularUser();
        
        log.info("✅ Database seeding completed!");
    }
    
    private void seedAdminUser() {
        String adminEmail = "admin@admin.com";
        
        if (userRepository.existsByEmail(adminEmail)) {
            log.info("ℹ️  Admin user already exists: {}", adminEmail);
            return;
        }
        
        AppUser admin = AppUser.builder()
                .email(adminEmail)
                .name("System Administrator")
                .passwordHash(passwordEncoder.encode("admin123"))
                .role(UserRoles.ADMIN.getValue())
                .build();
        
        userRepository.save(admin);
        log.info("✅ Admin user created: {} (Password: admin123)", adminEmail);
    }
    
    private void seedRegularUser() {
        String userEmail = "user@user.com";
        
        if (userRepository.existsByEmail(userEmail)) {
            log.info("ℹ️  Regular user already exists: {}", userEmail);
            return;
        }
        
        AppUser user = AppUser.builder()
                .email(userEmail)
                .name("Regular User")
                .passwordHash(passwordEncoder.encode("user123"))
                .role(UserRoles.USER.getValue())
                .build();
        
        userRepository.save(user);
        log.info("✅ Regular user created: {} (Password: user123)", userEmail);
    }
}
