# VulnerabilitiesProject

Full-stack web application with React + Spring Boot. Also deployed on
https://vulnerabilitiesproject.onrender.com/ 


## Prerequisites

- Docker installed and running
- Port 8080 available

## How to Run

```bash
docker build -t vulnerable-app .
docker run -d -p 8080:8080 --name vulnerable-app-container vulnerable-app
```

Access at: `http://localhost:8080`
## Login Credentials

**Admin:** `admin@admin.com` / `admin123`  
**User:** `john.doe@example.com` / `password123`

## Docker Commands

```bash
docker logs vulnerable-app-container
docker stop vulnerable-app-container
docker rm vulnerable-app-container
```

## Technologies

Frontend: React 19 + TypeScript + Vite  
Backend: Spring Boot 3.5.7 + Java 21  
Database: H2
