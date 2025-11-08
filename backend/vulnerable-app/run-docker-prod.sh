#!/bin/bash

# ========================================
# Run Backend with Docker (Development)
# Uses PostgreSQL + Adminer GUI
# For Linux/Mac/WSL users
# ========================================

set -e

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo ""
echo "========================================"
echo "Starting Backend in DOCKER-DEV mode"
echo "========================================"
echo "Script location: $SCRIPT_DIR"
echo "Project root: $PROJECT_ROOT"
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "[ERROR] Docker is not running!"
    echo "Please start Docker and try again."
    exit 1
fi

echo "[1/3] Starting PostgreSQL and Adminer..."
echo "Command: docker compose -f devdoc/compose.yaml --profile dev up -d"
echo "Working directory: $SCRIPT_DIR"

cd "$SCRIPT_DIR"
docker compose -f devdoc/compose.yaml --profile dev up -d

if [ $? -ne 0 ]; then
    echo "[ERROR] Failed to start Docker containers!"
    echo ""
    echo "Troubleshooting:"
    echo "- Check if Docker is running"
    echo "- Check if port 5432 (PostgreSQL) is already in use"
    echo "- Check if port 8081 (Adminer) is already in use"
    echo "- Run 'docker ps' to see running containers"
    echo ""
    exit 1
fi

echo ""
echo "[2/3] Waiting for PostgreSQL to be ready..."
echo "Waiting 10 seconds for database initialization..."
sleep 10

echo ""
echo "[3/3] Starting Spring Boot backend..."
echo ""
echo "========================================"
echo "✓ Services Started Successfully!"
echo "========================================"
echo ""
echo "Database: PostgreSQL"
echo "  - Server: localhost:5432"
echo "  - Database: vulnerableappdb"
echo "  - Username: dbuser"
echo "  - Password: dbpassword"
echo ""
echo "Web Services:"
echo "  - Backend API: http://localhost:8080"
echo "  - Adminer (DB GUI): http://localhost:8081"
echo "  - H2 Console: NOT available (using PostgreSQL)"
echo ""
echo "Seeding Status:"
echo "  - Seeders will run AUTOMATICALLY on startup"
echo "  - Profile active: docker-dev,seeder"
echo "  - Check logs for: 'Iniciando seeding de base de datos...'"
echo ""
echo "========================================"
echo ""

# Change to project root
cd "$SCRIPT_DIR"

# Set the profiles - docker for PostgreSQL, seeder for automatic data initialization
export SPRING_PROFILES_ACTIVE=prod,seeder

echo "Starting Maven Spring Boot application..."
echo "SPRING_PROFILES_ACTIVE=$SPRING_PROFILES_ACTIVE"
echo ""

# Start the application
if [ -f "$SCRIPT_DIR/mvnw" ]; then
    "$SCRIPT_DIR/mvnw" spring-boot:run
else
    echo "Error: mvnw not found in $SCRIPT_DIR"
    exit 1
fi

