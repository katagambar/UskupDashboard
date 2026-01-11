# 🛡️ Security Documentation

Dashboard Uskup Surabaya dirancang dengan pendekatan _Security by Design_ dan _Defense in Depth_. Dokumen ini menjelaskan fitur keamanan, konfigurasi, dan kebijakan keamanan project.

**Last Updated:** 11 Januari 2026

---

## 🔐 Authentication & Authorization

### 1. Authentication

- **Custom JWT Auth**: Menggunakan JSON Web Tokens (JWT) yang diamankan dengan `JWT_SECRET`.
- **Password Hashing**: Menggunakan `bcryptjs` dengan salt rounds standar.
- **2FA (Two-Factor Authentication)**: Mendukung TOTP (Time-based One-Time Password) untuk keamanan tambahan.
- **Session Management**: Secure, HTTP-only cookies untuk menyimpan session token.

### 2. Role-Based Access Control (RBAC)

Sistem memiliki 11 tingkat role dengan hierarki yang ketat:

- **Core Implementation**: `src/lib/rbac.ts`
- **Permission Checks**:
  - `hasFullAccess()`: Admin level (Uskup, Sekretaris)
  - `canApproveDocuments()`: Digital signature authority
  - `isCuria()`: Akses data strategis
- **Role Normalization**: Normalisasi otomatis role legacy (e.g., 'bishop' -> 'USKUP').

---

## 🌐 Network & Application Security

### 1. Content Security Policy (CSP)

Diperketat di `next.config.ts`:

- `default-src 'self'`: Default hanya dari origin sendiri.
- `script-src`: Menghapus `'unsafe-eval'` untuk mitigasi XSS penuh.
- `connect-src`: Whitelist domain API eksternal (Google APIs).

### 2. HTTP Security Headers

Header keamanan standar diterapkan pada semua response:

- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY` (Anti-Clickjacking)
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Strict-Transport-Security` (HSTS) pada production.

### 3. Rate Limiting (DOS Protection)

Implementasi **Token Bucket** di level server (`server.ts`):

- **Limit**: 100 requests / 10 detik per IP.
- **Storage**: In-memory Map (efisien untuk deployment single-instance).
- **Protection**: Melindungi seluruh aplikasi (API & Pages) dari brute-force dan spam.

---

## 🔑 Data Protection

### 1. Secret Management

- **Environment Variables**: Semua kredensial sensitif disimpan di `.env`.
- **No Hardcoded Secrets**: Pemindaian rutin untuk memastikan tidak ada API key di source code.
- **Config**:
  - `DATABASE_URL`
  - `JWT_SECRET`
  - `MAGISTERIUM_API_KEY`
  - `GOOGLE_SERVICE_ACCOUNT`

### 2. Input Validation

- **Zod Schemas**: Validasi ketat pada semua input API (`src/lib/validation-schemas.ts`).
- **Sanitization**: Mencegah SQL Injection dan NoSQL Injection melalui ORM (Prisma).

---

## 🐛 Vulnerability Management

### 1. Dependency Audits

- **Routine Check**: `npm audit` dijalankan secara berkala.
- **Policy**:
  - **Critical**: 0 tolerated (Immediate fix).
  - **High**: Fix within 24 hours.
  - **Moderate**: Fix in next maintenance cycle.

### 2. Recent Hardening (Jan 2026)

- Upgrade Next.js ke v16.0.9+ (Fix RCE vulnerability CVE-2025-66478).
- Upgrade `react-syntax-highlighter` ke v16.1.0.
- Implementasi server-side custom rate limiting.

---

## 📝 Reporting Security Issues

Jika Anda menemukan celah keamanan, **JANGAN** membuat public issue di GitHub.
Silakan lapor langsung ke tim pengembang atau Sekretariat Keuskupan.

---

_Keuskupan Surabaya IT Team © 2026_
