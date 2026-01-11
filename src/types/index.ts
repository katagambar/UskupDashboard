/**
 * Shared TypeScript Types
 * 
 * Centralized type definitions used across the application.
 * This helps eliminate `any` types and improves type safety.
 */

import { Prisma } from '@prisma/client'

// ============================================
// ENTITY TYPES (matching Prisma models)
// ============================================

export interface AgendaItem {
  id: string
  judul: string
  tanggal: string
  tanggalAkhir?: string | null
  waktu: string
  waktuAkhir?: string | null
  lokasi: string
  jenis: string
  peserta: string
  deskripsi?: string | null
  status: string
  googleCalendarId?: string | null
  createdAt: Date | string
  updatedAt: Date | string
  createdBy: string
  creator?: { name: string | null; email: string }
}

export interface TaskItem {
  id: string
  judul: string
  deskripsi: string
  prioritas: string
  status: string
  progress: number
  deadline: string
  kategori: string
  penanggungJawab: string
  createdAt: Date | string
  updatedAt: Date | string
  completedAt?: Date | string | null
  createdBy: string
  creator?: { name: string | null; email: string }
}

export interface NotulensiItem {
  id: string
  judul: string
  tanggal: string
  jenis: string
  peserta: string
  status: string
  isi?: string | null
  kesimpulan?: string | null
  lampiran?: string | null
  createdAt: Date | string
  updatedAt: Date | string
  approvedAt?: Date | string | null
  approvedBy?: string | null
  createdBy: string
  agendaId?: string | null
  creator?: { name: string | null; email: string }
}

export interface SuratItem {
  id: string
  nomor: string
  jenis: string
  judul: string
  pengirim: string
  penerima: string
  tanggal: string
  isi?: string | null
  lampiran?: string | null
  status: string
  prioritas: string
  createdAt: Date | string
  updatedAt: Date | string
  createdBy: string
  creator?: { name: string | null; email: string }
  signature?: { qrCode: string | null } | null
}

export interface DecisionItem {
  id: string
  judul: string
  deskripsi: string
  status: string
  progress: number
  targetDate: string
  kategori: string
  penanggungJawab: string
  createdAt: Date | string
  updatedAt: Date | string
  completedAt?: Date | string | null
  createdBy: string
  creator?: { name: string | null; email: string }
}

export interface ImamItem {
  id: string
  nama: string
  paroki: string
  jabatan: string
  status: string
  tanggalTahbisan: string
  nomorTelepon: string
  email: string
  alamat: string
  createdAt: Date | string
  updatedAt: Date | string
}

export interface UserItem {
  id: string
  email: string
  name: string | null
  role: string
  createdAt: Date | string
  updatedAt: Date | string
}

// ============================================
// API RESPONSE TYPES
// ============================================

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  success: boolean
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

// ============================================
// DASHBOARD TYPES
// ============================================

export interface DashboardData {
  agenda: AgendaItem[]
  tasks: TaskItem[]
  notulensi: NotulensiItem[]
  imam: ImamItem[]
  decisions: DecisionItem[]
}

export interface DashboardStats {
  agendaToday: number
  tasksActive: number
  highPriorityTasks: number
  approvedNotulensi: number
  activeImam: number
}

// ============================================
// FILTER/WHERE TYPES
// ============================================

export type AgendaWhereInput = Prisma.AgendaWhereInput
export type TaskWhereInput = Prisma.TaskWhereInput
export type SuratWhereInput = Prisma.SuratWhereInput
export type NotulensiWhereInput = Prisma.NotulensiWhereInput
export type DecisionWhereInput = Prisma.DecisionWhereInput

// Simple filter object for API routes (without Prisma dependency)
export interface SimpleFilter {
  status?: string
  jenis?: string
  kategori?: string
  prioritas?: string
  tanggal?: string
  createdBy?: string
  assignedTo?: string
  [key: string]: string | undefined
}

// ============================================
// SOCKET/REALTIME TYPES
// ============================================

export interface SocketMessage {
  type: string
  payload: Record<string, unknown>
  userId?: string
  timestamp: Date | string
}

export interface Notification {
  id: string
  judul: string
  pesan: string
  jenis: string
  status: string
  createdAt: Date | string
  readAt?: Date | string | null
  userId: string
}

// ============================================
// ERROR TYPES
// ============================================

export interface AppError {
  code: string
  message: string
  statusCode: number
  details?: Record<string, unknown>
  requestId?: string
}

export interface ValidationError {
  field: string
  message: string
  value?: unknown
}

// ============================================
// LITURGICAL CALENDAR TYPES
// ============================================

export interface LiturgicalEvent {
  date: string
  name: string
  color?: string
  rank?: string
  season?: string
}

// ============================================
// GOOGLE CALENDAR TYPES
// ============================================

export interface GoogleCalendarEvent {
  id?: string
  summary: string
  description?: string
  location?: string
  start: {
    dateTime: string
    timeZone: string
  }
  end: {
    dateTime: string
    timeZone: string
  }
}
