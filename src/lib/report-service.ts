/**
 * Report Service
 * 
 * Phase 4: Smart Reporting System
 * Functions for managing reports from Paroki/Komisi/Kevikepan
 */

import { prisma } from '@/lib/db'
import { ReportType, ReportStatus } from '@prisma/client'

// ============================================
// TYPES
// ============================================

export interface CreateReportParams {
    type: ReportType
    title: string
    period: string
    content: string
    highlights?: string
    challenges?: string
    requests?: string
    statistics?: Record<string, number | string>
    unitType: string
    unitId?: string
    unitName: string
    submittedBy: string
}

export interface UpdateReportParams {
    title?: string
    content?: string
    highlights?: string
    challenges?: string
    requests?: string
    statistics?: Record<string, number | string>
}

export interface ListReportsParams {
    status?: ReportStatus
    unitType?: string
    type?: ReportType
    period?: string
    limit?: number
    offset?: number
    submittedBy?: string
}

export interface ReviewParams {
    reportId: string
    status: 'APPROVED' | 'NEEDS_REVISION'
    reviewNotes?: string
    reviewedBy: string
}

// ============================================
// CREATE / UPDATE
// ============================================

export async function createReport(params: CreateReportParams) {
    const { statistics, ...rest } = params

    return prisma.report.create({
        data: {
            ...rest,
            statistics: statistics ? JSON.stringify(statistics) : null,
            status: 'DRAFT'
        },
        include: {
            submitter: {
                select: { id: true, name: true, email: true, role: true }
            }
        }
    })
}

export async function updateReport(id: string, params: UpdateReportParams) {
    const { statistics, ...rest } = params

    return prisma.report.update({
        where: { id },
        data: {
            ...rest,
            statistics: statistics ? JSON.stringify(statistics) : undefined,
            updatedAt: new Date()
        }
    })
}

export async function deleteReport(id: string) {
    // Only allow deleting drafts
    const report = await prisma.report.findUnique({ where: { id } })
    if (!report) throw new Error('Laporan tidak ditemukan')
    if (report.status !== 'DRAFT') throw new Error('Hanya draft yang dapat dihapus')

    return prisma.report.delete({ where: { id } })
}

// ============================================
// SUBMIT / REVIEW WORKFLOW
// ============================================

export async function submitReport(id: string) {
    const report = await prisma.report.findUnique({ where: { id } })
    if (!report) throw new Error('Laporan tidak ditemukan')
    if (report.status !== 'DRAFT') throw new Error('Laporan sudah disubmit')

    return prisma.report.update({
        where: { id },
        data: {
            status: 'SUBMITTED',
            submittedAt: new Date()
        }
    })
}

export async function reviewReport(params: ReviewParams) {
    const { reportId, status, reviewNotes, reviewedBy } = params

    const report = await prisma.report.findUnique({ where: { id: reportId } })
    if (!report) throw new Error('Laporan tidak ditemukan')
    if (report.status !== 'SUBMITTED') throw new Error('Laporan belum disubmit atau sudah direview')

    return prisma.report.update({
        where: { id: reportId },
        data: {
            status: status as ReportStatus,
            reviewedAt: new Date(),
            reviewedBy,
            reviewNotes
        },
        include: {
            submitter: { select: { id: true, name: true, email: true } },
            reviewer: { select: { id: true, name: true, email: true } }
        }
    })
}

// ============================================
// READ / LIST
// ============================================

export async function getReportById(id: string) {
    const report = await prisma.report.findUnique({
        where: { id },
        include: {
            submitter: {
                select: { id: true, name: true, email: true, role: true, jabatan: true }
            },
            reviewer: {
                select: { id: true, name: true, email: true, role: true }
            }
        }
    })

    if (report && report.statistics) {
        return {
            ...report,
            statistics: JSON.parse(report.statistics)
        }
    }

    return report
}

export async function listReports(params: ListReportsParams = {}) {
    const { status, unitType, type, period, limit = 20, offset = 0, submittedBy } = params

    const where: any = {}
    if (status) where.status = status
    if (unitType) where.unitType = unitType
    if (type) where.type = type
    if (period) where.period = { contains: period }
    if (submittedBy) where.submittedBy = submittedBy

    const [reports, total] = await Promise.all([
        prisma.report.findMany({
            where,
            include: {
                submitter: {
                    select: { id: true, name: true, email: true, role: true }
                }
            },
            orderBy: { createdAt: 'desc' },
            take: limit,
            skip: offset
        }),
        prisma.report.count({ where })
    ])

    return { reports, total }
}

// ============================================
// EXECUTIVE SUMMARY
// ============================================

export async function getExecutiveSummary(period?: string) {
    const where: any = {}
    if (period) where.period = { contains: period }

    // Get all submitted/approved reports for period
    const reports = await prisma.report.findMany({
        where: {
            ...where,
            status: { in: ['SUBMITTED', 'REVIEWED', 'APPROVED'] }
        },
        include: {
            submitter: { select: { name: true } }
        }
    })

    // Aggregate statistics
    const stats = {
        totalReports: reports.length,
        byStatus: {
            submitted: reports.filter(r => r.status === 'SUBMITTED').length,
            approved: reports.filter(r => r.status === 'APPROVED').length,
            needsRevision: reports.filter(r => r.status === 'NEEDS_REVISION').length
        },
        byType: {
            monthly: reports.filter(r => r.type === 'MONTHLY').length,
            quarterly: reports.filter(r => r.type === 'QUARTERLY').length,
            annual: reports.filter(r => r.type === 'ANNUAL').length,
            event: reports.filter(r => r.type === 'EVENT').length
        },
        byUnit: {} as Record<string, number>
    }

    // Count by unit type
    reports.forEach(r => {
        stats.byUnit[r.unitType] = (stats.byUnit[r.unitType] || 0) + 1
    })

    // Get recent reports
    const recentReports = reports.slice(0, 5).map(r => ({
        id: r.id,
        title: r.title,
        unitName: r.unitName,
        status: r.status,
        submittedAt: r.submittedAt
    }))

    return {
        period: period || 'All Time',
        stats,
        recentReports
    }
}
