#!/bin/bash

# ========================================
# Run Backend Locally (NO Docker needed)
# Uses H2 file database with web console
# For Linux/Mac/WSL users
# ========================================

set -e

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo ""
echo "========================================"
echo "Starting Backend in LOCAL mode"
echo "========================================"
echo ""

cd "$PROJECT_ROOT"

echo "Backend: http://localhost:8080"
echo "H2 Console: http://localhost:8080/h2-console"
echo ""
echo "H2 Console Login:"
echo "  - JDBC URL: jdbc:h2:file:$PROJECT_ROOT/data/vulnerableapp-dev"
echo "  - Username: sa"
echo "  - Password: (leave empty)"
echo ""
echo "IMPORTANT: In the H2 console, REPLACE the default"
echo '"jdbc:h2:~/test" with the JDBC URL shown above!'
echo ""
echo "Seeding Status:"
echo "  - Seeders will run AUTOMATICALLY on startup"
echo "  - Profile active: local,seeder"
echo "  - Check logs for: 'Iniciando seeding de base de datos...'"
echo ""
echo "========================================"
echo ""

# Set the profile to 'local' with seeders enabled
export SPRING_PROFILES_ACTIVE=local,seeder

echo "Starting Maven Spring Boot application..."
echo "SPRING_PROFILES_ACTIVE=$SPRING_PROFILES_ACTIVE"
echo ""

# Start the application
if [ -f "$PROJECT_ROOT/mvnw" ]; then
    "$PROJECT_ROOT/mvnw" spring-boot:run
else
    echo "Error: mvnw not found in $PROJECT_ROOT"
    exit 1
fi

