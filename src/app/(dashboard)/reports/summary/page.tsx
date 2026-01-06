"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
    BarChart3,
    FileText,
    CheckCircle,
    Clock,
    AlertCircle,
    TrendingUp,
    ArrowLeft,
    RefreshCw,
    Calendar,
    Building2,
    Church,
    Users
} from "lucide-react"
import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface SummaryData {
    period: string
    stats: {
        totalReports: number
        byStatus: {
            submitted: number
            approved: number
            needsRevision: number
        }
        byType: {
            monthly: number
            quarterly: number
            annual: number
            event: number
        }
        byUnit: Record<string, number>
    }
    recentReports: Array<{
        id: string
        title: string
        unitName: string
        status: string
        submittedAt: string | null
    }>
}

// Traffic light indicators
function TrafficLight({ status }: { status: 'green' | 'yellow' | 'red' }) {
    const colors = {
        green: 'bg-green-500',
        yellow: 'bg-amber-500',
        red: 'bg-red-500'
    }
    const labels = {
        green: 'Baik',
        yellow: 'Perlu Perhatian',
        red: 'Kritis'
    }

    return (
        <div className="flex items-center gap-2">
            <div className={cn("w-4 h-4 rounded-full animate-pulse", colors[status])} />
            <span className="text-sm font-medium">{labels[status]}</span>
        </div>
    )
}

// Unit Health Card
function UnitHealthCard({
    unitType,
    count,
    total,
    icon: Icon
}: {
    unitType: string
    count: number
    total: number
    icon: React.ElementType
}) {
    // Determine health status based on report submission rate
    const rate = total > 0 ? (count / total) * 100 : 0
    const status: 'green' | 'yellow' | 'red' =
        rate >= 80 ? 'green' :
            rate >= 50 ? 'yellow' : 'red'

    const statusColors = {
        green: 'border-green-500 bg-green-50 dark:bg-green-950/30',
        yellow: 'border-amber-500 bg-amber-50 dark:bg-amber-950/30',
        red: 'border-red-500 bg-red-50 dark:bg-red-950/30'
    }

    return (
        <Card className={cn("border-l-4", statusColors[status])}>
            <CardContent className="pt-4">
                <div className="flex items-start justify-between">
                    <div>
                        <p className="text-sm text-muted-foreground">{unitType}</p>
                        <p className="text-2xl font-bold">{count}</p>
                        <p className="text-xs text-muted-foreground">laporan masuk</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                        <Icon className="h-8 w-8 text-muted-foreground/50" />
                        <TrafficLight status={status} />
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

export default function ExecutiveSummaryPage() {
    const router = useRouter()
    const [summary, setSummary] = useState<SummaryData | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [period, setPeriod] = useState("2024")

    const fetchSummary = async () => {
        setIsLoading(true)
        try {
            const response = await fetch(`/api/reports/summary?period=${period}`)
            const result = await response.json()
            if (result.success) {
                setSummary(result.data)
            }
        } catch (error) {
            console.error('Failed to fetch summary:', error)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchSummary()
    }, [period])

    // Calculate overall health
    const getOverallHealth = () => {
        if (!summary) return 'yellow'
        const { approved, submitted, needsRevision } = summary.stats.byStatus
        const total = approved + submitted + needsRevision
        if (total === 0) return 'yellow'

        const approvalRate = approved / total
        if (approvalRate >= 0.7) return 'green'
        if (approvalRate >= 0.4) return 'yellow'
        return 'red'
    }

    const overallHealth = getOverallHealth()

    // Unit icons mapping
    const unitIcons: Record<string, React.ElementType> = {
        'Paroki': Church,
        'Komisi': Users,
        'Kevikepan': Building2,
    }

    if (isLoading) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center h-96">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            </DashboardLayout>
        )
    }

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" onClick={() => router.push('/reports')}>
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold">Executive Summary</h1>
                            <p className="text-muted-foreground">Ringkasan kesehatan unit kerja</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Select value={period} onValueChange={setPeriod}>
                            <SelectTrigger className="w-32">
                                <Calendar className="h-4 w-4 mr-2" />
                                <SelectValue placeholder="Periode" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="2024">2024</SelectItem>
                                <SelectItem value="2023">2023</SelectItem>
                                <SelectItem value="Q4-2024">Q4 2024</SelectItem>
                                <SelectItem value="Q3-2024">Q3 2024</SelectItem>
                            </SelectContent>
                        </Select>
                        <Button variant="outline" size="icon" onClick={fetchSummary}>
                            <RefreshCw className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                {/* Overall Health Status */}
                <Card className={cn(
                    "border-2",
                    overallHealth === 'green' && "border-green-500 bg-green-50 dark:bg-green-950/30",
                    overallHealth === 'yellow' && "border-amber-500 bg-amber-50 dark:bg-amber-950/30",
                    overallHealth === 'red' && "border-red-500 bg-red-50 dark:bg-red-950/30"
                )}>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-bold">Status Keseluruhan Keuskupan</h2>
                                <p className="text-muted-foreground">Berdasarkan laporan periode {summary?.period}</p>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className={cn(
                                    "w-16 h-16 rounded-full flex items-center justify-center",
                                    overallHealth === 'green' && "bg-green-500",
                                    overallHealth === 'yellow' && "bg-amber-500",
                                    overallHealth === 'red' && "bg-red-500"
                                )}>
                                    {overallHealth === 'green' && <CheckCircle className="h-8 w-8 text-white" />}
                                    {overallHealth === 'yellow' && <Clock className="h-8 w-8 text-white" />}
                                    {overallHealth === 'red' && <AlertCircle className="h-8 w-8 text-white" />}
                                </div>
                                <div className="text-right">
                                    <p className="text-3xl font-bold">{summary?.stats.totalReports || 0}</p>
                                    <p className="text-sm text-muted-foreground">Total Laporan</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Stats by Status */}
                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                <Clock className="h-4 w-4" />
                                Menunggu Review
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-amber-600">{summary?.stats.byStatus.submitted || 0}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                <CheckCircle className="h-4 w-4" />
                                Disetujui
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-green-600">{summary?.stats.byStatus.approved || 0}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                <AlertCircle className="h-4 w-4" />
                                Perlu Revisi
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-red-600">{summary?.stats.byStatus.needsRevision || 0}</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Health by Unit Type */}
                <div>
                    <h3 className="text-lg font-semibold mb-4">Kesehatan per Unit Kerja</h3>
                    <div className="grid gap-4 md:grid-cols-3">
                        {Object.entries(summary?.stats.byUnit || {}).map(([unitType, count]) => (
                            <UnitHealthCard
                                key={unitType}
                                unitType={unitType}
                                count={count}
                                total={summary?.stats.totalReports || 1}
                                icon={unitIcons[unitType] || Building2}
                            />
                        ))}
                        {Object.keys(summary?.stats.byUnit || {}).length === 0 && (
                            <Card className="col-span-3">
                                <CardContent className="py-8 text-center text-muted-foreground">
                                    Belum ada data unit kerja
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>

                {/* Stats by Report Type */}
                <div>
                    <h3 className="text-lg font-semibold mb-4">Laporan per Jenis</h3>
                    <div className="grid gap-4 md:grid-cols-4">
                        <Card>
                            <CardContent className="pt-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Bulanan</p>
                                        <p className="text-2xl font-bold">{summary?.stats.byType.monthly || 0}</p>
                                    </div>
                                    <BarChart3 className="h-8 w-8 text-blue-500" />
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Triwulan</p>
                                        <p className="text-2xl font-bold">{summary?.stats.byType.quarterly || 0}</p>
                                    </div>
                                    <TrendingUp className="h-8 w-8 text-purple-500" />
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Tahunan</p>
                                        <p className="text-2xl font-bold">{summary?.stats.byType.annual || 0}</p>
                                    </div>
                                    <Calendar className="h-8 w-8 text-green-500" />
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Kegiatan</p>
                                        <p className="text-2xl font-bold">{summary?.stats.byType.event || 0}</p>
                                    </div>
                                    <FileText className="h-8 w-8 text-orange-500" />
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Recent Reports */}
                <div>
                    <h3 className="text-lg font-semibold mb-4">Laporan Terbaru</h3>
                    <Card>
                        <CardContent className="p-0">
                            {summary?.recentReports && summary.recentReports.length > 0 ? (
                                <div className="divide-y">
                                    {summary.recentReports.map((report) => (
                                        <div
                                            key={report.id}
                                            className="flex items-center justify-between p-4 hover:bg-muted/50 cursor-pointer"
                                            onClick={() => router.push(`/reports/${report.id}`)}
                                        >
                                            <div className="flex items-center gap-3">
                                                <FileText className="h-5 w-5 text-muted-foreground" />
                                                <div>
                                                    <p className="font-medium">{report.title}</p>
                                                    <p className="text-sm text-muted-foreground">{report.unitName}</p>
                                                </div>
                                            </div>
                                            <Badge variant={
                                                report.status === 'APPROVED' ? 'default' :
                                                    report.status === 'NEEDS_REVISION' ? 'destructive' :
                                                        'secondary'
                                            }>
                                                {report.status === 'APPROVED' ? 'Disetujui' :
                                                    report.status === 'NEEDS_REVISION' ? 'Revisi' :
                                                        report.status === 'SUBMITTED' ? 'Menunggu' : report.status}
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="py-8 text-center text-muted-foreground">
                                    Belum ada laporan
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </DashboardLayout>
    )
}
