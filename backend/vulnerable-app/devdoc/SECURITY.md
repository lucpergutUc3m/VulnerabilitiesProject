# 🔒 SECURITY GUIDE - Database & Production Configuration

## ⚠️ Security Issues in Original Configuration

The initial setup had these **CRITICAL SECURITY PROBLEMS**:

1. ❌ **Hardcoded database credentials** in config files
2. ❌ **Weak JWT secret** visible in source code
3. ❌ **No environment separation** (dev/prod use same settings)
4. ❌ **Debug features enabled** by default (SQL logging, H2 console)
5. ❌ **Adminer exposed** in production (database GUI accessible to attackers)
6. ❌ **Credentials in Docker Compose** (visible in git history)

## ✅ Security Fixes Implemented

### 1. Environment Variables
All sensitive data now uses environment variables with the pattern:
```
${VARIABLE_NAME:default_value}
```

### 2. Multiple Environment Files
- `.env.development` - Safe defaults for local development
- `.env.production.template` - Template requiring real values
- Production secrets NEVER committed to git

### 3. Docker Compose Separation
- `compose.yaml` - Development with Adminer (GUI enabled)
- `compose.prod.yaml` - Production (no GUI, secure settings)

### 4. Database Security
- PostgreSQL with strong passwords (not default credentials)
- Connection pooling and health checks
- Persistent volumes (data survives container restarts)

### 5. JWT Security
- Secrets loaded from environment (not hardcoded)
- Production requires minimum 256-bit keys
- Different secrets per environment

### 6. CORS Protection
- Configurable allowed origins
- Production should ONLY allow your actual frontend domain

---

## 🚀 How to Use

### Development (Current Setup)
```cmd
# Copy development environment
copy .env.development .env

# Start database with Adminer GUI
docker-compose --profile dev up -d

# Run backend
mvnw.cmd spring-boot:run -Dspring-boot.run.profiles=postgres
```

**Access Adminer GUI:** http://localhost:8081
- Server: `postgres`
- Username: `dbuser`
- Password: `dbpassword`
- Database: `vulnerableappdb`

### Production Deployment

#### Step 1: Generate Secure Secrets
```bash
# Generate JWT secret (run this on Linux/Mac or Git Bash)
openssl rand -base64 32

# Or on Windows PowerShell:
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```

#### Step 2: Create Production Environment File
```cmd
# Copy template
copy .env.production.template .env.production

# Edit .env.production with REAL secure values:
# - Strong database password (min 32 chars, random)
# - JWT secret from Step 1
# - Your actual production domain for CORS
# - Set DB_DDL_AUTO=validate (not update!)
```

#### Step 3: Deploy
```cmd
# Load production environment
set $(cat .env.production | grep -v '^#' | xargs)

# Or on Windows, manually set variables or use docker-compose
docker-compose -f compose.prod.yaml --env-file .env.production up -d
```

---

## 🔐 Production Checklist

Before deploying to production, verify:

- [ ] **JWT_SECRET** - Generated with `openssl rand -base64 32`
- [ ] **POSTGRES_PASSWORD** - Strong random password (32+ chars)
- [ ] **DB_DDL_AUTO** - Set to `validate` (NOT `update`)
- [ ] **CORS_ALLOWED_ORIGINS** - Only your production domain
- [ ] **JPA_SHOW_SQL** - Set to `false`
- [ ] **H2_CONSOLE_ENABLED** - Set to `false`
- [ ] **VULNERABILITY_MODE** - Set to `false`
- [ ] **Adminer** - Disabled (don't use `--profile dev`)
- [ ] **.env.production** - NOT committed to git
- [ ] **HTTPS** - Use reverse proxy (nginx/traefik) with SSL

---

## 🛡️ Additional Security Recommendations

### 1. Use Secrets Management
For real production, use:
- **Docker Secrets** (Docker Swarm)
- **Kubernetes Secrets** (K8s)
- **AWS Secrets Manager** (AWS)
- **Azure Key Vault** (Azure)
- **HashiCorp Vault**

### 2. Database Access
```yaml
# Never expose PostgreSQL port in production
# Remove this from compose.prod.yaml:
ports:
  - "5432:5432"  # ❌ REMOVE IN PRODUCTION

# Only backend should access database via internal network
```

### 3. Network Security
```yaml
# Use internal networks
networks:
  app-network:
    driver: bridge
    internal: true  # Add this in production
```

### 4. Database Backups
```bash
# Setup automated backups
docker exec vulnerable-app-db-prod pg_dump -U ${POSTGRES_USER} ${POSTGRES_DB} > backup.sql
```

### 5. Monitoring
- Enable application monitoring (Spring Boot Actuator with security)
- Set up database connection monitoring
- Log authentication attempts

---

## 📊 Accessing Database in Production (Securely)

### Option 1: SSH Tunnel (Recommended)
```bash
# From your local machine
ssh -L 5432:localhost:5432 user@production-server

# Then connect with local GUI tool to localhost:5432
```

### Option 2: Temporary Adminer (Emergency Only)
```bash
# On production server (emergency access only)
docker run --rm -p 8081:8080 --network vulnerable-app_app-network adminer

# Access via SSH tunnel
ssh -L 8081:localhost:8081 user@production-server
# Open http://localhost:8081 on your machine

# STOP container immediately after use!
```

### Option 3: Database GUI via SSH (Best)
Use tools like:
- **DBeaver** with SSH tunnel
- **pgAdmin** with SSH tunnel
- **HeidiSQL** with SSH tunnel (Windows)
- **DataGrip** with SSH tunnel

---

## 🔍 Environment Variable Reference

| Variable | Development | Production | Required |
|----------|-------------|------------|----------|
| `JWT_SECRET` | Weak default | Strong random | ✅ Yes |
| `POSTGRES_PASSWORD` | `dbpassword` | Strong random | ✅ Yes |
| `DB_DDL_AUTO` | `update` | `validate` | ✅ Yes |
| `CORS_ALLOWED_ORIGINS` | `localhost:3000` | Your domain | ✅ Yes |
| `JPA_SHOW_SQL` | `true` | `false` | ✅ Yes |
| `H2_CONSOLE_ENABLED` | `true` | `false` | ✅ Yes |

---

## 🚨 What NOT to Do

❌ **NEVER** commit `.env.production` to git  
❌ **NEVER** use default passwords in production  
❌ **NEVER** expose Adminer to the internet  
❌ **NEVER** use `ddl-auto=update` in production  
❌ **NEVER** expose database ports publicly  
❌ **NEVER** use HTTP in production (use HTTPS)  
❌ **NEVER** log SQL queries in production  

---

## ✅ Summary

Your application is now configured with:
- ✅ Environment-based configuration (dev/prod separated)
- ✅ Secure secret management via environment variables
- ✅ .gitignore protection for sensitive files
- ✅ Production-ready Docker Compose setup
- ✅ Adminer only enabled in development profile
- ✅ All credentials externalized

**For development:** Everything is set up and ready to use  
**For production:** Follow the Production Deployment steps above
