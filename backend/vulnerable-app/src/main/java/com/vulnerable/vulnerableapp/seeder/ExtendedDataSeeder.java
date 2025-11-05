package com.vulnerable.vulnerableapp.seeder;

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

import java.util.ArrayList;
import java.util.List;

/**
 * Seeder adicional para crear más tests según el perfil
 * Se ejecuta solo si la aplicación se inicia con el perfil 'seeder-extended'
 * 
 * Uso: java -Dspring.profiles.active=seeder-extended
 */
@Configuration
@Profile("seeder-extended")
@Slf4j
public class ExtendedDataSeeder {

    @Bean
    public CommandLineRunner seedExtendedData(
            AppUserRepository userRepository,
            TestEntityRepository testRepository,
            PasswordEncoder encoder) {
        
        return args -> {
            // Solo si hay usuarios (el DataSeeder ya debería haber corrido)
            if (userRepository.count() > 0) {
                log.info("Ejecutando seeding extendido...");
                
                AppUser admin = userRepository.findByEmail("admin@example.com")
                        .orElse(null);
                
                if (admin != null) {
                    List<TestEntity> extendedTests = createExtendedTests(admin);
                    testRepository.saveAll(extendedTests);
                    log.info("✓ {} tests adicionales creados", extendedTests.size());
                }
                
                log.info("✓ Seeding extendido completado");
            }
        };
    }

    private List<TestEntity> createExtendedTests(AppUser owner) {
        List<TestEntity> tests = new ArrayList<>();

        // Test: Python Basics
        tests.add(SeederUtils.createTest(
            "Python Fundamentals",
            "Programming",
            "🐍",
            "Conceptos básicos de Python",
            List.of(
                new SeederUtils.Question(
                    "¿Cuál es la forma correcta de crear una lista en Python?",
                    List.of("list = [1, 2, 3]", "list = (1, 2, 3)", "list = {1, 2, 3}", "list = <1, 2, 3>"),
                    0
                ),
                new SeederUtils.Question(
                    "¿Qué función se usa para obtener la longitud de una lista?",
                    List.of("length()", "size()", "len()", "count()"),
                    2
                ),
                new SeederUtils.Question(
                    "¿Cuál es la diferencia entre == y is en Python?",
                    List.of(
                        "== compara valor, is compara identidad",
                        "Son exactamente lo mismo",
                        "is compara valor, == compara identidad",
                        "== solo funciona con números"
                    ),
                    0
                ),
                new SeederUtils.Question(
                    "¿Qué es un diccionario en Python?",
                    List.of(
                        "Una colección ordenada de números",
                        "Una colección de pares clave-valor",
                        "Un tipo de cadena de texto",
                        "Un módulo de Python"
                    ),
                    1
                )
            ),
            40,
            owner,
            true
        ));

        // Test: Docker & Containers
        tests.add(SeederUtils.createTest(
            "Docker Essentials",
            "DevOps",
            "🐳",
            "Conceptos esenciales de Docker",
            List.of(
                new SeederUtils.Question(
                    "¿Qué es un contenedor Docker?",
                    List.of(
                        "Una máquina virtual completa",
                        "Una unidad empaquetada de software con todo lo que necesita",
                        "Un almacén de datos",
                        "Un lenguaje de programación"
                    ),
                    1
                ),
                new SeederUtils.Question(
                    "¿Cuál es la diferencia entre una imagen y un contenedor?",
                    List.of(
                        "No hay diferencia",
                        "Una imagen es estática, un contenedor es una instancia en ejecución",
                        "Un contenedor es estático, una imagen es dinámica",
                        "Las imágenes solo funcionan en Windows"
                    ),
                    1
                ),
                new SeederUtils.Question(
                    "¿Cuál es el comando para ejecutar un contenedor?",
                    List.of("docker start", "docker run", "docker execute", "docker create"),
                    1
                )
            ),
            25,
            owner,
            true
        ));

        // Test: Git & Version Control
        tests.add(SeederUtils.createTest(
            "Git Fundamentals",
            "Tools",
            "📦",
            "Control de versiones con Git",
            List.of(
                new SeederUtils.Question(
                    "¿Qué comando crea un nuevo repositorio Git?",
                    List.of("git new", "git create", "git init", "git start"),
                    2
                ),
                new SeederUtils.Question(
                    "¿Cuál es la diferencia entre git add y git commit?",
                    List.of(
                        "add indexa cambios, commit los guarda en el historial",
                        "commit indexa, add guarda",
                        "Son lo mismo",
                        "add solo funciona con archivos nuevos"
                    ),
                    0
                ),
                new SeederUtils.Question(
                    "¿Qué es una rama (branch) en Git?",
                    List.of(
                        "Una copia completa del repositorio",
                        "Un línea de desarrollo independiente",
                        "Un tipo de archivo",
                        "Una carpeta especial"
                    ),
                    1
                ),
                new SeederUtils.Question(
                    "¿Cuál es el comando para cambiar de rama?",
                    List.of("git branch", "git switch", "git move", "git change"),
                    1
                )
            ),
            30,
            owner,
            true
        ));

        // Test: HTML & CSS
        tests.add(SeederUtils.createTest(
            "HTML & CSS Basics",
            "Frontend",
            "🎨",
            "Fundamentos de HTML y CSS",
            List.of(
                new SeederUtils.Question(
                    "¿Cuál es la etiqueta correcta para un párrafo?",
                    List.of("<p>", "<paragraph>", "<par>", "<text>"),
                    0
                ),
                new SeederUtils.Question(
                    "¿Cómo se define un ID en CSS?",
                    List.of(".id-name", "#id-name", "@id-name", "$id-name"),
                    1
                ),
                new SeederUtils.Question(
                    "¿Cuál es la especificidad correcta: elemento < clase < ID?",
                    List.of(
                        "Incorrecto",
                        "Correcto",
                        "Depende del navegador",
                        "Solo en CSS3"
                    ),
                    1
                ),
                new SeederUtils.Question(
                    "¿Qué propiedad CSS centra el contenido horizontalmente?",
                    List.of("text-align: center", "margin-align: center", "center", "text-center"),
                    0
                )
            ),
            25,
            owner,
            true
        ));

        // Test: Database Design
        tests.add(SeederUtils.createTest(
            "Database Design",
            "Databases",
            "📊",
            "Diseño de bases de datos relacionales",
            List.of(
                new SeederUtils.Question(
                    "¿Qué es una clave primaria?",
                    List.of(
                        "Un identificador único para cada fila",
                        "La primera columna de una tabla",
                        "Un índice especial",
                        "Un campo obligatorio"
                    ),
                    0
                ),
                new SeederUtils.Question(
                    "¿Qué es una clave foránea?",
                    List.of(
                        "Una clave de otra tabla",
                        "Un identificador único global",
                        "Una referencia a la clave primaria de otra tabla",
                        "Un tipo de índice"
                    ),
                    2
                ),
                new SeederUtils.Question(
                    "¿Cuál es el objetivo de la normalización?",
                    List.of(
                        "Aumentar velocidad de consultas",
                        "Reducir redundancia y mejorar integridad",
                        "Encriptar datos",
                        "Crear más tablas"
                    ),
                    1
                )
            ),
            35,
            owner,
            true
        ));

        // Test: API Security
        tests.add(SeederUtils.createTest(
            "API Security",
            "Security",
            "🛡️",
            "Seguridad en APIs y autenticación",
            List.of(
                new SeederUtils.Question(
                    "¿Qué es OAuth 2.0?",
                    List.of(
                        "Un protocolo de autenticación delegada",
                        "Una encriptación de datos",
                        "Un tipo de base de datos",
                        "Un lenguaje de marcado"
                    ),
                    0
                ),
                new SeederUtils.Question(
                    "¿Cuál es la ventaja de usar JWT en APIs?",
                    List.of(
                        "Menor consumo de memoria del servidor",
                        "No requieren validación en servidor",
                        "Son más rápidos que sesiones",
                        "Son inmutables"
                    ),
                    0
                ),
                new SeederUtils.Question(
                    "¿Qué es CORS?",
                    List.of(
                        "Cross-Origin Resource Sharing - permite solicitudes entre dominios",
                        "Conjunto de reglas de codificación",
                        "Una base de datos distribuida",
                        "Un framework web"
                    ),
                    0
                )
            ),
            30,
            owner,
            true
        ));

        // Test: React Fundamentals (Privado)
        tests.add(SeederUtils.createTest(
            "React Advanced Concepts",
            "Frontend",
            "⚛️",
            "Conceptos avanzados de React (Privado)",
            List.of(
                new SeederUtils.Question(
                    "¿Qué es un Hook en React?",
                    List.of(
                        "Una función que permite usar estado en componentes funcionales",
                        "Un ciclo de vida del componente",
                        "Una librería externa",
                        "Un tipo de prop"
                    ),
                    0
                ),
                new SeederUtils.Question(
                    "¿Cuál es la diferencia entre useState y useEffect?",
                    List.of(
                        "useState maneja estado, useEffect maneja efectos secundarios",
                        "Son exactamente lo mismo",
                        "useEffect solo funciona en componentes clase",
                        "useState se usa en CSS"
                    ),
                    0
                ),
                new SeederUtils.Question(
                    "¿Qué es el Virtual DOM?",
                    List.of(
                        "Una representación en memoria del DOM real",
                        "Un servidor virtual",
                        "Un tipo de navegador",
                        "Un patrón de diseño"
                    ),
                    0
                )
            ),
            50,
            owner,
            false
        ));

        return tests;
    }
}
