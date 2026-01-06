'use client'

import { useState, useEffect, useCallback } from 'react'

export interface Parameter {
    id: string
    tipe: string
    kode: string
    nama: string
    warna: string | null
    urutan: number
    aktif: boolean
}

interface UseParametersOptions {
    tipe: string
    aktifOnly?: boolean
    autoFetch?: boolean
}

interface UseParametersReturn {
    parameters: Parameter[]
    loading: boolean
    error: string | null
    refetch: () => Promise<void>
}

export function useParameters({
    tipe,
    aktifOnly = true,
    autoFetch = true
}: UseParametersOptions): UseParametersReturn {
    const [parameters, setParameters] = useState<Parameter[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const fetchParameters = useCallback(async () => {
        if (!tipe) return

        setLoading(true)
        setError(null)

        try {
            const params = new URLSearchParams({ tipe })
            if (!aktifOnly) params.append('aktif', 'false')

            const response = await fetch(`/api/master/parameter?${params}`)
            const data = await response.json()

            if (data.success) {
                setParameters(data.data || [])
            } else {
                setError(data.error || 'Failed to fetch parameters')
            }
        } catch (err) {
            setError('Network error fetching parameters')
            console.error('Error fetching parameters:', err)
        } finally {
            setLoading(false)
        }
    }, [tipe, aktifOnly])

    useEffect(() => {
        if (autoFetch) {
            fetchParameters()
        }
    }, [autoFetch, fetchParameters])

    return {
        parameters,
        loading,
        error,
        refetch: fetchParameters
    }
}

// Convenience hooks for specific parameter types
export function usePrioritas() {
    return useParameters({ tipe: 'PRIORITAS' })
}

export function useKategoriTugas() {
    return useParameters({ tipe: 'KATEGORI_TUGAS' })
}

export function useJenisSurat() {
    return useParameters({ tipe: 'JENIS_SURAT' })
}

export function useJenisPertemuan() {
    return useParameters({ tipe: 'JENIS_PERTEMUAN' })
}

export function useJenisNotulensi() {
    return useParameters({ tipe: 'JENIS_NOTULENSI' })
}

export function usePeriodeLaporan() {
    return useParameters({ tipe: 'PERIODE_LAPORAN' })
}

export function useKategoriIsu() {
    return useParameters({ tipe: 'KATEGORI_ISU' })
}

export function useStatusTugas() {
    return useParameters({ tipe: 'STATUS_TUGAS' })
}
