"use client"
// Cache buster: 2026-01-10-v1

import { useState, useEffect, useCallback } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Search, Download, Eye, Edit, Send, FileText, Calendar, Mail, Clock, Trash2, RefreshCw, Hash, AlertCircle, Paperclip, X } from "lucide-react"
import { showSuccess, showError, confirmDelete, confirmAction } from "@/lib/alerts"
// import { useKodeKearsipan } from "@/hooks/use-parameters"
import { KODE_KEARSIPAN, getGKodeOptions } from "@/lib/surat-numbering"
import { RichTextEditor } from "@/components/ui/rich-text-editor"

interface Surat {
  id: string
  judul: string
  nomorSurat: string
  tujuan: string
  jenis: string
  status: string
  tanggal: string
  isi?: string
  lampiran?: string // Metadata lampiran dalam format JSON string

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
    konten: "KEUSKUPAN SURABAYA\n\nNomor: {nomor_surat}\nTanggal: {tanggal}\n\nPerihal: {perihal}\n\nYth. {tujuan}\n\nDengan hormat,\n\n{isi_surat}\n\nDemikian edaran ini disampaikan untuk dapat dilaksanakan dengan penuh tanggung jawab.\n\nAtas perhatian dan kerjasamanya, kami ucapkan terima kasih.\n\nTuhan memberkati.\n\n\n{nama_uskup}\n{jabatan_uskup}"
  },
  {
    id: "2",
    nama: "Surat Undangan",
    kategori: "Undangan",
    deskripsi: "Template untuk surat undangan rapat/pertemuan",
    konten: "KEUSKUPAN SURABAYA\n\nNomor: {nomor_surat}\nTanggal: {tanggal}\n\nPerihal: Undangan {acara}\n\nYth. {tujuan}\n\nDengan hormat,\n\nBersama ini kami mengundang Saudara/i untuk menghadiri:\n\nAcara: {acara}\nHari/Tanggal: {tanggal_acara}\nWaktu: {waktu}\nTempat: {tempat}\n\n{isi_surat}\n\nDemikian undangan ini kami sampaikan. Atas kehadiran Saudara/i kami ucapkan terima kasih.\n\nTuhan memberkati.\n\n\n{nama_uskup}\n{jabatan_uskup}"
  },
  {
    id: "3",
    nama: "Surat Rekomendasi",
    kategori: "Rekomendasi",
    deskripsi: "Template untuk surat rekomendasi",
    konten: "KEUSKUPAN SURABAYA\n\nNomor: {nomor_surat}\nTanggal: {tanggal}\n\nPerihal: Surat Rekomendasi\n\nYth. {tujuan}\n\nDengan hormat,\n\nBerdasarkan {alasan_rekomendasi}, dengan ini kami memberikan rekomendasi untuk {tujuan_rekomendasi}.\n\n{isi_surat}\n\nDemikian surat rekomendasi ini kami buat untuk dapat dipergunakan sebagaimana mestinya.\n\nTuhan memberkati.\n\n\n{nama_uskup}\n{jabatan_uskup}"
  },
  {
    id: "4",
    nama: "Surat Persetujuan",
    kategori: "Persetujuan",
    deskripsi: "Template untuk surat persetujuan",
    konten: "KEUSKUPAN SURABAYA\n\nNomor: {nomor_surat}\nTanggal: {tanggal}\n\nPerihal: Surat Persetujuan\n\nYth. {tujuan}\n\nDengan hormat,\n\nSetelah melakukan penilaian dan pertimbangan, dengan ini kami memberikan persetujuan untuk {kegiatan}.\n\n{isi_surat}\n\nDemikian surat persetujuan ini kami buat untuk dapat dilaksanakan dengan penuh tanggung jawab.\n\nTuhan memberkati.\n\n\n{nama_uskup}\n{jabatan_uskup}"
  }
]

export default function SuratPage() {
  const [suratList, setSuratList] = useState<Surat[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [templates] = useState<Template[]>(sampleTemplates)
  // SURAT KELUAR: Hanya gunakan kode G (Keuskupan Surabaya)
  // Kode lain (A-F, H-S) adalah untuk arsip surat masuk
  // STRICTLY STATIC: Do not use database to prevent leak of other codes
  const kodeKearsipanList = getGKodeOptions().map(k => ({ 
    id: k.value, 
    nama: `${k.kode} - ${k.label}`, 
    kode: k.kode 
  }))

  console.log('DEBUG: Surat Page Loaded with Options:', kodeKearsipanList.length, kodeKearsipanList[0])

  // Form handling
  const handleFormChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  // Handle file upload
  const [isUploading, setIsUploading] = useState(false)

  const onUploadFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setIsUploading(true)
      const data = new FormData()
      data.append('file', file)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: data
      })

      const result = await response.json()

      if (result.success) {
        showSuccess('File berhasil diunggah')
        // Simpan metadata file sebagai JSON string di field lampiran
        const attachmentData = JSON.stringify({
          name: result.data.name,
          url: result.data.webViewLink,
          id: result.data.id,
          mimeType: result.data.mimeType
        })
        handleFormChange('lampiran', attachmentData)
      } else {
        showError(result.error || 'Gagal mengunggah file')
      }
    } catch (error) {
      showError('Terjadi kesalahan saat mengunggah file')
      console.error('Upload error:', error)
    } finally {
      setIsUploading(false)
    }
  }

  // ZOMBIE FIX: Alias for stale cache references
  const handleFileUpload = onUploadFile


  const handleRemoveAttachment = () => {
    handleFormChange('lampiran', '')
  }

  // Fetch surat data from API
  useEffect(() => {
    fetchSuratData()
  }, [])

  const fetchSuratData = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/surat?all=true', { credentials: 'include' })
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
          isi: s.isi,
          lampiran: s.lampiran,
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
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isGeneratingNomor, setIsGeneratingNomor] = useState(false)
  
  // View/Edit states
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [selectedSurat, setSelectedSurat] = useState<Surat | null>(null)
  
  // Form state - Reordered: Jenis Surat FIRST
  const [formData, setFormData] = useState({
    jenis: '',          // STEP 1: Pilih jenis surat terlebih dahulu
    kodeKearsipan: '',  // Auto-display based on jenis
    nomor: '',          // STEP 2: Auto-generate berdasarkan jenis
    tanggal: new Date().toISOString().split('T')[0],
    judul: '',          // STEP 3: Data surat
    pengirim: 'Keuskupan Surabaya',
    penerima: '',
    isi: '',            // STEP 4: Isi surat (area besar)
    prioritas: 'Normal',
    lampiran: ''
  })

  const resetForm = () => {
    setFormData({
      jenis: '',
      kodeKearsipan: '',
      nomor: '',
      tanggal: new Date().toISOString().split('T')[0],
      judul: '',
      pengirim: 'Keuskupan Surabaya',
      penerima: '',
      isi: '',
      prioritas: 'Normal',
      lampiran: ''
    })
    setSelectedTemplate(null)
    setIsEditMode(false)
    setSelectedSurat(null)
  }



  // Auto-generate nomor surat when jenis is selected
  const handleJenisChange = async (kode: string) => {
    // kode is now the actual kode kearsipan (e.g., G.111)
    const selectedKode = kodeKearsipanList.find((k: any) => k.kode === kode)
    handleFormChange('jenis', selectedKode?.nama || kode)
    handleFormChange('kodeKearsipan', kode)
    
    // Auto-generate nomor surat using kode
    
    // Auto-generate nomor surat
    await generateNomorSurat(kode)
  }

  const generateNomorSurat = async (jenis: string) => {
    try {
      setIsGeneratingNomor(true)
      const response = await fetch('/api/surat/generate-nomor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ jenis })
      })
      
      if (response.ok) {
        const result = await response.json()
        if (result.success && result.nomor) {
          handleFormChange('nomor', result.nomor)
        }
      }
    } catch (error) {
      console.error('Failed to generate nomor:', error)
    } finally {
      setIsGeneratingNomor(false)
    }
  }

  const handleSubmit = async (status: 'Draft' | 'Terkirim') => {
    // Validation
    if (!formData.jenis) {
      showError('Pilih jenis surat terlebih dahulu')
      return
    }
    if (!formData.judul) {
      showError('Judul surat harus diisi')
      return
    }
    if (!formData.penerima) {
      showError('Penerima surat harus diisi')
      return
    }

    try {
      setIsSubmitting(true)
      
      const payload = {
        ...formData,
        status
      }
      
      const url = isEditMode && selectedSurat ? `/api/surat/${selectedSurat.id}` : '/api/surat'
      const method = isEditMode ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload)
      })
      
      const result = await response.json()
      
      if (result.success) {
        showSuccess(
          isEditMode 
            ? 'Surat berhasil diperbarui!' 
            : status === 'Draft' 
              ? 'Draft tersimpan!' 
              : 'Surat berhasil dikirim!'
        )
        setIsCreateDialogOpen(false)
        resetForm()
        fetchSuratData()
      } else {
        showError(result.error || 'Gagal menyimpan surat')
      }
    } catch (error) {
      console.error('Submit error:', error)
      showError('Terjadi kesalahan saat menyimpan surat')
    } finally {
      setIsSubmitting(false)
    }
  }

  // ===== ACTION HANDLERS =====
  
  const handleView = (surat: Surat) => {
    setSelectedSurat(surat)
    setIsEditMode(false)
    setIsViewDialogOpen(true)
  }

  const handleEdit = (surat: Surat) => {
    setSelectedSurat(surat)
    setIsEditMode(true)
    // Prefill form with surat data
    setFormData({
      jenis: surat.jenis || '',
      kodeKearsipan: surat.nomorSurat?.split('/')[0] || '',
      nomor: surat.nomorSurat || '',
      tanggal: surat.tanggal || new Date().toISOString().split('T')[0],
      judul: surat.judul || '',
      pengirim: 'Keuskupan Surabaya',
      penerima: surat.tujuan || '',
      isi: surat.isi || '',
      prioritas: 'Normal'
    })
    setIsCreateDialogOpen(true)
  }

  const handleSendDraft = async (surat: Surat) => {
    const confirmed = await confirmAction(
      `Apakah Anda yakin ingin mengirim surat "${surat.judul}"?`
    )
    
    if (confirmed) {
      try {
        const response = await fetch(`/api/surat/${surat.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ status: 'Terkirim' })
        })
        
        const result = await response.json()
        
        if (result.success) {
          showSuccess('Surat berhasil dikirim!')
          fetchSuratData()
        } else {
          showError(result.error || 'Gagal mengirim surat')
        }
      } catch (error) {
        showError('Terjadi kesalahan saat mengirim surat')
      }
    }
  }

  const handleDelete = async (surat: Surat) => {
    const confirmed = await confirmDelete(
      `surat "${surat.judul}"`
    )
    
    if (confirmed) {
      try {
        const response = await fetch(`/api/surat/${surat.id}`, {
          method: 'DELETE',
          credentials: 'include'
        })
        
        const result = await response.json()
        
        if (result.success) {
          showSuccess('Surat berhasil dihapus!')
          fetchSuratData()
        } else {
          showError(result.error || 'Gagal menghapus surat')
        }
      } catch (error) {
        showError('Terjadi kesalahan saat menghapus surat')
      }
    }
  }

  const handleDownloadPDF = (suratId: string) => {
    window.open(`/api/surat/${suratId}/pdf`, '_blank')
  }

  const handleDownloadDocx = (suratId: string) => {
    window.open(`/api/surat/${suratId}/word`, '_blank')
  }

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
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">Terkirim</Badge>
      case "Draft":
        return <Badge variant="secondary">Draft</Badge>
      case "Menunggu Tanda Tangan":
        return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">Menunggu Tanda Tangan</Badge>
      case "Dibatalkan":
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">Dibatalkan</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  const handleUseTemplate = (template: Template) => {
    setSelectedTemplate(template)
    setFormData(prev => ({
      ...prev,
      isi: template.konten,
      jenis: template.kategori
    }))
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
              Kelola surat menyurat keuskupan dengan kode kearsipan resmi
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

            {/* CREATE/EDIT DIALOG - Redesigned with better flow */}
            <Dialog open={isCreateDialogOpen} onOpenChange={(open) => {
              setIsCreateDialogOpen(open)
              if (!open) resetForm()
            }}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Surat Baru
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {isEditMode ? 'Edit Surat' : 'Buat Surat Baru'}
                  </DialogTitle>
                  <DialogDescription>
                    {selectedTemplate 
                      ? `Menggunakan template: ${selectedTemplate.nama}` 
                      : isEditMode 
                        ? 'Edit data surat yang sudah ada'
                        : 'Pilih jenis surat terlebih dahulu untuk generate nomor otomatis'}
                  </DialogDescription>
                </DialogHeader>

                <div className="grid gap-6 py-4">
                  {/* STEP 1: Jenis Surat - PALING ATAS */}
                  <div className="rounded-lg border bg-muted/30 p-4 space-y-4">
                    <div className="flex items-center gap-2 text-sm font-medium text-primary">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs">1</span>
                      Pilih Jenis Surat
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="jenis" className="font-semibold">
                          Jenis Surat <span className="text-destructive">*</span>
                        </Label>
                        <Select 
                          value={formData.jenis} 
                          onValueChange={handleJenisChange}
                        >
                          <SelectTrigger className="h-11">
                            <SelectValue placeholder="-- Pilih jenis surat --" />
                          </SelectTrigger>
                          <SelectContent>
                            {kodeKearsipanList.map((k: any) => (
                              <SelectItem key={k.id || k.kode} value={k.kode}>
                                {k.kode} - {k.nama}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <Label className="font-semibold">Kode Kearsipan</Label>
                        <div className="flex items-center h-11 px-3 rounded-md border bg-muted text-muted-foreground">
                          <Hash className="h-4 w-4 mr-2" />
                          {formData.kodeKearsipan || 'Otomatis berdasarkan jenis'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* STEP 2: Nomor dan Tanggal */}
                  <div className="rounded-lg border p-4 space-y-4">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-muted-foreground text-xs">2</span>
                      Nomor dan Tanggal
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="nomor" className="font-semibold">Nomor Surat</Label>
                        <div className="flex gap-2">
                          <Input 
                            id="nomor" 
                            placeholder={isGeneratingNomor ? "Generating..." : "Pilih jenis untuk auto-generate"}
                            value={formData.nomor}
                            onChange={(e) => handleFormChange('nomor', e.target.value)}
                            className="h-11"
                          />
                          <Button 
                            type="button" 
                            variant="outline" 
                            size="icon"
                            className="h-11 w-11"
                            disabled={!formData.jenis || isGeneratingNomor}
                            onClick={() => generateNomorSurat(formData.jenis)}
                            title="Generate ulang nomor"
                          >
                            <RefreshCw className={`h-4 w-4 ${isGeneratingNomor ? 'animate-spin' : ''}`} />
                          </Button>
                        </div>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="tanggal" className="font-semibold">Tanggal</Label>
                        <Input 
                          id="tanggal" 
                          type="date" 
                          value={formData.tanggal}
                          onChange={(e) => handleFormChange('tanggal', e.target.value)}
                          className="h-11"
                        />
                      </div>
                    </div>
                  </div>

                  {/* STEP 3: Detail Surat */}
                  <div className="rounded-lg border p-4 space-y-4">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-muted-foreground text-xs">3</span>
                      Detail Surat
                    </div>
                    <div className="grid gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="judul" className="font-semibold">
                          Judul / Perihal <span className="text-destructive">*</span>
                        </Label>
                        <Input 
                          id="judul" 
                          placeholder="Contoh: Undangan Rapat Dewan Pastoral" 
                          value={formData.judul}
                          onChange={(e) => handleFormChange('judul', e.target.value)}
                          className="h-11"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="penerima" className="font-semibold">
                          Penerima / Tujuan <span className="text-destructive">*</span>
                        </Label>
                        <Input 
                          id="penerima" 
                          placeholder="Contoh: Seluruh Pastor Paroki se-Keuskupan Surabaya" 
                          value={formData.penerima}
                          onChange={(e) => handleFormChange('penerima', e.target.value)}
                          className="h-11"
                        />
                      </div>
                    </div>
                  </div>

                  {/* STEP 4: Isi Surat - AREA BESAR */}
                  <div className="rounded-lg border p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-muted-foreground text-xs">4</span>
                        Isi Surat
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Tips: Gunakan Enter untuk paragraf baru
                      </div>
                    </div>
                    <RichTextEditor
                      content={formData.isi}
                      onChange={(content) => handleFormChange('isi', content)}
                      placeholder="Tuliskan isi surat di sini... Gunakan toolbar di atas untuk format (bold, italic, list, dll)"
                      minHeight="400px"
                    />
                  </div>
                  
                  {/* STEP 5: Lampiran - Optional */}
                  <div className="rounded-lg border p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-muted-foreground text-xs">5</span>
                        Lampiran (Opsional)
                      </div>
                    </div>
                    
                    <div className="grid gap-2">
                      {!formData.lampiran ? (
                        <div className="flex items-center gap-4">
                          <Input 
                            type="file" 
                            onChange={onUploadFile}
                            disabled={isUploading}
                            className="max-w-md cursor-pointer"
                            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                          />
                          {isUploading && <span className="text-sm text-muted-foreground animate-pulse">Mengunggah...</span>}
                        </div>
                      ) : (
                        <div className="flex items-center justify-between p-3 border rounded-md bg-muted/20">
                          <div className="flex items-center gap-2 overflow-hidden">
                            <Paperclip className="h-4 w-4 text-blue-500 shrink-0" />
                            <span className="text-sm truncate">
                              {(() => {
                                try {
                                  const data = JSON.parse(formData.lampiran || '{}')
                                  return data.name || 'Lampiran'
                                } catch {
                                  return 'Lampiran Terunggah'
                                }
                              })()}
                            </span>
                          </div>
                          <Button 
                            type="button" 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={handleRemoveAttachment}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        Format yang didukung: PDF, Word, Gambar. Maks 10MB. Disimpan di Google Drive.
                      </p>
                    </div>
                  </div>
                </div>

                <DialogFooter className="gap-2 sm:gap-0">
                  <Button variant="outline" onClick={() => {
                    setIsCreateDialogOpen(false)
                    resetForm()
                  }}>
                    Batal
                  </Button>
                  <Button 
                    variant="outline" 
                    disabled={isSubmitting}
                    onClick={() => handleSubmit('Draft')}
                  >
                    {isSubmitting ? 'Menyimpan...' : 'Simpan Draft'}
                  </Button>
                  <Button 
                    disabled={isSubmitting}
                    onClick={() => handleSubmit('Terkirim')}
                  >
                    <Send className="mr-2 h-4 w-4" />
                    {isSubmitting ? 'Mengirim...' : 'Kirim Surat'}
                  </Button>
                </DialogFooter>
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
                <div className="flex gap-4 items-center flex-wrap">
                  <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Cari surat..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                  <Select value={filterJenis} onValueChange={setFilterJenis}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Jenis" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="semua">Semua Jenis</SelectItem>
                      {kodeKearsipanList.map((k: any) => (
                        <SelectItem key={k.id || k.kode} value={k.nama}>{k.kode} - {k.nama}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="semua">Semua Status</SelectItem>
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
                  Total {filteredSurat.length} surat ditemukan
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
                    <span className="ml-2 text-muted-foreground">Memuat data...</span>
                  </div>
                ) : filteredSurat.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <FileText className="h-12 w-12 text-muted-foreground/50 mb-4" />
                    <p className="text-muted-foreground">Belum ada surat</p>
                    <p className="text-sm text-muted-foreground">Klik tombol "Surat Baru" untuk membuat surat</p>
                  </div>
                ) : (
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
                              <span className="max-w-[200px] truncate">{item.judul}</span>
                            </div>
                          </TableCell>
                          <TableCell className="font-mono text-sm">{item.nomorSurat}</TableCell>
                          <TableCell className="max-w-[150px] truncate">{item.tujuan}</TableCell>
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
                            <div className="flex justify-end gap-1">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleView(item)}
                                title="Lihat detail"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleEdit(item)}
                                title="Edit surat"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleDownloadPDF(item.id)}
                                title="Download PDF"
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                              {item.status === "Draft" && (
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => handleSendDraft(item)}
                                  title="Kirim surat"
                                >
                                  <Send className="h-4 w-4" />
                                </Button>
                              )}
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleDelete(item)}
                                title="Hapus surat"
                                className="text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
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
                        <p className="text-sm font-mono line-clamp-4 whitespace-pre-wrap">
                          {template.konten.substring(0, 200)}...
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
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* VIEW DIALOG - Preview Surat */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Detail Surat</DialogTitle>
              <DialogDescription>
                Preview surat yang dipilih
              </DialogDescription>
            </DialogHeader>
            {selectedSurat && (
              <div className="space-y-6">
                {/* Surat Header Info */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Nomor:</span>
                    <span className="ml-2 font-mono font-semibold">{selectedSurat.nomorSurat}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Tanggal:</span>
                    <span className="ml-2">{new Date(selectedSurat.tanggal).toLocaleDateString('id-ID', { 
                      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
                    })}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Jenis:</span>
                    <span className="ml-2">{selectedSurat.jenis}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Status:</span>
                    <span className="ml-2">{getStatusBadge(selectedSurat.status)}</span>
                  </div>
                </div>

                {/* Surat Preview */}
                <div className="border rounded-lg p-8 bg-white dark:bg-gray-900 font-serif">
                  <div className="text-center mb-6">
                    <h2 className="text-xl font-bold">KEUSKUPAN SURABAYA</h2>
                    <p className="text-sm text-muted-foreground">Jl. Mayjen Sungkono No.6, Surabaya 60256</p>
                  </div>
                  
                  <div className="mb-4 text-sm">
                    <p>Nomor: {selectedSurat.nomorSurat}</p>
                    <p>Perihal: {selectedSurat.judul}</p>
                  </div>

                  <div className="mb-4">
                    <p>Kepada Yth.</p>
                    <p className="font-semibold">{selectedSurat.tujuan}</p>
                    <p>di Tempat</p>
                  </div>

                  <div className="whitespace-pre-wrap leading-relaxed min-h-[200px]">
                    {selectedSurat.isi || 'Isi surat tidak tersedia'}
                  </div>
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
                    Tutup
                  </Button>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => handleDownloadDocx(selectedSurat.id)}>
                      <FileText className="mr-2 h-4 w-4 text-blue-600" />
                      Download Word (Edit)
                    </Button>
                    <Button onClick={() => handleDownloadPDF(selectedSurat.id)}>
                      <Download className="mr-2 h-4 w-4" />
                      Download PDF
                    </Button>
                  </div>
                  <Button onClick={() => {
                    setIsViewDialogOpen(false)
                    handleEdit(selectedSurat)
                  }}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Surat
                  </Button>
                </DialogFooter>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}