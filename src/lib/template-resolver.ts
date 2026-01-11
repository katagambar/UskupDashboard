/**
 * Template Resolver Library
 * 
 * Resolves template placeholders with data from BishopProfile and other sources.
 * Used for generating surat/documents with dynamic data.
 */

// ============================================
// TYPES
// ============================================

export interface TemplateVariables {
  // Bishop info (from BishopProfile)
  nama_uskup?: string
  jabatan_uskup?: string
  keuskupan?: string
  
  // Surat info
  nomor_surat?: string
  tanggal?: string
  perihal?: string
  tujuan?: string
  isi_surat?: string
  
  // Event info (for undangan)
  acara?: string
  tanggal_acara?: string
  waktu?: string
  tempat?: string
  
  // Rekomendasi info
  alasan_rekomendasi?: string
  tujuan_rekomendasi?: string
  
  // Persetujuan info
  kegiatan?: string
  
  // Custom variables
  [key: string]: string | undefined
}

// ============================================
// TEMPLATE RESOLVER
// ============================================

/**
 * Resolve template placeholders with actual values
 * Placeholders format: {variable_name}
 */
export function resolveTemplate(
  template: string,
  variables: TemplateVariables
): string {
  let result = template

  // Replace all placeholders
  for (const [key, value] of Object.entries(variables)) {
    if (value !== undefined) {
      const placeholder = new RegExp(`\\{${key}\\}`, 'g')
      result = result.replace(placeholder, value)
    }
  }

  return result
}

/**
 * Get default template variables with bishop info from API
 */
export async function getDefaultTemplateVariables(): Promise<TemplateVariables> {
  try {
    const response = await fetch('/api/profile', { credentials: 'include' })
    const result = await response.json()
    
    if (result.success && result.data) {
      return {
        nama_uskup: result.data.namaLengkap || '',
        jabatan_uskup: result.data.gelar || 'Uskup',
        keuskupan: result.data.namaKeuskupan || 'Keuskupan Surabaya',
      }
    }
  } catch (error) {
    console.error('Failed to fetch bishop profile for template:', error)
  }

  // Fallback - empty values (user should fill in profile first)
  return {
    nama_uskup: '',
    jabatan_uskup: '',
    keuskupan: 'Keuskupan Surabaya',
  }
}

/**
 * Resolve template with bishop info auto-fetched
 */
export async function resolveTemplateWithProfile(
  template: string,
  customVariables: Partial<TemplateVariables> = {}
): Promise<string> {
  const defaultVars = await getDefaultTemplateVariables()
  
  return resolveTemplate(template, {
    ...defaultVars,
    ...customVariables,
  })
}

/**
 * Format date for template
 */
export function formatDateForTemplate(dateStr: string): string {
  if (!dateStr) return ''
  
  const date = new Date(dateStr)
  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

/**
 * Get list of available placeholders in a template
 */
export function getTemplatePlaceholders(template: string): string[] {
  const matches = template.match(/\{([^}]+)\}/g)
  if (!matches) return []
  
  return [...new Set(matches.map(m => m.slice(1, -1)))]
}

/**
 * Check if template has unresolved placeholders
 */
export function hasUnresolvedPlaceholders(resolvedTemplate: string): boolean {
  return /\{[^}]+\}/.test(resolvedTemplate)
}

/**
 * Get unresolved placeholders
 */
export function getUnresolvedPlaceholders(resolvedTemplate: string): string[] {
  return getTemplatePlaceholders(resolvedTemplate)
}

// ============================================
// EXPORTS
// ============================================

const TemplateResolver = {
  resolveTemplate,
  getDefaultTemplateVariables,
  resolveTemplateWithProfile,
  formatDateForTemplate,
  getTemplatePlaceholders,
  hasUnresolvedPlaceholders,
  getUnresolvedPlaceholders,
}

export default TemplateResolver
