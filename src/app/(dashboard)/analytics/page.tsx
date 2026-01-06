"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
    DashboardAreaChart,
    DashboardBarChart,
    DashboardPieChart,
    DashboardMultiLineChart,
    StatCardWithChart
} from "@/components/dashboard-charts"
import {
    BarChart3,
    RefreshCw,
    TrendingUp,
    Users,
    Church,
    FileText,
    MessageSquare,
    Loader2
} from "lucide-react"
import { cn } from "@/lib/utils"

interface AnalyticsData {
    overview: {
        totalImam: number
        totalParoki: number
        totalReports: number
        totalIssues: number
    }
    charts: {
        agendaTrend: { name: string; value: number }[]
        notulensiTrend: { name: string; value: number }[]
        taskDistribution: { name: string; value: number }[]
        reportByType: { name: string; value: number }[]
        reportByStatus: { name: string; value: number }[]
        issueDistribution: { name: string; value: number }[]
        weeklyActivity: { name: string; agenda: number; notulensi: number; tugas: number }[]
    }
}

export default function AnalyticsPage() {
    const [data, setData] = useState<AnalyticsData | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [period, setPeriod] = useState("6m")

    const fetchAnalytics = async () => {
        setIsLoading(true)
        try {
            const response = await fetch(`/api/analytics?period=${period}`)
            const result = await response.json()
            if (result.success) {
                setData(result.data)
            }
        } catch (error) {
            console.error('Failed to fetch analytics:', error)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchAnalytics()
    }, [period])

    if (isLoading) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center h-96">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            </DashboardLayout>
        )
    }

    // Mock trend data for stat cards
    const mockTrendData = [
        { name: 'W1', value: 10 },
        { name: 'W2', value: 15 },
        { name: 'W3', value: 12 },
        { name: 'W4', value: 18 },
        { name: 'W5', value: 22 },
        { name: 'W6', value: 20 },
        { name: 'W7', value: 25 },
        { name: 'W8', value: 28 }
    ]

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold flex items-center gap-2">
                            <BarChart3 className="h-6 w-6 text-primary" />
                            Analytics Dashboard
                        </h1>
                        <p className="text-muted-foreground">Visualisasi data keuskupan</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Select value={period} onValueChange={setPeriod}>
                            <SelectTrigger className="w-32">
                                <SelectValue placeholder="Periode" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="3m">3 Bulan</SelectItem>
                                <SelectItem value="6m">6 Bulan</SelectItem>
                                <SelectItem value="1y">1 Tahun</SelectItem>
                            </SelectContent>
                        </Select>
                        <Button variant="outline" size="icon" onClick={fetchAnalytics}>
                            <RefreshCw className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                {/* Overview Stats with Mini Charts */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <StatCardWithChart
                        title="Total Imam Aktif"
                        value={data?.overview.totalImam || 0}
                        change={5}
                        changeText="dari bulan lalu"
                        data={mockTrendData}
                        color="#3b82f6"
                    />
                    <StatCardWithChart
                        title="Total Paroki"
                        value={data?.overview.totalParoki || 0}
                        change={2}
                        changeText="baru ditambahkan"
                        data={mockTrendData}
                        color="#22c55e"
                    />
                    <StatCardWithChart
                        title="Total Laporan"
                        value={data?.overview.totalReports || 0}
                        change={12}
                        changeText="dari bulan lalu"
                        data={mockTrendData}
                        color="#8b5cf6"
                    />
                    <StatCardWithChart
                        title="Total Konsultasi"
                        value={data?.overview.totalIssues || 0}
                        change={-3}
                        changeText="dari bulan lalu"
                        data={mockTrendData}
                        color="#f59e0b"
                    />
                </div>

                {/* Activity Trend Chart */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <TrendingUp className="h-5 w-5" />
                            Tren Aktivitas Mingguan
                        </CardTitle>
                        <CardDescription>Perbandingan aktivitas 8 minggu terakhir</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {data?.charts.weeklyActivity && (
                            <DashboardMultiLineChart
                                title=""
                                data={data.charts.weeklyActivity}
                                lines={[
                                    { dataKey: 'agenda', color: '#3b82f6', name: 'Agenda' },
                                    { dataKey: 'notulensi', color: '#22c55e', name: 'Notulensi' },
                                    { dataKey: 'tugas', color: '#f59e0b', name: 'Tugas' }
                                ]}
                                height={250}
                            />
                        )}
                    </CardContent>
                </Card>

                {/* Charts Row 1 */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {/* Agenda Trend */}
                    <DashboardAreaChart
                        title="Tren Agenda"
                        description="Jumlah agenda per bulan"
                        data={data?.charts.agendaTrend || []}
                        color="#3b82f6"
                        height={180}
                    />

                    {/* Notulensi Trend */}
                    <DashboardAreaChart
                        title="Tren Notulensi"
                        description="Jumlah notulensi per bulan"
                        data={data?.charts.notulensiTrend || []}
                        color="#22c55e"
                        height={180}
                    />

                    {/* Task Distribution */}
                    <DashboardPieChart
                        title="Distribusi Tugas"
                        description="Berdasarkan status"
                        data={data?.charts.taskDistribution || []}
                        height={180}
                    />
                </div>

                {/* Charts Row 2 */}
                <div className="grid gap-4 md:grid-cols-2">
                    {/* Report by Type */}
                    <DashboardBarChart
                        title="Laporan per Jenis"
                        description="Distribusi laporan berdasarkan tipe"
                        data={data?.charts.reportByType || []}
                        color="#8b5cf6"
                        height={200}
                    />

                    {/* Report by Status */}
                    <DashboardPieChart
                        title="Status Laporan"
                        description="Distribusi berdasarkan status"
                        data={data?.charts.reportByStatus || []}
                        height={200}
                        innerRadius={50}
                    />
                </div>

                {/* Issue Distribution */}
                <div className="grid gap-4 md:grid-cols-2">
                    <DashboardPieChart
                        title="Distribusi Konsultasi"
                        description="Status konsultasi/isu"
                        data={data?.charts.issueDistribution || []}
                        height={200}
                    />

                    {/* Quick Stats */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Ringkasan Cepat</CardTitle>
                            <CardDescription>Statistik penting keuskupan</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between p-3 rounded-lg bg-blue-50 dark:bg-blue-950/30">
                                <div className="flex items-center gap-3">
                                    <Users className="h-5 w-5 text-blue-600" />
                                    <span>Imam Aktif</span>
                                </div>
                                <Badge variant="secondary" className="text-lg font-bold">
                                    {data?.overview.totalImam || 0}
                                </Badge>
                            </div>
                            <div className="flex items-center justify-between p-3 rounded-lg bg-green-50 dark:bg-green-950/30">
                                <div className="flex items-center gap-3">
                                    <Church className="h-5 w-5 text-green-600" />
                                    <span>Total Paroki</span>
                                </div>
                                <Badge variant="secondary" className="text-lg font-bold">
                                    {data?.overview.totalParoki || 0}
                                </Badge>
                            </div>
                            <div className="flex items-center justify-between p-3 rounded-lg bg-purple-50 dark:bg-purple-950/30">
                                <div className="flex items-center gap-3">
                                    <FileText className="h-5 w-5 text-purple-600" />
                                    <span>Laporan Masuk</span>
                                </div>
                                <Badge variant="secondary" className="text-lg font-bold">
                                    {data?.overview.totalReports || 0}
                                </Badge>
                            </div>
                            <div className="flex items-center justify-between p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30">
                                <div className="flex items-center gap-3">
                                    <MessageSquare className="h-5 w-5 text-amber-600" />
                                    <span>Konsultasi</span>
                                </div>
                                <Badge variant="secondary" className="text-lg font-bold">
                                    {data?.overview.totalIssues || 0}
                                </Badge>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </DashboardLayout>
    )
}
