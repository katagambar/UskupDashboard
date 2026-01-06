'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { use } from 'react'
import { DashboardLayout } from '@/components/dashboard-layout'
import {
    FileText, ArrowLeft, Calendar, Building2, User, Clock,
    CheckCircle2, AlertCircle, Send, Pencil, Trash2, FileCheck,
    Loader2, FileBarChart, MessageSquare
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface Report {
    id: string
    type: string
    title: string
    period: string
    content: string
    highlights: string | null
    challenges: string | null
    requests: string | null
    statistics: Record<string, any> | null
    status: string
    unitType: string
    unitName: string
    submittedAt: string | null
    reviewedAt: string | null
    reviewNotes: string | null
    createdAt: string
    submitter: {
        id: string
        name: string
        email: string
        role: string
        jabatan?: string
    }
    reviewer?: {
        name: string
    } | null
}

// Status badge config
const statusConfig: Record<string, { label: string, variant: 'default' | 'secondary' | 'destructive' | 'outline', icon: any, color: string }> = {
    DRAFT: { label: 'Draft', variant: 'secondary', icon: Pencil, color: 'text-gray-500' },
    SUBMITTED: { label: 'Menunggu Review', variant: 'default', icon: Clock, color: 'text-blue-500' },
    REVIEWED: { label: 'Sudah Direview', variant: 'outline', icon: FileCheck, color: 'text-purple-500' },
    APPROVED: { label: 'Disetujui', variant: 'default', icon: CheckCircle2, color: 'text-green-500' },
    NEEDS_REVISION: { label: 'Perlu Revisi', variant: 'destructive', icon: AlertCircle, color: 'text-red-500' }
}

const typeConfig: Record<string, { label: string, color: string }> = {
    MONTHLY: { label: 'Laporan Bulanan', color: 'bg-blue-500/10 text-blue-600' },
    QUARTERLY: { label: 'Laporan Triwulan', color: 'bg-emerald-500/10 text-emerald-600' },
    ANNUAL: { label: 'Laporan Tahunan', color: 'bg-purple-500/10 text-purple-600' },
    EVENT: { label: 'Laporan Event', color: 'bg-amber-500/10 text-amber-600' }
}

export default function ReportDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params)
    const router = useRouter()
    const [report, setReport] = useState<Report | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isReviewOpen, setIsReviewOpen] = useState(false)
    const [reviewNotes, setReviewNotes] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)

    useEffect(() => {
        fetchReport()
    }, [id])

    const fetchReport = async () => {
        try {
            setIsLoading(true)
            const res = await fetch(`/api/reports/${id}`)
            const data = await res.json()
            if (data.success) {
                setReport(data.data)
            } else {
                toast.error('Laporan tidak ditemukan')
                router.push('/reports')
            }
        } catch (error) {
            toast.error('Gagal memuat laporan')
        } finally {
            setIsLoading(false)
        }
    }

    const handleSubmit = async () => {
        try {
            setIsSubmitting(true)
            const res = await fetch(`/api/reports/${id}/submit`, { method: 'POST' })
            const data = await res.json()

            if (data.success) {
                toast.success('Laporan berhasil disubmit')
                fetchReport()
            } else {
                toast.error(data.error)
            }
        } catch (error) {
            toast.error('Gagal submit laporan')
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleReview = async (status: 'APPROVED' | 'NEEDS_REVISION') => {
        try {
            setIsSubmitting(true)
            const res = await fetch(`/api/reports/${id}/review`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status, reviewNotes })
            })
            const data = await res.json()

            if (data.success) {
                toast.success(status === 'APPROVED' ? 'Laporan disetujui' : 'Laporan ditandai perlu revisi')
                setIsReviewOpen(false)
                fetchReport()
            } else {
                toast.error(data.error)
            }
        } catch (error) {
            toast.error('Gagal mereview laporan')
        } finally {
            setIsSubmitting(false)
        }
    }

    if (isLoading) {
        return (
            <DashboardLayout>
                <div className="flex justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            </DashboardLayout>
        )
    }

    if (!report) {
        return null
    }

    const statusCfg = statusConfig[report.status] || statusConfig.DRAFT
    const typeCfg = typeConfig[report.type] || typeConfig.MONTHLY
    const StatusIcon = statusCfg.icon

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.push('/reports')}>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div className="flex-1">
                        <div className="flex items-center gap-2">
                            <Badge className={cn("gap-1", typeCfg.color)} variant="outline">
                                {typeCfg.label}
                            </Badge>
                            <Badge variant={statusCfg.variant} className="gap-1">
                                <StatusIcon className="h-3 w-3" />
                                {statusCfg.label}
                            </Badge>
                        </div>
                        <h1 className="text-2xl font-bold mt-2">{report.title}</h1>
                    </div>
                    <div className="flex gap-2">
                        {report.status === 'DRAFT' && (
                            <Button onClick={handleSubmit} disabled={isSubmitting} className="gap-2">
                                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                                Submit Laporan
                            </Button>
                        )}
                        {report.status === 'SUBMITTED' && (
                            <Dialog open={isReviewOpen} onOpenChange={setIsReviewOpen}>
                                <DialogTrigger asChild>
                                    <Button className="gap-2">
                                        <FileCheck className="h-4 w-4" />
                                        Review
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Review Laporan</DialogTitle>
                                        <DialogDescription>Berikan catatan dan keputusan untuk laporan ini</DialogDescription>
                                    </DialogHeader>
                                    <div className="space-y-4 py-4">
                                        <div className="space-y-2">
                                            <Label>Catatan Review</Label>
                                            <Textarea
                                                placeholder="Catatan untuk pembuat laporan..."
                                                value={reviewNotes}
                                                onChange={e => setReviewNotes(e.target.value)}
                                                rows={4}
                                            />
                                        </div>
                                    </div>
                                    <DialogFooter className="gap-2">
                                        <Button
                                            variant="destructive"
                                            onClick={() => handleReview('NEEDS_REVISION')}
                                            disabled={isSubmitting}
                                        >
                                            <AlertCircle className="h-4 w-4 mr-2" />
                                            Perlu Revisi
                                        </Button>
                                        <Button
                                            onClick={() => handleReview('APPROVED')}
                                            disabled={isSubmitting}
                                        >
                                            <CheckCircle2 className="h-4 w-4 mr-2" />
                                            Setujui
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        )}
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Report Content */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Isi Laporan</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap">
                                    {report.content}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Highlights */}
                        {report.highlights && (
                            <Card className="border-l-4 border-l-green-500">
                                <CardHeader>
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                                        Pencapaian / Highlights
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-muted-foreground whitespace-pre-wrap">{report.highlights}</p>
                                </CardContent>
                            </Card>
                        )}

                        {/* Challenges */}
                        {report.challenges && (
                            <Card className="border-l-4 border-l-amber-500">
                                <CardHeader>
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <AlertCircle className="h-5 w-5 text-amber-500" />
                                        Tantangan
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-muted-foreground whitespace-pre-wrap">{report.challenges}</p>
                                </CardContent>
                            </Card>
                        )}

                        {/* Requests */}
                        {report.requests && (
                            <Card className="border-l-4 border-l-blue-500">
                                <CardHeader>
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <MessageSquare className="h-5 w-5 text-blue-500" />
                                        Permohonan
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-muted-foreground whitespace-pre-wrap">{report.requests}</p>
                                </CardContent>
                            </Card>
                        )}

                        {/* Review Notes */}
                        {report.reviewNotes && (
                            <Card className="border-l-4 border-l-purple-500">
                                <CardHeader>
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <FileCheck className="h-5 w-5 text-purple-500" />
                                        Catatan Review
                                    </CardTitle>
                                    <CardDescription>
                                        Oleh {report.reviewer?.name || 'Reviewer'} pada {report.reviewedAt ? new Date(report.reviewedAt).toLocaleDateString('id-ID') : '-'}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-muted-foreground whitespace-pre-wrap">{report.reviewNotes}</p>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Info Card */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Informasi</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                        <Building2 className="h-5 w-5 text-primary" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Unit</p>
                                        <p className="font-medium">{report.unitName}</p>
                                    </div>
                                </div>
                                <Separator />
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                        <Calendar className="h-5 w-5 text-primary" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Periode</p>
                                        <p className="font-medium">{report.period}</p>
                                    </div>
                                </div>
                                <Separator />
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                        <User className="h-5 w-5 text-primary" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Pembuat</p>
                                        <p className="font-medium">{report.submitter.name}</p>
                                        <p className="text-xs text-muted-foreground">{report.submitter.jabatan || report.submitter.role}</p>
                                    </div>
                                </div>
                                <Separator />
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                        <Clock className="h-5 w-5 text-primary" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Dibuat</p>
                                        <p className="font-medium">{new Date(report.createdAt).toLocaleDateString('id-ID', {
                                            day: 'numeric',
                                            month: 'long',
                                            year: 'numeric'
                                        })}</p>
                                    </div>
                                </div>
                                {report.submittedAt && (
                                    <>
                                        <Separator />
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                                                <Send className="h-5 w-5 text-blue-500" />
                                            </div>
                                            <div>
                                                <p className="text-sm text-muted-foreground">Disubmit</p>
                                                <p className="font-medium">{new Date(report.submittedAt).toLocaleDateString('id-ID', {
                                                    day: 'numeric',
                                                    month: 'long',
                                                    year: 'numeric'
                                                })}</p>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </CardContent>
                        </Card>

                        {/* Statistics Card */}
                        {report.statistics && Object.keys(report.statistics).length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <FileBarChart className="h-5 w-5" />
                                        Statistik
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        {Object.entries(report.statistics).map(([key, value]) => (
                                            <div key={key} className="flex justify-between items-center">
                                                <span className="text-sm text-muted-foreground capitalize">
                                                    {key.replace(/([A-Z])/g, ' $1').trim()}
                                                </span>
                                                <span className="font-semibold">{value}</span>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    )
}
