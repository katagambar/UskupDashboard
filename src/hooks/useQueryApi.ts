'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { showError, showSuccess } from '@/lib/alerts'

// API fetch helper
async function fetchAPI<T>(endpoint: string): Promise<T[]> {
    const response = await fetch(endpoint, {
        credentials: 'include'
    })
    const result = await response.json()

    if (!result.success) {
        throw new Error(result.error || 'Failed to fetch data')
    }

    return result.data
}

// Generic mutation helper
async function mutateAPI<T>(
    endpoint: string,
    method: 'POST' | 'PATCH' | 'DELETE',
    data?: Partial<T>
): Promise<T> {
    const response = await fetch(endpoint, {
        method,
        headers: method !== 'DELETE' ? { 'Content-Type': 'application/json' } : undefined,
        credentials: 'include',
        body: method !== 'DELETE' ? JSON.stringify(data) : undefined,
    })
    const result = await response.json()

    if (!result.success) {
        throw new Error(result.error || `Failed to ${method.toLowerCase()} data`)
    }

    return result.data
}

// Query Keys
export const queryKeys = {
    agenda: ['agenda'] as const,
    tasks: ['tasks'] as const,
    notulensi: ['notulensi'] as const,
    imam: ['imam'] as const,
    surat: ['surat'] as const,
    decisions: ['decisions'] as const,
    dashboard: ['dashboard'] as const,
}

// React Query Hooks
export function useAgendaQuery() {
    return useQuery({
        queryKey: queryKeys.agenda,
        queryFn: () => fetchAPI<any>('/api/agenda'),
    })
}

export function useTasksQuery() {
    return useQuery({
        queryKey: queryKeys.tasks,
        queryFn: () => fetchAPI<any>('/api/tasks'),
    })
}

export function useNotulensiQuery() {
    return useQuery({
        queryKey: queryKeys.notulensi,
        queryFn: () => fetchAPI<any>('/api/notulensi'),
    })
}

export function useImamQuery() {
    return useQuery({
        queryKey: queryKeys.imam,
        queryFn: () => fetchAPI<any>('/api/imam'),
    })
}

export function useSuratQuery() {
    return useQuery({
        queryKey: queryKeys.surat,
        queryFn: () => fetchAPI<any>('/api/surat'),
    })
}

export function useDecisionsQuery() {
    return useQuery({
        queryKey: queryKeys.decisions,
        queryFn: () => fetchAPI<any>('/api/decisions'),
    })
}

// CRUD Mutations Hook
export function useCrudMutations<T>(endpoint: string, queryKey: readonly string[]) {
    const queryClient = useQueryClient()

    const createMutation = useMutation({
        mutationFn: (data: Partial<T>) => mutateAPI<T>(endpoint, 'POST', data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey })
            showSuccess('Data berhasil ditambahkan')
        },
        onError: (error: Error) => {
            showError(error.message || 'Gagal menambahkan data')
        }
    })

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<T> }) =>
            mutateAPI<T>(`${endpoint}/${id}`, 'PATCH', data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey })
            showSuccess('Data berhasil diperbarui')
        },
        onError: (error: Error) => {
            showError(error.message || 'Gagal memperbarui data')
        }
    })

    const deleteMutation = useMutation({
        mutationFn: (id: string) => mutateAPI<T>(`${endpoint}/${id}`, 'DELETE'),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey })
            showSuccess('Data berhasil dihapus')
        },
        onError: (error: Error) => {
            showError(error.message || 'Gagal menghapus data')
        }
    })

    return {
        create: createMutation,
        update: updateMutation,
        remove: deleteMutation,
        isLoading: createMutation.isPending || updateMutation.isPending || deleteMutation.isPending
    }
}

// Convenience hooks with CRUD
export function useAgendaCrud() {
    return useCrudMutations<any>('/api/agenda', queryKeys.agenda)
}

export function useTasksCrud() {
    return useCrudMutations<any>('/api/tasks', queryKeys.tasks)
}

export function useNotulensiCrud() {
    return useCrudMutations<any>('/api/notulensi', queryKeys.notulensi)
}

export function useImamCrud() {
    return useCrudMutations<any>('/api/imam', queryKeys.imam)
}

export function useSuratCrud() {
    return useCrudMutations<any>('/api/surat', queryKeys.surat)
}

export function useDecisionsCrud() {
    return useCrudMutations<any>('/api/decisions', queryKeys.decisions)
}
