/**
 * Date Utilities Library
 * 
 * Handles date conversion between String and DateTime formats.
 * Provides backward compatibility during migration period.
 * 
 * Current: Dates stored as String "YYYY-MM-DD"
 * Future: Will migrate to DateTime
 */

// ============================================
// DATE PARSING
// ============================================

/**
 * Parse date string to Date object
 * Supports: "YYYY-MM-DD", "DD/MM/YYYY", ISO strings
 */
export function parseDate(dateStr: string | Date | null | undefined): Date | null {
  if (!dateStr) return null
  
  if (dateStr instanceof Date) {
    return isNaN(dateStr.getTime()) ? null : dateStr
  }

  // Already ISO format
  if (dateStr.includes('T')) {
    const date = new Date(dateStr)
    return isNaN(date.getTime()) ? null : date
  }

  // YYYY-MM-DD format
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    const [year, month, day] = dateStr.split('-').map(Number)
    return new Date(year, month - 1, day)
  }

  // DD/MM/YYYY format
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) {
    const [day, month, year] = dateStr.split('/').map(Number)
    return new Date(year, month - 1, day)
  }

  // Try native parsing
  const date = new Date(dateStr)
  return isNaN(date.getTime()) ? null : date
}

/**
 * Parse date string safely, returns undefined if invalid
 */
export function parseDateSafe(dateStr: string | null | undefined): Date | undefined {
  const date = parseDate(dateStr)
  return date || undefined
}

// ============================================
// DATE FORMATTING
// ============================================

/**
 * Format date to string "YYYY-MM-DD"
 */
export function formatDateString(date: Date | string | null | undefined): string {
  const parsed = parseDate(date)
  if (!parsed) return ''

  const year = parsed.getFullYear()
  const month = String(parsed.getMonth() + 1).padStart(2, '0')
  const day = String(parsed.getDate()).padStart(2, '0')
  
  return `${year}-${month}-${day}`
}

/**
 * Format date to ISO string for API responses
 */
export function formatDateISO(date: Date | string | null | undefined): string {
  const parsed = parseDate(date)
  return parsed?.toISOString() || ''
}

/**
 * Format date for display in Indonesian
 */
export function formatDateIndonesian(
  date: Date | string | null | undefined,
  options: { includeDay?: boolean; includeYear?: boolean } = {}
): string {
  const parsed = parseDate(date)
  if (!parsed) return '-'

  const { includeDay = true, includeYear = true } = options

  const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']
  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ]

  const dayName = days[parsed.getDay()]
  const day = parsed.getDate()
  const month = months[parsed.getMonth()]
  const year = parsed.getFullYear()

  if (includeDay && includeYear) {
    return `${dayName}, ${day} ${month} ${year}`
  } else if (includeYear) {
    return `${day} ${month} ${year}`
  } else {
    return `${day} ${month}`
  }
}

/**
 * Format date for short display "9 Jan 2026"
 */
export function formatDateShort(date: Date | string | null | undefined): string {
  const parsed = parseDate(date)
  if (!parsed) return '-'

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']
  
  return `${parsed.getDate()} ${months[parsed.getMonth()]} ${parsed.getFullYear()}`
}

// ============================================
// DATE COMPARISON
// ============================================

/**
 * Check if date is today
 */
export function isToday(date: Date | string | null | undefined): boolean {
  const parsed = parseDate(date)
  if (!parsed) return false

  const today = new Date()
  return (
    parsed.getDate() === today.getDate() &&
    parsed.getMonth() === today.getMonth() &&
    parsed.getFullYear() === today.getFullYear()
  )
}

/**
 * Check if date is in the past
 */
export function isPast(date: Date | string | null | undefined): boolean {
  const parsed = parseDate(date)
  if (!parsed) return false

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  parsed.setHours(0, 0, 0, 0)
  
  return parsed < today
}

/**
 * Check if date is in the future
 */
export function isFuture(date: Date | string | null | undefined): boolean {
  const parsed = parseDate(date)
  if (!parsed) return false

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  parsed.setHours(0, 0, 0, 0)
  
  return parsed > today
}

/**
 * Get days difference between two dates
 */
export function daysDifference(
  date1: Date | string | null | undefined,
  date2: Date | string | null | undefined
): number {
  const parsed1 = parseDate(date1)
  const parsed2 = parseDate(date2)
  
  if (!parsed1 || !parsed2) return 0

  const diffTime = parsed2.getTime() - parsed1.getTime()
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

/**
 * Get days until date from today
 */
export function daysUntil(date: Date | string | null | undefined): number {
  return daysDifference(new Date(), date)
}

// ============================================
// DATE RANGES
// ============================================

/**
 * Check if date is within range
 */
export function isWithinRange(
  date: Date | string | null | undefined,
  start: Date | string | null | undefined,
  end: Date | string | null | undefined
): boolean {
  const parsedDate = parseDate(date)
  const parsedStart = parseDate(start)
  const parsedEnd = parseDate(end)
  
  if (!parsedDate || !parsedStart || !parsedEnd) return false

  return parsedDate >= parsedStart && parsedDate <= parsedEnd
}

/**
 * Get dates for current week
 */
export function getCurrentWeekDates(): { start: Date; end: Date } {
  const now = new Date()
  const dayOfWeek = now.getDay()
  
  const start = new Date(now)
  start.setDate(now.getDate() - dayOfWeek)
  start.setHours(0, 0, 0, 0)
  
  const end = new Date(start)
  end.setDate(start.getDate() + 6)
  end.setHours(23, 59, 59, 999)
  
  return { start, end }
}

/**
 * Get dates for current month
 */
export function getCurrentMonthDates(): { start: Date; end: Date } {
  const now = new Date()
  
  const start = new Date(now.getFullYear(), now.getMonth(), 1)
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)
  
  return { start, end }
}

// ============================================
// API RESPONSE TRANSFORMERS
// ============================================

/**
 * Transform date fields in API response
 * For v2.0+ API responses with ISO dates
 */
export function transformDatesInResponse<T extends Record<string, any>>(
  data: T,
  dateFields: string[]
): T {
  const result: Record<string, any> = { ...data }
  
  for (const field of dateFields) {
    if (result[field]) {
      result[field] = formatDateISO(result[field])
    }
  }
  
  return result as T
}

/**
 * Transform date fields for v1 backward compatibility
 * Returns dates as "YYYY-MM-DD" strings
 */
export function transformDatesForV1<T extends Record<string, any>>(
  data: T,
  dateFields: string[]
): T {
  const result: Record<string, any> = { ...data }
  
  for (const field of dateFields) {
    if (result[field]) {
      result[field] = formatDateString(result[field])
    }
  }
  
  return result as T
}

// ============================================
// VALIDATION
// ============================================

/**
 * Validate date string format
 */
export function isValidDateString(dateStr: string): boolean {
  if (!dateStr) return false
  return parseDate(dateStr) !== null
}

/**
 * Validate date is not in past
 */
export function isNotPastDate(date: Date | string | null | undefined): boolean {
  return !isPast(date)
}

// ============================================
// EXPORTS
// ============================================

const DateUtils = {
  // Parsing
  parseDate,
  parseDateSafe,
  
  // Formatting
  formatDateString,
  formatDateISO,
  formatDateIndonesian,
  formatDateShort,
  
  // Comparison
  isToday,
  isPast,
  isFuture,
  daysDifference,
  daysUntil,
  
  // Ranges
  isWithinRange,
  getCurrentWeekDates,
  getCurrentMonthDates,
  
  // Transformers
  transformDatesInResponse,
  transformDatesForV1,
  
  // Validation
  isValidDateString,
  isNotPastDate,
}

export default DateUtils
