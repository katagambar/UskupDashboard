import { NextRequest, NextResponse } from 'next/server'

export interface LiturgicalEvent {
    event_key: string
    date: string // YYYY-MM-DD
    name: string
    color: string[]
    grade: number
}

const BASE_URL = 'https://litcal.johnromanodorazio.com:443/api/v5/calendar'
const DEFAULT_PARAMS = 'locale=en&epiphany=SUNDAY_JAN2_JAN8&ascension=THURSDAY&corpus_christi=THURSDAY&eternal_high_priest=true'


// GET /api/liturgical-calendar?year=2026
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url)
    const yearParam = searchParams.get('year')
    const year = yearParam ? parseInt(yearParam) : new Date().getFullYear()
    
    // Construct full URL with year and default params
    const apiUrl = `${BASE_URL}/${year}?${DEFAULT_PARAMS}`


    try {
        console.log(`[API] Fetching liturgical calendar for year ${year} from ${apiUrl}...`)
        
        // Add timeout to prevent hanging requests
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 20000) // 20 second timeout
        
        const response = await fetch(apiUrl, {

            signal: controller.signal,
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'User-Agent': 'DashboardUskup/1.0',
            },
        })
        clearTimeout(timeoutId)
        
        console.log(`[API] External API responded with status ${response.status}`)
        
        if (!response.ok) {
            console.warn(`[API] Liturgical calendar API returned ${response.status}`)
            return NextResponse.json({ 
                success: false, 
                data: [],
                error: `External API returned ${response.status}` 
            })
        }
        
        const data = await response.json()
        console.log(`[API] Received data, processing...`)


        // API returns { litcal: { eventKey: {...}, ... }, messages: [...] }
        const eventsMap = data.litcal || data

        // Convert to array and normalize dates
        const events: LiturgicalEvent[] = Object.entries(eventsMap)
            .filter(([key, e]: [string, any]) => e && e.date && e.name)
            .map(([key, e]: [string, any]) => {
                // Parse ISO date and convert to YYYY-MM-DD string
                const dateObj = new Date(e.date)
                const dateStr = dateObj.toISOString().split('T')[0]
                return {
                    event_key: key,
                    date: dateStr,
                    name: e.name,
                    color: e.color || [],
                    grade: e.grade || 0
                }
            })
            // Sort by date
            .sort((a, b) => a.date.localeCompare(b.date))
        
        console.log(`[API] Fetched ${events.length} liturgical events for ${year}`)
        
        return NextResponse.json({
            success: true,
            data: events,
            year: year,
            count: events.length
        }, {
            headers: {
                'Cache-Control': 'public, max-age=86400', // Cache 1 day
            }
        })
    } catch (error: any) {
        // Handle abort/timeout errors
        if (error?.name === 'AbortError') {
            console.log('[API] Liturgical calendar request timed out')
            return NextResponse.json({ 
                success: false, 
                data: [],
                error: 'Request timed out' 
            })
        }
        
        console.error('[API] Liturgical calendar error:', error?.message)
        return NextResponse.json({ 
            success: false, 
            data: [],
            error: error?.message || 'Unknown error' 
        }, { status: 500 })
    }
}
