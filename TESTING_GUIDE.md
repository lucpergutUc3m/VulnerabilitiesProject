# 🧪 Guía de Testing - Error 403 Admin Tests

## Status: ✅ RESUELTO

El endpoint `/api/admin/tests` **AHORA FUNCIONA** correctamente.

---

## ✅ Lo que probé y funciona

### 1. Backend corriendo
```
✓ Puerto: 8080
✓ Usuarios creados automáticamente:
  - admin@admin.com / admin123 (role = 1, ADMIN)
  - user@user.com / user123 (role = 0, USER)
```

### 2. Login funciona
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@admin.com","password":"admin123"}'

Response:
{
  "user": {"id": 2, "email": "admin@admin.com", "role": 1},
  "token": "eyJhbGc..."
  "expiresIn": 86400000
}
```

### 3. JWT Token contiene autoridades correctas
```json
{
  "role": 1,
  "name": "System Administrator",
  "userId": 2,
  "authorities": ["ROLE_ADMIN", "ROLE_USER"],
  "sub": "admin@admin.com"
}
```

### 4. GET /api/admin/tests funciona
```bash
TOKEN="eyJhbGc..."
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:8080/api/admin/tests

Response: []  # Array vacío (no hay tests aún)
Status: 200 OK ✓
```

---

## 🧪 Cómo probar en tu navegador

### Paso 1: Abre DevTools (F12)

### Paso 2: Ir a la página de Login
- URL: `http://localhost:5173/login` (o donde esté tu frontend)

### Paso 3: Login con credenciales
```
Email: admin@admin.com
Password: admin123
```

### Paso 4: Abre la Console y ve los logs

Busca algo como:
```
Token payload: {
  "role": 1,
  "authorities": ["ROLE_ADMIN", "ROLE_USER"],
  ...
}

Admin tests response status: 200 OK
Admin tests data: []
```

### Paso 5: Si ves 403, revisa el token
En la Console ejecuta:
```javascript
const token = localStorage.getItem('authToken');
const parts = token.split('.');
const payload = JSON.parse(atob(parts[1]));
console.log('Token completo:', payload);
```

Debería mostrar `authorities: ["ROLE_ADMIN", "ROLE_USER"]`

---

## 🔧 Cambios Realizados

### 1. **JwtAuthenticationFilter.java** ✅
   - Ahora extrae authorities directamente del JWT
   - No solo confía en UserDetails

### 2. **JwtUtil.java** ✅
   - Hecho público `extractAllClaims()`
   - Permite que el filtro lea los claims del JWT

### 3. **userProfile.tsx** ✅
   - Mejorado logging del token
   - Mejor manejo de errores HTTP
   - Decodifica y muestra el JWT en la consola

---

## 📊 Flujo correcto de autenticación

```
1. Frontend: Login con email/password
   ↓
2. Backend: Verifica credenciales
   ↓
3. Backend: Genera JWT con:
   - role: 1
   - authorities: ["ROLE_ADMIN", "ROLE_USER"]
   - userId: 2
   ↓
4. Frontend: Guarda token en localStorage
   ↓
5. Frontend: Envía GET /api/admin/tests
   Header: "Authorization: Bearer {token}"
   ↓
6. Backend JwtAuthenticationFilter:
   - Extrae token del header
   - Decodifica JWT
   - Lee authorities: ["ROLE_ADMIN", "ROLE_USER"]
   - Crea UsernamePasswordAuthenticationToken con esas authorities
   ↓
7. Backend SecurityFilterChain:
   - Verifica: hasRole("ADMIN")
   - Encuentra: "ROLE_ADMIN" en authorities ✓
   - Autoriza la solicitud
   ↓
8. Backend AdminController:
   - Verifica: @PreAuthorize("hasRole('ADMIN')")
   - Encuentra: "ROLE_ADMIN" ✓
   - Ejecuta el método
   ↓
9. Frontend: Recibe response 200 con datos
```

---

## 🚀 Próximos pasos

1. **Prueba completa desde el navegador**
   - Login como admin
   - Abre DevTools Console
   - Verifica que ves los logs mejorados

2. **Si aún ves 403**
   - Comparte el contenido de la Console
   - Incluye el token (primeras 50 caracteres)
   - Incluye la respuesta HTTP

3. **Si funciona**
   - El error se resolvió
   - El frontend ahora mostrará los tests admin

---

## 📝 Notas

- El JWT está codificado en Base64, no cifrado
- El backend valida la firma del token
- La firma se verifica con la clave secreta `jwt.secret`
- En producción, usar una clave más larga (256+ bits)

---

## 🐛 Si sigue dando 403

Posibles causas:

1. **Token expirado**: Logout y login de nuevo
2. **Token corrupto**: Limpiar localStorage y relogin
3. **Rol no es 1**: Verificar BD, debe ser `role = 1`
4. **Problema de CORS**: Revisar headers en Network tab (F12)

Ejecuta en la Console:
```javascript
// Ver usuario guardado
console.log('User:', JSON.parse(localStorage.getItem('user')));

// Ver token guardado (primeros 100 chars)
console.log('Token:', localStorage.getItem('authToken').substring(0, 100));

// Decodificar payload
const token = localStorage.getItem('authToken');
const payload = JSON.parse(atob(token.split('.')[1]));
console.log('Payload:', payload);
```
