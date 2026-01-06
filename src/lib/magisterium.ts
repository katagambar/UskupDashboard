/**
 * Magisterium AI Service
 * 
 * Client for Magisterium.com Chat API - Catholic theological AI
 * OpenAI-compatible API format
 */

const MAGISTERIUM_API_URL = 'https://www.magisterium.com/api/v1/chat/completions'
const MAGISTERIUM_MODEL = 'magisterium-1'

export interface MagisteriumMessage {
    role: 'user' | 'assistant' | 'system'
    content: string
}

// Citation format from Magisterium API
export interface MagisteriumCitation {
    cited_text: string
    document_title: string
    document_index: number
    document_author: string | null
    document_reference: string | null
}

export interface MagisteriumResponse {
    id: string
    object: string
    created: number
    model: string
    choices: {
        index: number
        message: {
            role: string
            content: string
        }
        finish_reason: string
    }[]
    citations?: MagisteriumCitation[]
    related_questions?: string[]
    usage?: {
        prompt_tokens: number
        completion_tokens: number
        total_tokens: number
    }
}

export interface ChatOptions {
    stream?: boolean
    temperature?: number
    maxTokens?: number
    returnRelatedQuestions?: boolean
}

/**
 * Send a chat message to Magisterium AI
 */
export async function sendMagisteriumChat(
    messages: MagisteriumMessage[],
    apiKey: string,
    options: ChatOptions = {}
): Promise<MagisteriumResponse> {
    const {
        stream = false,
        temperature = 0.7,
        maxTokens = 2048,
        returnRelatedQuestions = true
    } = options

    const response = await fetch(MAGISTERIUM_API_URL, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            model: MAGISTERIUM_MODEL,
            messages,
            stream,
            temperature,
            max_tokens: maxTokens,
            return_related_questions: returnRelatedQuestions,
        }),
    })

    if (!response.ok) {
        const error = await response.text()
        throw new Error(`Magisterium API error: ${response.status} - ${error}`)
    }

    return response.json()
}

/**
 * Create a system prompt for specific use cases
 */
export function createSystemPrompt(useCase: 'general' | 'notulensi' | 'surat' | 'keputusan'): string {
    const prompts: Record<string, string> = {
        general: `Anda adalah asisten AI teologis Katolik yang membantu Uskup Surabaya. 
Berikan jawaban berdasarkan ajaran Gereja Katolik, Kitab Suci, dan dokumen-dokumen Magisterium. 
Selalu sertakan sumber atau referensi jika memungkinkan. 
Gunakan bahasa Indonesia yang formal dan sopan.`,

        notulensi: `Anda membantu merangkum notulensi rapat dengan perspektif pastoral Katolik.
Fokus pada:
- Poin-poin keputusan penting
- Implikasi pastoral
- Referensi ajaran Gereja yang relevan
Gunakan bahasa Indonesia formal.`,

        surat: `Anda membantu menyusun draft surat pastoral untuk Uskup.
Gunakan:
- Bahasa formal dan pastoral
- Sapaan yang sesuai tradisi Gereja
- Referensi Kitab Suci dan Magisterium jika relevan
- Format surat resmi keuskupan`,

        keputusan: `Anda membantu menelaah isu untuk pengambilan keputusan Uskup.
Pertimbangkan:
- Aspek teologis dan doktrinal
- Aspek pastoral dan kemanusiaan
- Hukum Kanonik yang relevan
- Implikasi bagi umat
Berikan perspektif yang seimbang.`
    }

    return prompts[useCase] || prompts.general
}

/**
 * Format citations for display
 */
export function formatCitations(citations?: MagisteriumCitation[]): string {
    if (!citations || citations.length === 0) return ''

    return citations
        .map((c, i) => {
            const author = c.document_author || 'Unknown Author'
            const ref = c.document_reference ? `, ${c.document_reference}` : ''
            return `[${i + 1}] ${c.document_title}${ref} — ${author}`
        })
        .join('\n')
}

