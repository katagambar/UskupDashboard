/**
 * API Hooks with React Query
 * 
 * Migrated from custom useApiData to React Query for better caching,
 * background refetching, and optimistic updates.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { showError, showSuccess } from '@/lib/alerts'

// ============================================
// TYPES
// ============================================

export interface Agenda {
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
  createdAt: string
  createdBy: string
}

export interface Task {
  id: string
  judul: string
  deskripsi: string
  prioritas: string
  status: string
  progress: number
  deadline: string
  kategori: string
  penanggungJawab: string
  createdAt: string
  createdBy: string
  completedAt?: string | null
}

export interface Surat {
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
  isSigned: boolean
  createdAt: string
  createdBy: string
}

export interface Decision {
  id: string
  judul: string
  deskripsi: string
  status: string
  progress: number
  targetDate: string
  kategori: string
  penanggungJawab: string
  createdAt: string
  createdBy: string
}

export interface Imam {
  id: string
  nama: string
  paroki: string
  jabatan: string
  status: string
  tanggalTahbisan: string
  nomorTelepon: string
  email: string
  alamat: string
}

export interface Notulensi {
  id: string
  judul: string
  tanggal: string
  jenis: string
  peserta: string
  status: string
  isi?: string | null
  kesimpulan?: string | null
  createdAt: string
  createdBy: string
}

// ============================================
// GENERIC FETCH FUNCTION
// ============================================

async function fetchApi<T>(endpoint: string): Promise<T[]> {
  const response = await fetch(endpoint, {
    credentials: 'include'
  })
  const result = await response.json()
  
  if (result.success) {
    return result.data
  }
  throw new Error(result.error || 'Failed to fetch data')
}

async function mutateApi<T>(
  endpoint: string, 
  method: 'POST' | 'PATCH' | 'DELETE',
  data?: Partial<T>
): Promise<{ success: boolean; data?: T; error?: string }> {
  const response = await fetch(endpoint, {
    method,
    headers: data ? { 'Content-Type': 'application/json' } : undefined,
    credentials: 'include',
    body: data ? JSON.stringify(data) : undefined,
  })
  const result = await response.json()
  
  if (result.success) {
    return { success: true, data: result.data }
  }
  return { success: false, error: result.error }
}

// ============================================
// QUERY HOOKS
// ============================================

export function useAgenda() {
  const query = useQuery<Agenda[]>({
    queryKey: ['agenda'],
    // Use ?all=true for backward compatibility with paginated API
    queryFn: () => fetchApi<Agenda>('/api/agenda?all=true'),
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
  
  return {
    data: query.data ?? [],
    loading: query.isLoading,
    error: query.error?.message ?? null,
    refetch: query.refetch,
  }
}


export function useTasks() {
  const query = useQuery<Task[]>({
    queryKey: ['tasks'],
    queryFn: () => fetchApi<Task>('/api/tasks?all=true'),
    staleTime: 1000 * 60 * 5,
  })
  
  return {
    data: query.data ?? [],
    loading: query.isLoading,
    error: query.error?.message ?? null,
    refetch: query.refetch,
  }
}

export function useSurat() {
  const query = useQuery<Surat[]>({
    queryKey: ['surat'],
    queryFn: () => fetchApi<Surat>('/api/surat?all=true'),
    staleTime: 1000 * 60 * 5,
  })
  
  return {
    data: query.data ?? [],
    loading: query.isLoading,
    error: query.error?.message ?? null,
    refetch: query.refetch,
  }
}

export function useDecisions() {
  const query = useQuery<Decision[]>({
    queryKey: ['decisions'],
    queryFn: () => fetchApi<Decision>('/api/decisions'),
    staleTime: 1000 * 60 * 5,
  })
  
  return {
    data: query.data ?? [],
    loading: query.isLoading,
    error: query.error?.message ?? null,
    refetch: query.refetch,
  }
}

export function useImam() {
  const query = useQuery<Imam[]>({
    queryKey: ['imam'],
    queryFn: () => fetchApi<Imam>('/api/imam'),
    staleTime: 1000 * 60 * 10, // 10 minutes - less frequently updated
  })
  
  return {
    data: query.data ?? [],
    loading: query.isLoading,
    error: query.error?.message ?? null,
    refetch: query.refetch,
  }
}

export function useNotulensi() {
  const query = useQuery<Notulensi[]>({
    queryKey: ['notulensi'],
    queryFn: () => fetchApi<Notulensi>('/api/notulensi'),
    staleTime: 1000 * 60 * 5,
  })
  
  return {
    data: query.data ?? [],
    loading: query.isLoading,
    error: query.error?.message ?? null,
    refetch: query.refetch,
  }
}

// ============================================
// CRUD HOOK (Generic)
// ============================================

export function useCrud<T>(endpoint: string) {
  const queryClient = useQueryClient()
  
  // Determine query key from endpoint
  const queryKey = endpoint.replace('/api/', '')

  const createMutation = useMutation({
    mutationFn: (itemData: Partial<T>) => mutateApi<T>(endpoint, 'POST', itemData),
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: [queryKey] })
      }
    },
    onError: () => {
      showError('Network error occurred')
    }
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<T> }) => 
      mutateApi<T>(`${endpoint}/${id}`, 'PATCH', updates),
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: [queryKey] })
      }
    },
    onError: () => {
      showError('Network error occurred')
    }
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => mutateApi<T>(`${endpoint}/${id}`, 'DELETE'),
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: [queryKey] })
      }
    },
    onError: () => {
      showError('Network error occurred')
    }
  })

  const create = async (itemData: Partial<T>) => {
    const result = await createMutation.mutateAsync(itemData)
    if (!result.success) {
      showError(result.error || 'Failed to create item')
    }
    return result
  }

  const update = async (id: string, updates: Partial<T>) => {
    const result = await updateMutation.mutateAsync({ id, updates })
    if (!result.success) {
      showError(result.error || 'Failed to update item')
    }
    return result
  }

  const remove = async (id: string) => {
    const result = await deleteMutation.mutateAsync(id)
    if (!result.success) {
      showError(result.error || 'Failed to delete item')
    }
    return result
  }

  return { 
    create, 
    update, 
    remove, 
    loading: createMutation.isPending || updateMutation.isPending || deleteMutation.isPending
  }
}

// ============================================
// LEGACY SUPPORT - useApiData (deprecated)
// Keep for backward compatibility, but prefer React Query hooks above
// ============================================

import { useState, useEffect } from 'react'

/**
 * @deprecated Use specific entity hooks (useAgenda, useTasks, etc.) instead
 */
export function useApiData<T>(endpoint: string, dependencies: any[] = []) {
  const [data, setData] = useState<T[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(endpoint, {
        credentials: 'include'
      })
      const result = await response.json()

      if (result.success) {
        setData(result.data)
      } else {
        setError(result.error || 'Failed to fetch data')
        showError(result.error || 'Failed to fetch data')
      }
    } catch (err) {
      const errorMessage = 'Network error occurred'
      setError(errorMessage)
      showError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies)

  const refetch = () => {
    fetchData()
  }

  return { data, loading, error, refetch }
}
