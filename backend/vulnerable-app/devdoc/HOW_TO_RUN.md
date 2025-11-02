# 🚀 How to Run the Backend - All Scenarios

This project supports **3 different ways** to run the backend, each with its own database GUI.

---

## 📋 Quick Start Guide

### Scenario 1: Local Development (NO Docker) ⚡ FASTEST
**Use when:** You want to quickly test without Docker overhead

**Run:**
```cmd
run-local.cmd
```

**What you get:**
- ✅ Backend: `http://localhost:8080`
- ✅ Database: H2 (file-based, data persists in `./data` folder)
- ✅ **GUI Access:** H2 Console at `http://localhost:8080/h2-console`
  - JDBC URL: `jdbc:h2:file:./data/vulnerableapp-dev`
  - Username: `sa`
  - Password: _(leave empty)_

**Pros:** No Docker needed, instant startup, simple  
**Cons:** H2 is not production-like

---

### Scenario 2: Docker Development (PostgreSQL + Adminer) 🐳
**Use when:** You want production-like database with a full GUI like HeidiSQL

**Run:**
```cmd
run-docker-dev.cmd
```

**What you get:**
- ✅ Backend: `http://localhost:8080`
- ✅ Database: PostgreSQL (production-like)
- ✅ **GUI Access:** Adminer at `http://localhost:8081`
  - Server: `postgres`
  - Username: `dbuser`
  - Password: `dbpassword`
  - Database: `vulnerableappdb`

**Adminer Features (like HeidiSQL):**
- Browse tables with a nice interface
- Execute SQL queries
- Edit data inline
- Import/Export data
- Visual table designer

**To Stop:**
```cmd
stop-docker.cmd
```

**Pros:** Production-like database, full GUI, data persists  
**Cons:** Requires Docker Desktop running

---

### Scenario 3: Production Deployment 🏭
**Use when:** Deploying to production server

**Setup:**
1. Copy production template:
   ```cmd
   copy .env.production.template .env.production
   ```

2. Edit `.env.production` with secure values:
   - Generate JWT secret: Run PowerShell command below
   - Set strong database password (32+ chars)
   - Set your production domain for CORS

   ```powershell
   # Generate secure JWT secret
   [Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
   ```

3. Deploy:
   ```cmd
   docker compose -f compose.prod.yaml --env-file .env.production up -d
   ```

**Security:**
- ❌ NO Adminer GUI (disabled for security)
- ✅ Strong passwords required
- ✅ Debug features disabled
- ✅ Database schema validation only (no auto-updates)

---

## 🎯 Comparison Table

| Feature | Local (No Docker) | Docker Dev | Production |
|---------|------------------|------------|------------|
| **Database** | H2 (file) | PostgreSQL | PostgreSQL |
| **GUI Tool** | H2 Console | Adminer | SSH Tunnel only |
| **Setup Time** | Instant | ~30 seconds | Manual config |
| **Docker Required** | ❌ No | ✅ Yes | ✅ Yes |
| **Production-like** | ❌ No | ✅ Yes | ✅ Yes |
| **Data Persistence** | ✅ File | ✅ Volume | ✅ Volume |
| **Best For** | Quick testing | Real dev work | Deployment |

---

## 📊 GUI Access Guide

### Option 1: H2 Console (Local Mode)
1. Run: `run-local.cmd`
2. Open: `http://localhost:8080/h2-console`
3. Login with:
   - JDBC URL: `jdbc:h2:file:./data/vulnerableapp-dev`
   - Username: `sa`
   - Password: _(empty)_
4. Click "Connect"

**Features:**
- Basic SQL query interface
- Table browsing
- Simple and built-in

### Option 2: Adminer (Docker Dev Mode)
1. Run: `run-docker-dev.cmd`
2. Wait for "Adminer GUI: http://localhost:8081" message
3. Open: `http://localhost:8081`
4. Login with:
   - System: **PostgreSQL**
   - Server: `postgres`
   - Username: `dbuser`
   - Password: `dbpassword`
   - Database: `vulnerableappdb`
5. Click "Login"

**Features (Similar to HeidiSQL):**
- Visual table browser
- Advanced query editor with syntax highlighting
- Edit data inline (click cells to edit)
- Export to SQL, CSV, XML
- Import data
- Table structure designer
- Foreign key visualization
- Multiple theme options

---

## 🔧 Switching Between Modes

You can switch between modes easily:

**Currently running Local? Want to try Docker?**
1. Press `Ctrl+C` to stop current backend
2. Run `run-docker-dev.cmd`

**Currently running Docker? Want to go back to Local?**
1. Press `Ctrl+C` to stop current backend
2. Run `stop-docker.cmd` (stops containers)
3. Run `run-local.cmd`

**Data is separate** - each mode has its own database!

---

## 🛠️ Manual Commands (if you prefer)

### Local Mode:
```cmd
mvnw.cmd spring-boot:run -Dspring-boot.run.profiles=local
```

### Docker Dev Mode:
```cmd
docker compose --profile dev up -d
mvnw.cmd spring-boot:run -Dspring-boot.run.profiles=docker-dev
```

### Stop Docker:
```cmd
docker compose down
```

---

## 💡 Tips

**See database changes in real-time:**
1. Start backend (any mode)
2. Open the GUI (H2 Console or Adminer)
3. Register a user via your frontend or API
4. Refresh the GUI - you'll see the new data!

**Reset database:**
- **Local mode:** Delete `./data` folder
- **Docker mode:** Run `docker compose down -v` (removes volumes)

**View logs:**
```cmd
# Docker containers
docker compose logs -f

# Spring Boot (shown in terminal where you ran the script)
```

---

## 🚨 Common Issues

**"Docker is not running"**
- Start Docker Desktop
- Wait for it to fully start (whale icon in system tray)

**"Port 8080 already in use"**
- Stop the other backend instance
- Or change port: `set SERVER_PORT=8081` before running

**Can't connect to database in Adminer**
- Make sure backend is running
- Check Docker containers: `docker ps`
- Restart: `stop-docker.cmd` then `run-docker-dev.cmd`

---

## ✅ Recommended Workflow

**For day-to-day development:**
1. Use `run-local.cmd` for quick tests (fastest)
2. Use `run-docker-dev.cmd` when testing database-specific features
3. Keep Adminer open in browser tab to monitor database changes

**When ready to deploy:**
1. Test with `run-docker-dev.cmd` first
2. Configure production secrets in `.env.production`
3. Deploy with `compose.prod.yaml`

---

## 📚 Files Created

- `run-local.cmd` - Start backend without Docker
- `run-docker-dev.cmd` - Start backend with Docker + Adminer
- `stop-docker.cmd` - Stop Docker containers
- `application-local.properties` - Config for local mode
- `application-docker-dev.properties` - Config for Docker dev mode
- `application-prod.properties` - Config for production mode

All scripts are ready to use! Just double-click them.
