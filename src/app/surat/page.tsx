"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Search, Download, Eye, Edit, Send, FileText, Calendar, User, Mail, Clock, Trash2 } from "lucide-react"
import { showSuccess, showError, confirmDelete, confirmAction } from "@/lib/alerts"
import { useJenisSurat } from "@/hooks/use-parameters"

interface Surat {
  id: string
  judul: string
  nomorSurat: string
  tujuan: string
  jenis: string
  status: string
  tanggal: string
  template?: string
  createdAt: string
  sentAt?: string
}

interface Template {
  id: string
  nama: string
  kategori: string
  deskripsi: string
  konten: string
}

// Note: Data surat fetched from API

const sampleTemplates: Template[] = [
  {
    id: "1",
    nama: "Surat Edaran",
    kategori: "Edaran",
    deskripsi: "Template untuk surat edaran keuskupan",
    konten: "KEUSKUPAN SURABAYA\\n\\nNomor: {nomor_surat}\\nTanggal: {tanggal}\\n\\nPerihal: {perihal}\\n\\nYth. {tujuan}\\n\\nDengan hormat,\\n\\n{isi_surat}\\n\\nDemikian edaran ini disampaikan untuk dapat dilaksanakan dengan penuh tanggung jawab.\\n\\nAtas perhatian dan kerjasamanya, kami ucapkan terima kasih.\\n\\nTuhan memberkati.\\n\\n\\nMgr. Agustinus Tri Budi Utomo\\nUskup Surabaya"
  },
  {
    id: "2",
    nama: "Surat Undangan",
    kategori: "Undangan",
    deskripsi: "Template untuk surat undangan rapat/pertemuan",
    konten: "KEUSKUPAN SURABAYA\\n\\nNomor: {nomor_surat}\\nTanggal: {tanggal}\\n\\nPerihal: Undangan {acara}\\n\\nYth. {tujuan}\\n\\nDengan hormat,\\n\\nBersama ini kami mengundang Saudara/i untuk menghadiri:\\n\\nAcara: {acara}\\nHari/Tanggal: {tanggal_acara}\\nWaktu: {waktu}\\nTempat: {tempat}\\n\\n{isi_surat}\\n\\nDemikian undangan ini kami sampaikan. Atas kehadiran Saudara/i kami ucapkan terima kasih.\\n\\nTuhan memberkati.\\n\\n\\nMgr. Agustinus Tri Budi Utomo\\nUskup Surabaya"
  },
  {
    id: "3",
    nama: "Surat Rekomendasi",
    kategori: "Rekomendasi",
    deskripsi: "Template untuk surat rekomendasi",
    konten: "KEUSKUPAN SURABAYA\\n\\nNomor: {nomor_surat}\\nTanggal: {tanggal}\\n\\nPerihal: Surat Rekomendasi\\n\\nYth. {tujuan}\\n\\nDengan hormat,\\n\\nBerdasarkan {alasan_rekomendasi}, dengan ini kami memberikan rekomendasi untuk {tujuan_rekomendasi}.\\n\\n{isi_surat}\\n\\nDemikian surat rekomendasi ini kami buat untuk dapat dipergunakan sebagaimana mestinya.\\n\\nTuhan memberkati.\\n\\n\\nMgr. Agustinus Tri Budi Utomo\\nUskup Surabaya"
  },
  {
    id: "4",
    nama: "Surat Persetujuan",
    kategori: "Persetujuan",
    deskripsi: "Template untuk surat persetujuan",
    konten: "KEUSKUPAN SURABAYA\\n\\nNomor: {nomor_surat}\\nTanggal: {tanggal}\\n\\nPerihal: Surat Persetujuan\\n\\nYth. {tujuan}\\n\\nDengan hormat,\\n\\nSetelah melakukan penilaian dan pertimbangan, dengan ini kami memberikan persetujuan untuk {kegiatan}.\\n\\n{isi_surat}\\n\\nDemikian surat persetujuan ini kami buat untuk dapat dilaksanakan dengan penuh tanggung jawab.\\n\\nTuhan memberkati.\\n\\n\\nMgr. Agustinus Tri Budi Utomo\\nUskup Surabaya"
  }
]

export default function SuratPage() {
  const [suratList, setSuratList] = useState<Surat[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [templates] = useState<Template[]>(sampleTemplates)
  const { parameters: jenisSuratOptions } = useJenisSurat()

  // Fetch surat data from API
  useEffect(() => {
    fetchSuratData()
  }, [])

  const fetchSuratData = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/surat', { credentials: 'include' })
      const result = await response.json()
      if (result.success) {
        // Map API response to local interface
        const mappedData = (result.data || []).map((s: any) => ({
          id: s.id,
          judul: s.judul,
          nomorSurat: s.nomor,
          tujuan: s.penerima,
          jenis: s.jenis,
          status: s.status,
          tanggal: s.tanggal,
          createdAt: s.createdAt
        }))
        setSuratList(mappedData)
      }
    } catch (error) {
      console.error('Failed to fetch surat:', error)
    } finally {
      setIsLoading(false)
    }
  }
  const [searchTerm, setSearchTerm] = useState("")
  const [filterJenis, setFilterJenis] = useState("semua")
  const [filterStatus, setFilterStatus] = useState("semua")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null)
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false)

  const filteredSurat = suratList.filter(item => {
    const matchesSearch = item.judul.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.tujuan.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesJenis = filterJenis === "semua" || item.jenis === filterJenis
    const matchesStatus = filterStatus === "semua" || item.status === filterStatus
    return matchesSearch && matchesJenis && matchesStatus
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Terkirim":
        return <Badge className="bg-green-100 text-green-800">Terkirim</Badge>
      case "Draft":
        return <Badge variant="secondary">Draft</Badge>
      case "Menunggu Tanda Tangan":
        return <Badge className="bg-yellow-100 text-yellow-800">Menunggu Tanda Tangan</Badge>
      case "Dibatalkan":
        return <Badge className="bg-red-100 text-red-800">Dibatalkan</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  const handleUseTemplate = (template: Template) => {
    setSelectedTemplate(template)
    setIsTemplateDialogOpen(false)
    setIsCreateDialogOpen(true)
  }

  const stats = {
    total: suratList.length,
    terkirim: suratList.filter(s => s.status === "Terkirim").length,
    draft: suratList.filter(s => s.status === "Draft").length,
    menunggu: suratList.filter(s => s.status === "Menunggu Tanda Tangan").length
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Surat Menyurat</h1>
            <p className="text-muted-foreground">
              Kelola surat menyurat keuskupan dengan template yang tersedia
            </p>
          </div>
          <div className="flex gap-2">
            <Dialog open={isTemplateDialogOpen} onOpenChange={setIsTemplateDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <FileText className="mr-2 h-4 w-4" />
                  Template
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl">
                <DialogHeader>
                  <DialogTitle>Pilih Template Surat</DialogTitle>
                  <DialogDescription>
                    Pilih template untuk mempercepat pembuatan surat
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    {templates.map((template) => (
                      <Card key={template.id} className="cursor-pointer hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="space-y-2">
                            <div className="flex justify-between items-start">
                              <h3 className="font-semibold">{template.nama}</h3>
                              <Badge variant="outline">{template.kategori}</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {template.deskripsi}
                            </p>
                            <Button
                              size="sm"
                              className="w-full"
                              onClick={() => handleUseTemplate(template)}
                            >
                              Gunakan Template
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Surat Baru
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl">
                <DialogHeader>
                  <DialogTitle>Buat Surat Baru</DialogTitle>
                  <DialogDescription>
                    {selectedTemplate ? `Menggunakan template: ${selectedTemplate.nama}` : "Buat surat baru dari awal"}
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="nomorSurat">Nomor Surat</Label>
                      <Input id="nomorSurat" placeholder="Contoh: SED/001/2025" />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="tanggal">Tanggal</Label>
                      <Input id="tanggal" type="date" />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="judul">Judul Surat</Label>
                    <Input id="judul" placeholder="Masukkan judul surat" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="tujuan">Tujuan</Label>
                      <Input id="tujuan" placeholder="Masukkan tujuan surat" />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="jenis">Jenis Surat</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih jenis" />
                        </SelectTrigger>
                        <SelectContent>
                          {jenisSuratOptions.map((j) => (
                            <SelectItem key={j.id} value={j.nama}>{j.nama}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="isi">Isi Surat</Label>
                    <Textarea
                      id="isi"
                      placeholder="Tuliskan isi surat..."
                      className="min-h-[300px]"
                      defaultValue={selectedTemplate?.konten}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => {
                    setIsCreateDialogOpen(false)
                    setSelectedTemplate(null)
                  }}>
                    Batal
                  </Button>
                  <Button variant="outline" onClick={() => {
                    setIsCreateDialogOpen(false)
                    setSelectedTemplate(null)
                  }}>
                    Simpan Draft
                  </Button>
                  <Button onClick={() => {
                    setIsCreateDialogOpen(false)
                    setSelectedTemplate(null)
                  }}>
                    Kirim Surat
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Surat</CardTitle>
              <Mail className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Terkirim</CardTitle>
              <Send className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.terkirim}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Draft</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.draft}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Menunggu TTD</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.menunggu}</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="surat" className="space-y-4">
          <TabsList>
            <TabsTrigger value="surat">Daftar Surat</TabsTrigger>
            <TabsTrigger value="template">Template</TabsTrigger>
          </TabsList>

          <TabsContent value="surat" className="space-y-4">
            {/* Filters */}
            <Card>
              <CardHeader>
                <CardTitle>Filter dan Pencarian</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4 items-center">
                  <div className="relative flex-1">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Cari surat..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                  <Select value={filterJenis} onValueChange={setFilterJenis}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Jenis" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="semua">Semua</SelectItem>
                      {jenisSuratOptions.map((j) => (
                        <SelectItem key={j.id} value={j.nama}>{j.nama}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="semua">Semua</SelectItem>
                      <SelectItem value="Terkirim">Terkirim</SelectItem>
                      <SelectItem value="Draft">Draft</SelectItem>
                      <SelectItem value="Menunggu Tanda Tangan">Menunggu Tanda Tangan</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Surat Table */}
            <Card>
              <CardHeader>
                <CardTitle>Daftar Surat</CardTitle>
                <CardDescription>
                  Total {filteredSurat.length} surat
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Judul Surat</TableHead>
                      <TableHead>Nomor</TableHead>
                      <TableHead>Tujuan</TableHead>
                      <TableHead>Jenis</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Tanggal</TableHead>
                      <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSurat.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            {item.judul}
                          </div>
                        </TableCell>
                        <TableCell>{item.nomorSurat}</TableCell>
                        <TableCell>{item.tujuan}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{item.jenis}</Badge>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(item.status)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            {new Date(item.tanggal).toLocaleDateString('id-ID')}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Download className="h-4 w-4" />
                            </Button>
                            {item.status === "Draft" && (
                              <Button variant="ghost" size="sm">
                                <Send className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="template" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {templates.map((template) => (
                <Card key={template.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{template.nama}</CardTitle>
                        <CardDescription>{template.deskripsi}</CardDescription>
                      </div>
                      <Badge variant="outline">{template.kategori}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="bg-muted/50 p-3 rounded-lg">
                        <p className="text-sm font-mono line-clamp-3">
                          {template.konten.substring(0, 150)}...
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          className="flex-1"
                          onClick={() => handleUseTemplate(template)}
                        >
                          <FileText className="mr-2 h-4 w-4" />
                          Gunakan Template
                        </Button>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}