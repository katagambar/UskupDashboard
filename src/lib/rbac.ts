/**
 * Role-Based Access Control (RBAC) Helpers
 * 
 * Utility functions untuk permission checking berdasarkan role/jabatan.
 */

// Role enum values (harus match dengan Prisma schema)
export const UserRoles = {
    USKUP: 'USKUP',
    SEKRETARIS: 'SEKRETARIS',
    VIKJEN: 'VIKJEN',
    VIKYUD: 'VIKYUD',
    EKONOM: 'EKONOM',
    DELEGATUS: 'DELEGATUS',
    KURIA: 'KURIA',
    VIKEP: 'VIKEP',
    KOMISI: 'KOMISI',
    PAROKI: 'PAROKI',
    STAFF: 'STAFF',
} as const

export type UserRole = typeof UserRoles[keyof typeof UserRoles]

// ============================================
// ROLE ALIASES - Map lowercase/legacy roles to standard uppercase
// ============================================
const ROLE_ALIASES: Record<string, UserRole> = {
    // Lowercase variants (from legacy/external systems)
    'bishop': 'USKUP',
    'secretary': 'SEKRETARIS',
    'vicar_general': 'VIKJEN',
    'vicar_judicial': 'VIKYUD',
    'economist': 'EKONOM',
    'delegate': 'DELEGATUS',
    'curia': 'KURIA',
    'vicar_episcopal': 'VIKEP',
    'commission': 'KOMISI',
    'parish': 'PAROKI',
    'staff': 'STAFF',
    // Handle common lowercase versions
    'uskup': 'USKUP',
    'sekretaris': 'SEKRETARIS',
    'vikjen': 'VIKJEN',
    'vikyud': 'VIKYUD',
    'ekonom': 'EKONOM',
    'delegatus': 'DELEGATUS',
    'kuria': 'KURIA',
    'vikep': 'VIKEP',
    'komisi': 'KOMISI',
    'paroki': 'PAROKI',
}

/**
 * Normalize role to standard uppercase format
 * Handles legacy lowercase roles from database
 */
export function normalizeRole(role?: string | null): UserRole {
    if (!role) return 'STAFF'

    // Check if already valid uppercase role
    const upper = role.toUpperCase() as UserRole
    if (Object.values(UserRoles).includes(upper)) {
        return upper
    }

    // Check aliases
    const lower = role.toLowerCase()
    if (ROLE_ALIASES[lower]) {
        return ROLE_ALIASES[lower]
    }

    // Default to STAFF if unknown
    return 'STAFF'
}

// Role hierarchy levels untuk comparison
const RoleHierarchy: Record<UserRole, number> = {
    USKUP: 100,
    VIKJEN: 90,
    VIKYUD: 85,
    EKONOM: 80,
    DELEGATUS: 75,
    SEKRETARIS: 70,
    KURIA: 60,
    VIKEP: 50,
    KOMISI: 40,
    PAROKI: 30,
    STAFF: 10,
}

// ============================================
// ROLE CHECKING FUNCTIONS (use normalizeRole internally)
// ============================================

/**
 * Check if user can manage other users (CRUD)
 */
export function canManageUsers(role?: string | null): boolean {
    const normalized = normalizeRole(role)
    return ['USKUP', 'SEKRETARIS', 'VIKJEN'].includes(normalized)
}

/**
 * Check if user can create/edit users (Super Admin)
 */
export function canCreateUsers(role?: string | null): boolean {
    const normalized = normalizeRole(role)
    return ['USKUP', 'SEKRETARIS'].includes(normalized)
}

// ============================================
// ROLE CHECKING FUNCTIONS
// ============================================

/**
 * Check if user is Uskup
 */
export function isUskup(role?: string | null): boolean {
    return normalizeRole(role) === UserRoles.USKUP
}

/**
 * Check if user is Sekretaris
 */
export function isSekretaris(role?: string | null): boolean {
    return normalizeRole(role) === UserRoles.SEKRETARIS
}

/**
 * Check if user is part of Kuria (pejabat strategis)
 */
export function isCuria(role?: string | null): boolean {
    const normalized = normalizeRole(role)
    const curiaRoles: UserRole[] = [
        UserRoles.USKUP,
        UserRoles.VIKJEN,
        UserRoles.VIKYUD,
        UserRoles.EKONOM,
        UserRoles.DELEGATUS,
        UserRoles.SEKRETARIS,
        UserRoles.KURIA,
    ]
    return curiaRoles.includes(normalized)
}

/**
 * Check if user can approve documents (digital signature)
 */
export function canApproveDocuments(role?: string | null): boolean {
    const normalized = normalizeRole(role)
    return normalized === UserRoles.USKUP || normalized === UserRoles.VIKJEN
}

/**
 * Check if user can create/manage issues for consultation
 */
export function canCreateIssues(role?: string | null): boolean {
    const normalized = normalizeRole(role)
    const allowedRoles: UserRole[] = [
        UserRoles.USKUP,
        UserRoles.SEKRETARIS,
        UserRoles.VIKJEN,
    ]
    return allowedRoles.includes(normalized)
}

/**
 * Check if user can give opinions on issues
 */
export function canGiveOpinions(role?: string | null): boolean {
    const normalized = normalizeRole(role)
    // Semua pejabat kecuali staff dan paroki bisa memberikan pendapat
    const excludedRoles: UserRole[] = [UserRoles.STAFF, UserRoles.PAROKI]
    return !excludedRoles.includes(normalized)
}

/**
 * Check if user can submit reports
 */
export function canSubmitReports(role?: string | null): boolean {
    const normalized = normalizeRole(role)
    const reporterRoles: UserRole[] = [
        UserRoles.VIKEP,
        UserRoles.KOMISI,
        UserRoles.PAROKI,
        UserRoles.KURIA,
    ]
    return reporterRoles.includes(normalized)
}

/**
 * Check if user can view all data (admin-level)
 */
export function hasFullAccess(role?: string | null): boolean {
    const normalized = normalizeRole(role)
    return normalized === UserRoles.USKUP || normalized === UserRoles.SEKRETARIS
}

/**
 * Check if roleA has higher hierarchy than roleB
 */
export function hasHigherRole(roleA?: string | null, roleB?: string | null): boolean {
    if (!roleA || !roleB) return false
    const levelA = RoleHierarchy[roleA as UserRole] || 0
    const levelB = RoleHierarchy[roleB as UserRole] || 0
    return levelA > levelB
}

/**
 * Get role display name in Indonesian
 */
export function getRoleDisplayName(role?: string | null): string {
    if (!role) return 'Pengguna'

    const displayNames: Record<UserRole, string> = {
        USKUP: 'Uskup',
        SEKRETARIS: 'Sekretaris Uskup',
        VIKJEN: 'Vikaris Jenderal',
        VIKYUD: 'Vikaris Yudisial',
        EKONOM: 'Ekonom Keuskupan',
        DELEGATUS: 'Delegatus',
        KURIA: 'Anggota Kuria',
        VIKEP: 'Vikaris Episkopal',
        KOMISI: 'Ketua Komisi',
        PAROKI: 'Pastor Paroki',
        STAFF: 'Staff',
    }

    return displayNames[role as UserRole] || 'Pengguna'
}

/**
 * Get roles that can be consulted (for disposition)
 */
export function getConsultableRoles(): UserRole[] {
    return [
        UserRoles.VIKJEN,
        UserRoles.VIKYUD,
        UserRoles.EKONOM,
        UserRoles.DELEGATUS,
        UserRoles.KURIA,
    ]
}
