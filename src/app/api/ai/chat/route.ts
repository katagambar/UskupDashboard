/**
 * Magisterium AI Chat API
 * 
 * Proxy endpoint for Magisterium.com API
 * Keeps API key secure on server-side
 */

import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUserFromRequest } from '@/lib/custom-auth'
import { sendMagisteriumChat, createSystemPrompt, MagisteriumMessage } from '@/lib/magisterium'

// API key from environment
const MAGISTERIUM_API_KEY = process.env.MAGISTERIUM_API_KEY

export async function POST(request: NextRequest) {
    try {
        // Verify user authentication
        const user = await getCurrentUserFromRequest(request)
        if (!user) {
            return NextResponse.json(
                { success: false, error: 'Tidak terautentikasi' },
                { status: 401 }
            )
        }

        // Check API key configured
        if (!MAGISTERIUM_API_KEY) {
            return NextResponse.json(
                { success: false, error: 'Magisterium API key tidak dikonfigurasi' },
                { status: 500 }
            )
        }

        const body = await request.json()
        const {
            messages,
            useCase = 'general',
            temperature = 0.7
        } = body as {
            messages: MagisteriumMessage[]
            useCase?: 'general' | 'notulensi' | 'surat' | 'keputusan'
            temperature?: number
        }

        if (!messages || messages.length === 0) {
            return NextResponse.json(
                { success: false, error: 'Messages diperlukan' },
                { status: 400 }
            )
        }

        // Add system prompt based on use case
        const systemMessage: MagisteriumMessage = {
            role: 'system',
            content: createSystemPrompt(useCase)
        }

        const fullMessages = [systemMessage, ...messages]

        // Call Magisterium API
        const response = await sendMagisteriumChat(
            fullMessages,
            MAGISTERIUM_API_KEY,
            { temperature, stream: false, returnRelatedQuestions: true }
        )

        // Transform citations to simpler format for frontend
        const formattedCitations = (response.citations || []).map(c => ({
            title: c.document_title,
            author: c.document_author || 'Magisterium',
            reference: c.document_reference || '',
            excerpt: c.cited_text
        }))

        return NextResponse.json({
            success: true,
            data: {
                message: response.choices[0]?.message?.content || '',
                citations: formattedCitations,
                relatedQuestions: response.related_questions || [],
                usage: response.usage
            }
        })

    } catch (error) {
        console.error('Magisterium AI error:', error)
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Gagal menghubungi AI'
            },
            { status: 500 }
        )
    }
}
