# 🔐 Authentication Documentation

## Overview

Dashboard Uskup Surabaya menggunakan custom JWT-based authentication dengan:

- **jose** library untuk JWT signing/verification
- **bcryptjs** untuk password hashing
- **httpOnly cookies** untuk token storage

---

## Authentication Flow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Client    │     │    API      │     │  Database   │
└──────┬──────┘     └──────┬──────┘     └──────┬──────┘
       │                   │                   │
       │ POST /api/auth/login                  │
       │ {email, password, rememberMe}         │
       │──────────────────>│                   │
       │                   │                   │
       │                   │ Find user by email│
       │                   │──────────────────>│
       │                   │<──────────────────│
       │                   │                   │
       │                   │ Verify password   │
       │                   │ (bcrypt.compare)  │
       │                   │                   │
       │                   │ Create JWT        │
       │                   │ (jose SignJWT)    │
       │                   │                   │
       │ Set-Cookie: auth-token=<JWT>          │
       │ {success: true, user: {...}}          │
       │<──────────────────│                   │
       │                   │                   │
```

---

## Endpoints

### POST /api/auth/login

Login user dan set auth cookie.

**Request:**

```json
{
  "email": "uskup@keuskupan-sby.or.id",
  "password": "UskupSBY2025!",
  "rememberMe": false
}
```

**Response (Success):**

```json
{
  "success": true,
  "user": {
    "id": "clx...",
    "email": "uskup@keuskupan-sby.or.id",
    "name": "Mgr. Agustinus Tri Budi Utomo",
    "role": "bishop"
  }
}
```

**Cookie Set:**

- Name: `auth-token`
- HttpOnly: true
- Secure: true (production)
- SameSite: lax
- MaxAge: 1 day (default) / 30 days (remember me)

### GET /api/auth/me

Get current authenticated user.

**Response:**

```json
{
  "success": true,
  "user": {
    "id": "clx...",
    "email": "uskup@keuskupan-sby.or.id",
    "name": "Mgr. Agustinus Tri Budi Utomo",
    "role": "bishop"
  }
}
```

### POST /api/auth/logout

Logout user dan clear cookie.

**Response:**

```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

### POST /api/auth/refresh

Refresh access token menggunakan refresh token.

**Response:**

```json
{
  "success": true,
  "user": { ... }
}
```

---

## JWT Structure

### Access Token (auth-token)

**Header:**

```json
{
  "alg": "HS256",
  "typ": "JWT"
}
```

**Payload:**

```json
{
  "userId": "clx...",
  "email": "uskup@keuskupan-sby.or.id",
  "name": "Mgr. Agustinus Tri Budi Utomo",
  "role": "bishop",
  "iat": 1704123456,
  "exp": 1704209856
}
```

### Token Expiration

| Option | Expiration |
|--------|------------|
| Default | 1 day |
| Remember Me | 30 days |
| Refresh Token | 60 days |

---

## Password Security

### Hashing

Passwords di-hash menggunakan bcryptjs dengan 12 salt rounds.

```typescript
// src/lib/password.ts
export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 12)
}
```

### Verification

```typescript
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash)
}
```

### Validation Rules

Password harus memenuhi:

- Minimal 8 karakter
- Minimal 1 huruf uppercase
- Minimal 1 huruf lowercase
- Minimal 1 angka
- Minimal 1 karakter spesial (!@#$%^&*)

---

## Usage in API Routes

### Protecting Routes

```typescript
// src/app/api/protected/route.ts
import { getCurrentUserFromRequest } from '@/lib/custom-auth'

export async function POST(request: NextRequest) {
  const user = await getCurrentUserFromRequest(request)
  
  if (!user) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    )
  }
  
  // User is authenticated, proceed...
}
```

### Role-based Access

```typescript
if (user.role !== 'bishop' && user.role !== 'admin') {
  return NextResponse.json(
    { success: false, error: 'Forbidden' },
    { status: 403 }
  )
}
```

---

## Client-side Usage

### useAuth Hook

```typescript
import { useCurrentUser } from '@/hooks/useAuth'

function ProtectedComponent() {
  const { user, isAuthenticated, isLoading, login, logout } = useCurrentUser()
  
  if (isLoading) return <Loading />
  if (!isAuthenticated) return <Redirect to="/auth/signin" />
  
  return <Dashboard user={user} />
}
```

### Login Form

```typescript
const handleLogin = async (e: FormEvent) => {
  e.preventDefault()
  
  const result = await login(email, password, rememberMe)
  
  if (result.success) {
    router.push('/')
  } else {
    setError(result.error)
  }
}
```

---

## Security Best Practices

1. **HttpOnly Cookies** - Token tidak bisa diakses via JavaScript
2. **Secure Flag** - Cookie hanya dikirim via HTTPS (production)
3. **SameSite** - Proteksi CSRF dengan SameSite=lax
4. **Password Hashing** - bcrypt dengan 12 salt rounds
5. **JWT Expiration** - Short-lived tokens dengan refresh mechanism
6. **Input Validation** - Validasi email dan password sebelum processing

---

## Demo Credentials

| Email | Password | Role |
|-------|----------|------|
| <uskup@keuskupan-sby.or.id> | UskupSBY2025! | bishop |
