/**
 * Pororomo Config API
 * 
 * GET - Ambil konfigurasi Pororomo
 * PUT - Update konfigurasi
 */

import { NextRequest, NextResponse } from 'next/server'
import { getPororomoConfig, savePororomoConfig } from '@/lib/pororomo'

export async function GET() {
    try {
        const config = await getPororomoConfig()

        if (!config) {
            return NextResponse.json({
                success: true,
                data: null,
                message: 'Konfigurasi belum diset'
            })
        }

        // Don't expose password
        return NextResponse.json({
            success: true,
            data: {
                id: config.id,
                apiUrl: config.apiUrl,
                apiKey: config.apiKey ? '***hidden***' : null,
                username: config.username,
                hasPassword: !!config.password,
                isActive: config.isActive,
                lastTestAt: config.lastTestAt,
                testResult: config.testResult
            }
        })
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        return NextResponse.json(
            { success: false, error: errorMessage },
            { status: 500 }
        )
    }
}

export async function PUT(request: NextRequest) {
    try {
        const body = await request.json()

        const { apiUrl, apiKey, username, password, isActive } = body

        if (!apiUrl) {
            return NextResponse.json(
                { success: false, error: 'API URL wajib diisi' },
                { status: 400 }
            )
        }

        const config = await savePororomoConfig({
            apiUrl,
            apiKey,
            username,
            password,
            isActive
        })

        return NextResponse.json({
            success: true,
            data: {
                id: config.id,
                apiUrl: config.apiUrl,
                isActive: config.isActive
            },
            message: 'Konfigurasi berhasil disimpan'
        })
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        return NextResponse.json(
            { success: false, error: errorMessage },
            { status: 500 }
        )
    }
}
