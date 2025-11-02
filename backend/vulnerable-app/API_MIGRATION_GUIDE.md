# API Endpoints Migration Summary

## ✅ Changes Completed

The project has been successfully updated to follow the new endpoint structure and logic.

---

## 📊 Database Schema Changes

### TestEntity Table
**ADDED:**
- `public` (BOOLEAN, default: false) - Determines if test is publicly accessible

**REMOVED:**
- Sharing mechanism (`test_shared_with` table is no longer used)

### AppUser Table
**No changes** - Remains the same with role-based access (0=user, 1=admin)

---

## 🔄 Endpoint Changes

### Public Endpoints (No authentication required)
```
POST   /api/auth/register  ✅ No changes
POST   /api/auth/login     ✅ No changes
POST   /api/auth/logout    ✅ No changes
```

### Authenticated User Endpoints
**UPDATED:**
```
GET    /api/users/me                    ✅ No changes
PUT    /api/users/me                    ✅ UPDATED - Now supports password change
  Request body: { 
    "name": "string",           // Optional
    "oldPassword": "string",    // Optional - required with newPassword
    "newPassword": "string"     // Optional - required with oldPassword
  }
```

### Test Endpoints (Authenticated)
**CHANGED:**
```
POST   /api/tests                       ✅ No changes
DELETE /api/tests/{testId}              ✅ No changes
GET    /api/tests/{testId}              ✅ UPDATED - Now checks if test is public OR owned by user

GET    /api/tests                       ✅ NEW - Returns all public tests + user's own tests
  (Replaces /api/tests/my and /api/tests/shared)

PUT    /api/tests/{testId}              ✅ NEW - Update test public status
  Request body: { "isPublic": true/false }
```

**REMOVED:**
```
❌ GET    /api/tests/my        - Replaced by GET /api/tests
❌ GET    /api/tests/shared    - Replaced by GET /api/tests
❌ POST   /api/tests/{testId}/share    - No longer needed
❌ POST   /api/tests/{testId}/unshare  - No longer needed
```

### Admin Endpoints
**UPDATED:**
```
GET    /api/admin/users                 ✅ SIMPLIFIED - No pagination, returns all users
  Response: Array of UserResponse

PUT    /api/admin/users/{userId}        ✅ CHANGED from POST to PUT
  Request body: {
    "name": "string",        // Optional
    "password": "string",    // Optional
    "role": 0 or 1          // Optional
  }

DELETE /api/admin/users/{userId}        ✅ NEW - Delete any user

GET    /api/admin/tests                 ✅ NEW - Get all tests (public and private)

DELETE /api/admin/tests/{testId}        ✅ No changes
```

**REMOVED:**
```
❌ POST   /api/admin/users/{userId}/role  - Replaced by PUT /api/admin/users/{userId}
```

---

## 🔑 Key Logic Changes

### Test Access Control
**Before:** Tests could be private and shared with specific users via `test_shared_with` table

**Now:** Tests have a `public` field:
- `public = false`: Only owner can view
- `public = true`: Everyone can view
- Owner can always view their own tests regardless of public status

### User Management
**Before:** Admins could only update user roles

**Now:** Admins can update:
- Name
- Password (without requiring old password)
- Role
- Can also delete users

**Users can update:**
- Their own name
- Their own password (requires old password verification)

---

## 📝 New DTOs Created

1. **UpdateTestRequest** - For updating test public status
   ```java
   { "isPublic": boolean }
   ```

2. **AdminUpdateUserRequest** - For admin user updates
   ```java
   {
     "name": string,      // Optional
     "password": string,  // Optional
     "role": integer     // Optional (0 or 1)
   }
   ```

3. **UpdateUserRequest** - Enhanced for password changes
   ```java
   {
     "name": string,        // Optional
     "oldPassword": string, // Optional
     "newPassword": string  // Optional
   }
   ```

---

## 🗑️ Files That Can Be Removed

The following files are no longer used and can be deleted:

1. `TestSharedWith.java` (entity) - Sharing mechanism removed
2. `TestSharedWithRepository.java` - No longer needed
3. `ShareTestRequest.java` (DTO) - Sharing endpoints removed
4. `UpdateRoleRequest.java` (DTO) - Replaced by AdminUpdateUserRequest
5. `UpdatePasswordRequest.java` (DTO) - Merged into UpdateUserRequest

---

## ✅ Testing Checklist

### User Endpoints
- [ ] Register new user
- [ ] Login
- [ ] GET /api/users/me
- [ ] PUT /api/users/me (update name only)
- [ ] PUT /api/users/me (update password with old password)
- [ ] Logout

### Test Endpoints
- [ ] POST /api/tests (create private test)
- [ ] GET /api/tests (should see own tests only)
- [ ] PUT /api/tests/{id} (make test public)
- [ ] GET /api/tests (should see own + public tests)
- [ ] GET /api/tests/{id} (access public test)
- [ ] DELETE /api/tests/{id}

### Admin Endpoints (requires admin role)
- [ ] GET /api/admin/users
- [ ] PUT /api/admin/users/{id} (update name)
- [ ] PUT /api/admin/users/{id} (update password)
- [ ] PUT /api/admin/users/{id} (update role)
- [ ] GET /api/admin/tests
- [ ] DELETE /api/admin/users/{id}
- [ ] DELETE /api/admin/tests/{id}

---

## 🚀 Migration Notes

### Database Migration
When deploying, the database will automatically add the `public` column to existing tests with default value `false` (private).

**Manual steps if needed:**
```sql
-- Make all existing tests public (optional)
UPDATE test_entity SET public = true;

-- Or keep existing tests private (default behavior)
-- No action needed
```

### Cleanup Old Data
```sql
-- Remove sharing data (optional - will happen automatically on cascade delete)
DROP TABLE IF EXISTS test_shared_with;
```

---

## 📚 Example Requests

### Create a Public Test
```json
POST /api/tests
{
  "title": "Public Quiz",
  "topic": "General Knowledge",
  "emoji": "📚",
  "description": "Test for everyone",
  "timeLimitMinutes": 30,
  "questionsJson": "[...]"
}

// Then make it public:
PUT /api/tests/1
{
  "isPublic": true
}
```

### Update User Password
```json
PUT /api/users/me
{
  "oldPassword": "currentPassword123",
  "newPassword": "newPassword456"
}
```

### Admin Update User
```json
PUT /api/admin/users/2
{
  "name": "Updated Name",
  "role": 1
}
```

---

## 🎯 Benefits of New Structure

1. **Simpler**: No complex sharing mechanism to maintain
2. **Clearer**: Public vs private is intuitive
3. **Scalable**: Public tests can be discovered by all users
4. **Flexible**: Admins have full control over users
5. **Secure**: Password changes require old password verification

---

## ⚠️ Breaking Changes

**Frontend must be updated to:**
1. Use `GET /api/tests` instead of `/api/tests/my` or `/api/tests/shared`
2. Use `PUT /api/tests/{id}` to toggle public status
3. Use `PUT /api/admin/users/{id}` instead of `POST /api/admin/users/{id}/role`
4. Handle new `isPublic` field in TestResponse
5. Remove sharing UI components
6. Add public/private toggle UI

---

All changes have been implemented and are ready for testing! 🎉
