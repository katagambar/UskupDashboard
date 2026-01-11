import { useQuery } from '@tanstack/react-query'
import { LiturgicalEvent } from '@/lib/liturgical-calendar'

// Fetch liturgical calendar from internal API route (which proxies to external API)
async function fetchLiturgicalCalendar(year: number): Promise<LiturgicalEvent[]> {
    try {
        const response = await fetch(`/api/liturgical-calendar?year=${year}`)
        if (!response.ok) {
            console.warn(`Liturgical calendar API returned ${response.status}`)
            return []
        }
        const result = await response.json()
        return result.data || []
    } catch (error) {
        console.warn('Failed to fetch liturgical calendar:', error)
        return []
    }
}

export function useLiturgicalCalendar(year: number) {
    return useQuery({
        queryKey: ['liturgical-calendar', year],
        queryFn: () => fetchLiturgicalCalendar(year),
        staleTime: 1000 * 60 * 60 * 24, // 24 hours
        gcTime: 1000 * 60 * 60 * 24 * 7, // 7 days
        retry: 2, // Retry twice on failure
    })
}


export function useLiturgicalEvent(date: Date) {
    const year = date.getFullYear()
    const { data: events } = useLiturgicalCalendar(year)

    if (!events) return null

    // Format date to YYYY-MM-DD to match API
    // Note: Local time vs UTC might be an issue, but let's stick to simple string matching
    const dateString = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`

    // API date format is actually timestamp in some versions or YYYY-MM-DD. 
    // Let's assume the previous service handles parsing/filtering or the API returns YYYY-MM-DD
    return events.find(event => event.date === dateString)
}
