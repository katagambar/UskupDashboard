"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useCurrentUser } from "@/hooks/useAuth"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { CalendarDays, CheckCircle, Clock, FileText, Users, AlertCircle, TrendingUp, Target, BarChart3, ArrowUp, ArrowDown } from "lucide-react"
import { showError } from "@/lib/alerts"
import { getTimeGreeting, formatDate, getDateString, DateRanges, isWithinRange } from "@/lib/dateUtils"
import type { AgendaItem, TaskItem, NotulensiItem, ImamItem, DecisionItem } from "@/types"

interface DashboardData {
  agenda: AgendaItem[]
  tasks: TaskItem[]
  notulensi: NotulensiItem[]
  imam: ImamItem[]
  decisions: DecisionItem[]
}

export default function Dashboard() {
  const { user, isAuthenticated, isLoading } = useCurrentUser()
  const router = useRouter()
  const [data, setData] = useState<DashboardData>({
    agenda: [],
    tasks: [],
    notulensi: [],
    imam: [],
    decisions: []
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/auth/signin")
    } else if (isAuthenticated) {
      fetchDashboardData()
    }
  }, [isLoading, isAuthenticated, router])

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      
      // Use optimized single API endpoint with caching
      const response = await fetch('/api/dashboard', {
        headers: {
          'Cache-Control': 'no-cache'
        }
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const dashboardData = await response.json()
      
      // Transform the response to match existing data structure
      setData({
        agenda: dashboardData.recentAgenda || [],
        tasks: dashboardData.urgentTasks || [],
        notulensi: dashboardData.pendingNotulensi || [],
        imam: [], // Imam data is not needed in main dashboard display
        decisions: [] // Decision data is not needed in main dashboard display
      })
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      showError('Gagal memuat data dashboard')
    } finally {
      setLoading(false)
    }
  }

  // Calculate stats using date utilities (more efficient and timezone-aware)
  const todayRange = DateRanges.today()
  const stats = data ? {
    agendaToday: data.agenda.filter(item => {
      const itemDate = new Date(item.tanggal)
      return isWithinRange(itemDate, todayRange.start, todayRange.end)
    }).length,
    tasksActive: data.tasks.filter(task => task.status !== 'Selesai').length,
    highPriorityTasks: data.tasks.filter(task => 
      task.status !== 'Selesai' && task.prioritas === 'Tinggi'
    ).length,
    approvedNotulensi: data.notulensi.filter(item => item.status === 'Disetujui').length,
    activeImam: 0 // Will be updated when needed
  } : {
    agendaToday: 0,
    tasksActive: 0,
    highPriorityTasks: 0,
    approvedNotulensi: 0,
    activeImam: 0
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard Uskup Surabaya</h1>
          <p className="text-muted-foreground">
            {getTimeGreeting()}, {user?.name || 'Pengguna'}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pertemuan Hari Ini</CardTitle>
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.agendaToday}</div>
              <p className="text-xs text-muted-foreground">
                {data.agenda.filter(a => a.jenis === 'Kuria').length} kuria, {data.agenda.filter(a => a.jenis === 'Pastoral').length} pastoral
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tugas Aktif</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.tasksActive}</div>
              <p className="text-xs text-muted-foreground">
                {stats.highPriorityTasks} prioritas tinggi
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Notulensi Bulan Ini</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.approvedNotulensi}</div>
              <p className="text-xs text-muted-foreground">
                sudah disetujui
              </p>
              <div className="mt-2">
                <Button variant="outline" size="sm" asChild className="w-full">
                  <a href="/notulensi">Lihat Semua</a>
                </Button>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Database Imam</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeImam}</div>
              <p className="text-xs text-muted-foreground">
                Total imam aktif
              </p>
              <div className="mt-2">
                <Button variant="outline" size="sm" asChild className="w-full">
                  <a href="/database-imam">Lihat Database</a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Additional Stats Row */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Surat Menyurat</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">-</div>
              <p className="text-xs text-muted-foreground">
                Data belum tersedia
              </p>
              <div className="mt-2">
                <Button variant="outline" size="sm" asChild className="w-full">
                  <a href="/surat">Lihat Semua</a>
                </Button>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Keputusan Aktif</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.decisions.length}</div>
              <p className="text-xs text-muted-foreground">
                {data.decisions.filter(d => d.status === 'Selesai').length} selesai, {data.decisions.filter(d => d.status === 'Tertunda').length} tertunda
              </p>
              <div className="mt-2">
                <Button variant="outline" size="sm" asChild className="w-full">
                  <a href="/timeline">Lihat Timeline</a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Agenda Hari Ini */}
          <Card className="col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Agenda Hari Ini</CardTitle>
                <Button variant="outline" size="sm" asChild>
                  <a href="/agenda">Lihat Semua Agenda</a>
                </Button>
              </div>
              <CardDescription>
                Rabu, 15 Januari 2025
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-4 rounded-md border p-4">
                <div className="shrink-0">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium leading-none">
                    Rapat Kuria
                  </p>
                  <p className="text-sm text-muted-foreground">
                    09:00 - 11:00 • Ruang Rapat Uskup
                  </p>
                </div>
                <Badge variant="secondary">Kuria</Badge>
              </div>
              <div className="flex items-center space-x-4 rounded-md border p-4">
                <div className="shrink-0">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium leading-none">
                    Audiensi dengan Pastor Paroki
                  </p>
                  <p className="text-sm text-muted-foreground">
                    13:00 - 14:30 • Ruang Tamu Uskup
                  </p>
                </div>
                <Badge variant="outline">Pastoral</Badge>
              </div>
              <div className="flex items-center space-x-4 rounded-md border p-4">
                <div className="shrink-0">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium leading-none">
                    Rapat Komisi Keuangan
                  </p>
                  <p className="text-sm text-muted-foreground">
                    15:00 - 16:30 • Ruang Rapat Keuangan
                  </p>
                </div>
                <Badge variant="secondary">Kuria</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Tugas Prioritas */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Tugas Prioritas</CardTitle>
                <Button variant="outline" size="sm" asChild>
                  <a href="/tasks">Lihat Semua Tugas</a>
                </Button>
              </div>
              <CardDescription>
                Tugas yang perlu segera diselesaikan
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Review proposal gereja baru</span>
                    <span className="text-muted-foreground">80%</span>
                  </div>
                  <Progress value={80} className="h-2 [&>div]:bg-gradient-to-r [&>div]:from-blue-500 [&>div]:to-blue-600" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Pastoral visitasi Paroki X</span>
                    <span className="text-muted-foreground">45%</span>
                  </div>
                  <Progress value={45} className="h-2 [&>div]:bg-gradient-to-r [&>div]:from-yellow-500 [&>div]:to-orange-500" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Surat edaran Advent</span>
                    <span className="text-muted-foreground">90%</span>
                  </div>
                  <Progress value={90} className="h-2 [&>div]:bg-gradient-to-r [&>div]:from-green-500 [&>div]:to-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Timeline & Report Recap */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Recent Decisions */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Keputusan Terkini
                </CardTitle>
                <Button variant="outline" size="sm" asChild>
                  <a href="/timeline">Lihat Semua</a>
                </Button>
              </div>
              <CardDescription>
                Progress keputusan penting keuskupan
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-sm">Pembangunan Gereja Baru</p>
                    <p className="text-xs text-muted-foreground">Target: Jun 2025</p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-sm font-medium">
                      <span>65%</span>
                      <ArrowUp className="h-3 w-3 text-green-500" />
                    </div>
                    <Progress value={65} className="h-2 w-20 mt-1 [&>div]:bg-gradient-to-r [&>div]:from-blue-500 [&>div]:to-blue-600" />
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-sm">Program Digital Pastoral</p>
                    <p className="text-xs text-muted-foreground">Target: Mar 2025</p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-sm font-medium">
                      <span>80%</span>
                      <ArrowUp className="h-3 w-3 text-green-500" />
                    </div>
                    <Progress value={80} className="h-2 w-20 mt-1 [&>div]:bg-gradient-to-r [&>div]:from-purple-500 [&>div]:to-purple-600" />
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-sm">Renovasi Pastoran</p>
                    <p className="text-xs text-muted-foreground">Target: Jan 2025</p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-sm font-medium">
                      <span>90%</span>
                      <ArrowUp className="h-3 w-3 text-green-500" />
                    </div>
                    <Progress value={90} className="h-2 w-20 mt-1 [&>div]:bg-gradient-to-r [&>div]:from-orange-500 [&>div]:to-red-500" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Monthly Report Summary */}
            <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Laporan Bulanan
                </CardTitle>
                <Button variant="outline" size="sm" asChild>
                  <a href="/timeline">Detail Laporan</a>
                </Button>
              </div>
              <CardDescription>
                Ringkasan eksekusi keputusan Januari 2025
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">12</div>
                  <p className="text-xs text-muted-foreground">Total Keputusan</p>
                </div>
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">3</div>
                  <p className="text-xs text-muted-foreground">Selesai</p>
                </div>
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">7</div>
                  <p className="text-xs text-muted-foreground">Dalam Proses</p>
                </div>
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">2</div>
                  <p className="text-xs text-muted-foreground">Terlambat</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Progress Keseluruhan</span>
                  <span className="font-medium">58%</span>
                </div>
                <Progress value={58} className="h-3 [&>div]:bg-gradient-to-r [&>div]:from-green-500 [&>div]:via-yellow-500 [&>div]:to-red-500" />
              </div>

              <div className="flex items-center justify-between p-2 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium">Tingkat Penyelesaian</span>
                </div>
                <span className="text-sm font-bold text-blue-600">+15% dari bulan lalu</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Aksi Cepat</CardTitle>
            <CardDescription>
              Akses cepat ke fitur yang sering digunakan
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div className="flex items-center space-x-4 rounded-md border p-4 hover:bg-muted/50 cursor-pointer transition-colors">
                <FileText className="h-8 w-8 text-primary" />
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium leading-none">
                    Buat Notulensi
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Tambah notulensi pertemuan
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-4 rounded-md border p-4 hover:bg-muted/50 cursor-pointer transition-colors">
                <CalendarDays className="h-8 w-8 text-primary" />
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium leading-none">
                    Tambah Agenda
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Jadwalkan pertemuan baru
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-4 rounded-md border p-4 hover:bg-muted/50 cursor-pointer transition-colors">
                <CheckCircle className="h-8 w-8 text-primary" />
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium leading-none">
                    Tugas Baru
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Tambah tugas uskup
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-4 rounded-md border p-4 hover:bg-muted/50 cursor-pointer transition-colors">
                <Users className="h-8 w-8 text-primary" />
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium leading-none">
                    Database Imam
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Akses data para imam
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}