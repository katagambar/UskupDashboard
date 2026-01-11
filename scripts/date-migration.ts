/**
 * Date Migration Scripts
 * 
 * Preparation scripts for migrating from String dates to DateTime
 * This will be used in v3.0 major version upgrade
 * 
 * Current: tanggal stored as String "2026-01-09"
 * Future:  tanggal stored as DateTime
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// ============================================
// ANALYSIS FUNCTIONS
// ============================================

/**
 * Analyze current date formats in database
 * Run this before migration to understand the data
 */
export async function analyzeDateFormats(): Promise<{
  model: string
  field: string
  totalRecords: number
  validDates: number
  invalidDates: number
  samples: string[]
}[]> {
  const results: {
    model: string
    field: string
    totalRecords: number
    validDates: number
    invalidDates: number
    samples: string[]
  }[] = []

  // Check Agenda.tanggal
  const agendas = await prisma.agenda.findMany({
    select: { tanggal: true },
    take: 100,
  })
  const agendaTotal = await prisma.agenda.count()
  const agendaValid = agendas.filter(a => isValidDate(a.tanggal)).length
  results.push({
    model: 'Agenda',
    field: 'tanggal',
    totalRecords: agendaTotal,
    validDates: agendaValid,
    invalidDates: agendas.length - agendaValid,
    samples: agendas.slice(0, 5).map(a => a.tanggal),
  })

  // Check Task.deadline
  const tasks = await prisma.task.findMany({
    select: { deadline: true },
    take: 100,
  })
  const taskTotal = await prisma.task.count()
  const taskValid = tasks.filter(t => t.deadline && isValidDate(t.deadline)).length
  results.push({
    model: 'Task',
    field: 'deadline',
    totalRecords: taskTotal,
    validDates: taskValid,
    invalidDates: tasks.filter(t => t.deadline).length - taskValid,
    samples: tasks.slice(0, 5).map(t => t.deadline || 'null'),
  })

  // Check Surat.tanggal
  const surats = await prisma.surat.findMany({
    select: { tanggal: true },
    take: 100,
  })
  const suratTotal = await prisma.surat.count()
  const suratValid = surats.filter(s => isValidDate(s.tanggal)).length
  results.push({
    model: 'Surat',
    field: 'tanggal',
    totalRecords: suratTotal,
    validDates: suratValid,
    invalidDates: surats.length - suratValid,
    samples: surats.slice(0, 5).map(s => s.tanggal),
  })

  return results
}

/**
 * Check if date string is valid
 */
function isValidDate(dateStr: string): boolean {
  if (!dateStr) return false
  const date = new Date(dateStr)
  return !isNaN(date.getTime())
}

// ============================================
// MIGRATION FUNCTIONS (for v3.0)
// ============================================

/**
 * Migration Step 1: Add new DateTime columns
 * This would be done via Prisma schema change:
 * 
 * model Agenda {
 *   tanggal      String    // Old
 *   tanggalDate  DateTime? // New (temporary)
 * }
 */
export const SCHEMA_MIGRATION_SQL = `
-- Step 1: Add new DateTime columns (temporary)
ALTER TABLE "Agenda" ADD COLUMN "tanggalDate" TIMESTAMP;
ALTER TABLE "Agenda" ADD COLUMN "tanggalAkhirDate" TIMESTAMP;
ALTER TABLE "Task" ADD COLUMN "deadlineDate" TIMESTAMP;
ALTER TABLE "Surat" ADD COLUMN "tanggalDate" TIMESTAMP;
ALTER TABLE "Notulensi" ADD COLUMN "tanggalDate" TIMESTAMP;

-- Step 2: Migrate data
UPDATE "Agenda" SET "tanggalDate" = "tanggal"::timestamp WHERE "tanggal" IS NOT NULL;
UPDATE "Agenda" SET "tanggalAkhirDate" = "tanggalAkhir"::timestamp WHERE "tanggalAkhir" IS NOT NULL;
UPDATE "Task" SET "deadlineDate" = "deadline"::timestamp WHERE "deadline" IS NOT NULL;
UPDATE "Surat" SET "tanggalDate" = "tanggal"::timestamp WHERE "tanggal" IS NOT NULL;
UPDATE "Notulensi" SET "tanggalDate" = "tanggal"::timestamp WHERE "tanggal" IS NOT NULL;

-- Step 3: Rename columns (in a later migration)
-- ALTER TABLE "Agenda" DROP COLUMN "tanggal";
-- ALTER TABLE "Agenda" RENAME COLUMN "tanggalDate" TO "tanggal";
`

/**
 * Dry-run migration to test date conversion
 */
export async function dryRunMigration(): Promise<{
  model: string
  success: number
  failed: number
  errors: string[]
}[]> {
  const results: {
    model: string
    success: number
    failed: number
    errors: string[]
  }[] = []

  // Test Agenda dates
  const agendas = await prisma.agenda.findMany({ take: 100 })
  let agendaSuccess = 0
  let agendaFailed = 0
  const agendaErrors: string[] = []
  
  for (const agenda of agendas) {
    try {
      const date = new Date(agenda.tanggal)
      if (isNaN(date.getTime())) {
        agendaFailed++
        agendaErrors.push(`ID ${agenda.id}: Invalid date "${agenda.tanggal}"`)
      } else {
        agendaSuccess++
      }
    } catch (e) {
      agendaFailed++
      agendaErrors.push(`ID ${agenda.id}: ${e}`)
    }
  }
  
  results.push({
    model: 'Agenda',
    success: agendaSuccess,
    failed: agendaFailed,
    errors: agendaErrors.slice(0, 10),
  })

  return results
}

// ============================================
// V2 API RESPONSE TRANSFORMER
// ============================================

/**
 * Transform V1 response (String dates) to V2 format (ISO DateTime)
 */
export function transformToV2Format<T extends Record<string, any>>(
  data: T,
  dateFields: string[]
): T {
  const result = { ...data }
  
  for (const field of dateFields) {
    if (result[field] && typeof result[field] === 'string') {
      try {
        result[field] = new Date(result[field]).toISOString()
      } catch {
        // Keep original if conversion fails
      }
    }
  }
  
  return result
}

/**
 * Transform V2 request (ISO DateTime) to V1 format (String dates)
 */
export function transformFromV2Format<T extends Record<string, any>>(
  data: T,
  dateFields: string[]
): T {
  const result = { ...data }
  
  for (const field of dateFields) {
    if (result[field]) {
      try {
        const date = new Date(result[field])
        result[field] = date.toISOString().split('T')[0] // YYYY-MM-DD
      } catch {
        // Keep original if conversion fails
      }
    }
  }
  
  return result
}

// ============================================
// EXPORTS
// ============================================

const DateMigration = {
  analyzeDateFormats,
  dryRunMigration,
  transformToV2Format,
  transformFromV2Format,
  SCHEMA_MIGRATION_SQL,
}

export default DateMigration
