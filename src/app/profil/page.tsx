"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Church,
  BookOpen,
  Heart,
  Users,
  Award,
  Globe,
  Pencil,
  Loader2,
  Plus,
  Trash2,
  Save
} from "lucide-react"
import { showSuccess, showError } from "@/lib/alerts"

interface Education {
  id: string
  degree: string
  institution: string
  year: string
}

interface Experience {
  id: string
  title: string
  organization: string
  period: string
}

interface BishopProfile {
  id?: string
  namaLengkap: string
  gelar: string
  tanggalLahir: string
  tempatLahir: string
  foto: string
  email: string
  telepon: string
  alamat: string
  website: string
  namaKeuskupan: string
  tanggalTahbisanUskup: string
  jumlahParoki: number
  jumlahUmat: string
  pendidikan: Education[]
  pengalaman: Experience[]
  totalPertemuanKuria: number
  totalPastoralVisitasi: number
  totalSuratEdaran: number
  totalKeputusanPenting: number
}

// Default profile with empty values - data will be fetched from database
const defaultProfile: BishopProfile = {
  namaLengkap: "",
  gelar: "",
  tanggalLahir: "",
  tempatLahir: "",
  foto: "",
  email: "",
  telepon: "",
  alamat: "",
  website: "",
  namaKeuskupan: "Keuskupan Surabaya",
  tanggalTahbisanUskup: "",
  jumlahParoki: 0,
  jumlahUmat: "",
  pendidikan: [],
  pengalaman: [],
  totalPertemuanKuria: 0,
  totalPastoralVisitasi: 0,
  totalSuratEdaran: 0,
  totalKeputusanPenting: 0
}

export default function ProfilPage() {
  const [profile, setProfile] = useState<BishopProfile>(defaultProfile)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState<BishopProfile>(defaultProfile)

  // Fetch profile on mount
  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/profile', { credentials: 'include' })
      const result = await response.json()
      if (result.success && result.data) {
        setProfile(result.data)
        setEditForm(result.data)
      } else {
        // Use default if no profile exists
        setProfile(defaultProfile)
        setEditForm(defaultProfile)
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error)
      // Use default on error
      setProfile(defaultProfile)
      setEditForm(defaultProfile)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const response = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(editForm)
      })
      const result = await response.json()
      if (result.success) {
        setProfile(result.data)
        setIsEditing(false)
        showSuccess('Profil berhasil disimpan')
      } else {
        showError(result.error || 'Gagal menyimpan profil')
      }
    } catch (error) {
      showError('Gagal menyimpan profil')
    } finally {
      setIsSaving(false)
    }
  }

  const addEducation = () => {
    const newEdu: Education = {
      id: Date.now().toString(),
      degree: '',
      institution: '',
      year: ''
    }
    setEditForm({
      ...editForm,
      pendidikan: [...editForm.pendidikan, newEdu]
    })
  }

  const removeEducation = (id: string) => {
    setEditForm({
      ...editForm,
      pendidikan: editForm.pendidikan.filter(e => e.id !== id)
    })
  }

  const updateEducation = (id: string, field: keyof Education, value: string) => {
    setEditForm({
      ...editForm,
      pendidikan: editForm.pendidikan.map(e =>
        e.id === id ? { ...e, [field]: value } : e
      )
    })
  }

  const addExperience = () => {
    const newExp: Experience = {
      id: Date.now().toString(),
      title: '',
      organization: '',
      period: ''
    }
    setEditForm({
      ...editForm,
      pengalaman: [...editForm.pengalaman, newExp]
    })
  }

  const removeExperience = (id: string) => {
    setEditForm({
      ...editForm,
      pengalaman: editForm.pengalaman.filter(e => e.id !== id)
    })
  }

  const updateExperience = (id: string, field: keyof Experience, value: string) => {
    setEditForm({
      ...editForm,
      pengalaman: editForm.pengalaman.map(e =>
        e.id === id ? { ...e, [field]: value } : e
      )
    })
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Profil Uskup</h1>
            <p className="text-muted-foreground">
              Informasi lengkap {profile.namaLengkap}
            </p>
          </div>
          <Button onClick={() => { setEditForm(profile); setIsEditing(true); }}>
            <Pencil className="mr-2 h-4 w-4" />
            Edit Profil
          </Button>
        </div>

        {/* Profile Header */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start gap-6">
              <Avatar className="h-24 w-24">
                <AvatarImage src={profile.foto || "/bishop-avatar.jpg"} alt="Uskup" />
                <AvatarFallback className="text-2xl">USK</AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-bold">{profile.namaLengkap}</h2>
                  <Badge className="bg-green-100 text-green-800">Aktif</Badge>
                </div>
                <p className="text-lg text-muted-foreground">{profile.gelar}</p>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>Ditahbiskan: {profile.tanggalTahbisanUskup ? new Date(profile.tanggalTahbisanUskup).toLocaleDateString('id-ID') : '-'}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    <span>{profile.tempatLahir || 'Surabaya'}, Jawa Timur</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact & Diocese Information */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Informasi Kontak</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Email</p>
                  <p className="text-sm text-muted-foreground">{profile.email || '-'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Telepon</p>
                  <p className="text-sm text-muted-foreground">{profile.telepon || '-'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Alamat</p>
                  <p className="text-sm text-muted-foreground">{profile.alamat || '-'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Globe className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Website</p>
                  <p className="text-sm text-muted-foreground">{profile.website || '-'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Informasi Keuskupan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Church className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Keuskupan</p>
                  <p className="text-sm text-muted-foreground">{profile.namaKeuskupan}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Tanggal Penahbisan Uskup</p>
                  <p className="text-sm text-muted-foreground">
                    {profile.tanggalTahbisanUskup ? new Date(profile.tanggalTahbisanUskup).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Users className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Jumlah Paroki</p>
                  <p className="text-sm text-muted-foreground">{profile.jumlahParoki} Paroki</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Heart className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Jumlah Umat</p>
                  <p className="text-sm text-muted-foreground">{profile.jumlahUmat || '-'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Education and Experience */}
        <Card>
          <CardHeader>
            <CardTitle>Pendidikan dan Pengalaman</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  Pendidikan
                </h4>
                <div className="space-y-3">
                  {profile.pendidikan?.map((edu) => (
                    <div key={edu.id} className="border-l-2 border-primary pl-4">
                      <p className="font-medium">{edu.degree}</p>
                      <p className="text-sm text-muted-foreground">{edu.institution}</p>
                      <p className="text-xs text-muted-foreground">{edu.year}</p>
                    </div>
                  ))}
                  {(!profile.pendidikan || profile.pendidikan.length === 0) && (
                    <p className="text-sm text-muted-foreground">Belum ada data pendidikan</p>
                  )}
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Award className="h-4 w-4" />
                  Pengalaman
                </h4>
                <div className="space-y-3">
                  {profile.pengalaman?.map((exp) => (
                    <div key={exp.id} className="border-l-2 border-primary pl-4">
                      <p className="font-medium">{exp.title}</p>
                      <p className="text-sm text-muted-foreground">{exp.organization}</p>
                      <p className="text-xs text-muted-foreground">{exp.period}</p>
                    </div>
                  ))}
                  {(!profile.pengalaman || profile.pengalaman.length === 0) && (
                    <p className="text-sm text-muted-foreground">Belum ada data pengalaman</p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Statistics */}
        <Card>
          <CardHeader>
            <CardTitle>Statistik Kegiatan</CardTitle>
            <CardDescription>
              Ringkasan kegiatan uskup dalam 6 bulan terakhir
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{profile.totalPertemuanKuria}</div>
                <p className="text-sm text-muted-foreground">Pertemuan Kuria</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{profile.totalPastoralVisitasi}</div>
                <p className="text-sm text-muted-foreground">Pastoral Visitasi</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{profile.totalSuratEdaran}</div>
                <p className="text-sm text-muted-foreground">Surat Edaran</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{profile.totalKeputusanPenting}</div>
                <p className="text-sm text-muted-foreground">Keputusan Penting</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Edit Dialog */}
        <Dialog open={isEditing} onOpenChange={setIsEditing}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Profil Uskup</DialogTitle>
              <DialogDescription>
                Perbarui informasi profil uskup
              </DialogDescription>
            </DialogHeader>

            <Tabs defaultValue="personal" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="personal">Personal</TabsTrigger>
                <TabsTrigger value="diocese">Keuskupan</TabsTrigger>
                <TabsTrigger value="education">Pendidikan</TabsTrigger>
                <TabsTrigger value="stats">Statistik</TabsTrigger>
              </TabsList>

              <TabsContent value="personal" className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Nama Lengkap</Label>
                    <Input
                      value={editForm.namaLengkap}
                      onChange={(e) => setEditForm({ ...editForm, namaLengkap: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Gelar / Jabatan</Label>
                    <Input
                      value={editForm.gelar}
                      onChange={(e) => setEditForm({ ...editForm, gelar: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input
                      type="email"
                      value={editForm.email}
                      onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Telepon</Label>
                    <Input
                      value={editForm.telepon}
                      onChange={(e) => setEditForm({ ...editForm, telepon: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Alamat</Label>
                  <Input
                    value={editForm.alamat}
                    onChange={(e) => setEditForm({ ...editForm, alamat: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Website</Label>
                  <Input
                    value={editForm.website}
                    onChange={(e) => setEditForm({ ...editForm, website: e.target.value })}
                  />
                </div>
              </TabsContent>

              <TabsContent value="diocese" className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Nama Keuskupan</Label>
                    <Input
                      value={editForm.namaKeuskupan}
                      onChange={(e) => setEditForm({ ...editForm, namaKeuskupan: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Tanggal Tahbisan Uskup</Label>
                    <Input
                      type="date"
                      value={editForm.tanggalTahbisanUskup}
                      onChange={(e) => setEditForm({ ...editForm, tanggalTahbisanUskup: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Jumlah Paroki</Label>
                    <Input
                      type="number"
                      value={editForm.jumlahParoki}
                      onChange={(e) => setEditForm({ ...editForm, jumlahParoki: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Jumlah Umat</Label>
                    <Input
                      value={editForm.jumlahUmat}
                      onChange={(e) => setEditForm({ ...editForm, jumlahUmat: e.target.value })}
                      placeholder="± 150,000 jiwa"
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="education" className="space-y-4 mt-4">
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <Label className="text-base font-semibold">Pendidikan</Label>
                    <Button variant="outline" size="sm" onClick={addEducation}>
                      <Plus className="h-4 w-4 mr-1" /> Tambah
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {editForm.pendidikan.map((edu) => (
                      <div key={edu.id} className="flex gap-2 items-start p-3 border rounded">
                        <div className="flex-1 grid grid-cols-3 gap-2">
                          <Input
                            placeholder="Gelar/Tingkat"
                            value={edu.degree}
                            onChange={(e) => updateEducation(edu.id, 'degree', e.target.value)}
                          />
                          <Input
                            placeholder="Institusi"
                            value={edu.institution}
                            onChange={(e) => updateEducation(edu.id, 'institution', e.target.value)}
                          />
                          <Input
                            placeholder="Tahun"
                            value={edu.year}
                            onChange={(e) => updateEducation(edu.id, 'year', e.target.value)}
                          />
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => removeEducation(edu.id)}>
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between items-center mb-3">
                    <Label className="text-base font-semibold">Pengalaman</Label>
                    <Button variant="outline" size="sm" onClick={addExperience}>
                      <Plus className="h-4 w-4 mr-1" /> Tambah
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {editForm.pengalaman.map((exp) => (
                      <div key={exp.id} className="flex gap-2 items-start p-3 border rounded">
                        <div className="flex-1 grid grid-cols-3 gap-2">
                          <Input
                            placeholder="Jabatan"
                            value={exp.title}
                            onChange={(e) => updateExperience(exp.id, 'title', e.target.value)}
                          />
                          <Input
                            placeholder="Organisasi"
                            value={exp.organization}
                            onChange={(e) => updateExperience(exp.id, 'organization', e.target.value)}
                          />
                          <Input
                            placeholder="Periode"
                            value={exp.period}
                            onChange={(e) => updateExperience(exp.id, 'period', e.target.value)}
                          />
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => removeExperience(exp.id)}>
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="stats" className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Total Pertemuan Kuria</Label>
                    <Input
                      type="number"
                      value={editForm.totalPertemuanKuria}
                      onChange={(e) => setEditForm({ ...editForm, totalPertemuanKuria: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Total Pastoral Visitasi</Label>
                    <Input
                      type="number"
                      value={editForm.totalPastoralVisitasi}
                      onChange={(e) => setEditForm({ ...editForm, totalPastoralVisitasi: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Total Surat Edaran</Label>
                    <Input
                      type="number"
                      value={editForm.totalSuratEdaran}
                      onChange={(e) => setEditForm({ ...editForm, totalSuratEdaran: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Total Keputusan Penting</Label>
                    <Input
                      type="number"
                      value={editForm.totalKeputusanPenting}
                      onChange={(e) => setEditForm({ ...editForm, totalKeputusanPenting: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            <DialogFooter className="mt-6">
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                Batal
              </Button>
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Simpan
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}