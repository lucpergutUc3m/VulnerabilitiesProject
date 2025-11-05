package com.vulnerable.vulnerableapp.seeder;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.vulnerable.vulnerableapp.entity.AppUser;
import com.vulnerable.vulnerableapp.entity.TestEntity;
import com.vulnerable.vulnerableapp.repository.AppUserRepository;
import com.vulnerable.vulnerableapp.repository.TestEntityRepository;
import com.vulnerable.vulnerableapp.utils.UserRoles;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.*;

/**
 * DataSeeder se ejecuta automáticamente cuando el perfil "seeder" está activo.
 * 
 * Activado en:
 * - application-local.properties (spring.profiles.active=local,seeder)
 * - application-docker-dev.properties (spring.profiles.active=docker-dev,seeder)
 * 
 * Verifica si la BD ya contiene datos antes de crear nuevos para evitar duplicados.
 */
@Configuration
@Profile("seeder")
@Slf4j
public class DataSeeder {

    /**
     * Se ejecuta automáticamente si el perfil "seeder" está activo
     */
    @Bean
    public CommandLineRunner seedDatabase(
            AppUserRepository userRepository,
            TestEntityRepository testRepository,
            PasswordEncoder encoder) {
        
        return args -> {
            // Solo ejecutar si la base de datos está vacía
            if (userRepository.count() == 0) {
                log.info("Iniciando seeding de base de datos...");
                
                // Crear usuarios de prueba
                List<AppUser> users = createUsers(encoder);
                userRepository.saveAll(users);
                log.info("✓ {} usuarios creados", users.size());
                
                // Crear tests
                List<TestEntity> tests = createTests(users);
                testRepository.saveAll(tests);
                log.info("✓ {} tests creados", tests.size());
                
                log.info("✓ Seeding completado exitosamente");
            } else {
                log.info("Base de datos ya contiene datos. Saltando seeding...");
            }
        };
    }

    private List<AppUser> createUsers(PasswordEncoder encoder) {
        List<AppUser> users = new ArrayList<>();

        // Admin user
        users.add(AppUser.builder()
                .email("admin@example.com")
                .name("Admin User")
                .passwordHash(encoder.encode("admin123"))
                .role(UserRoles.ADMIN.getValue())
                .build());

        // Regular users
        users.add(AppUser.builder()
                .email("john.doe@example.com")
                .name("John Doe")
                .passwordHash(encoder.encode("password123"))
                .role(UserRoles.USER.getValue())
                .build());

        users.add(AppUser.builder()
                .email("jane.smith@example.com")
                .name("Jane Smith")
                .passwordHash(encoder.encode("password123"))
                .role(UserRoles.USER.getValue())
                .build());

        users.add(AppUser.builder()
                .email("bob.wilson@example.com")
                .name("Bob Wilson")
                .passwordHash(encoder.encode("password123"))
                .role(UserRoles.USER.getValue())
                .build());

        users.add(AppUser.builder()
                .email("alice.johnson@example.com")
                .name("Alice Johnson")
                .passwordHash(encoder.encode("password123"))
                .role(UserRoles.USER.getValue())
                .build());

        return users;
    }

    private List<TestEntity> createTests(List<AppUser> users) {
        List<TestEntity> tests = new ArrayList<>();
        ObjectMapper mapper = new ObjectMapper();
        
        AppUser admin = users.get(0);
        AppUser john = users.get(1);
        AppUser jane = users.get(2);

        // Test 1: Java Fundamentals
        try {
            List<Map<String, Object>> questions1 = List.of(
                Map.of(
                    "question", "¿Cuál es la salida del siguiente código?\nint x = 5;\nint y = ++x;\nSystem.out.println(x + \" \" + y);",
                    "options", List.of("5 5", "5 6", "6 6", "6 5"),
                    "correctAnswer", 2
                ),
                Map.of(
                    "question", "¿Cuál es la diferencia principal entre ArrayList y LinkedList?",
                    "options", List.of(
                        "ArrayList es más rápido para buscar",
                        "LinkedList es más rápido para buscar",
                        "No hay diferencia",
                        "ArrayList usa menos memoria"
                    ),
                    "correctAnswer", 0
                ),
                Map.of(
                    "question", "¿Qué palabra clave se usa para crear una subclase?",
                    "options", List.of("extends", "implements", "inherits", "super"),
                    "correctAnswer", 0
                )
            );
            
            tests.add(TestEntity.builder()
                    .title("Java Fundamentals")
                    .topic("Programming")
                    .emoji("☕")
                    .description("Test sobre conceptos fundamentales de Java")
                    .questionsJson(mapper.writeValueAsString(questions1))
                    .timeLimitMinutes(30)
                    .owner(admin)
                    .isPublic(true)
                    .build());
        } catch (Exception e) {
            log.error("Error creando test 1", e);
        }

        // Test 2: Web Security
        try {
            List<Map<String, Object>> questions2 = List.of(
                Map.of(
                    "question", "¿Cuál es la principal función de HTTPS?",
                    "options", List.of(
                        "Aumentar la velocidad de conexión",
                        "Encriptar la comunicación entre cliente y servidor",
                        "Reducir el tamaño de los datos",
                        "Mejorar el SEO"
                    ),
                    "correctAnswer", 1
                ),
                Map.of(
                    "question", "¿Qué es un ataque CSRF?",
                    "options", List.of(
                        "Cross-Site Request Forgery",
                        "Cross-Site Resource Failure",
                        "Cross-Server Response Format",
                        "Collective Security Request Filter"
                    ),
                    "correctAnswer", 0
                ),
                Map.of(
                    "question", "¿Cuál es la mejor práctica para almacenar contraseñas?",
                    "options", List.of(
                        "En texto plano",
                        "Encriptadas con AES",
                        "Con hash seguro + salt",
                        "Codificadas en Base64"
                    ),
                    "correctAnswer", 2
                )
            );
            
            tests.add(TestEntity.builder()
                    .title("Web Security Basics")
                    .topic("Security")
                    .emoji("🔒")
                    .description("Conceptos básicos de seguridad web")
                    .questionsJson(mapper.writeValueAsString(questions2))
                    .timeLimitMinutes(25)
                    .owner(john)
                    .isPublic(true)
                    .build());
        } catch (Exception e) {
            log.error("Error creando test 2", e);
        }

        // Test 3: SQL Basics
        try {
            List<Map<String, Object>> questions3 = List.of(
                Map.of(
                    "question", "¿Cuál es la sentencia correcta para seleccionar todos los usuarios con edad mayor a 18?",
                    "options", List.of(
                        "SELECT * FROM users WHERE age > 18",
                        "SELECT * FROM users IF age > 18",
                        "SEARCH users WHERE age > 18",
                        "FIND * FROM users WHERE age > 18"
                    ),
                    "correctAnswer", 0
                ),
                Map.of(
                    "question", "¿Qué hace la cláusula LEFT JOIN?",
                    "options", List.of(
                        "Retorna solo registros coincidentes",
                        "Retorna todos los registros de la tabla izquierda y los coincidentes de la derecha",
                        "Retorna todos los registros de ambas tablas",
                        "Retorna registros ordenados a la izquierda"
                    ),
                    "correctAnswer", 1
                ),
                Map.of(
                    "question", "¿Cuál es la función correcta para contar registros en SQL?",
                    "options", List.of("CANTIDAD()", "COUNT()", "CONTAR()", "TOTAL()"),
                    "correctAnswer", 1
                )
            );
            
            tests.add(TestEntity.builder()
                    .title("SQL Basics")
                    .topic("Databases")
                    .emoji("🗄️")
                    .description("Introducción a consultas SQL")
                    .questionsJson(mapper.writeValueAsString(questions3))
                    .timeLimitMinutes(20)
                    .owner(jane)
                    .isPublic(true)
                    .build());
        } catch (Exception e) {
            log.error("Error creando test 3", e);
        }

        // Test 4: Spring Boot (private)
        try {
            List<Map<String, Object>> questions4 = List.of(
                Map.of(
                    "question", "¿Cuál es la anotación principal en Spring Boot?",
                    "options", List.of("@SpringBootApplication", "@Application", "@SpringApp", "@Boot"),
                    "correctAnswer", 0
                ),
                Map.of(
                    "question", "¿Qué es la inyección de dependencias?",
                    "options", List.of(
                        "Un patrón de diseño para acoplar clases",
                        "Un patrón para proporcionar las dependencias que necesita un objeto",
                        "Un método de compilación",
                        "Un tipo de testing"
                    ),
                    "correctAnswer", 1
                )
            );
            
            tests.add(TestEntity.builder()
                    .title("Spring Boot Advanced")
                    .topic("Framework")
                    .emoji("🚀")
                    .description("Conceptos avanzados de Spring Boot (Privado)")
                    .questionsJson(mapper.writeValueAsString(questions4))
                    .timeLimitMinutes(45)
                    .owner(admin)
                    .isPublic(false)
                    .build());
        } catch (Exception e) {
            log.error("Error creando test 4", e);
        }

        // Test 5: API REST
        try {
            List<Map<String, Object>> questions5 = List.of(
                Map.of(
                    "question", "¿Cuál es el método HTTP correcto para crear un nuevo recurso?",
                    "options", List.of("GET", "POST", "PUT", "DELETE"),
                    "correctAnswer", 1
                ),
                Map.of(
                    "question", "¿Qué código de estado indica éxito en una solicitud POST?",
                    "options", List.of("200", "201", "204", "400"),
                    "correctAnswer", 1
                ),
                Map.of(
                    "question", "¿Qué significa REST?",
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
                    .description("Conceptos de desarrollo de APIs REST")
                    .questionsJson(mapper.writeValueAsString(questions5))
                    .timeLimitMinutes(30)
                    .owner(john)
                    .isPublic(true)
                    .build());
        } catch (Exception e) {
            log.error("Error creando test 5", e);
        }

        return tests;
    }
}
