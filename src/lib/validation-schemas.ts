/**
 * Centralized Zod Validation Schemas
 * 
 * This file contains all input validation schemas for API endpoints.
 * Using Zod for runtime type checking and validation.
 */

import { z } from 'zod'

// ============================================
// COMMON SCHEMAS
// ============================================

export const dateStringSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format tanggal harus YYYY-MM-DD')
export const timeStringSchema = z.string().regex(/^\d{2}:\d{2}$/, 'Format waktu harus HH:MM')
export const emailSchema = z.string().email('Email tidak valid')
export const idSchema = z.string().cuid('ID tidak valid')

// ============================================
// AGENDA SCHEMAS
// ============================================

export const createAgendaSchema = z.object({
  judul: z.string().min(1, 'Judul wajib diisi').max(255, 'Judul maksimal 255 karakter'),
  tanggal: dateStringSchema,
  tanggalAkhir: z.string().optional().nullable(),
  waktu: timeStringSchema,
  waktuAkhir: z.string().optional().nullable(),
  lokasi: z.string().min(1, 'Lokasi wajib diisi').max(255),
  jenis: z.string().min(1, 'Jenis pertemuan wajib dipilih'),
  peserta: z.string().min(1, 'Peserta wajib diisi'),
  deskripsi: z.string().optional().nullable(),
})

export const updateAgendaSchema = createAgendaSchema.partial().extend({
  status: z.string().optional(),
})

export type CreateAgendaInput = z.infer<typeof createAgendaSchema>
export type UpdateAgendaInput = z.infer<typeof updateAgendaSchema>

// ============================================
// TASK SCHEMAS
// ============================================

export const createTaskSchema = z.object({
  judul: z.string().min(1, 'Judul wajib diisi').max(255),
  deskripsi: z.string().min(1, 'Deskripsi wajib diisi'),
  prioritas: z.string().min(1, 'Prioritas wajib dipilih'),
  deadline: dateStringSchema,
  kategori: z.string().min(1, 'Kategori wajib dipilih'),
  penanggungJawab: z.string().min(1, 'Penanggung jawab wajib diisi'),
})

export const updateTaskSchema = createTaskSchema.partial().extend({
  status: z.string().optional(),
  progress: z.number().min(0).max(100).optional(),
})

export type CreateTaskInput = z.infer<typeof createTaskSchema>
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>

// ============================================
// SURAT SCHEMAS
// ============================================

export const createSuratSchema = z.object({
  nomor: z.string().min(1, 'Nomor surat wajib diisi'),
  jenis: z.string().min(1, 'Jenis surat wajib dipilih'),
  judul: z.string().min(1, 'Judul wajib diisi').max(255),
  pengirim: z.string().min(1, 'Pengirim wajib diisi'),
  penerima: z.string().min(1, 'Penerima wajib diisi'),
  tanggal: dateStringSchema,
  isi: z.string().optional().nullable(),
  lampiran: z.string().optional().nullable(),
  prioritas: z.string().optional().default('Normal'),
})

export const updateSuratSchema = createSuratSchema.partial().extend({
  status: z.string().optional(),
})

export type CreateSuratInput = z.infer<typeof createSuratSchema>
export type UpdateSuratInput = z.infer<typeof updateSuratSchema>

// ============================================
// ISSUE SCHEMAS
// ============================================

export const createIssueSchema = z.object({
  title: z.string().min(1, 'Judul wajib diisi').max(255),
  description: z.string().min(1, 'Deskripsi wajib diisi'),
  category: z.string().optional().nullable(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
  relatedDocType: z.string().optional().nullable(),
  relatedDocId: z.string().optional().nullable(),
  attachments: z.string().optional().nullable(),
  assignedTo: z.string().optional().nullable(),
})

export const updateIssueSchema = createIssueSchema.partial().extend({
  status: z.enum(['DRAFT', 'OPEN', 'IN_REVIEW', 'DECIDED', 'CLOSED']).optional(),
  decision: z.string().optional().nullable(),
  decisionNotes: z.string().optional().nullable(),
})

export type CreateIssueInput = z.infer<typeof createIssueSchema>
export type UpdateIssueInput = z.infer<typeof updateIssueSchema>

// ============================================
// REPORT SCHEMAS
// ============================================

export const createReportSchema = z.object({
  type: z.enum(['MONTHLY', 'QUARTERLY', 'ANNUAL', 'EVENT']),
  title: z.string().min(1, 'Judul wajib diisi').max(255),
  period: z.string().min(1, 'Periode wajib diisi'),
  content: z.string().min(1, 'Konten wajib diisi'),
  highlights: z.string().optional().nullable(),
  challenges: z.string().optional().nullable(),
  requests: z.string().optional().nullable(),
  statistics: z.string().optional().nullable(),
  attachments: z.string().optional().nullable(),
  unitType: z.string().min(1, 'Tipe unit wajib dipilih'),
  unitId: z.string().optional().nullable(),
  unitName: z.string().min(1, 'Nama unit wajib diisi'),
})

export const updateReportSchema = createReportSchema.partial().extend({
  status: z.enum(['DRAFT', 'SUBMITTED', 'REVIEWED', 'APPROVED', 'NEEDS_REVISION']).optional(),
  reviewNotes: z.string().optional().nullable(),
})

export type CreateReportInput = z.infer<typeof createReportSchema>
export type UpdateReportInput = z.infer<typeof updateReportSchema>

// ============================================
// USER SCHEMAS
// ============================================

export const createUserSchema = z.object({
  email: emailSchema,
  name: z.string().min(1, 'Nama wajib diisi').max(100),
  role: z.string().default('STAFF'),
  jabatan: z.string().optional().nullable(),
  department: z.string().optional().nullable(),
  password: z.string().min(8, 'Password minimal 8 karakter').optional(),
})

export const updateUserSchema = createUserSchema.partial()

export type CreateUserInput = z.infer<typeof createUserSchema>
export type UpdateUserInput = z.infer<typeof updateUserSchema>

// ============================================
// VALIDATION HELPER
// ============================================

/**
 * Validates input data against a schema
 * @returns { success: true, data } or { success: false, error }
 */
export function validateInput<T>(schema: z.ZodSchema<T>, data: unknown): 
  { success: true; data: T } | { success: false; error: z.ZodError } {
  const result = schema.safeParse(data)
  if (result.success) {
    return { success: true, data: result.data }
  }
  return { success: false, error: result.error }
}

/**
 * Formats Zod errors into a user-friendly message
 */
export function formatZodErrors(error: z.ZodError): string {
  if (!error || !error.issues) return 'Validation error'
  return error.issues.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')
}
