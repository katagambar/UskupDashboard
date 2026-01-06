'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { DashboardLayout } from '@/components/dashboard-layout'
import {
    FileText, Plus, Filter, Search, Calendar, Building2,
    CheckCircle2, Clock, AlertCircle, Send, Eye, Pencil, Trash2,
    ChevronDown, Loader2, FileBarChart, BarChart3
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

// Types
interface Report {
    id: string
    type: string
    title: string
    period: string
    content: string
    status: string
    unitType: string
    unitName: string
    submittedAt: string | null
    createdAt: string
    submitter: {
        name: string
        email: string
    }
}

// Status badge colors
const statusConfig: Record<string, { label: string, variant: 'default' | 'secondary' | 'destructive' | 'outline', icon: any }> = {
    DRAFT: { label: 'Draft', variant: 'secondary', icon: Pencil },
    SUBMITTED: { label: 'Menunggu Review', variant: 'default', icon: Clock },
    REVIEWED: { label: 'Sudah Direview', variant: 'outline', icon: Eye },
    APPROVED: { label: 'Disetujui', variant: 'default', icon: CheckCircle2 },
    NEEDS_REVISION: { label: 'Perlu Revisi', variant: 'destructive', icon: AlertCircle }
}

// Type config
const typeConfig: Record<string, { label: string, color: string }> = {
    MONTHLY: { label: 'Bulanan', color: 'bg-blue-500/10 text-blue-600 border-blue-200' },
    QUARTERLY: { label: 'Triwulan', color: 'bg-emerald-500/10 text-emerald-600 border-emerald-200' },
    ANNUAL: { label: 'Tahunan', color: 'bg-purple-500/10 text-purple-600 border-purple-200' },
    EVENT: { label: 'Event', color: 'bg-amber-500/10 text-amber-600 border-amber-200' }
}

export default function ReportsPage() {
    const router = useRouter()
    const [reports, setReports] = useState<Report[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [filterStatus, setFilterStatus] = useState('all')
    const [filterType, setFilterType] = useState('all')
    const [isCreateOpen, setIsCreateOpen] = useState(false)
    const [isCreating, setIsCreating] = useState(false)

    // Create form state
    const [formData, setFormData] = useState({
        type: 'MONTHLY',
        title: '',
        period: '',
        content: '',
        highlights: '',
        challenges: '',
        requests: '',
        unitType: 'PAROKI',
        unitName: ''
    })

    useEffect(() => {
        fetchReports()
    }, [])

    const fetchReports = async () => {
        try {
            setIsLoading(true)
            const res = await fetch('/api/reports')
            const data = await res.json()
            if (data.success) {
                setReports(data.data)
            }
        } catch (error) {
            toast.error('Gagal memuat laporan')
        } finally {
            setIsLoading(false)
        }
    }

    const handleCreate = async () => {
        if (!formData.title || !formData.period || !formData.content || !formData.unitName) {
            toast.error('Mohon lengkapi semua field yang wajib')
            return
        }

        try {
            setIsCreating(true)
            const res = await fetch('/api/reports', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            })
            const data = await res.json()

            if (data.success) {
                toast.success('Laporan berhasil dibuat')
                setIsCreateOpen(false)
                setFormData({
                    type: 'MONTHLY',
                    title: '',
                    period: '',
                    content: '',
                    highlights: '',
                    challenges: '',
                    requests: '',
                    unitType: 'PAROKI',
                    unitName: ''
                })
                fetchReports()
            } else {
                toast.error(data.error)
            }
        } catch (error) {
            toast.error('Gagal membuat laporan')
        } finally {
            setIsCreating(false)
        }
    }

    const handleSubmit = async (id: string) => {
        try {
            const res = await fetch(`/api/reports/${id}/submit`, { method: 'POST' })
            const data = await res.json()

            if (data.success) {
                toast.success('Laporan berhasil disubmit')
                fetchReports()
            } else {
                toast.error(data.error)
            }
        } catch (error) {
            toast.error('Gagal submit laporan')
        }
    }

    // Filter reports
    const filteredReports = reports.filter(report => {
        const matchesSearch = report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            report.unitName.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesStatus = filterStatus === 'all' || report.status === filterStatus
        const matchesType = filterType === 'all' || report.type === filterType
        return matchesSearch && matchesStatus && matchesType
    })

    // Stats
    const stats = {
        total: reports.length,
        draft: reports.filter(r => r.status === 'DRAFT').length,
        submitted: reports.filter(r => r.status === 'SUBMITTED').length,
        approved: reports.filter(r => r.status === 'APPROVED').length
    }

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold flex items-center gap-2">
                            <FileBarChart className="h-6 w-6 text-primary" />
                            Laporan
                        </h1>
                        <p className="text-muted-foreground">Kelola laporan dari unit kerja</p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" className="gap-2" onClick={() => router.push('/reports/summary')}>
                            <BarChart3 className="h-4 w-4" />
                            Executive Summary
                        </Button>
                        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                            <DialogTrigger asChild>
                                <Button className="gap-2">
                                    <Plus className="h-4 w-4" />
                                    Buat Laporan
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                                <DialogHeader>
                                    <DialogTitle>Buat Laporan Baru</DialogTitle>
                                    <DialogDescription>Isi form berikut untuk membuat laporan</DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Tipe Laporan *</Label>
                                            <Select value={formData.type} onValueChange={v => setFormData({ ...formData, type: v })}>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="MONTHLY">Bulanan</SelectItem>
                                                    <SelectItem value="QUARTERLY">Triwulan</SelectItem>
                                                    <SelectItem value="ANNUAL">Tahunan</SelectItem>
                                                    <SelectItem value="EVENT">Event</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Periode *</Label>
                                            <Input
                                                placeholder="e.g. Januari 2026"
                                                value={formData.period}
                                                onChange={e => setFormData({ ...formData, period: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Unit *</Label>
                                            <Select value={formData.unitType} onValueChange={v => setFormData({ ...formData, unitType: v })}>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="PAROKI">Paroki</SelectItem>
                                                    <SelectItem value="KOMISI">Komisi</SelectItem>
                                                    <SelectItem value="KEVIKEPAN">Kevikepan</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Nama Unit *</Label>
                                            <Input
                                                placeholder="e.g. Paroki Katedral"
                                                value={formData.unitName}
                                                onChange={e => setFormData({ ...formData, unitName: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Judul Laporan *</Label>
                                        <Input
                                            placeholder="Judul laporan"
                                            value={formData.title}
                                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Isi Laporan *</Label>
                                        <Textarea
                                            placeholder="Isi laporan..."
                                            rows={5}
                                            value={formData.content}
                                            onChange={e => setFormData({ ...formData, content: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Highlights / Pencapaian</Label>
                                        <Textarea
                                            placeholder="Pencapaian penting..."
                                            rows={2}
                                            value={formData.highlights}
                                            onChange={e => setFormData({ ...formData, highlights: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Tantangan</Label>
                                        <Textarea
                                            placeholder="Tantangan yang dihadapi..."
                                            rows={2}
                                            value={formData.challenges}
                                            onChange={e => setFormData({ ...formData, challenges: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Permohonan</Label>
                                        <Textarea
                                            placeholder="Permohonan ke pimpinan..."
                                            rows={2}
                                            value={formData.requests}
                                            onChange={e => setFormData({ ...formData, requests: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Batal</Button>
                                    <Button onClick={handleCreate} disabled={isCreating}>
                                        {isCreating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                                        Simpan Draft
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-4">
                    <Card className="bg-blue-50 dark:bg-blue-950/30">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Total Laporan</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">{stats.total}</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-gray-50 dark:bg-gray-950/30">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Draft</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">{stats.draft}</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-amber-50 dark:bg-amber-950/30">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Menunggu Review</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">{stats.submitted}</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-green-50 dark:bg-green-950/30">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Disetujui</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">{stats.approved}</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Cari laporan..."
                            className="pl-10"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                        <SelectTrigger className="w-full md:w-[180px]">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Semua Status</SelectItem>
                            <SelectItem value="DRAFT">Draft</SelectItem>
                            <SelectItem value="SUBMITTED">Menunggu Review</SelectItem>
                            <SelectItem value="APPROVED">Disetujui</SelectItem>
                            <SelectItem value="NEEDS_REVISION">Perlu Revisi</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select value={filterType} onValueChange={setFilterType}>
                        <SelectTrigger className="w-full md:w-[180px]">
                            <SelectValue placeholder="Tipe" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Semua Tipe</SelectItem>
                            <SelectItem value="MONTHLY">Bulanan</SelectItem>
                            <SelectItem value="QUARTERLY">Triwulan</SelectItem>
                            <SelectItem value="ANNUAL">Tahunan</SelectItem>
                            <SelectItem value="EVENT">Event</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Reports List */}
                {isLoading ? (
                    <div className="flex justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : filteredReports.length === 0 ? (
                    <Card>
                        <CardContent className="py-12 text-center">
                            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                            <h3 className="text-lg font-semibold mb-2">Belum Ada Laporan</h3>
                            <p className="text-muted-foreground mb-4">Buat laporan pertama Anda</p>
                            <Button onClick={() => setIsCreateOpen(true)}>
                                <Plus className="h-4 w-4 mr-2" />
                                Buat Laporan
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-3">
                        {filteredReports.map(report => {
                            const statusCfg = statusConfig[report.status] || statusConfig.DRAFT
                            const typeCfg = typeConfig[report.type] || typeConfig.MONTHLY
                            const StatusIcon = statusCfg.icon

                            return (
                                <Card
                                    key={report.id}
                                    className="group hover:shadow-md transition-all cursor-pointer"
                                    onClick={() => router.push(`/reports/${report.id}`)}
                                >
                                    <CardContent className="p-4">
                                        <div className="flex items-start gap-4">
                                            <div className={cn("p-3 rounded-lg", typeCfg.color)}>
                                                <FileText className="h-5 w-5" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-2">
                                                    <div>
                                                        <h3 className="font-semibold truncate">{report.title}</h3>
                                                        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                                                            <Building2 className="h-3.5 w-3.5" />
                                                            <span>{report.unitName}</span>
                                                            <span>•</span>
                                                            <Calendar className="h-3.5 w-3.5" />
                                                            <span>{report.period}</span>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Badge className={cn("gap-1", typeCfg.color)} variant="outline">
                                                            {typeCfg.label}
                                                        </Badge>
                                                        <Badge variant={statusCfg.variant} className="gap-1">
                                                            <StatusIcon className="h-3 w-3" />
                                                            {statusCfg.label}
                                                        </Badge>
                                                    </div>
                                                </div>
                                                <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                                                    {report.content}
                                                </p>
                                                <div className="flex items-center justify-between mt-3">
                                                    <span className="text-xs text-muted-foreground">
                                                        Oleh {report.submitter?.name || 'Unknown'}
                                                    </span>
                                                    {report.status === 'DRAFT' && (
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                                            onClick={(e) => {
                                                                e.stopPropagation()
                                                                handleSubmit(report.id)
                                                            }}
                                                        >
                                                            <Send className="h-3.5 w-3.5" />
                                                            Submit
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            )
                        })}
                    </div>
                )}
            </div>
        </DashboardLayout>
    )
}
