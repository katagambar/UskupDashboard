"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react"
import { showSuccess, showError, confirmDelete } from "@/lib/alerts"

interface Parameter {
    id: string
    tipe: string
    kode: string
    nama: string
    warna?: string
    urutan: number
    aktif: boolean
}

const TIPE_OPTIONS = [
    { value: 'PRIORITAS', label: 'Prioritas' },
    { value: 'KATEGORI_TUGAS', label: 'Kategori Tugas' },
    { value: 'JENIS_SURAT', label: 'Jenis Surat' },
    { value: 'JENIS_PERTEMUAN', label: 'Jenis Pertemuan' },
    { value: 'JENIS_NOTULENSI', label: 'Jenis Notulensi' },
    { value: 'PERIODE', label: 'Periode Laporan' },
    { value: 'KATEGORI_ISU', label: 'Kategori Isu' },
    { value: 'STATUS_TUGAS', label: 'Status Tugas' },
]

export function ParameterManagement() {
    const [parameters, setParameters] = useState<Parameter[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [selectedTipe, setSelectedTipe] = useState('PRIORITAS')
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [editingParam, setEditingParam] = useState<Parameter | null>(null)
    const [formData, setFormData] = useState({
        tipe: 'PRIORITAS',
        kode: '',
        nama: '',
        warna: '',
        urutan: 0
    })

    useEffect(() => {
        fetchParameters()
    }, [selectedTipe])

    const fetchParameters = async () => {
        try {
            setIsLoading(true)
            const response = await fetch(`/api/master/parameter?tipe=${selectedTipe}&aktif=false`, {
                credentials: 'include'
            })
            const result = await response.json()
            if (result.success) {
                setParameters(result.data || [])
            }
        } catch (error) {
            console.error('Failed to fetch parameters:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleCreate = async () => {
        if (!formData.kode || !formData.nama) {
            showError('Kode dan Nama wajib diisi')
            return
        }

        try {
            const response = await fetch('/api/master/parameter', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    ...formData,
                    tipe: selectedTipe
                })
            })
            const result = await response.json()
            if (result.success) {
                showSuccess('Parameter berhasil ditambahkan')
                setIsDialogOpen(false)
                resetForm()
                fetchParameters()
            } else {
                showError(result.error || 'Gagal menambah parameter')
            }
        } catch (error) {
            showError('Terjadi kesalahan')
        }
    }

    const handleUpdate = async () => {
        if (!editingParam || !formData.nama) {
            showError('Nama wajib diisi')
            return
        }

        try {
            const response = await fetch(`/api/master/parameter/${editingParam.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    nama: formData.nama,
                    warna: formData.warna,
                    urutan: formData.urutan
                })
            })
            const result = await response.json()
            if (result.success) {
                showSuccess('Parameter berhasil diperbarui')
                setIsDialogOpen(false)
                setEditingParam(null)
                resetForm()
                fetchParameters()
            } else {
                showError(result.error || 'Gagal memperbarui parameter')
            }
        } catch (error) {
            showError('Terjadi kesalahan')
        }
    }

    const handleToggleAktif = async (param: Parameter) => {
        try {
            const response = await fetch(`/api/master/parameter/${param.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ aktif: !param.aktif })
            })
            const result = await response.json()
            if (result.success) {
                showSuccess(`Parameter ${param.aktif ? 'dinonaktifkan' : 'diaktifkan'}`)
                fetchParameters()
            }
        } catch (error) {
            showError('Terjadi kesalahan')
        }
    }

    const handleDelete = async (param: Parameter) => {
        const confirmed = await confirmDelete(`parameter "${param.nama}"`)
        if (!confirmed) return

        try {
            const response = await fetch(`/api/master/parameter/${param.id}`, {
                method: 'DELETE',
                credentials: 'include'
            })
            const result = await response.json()
            if (result.success) {
                showSuccess('Parameter berhasil dihapus')
                fetchParameters()
            } else {
                showError(result.error || 'Gagal menghapus parameter')
            }
        } catch (error) {
            showError('Terjadi kesalahan')
        }
    }

    const handleEdit = (param: Parameter) => {
        setEditingParam(param)
        setFormData({
            tipe: param.tipe,
            kode: param.kode,
            nama: param.nama,
            warna: param.warna || '',
            urutan: param.urutan
        })
        setIsDialogOpen(true)
    }

    const resetForm = () => {
        setFormData({
            tipe: selectedTipe,
            kode: '',
            nama: '',
            warna: '',
            urutan: 0
        })
        setEditingParam(null)
    }

    const filteredParams = parameters.filter(p => p.tipe === selectedTipe)

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <Label>Tipe Parameter:</Label>
                    <Select value={selectedTipe} onValueChange={setSelectedTipe}>
                        <SelectTrigger className="w-[200px]">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {TIPE_OPTIONS.map(opt => (
                                <SelectItem key={opt.value} value={opt.value}>
                                    {opt.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <Dialog open={isDialogOpen} onOpenChange={(open) => {
                    setIsDialogOpen(open)
                    if (!open) resetForm()
                }}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Tambah Parameter
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{editingParam ? 'Edit Parameter' : 'Tambah Parameter Baru'}</DialogTitle>
                            <DialogDescription>
                                {TIPE_OPTIONS.find(t => t.value === selectedTipe)?.label}
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            {!editingParam && (
                                <div className="grid gap-2">
                                    <Label htmlFor="kode">Kode *</Label>
                                    <Input
                                        id="kode"
                                        value={formData.kode}
                                        onChange={(e) => setFormData({ ...formData, kode: e.target.value.toUpperCase() })}
                                        placeholder="Contoh: TINGGI"
                                    />
                                </div>
                            )}
                            <div className="grid gap-2">
                                <Label htmlFor="nama">Nama *</Label>
                                <Input
                                    id="nama"
                                    value={formData.nama}
                                    onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                                    placeholder="Contoh: Prioritas Tinggi"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="warna">Warna (hex)</Label>
                                    <div className="flex gap-2">
                                        <Input
                                            id="warna"
                                            value={formData.warna}
                                            onChange={(e) => setFormData({ ...formData, warna: e.target.value })}
                                            placeholder="#ef4444"
                                        />
                                        {formData.warna && (
                                            <div
                                                className="w-9 h-9 rounded border"
                                                style={{ backgroundColor: formData.warna }}
                                            />
                                        )}
                                    </div>
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="urutan">Urutan</Label>
                                    <Input
                                        id="urutan"
                                        type="number"
                                        value={formData.urutan}
                                        onChange={(e) => setFormData({ ...formData, urutan: parseInt(e.target.value) || 0 })}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={() => {
                                setIsDialogOpen(false)
                                resetForm()
                            }}>
                                Batal
                            </Button>
                            <Button onClick={editingParam ? handleUpdate : handleCreate}>
                                {editingParam ? 'Simpan Perubahan' : 'Tambah'}
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Daftar {TIPE_OPTIONS.find(t => t.value === selectedTipe)?.label}</CardTitle>
                    <CardDescription>
                        {filteredParams.length} parameter
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex justify-center py-8">
                            <Loader2 className="h-6 w-6 animate-spin" />
                        </div>
                    ) : filteredParams.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            Belum ada parameter untuk tipe ini
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Kode</TableHead>
                                    <TableHead>Nama</TableHead>
                                    <TableHead>Warna</TableHead>
                                    <TableHead>Urutan</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Aksi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredParams.map((param) => (
                                    <TableRow key={param.id}>
                                        <TableCell className="font-mono">{param.kode}</TableCell>
                                        <TableCell>{param.nama}</TableCell>
                                        <TableCell>
                                            {param.warna ? (
                                                <div className="flex items-center gap-2">
                                                    <div
                                                        className="w-4 h-4 rounded"
                                                        style={{ backgroundColor: param.warna }}
                                                    />
                                                    <span className="text-xs text-muted-foreground">{param.warna}</span>
                                                </div>
                                            ) : (
                                                <span className="text-muted-foreground">-</span>
                                            )}
                                        </TableCell>
                                        <TableCell>{param.urutan}</TableCell>
                                        <TableCell>
                                            <Switch
                                                checked={param.aktif}
                                                onCheckedChange={() => handleToggleAktif(param)}
                                            />
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button variant="ghost" size="sm" onClick={() => handleEdit(param)}>
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-red-600"
                                                    onClick={() => handleDelete(param)}
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
        </div>
    )
}
