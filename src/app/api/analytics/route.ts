/**
 * Analytics API
 * 
 * Provides aggregated analytics data for dashboard charts
 */

import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUserFromRequest } from '@/lib/custom-auth'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
    try {
        const user = await getCurrentUserFromRequest(request)

        if (!user) {
            return NextResponse.json(
                { success: false, error: 'Tidak terautentikasi' },
                { status: 401 }
            )
        }

        const { searchParams } = new URL(request.url)
        const period = searchParams.get('period') || '6m' // 6m, 3m, 1y

        // Calculate date range
        const now = new Date()
        let startDate = new Date()
        switch (period) {
            case '3m':
                startDate.setMonth(now.getMonth() - 3)
                break
            case '1y':
                startDate.setFullYear(now.getFullYear() - 1)
                break
            default: // 6m
                startDate.setMonth(now.getMonth() - 6)
        }

        // Fetch all data in parallel - using correct Prisma model names
        const [
            agendaStats,
            taskStats,
            notulensiStats,
            reportStats,
            issueStats,
            imamCount,
            parokiCount
        ] = await Promise.all([
            // Agenda by month
            prisma.agenda.groupBy({
                by: ['createdAt'],
                where: { createdAt: { gte: startDate } },
                _count: true
            }),
            // Tasks by status (model name is "Task")
            prisma.task.groupBy({
                by: ['status'],
                _count: true
            }),
            // Notulensi trend
            prisma.notulensi.findMany({
                where: { createdAt: { gte: startDate } },
                select: { createdAt: true, status: true }
            }),
            // Reports by type (model name is "Report")
            prisma.report.groupBy({
                by: ['type', 'status'],
                _count: true
            }),
            // Issues by status (model name is "Issue")
            prisma.issue.groupBy({
                by: ['status'],
                _count: true
            }),
            // Total active priests (using "status" field)
            prisma.imam.count({
                where: { status: 'Aktif' }
            }),
            // Total parishes (model name is "Paroki")
            prisma.paroki.count()
        ])

        // Process agenda data by month
        const agendaByMonth = getMonthlyAggregation(
            agendaStats.map(a => ({ date: a.createdAt, count: a._count })),
            startDate
        )

        // Process notulensi data by month
        const notulensiByMonth = getMonthlyAggregation(
            notulensiStats.map(n => ({ date: n.createdAt, count: 1 })),
            startDate
        )

        // Process task distribution
        const taskDistribution = taskStats.map(t => ({
            name: t.status,
            value: t._count
        }))

        // Process report distribution
        const reportByType = reportStats.reduce((acc, r) => {
            const existing = acc.find(a => a.name === r.type)
            if (existing) {
                existing.value += r._count
            } else {
                acc.push({ name: getReportTypeName(r.type), value: r._count })
            }
            return acc
        }, [] as { name: string; value: number }[])

        const reportByStatus = reportStats.reduce((acc, r) => {
            const existing = acc.find(a => a.name === r.status)
            if (existing) {
                existing.value += r._count
            } else {
                acc.push({ name: getStatusName(r.status), value: r._count })
            }
            return acc
        }, [] as { name: string; value: number }[])

        // Process issue distribution
        const issueDistribution = issueStats.map(i => ({
            name: getIssueStatusName(i.status),
            value: i._count
        }))

        // Weekly activity data (last 8 weeks)
        const weeklyActivity = await getWeeklyActivity()

        return NextResponse.json({
            success: true,
            data: {
                // Overview stats
                overview: {
                    totalImam: imamCount,
                    totalParoki: parokiCount,
                    totalReports: reportStats.reduce((sum, r) => sum + r._count, 0),
                    totalIssues: issueStats.reduce((sum, i) => sum + i._count, 0)
                },
                // Chart data
                charts: {
                    agendaTrend: agendaByMonth,
                    notulensiTrend: notulensiByMonth,
                    taskDistribution,
                    reportByType,
                    reportByStatus,
                    issueDistribution,
                    weeklyActivity
                }
            }
        })

    } catch (error) {
        console.error('Analytics error:', error)
        return NextResponse.json(
            { success: false, error: 'Gagal mengambil data analytics' },
            { status: 500 }
        )
    }
}

// Helper functions
function getMonthlyAggregation(
    data: { date: Date; count: number }[],
    startDate: Date
): { name: string; value: number }[] {
    const months: Record<string, number> = {}
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']

    // Initialize months
    const current = new Date(startDate)
    while (current <= new Date()) {
        const key = `${monthNames[current.getMonth()]} ${current.getFullYear().toString().slice(-2)}`
        months[key] = 0
        current.setMonth(current.getMonth() + 1)
    }

    // Aggregate data
    data.forEach(item => {
        const key = `${monthNames[item.date.getMonth()]} ${item.date.getFullYear().toString().slice(-2)}`
        if (months[key] !== undefined) {
            months[key] += item.count
        }
    })

    return Object.entries(months).map(([name, value]) => ({ name, value }))
}

async function getWeeklyActivity() {
    const weeks: { name: string; agenda: number; notulensi: number; tugas: number }[] = []

    for (let i = 7; i >= 0; i--) {
        const weekStart = new Date()
        weekStart.setDate(weekStart.getDate() - (i * 7) - 7)
        const weekEnd = new Date()
        weekEnd.setDate(weekEnd.getDate() - (i * 7))

        const [agenda, notulensi, tugas] = await Promise.all([
            prisma.agenda.count({
                where: { createdAt: { gte: weekStart, lt: weekEnd } }
            }),
            prisma.notulensi.count({
                where: { createdAt: { gte: weekStart, lt: weekEnd } }
            }),
            prisma.task.count({
                where: { createdAt: { gte: weekStart, lt: weekEnd } }
            })
        ])

        weeks.push({
            name: `W${8 - i}`,
            agenda,
            notulensi,
            tugas
        })
    }

    return weeks
}

function getReportTypeName(type: string): string {
    const names: Record<string, string> = {
        'MONTHLY': 'Bulanan',
        'QUARTERLY': 'Triwulan',
        'ANNUAL': 'Tahunan',
        'EVENT': 'Kegiatan'
    }
    return names[type] || type
}

function getStatusName(status: string): string {
    const names: Record<string, string> = {
        'DRAFT': 'Draft',
        'SUBMITTED': 'Disubmit',
        'REVIEWED': 'Direview',
        'APPROVED': 'Disetujui',
        'NEEDS_REVISION': 'Revisi'
    }
    return names[status] || status
}

function getIssueStatusName(status: string): string {
    const names: Record<string, string> = {
        'OPEN': 'Terbuka',
        'IN_PROGRESS': 'Proses',
        'RESOLVED': 'Selesai',
        'CLOSED': 'Ditutup'
    }
    return names[status] || status
}
