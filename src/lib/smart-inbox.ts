/**
 * Smart Inbox Service
 * 
 * Centralized notification hub for pending actions:
 * - Surat menunggu tanda tangan
 * - Disposisi masuk
 * - Laporan kritis
 * - Konsultasi pending
 */

import { prisma } from '@/lib/db'

export interface InboxItem {
    id: string
    type: 'SURAT_PENDING' | 'DISPOSITION' | 'CRITICAL_REPORT' | 'ISSUE_PENDING' | 'TASK_URGENT'
    title: string
    description: string
    priority: 'HIGH' | 'MEDIUM' | 'LOW'
    createdAt: Date
    actionUrl: string
    metadata?: Record<string, unknown>
}

export interface InboxSummary {
    total: number
    byType: {
        suratPending: number
        dispositions: number
        criticalReports: number
        issuePending: number
        taskUrgent: number
    }
    items: InboxItem[]
}

/**
 * Get all pending inbox items for a user
 */
export async function getSmartInbox(userId: string): Promise<InboxSummary> {
    const items: InboxItem[] = []

    // 1. Surat menunggu tanda tangan (untuk Uskup)
    const pendingSurat = await prisma.surat.findMany({
        where: {
            status: 'Menunggu Tanda Tangan'
        },
        orderBy: { tanggalKeluar: 'desc' },
        take: 10
    })

    pendingSurat.forEach(surat => {
        items.push({
            id: `surat-${surat.id}`,
            type: 'SURAT_PENDING',
            title: `Surat: ${surat.perihal}`,
            description: `${surat.tujuan} - menunggu tanda tangan`,
            priority: 'HIGH',
            createdAt: new Date(surat.tanggalKeluar || surat.createdAt),
            actionUrl: `/surat/${surat.id}`,
            metadata: { suratId: surat.id }
        })
    })

    // 2. Issues/Konsultasi pending untuk Uskup (butuh keputusan)
    const pendingIssues = await prisma.issue.findMany({
        where: {
            status: 'OPEN',
            decision: null
        },
        include: {
            creator: { select: { name: true } }
        },
        orderBy: { createdAt: 'desc' },
        take: 10
    })

    pendingIssues.forEach(issue => {
        items.push({
            id: `issue-${issue.id}`,
            type: 'ISSUE_PENDING',
            title: `Konsultasi: ${issue.title}`,
            description: `Dari ${issue.creator.name} - menunggu keputusan`,
            priority: issue.priority as 'HIGH' | 'MEDIUM' | 'LOW',
            createdAt: issue.createdAt,
            actionUrl: `/issues/${issue.id}`,
            metadata: { issueId: issue.id }
        })
    })

    // 3. Laporan kritis (status revisi atau laporan merah)
    const criticalReports = await prisma.report.findMany({
        where: {
            OR: [
                { status: 'NEEDS_REVISION' },
                { status: 'SUBMITTED' }
            ]
        },
        include: {
            submitter: { select: { name: true } }
        },
        orderBy: { createdAt: 'desc' },
        take: 10
    })

    criticalReports.forEach(report => {
        const isCritical = report.status === 'NEEDS_REVISION'
        items.push({
            id: `report-${report.id}`,
            type: 'CRITICAL_REPORT',
            title: `Laporan: ${report.title}`,
            description: `${report.unitName} - ${isCritical ? 'perlu revisi' : 'menunggu review'}`,
            priority: isCritical ? 'HIGH' : 'MEDIUM',
            createdAt: report.createdAt,
            actionUrl: `/reports/${report.id}`,
            metadata: { reportId: report.id }
        })
    })

    // 4. Tugas urgent (prioritas tinggi & belum selesai)
    const urgentTasks = await prisma.task.findMany({
        where: {
            prioritas: 'Tinggi',
            status: { not: 'Selesai' }
        },
        orderBy: { createdAt: 'desc' },
        take: 5
    })

    urgentTasks.forEach(task => {
        items.push({
            id: `task-${task.id}`,
            type: 'TASK_URGENT',
            title: `Tugas: ${task.judul}`,
            description: task.deskripsi?.substring(0, 100) || 'Prioritas tinggi',
            priority: 'HIGH',
            createdAt: task.createdAt,
            actionUrl: `/tasks`,
            metadata: { taskId: task.id }
        })
    })

    // Sort by priority and date
    items.sort((a, b) => {
        const priorityOrder = { HIGH: 0, MEDIUM: 1, LOW: 2 }
        if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
            return priorityOrder[a.priority] - priorityOrder[b.priority]
        }
        return b.createdAt.getTime() - a.createdAt.getTime()
    })

    // Calculate summary
    const summary: InboxSummary = {
        total: items.length,
        byType: {
            suratPending: items.filter(i => i.type === 'SURAT_PENDING').length,
            dispositions: 0, // Will be implemented when disposition model exists
            criticalReports: items.filter(i => i.type === 'CRITICAL_REPORT').length,
            issuePending: items.filter(i => i.type === 'ISSUE_PENDING').length,
            taskUrgent: items.filter(i => i.type === 'TASK_URGENT').length
        },
        items: items.slice(0, 20) // Limit to 20 items
    }

    return summary
}

/**
 * Get inbox count for badge display
 */
export async function getInboxCount(): Promise<number> {
    const [suratCount, issueCount, reportCount, taskCount] = await Promise.all([
        prisma.surat.count({ where: { status: 'Menunggu Tanda Tangan' } }),
        prisma.issue.count({ where: { status: 'OPEN', decision: null } }),
        prisma.report.count({ where: { status: { in: ['SUBMITTED', 'NEEDS_REVISION'] } } }),
        prisma.task.count({ where: { prioritas: 'Tinggi', status: { not: 'Selesai' } } })
    ])

    return suratCount + issueCount + reportCount + taskCount
}
