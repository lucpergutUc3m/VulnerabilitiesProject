# ✅ Database-Backed Token Blacklist Implementation

## 🎯 Overview

The token blacklist has been upgraded from in-memory storage to **database persistence**. This ensures that blacklisted tokens (from logout) are maintained even after server restarts and can be shared across multiple application instances.

---

## 📊 What Was Changed

### 1. **New Database Entity: `BlacklistedToken`**
Located: `entity/BlacklistedToken.java`

**Fields:**
- `id` - Primary key
- `token` - The JWT token (unique, max 512 chars)
- `blacklistedAt` - When the token was blacklisted
- `expiresAt` - When the token naturally expires
- `userEmail` - Email of the user who logged out

**Table:** `blacklisted_token`

### 2. **New Repository: `BlacklistedTokenRepository`**
Located: `repository/BlacklistedTokenRepository.java`

**Methods:**
- `existsByToken(String token)` - Check if token is blacklisted
- `deleteExpiredTokens(LocalDateTime now)` - Cleanup expired tokens

### 3. **Updated `TokenBlacklist` Service**
Located: `security/TokenBlacklist.java`

**Changes:**
- ❌ **Removed:** In-memory `ConcurrentHashMap` storage
- ✅ **Added:** Database persistence via repository
- ✅ **Added:** Automatic token expiration tracking
- ✅ **Added:** Scheduled cleanup every hour (`@Scheduled`)

**New Methods:**
- `blacklistToken(String token, String userEmail)` - Now saves to database with expiration
- `isBlacklisted(String token)` - Checks database instead of memory
- `cleanupExpiredTokens()` - Runs hourly to remove expired tokens

### 4. **Updated `AuthService`**
Located: `service/AuthService.java`

**Changes:**
- `logout()` method now extracts user email from token
- Passes email when blacklisting: `tokenBlacklist.blacklistToken(token, userEmail)`

### 5. **Enabled Scheduling**
Located: `VulnerableAppBackendApplication.java`

**Added:** `@EnableScheduling` annotation to enable the hourly cleanup task

---

## 🔄 How It Works

### On Logout:
1. User calls `POST /api/auth/logout` with their JWT token
2. System extracts user email from the token
3. Token is saved to `blacklisted_token` table with:
   - The token itself
   - Current timestamp (blacklistedAt)
   - Token expiration time (expiresAt)
   - User's email
4. Token is now permanently blacklisted

### On Each Request:
1. `JwtAuthenticationFilter` intercepts the request
2. Extracts JWT token from Authorization header
3. Calls `tokenBlacklist.isBlacklisted(token)`
4. Checks database: `SELECT * FROM blacklisted_token WHERE token = ?`
5. If found → Reject request
6. If not found → Allow request to proceed

### Automatic Cleanup:
1. Every hour (at minute 0), `cleanupExpiredTokens()` runs
2. Deletes all tokens where `expiresAt < NOW()`
3. Keeps database clean and performant

---

## 📋 Database Schema

```sql
CREATE TABLE blacklisted_token (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    token VARCHAR(512) NOT NULL UNIQUE,
    blacklisted_at TIMESTAMP NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    user_email VARCHAR(255)
);

CREATE INDEX idx_token ON blacklisted_token(token);
CREATE INDEX idx_expires_at ON blacklisted_token(expires_at);
```

---

## ✅ Benefits

### Before (In-Memory):
- ❌ Tokens lost on server restart
- ❌ Not shared across multiple instances
- ❌ Manual cleanup required
- ❌ No audit trail

### After (Database):
- ✅ Tokens persist across restarts
- ✅ Shared across all application instances
- ✅ Automatic cleanup every hour
- ✅ Full audit trail (who, when, expires when)
- ✅ Can query blacklisted tokens for analysis
- ✅ Production-ready for distributed systems

---

## 🚀 Production Benefits

### Scalability:
- Multiple backend instances can share the same blacklist
- Load balancer can route requests to any instance
- All instances check the same database

### Reliability:
- Server crashes don't lose blacklisted tokens
- Deployments don't invalidate logout state
- Users stay logged out even after redeploy

### Monitoring:
- Can query how many users logged out today
- Can see when tokens will expire
- Can manually blacklist compromised tokens

---

## 📊 Example Queries

### Check blacklisted tokens:
```sql
SELECT * FROM blacklisted_token;
```

### See recent logouts:
```sql
SELECT user_email, blacklisted_at 
FROM blacklisted_token 
WHERE blacklisted_at > NOW() - INTERVAL 1 DAY
ORDER BY blacklisted_at DESC;
```

### Check tokens expiring soon:
```sql
SELECT user_email, expires_at 
FROM blacklisted_token 
WHERE expires_at < NOW() + INTERVAL 1 HOUR;
```

### Manually blacklist a token (if compromised):
```sql
INSERT INTO blacklisted_token (token, blacklisted_at, expires_at, user_email)
VALUES ('compromised.jwt.token', NOW(), NOW() + INTERVAL 24 HOUR, 'user@example.com');
```

---

## ⏰ Cleanup Schedule

**Frequency:** Every hour at minute 0 (e.g., 1:00, 2:00, 3:00, etc.)

**What it does:**
```sql
DELETE FROM blacklisted_token WHERE expires_at < NOW();
```

**Why hourly?**
- Balances database size vs cleanup overhead
- Expired tokens are harmless (they're expired anyway)
- Prevents table from growing indefinitely

**Custom schedule:**
To change cleanup frequency, edit `TokenBlacklist.java`:
```java
@Scheduled(cron = "0 0 * * * *")  // Every hour
@Scheduled(cron = "0 0 0 * * *")  // Daily at midnight
@Scheduled(cron = "0 */30 * * * *")  // Every 30 minutes
```

---

## 🔒 Security Considerations

### Token Storage:
- Tokens are hashed? **No** - stored as-is for lookup performance
- Tokens are encrypted? **No** - already signed and can't be modified
- Tokens are sensitive? **Yes** - keep database secure

### Recommendations:
1. ✅ Use database access controls (don't expose publicly)
2. ✅ Regular backups of blacklisted_token table
3. ✅ Monitor table size (should auto-cleanup)
4. ✅ Use HTTPS to prevent token interception
5. ⚠️ Consider encryption at rest for the database

---

## 📝 Migration Notes

### For Existing Users:
- No manual migration needed
- Table created automatically by JPA on startup
- Old in-memory blacklist is replaced seamlessly

### Database Support:
- ✅ H2 (local development)
- ✅ PostgreSQL (production)
- ✅ MySQL/MariaDB (if you switch)
- ✅ Any JPA-compatible database

---

## 🎉 Summary

Your token blacklist is now **production-ready**:
- ✅ Database-backed persistence
- ✅ Automatic hourly cleanup
- ✅ Shared across instances
- ✅ Survives restarts
- ✅ Full audit trail
- ✅ Zero configuration needed

**The system will automatically create the `blacklisted_token` table on first startup!**
