export interface LiturgicalEvent {
    event_key: string
    date: string // YYYY-MM-DD
    name: string
    color: string[] // e.g., ["white"], ["violet"]
    grade: number // 0-7 (0=highest?) need to check docs, usually higher number = lower rank or vice versa. 
    // API v5 format might vary, but loosely:
    // grade_display: string (e.g., "Solemnity")
    // common: string[]
}

export interface LiturgicalCalendarResponse {
    litcal: LiturgicalEvent[]
}

const BASE_URL = 'https://litcal.johnromanodorazio.com/api/v5/calendar'

export async function getLiturgicalCalendar(year: number): Promise<LiturgicalEvent[]> {
    try {
        console.log(`Fetching liturgical calendar for year ${year}...`)
        
        // Add timeout to prevent hanging requests
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout
        
        const response = await fetch(`${BASE_URL}/${year}`, {
            signal: controller.signal
        })
        clearTimeout(timeoutId)
        
        if (!response.ok) {
            console.warn(`Liturgical calendar API returned ${response.status}`)
            return []
        }
        const data = await response.json()

        // API might return { litcal: { ... }, messages: [ ... ] } or just { ... }
        const eventsMap = data.litcal || data

        // Filter out non-event properties (like metadata/messages if mixed in)
        // Valid events should have at least a date and name
        // CRITICAL: Convert ISO 8601 date (e.g., "2025-11-29T00:00:00+00:00") to YYYY-MM-DD
        const events = Object.values(eventsMap)
            .filter((e: any) => e && e.date && e.name)
            .map((e: any) => {
                // Parse ISO date and convert to YYYY-MM-DD string
                const dateObj = new Date(e.date)
                const dateStr = dateObj.toISOString().split('T')[0]
                return { ...e, date: dateStr } as LiturgicalEvent
            })
        console.log(`Fetched ${events.length} liturgical events for ${year}`)
        return events
    } catch (error: any) {
        // Silently handle abort/timeout errors
        if (error?.name === 'AbortError') {
            console.log('Liturgical calendar request timed out')
        } else {
            console.warn('Liturgical calendar unavailable:', error?.message || 'Unknown error')
        }
        return []
    }
}


export function getLiturgicalColor(colorArray: string[]): string {
    if (!colorArray || colorArray.length === 0) return 'gray'
    const color = colorArray[0].toLowerCase()
    switch (color) {
        case 'white': return 'bg-yellow-100 text-yellow-700 border-yellow-200' // or white/gold
        case 'red': return 'bg-red-100 text-red-700 border-red-200'
        case 'green': return 'bg-green-100 text-green-700 border-green-200'
        case 'violet': return 'bg-purple-100 text-purple-700 border-purple-200'
        case 'rose': return 'bg-pink-100 text-pink-700 border-pink-200'
        case 'black': return 'bg-gray-800 text-gray-100 border-gray-700'
        default: return 'bg-gray-100 text-gray-700 border-gray-200'
    }
}

export function getLiturgicalColorHex(colorArray: string[]): string {
    if (!colorArray || colorArray.length === 0) return '#9ca3af' // gray-400
    const color = colorArray[0].toLowerCase()
    switch (color) {
        case 'white': return '#fbbf24' // amber-400 (gold-ish)
        case 'red': return '#ef4444' // red-500
        case 'green': return '#10b981' // emerald-500
        case 'violet': return '#8b5cf6' // violet-500
        case 'rose': return '#f472b6' // pink-400
        case 'black': return '#374151' // gray-700
        default: return '#9ca3af'
    }
}

// Get background class for liturgical dot
export function getLiturgicalDotColor(colorArray: string[]): string {
    if (!colorArray || colorArray.length === 0) return 'bg-gray-400'
    const color = colorArray[0].toLowerCase()
    switch (color) {
        case 'white': return 'bg-white border border-gray-300' // white with border for visibility
        case 'red': return 'bg-red-500'
        case 'green': return 'bg-green-500'
        case 'violet': return 'bg-purple-500'
        case 'rose': return 'bg-pink-400'
        case 'black': return 'bg-gray-800'
        default: return 'bg-gray-400'
    }
}
