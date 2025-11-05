# VulnerabilitiesProject

Full-stack test application with React (Vite) and Spring Boot, containerized with Docker multi-stage build.

## Quick Start

**Prerequisites:** Docker running on your system, port 8080 available.

```bash
# Build and run
docker build -t vulnerable-app .
docker run -d -p 8080:8080 --name vulnerable-app-container vulnerable-app

# Access at http://localhost:8080
```

The application automatically builds frontend, backend, seeds database, and starts serving.

## Default Credentials

**Admins:**
- `admin@admin.com` / `admin123`
- `admin@example.com` / `admin123`

**Users:**
- `user@user.com` / `user123`
- `john.doe@example.com` / `password123`
- `jane.smith@example.com` / `password123`
- `bob.wilson@example.com` / `password123`
- `alice.johnson@example.com` / `password123`

**Tests:** 5 pre-loaded tests (Java, Security, SQL, Spring Boot, REST APIs)

## Technology Stack

**Frontend:** React 19, TypeScript, Vite 7, React Router, DOMPurify  
**Backend:** Java 21, Spring Boot 3.5.7, Spring Security + JWT, H2 Database, MapStruct, Lombok

## Docker Multi-Stage Build

1. **Frontend Build** (`node:20-alpine`) - Builds React app
2. **Backend Build** (`eclipse-temurin:21-jdk-alpine`) - Integrates frontend into Spring Boot JAR
3. **Runtime** (`eclipse-temurin:21-jre-alpine`) - Final lightweight image (~300MB)

Frontend is served by Spring Boot from `/static`, no CORS issues, single deployable artifact.

## Container Management

```bash
# View logs
docker logs vulnerable-app-container
docker logs -f vulnerable-app-container

# Stop and remove
docker stop vulnerable-app-container
docker rm vulnerable-app-container

# Restart with fresh database
docker stop vulnerable-app-container && docker rm vulnerable-app-container
docker run -d -p 8080:8080 --name vulnerable-app-container vulnerable-app

# Rebuild after code changes
docker build -t vulnerable-app .
```

## H2 Database Console

Access at `http://localhost:8080/h2-console`

- **JDBC URL:** `jdbc:h2:file:/app/data/vulnerableapp-dev`
- **User:** `sa`
- **Password:** (empty)

## API Endpoints

**Auth:**
- POST `/api/auth/login`
- POST `/api/auth/register`
- POST `/api/auth/logout`

**Tests:**
- GET `/api/tests` - All accessible tests
- GET `/api/tests/{id}`
- POST `/api/tests` - Create (authenticated)
- PUT `/api/tests/{id}` - Update (owner)
- DELETE `/api/tests/{id}` - Delete (owner)

**Users:**
- GET `/api/users/me`
- PUT `/api/users/me`
- DELETE `/api/users/me`

**Admin:**
- GET `/api/admin/users` - List all
- PUT `/api/admin/users/{id}` - Update any
- DELETE `/api/admin/users/{id}` - Delete any

## Frontend Routes

- `/` - Home
- `/login` - Login
- `/register` - Register
- `/user` - Profile
- `/test/:testId` - Start test
- `/test/:testId/questions` - Take test
- `/test/:testId/results` - Results

## Security Features

JWT authentication, BCrypt passwords, CORS protection, input validation (Zod), XSS protection (DOMPurify), SQL injection prevention (JPA), role-based access (USER, SUPERUSER, ADMIN).

## Database Seeding

Automatic on first startup if database is empty:
- 7 users (2 admins, 5 users)
- 5 tests with questions

Reset: Stop and remove container, run again.

## Troubleshooting

**Container won't start:**
```bash
docker logs vulnerable-app-container
```

**Port already in use:**
```bash
# Windows
netstat -ano | findstr :8080
# Linux/Mac
lsof -i :8080
```

**Reset everything:**
```bash
docker stop vulnerable-app-container
docker rm vulnerable-app-container
docker build -t vulnerable-app .
docker run -d -p 8080:8080 --name vulnerable-app-container vulnerable-app
```

## Project Structure

```
.
├── Dockerfile              # Multi-stage build
├── frontend/               # React + Vite
│   ├── src/
│   └── package.json
└── backend/
    └── vulnerable-app/     # Spring Boot
        ├── src/
        └── pom.xml
```

---

Educational project for web application security and full-stack development.

