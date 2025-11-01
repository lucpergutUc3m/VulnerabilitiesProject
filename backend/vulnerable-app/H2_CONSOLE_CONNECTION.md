# 🔗 H2 Console Connection Guide

When you open the H2 Console at http://localhost:8080/h2-console, use these EXACT values:

## Connection Settings:

**Driver Class:** `org.h2.Driver` (should be pre-filled)

**JDBC URL:** 
```
jdbc:h2:file:C:/git/VulnerabilitiesProject/backend/vulnerable-app/data/vulnerableapp-dev
```

**User Name:** `sa`

**Password:** (leave empty)

---

## Important Notes:

✅ Use **forward slashes** (/) not backslashes (\) in the JDBC URL  
✅ Do NOT add `.mv.db` extension - H2 adds it automatically  
✅ The path must be the FULL absolute path, not relative  
✅ Make sure the backend is running before connecting

---

## Troubleshooting:

**"Database not found" error:**
- Make sure you're using the FULL path above
- Don't use `~/test` or any other path
- The database file will be created automatically when you first run the app

**Database file location:**
The actual database file is stored at:
`C:\git\VulnerabilitiesProject\backend\vulnerable-app\data\vulnerableapp-dev.mv.db`

---

## Quick Copy-Paste:

JDBC URL:
```
jdbc:h2:file:C:/git/VulnerabilitiesProject/backend/vulnerable-app/data/vulnerableapp-dev
```

Username: `sa`  
Password: (empty)
