package com.vulnerable.vulnerableapp.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.vulnerable.vulnerableapp.entity.AppUser;
import com.vulnerable.vulnerableapp.entity.TestEntity;
import com.vulnerable.vulnerableapp.entity.TestRating;
import com.vulnerable.vulnerableapp.repository.AppUserRepository;
import com.vulnerable.vulnerableapp.repository.TestEntityRepository;
import com.vulnerable.vulnerableapp.repository.TestRatingRepository;
import com.vulnerable.vulnerableapp.utils.UserRoles;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.*;

/**
 * Seeds the database with initial users and tests on application startup.
 * Only creates data if the database is empty to avoid duplicates.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class DatabaseSeeder implements CommandLineRunner {
    
    private final AppUserRepository userRepository;
    private final TestEntityRepository testRepository;
    private final TestRatingRepository testRatingRepository;
    private final PasswordEncoder passwordEncoder;
    private final ObjectMapper objectMapper = new ObjectMapper();
    
    @Override
    public void run(String... args) {
        // Only run if database is empty
        if (userRepository.count() > 0) {
            log.info("ℹ️  Database already contains data. Skipping seeding...");
            return;
        }
        
        log.info("🌱 Starting database seeding...");
        
        // Create users
        List<AppUser> users = createUsers();
        userRepository.saveAll(users);
        log.info("✅ {} users created", users.size());
        
        // Create tests
        List<TestEntity> tests = createTests(users);
        testRepository.saveAll(tests);
        log.info("✅ {} tests created", tests.size());
        
        // Create ratings for public tests
        List<TestRating> ratings = createRatings(tests, users);
        testRatingRepository.saveAll(ratings);
        log.info("✅ {} ratings created", ratings.size());
        
        log.info("✅ Database seeding completed!");
        logCredentials();
    }
    
    private List<AppUser> createUsers() {
        List<AppUser> users = new ArrayList<>();

        // Main admin
        users.add(AppUser.builder()
                .email("admin@admin.com")
                .name("System Administrator")
                .passwordHash(passwordEncoder.encode("admin123"))
                .role(UserRoles.ADMIN.getValue())
                .build());

        // Secondary admin
        users.add(AppUser.builder()
                .email("admin@example.com")
                .name("Admin User")
                .passwordHash(passwordEncoder.encode("admin123"))
                .role(UserRoles.ADMIN.getValue())
                .build());

        // Basic regular user
        users.add(AppUser.builder()
                .email("user@user.com")
                .name("Regular User")
                .passwordHash(passwordEncoder.encode("user123"))
                .role(UserRoles.USER.getValue())
                .build());

        // Test users
        users.add(AppUser.builder()
                .email("john.doe@example.com")
                .name("John Doe")
                .passwordHash(passwordEncoder.encode("password123"))
                .role(UserRoles.USER.getValue())
                .build());

        users.add(AppUser.builder()
                .email("jane.smith@example.com")
                .name("Jane Smith")
                .passwordHash(passwordEncoder.encode("password123"))
                .role(UserRoles.USER.getValue())
                .build());

        users.add(AppUser.builder()
                .email("bob.wilson@example.com")
                .name("Bob Wilson")
                .passwordHash(passwordEncoder.encode("password123"))
                .role(UserRoles.USER.getValue())
                .build());

        users.add(AppUser.builder()
                .email("alice.johnson@example.com")
                .name("Alice Johnson")
                .passwordHash(passwordEncoder.encode("password123"))
                .role(UserRoles.USER.getValue())
                .build());

        return users;
    }

    private List<TestEntity> createTests(List<AppUser> users) {
        List<TestEntity> tests = new ArrayList<>();
        
        AppUser admin = users.get(0);
        AppUser john = users.get(3);
        AppUser jane = users.get(4);

        // Test 1: Java Fundamentals
        try {
            List<Map<String, Object>> questions1 = List.of(
                Map.of(
                    "question", "What is the output of the following code?\nint x = 5;\nint y = ++x;\nSystem.out.println(x + \" \" + y);",
                    "options", List.of("5 5", "5 6", "6 6", "6 5"),
                    "correctAnswer", 2
                ),
                Map.of(
                    "question", "What is the main difference between ArrayList and LinkedList?",
                    "options", List.of(
                        "ArrayList is faster for searching",
                        "LinkedList is faster for searching",
                        "There is no difference",
                        "ArrayList uses less memory"
                    ),
                    "correctAnswer", 0
                ),
                Map.of(
                    "question", "Which keyword is used to create a subclass?",
                    "options", List.of("extends", "implements", "inherits", "super"),
                    "correctAnswer", 0
                )
            );
            
            tests.add(TestEntity.builder()
                    .title("Java Fundamentals")
                    .topic("Programming")
                    .emoji("☕")
                    .description("Test on fundamental Java concepts")
                    .questionsJson(objectMapper.writeValueAsString(questions1))
                    .timeLimitMinutes(30)
                    .ownerId(admin.getId())
                    .isPublic(true)
                    .build());
        } catch (Exception e) {
            log.error("Error creating test 1", e);
        }

        // Test 2: Web Security
        try {
            List<Map<String, Object>> questions2 = List.of(
                Map.of(
                    "question", "What is the main function of HTTPS?",
                    "options", List.of(
                        "Increase connection speed",
                        "Encrypt communication between client and server",
                        "Reduce data size",
                        "Improve SEO"
                    ),
                    "correctAnswer", 1
                ),
                Map.of(
                    "question", "What is a CSRF attack?",
                    "options", List.of(
                        "Cross-Site Request Forgery",
                        "Cross-Site Resource Failure",
                        "Cross-Server Response Format",
                        "Collective Security Request Filter"
                    ),
                    "correctAnswer", 0
                ),
                Map.of(
                    "question", "What is the best practice for storing passwords?",
                    "options", List.of(
                        "In plain text",
                        "Encrypted with AES",
                        "With secure hash + salt",
                        "Encoded in Base64"
                    ),
                    "correctAnswer", 2
                )
            );
            
            tests.add(TestEntity.builder()
                    .title("Web Security Basics")
                    .topic("Security")
                    .emoji("🔒")
                    .description("Basic web security concepts")
                    .questionsJson(objectMapper.writeValueAsString(questions2))
                    .timeLimitMinutes(25)
                    .ownerId(john.getId())
                    .isPublic(true)
                    .build());
        } catch (Exception e) {
            log.error("Error creating test 2", e);
        }

        // Test 3: SQL Basics
        try {
            List<Map<String, Object>> questions3 = List.of(
                Map.of(
                    "question", "What is the correct statement to select all users older than 18?",
                    "options", List.of(
                        "SELECT * FROM users WHERE age > 18",
                        "SELECT * FROM users IF age > 18",
                        "SEARCH users WHERE age > 18",
                        "FIND * FROM users WHERE age > 18"
                    ),
                    "correctAnswer", 0
                ),
                Map.of(
                    "question", "What does the LEFT JOIN clause do?",
                    "options", List.of(
                        "Returns only matching records",
                        "Returns all records from the left table and matching ones from the right",
                        "Returns all records from both tables",
                        "Returns records sorted to the left"
                    ),
                    "correctAnswer", 1
                ),
                Map.of(
                    "question", "What is the correct function to count records in SQL?",
                    "options", List.of("CANTIDAD()", "COUNT()", "CONTAR()", "TOTAL()"),
                    "correctAnswer", 1
                )
            );
            
            tests.add(TestEntity.builder()
                    .title("SQL Basics")
                    .topic("Databases")
                    .emoji("🗄️")
                    .description("Introduction to SQL queries")
                    .questionsJson(objectMapper.writeValueAsString(questions3))
                    .timeLimitMinutes(20)
                    .ownerId(jane.getId())
                    .isPublic(true)
                    .build());
        } catch (Exception e) {
            log.error("Error creating test 3", e);
        }

        // Test 4: Spring Boot (private)
        try {
            List<Map<String, Object>> questions4 = List.of(
                Map.of(
                    "question", "What is the main annotation in Spring Boot?",
                    "options", List.of("@SpringBootApplication", "@Application", "@SpringApp", "@Boot"),
                    "correctAnswer", 0
                ),
                Map.of(
                    "question", "What is dependency injection?",
                    "options", List.of(
                        "A design pattern for coupling classes",
                        "A pattern to provide the dependencies an object needs",
                        "A compilation method",
                        "A type of testing"
                    ),
                    "correctAnswer", 1
                )
            );
            
            tests.add(TestEntity.builder()
                    .title("Spring Boot Advanced")
                    .topic("Framework")
                    .emoji("🚀")
                    .description("Advanced Spring Boot concepts (Private)")
                    .questionsJson(objectMapper.writeValueAsString(questions4))
                    .timeLimitMinutes(45)
                    .ownerId(admin.getId())
                    .isPublic(false)
                    .build());
        } catch (Exception e) {
            log.error("Error creating test 4", e);
        }

        // Test 5: API REST
        try {
            List<Map<String, Object>> questions5 = List.of(
                Map.of(
                    "question", "What is the correct HTTP method to create a new resource?",
                    "options", List.of("GET", "POST", "PUT", "DELETE"),
                    "correctAnswer", 1
                ),
                Map.of(
                    "question", "What status code indicates success in a POST request?",
                    "options", List.of("200", "201", "204", "400"),
                    "correctAnswer", 1
                ),
                Map.of(
                    "question", "What does REST stand for?",
                    "options", List.of(
                        "Remote Execution System Technology",
                        "Representational State Transfer",
                        "Resource Exchange Server Transfer",
                        "Request Execution Standard Tech"
                    ),
                    "correctAnswer", 1
                )
            );
            
            tests.add(TestEntity.builder()
                    .title("API REST Fundamentals")
                    .topic("APIs")
                    .emoji("🔌")
                    .description("REST API development concepts")
                    .questionsJson(objectMapper.writeValueAsString(questions5))
                    .timeLimitMinutes(30)
                    .ownerId(john.getId())
                    .isPublic(true)
                    .build());
        } catch (Exception e) {
            log.error("Error creating test 5", e);
        }

        return tests;
    }
    
    private List<TestRating> createRatings(List<TestEntity> tests, List<AppUser> users) {
        List<TestRating> ratings = new ArrayList<>();
        
        // Get only public tests
        List<TestEntity> publicTests = tests.stream()
                .filter(TestEntity::getIsPublic)
                .toList();
        
        log.info("📊 Creating ratings for {} public tests...", publicTests.size());
        
        // For each public test, add ratings from users who are NOT the owner
        for (TestEntity test : publicTests) {
            log.info("  Rating test: '{}' (owner ID: {})", test.getTitle(), test.getOwnerId());
            
            for (AppUser user : users) {
                // Skip if user is the owner of the test
                if (user.getId().equals(test.getOwnerId())) {
                    log.debug("    ⏭️  Skipping {} (owner cannot rate their own test)", user.getName());
                    continue;
                }
                
                // Create a random rating between 3-5 for most users (simulate realistic ratings)
                // Some users rate 1-2 for variety
                int rating;
                Random random = new Random(user.getId() + test.getId()); // Deterministic but varied
                double randomValue = random.nextDouble();
                
                // 70% chance of good rating (4-5), 20% medium (3), 10% poor (1-2)
                if (randomValue < 0.7) {
                    rating = random.nextInt(2) + 4; // 4 or 5
                } else if (randomValue < 0.9) {
                    rating = 3;
                } else {
                    rating = random.nextInt(2) + 1; // 1 or 2
                }
                
                // Not all users rate all tests - 70% chance to rate
                if (random.nextDouble() > 0.3) {
                    TestRating testRating = TestRating.builder()
                            .userId(user.getId())
                            .testId(test.getId())
                            .rating(rating)
                            .build();
                    ratings.add(testRating);
                    log.debug("    ⭐ {} rated {}/5", user.getName(), rating);
                }
            }
        }
        
        return ratings;
    }
    
    private void logCredentials() {
        log.info("==================================================");
        log.info("📋 TEST CREDENTIALS:");
        log.info("==================================================");
        log.info("👑 Admin: admin@admin.com / admin123");
        log.info("👑 Admin: admin@example.com / admin123");
        log.info("👤 User: user@user.com / user123");
        log.info("👤 User: john.doe@example.com / password123");
        log.info("👤 User: jane.smith@example.com / password123");
        log.info("👤 User: bob.wilson@example.com / password123");
        log.info("👤 User: alice.johnson@example.com / password123");
        log.info("==================================================");
    }
}
