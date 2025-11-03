package com.vulnerable.vulnerableapp.seeder;

import com.vulnerable.vulnerableapp.entity.AppUser;
import com.vulnerable.vulnerableapp.entity.TestEntity;
import com.vulnerable.vulnerableapp.repository.AppUserRepository;
import com.vulnerable.vulnerableapp.repository.TestEntityRepository;
import com.vulnerable.vulnerableapp.utils.UserRoles;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Servicio para gestionar seeders de forma manual
 * Útil para testing, demostración y reset de datos
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class SeederService {

    private final AppUserRepository userRepository;
    private final TestEntityRepository testRepository;
    private final PasswordEncoder passwordEncoder;

    /**
     * Verifica si la base de datos tiene datos
     */
    public boolean hasData() {
        return userRepository.count() > 0;
    }

    /**
     * Limpia todos los datos de la base de datos
     * ⚠️ PELIGROSO: Borra todos los usuarios y tests
     */
    @Transactional
    public void clearAllData() {
        log.warn("⚠️  Limpiando toda la base de datos...");
        testRepository.deleteAll();
        userRepository.deleteAll();
        log.warn("✓ Base de datos limpiada");
    }

    /**
     * Ejecuta el seeding de datos básicos
     */
    @Transactional
    public SeederResult seedBasicData() {
        if (hasData()) {
            return new SeederResult(false, "La base de datos ya contiene datos");
        }

        try {
            log.info("Iniciando seeding básico...");
            
            // Crear usuarios
            List<AppUser> users = createBasicUsers();
            userRepository.saveAll(users);
            
            // Crear tests
            List<TestEntity> tests = createBasicTests(users);
            testRepository.saveAll(tests);
            
            String message = String.format(
                "✓ Seeding completado: %d usuarios y %d tests creados",
                users.size(),
                tests.size()
            );
            log.info(message);
            return new SeederResult(true, message);
        } catch (Exception e) {
            log.error("Error durante seeding", e);
            return new SeederResult(false, "Error: " + e.getMessage());
        }
    }

    /**
     * Agrega un usuario individual
     */
    @Transactional
    public AppUser addUser(String email, String name, String password, Integer role) {
        AppUser user = AppUser.builder()
                .email(email)
                .name(name)
                .passwordHash(passwordEncoder.encode(password))
                .role(role)
                .build();
        userRepository.save(user);
        log.info("✓ Usuario creado: {}", email);
        return user;
    }

    /**
     * Agrega un test individual
     */
    @Transactional
    public TestEntity addTest(String title, String topic, String emoji,
                             String description, String questionsJson,
                             Integer timeLimitMinutes, AppUser owner, Boolean isPublic) {
        TestEntity test = TestEntity.builder()
                .title(title)
                .topic(topic)
                .emoji(emoji)
                .description(description)
                .questionsJson(questionsJson)
                .timeLimitMinutes(timeLimitMinutes)
                .owner(owner)
                .isPublic(isPublic)
                .build();
        testRepository.save(test);
        log.info("✓ Test creado: {}", title);
        return test;
    }

    /**
     * Obtiene estadísticas de la base de datos
     */
    public DatabaseStats getStats() {
        return DatabaseStats.builder()
                .totalUsers(userRepository.count())
                .totalTests(testRepository.count())
                .adminUsers(countAdminUsers())
                .publicTests(countPublicTests())
                .build();
    }

    private long countAdminUsers() {
        return userRepository.findAll().stream()
                .filter(u -> u.getRole().equals(UserRoles.ADMIN.getValue()))
                .count();
    }

    private long countPublicTests() {
        return testRepository.findAll().stream()
                .filter(TestEntity::getIsPublic)
                .count();
    }

    private List<AppUser> createBasicUsers() {
        return List.of(
            AppUser.builder()
                    .email("admin@example.com")
                    .name("Admin User")
                    .passwordHash(passwordEncoder.encode("admin123"))
                    .role(UserRoles.ADMIN.getValue())
                    .build(),
            AppUser.builder()
                    .email("john.doe@example.com")
                    .name("John Doe")
                    .passwordHash(passwordEncoder.encode("password123"))
                    .role(UserRoles.USER.getValue())
                    .build(),
            AppUser.builder()
                    .email("jane.smith@example.com")
                    .name("Jane Smith")
                    .passwordHash(passwordEncoder.encode("password123"))
                    .role(UserRoles.USER.getValue())
                    .build()
        );
    }

    private List<TestEntity> createBasicTests(List<AppUser> users) {
        // Simplificado - solo estructura, el JSON se maneja en el seeder principal
        return List.of();
    }

    /**
     * DTO para resultados de seeding
     */
    public static class SeederResult {
        public boolean success;
        public String message;

        public SeederResult(boolean success, String message) {
            this.success = success;
            this.message = message;
        }
    }

    /**
     * DTO para estadísticas
     */
    @lombok.Builder
    public static class DatabaseStats {
        public long totalUsers;
        public long totalTests;
        public long adminUsers;
        public long publicTests;
    }
}
