# Token ID (jti) - JWT ID Explained

## 🔑 What is Token ID?

The **Token ID (jti - JWT ID)** is a unique identifier (UUID) embedded in each JWT token. Every time a user logs in or a token is generated, a new UUID is created.

## 📊 Example Scenario

### Without Token ID:
```
User logs in on laptop   → Token: eyJhbGc...  (email: user@test.com)
User logs in on phone    → Token: eyJhbGc...  (email: user@test.com)
User logs in on tablet   → Token: eyJhbGc...  (email: user@test.com)
```

**Problem:** All tokens look similar, contain the same email. How do you tell them apart?

### With Token ID:
```
User logs in on laptop   → Token ID: 3a7f2e1d-4b5c-6d7e-8f9a-0b1c2d3e4f5a
User logs in on phone    → Token ID: 9c8b7a6d-5e4f-3a2b-1c0d-9e8f7a6b5c4d
User logs in on tablet   → Token ID: 1f2e3d4c-5b6a-7c8d-9e0f-1a2b3c4d5e6f
```

**Solution:** Each session has a unique ID that never repeats!

## 🎯 Why Do We Need It?

### 1. **Selective Token Revocation**
```java
// Scenario: User logs out on their phone but stays logged in on laptop

// Without Token ID - You'd have to:
❌ Blacklist ALL tokens for user@test.com
❌ User gets logged out everywhere (bad UX!)

// With Token ID - You can:
✅ Blacklist only the specific token ID from the phone
✅ Laptop and tablet sessions remain active
```

### 2. **Security Audit Trail**
```
Token ID: 3a7f2e1d... | User: admin@test.com | Action: Deleted user #123
Token ID: 9c8b7a6d... | User: admin@test.com | Action: Updated settings
Token ID: 1f2e3d4c... | User: admin@test.com | Action: Exported data
```

You can trace which specific session performed which action!

### 3. **Prevent Token Confusion**
```
Suspicious activity detected from IP: 192.168.1.100
Token ID: 9c8b7a6d-5e4f-3a2b-1c0d-9e8f7a6b5c4d

Action: Blacklist ONLY that token ID
Result: Attacker is blocked, but user's other sessions continue working
```

## 🔒 How It Works in Our App

### Token Generation (Login/Register)
```java
// JwtUtil.java - createToken()
.id(UUID.randomUUID().toString()) // Creates unique ID like: "3a7f2e1d-4b5c-6d7e..."
```

### Token Blacklisting (Logout)
```java
// TokenBlacklist.java - blacklistToken()
String tokenId = jwtUtil.extractTokenId(token); // Extract the unique ID
// Store only the ID in database (not the full 500+ char token!)

BlacklistedToken:
- tokenId: "3a7f2e1d-4b5c-6d7e-8f9a-0b1c2d3e4f5a"
- userEmail: "user@test.com"
- reason: "LOGOUT"
- blacklistedAt: 2025-11-02 14:30:00
- expiresAt: 2025-11-03 14:30:00
```

### Token Validation (Every Request)
```java
// JwtAuthenticationFilter.java - doFilterInternal()
if (tokenBlacklist.isBlacklisted(jwt)) {
    // Reject request - this specific token was revoked
    return;
}
```

## 📈 Performance Benefits

### Storing Full Token (Old Way):
```sql
CREATE TABLE blacklisted_token (
    token VARCHAR(512)  -- 500+ characters per row!
);

-- Query to check if blacklisted:
SELECT * FROM blacklisted_token WHERE token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
```

### Storing Token ID (New Way):
```sql
CREATE TABLE blacklisted_token (
    token_id VARCHAR(100)  -- Only 36 characters (UUID)!
);

-- Query to check if blacklisted:
SELECT * FROM blacklisted_token WHERE token_id = '3a7f2e1d-4b5c-6d7e-8f9a-0b1c2d3e4f5a';
```

**Benefits:**
- ✅ 5x smaller database storage
- ✅ Faster database queries (shorter string comparison)
- ✅ Easier to read logs and debug

## 🛡️ Security Use Cases

### Use Case 1: User Reports Stolen Session
```
User: "Someone accessed my account from China, but I'm in USA!"

Admin Action:
1. Find the suspicious token ID from audit logs
2. Blacklist only that token ID
3. User's legitimate sessions remain active
```

### Use Case 2: Password Change
```java
// When user changes password, invalidate ALL their tokens
public void changePassword(Long userId, String newPassword) {
    // Update password
    userRepository.updatePassword(userId, hash(newPassword));
    
    // Blacklist all active tokens for this user
    List<String> activeTokenIds = getActiveTokensForUser(userId);
    for (String tokenId : activeTokenIds) {
        blacklistToken(tokenId, "PASSWORD_CHANGE");
    }
}
```

### Use Case 3: Emergency Security Lockdown
```java
// Revoke access for a specific user immediately
public void lockoutUser(Long userId, String reason) {
    List<String> userTokenIds = getAllTokensForUser(userId);
    for (String tokenId : userTokenIds) {
        blacklistToken(tokenId, "SECURITY_LOCKOUT: " + reason);
    }
}
```

## 📝 Token ID in JWT Payload

When decoded, a JWT with Token ID looks like:

```json
{
  "sub": "user@test.com",
  "jti": "3a7f2e1d-4b5c-6d7e-8f9a-0b1c2d3e4f5a",  // ← Token ID (Unique!)
  "userId": 42,
  "role": 0,
  "name": "John Doe",
  "authorities": ["ROLE_USER"],
  "iss": "VulnerableApp",
  "aud": "VulnerableApp-Users",
  "iat": 1698765432,
  "exp": 1698851832
}
```

## 🎯 Summary

| Feature | Without Token ID | With Token ID |
|---------|-----------------|---------------|
| **Uniqueness** | ❌ Multiple tokens look the same | ✅ Every token is unique |
| **Revocation** | ❌ Must revoke all user tokens | ✅ Revoke specific session only |
| **Audit** | ❌ Hard to trace actions | ✅ Track exact session |
| **Storage** | ❌ Large (500+ chars) | ✅ Small (36 chars) |
| **Performance** | ❌ Slow queries | ✅ Fast lookups |
| **Security** | ❌ Can't isolate compromised session | ✅ Surgical revocation |

## 🔍 Testing with Postman

Use the provided Postman collection to see Token IDs in action:

1. **Setup Phase**: Register 3 users (admin, user, malicious)
2. **Login**: Each login creates a unique token ID
3. **Logout Malicious User**: Only their token ID is blacklisted
4. **Test Blacklist**: The blacklisted token ID is rejected, others work fine

The token ID ensures that when the malicious user is logged out, their specific session is terminated without affecting other users or sessions!
