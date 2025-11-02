# Backend API Testing Guide (Postman)

This guide shows how to test the backend API without the frontend using Postman, cURL, or any HTTP client.

---

## 🚀 Quick Start

### 1. Start the Backend Server

```bash
# Option 1: Local development
run-local.cmd

# Option 2: Docker development
run-docker-dev.cmd
```

The server will run on: `http://localhost:8080`

---

## 📋 API Endpoints Overview

### Authentication Endpoints (Public)
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout (requires token)

### User Endpoints (Authenticated)
- `GET /api/user/me` - Get current user
- `PUT /api/user/me` - Update current user

### Test Endpoints (Authenticated)
- `POST /api/tests` - Create test
- `GET /api/tests/my` - Get my tests
- `GET /api/tests/shared` - Get shared tests
- `GET /api/tests/{id}` - Get specific test
- `DELETE /api/tests/{id}` - Delete test
- `POST /api/tests/{id}/share` - Share test
- `POST /api/tests/{id}/unshare` - Unshare test

### Admin Endpoints (Admin role required)
- `PUT /api/admin/users/{id}/role` - Update user role
- `DELETE /api/admin/tests/{id}` - Delete any test

---

## 🔐 Authentication Flow

### Step 1: Register a New User

**Request:**
```
POST http://localhost:8080/api/auth/register
Content-Type: application/json

{
  "email": "testuser@example.com",
  "password": "password123",
  "name": "Test User"
}
```

**Response:**
```json
{
  "user": {
    "id": "1",
    "name": "Test User",
    "email": "testuser@example.com"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 86400000
}
```

**Save the `token` value** - you'll need it for authenticated requests!

---

### Step 2: Login (if already registered)

**Request:**
```
POST http://localhost:8080/api/auth/login
Content-Type: application/json

{
  "email": "testuser@example.com",
  "password": "password123"
}
```

**Response:** Same as registration

---

### Step 3: Use Token for Authenticated Requests

For all authenticated endpoints, add the Authorization header:

```
Authorization: Bearer YOUR_TOKEN_HERE
```

**Example in Postman:**
1. Go to the "Authorization" tab
2. Select "Bearer Token" type
3. Paste your token in the "Token" field

**Example with cURL:**
```bash
curl -X GET http://localhost:8080/api/user/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## 📝 Testing Examples

### Create a Test

**Request:**
```
POST http://localhost:8080/api/tests
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json

{
  "title": "JavaScript Basics Quiz",
  "topic": "JavaScript",
  "emoji": "📚",
  "description": "Test your JavaScript knowledge",
  "timeLimitMinutes": 30,
  "questionsJson": "[{\"id\":1,\"question\":\"What is a closure?\",\"options\":[\"A function\",\"A variable\",\"A scope concept\",\"An object\"],\"correctAnswer\":2,\"explanation\":\"A closure is when a function has access to its outer scope even after the outer function has returned.\"}]"
}
```

**Response:**
```json
{
  "id": 1,
  "title": "JavaScript Basics Quiz",
  "topic": "JavaScript",
  "emoji": "📚",
  "description": "Test your JavaScript knowledge",
  "questions": [
    {
      "id": 1,
      "question": "What is a closure?",
      "options": ["A function", "A variable", "A scope concept", "An object"],
      "correctAnswer": 2,
      "explanation": "A closure is when a function has access to its outer scope even after the outer function has returned."
    }
  ],
  "timeLimit": 30,
  "createdBy": "testuser@example.com"
}
```

---

### Get My Tests

**Request:**
```
GET http://localhost:8080/api/tests/my
Authorization: Bearer YOUR_TOKEN_HERE
```

**Response:**
```json
[
  {
    "id": 1,
    "title": "JavaScript Basics Quiz",
    "topic": "JavaScript",
    "emoji": "📚",
    "description": "Test your JavaScript knowledge",
    "questions": [...],
    "timeLimit": 30,
    "createdBy": "testuser@example.com"
  }
]
```

---

### Get Current User

**Request:**
```
GET http://localhost:8080/api/user/me
Authorization: Bearer YOUR_TOKEN_HERE
```

**Response:**
```json
{
  "id": 1,
  "email": "testuser@example.com",
  "name": "Test User",
  "role": 0
}
```

---

### Share a Test

**Request:**
```
POST http://localhost:8080/api/tests/1/share
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json

{
  "email": "friend@example.com"
}
```

**Response:** `200 OK`

---

### Update User Role (Admin only)

First, you need to manually make a user admin in the database, or use this endpoint if you already have an admin account.

**Request:**
```
PUT http://localhost:8080/api/admin/users/2/role
Authorization: Bearer ADMIN_TOKEN_HERE
Content-Type: application/json

{
  "role": 1
}
```

**Response:** `200 OK`

---

## 🎯 Postman Collection Setup

### Method 1: Environment Variables (Recommended)

1. Create a new Environment in Postman called "Vulnerable App - Local"
2. Add these variables:
   - `base_url` = `http://localhost:8080`
   - `token` = (leave empty, will be set automatically)

3. In your register/login request, add this to the "Tests" tab:
```javascript
if (pm.response.code === 200) {
    var jsonData = pm.response.json();
    pm.environment.set("token", jsonData.token);
}
```

4. Now use `{{base_url}}` and `{{token}}` in your requests!

### Method 2: Manual Token Management

Just copy-paste the token from login/register responses into the Authorization header of each request.

---

## 🔧 Testing Admin Features

To test admin endpoints, you need an admin user. Here's how:

### Option 1: Directly Update Database

**For H2 (local development):**
1. Go to http://localhost:8080/h2-console
2. Use JDBC URL: `jdbc:h2:file:./data/vulnerableapp-dev`
3. Username: `sa`, Password: (empty)
4. Run SQL:
```sql
UPDATE app_user SET role = 1 WHERE email = 'testuser@example.com';
```

**For PostgreSQL (Docker):**
1. Access Adminer at http://localhost:8081
2. Login with credentials from docker-compose
3. Run the same SQL query

### Option 2: Create Admin User on Registration

Modify the user in database immediately after registration.

---

## 📊 Sample Test Data

### Simple Quiz (1 question)
```json
{
  "title": "Quick Math Test",
  "topic": "Mathematics",
  "emoji": "🔢",
  "description": "Simple math question",
  "timeLimitMinutes": 5,
  "questionsJson": "[{\"id\":1,\"question\":\"What is 2 + 2?\",\"options\":[\"3\",\"4\",\"5\",\"6\"],\"correctAnswer\":1}]"
}
```

### Complex Quiz (3 questions)
```json
{
  "title": "Programming Fundamentals",
  "topic": "Computer Science",
  "emoji": "💻",
  "description": "Test your programming knowledge",
  "timeLimitMinutes": 15,
  "questionsJson": "[{\"id\":1,\"question\":\"What is OOP?\",\"options\":[\"Object Oriented Programming\",\"Only One Program\",\"Open Office Project\",\"Operational Output Protocol\"],\"correctAnswer\":0,\"explanation\":\"OOP stands for Object Oriented Programming\"},{\"id\":2,\"question\":\"Which is a programming language?\",\"options\":[\"HTML\",\"CSS\",\"Python\",\"JSON\"],\"correctAnswer\":2},{\"id\":3,\"question\":\"What does API stand for?\",\"options\":[\"Application Programming Interface\",\"Advanced Programming Interface\",\"Application Process Integration\",\"Automated Programming Interface\"],\"correctAnswer\":0}]"
}
```

---

## 🐛 Troubleshooting

### "401 Unauthorized"
- Make sure you included the `Authorization: Bearer YOUR_TOKEN` header
- Check if your token has expired (24 hours by default)
- Try logging in again to get a fresh token

### "403 Forbidden"
- You're trying to access an admin endpoint without admin role
- Update your user role in the database to `1`

### "CORS Error" (if testing from browser)
- CORS is configured for `localhost:3000` and `localhost:5173`
- Use Postman, Insomnia, or cURL instead
- Or add your origin to `SecurityConfig.java`

### "Connection Refused"
- Make sure the backend server is running
- Check if port 8080 is available
- Verify the URL is `http://localhost:8080` (not https)

### "Invalid JSON"
- Make sure `questionsJson` is a properly escaped JSON string
- Use online JSON validators
- Check for missing quotes or brackets

---

## 🎨 Pretty JSON Formatting

When creating `questionsJson`, you're sending a JSON string inside JSON. Here's how to format it:

**Step 1:** Create your questions array:
```json
[
  {
    "id": 1,
    "question": "What is React?",
    "options": ["A library", "A framework", "A language", "A database"],
    "correctAnswer": 0,
    "explanation": "React is a JavaScript library"
  }
]
```

**Step 2:** Minify it (remove whitespace):
```json
[{"id":1,"question":"What is React?","options":["A library","A framework","A language","A database"],"correctAnswer":0,"explanation":"React is a JavaScript library"}]
```

**Step 3:** Escape it for JSON string:
```json
"[{\"id\":1,\"question\":\"What is React?\",\"options\":[\"A library\",\"A framework\",\"A language\",\"A database\"],\"correctAnswer\":0,\"explanation\":\"React is a JavaScript library\"}]"
```

**Online tools to help:**
- https://jsonformatter.org/
- https://codebeautify.org/json-escape-unescape

---

## 🔒 Security Notes

⚠️ **Important for Production:**
- Change JWT secret in environment variables
- Use HTTPS instead of HTTP
- Implement rate limiting
- Add input validation
- Enable CSRF protection for session-based auth
- Use environment-specific configurations

---

## 📚 Additional Resources

- API runs on: `http://localhost:8080`
- H2 Console: `http://localhost:8080/h2-console`
- Swagger/OpenAPI: (Not configured yet - can be added)

Happy testing! 🚀
