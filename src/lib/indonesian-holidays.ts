/**
 * Indonesian Public Holidays Data (Hari Libur Nasional Indonesia)
 * Includes both fixed holidays and those that may vary by year
 */

export interface Holiday {
    date: string // Format: MM-DD for fixed, YYYY-MM-DD for variable
    name: string
    description?: string
    isFixed: boolean // True if same date every year
}

// Fixed holidays (same date every year)
export const fixedHolidays: Holiday[] = [
    { date: "01-01", name: "Tahun Baru Masehi", isFixed: true },
    { date: "05-01", name: "Hari Buruh Internasional", isFixed: true },
    { date: "06-01", name: "Hari Lahir Pancasila", isFixed: true },
    { date: "08-17", name: "Hari Kemerdekaan RI", isFixed: true },
    { date: "12-25", name: "Hari Natal", isFixed: true },
]

// Variable holidays for 2025
export const holidays2025: Holiday[] = [
    // Tahun Baru Imlek
    { date: "2025-01-29", name: "Tahun Baru Imlek 2576", isFixed: false },
    // Isra Mi'raj
    { date: "2025-01-27", name: "Isra Mi'raj Nabi Muhammad SAW", isFixed: false },
    // Hari Raya Nyepi
    { date: "2025-03-29", name: "Hari Raya Nyepi", isFixed: false },
    // Wafat Isa Al-Masih
    { date: "2025-04-18", name: "Wafat Isa Al-Masih", isFixed: false },
    // Idul Fitri
    { date: "2025-03-31", name: "Hari Raya Idul Fitri 1446 H", isFixed: false },
    { date: "2025-04-01", name: "Hari Raya Idul Fitri 1446 H", isFixed: false },
    // Hari Waisak
    { date: "2025-05-12", name: "Hari Raya Waisak 2569", isFixed: false },
    // Kenaikan Isa Al-Masih
    { date: "2025-05-29", name: "Kenaikan Isa Al-Masih", isFixed: false },
    // Idul Adha
    { date: "2025-06-07", name: "Hari Raya Idul Adha 1446 H", isFixed: false },
    // Tahun Baru Islam
    { date: "2025-06-27", name: "Tahun Baru Islam 1447 H", isFixed: false },
    // Maulid Nabi
    { date: "2025-09-05", name: "Maulid Nabi Muhammad SAW", isFixed: false },
]

// Variable holidays for 2026
export const holidays2026: Holiday[] = [
    // Tahun Baru Imlek
    { date: "2026-02-17", name: "Tahun Baru Imlek 2577", isFixed: false },
    // Isra Mi'raj
    { date: "2026-01-16", name: "Isra Mi'raj Nabi Muhammad SAW", isFixed: false },
    // Hari Raya Nyepi
    { date: "2026-03-19", name: "Hari Raya Nyepi", isFixed: false },
    // Wafat Isa Al-Masih
    { date: "2026-04-03", name: "Wafat Isa Al-Masih", isFixed: false },
    // Idul Fitri
    { date: "2026-03-21", name: "Hari Raya Idul Fitri 1447 H", isFixed: false },
    { date: "2026-03-22", name: "Hari Raya Idul Fitri 1447 H", isFixed: false },
    // Hari Waisak
    { date: "2026-05-31", name: "Hari Raya Waisak 2570", isFixed: false },
    // Kenaikan Isa Al-Masih
    { date: "2026-05-14", name: "Kenaikan Isa Al-Masih", isFixed: false },
    // Idul Adha
    { date: "2026-05-28", name: "Hari Raya Idul Adha 1447 H", isFixed: false },
    // Tahun Baru Islam
    { date: "2026-06-17", name: "Tahun Baru Islam 1448 H", isFixed: false },
    // Maulid Nabi
    { date: "2026-08-26", name: "Maulid Nabi Muhammad SAW", isFixed: false },
]

/**
 * Get all holidays for a specific year
 */
export function getHolidaysForYear(year: number): { date: Date; name: string }[] {
    const holidays: { date: Date; name: string }[] = []

    // Add fixed holidays
    fixedHolidays.forEach(h => {
        const [month, day] = h.date.split('-').map(Number)
        holidays.push({
            date: new Date(year, month - 1, day),
            name: h.name
        })
    })

    // Add variable holidays based on year
    const variableHolidays = year === 2025 ? holidays2025 :
        year === 2026 ? holidays2026 : []

    variableHolidays.forEach(h => {
        const [y, m, d] = h.date.split('-').map(Number)
        holidays.push({
            date: new Date(y, m - 1, d),
            name: h.name
        })
    })

    return holidays
}

/**
 * Check if a specific date is a holiday
 */
export function isHoliday(date: Date): boolean {
    const holidays = getHolidaysForYear(date.getFullYear())
    return holidays.some(h =>
        h.date.getDate() === date.getDate() &&
        h.date.getMonth() === date.getMonth() &&
        h.date.getFullYear() === date.getFullYear()
    )
}

/**
 * Get holiday name for a specific date
 */
export function getHolidayName(date: Date): string | null {
    const holidays = getHolidaysForYear(date.getFullYear())
    const holiday = holidays.find(h =>
        h.date.getDate() === date.getDate() &&
        h.date.getMonth() === date.getMonth() &&
        h.date.getFullYear() === date.getFullYear()
    )
    return holiday?.name || null
}

/**
 * Check if date is Sunday (also considered holiday in Indonesia)
 */
export function isSunday(date: Date): boolean {
    return date.getDay() === 0
}

/**
 * Check if date is a red day (Sunday or national holiday)
 */
export function isRedDay(date: Date): boolean {
    return isSunday(date) || isHoliday(date)
}
