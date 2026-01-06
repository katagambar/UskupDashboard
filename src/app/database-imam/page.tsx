"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Users,
  ExternalLink,
  Search,
  Church,
  Phone,
  Mail,
  Calendar,
  UserCheck,
  BookOpen,
  RefreshCw,
  Loader2,
  AlertCircle,
  Info
} from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface Imam {
  id: string
  nama: string
  paroki: string
  jabatan: string
  status: string
  tanggalTahbisan: string
  nomorTelepon: string | null
  email: string | null
}

export default function DatabaseImamPage() {
  const [imamList, setImamList] = useState<Imam[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("semua")
  const [lastSync, setLastSync] = useState<Date | null>(null)
  const [syncError, setSyncError] = useState<string | null>(null)

  // Fetch imam data from local cache (synced from external API)
  useEffect(() => {
    fetchImamData()
  }, [])

  const fetchImamData = async () => {
    try {
      setIsLoading(true)
      setSyncError(null)
      const response = await fetch('/api/imam', { credentials: 'include' })
      const result = await response.json()
      if (result.success) {
        setImamList(result.data || [])
        setLastSync(new Date())
      } else {
        setSyncError('Gagal memuat data dari cache lokal')
      }
    } catch (error) {
      console.error('Failed to fetch imam:', error)
      setSyncError('Gagal terhubung ke server')
    } finally {
      setIsLoading(false)
    }
  }

  // Refresh/sync data from external API
  const handleRefresh = async () => {
    setIsRefreshing(true)
    // In the future, this would trigger sync from external Pororomo API
    await fetchImamData()
    setIsRefreshing(false)
  }

  // Filter imam
  const filteredImam = imamList.filter(item => {
    const matchesSearch = item.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.paroki.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.jabatan.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === "semua" || item.status === filterStatus
    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Aktif":
        return <Badge className="bg-green-100 text-green-800">Aktif</Badge>
      case "Cuti":
        return <Badge className="bg-yellow-100 text-yellow-800">Cuti</Badge>
      case "Pensiun":
        return <Badge className="bg-gray-100 text-gray-800">Pensiun</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const stats = {
    total: imamList.length,
    aktif: imamList.filter(i => i.status === "Aktif").length,
    cuti: imamList.filter(i => i.status === "Cuti").length,
    pensiun: imamList.filter(i => i.status === "Pensiun").length
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Database Imam</h1>
            <p className="text-muted-foreground">
              Data imam tersinkronisasi dari sistem Pororomo
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              {isRefreshing ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="mr-2 h-4 w-4" />
              )}
              Sinkronkan
            </Button>
            <Button
              onClick={() => window.open("https://pororomo.komunio.org/admin/login", "_blank")}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              Kelola di Pororomo
            </Button>
          </div>
        </div>

        {/* Info Alert */}
        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>Sumber Data Eksternal</AlertTitle>
          <AlertDescription>
            Data imam disinkronisasi dari <strong>Database Pororomo</strong>.
            Untuk menambah, mengubah, atau menghapus data imam, silakan akses sistem Pororomo secara langsung.
            {lastSync && (
              <span className="block mt-1 text-sm text-muted-foreground">
                Terakhir sinkronisasi: {lastSync.toLocaleString('id-ID')}
              </span>
            )}
          </AlertDescription>
        </Alert>

        {syncError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{syncError}</AlertDescription>
          </Alert>
        )}

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Imam</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Aktif</CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.aktif}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cuti</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.cuti}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pensiun</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-600">{stats.pensiun}</div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter */}
        <Card>
          <CardHeader>
            <CardTitle>Pencarian dan Filter</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 items-center">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cari nama imam, paroki, atau jabatan..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-input bg-background rounded-md text-sm"
                aria-label="Filter Status"
              >
                <option value="semua">Semua Status</option>
                <option value="Aktif">Aktif</option>
                <option value="Cuti">Cuti</option>
                <option value="Pensiun">Pensiun</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Imam Table */}
        <Card>
          <CardHeader>
            <CardTitle>Data Imam</CardTitle>
            <CardDescription>
              Data tersinkronisasi dari Database Pororomo (read-only)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin" />
                <span className="ml-2">Memuat data...</span>
              </div>
            ) : filteredImam.length === 0 ? (
              <div className="text-center py-12">
                {imamList.length === 0 ? (
                  <div className="space-y-4">
                    <div className="inline-flex items-center justify-center p-4 rounded-full bg-yellow-100 dark:bg-yellow-900/30">
                      <AlertCircle className="h-8 w-8 text-yellow-600 dark:text-yellow-500" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">Data Imam Belum Tersinkron</h3>
                      <p className="text-muted-foreground max-w-md mx-auto mt-2">
                        Data imam akan diambil dari sistem Pororomo. Konfigurasi koneksi API di halaman Pengaturan untuk memulai sinkronisasi.
                      </p>
                    </div>
                    <div className="flex justify-center gap-2">
                      <Button variant="outline" onClick={() => window.location.href = '/settings?tab=sync'}>
                        Konfigurasi Sinkronisasi
                      </Button>
                      <Button onClick={handleRefresh} disabled={isRefreshing}>
                        {isRefreshing ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <RefreshCw className="mr-2 h-4 w-4" />
                        )}
                        Coba Sinkronkan
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-muted-foreground">
                    Tidak ada data yang cocok dengan filter pencarian.
                  </div>
                )}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nama</TableHead>
                    <TableHead>Paroki</TableHead>
                    <TableHead>Jabatan</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Tahbisan</TableHead>
                    <TableHead>Kontak</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredImam.map((imam) => (
                    <TableRow key={imam.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          {imam.nama}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Church className="h-4 w-4 text-muted-foreground" />
                          {imam.paroki}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{imam.jabatan}</Badge>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(imam.status)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          {new Date(imam.tanggalTahbisan).toLocaleDateString('id-ID')}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {imam.nomorTelepon && (
                            <div className="flex items-center gap-1 text-sm">
                              <Phone className="h-3 w-3 text-muted-foreground" />
                              {imam.nomorTelepon}
                            </div>
                          )}
                          {imam.email && (
                            <div className="flex items-center gap-1 text-sm">
                              <Mail className="h-3 w-3 text-muted-foreground" />
                              {imam.email}
                            </div>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Quick Access Links */}
        <Card>
          <CardHeader>
            <CardTitle>Akses Sistem Pororomo</CardTitle>
            <CardDescription>
              Kelola data imam melalui sistem resmi
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div
                className="flex items-center space-x-4 rounded-md border p-4 hover:bg-muted/50 cursor-pointer transition-colors"
                onClick={() => window.open("https://pororomo.komunio.org/admin/login", "_blank")}
              >
                <Users className="h-8 w-8 text-blue-600" />
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium leading-none">Database Imam</p>
                  <p className="text-sm text-muted-foreground">Kelola data imam</p>
                </div>
                <ExternalLink className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="flex items-center space-x-4 rounded-md border p-4 hover:bg-muted/50 cursor-pointer transition-colors">
                <Church className="h-8 w-8 text-purple-600" />
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium leading-none">Data Paroki</p>
                  <p className="text-sm text-muted-foreground">Informasi paroki</p>
                </div>
                <ExternalLink className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="flex items-center space-x-4 rounded-md border p-4 hover:bg-muted/50 cursor-pointer transition-colors">
                <BookOpen className="h-8 w-8 text-green-600" />
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium leading-none">Laporan</p>
                  <p className="text-sm text-muted-foreground">Statistik dan laporan</p>
                </div>
                <ExternalLink className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}