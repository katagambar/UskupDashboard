# 🔐 Role-Based Access Control (RBAC)

Dokumentasi lengkap mengenai sistem role dan akses di Dashboard Uskup Surabaya.

**Last Updated:** 10 Januari 2026  
**File:** `src/lib/rbac.ts`

---

## 📋 Daftar Role

Dashboard Uskup Surabaya memiliki **11 role** dengan hierarki sebagai berikut:

| Role         | Display Name      | Level | Deskripsi                      |
| ------------ | ----------------- | ----- | ------------------------------ |
| `USKUP`      | Uskup             | 100   | Decision maker tertinggi       |
| `VIKJEN`     | Vikaris Jenderal  | 90    | Wakil Uskup, pejabat strategis |
| `VIKYUD`     | Vikaris Yudisial  | 85    | Penanganan hukum kanonik       |
| `EKONOM`     | Ekonom Keuskupan  | 80    | Pengelolaan keuangan           |
| `DELEGATUS`  | Delegatus         | 75    | Delegasi tugas khusus          |
| `SEKRETARIS` | Sekretaris Uskup  | 70    | Administrator utama            |
| `KURIA`      | Anggota Kuria     | 60    | Anggota kuria keuskupan        |
| `VIKEP`      | Vikaris Episkopal | 50    | Vikaris wilayah                |
| `KOMISI`     | Ketua Komisi      | 40    | Ketua komisi keuskupan         |
| `PAROKI`     | Pastor Paroki     | 30    | Pastor paroki (reporting)      |
| `STAFF`      | Staff             | 10    | Staff biasa                    |

---

## 🔑 Permission Matrix

### Hak Akses per Role

| Permission            | USKUP | VIKJEN | SEKRETARIS | EKONOM | VIKYUD | DELEGATUS | KURIA | VIKEP | KOMISI | PAROKI | STAFF |
| --------------------- | ----- | ------ | ---------- | ------ | ------ | --------- | ----- | ----- | ------ | ------ | ----- |
| **Full Access**       | ✅    | ❌     | ✅         | ❌     | ❌     | ❌        | ❌    | ❌    | ❌     | ❌     | ❌    |
| **Approve Documents** | ✅    | ✅     | ❌         | ❌     | ❌     | ❌        | ❌    | ❌    | ❌     | ❌     | ❌    |
| **Manage Users**      | ✅    | ✅     | ✅         | ❌     | ❌     | ❌        | ❌    | ❌    | ❌     | ❌     | ❌    |
| **Create Users**      | ✅    | ❌     | ✅         | ❌     | ❌     | ❌        | ❌    | ❌    | ❌     | ❌     | ❌    |
| **Create Issues**     | ✅    | ✅     | ✅         | ❌     | ❌     | ❌        | ❌    | ❌    | ❌     | ❌     | ❌    |
| **Give Opinions**     | ✅    | ✅     | ✅         | ✅     | ✅     | ✅        | ✅    | ✅    | ✅     | ❌     | ❌    |
| **Submit Reports**    | ❌    | ❌     | ❌         | ❌     | ❌     | ❌        | ✅    | ✅    | ✅     | ✅     | ❌    |
| **Part of Curia**     | ✅    | ✅     | ✅         | ✅     | ✅     | ✅        | ✅    | ❌    | ❌     | ❌     | ❌    |

---

## 🏛️ Anggota Kuria

Berikut role yang termasuk pejabat strategis (Kuria):

- USKUP
- VIKJEN (Vikaris Jenderal)
- VIKYUD (Vikaris Yudisial)
- EKONOM
- DELEGATUS
- SEKRETARIS
- KURIA

---

## 📖 Permission Functions

### Basic Role Checks

```typescript
import { isUskup, isSekretaris, isCuria } from "@/lib/rbac";

// Check if user is Uskup
if (isUskup(user.role)) {
  // Allow decision-making actions
}

// Check if user is part of Kuria
if (isCuria(user.role)) {
  // Allow strategic access
}
```

### Permission Checks

```typescript
import {
  canApproveDocuments,
  canManageUsers,
  canCreateIssues,
  canGiveOpinions,
  canSubmitReports,
  hasFullAccess,
} from "@/lib/rbac";

// Check document approval rights
if (canApproveDocuments(user.role)) {
  // Show sign button
}

// Check if user can manage other users
if (canManageUsers(user.role)) {
  // Show user management menu
}
```

### Role Comparison

```typescript
import { hasHigherRole, normalizeRole } from "@/lib/rbac";

// Compare role hierarchy
if (hasHigherRole(currentUser.role, targetUser.role)) {
  // Can manage lower-level users
}

// Normalize legacy roles
const role = normalizeRole(user.role); // 'bishop' → 'USKUP'
```

### Display Names

```typescript
import { getRoleDisplayName, getConsultableRoles } from "@/lib/rbac";

// Get Indonesian display name
getRoleDisplayName("VIKJEN"); // 'Vikaris Jenderal'

// Get roles that can be consulted
const roles = getConsultableRoles();
// ['VIKJEN', 'VIKYUD', 'EKONOM', 'DELEGATUS', 'KURIA']
```

---

## 🔄 Role Aliases

Legacy role names otomatis di-normalize:

| Legacy              | Normalized   |
| ------------------- | ------------ |
| `bishop`            | `USKUP`      |
| `secretary`         | `SEKRETARIS` |
| `vicar_general`     | `VIKJEN`     |
| `vicar_judicial`    | `VIKYUD`     |
| `economist`         | `EKONOM`     |
| `uskup` (lowercase) | `USKUP`      |

---

## 🔗 Related Files

- **RBAC Logic:** `src/lib/rbac.ts`
- **User Schema:** `prisma/schema.prisma` (UserRole enum)
- **Auth Hook:** `src/hooks/useAuth.ts`
- **Master Data:** `docs/MASTER_DATA.md`

---

## 📝 Catatan Implementasi

1. **Role disimpan sebagai String** di database, bukan enum Prisma (untuk fleksibilitas)
2. **Semua role harus UPPERCASE** di database
3. **Default role adalah STAFF** jika tidak ada atau tidak valid
4. **canApprove field di User model** bisa override untuk kasus khusus

---

_Dashboard Uskup Surabaya © 2026_
