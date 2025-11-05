# Token Management Improvements - Refresh Token Implementation

## Overview
This document describes the refresh token mechanism implemented to overcome weak session management with 24-hour tokens.

## Problems Solved

### Before (Weak Session Management)
- ❌ **Long-lived access tokens**: 24 hours (86400000 ms)
- ❌ **No token refresh mechanism**: Users had to re-login every 24 hours
- ❌ **Higher security risk**: If token is stolen, attacker has 24-hour access
- ❌ **No token rotation**: Same token used throughout session
- ❌ **Difficult to revoke**: Can't effectively invalidate compromised tokens

### After (Secure Session Management)
- ✅ **Short-lived access tokens**: 15 minutes (900000 ms)
- ✅ **Long-lived refresh tokens**: 7 days (604800000 ms)
- ✅ **Token refresh mechanism**: Seamless token renewal without re-login
- ✅ **Token rotation**: New refresh token issued on each refresh
- ✅ **Database-backed revocation**: Refresh tokens can be revoked immediately
- ✅ **Automatic cleanup**: Expired tokens removed daily at 3 AM
- ✅ **Reduced attack window**: Stolen access tokens expire in 15 minutes

## Architecture

### Token Types

1. **Access Token (JWT)**
   - Short-lived (15 minutes)
   - Used for API authentication
   - Stored in memory on client
   - Cannot be revoked (blacklist available for logout)

2. **Refresh Token**
   - Long-lived (7 days)
   - Stored in database
   - One-time use (rotated on refresh)
   - Can be revoked immediately
   - Used to obtain new access tokens

## Implementation Details

### New Database Entity: `RefreshToken`

```
Table: refresh_token
- id (Long, PK)
- token (String, UUID, unique)
- user_id (Long, FK to app_user)
- expiry_date (Instant)
- revoked (boolean)
- created_at (Instant)
- revoked_at (Instant, nullable)
```

### New Files Created

1. **Entity**: `RefreshToken.java`
   - Stores refresh token data with expiration and revocation status

2. **Repository**: `RefreshTokenRepository.java`
   - CRUD operations for refresh tokens
   - Bulk revocation methods
   - Cleanup queries

3. **Service**: `RefreshTokenService.java`
   - Token creation and validation
   - Token rotation logic
   - Automatic cleanup scheduler
   - Revocation methods

4. **DTO**: `RefreshTokenRequest.java`
   - Request body for refresh endpoint

5. **Updated DTO**: `AuthResponse.java`
   - Added `refreshToken` and `refreshExpiresIn` fields

### Modified Files

1. **AuthService.java**
   - Integrated `RefreshTokenService`
   - Updated `register()` and `login()` to return refresh tokens
   - Added `refreshToken()` method

2. **AuthController.java**
   - Added `POST /api/auth/refresh` endpoint

3. **Configuration Files**
   - `application-local.properties`
   - `application-docker-dev.properties`
   - `application-prod.properties`
   - Updated token expiration times

## API Endpoints

### 1. Register / Login
**Request**: `POST /api/auth/register` or `POST /api/auth/login`

**Response**:
```json
{
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": 0
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 900000,
  "refreshToken": "550e8400-e29b-41d4-a716-446655440000",
  "refreshExpiresIn": 604800000
}
```

### 2. Refresh Token (NEW)
**Request**: `POST /api/auth/refresh`
```json
{
  "refreshToken": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Response**:
```json
{
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": 0
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 900000,
  "refreshToken": "660e8400-e29b-41d4-a716-446655440001",
  "refreshExpiresIn": 604800000
}
```

**Note**: The old refresh token is automatically revoked and a new one is issued.

## Client-Side Implementation Guide

### Token Storage Strategy

1. **Access Token**: Store in memory or localStorage
   - Use for API requests via Authorization header
   - Short-lived, so less risk if exposed

2. **Refresh Token**: Store in httpOnly cookie (most secure) or localStorage
   - Used only for refresh endpoint
   - Never send to regular API endpoints

### Recommended Flow

```javascript
// Example client-side implementation
let accessToken = null;
let refreshToken = null;

// After login/register
async function login(email, password) {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  
  const data = await response.json();
  accessToken = data.token;
  refreshToken = data.refreshToken;
  
  // Store refresh token securely
  localStorage.setItem('refreshToken', data.refreshToken);
  
  // Optional: Set up auto-refresh before token expires
  scheduleTokenRefresh(data.expiresIn);
}

// API request with auto-refresh
async function apiRequest(url, options = {}) {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        'Authorization': `Bearer ${accessToken}`
      }
    });
    
    if (response.status === 401) {
      // Token expired, try to refresh
      await refreshAccessToken();
      
      // Retry original request
      return fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          'Authorization': `Bearer ${accessToken}`
        }
      });
    }
    
    return response;
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
}

// Refresh access token
async function refreshAccessToken() {
  const storedRefreshToken = localStorage.getItem('refreshToken');
  
  if (!storedRefreshToken) {
    // No refresh token, redirect to login
    window.location.href = '/login';
    return;
  }
  
  try {
    const response = await fetch('/api/auth/refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: storedRefreshToken })
    });
    
    if (!response.ok) {
      // Refresh token invalid/expired, redirect to login
      localStorage.removeItem('refreshToken');
      window.location.href = '/login';
      return;
    }
    
    const data = await response.json();
    accessToken = data.token;
    refreshToken = data.refreshToken;
    localStorage.setItem('refreshToken', data.refreshToken);
    
    scheduleTokenRefresh(data.expiresIn);
  } catch (error) {
    console.error('Token refresh failed:', error);
    window.location.href = '/login';
  }
}

// Auto-refresh before expiration (refresh 1 minute before expiry)
function scheduleTokenRefresh(expiresIn) {
  const refreshTime = expiresIn - 60000; // Refresh 1 minute before expiry
  setTimeout(() => {
    refreshAccessToken();
  }, refreshTime);
}

// Logout
async function logout() {
  await fetch('/api/auth/logout', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${accessToken}` }
  });
  
  accessToken = null;
  refreshToken = null;
  localStorage.removeItem('refreshToken');
  window.location.href = '/login';
}
```

## Security Features

### 1. Token Rotation
- Each refresh operation issues a new refresh token
- Old refresh token is immediately revoked
- Prevents token reuse attacks

### 2. Automatic Expiration
- Access tokens expire in 15 minutes
- Refresh tokens expire in 7 days
- Reduces attack window significantly

### 3. Database Revocation
- Refresh tokens stored in database
- Can be revoked immediately on suspicious activity
- Logout revokes all user tokens (optional)

### 4. Automatic Cleanup
- Scheduled job runs daily at 3 AM
- Removes expired tokens from database
- Prevents database bloat

### 5. One-Time Use
- Refresh tokens can only be used once
- Attempting to reuse triggers security alert
- Detects token theft attempts

## Configuration Options

### Environment Variables (Production)

```bash
# Access token expiration (milliseconds)
JWT_EXPIRATION=900000

# Refresh token expiration (milliseconds)
JWT_REFRESH_EXPIRATION=604800000
```

### Recommended Expiration Times

| Environment | Access Token | Refresh Token |
|-------------|--------------|---------------|
| Development | 15 minutes   | 7 days        |
| Staging     | 15 minutes   | 7 days        |
| Production  | 15 minutes   | 7 days        |
| High Security | 5 minutes  | 1 day         |

## Database Migration

The `RefreshToken` entity will be automatically created by Hibernate/JPA on application startup if `spring.jpa.hibernate.ddl-auto` is set to `update` or `create`.

### Manual SQL (if needed)

```sql
CREATE TABLE refresh_token (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    token VARCHAR(255) NOT NULL UNIQUE,
    user_id BIGINT NOT NULL,
    expiry_date TIMESTAMP NOT NULL,
    revoked BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL,
    revoked_at TIMESTAMP NULL,
    FOREIGN KEY (user_id) REFERENCES app_user(id) ON DELETE CASCADE
);

CREATE INDEX idx_refresh_token_token ON refresh_token(token);
CREATE INDEX idx_refresh_token_user_id ON refresh_token(user_id);
CREATE INDEX idx_refresh_token_expiry ON refresh_token(expiry_date);
```

## Testing

### Test Scenarios

1. **Login and get tokens**
   ```bash
   curl -X POST http://localhost:8080/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"user@example.com","password":"password"}'
   ```

2. **Refresh token before expiration**
   ```bash
   curl -X POST http://localhost:8080/api/auth/refresh \
     -H "Content-Type: application/json" \
     -d '{"refreshToken":"YOUR_REFRESH_TOKEN"}'
   ```

3. **Try to reuse old refresh token** (should fail)
   ```bash
   curl -X POST http://localhost:8080/api/auth/refresh \
     -H "Content-Type: application/json" \
     -d '{"refreshToken":"OLD_REFRESH_TOKEN"}'
   ```

4. **Wait for access token expiration** (15 minutes)
   - Try API call with old access token
   - Should get 401 Unauthorized
   - Use refresh token to get new access token

## Monitoring

### Metrics to Track

1. **Token Refresh Rate**: Number of refresh requests per day
2. **Token Reuse Attempts**: Failed refresh due to revoked tokens
3. **Expired Token Cleanup**: Number of tokens cleaned daily
4. **Average Session Duration**: Time between login and last refresh

### Log Messages

- `Creating refresh token for user: {email}`
- `Refresh token verified and rotated`
- `Old refresh token revoked`
- `Refresh token not found` (potential attack)
- `Refresh token has been revoked` (reuse attempt)
- `Refresh token has expired`

## Troubleshooting

### Issue: "Invalid refresh token"
- **Cause**: Token was already used or revoked
- **Solution**: User must login again

### Issue: "Refresh token has expired"
- **Cause**: Token older than 7 days
- **Solution**: User must login again

### Issue: Access token expires too quickly
- **Cause**: 15-minute expiration
- **Solution**: Implement auto-refresh on client side

### Issue: Database growing with refresh tokens
- **Cause**: Cleanup job not running
- **Solution**: Verify `@EnableScheduling` is active

## Future Enhancements

1. **Device Management**: Track tokens by device
2. **Session Management UI**: View and revoke active sessions
3. **Suspicious Activity Detection**: Detect unusual refresh patterns
4. **Token Fingerprinting**: Bind tokens to IP/User-Agent
5. **Refresh Token Families**: Track token chains to detect theft

## References

- OWASP Session Management Cheat Sheet
- RFC 6749 - OAuth 2.0 Authorization Framework
- RFC 7519 - JSON Web Token (JWT)
