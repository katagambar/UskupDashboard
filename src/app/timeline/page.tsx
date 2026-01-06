"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Timeline, TimelineItem, TimelineContent, TimelineDot, TimelineHeader, TimelineTitle } from "@/components/ui/timeline"
import {
  CheckCircle,
  Clock,
  AlertCircle,
  Calendar,
  FileText,
  TrendingUp,
  BarChart3,
  Download,
  Plus,
  Target,
  Users,
  DollarSign,
  Eye
} from "lucide-react"

interface Decision {
  id: string
  judul: string
  deskripsi: string
  tanggalKeputusan: string
  deadline: string
  status: string
  progress: number
  kategori: string
  penanggungJawab: string
  anggaran?: number
  milestones: Milestone[]
}

interface Milestone {
  id: string
  judul: string
  deskripsi: string
  tanggalTarget: string
  tanggalSelesai?: string
  status: string
  progress: number
}

interface Report {
  id: string
  judul: string
  periode: string
  totalKeputusan: number
  selesai: number
  dalamProses: number
  terlambat: number
  createdAt: string
}

const sampleDecisions: Decision[] = [
  {
    id: "1",
    judul: "Pembangunan Gereja Baru di Surabaya Timur",
    deskripsi: "Pembangunan gereja baru untuk melayani umat di wilayah Surabaya Timur",
    tanggalKeputusan: "2024-12-01",
    deadline: "2025-06-30",
    status: "Dalam Proses",
    progress: 65,
    kategori: "Pembangunan",
    penanggungJawab: "Komisi Pembangunan",
    anggaran: 2500000000,
    milestones: [
      {
        id: "1",
        judul: "Perizinan dan Dokumentasi",
        deskripsi: "Pengurusan IMB dan perizinan lainnya",
        tanggalTarget: "2024-12-31",
        tanggalSelesai: "2024-12-28",
        status: "Selesai",
        progress: 100
      },
      {
        id: "2",
        judul: "Pekerjaan Fondasi",
        deskripsi: "Pembangunan fondasi gereja",
        tanggalTarget: "2025-02-28",
        tanggalSelesai: "2025-02-25",
        status: "Selesai",
        progress: 100
      },
      {
        id: "3",
        judul: "Pembangunan Struktur",
        deskripsi: "Pembangunan struktur utama gereja",
        tanggalTarget: "2025-04-30",
        status: "Dalam Proses",
        progress: 70
      },
      {
        id: "4",
        judul: "Finishing dan Interior",
        deskripsi: "Pekerjaan finishing dan interior gereja",
        tanggalTarget: "2025-06-30",
        status: "Menunggu",
        progress: 0
      }
    ]
  },
  {
    id: "2",
    judul: "Program Pastoral Digital",
    deskripsi: "Pengembangan sistem pastoral digital untuk seluruh paroki",
    tanggalKeputusan: "2024-11-15",
    deadline: "2025-03-31",
    status: "Dalam Proses",
    progress: 80,
    kategori: "Pastoral",
    penanggungJawab: "Komisi Pastoral",
    anggaran: 500000000,
    milestones: [
      {
        id: "5",
        judul: "Analisis Kebutuhan",
        deskripsi: "Analisis kebutuhan sistem pastoral digital",
        tanggalTarget: "2024-12-15",
        tanggalSelesai: "2024-12-10",
        status: "Selesai",
        progress: 100
      },
      {
        id: "6",
        judul: "Pengembangan Sistem",
        deskripsi: "Pengembangan aplikasi pastoral digital",
        tanggalTarget: "2025-02-28",
        status: "Dalam Proses",
        progress: 85
      },
      {
        id: "7",
        judul: "Pelatihan dan Sosialisasi",
        deskripsi: "Pelatihan penggunaan sistem pastoral digital",
        tanggalTarget: "2025-03-31",
        status: "Menunggu",
        progress: 0
      }
    ]
  },
  {
    id: "3",
    judul: "Renovasi Pastoran Uskup",
    deskripsi: "Renovasi pastoran uskup untuk meningkatkan kenyamanan",
    tanggalKeputusan: "2024-10-01",
    deadline: "2025-01-31",
    status: "Terlambat",
    progress: 90,
    kategori: "Pembangunan",
    penanggungJawab: "Komisi Keuangan",
    anggaran: 300000000,
    milestones: [
      {
        id: "8",
        judul: "Perencanaan Desain",
        deskripsi: "Perencanaan desain renovasi",
        tanggalTarget: "2024-10-31",
        tanggalSelesai: "2024-10-25",
        status: "Selesai",
        progress: 100
      },
      {
        id: "9",
        judul: "Pekerjaan Renovasi",
        deskripsi: "Pelaksanaan renovasi pastoran",
        tanggalTarget: "2025-01-15",
        status: "Dalam Proses",
        progress: 90
      }
    ]
  }
]

const sampleReports: Report[] = [
  {
    id: "1",
    judul: "Laporan Pelaksanaan Keputusan Januari 2025",
    periode: "Januari 2025",
    totalKeputusan: 12,
    selesai: 3,
    dalamProses: 7,
    terlambat: 2,
    createdAt: "2025-01-31T16:00:00Z"
  },
  {
    id: "2",
    judul: "Laporan Pelaksanaan Keputusan Desember 2024",
    periode: "Desember 2024",
    totalKeputusan: 10,
    selesai: 4,
    dalamProses: 5,
    terlambat: 1,
    createdAt: "2024-12-31T16:00:00Z"
  }
]

export default function TimelinePage() {
  const [decisions, setDecisions] = useState<Decision[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [reports] = useState<Report[]>(sampleReports)
  const [selectedDecision, setSelectedDecision] = useState<Decision | null>(null)
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false)

  // Fetch decisions from API
  useEffect(() => {
    fetchDecisions()
  }, [])

  const fetchDecisions = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/decisions', { credentials: 'include' })
      const result = await response.json()
      if (result.success && result.data) {
        // Map API response and add default milestones
        const mappedData = result.data.map((d: any) => ({
          id: d.id,
          judul: d.judul,
          deskripsi: d.deskripsi,
          tanggalKeputusan: d.createdAt?.split('T')[0] || '',
          deadline: d.targetDate,
          status: d.status,
          progress: d.progress || 0,
          kategori: d.kategori,
          penanggungJawab: d.penanggungJawab,
          anggaran: 0,
          milestones: [] // Milestones can be added later
        }))
        setDecisions(mappedData)
      }
    } catch (error) {
      console.error('Failed to fetch decisions:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Selesai":
        return <Badge className="bg-green-100 text-green-800">Selesai</Badge>
      case "Dalam Proses":
        return <Badge className="bg-blue-100 text-blue-800">Dalam Proses</Badge>
      case "Menunggu":
        return <Badge variant="outline">Menunggu</Badge>
      case "Terlambat":
        return <Badge className="bg-red-100 text-red-800">Terlambat</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  const getMilestoneIcon = (status: string) => {
    switch (status) {
      case "Selesai":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "Dalam Proses":
        return <Clock className="h-4 w-4 text-blue-500" />
      case "Menunggu":
        return <AlertCircle className="h-4 w-4 text-gray-500" />
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />
    }
  }

  const stats = {
    total: decisions.length,
    selesai: decisions.filter(d => d.status === "Selesai").length,
    dalamProses: decisions.filter(d => d.status === "Dalam Proses").length,
    terlambat: decisions.filter(d => d.status === "Terlambat").length,
    totalAnggaran: decisions.reduce((sum, d) => sum + (d.anggaran || 0), 0)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount)
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Timeline & Report</h1>
            <p className="text-muted-foreground">
              Pantau pelaksanaan keputusan dan rancangan program keuskupan
            </p>
          </div>
          <div className="flex gap-2">
            <Dialog open={isReportDialogOpen} onOpenChange={setIsReportDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <BarChart3 className="mr-2 h-4 w-4" />
                  Buat Laporan
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Buat Laporan Baru</DialogTitle>
                  <DialogDescription>
                    Generate laporan pelaksanaan keputusan
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="judul">Judul Laporan</Label>
                    <Input id="judul" placeholder="Masukkan judul laporan" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="periode">Periode</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih periode" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="januari-2025">Januari 2025</SelectItem>
                        <SelectItem value="desember-2024">Desember 2024</SelectItem>
                        <SelectItem value="november-2024">November 2024</SelectItem>
                        <SelectItem value="oktober-2024">Oktober 2024</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="deskripsi">Deskripsi</Label>
                    <Textarea
                      id="deskripsi"
                      placeholder="Tuliskan deskripsi laporan..."
                      className="min-h-[100px]"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsReportDialogOpen(false)}>
                    Batal
                  </Button>
                  <Button onClick={() => setIsReportDialogOpen(false)}>
                    Generate Laporan
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Keputusan</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Selesai</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.selesai}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Dalam Proses</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.dalamProses}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Terlambat</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.terlambat}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Anggaran</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.totalAnggaran)}</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="timeline" className="space-y-4">
          <TabsList>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
            <TabsTrigger value="progress">Progress</TabsTrigger>
            <TabsTrigger value="reports">Laporan</TabsTrigger>
          </TabsList>

          <TabsContent value="timeline" className="space-y-4">
            <div className="grid gap-6">
              {decisions.map((decision) => (
                <Card key={decision.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{decision.judul}</CardTitle>
                        <CardDescription>{decision.deskripsi}</CardDescription>
                      </div>
                      <div className="flex gap-2">
                        {getStatusBadge(decision.status)}
                        <Badge variant="outline">{decision.kategori}</Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between text-sm">
                        <span>Progress Keseluruhan</span>
                        <span className="text-muted-foreground">{decision.progress}%</span>
                      </div>
                      <Progress
                        value={decision.progress}
                        className={`h-2 ${decision.progress >= 80
                            ? '[&>div]:bg-gradient-to-r [&>div]:from-green-500 [&>div]:to-green-600'
                            : decision.progress >= 50
                              ? '[&>div]:bg-gradient-to-r [&>div]:from-blue-500 [&>div]:to-blue-600'
                              : decision.progress >= 25
                                ? '[&>div]:bg-gradient-to-r [&>div]:from-yellow-500 [&>div]:to-orange-500'
                                : '[&>div]:bg-gradient-to-r [&>div]:from-red-500 [&>div]:to-red-600'
                          }`}
                      />

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Tanggal Keputusan:</span>
                          <p className="font-medium">
                            {new Date(decision.tanggalKeputusan).toLocaleDateString('id-ID')}
                          </p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Deadline:</span>
                          <p className="font-medium">
                            {new Date(decision.deadline).toLocaleDateString('id-ID')}
                          </p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Penanggung Jawab:</span>
                          <p className="font-medium">{decision.penanggungJawab}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Anggaran:</span>
                          <p className="font-medium">
                            {decision.anggaran ? formatCurrency(decision.anggaran) : '-'}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <h4 className="font-semibold">Milestones:</h4>
                        <div className="space-y-2">
                          {decision.milestones.map((milestone) => (
                            <div key={milestone.id} className="flex items-center gap-3 p-3 border rounded-lg">
                              {getMilestoneIcon(milestone.status)}
                              <div className="flex-1">
                                <div className="flex items-center justify-between">
                                  <p className="font-medium text-sm">{milestone.judul}</p>
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs text-muted-foreground">
                                      Target: {new Date(milestone.tanggalTarget).toLocaleDateString('id-ID')}
                                    </span>
                                    {getStatusBadge(milestone.status)}
                                  </div>
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {milestone.deskripsi}
                                </p>
                                <div className="mt-2">
                                  <div className="flex items-center justify-between text-xs">
                                    <span>Progress</span>
                                    <span>{milestone.progress}%</span>
                                  </div>
                                  <Progress
                                    value={milestone.progress}
                                    className={`h-1 mt-1 ${milestone.progress >= 80
                                        ? '[&>div]:bg-gradient-to-r [&>div]:from-green-500 [&>div]:to-green-600'
                                        : milestone.progress >= 50
                                          ? '[&>div]:bg-gradient-to-r [&>div]:from-blue-500 [&>div]:to-blue-600'
                                          : milestone.progress >= 25
                                            ? '[&>div]:bg-gradient-to-r [&>div]:from-yellow-500 [&>div]:to-orange-500'
                                            : '[&>div]:bg-gradient-to-r [&>div]:from-red-500 [&>div]:to-red-600'
                                      }`}
                                  />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="flex justify-end">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedDecision(decision)
                            setIsDetailDialogOpen(true)
                          }}
                        >
                          Lihat Detail
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="progress" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Progress Overview</CardTitle>
                <CardDescription>
                  Ringkasan progress semua keputusan
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {decisions.map((decision) => (
                    <div key={decision.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{decision.judul}</h4>
                          {getStatusBadge(decision.status)}
                        </div>
                        <span className="text-sm text-muted-foreground">{decision.progress}%</span>
                      </div>
                      <Progress
                        value={decision.progress}
                        className={`h-3 ${decision.progress >= 80
                            ? '[&>div]:bg-gradient-to-r [&>div]:from-green-500 [&>div]:to-green-600'
                            : decision.progress >= 50
                              ? '[&>div]:bg-gradient-to-r [&>div]:from-blue-500 [&>div]:to-blue-600'
                              : decision.progress >= 25
                                ? '[&>div]:bg-gradient-to-r [&>div]:from-yellow-500 [&>div]:to-orange-500'
                                : '[&>div]:bg-gradient-to-r [&>div]:from-red-500 [&>div]:to-red-600'
                          }`}
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="space-y-4">
            <div className="grid gap-4">
              {reports.map((report) => (
                <Card key={report.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{report.judul}</CardTitle>
                        <CardDescription>Periode: {report.periode}</CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold">{report.totalKeputusan}</div>
                        <p className="text-sm text-muted-foreground">Total Keputusan</p>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">{report.selesai}</div>
                        <p className="text-sm text-muted-foreground">Selesai</p>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{report.dalamProses}</div>
                        <p className="text-sm text-muted-foreground">Dalam Proses</p>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-red-600">{report.terlambat}</div>
                        <p className="text-sm text-muted-foreground">Terlambat</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Detail Dialog */}
        <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>{selectedDecision?.judul}</DialogTitle>
              <DialogDescription>
                Detail pelaksanaan keputusan
              </DialogDescription>
            </DialogHeader>
            {selectedDecision && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Tanggal Keputusan</Label>
                    <p className="font-medium">
                      {new Date(selectedDecision.tanggalKeputusan).toLocaleDateString('id-ID')}
                    </p>
                  </div>
                  <div>
                    <Label>Deadline</Label>
                    <p className="font-medium">
                      {new Date(selectedDecision.deadline).toLocaleDateString('id-ID')}
                    </p>
                  </div>
                  <div>
                    <Label>Penanggung Jawab</Label>
                    <p className="font-medium">{selectedDecision.penanggungJawab}</p>
                  </div>
                  <div>
                    <Label>Anggaran</Label>
                    <p className="font-medium">
                      {selectedDecision.anggaran ? formatCurrency(selectedDecision.anggaran) : '-'}
                    </p>
                  </div>
                </div>

                <div>
                  <Label>Deskripsi</Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    {selectedDecision.deskripsi}
                  </p>
                </div>

                <div>
                  <Label>Progress Keseluruhan</Label>
                  <div className="mt-2">
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span>Progress</span>
                      <span>{selectedDecision.progress}%</span>
                    </div>
                    <Progress value={selectedDecision.progress} className="h-2" />
                  </div>
                </div>

                <div>
                  <Label>Milestones</Label>
                  <div className="mt-2 space-y-3">
                    {selectedDecision.milestones.map((milestone) => (
                      <div key={milestone.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {getMilestoneIcon(milestone.status)}
                            <h4 className="font-medium">{milestone.judul}</h4>
                          </div>
                          {getStatusBadge(milestone.status)}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {milestone.deskripsi}
                        </p>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Target:</span>
                            <p className="font-medium">
                              {new Date(milestone.tanggalTarget).toLocaleDateString('id-ID')}
                            </p>
                          </div>
                          {milestone.tanggalSelesai && (
                            <div>
                              <span className="text-muted-foreground">Selesai:</span>
                              <p className="font-medium">
                                {new Date(milestone.tanggalSelesai).toLocaleDateString('id-ID')}
                              </p>
                            </div>
                          )}
                        </div>
                        <div className="mt-2">
                          <div className="flex items-center justify-between text-sm">
                            <span>Progress</span>
                            <span>{milestone.progress}%</span>
                          </div>
                          <Progress
                            value={milestone.progress}
                            className={`h-1 mt-1 ${milestone.progress >= 80
                                ? '[&>div]:bg-gradient-to-r [&>div]:from-green-500 [&>div]:to-green-600'
                                : milestone.progress >= 50
                                  ? '[&>div]:bg-gradient-to-r [&>div]:from-blue-500 [&>div]:to-blue-600'
                                  : milestone.progress >= 25
                                    ? '[&>div]:bg-gradient-to-r [&>div]:from-yellow-500 [&>div]:to-orange-500'
                                    : '[&>div]:bg-gradient-to-r [&>div]:from-red-500 [&>div]:to-red-600'
                              }`}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}