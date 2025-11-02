# Database GUI Access Guide

## Quick Start

### Option 1: H2 Database (File-based - Default for local development)
The application now uses a **file-based H2 database** that persists data in the `./data` folder.

**GUI Access:**
- URL: http://localhost:8080/h2-console
- JDBC URL: `jdbc:h2:file:./data/vulnerableapp`
- Username: `sa`
- Password: (leave empty)

### Option 2: PostgreSQL with Adminer (Recommended for Docker)

#### 1. Start PostgreSQL and Adminer:
```cmd
docker-compose up -d
```

#### 2. Access Adminer (Web-based Database GUI):
- URL: http://localhost:8081
- System: **PostgreSQL**
- Server: **postgres**
- Username: **dbuser**
- Password: **dbpassword**
- Database: **vulnerableappdb**

#### 3. Run Backend with PostgreSQL:
```cmd
mvnw.cmd spring-boot:run -Dspring-boot.run.profiles=postgres
```

Or set the profile in your IDE:
- Active profiles: `postgres`

## Database Comparison

| Feature | H2 (Default) | PostgreSQL (Docker) |
|---------|--------------|---------------------|
| Setup | No setup needed | Requires Docker |
| GUI Tool | H2 Console (built-in) | Adminer (web-based) |
| Data Persistence | File in ./data folder | Docker volume |
| Production-like | No | Yes |
| GUI Quality | Basic | Full-featured (like HeidiSQL) |

## Docker Commands

```cmd
# Start database and Adminer
docker-compose up -d

# Stop services
docker-compose down

# Stop and remove data
docker-compose down -v

# View logs
docker-compose logs -f postgres
```

## Adminer Features
Adminer is a full-featured database management tool that supports:
- Browse tables and data
- Execute SQL queries
- Edit data inline
- Export/Import data
- View table structure
- Create/modify tables
- Similar experience to HeidiSQL/phpMyAdmin
