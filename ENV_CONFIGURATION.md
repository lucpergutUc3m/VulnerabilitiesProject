# Environment Configuration Guide

## Overview

This project requires environment variables for both the backend (Spring Boot) and frontend (React + Vite). This guide explains how to set up your environment for production deployment.

## Quick Start

1. **Copy the template file:**
   ```bash
   cp .env.template .env
   ```

2. **Generate secure values:**
   ```bash
   # Generate JWT secret (minimum 256 bits / 32 bytes)
   openssl rand -base64 32
   
   # Generate database password
   openssl rand -base64 32
   ```

3. **Edit `.env` file** with your production values

4. **Never commit `.env`** to version control (already in `.gitignore`)

## Environment Variables

### Database Configuration

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `POSTGRES_DB` | Database name | `vulnerableappdb_prod` | ✅ Yes |
| `POSTGRES_USER` | Database username | `prod_user` | ✅ Yes |
| `POSTGRES_PASSWORD` | Database password (min 32 chars) | `your-secure-password` | ✅ Yes |
| `POSTGRES_PORT` | PostgreSQL port | `5432` | ✅ Yes |
| `DB_URL` | JDBC connection URL | `jdbc:postgresql://postgres:5432/vulnerableappdb_prod` | ✅ Yes |
| `DB_USERNAME` | DB user (same as POSTGRES_USER) | `prod_user` | ✅ Yes |
| `DB_PASSWORD` | DB password (same as POSTGRES_PASSWORD) | `your-secure-password` | ✅ Yes |
| `DDL_AUTO` | Hibernate DDL mode | `validate` (prod), `update` (dev) | ✅ Yes |

### Backend Configuration

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `SERVER_PORT` | Spring Boot server port | `8080` | ✅ Yes |
| `JWT_SECRET` | JWT signing key (min 256 bits) | Generate with `openssl rand -base64 32` | ✅ Yes |
| `JWT_EXPIRATION` | Token expiration (milliseconds) | `3600000` (1 hour) | ✅ Yes |
| `JWT_ISSUER` | JWT issuer identifier | `VulnerableApp` | ✅ Yes |
| `JWT_AUDIENCE` | JWT audience identifier | `VulnerableApp-Users` | ✅ Yes |
| `CORS_ALLOWED_ORIGINS` | Allowed CORS origins (comma-separated) | `https://yourdomain.com` | ✅ Yes |
| `VULNERABILITY_MODE` | Enable vulnerability demonstrations | `false` (prod), `true` (dev) | ✅ Yes |
| `COOKIE_SECURE` | Enable secure cookies (requires HTTPS) | `true` (prod), `false` (dev) | ✅ Yes |

### Frontend Configuration

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `VITE_API_URL` | Backend API base URL | `/api` (same domain), `https://api.yourdomain.com` (different domain) | ✅ Yes |
| `VITE_API_TIMEOUT` | API request timeout (ms) | `5000` | ✅ Yes |
| `VITE_APP_NAME` | Application display name | `Cuestioneo` | ✅ Yes |
| `VITE_APP_VERSION` | Application version | `1.0.0` | ❌ No |
| `VITE_ENVIRONMENT` | Environment name | `production`, `development`, `staging` | ✅ Yes |
| `VITE_DEFAULT_LANGUAGE` | Default UI language | `en`, `es` | ✅ Yes |
| `VITE_DEBUG` | Enable debug mode | `false` (prod), `true` (dev) | ❌ No |

### Optional/Development Variables

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `JPA_SHOW_SQL` | Log SQL queries | `false` (prod), `true` (dev) | ❌ No |
| `JPA_FORMAT_SQL` | Format SQL in logs | `false` | ❌ No |
| `H2_CONSOLE_ENABLED` | Enable H2 console | `false` (prod), `true` (dev) | ❌ No |
| `ADMINER_PORT` | Adminer UI port | `8081` | ❌ No |

## Environment-Specific Configurations

### Production Environment

```env
# Production values
DDL_AUTO=validate
VULNERABILITY_MODE=false
COOKIE_SECURE=true
JPA_SHOW_SQL=false
VITE_ENVIRONMENT=production
VITE_DEBUG=false
CORS_ALLOWED_ORIGINS=https://yourdomain.com
VITE_API_URL=/api
```

### Development Environment

```env
# Development values
DDL_AUTO=update
VULNERABILITY_MODE=true
COOKIE_SECURE=false
JPA_SHOW_SQL=true
VITE_ENVIRONMENT=development
VITE_DEBUG=true
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
VITE_API_URL=http://localhost:8080/api
```

## Security Best Practices

### 🔒 Critical Security Requirements

1. **JWT Secret**
   - Minimum 256 bits (32 bytes)
   - Generate cryptographically secure random value
   - Never use default or predictable values
   - Rotate regularly (every 90 days recommended)
   
   ```bash
   openssl rand -base64 32
   ```

2. **Database Password**
   - Minimum 32 characters
   - Use strong, random password
   - Different from development password
   - Store securely (use secrets manager in production)

3. **DDL Auto Mode**
   - **Production:** Always use `validate`
   - **Never** use `create`, `create-drop`, or `update` in production
   - Database schema changes should be managed via migrations

4. **CORS Configuration**
   - Restrict to actual frontend domain(s)
   - Never use wildcard (`*`) in production
   - Include all necessary subdomains

5. **Vulnerability Mode**
   - **Must be `false` in production**
   - Only enable for educational/testing purposes
   - Enables intentional security vulnerabilities

## Deployment Checklist

Before deploying to production:

- [ ] Copy `.env.template` to `.env`
- [ ] Generate secure `JWT_SECRET` (min 256 bits)
- [ ] Set strong `POSTGRES_PASSWORD` (min 32 chars)
- [ ] Set `DDL_AUTO=validate`
- [ ] Set `VULNERABILITY_MODE=false`
- [ ] Configure actual domain in `CORS_ALLOWED_ORIGINS`
- [ ] Set `COOKIE_SECURE=true`
- [ ] Verify `VITE_API_URL` points to correct backend
- [ ] Set `JPA_SHOW_SQL=false`
- [ ] Set `H2_CONSOLE_ENABLED=false`
- [ ] Disable or restrict Adminer access
- [ ] Configure SSL/TLS certificates
- [ ] Set up database backups
- [ ] Configure monitoring and logging
- [ ] Set up rate limiting (at reverse proxy/load balancer)
- [ ] Review all security headers
- [ ] Test authentication and authorization
- [ ] Perform security audit
- [ ] Plan regular dependency updates

## Docker Deployment

The `.env` file is automatically loaded by Docker Compose:

```bash
# Build and start services
docker compose up -d --build

# View logs
docker compose logs -f

# Stop services
docker compose down
```

## Troubleshooting

### Common Issues

1. **JWT Authentication Fails**
   - Verify `JWT_SECRET` matches between environments
   - Check `JWT_EXPIRATION` is reasonable
   - Ensure clocks are synchronized

2. **CORS Errors**
   - Verify `CORS_ALLOWED_ORIGINS` includes your frontend domain
   - Check protocol (http vs https)
   - Ensure no trailing slashes

3. **Database Connection Fails**
   - Verify `DB_URL` hostname (use service name in Docker)
   - Check `POSTGRES_PASSWORD` matches `DB_PASSWORD`
   - Ensure database is running and accessible

4. **Frontend Can't Reach Backend**
   - Check `VITE_API_URL` is correct
   - Verify backend is running and accessible
   - Check network configuration and firewall rules

## Additional Resources

- [Spring Boot Externalized Configuration](https://docs.spring.io/spring-boot/docs/current/reference/html/features.html#features.external-config)
- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)
- [Docker Compose Environment Variables](https://docs.docker.com/compose/environment-variables/)
- [OWASP Configuration Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Configuration_Cheat_Sheet.html)

## Support

For issues or questions:
1. Check this documentation
2. Review application logs
3. Verify environment variables are correctly set
4. Consult the main README.md
