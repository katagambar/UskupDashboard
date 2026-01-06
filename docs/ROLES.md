# Role & Permission Matrix

## User Roles

| Role | ID | Description |
|------|-----|-------------|
| USKUP | 100 | Uskup - Decision Maker |
| VIKJEN | 90 | Vikaris Jenderal |
| VIKYUD | 85 | Vikaris Yudisial |
| EKONOM | 80 | Ekonom Keuskupan |
| DELEGATUS | 75 | Delegatus |
| SEKRETARIS | 70 | Sekretaris Uskup - Administrator |
| KURIA | 60 | Anggota Kuria |
| VIKEP | 50 | Vikaris Episkopal (Wilayah) |
| KOMISI | 40 | Ketua/Anggota Komisi |
| PAROKI | 30 | Pastor Paroki |
| STAFF | 10 | Staff biasa |

## Permission Matrix

| Permission | USKUP | SEKRETARIS | VIKJEN | VIKYUD | EKONOM | DELEGATUS | KURIA | VIKEP | KOMISI | PAROKI | STAFF |
|------------|:-----:|:----------:|:------:|:------:|:------:|:---------:|:-----:|:-----:|:------:|:------:|:-----:|
| View Dashboard | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Manage Users | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Create Users | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Approve Documents | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Create Issues | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Give Opinions | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| Submit Reports | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ | ❌ |
| Full Access | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |

## Role Normalization

The system supports both uppercase (standard) and lowercase (legacy) roles:

| Legacy Role | Normalized To |
|-------------|---------------|
| bishop | USKUP |
| secretary | SEKRETARIS |
| vicar_general | VIKJEN |
| vicar_judicial | VIKYUD |
| economist | EKONOM |

## RBAC Functions

Usage in code:

```typescript
import { 
  normalizeRole, 
  canManageUsers, 
  canCreateUsers,
  canApproveDocuments,
  getRoleDisplayName 
} from '@/lib/rbac'

// Normalize any role format
const role = normalizeRole('bishop') // Returns 'USKUP'

// Check permissions
if (canManageUsers(userRole)) {
  // Show user management UI
}

// Display friendly name
const display = getRoleDisplayName('USKUP') // Returns 'Uskup'
```
