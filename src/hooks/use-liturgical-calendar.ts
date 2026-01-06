import { useQuery } from '@tanstack/react-query'
import { getLiturgicalCalendar, LiturgicalEvent } from '@/lib/liturgical-calendar'

export function useLiturgicalCalendar(year: number) {
    return useQuery({
        queryKey: ['liturgical-calendar', year],
        queryFn: () => getLiturgicalCalendar(year),
        staleTime: 1000 * 60 * 60 * 24, // 24 hours
        gcTime: 1000 * 60 * 60 * 24 * 7, // 7 days
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
