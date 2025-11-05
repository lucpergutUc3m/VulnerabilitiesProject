# Testing Refresh Token Flow

## Quick Test Guide

### 1. Login and Save Tokens

**POST** `http://localhost:8080/api/auth/login`

**Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:** Save both `token` and `refreshToken` from response

---

### 2. Use Access Token (within 15 minutes)

**GET** `http://localhost:8080/api/products`

**Headers:**
```
Authorization: Bearer {access_token}
```

---

### 3. Refresh Access Token (when expired or about to expire)

**POST** `http://localhost:8080/api/auth/refresh`

**Body:**
```json
{
  "refreshToken": "YOUR_REFRESH_TOKEN_HERE"
}
```

**Response:** Save new `token` and `refreshToken`

**Important:** The old refresh token is now invalid! Always use the new one.

---

### 4. Test Token Reuse Protection

Try using the old refresh token again - should fail with error:
```json
{
  "message": "Refresh token has been revoked"
}
```

---

## cURL Examples

### Login
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"user@example.com\",\"password\":\"password123\"}"
```

### Refresh Token
```bash
curl -X POST http://localhost:8080/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d "{\"refreshToken\":\"YOUR_REFRESH_TOKEN\"}"
```

### Use Access Token
```bash
curl -X GET http://localhost:8080/api/products \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

## Expected Behavior

1. **Fresh login**: Get both access token (15 min) and refresh token (7 days)
2. **After 15 minutes**: Access token expires, API calls return 401
3. **Use refresh token**: Get new access token + new refresh token
4. **Old refresh token**: Now invalid, can't be reused
5. **After 7 days**: Refresh token expires, must login again
