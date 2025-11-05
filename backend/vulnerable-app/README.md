# Vulnerable App Backend API

A secure Spring Boot REST API for test management with role-based access control.

## 📋 Features

- **JWT Authentication** - Secure token-based authentication
- **Role-Based Access Control** - Three user roles (Normal, Superuser, Admin)
- **Test Management** - Create, update, delete, and share tests
- **Category System** - Propose and manage test categories with approval workflow
- **Sharing System** - Share tests with specific users
- **Search Functionality** - Search accessible tests by keyword

## 🛠️ Technology Stack

- **Java 21**
- **Spring Boot 3.5.7**
- **Spring Security** with JWT
- **Spring Data JPA**
- **H2 Database** (development) / PostgreSQL/MySQL (production)
- **Lombok** - Reduces boilerplate code
- **Maven** - Dependency management

## 📦 Database Schema

### Tables

1. **app_user** - User accounts with roles
2. **test_entity** - Test definitions with questions
3. **test_shared_with** - Test sharing relationships
4. **category** - Test categories with approval status
5. **test_category** - Test-category associations

## 🚀 Getting Started

### Prerequisites

- Java 21 or higher
- Maven 3.6+
- (Optional) PostgreSQL or MySQL for production

### Installation

1. **Clone the repository**
   ```bash
   cd backend/vulnerable-app
   ```

2. **Configure application.properties**
   - Copy settings from `SECURITY_CONFIG_TEMPLATE.txt`
   - Update `jwt.secret` with a secure random string
   - Configure database settings if using PostgreSQL/MySQL

3. **Build the project**
   ```bash
   mvnw clean install
   ```

4. **Run the application**
   ```bash
   mvnw spring-boot:run
   ```

The API will be available at `http://localhost:8080`

### H2 Console (Development)

Access the H2 database console at: `http://localhost:8080/h2-console`
- JDBC URL: `jdbc:h2:mem:testdb`
- Username: `sa`
- Password: (leave empty)

## 🔐 Security Configuration

### JWT Configuration

Update in `application.properties`:
```properties
jwt.secret=YOUR_SECURE_SECRET_KEY_HERE
jwt.expiration=86400000
```

Generate a secure secret:
```bash
openssl rand -base64 64
```

### CORS Configuration

Configure allowed origins for your frontend:
```properties
cors.allowed-origins=http://localhost:3000,http://localhost:5173
```

### User Roles

- **0 - Normal User** (ROLE_USER): Can create and manage own tests
- **1 - Superuser** (ROLE_SUPERUSER, ROLE_USER): Extended permissions
- **2 - Admin** (ROLE_ADMIN, ROLE_SUPERUSER, ROLE_USER): Full access including category approval

## 📡 API Endpoints

### Public Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login and get JWT token |
| GET | `/api/categories` | Get approved categories |

### Authenticated Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users/me` | Get current user info |
| PUT | `/api/users/me` | Update current user |
| POST | `/api/tests` | Create new test |
| PUT | `/api/tests/{testId}` | Update test |
| DELETE | `/api/tests/{testId}` | Delete test |
| GET | `/api/tests/{testId}` | Get test details |
| GET | `/api/tests/mine` | Get user's tests |
| GET | `/api/tests/shared` | Get tests shared with user |
| GET | `/api/tests/search?q=keyword` | Search tests |
| POST | `/api/tests/{testId}/share` | Share test with user |
| POST | `/api/tests/{testId}/unshare` | Unshare test |
| POST | `/api/categories/propose` | Propose new category |
| GET | `/api/categories/mine` | Get user's categories |
| POST | `/api/tests/{testId}/categories` | Add category to test |
| DELETE | `/api/tests/{testId}/categories/{categoryId}` | Remove category |

### Admin Endpoints (ROLE_ADMIN)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/categories/pending` | Get pending categories |
| POST | `/api/admin/categories/{categoryId}/approve` | Approve category |
| POST | `/api/admin/categories/{categoryId}/reject` | Reject category |
| POST | `/api/admin/users/{userId}/role` | Update user role |
| DELETE | `/api/admin/tests/{testId}` | Delete any test |
| POST | `/api/admin/config/vuln-mode` | Toggle vulnerability mode |

## 🔒 Authentication

### Register
```json
POST /api/auth/register
{
  "email": "user@example.com",
  "fullName": "John Doe",
  "password": "securepassword"
}
```

### Login
```json
POST /api/auth/login
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

Response:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "email": "user@example.com",
  "fullName": "John Doe",
  "role": 0
}
```

### Using JWT Token

Include the token in request headers:
```
Authorization: Bearer {token}
```

## 📝 Example Requests

### Create Test
```json
POST /api/tests
Authorization: Bearer {token}

{
  "title": "JavaScript Fundamentals",
  "description": "Test your JS knowledge",
  "questionsJson": "[{\"question\":\"What is closure?\",\"options\":[\"A\",\"B\",\"C\"],\"answer\":0}]",
  "timeLimitMinutes": 30
}
```

### Share Test
```json
POST /api/tests/1/share
Authorization: Bearer {token}

{
  "email": "friend@example.com"
}
```

### Propose Category
```json
POST /api/categories/propose
Authorization: Bearer {token}

{
  "name": "Python",
  "emoji": "🐍"
}
```

## 🛡️ Security Features

✅ **JWT-based authentication**
✅ **Password encryption with BCrypt**
✅ **Role-based authorization**
✅ **CORS protection**
✅ **Input validation**
✅ **SQL injection prevention** (JPA parameterized queries)
✅ **CSRF protection disabled** (stateless API)
✅ **Access control checks** on all sensitive operations

## 📁 Project Structure

```
src/main/java/com/vulnerable/vulnerableapp/
├── controller/          # REST controllers
│   ├── AuthController.java
│   ├── UserController.java
│   ├── TestController.java
│   ├── CategoryController.java
│   └── AdminController.java
├── dto/                 # Data Transfer Objects
├── entity/              # JPA entities
├── repository/          # Spring Data repositories
├── security/            # Security configuration & JWT
├── service/             # Business logic
└── exception/           # Exception handlers
```

## 🧪 Testing

Run tests:
```bash
mvnw test
```

## 🚨 Important Security Notes

1. **Change JWT secret** in production - use a strong random string (256+ bits)
2. **Use HTTPS** in production - never expose this API over HTTP
3. **Configure proper CORS** - only allow trusted frontend origins
4. **Use production database** - switch from H2 to PostgreSQL/MySQL
5. **Set strong password requirements** - consider increasing minimum length
6. **Enable rate limiting** - protect against brute force attacks
7. **Monitor logs** - track authentication attempts and errors
8. **Regular security audits** - keep dependencies updated

## 📄 License

This is a demonstration project for educational purposes.

## 👥 Contributing

This is a learning/demonstration project. See `SECURITY_CONFIG_TEMPLATE.txt` for detailed security configuration guidelines.
