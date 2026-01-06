/**
 * Issue Service
 * 
 * Service untuk mengelola Isu/Kasus dan Konsultasi.
 * Mendukung alur: Create Issue → Assign Consultants → Collect Opinions → Decision
 */

import { prisma } from './db'
import { canCreateIssues, canGiveOpinions, isUskup, getConsultableRoles } from './rbac'

// ============================================
// TYPES
// ============================================

export interface CreateIssueParams {
    title: string
    description: string
    category?: string
    priority?: string
    createdBy: string
    relatedDocType?: string
    relatedDocId?: string
    assignedTo?: string
}

export interface AddOpinionParams {
    issueId: string
    authorId: string
    content: string
    recommendation?: string
    attachments?: string
}

export interface MakeDecisionParams {
    issueId: string
    decision: string
    decisionNotes?: string
    decidedBy: string
}

// ============================================
// ISSUE CRUD
// ============================================

/**
 * Create a new issue
 */
export async function createIssue(params: CreateIssueParams) {
    const {
        title,
        description,
        category,
        priority = 'MEDIUM',
        createdBy,
        relatedDocType,
        relatedDocId,
        assignedTo
    } = params

    // Verify creator permission
    const creator = await prisma.user.findUnique({ where: { id: createdBy } })
    if (!creator || !canCreateIssues(creator.role)) {
        throw new Error('Tidak memiliki hak untuk membuat isu')
    }

    return prisma.issue.create({
        data: {
            title,
            description,
            category,
            priority,
            status: 'DRAFT',
            createdBy,
            assignedTo,
            relatedDocType,
            relatedDocId
        },
        include: {
            creator: { select: { id: true, name: true, role: true, jabatan: true } },
            assignee: { select: { id: true, name: true, role: true, jabatan: true } }
        }
    })
}

/**
 * Get issue by ID with all relations
 */
export async function getIssueById(id: string) {
    return prisma.issue.findUnique({
        where: { id },
        include: {
            creator: { select: { id: true, name: true, role: true, jabatan: true } },
            assignee: { select: { id: true, name: true, role: true, jabatan: true } },
            opinions: {
                include: {
                    author: { select: { id: true, name: true, role: true, jabatan: true } }
                },
                orderBy: { createdAt: 'desc' }
            }
        }
    })
}

/**
 * List issues with filters
 */
export async function listIssues(params: {
    status?: string
    category?: string
    createdBy?: string
    assignedTo?: string
    limit?: number
    offset?: number
}) {
    const { status, category, createdBy, assignedTo, limit = 20, offset = 0 } = params

    const where: any = {}
    if (status) where.status = status
    if (category) where.category = category
    if (createdBy) where.createdBy = createdBy
    if (assignedTo) where.assignedTo = assignedTo

    const [issues, total] = await Promise.all([
        prisma.issue.findMany({
            where,
            include: {
                creator: { select: { id: true, name: true, role: true } },
                assignee: { select: { id: true, name: true, role: true } },
                _count: { select: { opinions: true } }
            },
            orderBy: { createdAt: 'desc' },
            take: limit,
            skip: offset
        }),
        prisma.issue.count({ where })
    ])

    return { issues, total }
}

/**
 * Update issue status
 */
export async function updateIssueStatus(id: string, status: string) {
    return prisma.issue.update({
        where: { id },
        data: { status }
    })
}

/**
 * Open issue for consultation (send to consultants)
 */
export async function openForConsultation(issueId: string, consultantIds: string[]) {
    // Update status to OPEN
    await prisma.issue.update({
        where: { id: issueId },
        data: { status: 'OPEN' }
    })

    // TODO: Create notifications for consultants
    // This would notify the selected pejabat that they need to give opinion

    return { success: true, consultantIds }
}

// ============================================
// OPINIONS
// ============================================

/**
 * Add opinion to an issue
 */
export async function addOpinion(params: AddOpinionParams) {
    const { issueId, authorId, content, recommendation, attachments } = params

    // Verify author permission
    const author = await prisma.user.findUnique({ where: { id: authorId } })
    if (!author || !canGiveOpinions(author.role)) {
        throw new Error('Tidak memiliki hak untuk memberikan pendapat')
    }

    // Check if issue exists and is open
    const issue = await prisma.issue.findUnique({ where: { id: issueId } })
    if (!issue) {
        throw new Error('Isu tidak ditemukan')
    }
    if (issue.status !== 'OPEN' && issue.status !== 'IN_REVIEW') {
        throw new Error('Isu tidak dalam status konsultasi')
    }

    // Check if author already gave opinion
    const existingOpinion = await prisma.opinion.findFirst({
        where: { issueId, authorId }
    })
    if (existingOpinion) {
        throw new Error('Anda sudah memberikan pendapat untuk isu ini')
    }

    return prisma.opinion.create({
        data: {
            issueId,
            authorId,
            content,
            recommendation,
            attachments
        },
        include: {
            author: { select: { id: true, name: true, role: true, jabatan: true } }
        }
    })
}

/**
 * Get opinions for an issue
 */
export async function getOpinions(issueId: string) {
    return prisma.opinion.findMany({
        where: { issueId },
        include: {
            author: { select: { id: true, name: true, role: true, jabatan: true } }
        },
        orderBy: { createdAt: 'desc' }
    })
}

// ============================================
// DECISIONS
// ============================================

/**
 * Make final decision on an issue (Uskup only)
 */
export async function makeDecision(params: MakeDecisionParams) {
    const { issueId, decision, decisionNotes, decidedBy } = params

    // Verify only Uskup can decide
    const decider = await prisma.user.findUnique({ where: { id: decidedBy } })
    if (!decider || !isUskup(decider.role)) {
        throw new Error('Hanya Uskup yang dapat mengambil keputusan akhir')
    }

    return prisma.issue.update({
        where: { id: issueId },
        data: {
            status: 'DECIDED',
            decision,
            decisionNotes,
            decisionDate: new Date()
        },
        include: {
            creator: { select: { id: true, name: true } },
            opinions: {
                include: {
                    author: { select: { id: true, name: true, role: true } }
                }
            }
        }
    })
}

/**
 * Close an issue (archive)
 */
export async function closeIssue(issueId: string) {
    return prisma.issue.update({
        where: { id: issueId },
        data: { status: 'CLOSED' }
    })
}

// ============================================
// HELPERS
// ============================================

/**
 * Get consultable users (pejabat yang bisa dimintai pendapat)
 */
export async function getConsultableUsers() {
    const consultableRoles = getConsultableRoles()

    return prisma.user.findMany({
        where: {
            role: { in: consultableRoles }
        },
        select: {
            id: true,
            name: true,
            role: true,
            jabatan: true,
            department: true
        },
        orderBy: { name: 'asc' }
    })
}

/**
 * Get issues pending opinion from a user
 */
export async function getPendingConsultations(userId: string) {
    // Get issues where user hasn't given opinion yet
    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user || !canGiveOpinions(user.role)) {
        return []
    }

    const issues = await prisma.issue.findMany({
        where: {
            status: 'OPEN',
            opinions: {
                none: { authorId: userId }
            }
        },
        include: {
            creator: { select: { id: true, name: true } },
            _count: { select: { opinions: true } }
        },
        orderBy: { createdAt: 'desc' }
    })

    return issues
}
