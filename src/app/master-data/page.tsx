"use client"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RichTextEditor } from "@/components/ui/rich-text-editor"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
    Database,
    Church,
    Tag,
    FileText,
    Plus,
    Pencil,
    Trash2,
    Loader2,
    Search,
    RefreshCw,
    MapPin,
    Settings
} from "lucide-react"
import { showSuccess, showError } from "@/lib/alerts"
import { ParameterManagement } from "@/components/master-data/parameter-management"

// ============================================
// INTERFACES
// ============================================

interface Paroki {
    id: string
    nama: string
    alamat: string | null
    telepon: string | null
    email: string | null
    pastorParoki: string | null
    wilayah: string | null
    status: string
}

interface Kategori {
    id: string
    nama: string
    tipe: string
    deskripsi: string | null
    warna: string | null
    status: string
}

interface TemplateSurat {
    id: string
    nama: string
    kategori: string
    deskripsi: string | null
    konten: string
    status: string
}

// ============================================
// SAMPLE DATA - Keuskupan Surabaya
// ============================================

const sampleParoki: Omit<Paroki, 'id'>[] = [
    // Kevikepan Surabaya Selatan
    { nama: "Katedral Hati Kudus Yesus", alamat: "Surabaya", telepon: "", email: "", pastorParoki: "", wilayah: "Kevikepan Surabaya Selatan", status: "Aktif" },
    { nama: "Gembala yang Baik", alamat: "Surabaya", telepon: "", email: "", pastorParoki: "", wilayah: "Kevikepan Surabaya Selatan", status: "Aktif" },
    { nama: "St. Paulus", alamat: "Juanda, Sidoarjo", telepon: "", email: "", pastorParoki: "", wilayah: "Kevikepan Surabaya Selatan", status: "Aktif" },
    { nama: "Roh Kudus", alamat: "Surabaya", telepon: "", email: "", pastorParoki: "", wilayah: "Kevikepan Surabaya Selatan", status: "Aktif" },
    { nama: "St. Maria Annuntiata", alamat: "Sidoarjo", telepon: "", email: "", pastorParoki: "", wilayah: "Kevikepan Surabaya Selatan", status: "Aktif" },
    { nama: "Salib Suci", alamat: "Sidoarjo", telepon: "", email: "", pastorParoki: "", wilayah: "Kevikepan Surabaya Selatan", status: "Aktif" },
    { nama: "St. Yohanes Pemandi", alamat: "Surabaya", telepon: "", email: "", pastorParoki: "", wilayah: "Kevikepan Surabaya Selatan", status: "Aktif" },
    // Kevikepan Surabaya Barat
    { nama: "St. Yakobus", alamat: "Citraland, Surabaya", telepon: "", email: "", pastorParoki: "", wilayah: "Kevikepan Surabaya Barat", status: "Aktif" },
    { nama: "St. Aloysius Gonzaga", alamat: "Darmo Satelit, Surabaya", telepon: "", email: "", pastorParoki: "", wilayah: "Kevikepan Surabaya Barat", status: "Aktif" },
    { nama: "Redemptor Mundi", alamat: "Surabaya", telepon: "", email: "", pastorParoki: "", wilayah: "Kevikepan Surabaya Barat", status: "Aktif" },
    { nama: "Sakramen Maha Kudus", alamat: "Surabaya", telepon: "", email: "", pastorParoki: "", wilayah: "Kevikepan Surabaya Barat", status: "Aktif" },
    { nama: "St. Stefanus", alamat: "Surabaya", telepon: "", email: "", pastorParoki: "", wilayah: "Kevikepan Surabaya Barat", status: "Aktif" },
    { nama: "St. Yusup", alamat: "Surabaya", telepon: "", email: "", pastorParoki: "", wilayah: "Kevikepan Surabaya Barat", status: "Aktif" },
    // Kevikepan Surabaya Utara
    { nama: "St. Marinus Yohanes", alamat: "Surabaya", telepon: "", email: "", pastorParoki: "", wilayah: "Kevikepan Surabaya Utara", status: "Aktif" },
    { nama: "Kelahiran Santa Perawan Maria", alamat: "Surabaya", telepon: "", email: "", pastorParoki: "", wilayah: "Kevikepan Surabaya Utara", status: "Aktif" },
    { nama: "Kristus Raja", alamat: "Surabaya", telepon: "", email: "", pastorParoki: "", wilayah: "Kevikepan Surabaya Utara", status: "Aktif" },
    { nama: "St. Maria Tak Bercela", alamat: "Surabaya", telepon: "", email: "", pastorParoki: "", wilayah: "Kevikepan Surabaya Utara", status: "Aktif" },
    { nama: "St. Mikael", alamat: "Surabaya", telepon: "", email: "", pastorParoki: "", wilayah: "Kevikepan Surabaya Utara", status: "Aktif" },
    { nama: "Ratu Pecinta Damai", alamat: "Surabaya", telepon: "", email: "", pastorParoki: "", wilayah: "Kevikepan Surabaya Utara", status: "Aktif" },
    { nama: "St. Yosafat", alamat: "Surabaya", telepon: "", email: "", pastorParoki: "", wilayah: "Kevikepan Surabaya Utara", status: "Aktif" },
    { nama: "St. Vincentius A Paulo", alamat: "Surabaya", telepon: "", email: "", pastorParoki: "", wilayah: "Kevikepan Surabaya Utara", status: "Aktif" },
    // Kevikepan Mojokerto
    { nama: "St. Perawan Maria", alamat: "Gresik", telepon: "", email: "", pastorParoki: "", wilayah: "Kevikepan Mojokerto", status: "Aktif" },
    { nama: "St. Maria", alamat: "Jombang", telepon: "", email: "", pastorParoki: "", wilayah: "Kevikepan Mojokerto", status: "Aktif" },
    { nama: "St. Monika", alamat: "Krian", telepon: "", email: "", pastorParoki: "", wilayah: "Kevikepan Mojokerto", status: "Aktif" },
    { nama: "St. Yosef", alamat: "Mojokerto", telepon: "", email: "", pastorParoki: "", wilayah: "Kevikepan Mojokerto", status: "Aktif" },
    // Kevikepan Kediri
    { nama: "St. Yosef", alamat: "Kediri", telepon: "", email: "", pastorParoki: "", wilayah: "Kevikepan Kediri", status: "Aktif" },
    { nama: "St. Vincentius A Paulo", alamat: "Kediri", telepon: "", email: "", pastorParoki: "", wilayah: "Kevikepan Kediri", status: "Aktif" },
    { nama: "St. Paulus", alamat: "Nganjuk", telepon: "", email: "", pastorParoki: "", wilayah: "Kevikepan Kediri", status: "Aktif" },
    { nama: "St. Mateus", alamat: "Pare", telepon: "", email: "", pastorParoki: "", wilayah: "Kevikepan Kediri", status: "Aktif" },
    // Kevikepan Blora
    { nama: "St. Pius X", alamat: "Blora", telepon: "", email: "", pastorParoki: "", wilayah: "Kevikepan Blora", status: "Aktif" },
    { nama: "St. Paulus", alamat: "Bojonegoro", telepon: "", email: "", pastorParoki: "", wilayah: "Kevikepan Blora", status: "Aktif" },
    { nama: "St. Willibrodus", alamat: "Cepu", telepon: "", email: "", pastorParoki: "", wilayah: "Kevikepan Blora", status: "Aktif" },
    { nama: "St. Petrus dan Paulus", alamat: "Rembang", telepon: "", email: "", pastorParoki: "", wilayah: "Kevikepan Blora", status: "Aktif" },
    { nama: "St. Petrus", alamat: "Tuban", telepon: "", email: "", pastorParoki: "", wilayah: "Kevikepan Blora", status: "Aktif" },
    // Kevikepan Madiun
    { nama: "St. Hilarius", alamat: "Klepu", telepon: "", email: "", pastorParoki: "", wilayah: "Kevikepan Madiun", status: "Aktif" },
    { nama: "St. Cornelius", alamat: "Madiun", telepon: "", email: "", pastorParoki: "", wilayah: "Kevikepan Madiun", status: "Aktif" },
    { nama: "Mater Dei", alamat: "Madiun", telepon: "", email: "", pastorParoki: "", wilayah: "Kevikepan Madiun", status: "Aktif" },
    { nama: "Regina Pacis", alamat: "Magetan", telepon: "", email: "", pastorParoki: "", wilayah: "Kevikepan Madiun", status: "Aktif" },
    { nama: "St. Yosef", alamat: "Ngawi", telepon: "", email: "", pastorParoki: "", wilayah: "Kevikepan Madiun", status: "Aktif" },
    { nama: "Kristus Raja", alamat: "Ngrambe", telepon: "", email: "", pastorParoki: "", wilayah: "Kevikepan Madiun", status: "Aktif" },
    { nama: "St. Maria", alamat: "Ponorogo", telepon: "", email: "", pastorParoki: "", wilayah: "Kevikepan Madiun", status: "Aktif" },
    // Kevikepan Blitar
    { nama: "St. Maria", alamat: "Blitar", telepon: "", email: "", pastorParoki: "", wilayah: "Kevikepan Blitar", status: "Aktif" },
    { nama: "St. Yusup", alamat: "Blitar", telepon: "", email: "", pastorParoki: "", wilayah: "Kevikepan Blitar", status: "Aktif" },
    { nama: "St. Fransiskus Asisi", alamat: "Mojorejo", telepon: "", email: "", pastorParoki: "", wilayah: "Kevikepan Blitar", status: "Aktif" },
    { nama: "St. Fransiskus Asisi", alamat: "Resapombo", telepon: "", email: "", pastorParoki: "", wilayah: "Kevikepan Blitar", status: "Aktif" },
    { nama: "St. Maria dengan Tidak Bernoda Asal", alamat: "Tulungagung", telepon: "", email: "", pastorParoki: "", wilayah: "Kevikepan Blitar", status: "Aktif" },
    { nama: "St. Petrus dan Paulus", alamat: "Wlingi", telepon: "", email: "", pastorParoki: "", wilayah: "Kevikepan Blitar", status: "Aktif" },
]

const sampleKategori: Omit<Kategori, 'id'>[] = [
    { nama: "Misa", tipe: "agenda", deskripsi: "Perayaan Misa", warna: "#3B82F6", status: "Aktif" },
    { nama: "Rapat", tipe: "agenda", deskripsi: "Rapat/Pertemuan", warna: "#10B981", status: "Aktif" },
    { nama: "Kunjungan Pastoral", tipe: "agenda", deskripsi: "Visitasi ke paroki", warna: "#8B5CF6", status: "Aktif" },
    { nama: "Sakramen", tipe: "agenda", deskripsi: "Pelayanan Sakramen", warna: "#F59E0B", status: "Aktif" },
    { nama: "Administrasi", tipe: "tugas", deskripsi: "Tugas administratif", warna: "#6B7280", status: "Aktif" },
    { nama: "Pastoral", tipe: "tugas", deskripsi: "Tugas pastoral", warna: "#EC4899", status: "Aktif" },
    { nama: "Keuangan", tipe: "tugas", deskripsi: "Tugas keuangan", warna: "#14B8A6", status: "Aktif" },
    { nama: "Edaran", tipe: "surat", deskripsi: "Surat edaran keuskupan", warna: "#3B82F6", status: "Aktif" },
    { nama: "Undangan", tipe: "surat", deskripsi: "Surat undangan", warna: "#10B981", status: "Aktif" },
    { nama: "Rekomendasi", tipe: "surat", deskripsi: "Surat rekomendasi", warna: "#F59E0B", status: "Aktif" },
    { nama: "Persetujuan", tipe: "surat", deskripsi: "Surat persetujuan", warna: "#8B5CF6", status: "Aktif" },
    { nama: "Pastoral", tipe: "keputusan", deskripsi: "Keputusan pastoral", warna: "#EC4899", status: "Aktif" },
    { nama: "Keuangan", tipe: "keputusan", deskripsi: "Keputusan keuangan", warna: "#14B8A6", status: "Aktif" },
    { nama: "Organisasi", tipe: "keputusan", deskripsi: "Keputusan organisasi", warna: "#6366F1", status: "Aktif" },
]

const sampleTemplate: Omit<TemplateSurat, 'id'>[] = [
    { nama: "Surat Edaran", kategori: "Edaran", deskripsi: "Template surat edaran keuskupan", konten: "KEUSKUPAN SURABAYA\n\nNomor: {nomor_surat}\nTanggal: {tanggal}\n\nPerihal: {perihal}\n\nYth. {tujuan}\n\nDengan hormat,\n\n{isi_surat}\n\nDemikian edaran ini disampaikan.\n\nTuhan memberkati.\n\n\nUskup Surabaya", status: "Aktif" },
    { nama: "Surat Undangan", kategori: "Undangan", deskripsi: "Template surat undangan", konten: "KEUSKUPAN SURABAYA\n\nNomor: {nomor_surat}\nTanggal: {tanggal}\n\nPerihal: Undangan {acara}\n\nYth. {tujuan}\n\nDengan hormat,\n\nBersama ini kami mengundang untuk menghadiri:\n\nAcara: {acara}\nHari/Tanggal: {tanggal_acara}\nWaktu: {waktu}\nTempat: {tempat}\n\n{isi_surat}\n\nTuhan memberkati.\n\n\nUskup Surabaya", status: "Aktif" },
    { nama: "Surat Rekomendasi", kategori: "Rekomendasi", deskripsi: "Template surat rekomendasi", konten: "KEUSKUPAN SURABAYA\n\nNomor: {nomor_surat}\nTanggal: {tanggal}\n\nPerihal: Surat Rekomendasi\n\nYth. {tujuan}\n\nDengan hormat,\n\n{isi_surat}\n\nDemikian surat rekomendasi ini dibuat.\n\nTuhan memberkati.\n\n\nUskup Surabaya", status: "Aktif" },
]

// ============================================
// KEVIKEPAN COLOR SCHEME
// ============================================

const kevikepanColors: Record<string, { border: string, bg: string, text: string }> = {
    'Kevikepan Surabaya Selatan': { border: 'border-l-blue-500', bg: 'bg-blue-500/5', text: 'text-blue-600' },
    'Kevikepan Surabaya Barat': { border: 'border-l-emerald-500', bg: 'bg-emerald-500/5', text: 'text-emerald-600' },
    'Kevikepan Surabaya Utara': { border: 'border-l-violet-500', bg: 'bg-violet-500/5', text: 'text-violet-600' },
    'Kevikepan Mojokerto': { border: 'border-l-amber-500', bg: 'bg-amber-500/5', text: 'text-amber-600' },
    'Kevikepan Kediri': { border: 'border-l-rose-500', bg: 'bg-rose-500/5', text: 'text-rose-600' },
    'Kevikepan Blora': { border: 'border-l-cyan-500', bg: 'bg-cyan-500/5', text: 'text-cyan-600' },
    'Kevikepan Madiun': { border: 'border-l-orange-500', bg: 'bg-orange-500/5', text: 'text-orange-600' },
    'Kevikepan Blitar': { border: 'border-l-pink-500', bg: 'bg-pink-500/5', text: 'text-pink-600' },
}

const getKevikepanColor = (wilayah: string | null) => {
    return kevikepanColors[wilayah || ''] || { border: 'border-l-gray-400', bg: 'bg-gray-50', text: 'text-gray-600' }
}

// ============================================
// MAIN COMPONENT
// ============================================

export default function MasterDataPage() {
    const [parokiList, setParokiList] = useState<Paroki[]>([])
    const [kategoriList, setKategoriList] = useState<Kategori[]>([])
    const [templateList, setTemplateList] = useState<TemplateSurat[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)

    const [activeTab, setActiveTab] = useState("paroki")
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [editingItem, setEditingItem] = useState<Paroki | Kategori | TemplateSurat | null>(null)
    const [searchTerm, setSearchTerm] = useState("")
    const [filterWilayah, setFilterWilayah] = useState("all")

    // Form states
    const [parokiForm, setParokiForm] = useState({ nama: "", alamat: "", telepon: "", email: "", pastorParoki: "", wilayah: "", status: "Aktif" })
    const [kategoriForm, setKategoriForm] = useState({ nama: "", tipe: "agenda", deskripsi: "", warna: "#3B82F6", status: "Aktif" })
    const [templateForm, setTemplateForm] = useState({ nama: "", kategori: "Edaran", deskripsi: "", konten: "", status: "Aktif" })

    // Fetch data
    useEffect(() => {
        fetchAllData()
    }, [])

    const fetchAllData = async () => {
        setIsLoading(true)
        await Promise.all([fetchParoki(), fetchKategori(), fetchTemplate()])
        setIsLoading(false)
    }

    const fetchParoki = async () => {
        try {
            const res = await fetch('/api/master/paroki', { credentials: 'include' })
            const data = await res.json()
            if (data.success) setParokiList(data.data || [])
        } catch (e) { console.error('Failed to fetch paroki:', e) }
    }

    const fetchKategori = async () => {
        try {
            const res = await fetch('/api/master/kategori', { credentials: 'include' })
            const data = await res.json()
            if (data.success) setKategoriList(data.data || [])
        } catch (e) { console.error('Failed to fetch kategori:', e) }
    }

    const fetchTemplate = async () => {
        try {
            const res = await fetch('/api/master/template-surat', { credentials: 'include' })
            const data = await res.json()
            if (data.success) setTemplateList(data.data || [])
        } catch (e) { console.error('Failed to fetch template:', e) }
    }

    // Seed & Reset
    const seedSampleData = async () => {
        setIsSaving(true)
        try {
            for (const p of sampleParoki) {
                await fetch('/api/master/paroki', { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify(p) })
            }
            for (const k of sampleKategori) {
                await fetch('/api/master/kategori', { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify(k) })
            }
            for (const t of sampleTemplate) {
                await fetch('/api/master/template-surat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify(t) })
            }
            showSuccess('Data contoh berhasil ditambahkan!')
            fetchAllData()
        } catch (e) {
            showError('Gagal menambahkan data contoh')
        } finally {
            setIsSaving(false)
        }
    }

    const resetAndSeedData = async () => {
        setIsSaving(true)
        try {
            for (const p of parokiList) await fetch(`/api/master/paroki/${p.id}`, { method: 'DELETE', credentials: 'include' })
            for (const k of kategoriList) await fetch(`/api/master/kategori/${k.id}`, { method: 'DELETE', credentials: 'include' })
            for (const t of templateList) await fetch(`/api/master/template-surat/${t.id}`, { method: 'DELETE', credentials: 'include' })

            for (const p of sampleParoki) await fetch('/api/master/paroki', { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify(p) })
            for (const k of sampleKategori) await fetch('/api/master/kategori', { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify(k) })
            for (const t of sampleTemplate) await fetch('/api/master/template-surat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify(t) })

            showSuccess('Data berhasil di-reset!')
            fetchAllData()
        } catch (e) {
            showError('Gagal reset data')
        } finally {
            setIsSaving(false)
        }
    }

    // CRUD Operations
    const handleSave = async () => {
        setIsSaving(true)
        try {
            let url = ''
            let body = {}

            if (activeTab === 'paroki') {
                url = editingItem ? `/api/master/paroki/${editingItem.id}` : '/api/master/paroki'
                body = parokiForm
            } else if (activeTab === 'kategori') {
                url = editingItem ? `/api/master/kategori/${editingItem.id}` : '/api/master/kategori'
                body = kategoriForm
            } else if (activeTab === 'template') {
                url = editingItem ? `/api/master/template-surat/${editingItem.id}` : '/api/master/template-surat'
                body = templateForm
            }

            const res = await fetch(url, {
                method: editingItem ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(body)
            })
            const data = await res.json()

            if (data.success) {
                showSuccess(editingItem ? 'Data berhasil diperbarui' : 'Data berhasil ditambahkan')
                setIsDialogOpen(false)
                resetForms()
                fetchAllData()
            } else {
                showError(data.error || 'Gagal menyimpan data')
            }
        } catch (e) {
            showError('Gagal menyimpan data')
        } finally {
            setIsSaving(false)
        }
    }

    const handleDelete = async (type: string, id: string) => {
        try {
            let url = ''
            if (type === 'paroki') url = `/api/master/paroki/${id}`
            else if (type === 'kategori') url = `/api/master/kategori/${id}`
            else if (type === 'template') url = `/api/master/template-surat/${id}`

            const res = await fetch(url, { method: 'DELETE', credentials: 'include' })
            const data = await res.json()

            if (data.success) {
                showSuccess('Data berhasil dihapus')
                fetchAllData()
            } else {
                showError(data.error || 'Gagal menghapus data')
            }
        } catch (e) {
            showError('Gagal menghapus data')
        }
    }

    const openAddDialog = () => {
        setEditingItem(null)
        resetForms()
        setIsDialogOpen(true)
    }

    const openEditDialog = (item: Paroki | Kategori | TemplateSurat) => {
        setEditingItem(item)
        if (activeTab === 'paroki') {
            const p = item as Paroki
            setParokiForm({ nama: p.nama, alamat: p.alamat || '', telepon: p.telepon || '', email: p.email || '', pastorParoki: p.pastorParoki || '', wilayah: p.wilayah || '', status: p.status })
        } else if (activeTab === 'kategori') {
            const k = item as Kategori
            setKategoriForm({ nama: k.nama, tipe: k.tipe, deskripsi: k.deskripsi || '', warna: k.warna || '#3B82F6', status: k.status })
        } else if (activeTab === 'template') {
            const t = item as TemplateSurat
            setTemplateForm({ nama: t.nama, kategori: t.kategori, deskripsi: t.deskripsi || '', konten: t.konten, status: t.status })
        }
        setIsDialogOpen(true)
    }

    const resetForms = () => {
        setParokiForm({ nama: "", alamat: "", telepon: "", email: "", pastorParoki: "", wilayah: "", status: "Aktif" })
        setKategoriForm({ nama: "", tipe: "agenda", deskripsi: "", warna: "#3B82F6", status: "Aktif" })
        setTemplateForm({ nama: "", kategori: "Edaran", deskripsi: "", konten: "", status: "Aktif" })
        setEditingItem(null)
    }

    // Filter data
    const filteredParoki = parokiList.filter(p => {
        const matchSearch = p.nama.toLowerCase().includes(searchTerm.toLowerCase()) || (p.alamat && p.alamat.toLowerCase().includes(searchTerm.toLowerCase()))
        const matchWilayah = filterWilayah === 'all' || p.wilayah === filterWilayah
        return matchSearch && matchWilayah
    })
    const filteredKategori = kategoriList.filter(k => k.nama.toLowerCase().includes(searchTerm.toLowerCase()) || k.tipe.toLowerCase().includes(searchTerm.toLowerCase()))
    const filteredTemplate = templateList.filter(t => t.nama.toLowerCase().includes(searchTerm.toLowerCase()) || t.kategori.toLowerCase().includes(searchTerm.toLowerCase()))

    // Get unique wilayah for filter
    const wilayahList = [...new Set(parokiList.map(p => p.wilayah).filter(Boolean))]

    // Group paroki by wilayah
    const parokiByWilayah = filteredParoki.reduce((acc, p) => {
        const w = p.wilayah || 'Lainnya'
        if (!acc[w]) acc[w] = []
        acc[w].push(p)
        return acc
    }, {} as Record<string, Paroki[]>)

    const hasData = parokiList.length > 0 || kategoriList.length > 0 || templateList.length > 0

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Master Data</h1>
                        <p className="text-muted-foreground">Kelola data paroki, kategori, dan template surat</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {!hasData ? (
                            <Button onClick={seedSampleData} disabled={isSaving}>
                                {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Database className="mr-2 h-4 w-4" />}
                                Tambah Data Contoh
                            </Button>
                        ) : (
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="outline" disabled={isSaving}>
                                        <RefreshCw className="mr-2 h-4 w-4" />
                                        Reset Data
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Reset Semua Data?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            Tindakan ini akan menghapus semua data dan mengisinya dengan data contoh baru.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Batal</AlertDialogCancel>
                                        <AlertDialogAction onClick={resetAndSeedData} className="bg-red-600 hover:bg-red-700">Reset</AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        )}
                        <Button onClick={openAddDialog}>
                            <Plus className="mr-2 h-4 w-4" />
                            Tambah
                        </Button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 sm:grid-cols-3">
                    <Card
                        className={cn(
                            "cursor-pointer transition-all",
                            activeTab === 'paroki'
                                ? "bg-blue-50 dark:bg-blue-950/30"
                                : "hover:bg-muted/50"
                        )}
                        onClick={() => setActiveTab('paroki')}
                    >
                        <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-sm font-medium text-muted-foreground">Paroki</CardTitle>
                                <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                                    <Church className="h-4 w-4 text-blue-500" />
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">{parokiList.length}</div>
                            <p className="text-xs text-muted-foreground mt-1">{wilayahList.length} Kevikepan</p>
                        </CardContent>
                    </Card>
                    <Card
                        className={cn(
                            "cursor-pointer transition-all",
                            activeTab === 'kategori'
                                ? "bg-green-50 dark:bg-green-950/30"
                                : "hover:bg-muted/50"
                        )}
                        onClick={() => setActiveTab('kategori')}
                    >
                        <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-sm font-medium text-muted-foreground">Kategori</CardTitle>
                                <div className="h-8 w-8 rounded-lg bg-green-500/10 flex items-center justify-center">
                                    <Tag className="h-4 w-4 text-green-500" />
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">{kategoriList.length}</div>
                            <p className="text-xs text-muted-foreground mt-1">4 tipe tersedia</p>
                        </CardContent>
                    </Card>
                    <Card
                        className={cn(
                            "cursor-pointer transition-all",
                            activeTab === 'template'
                                ? "bg-purple-50 dark:bg-purple-950/30"
                                : "hover:bg-muted/50"
                        )}
                        onClick={() => setActiveTab('template')}
                    >
                        <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-sm font-medium text-muted-foreground">Template Surat</CardTitle>
                                <div className="h-8 w-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
                                    <FileText className="h-4 w-4 text-purple-500" />
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">{templateList.length}</div>
                            <p className="text-xs text-muted-foreground mt-1">template tersedia</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <TabsList>
                            <TabsTrigger value="paroki">Paroki</TabsTrigger>
                            <TabsTrigger value="kategori">Kategori</TabsTrigger>
                            <TabsTrigger value="template">Template</TabsTrigger>
                            <TabsTrigger value="parameter">Parameter</TabsTrigger>
                        </TabsList>
                        <div className="flex gap-2">
                            <div className="relative flex-1 md:w-64">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Cari..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-8"
                                />
                            </div>
                            {activeTab === 'paroki' && wilayahList.length > 0 && (
                                <Select value={filterWilayah} onValueChange={setFilterWilayah}>
                                    <SelectTrigger className="w-48">
                                        <SelectValue placeholder="Filter Kevikepan" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Semua Kevikepan</SelectItem>
                                        {wilayahList.map(w => (
                                            <SelectItem key={w} value={w || ''}>{w}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        </div>
                    </div>

                    {/* Paroki Tab - Card Grid by Kevikepan */}
                    <TabsContent value="paroki" className="mt-4">
                        {isLoading ? (
                            <div className="flex justify-center py-8"><Loader2 className="h-8 w-8 animate-spin" /></div>
                        ) : Object.keys(parokiByWilayah).length === 0 ? (
                            <Card><CardContent className="py-8 text-center text-muted-foreground">Belum ada data paroki</CardContent></Card>
                        ) : (
                            <div className="space-y-6">
                                {Object.entries(parokiByWilayah).map(([wilayah, list]) => (
                                    <div key={wilayah}>
                                        <div className="flex items-center gap-2 mb-3">
                                            <MapPin className="h-5 w-5 text-muted-foreground" />
                                            <h3 className="text-lg font-semibold">{wilayah}</h3>
                                            <Badge variant="secondary">{list.length} paroki</Badge>
                                        </div>
                                        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                                            {list.map((item) => {
                                                const colors = getKevikepanColor(item.wilayah)
                                                return (
                                                    <Card key={item.id} className={cn("group transition-all", colors.bg)}>
                                                        <CardHeader className="pb-2">
                                                            <div className="flex items-start justify-between">
                                                                <CardTitle className="text-base">{item.nama}</CardTitle>
                                                                <div className="opacity-0 group-hover:opacity-100 flex gap-1 transition-opacity">
                                                                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEditDialog(item)}>
                                                                        <Pencil className="h-3.5 w-3.5" />
                                                                    </Button>
                                                                    <AlertDialog>
                                                                        <AlertDialogTrigger asChild>
                                                                            <Button variant="ghost" size="icon" className="h-7 w-7 text-red-600">
                                                                                <Trash2 className="h-3.5 w-3.5" />
                                                                            </Button>
                                                                        </AlertDialogTrigger>
                                                                        <AlertDialogContent>
                                                                            <AlertDialogHeader>
                                                                                <AlertDialogTitle>Hapus Paroki?</AlertDialogTitle>
                                                                                <AlertDialogDescription>Hapus {item.nama}?</AlertDialogDescription>
                                                                            </AlertDialogHeader>
                                                                            <AlertDialogFooter>
                                                                                <AlertDialogCancel>Batal</AlertDialogCancel>
                                                                                <AlertDialogAction onClick={() => handleDelete('paroki', item.id)} className="bg-red-600">Hapus</AlertDialogAction>
                                                                            </AlertDialogFooter>
                                                                        </AlertDialogContent>
                                                                    </AlertDialog>
                                                                </div>
                                                            </div>
                                                            <CardDescription>{item.alamat || '-'}</CardDescription>
                                                        </CardHeader>
                                                        {(item.pastorParoki || item.telepon) && (
                                                            <CardContent className="pt-0 text-sm text-muted-foreground">
                                                                {item.pastorParoki && <p>Pastor: {item.pastorParoki}</p>}
                                                                {item.telepon && <p>Telp: {item.telepon}</p>}
                                                            </CardContent>
                                                        )}
                                                    </Card>
                                                )
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </TabsContent>

                    {/* Kategori Tab */}
                    <TabsContent value="kategori" className="mt-4">
                        {isLoading ? (
                            <div className="flex justify-center py-8"><Loader2 className="h-8 w-8 animate-spin" /></div>
                        ) : filteredKategori.length === 0 ? (
                            <Card><CardContent className="py-8 text-center text-muted-foreground">Belum ada data kategori</CardContent></Card>
                        ) : (
                            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                                {filteredKategori.map((item) => (
                                    <Card key={item.id} className="group">
                                        <CardHeader className="pb-2">
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-center gap-2">
                                                    <div
                                                        className="w-3 h-3 rounded-full"
                                                        style={{ backgroundColor: item.warna || '#ccc' }}
                                                        aria-hidden="true"
                                                    />
                                                    <CardTitle className="text-base">{item.nama}</CardTitle>
                                                </div>
                                                <div className="opacity-0 group-hover:opacity-100 flex gap-1 transition-opacity">
                                                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEditDialog(item)}>
                                                        <Pencil className="h-3.5 w-3.5" />
                                                    </Button>
                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild>
                                                            <Button variant="ghost" size="icon" className="h-7 w-7 text-red-600">
                                                                <Trash2 className="h-3.5 w-3.5" />
                                                            </Button>
                                                        </AlertDialogTrigger>
                                                        <AlertDialogContent>
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle>Hapus Kategori?</AlertDialogTitle>
                                                                <AlertDialogDescription>Hapus {item.nama}?</AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel>Batal</AlertDialogCancel>
                                                                <AlertDialogAction onClick={() => handleDelete('kategori', item.id)} className="bg-red-600">Hapus</AlertDialogAction>
                                                            </AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>
                                                </div>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="pt-0">
                                            <Badge variant="outline">{item.tipe}</Badge>
                                            {item.deskripsi && <p className="text-sm text-muted-foreground mt-1">{item.deskripsi}</p>}
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </TabsContent>

                    {/* Template Tab */}
                    <TabsContent value="template" className="mt-4">
                        {isLoading ? (
                            <div className="flex justify-center py-8"><Loader2 className="h-8 w-8 animate-spin" /></div>
                        ) : filteredTemplate.length === 0 ? (
                            <Card><CardContent className="py-8 text-center text-muted-foreground">Belum ada template surat</CardContent></Card>
                        ) : (
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                {filteredTemplate.map((item) => (
                                    <Card key={item.id} className="group">
                                        <CardHeader>
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <CardTitle className="text-base">{item.nama}</CardTitle>
                                                    <CardDescription>{item.deskripsi || '-'}</CardDescription>
                                                </div>
                                                <div className="opacity-0 group-hover:opacity-100 flex gap-1 transition-opacity">
                                                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEditDialog(item)}>
                                                        <Pencil className="h-3.5 w-3.5" />
                                                    </Button>
                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild>
                                                            <Button variant="ghost" size="icon" className="h-7 w-7 text-red-600">
                                                                <Trash2 className="h-3.5 w-3.5" />
                                                            </Button>
                                                        </AlertDialogTrigger>
                                                        <AlertDialogContent>
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle>Hapus Template?</AlertDialogTitle>
                                                                <AlertDialogDescription>Hapus {item.nama}?</AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel>Batal</AlertDialogCancel>
                                                                <AlertDialogAction onClick={() => handleDelete('template', item.id)} className="bg-red-600">Hapus</AlertDialogAction>
                                                            </AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>
                                                </div>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <Badge>{item.kategori}</Badge>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </TabsContent>

                    {/* Parameter Tab */}
                    <TabsContent value="parameter" className="mt-4">
                        <ParameterManagement />
                    </TabsContent>
                </Tabs>

                {/* Add/Edit Dialog */}
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogContent className="max-w-lg">
                        <DialogHeader>
                            <DialogTitle>
                                {editingItem ? 'Edit' : 'Tambah'} {activeTab === 'paroki' ? 'Paroki' : activeTab === 'kategori' ? 'Kategori' : 'Template'}
                            </DialogTitle>
                            <DialogDescription>Lengkapi data di bawah ini</DialogDescription>
                        </DialogHeader>

                        {activeTab === 'paroki' && (
                            <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <Label>Nama Paroki *</Label>
                                    <Input value={parokiForm.nama} onChange={(e) => setParokiForm({ ...parokiForm, nama: e.target.value })} />
                                </div>
                                <div className="grid gap-2">
                                    <Label>Kevikepan</Label>
                                    <Select value={parokiForm.wilayah} onValueChange={(v) => setParokiForm({ ...parokiForm, wilayah: v })}>
                                        <SelectTrigger><SelectValue placeholder="Pilih Kevikepan" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Kevikepan Surabaya Selatan">Kevikepan Surabaya Selatan</SelectItem>
                                            <SelectItem value="Kevikepan Surabaya Barat">Kevikepan Surabaya Barat</SelectItem>
                                            <SelectItem value="Kevikepan Surabaya Utara">Kevikepan Surabaya Utara</SelectItem>
                                            <SelectItem value="Kevikepan Mojokerto">Kevikepan Mojokerto</SelectItem>
                                            <SelectItem value="Kevikepan Kediri">Kevikepan Kediri</SelectItem>
                                            <SelectItem value="Kevikepan Blora">Kevikepan Blora</SelectItem>
                                            <SelectItem value="Kevikepan Madiun">Kevikepan Madiun</SelectItem>
                                            <SelectItem value="Kevikepan Blitar">Kevikepan Blitar</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid gap-2">
                                    <Label>Alamat</Label>
                                    <Input value={parokiForm.alamat} onChange={(e) => setParokiForm({ ...parokiForm, alamat: e.target.value })} />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label>Telepon</Label>
                                        <Input value={parokiForm.telepon} onChange={(e) => setParokiForm({ ...parokiForm, telepon: e.target.value })} />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>Email</Label>
                                        <Input type="email" value={parokiForm.email} onChange={(e) => setParokiForm({ ...parokiForm, email: e.target.value })} />
                                    </div>
                                </div>
                                <div className="grid gap-2">
                                    <Label>Pastor Paroki</Label>
                                    <Input value={parokiForm.pastorParoki} onChange={(e) => setParokiForm({ ...parokiForm, pastorParoki: e.target.value })} />
                                </div>
                            </div>
                        )}

                        {activeTab === 'kategori' && (
                            <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label>Nama *</Label>
                                        <Input value={kategoriForm.nama} onChange={(e) => setKategoriForm({ ...kategoriForm, nama: e.target.value })} />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>Tipe *</Label>
                                        <Select value={kategoriForm.tipe} onValueChange={(v) => setKategoriForm({ ...kategoriForm, tipe: v })}>
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="agenda">Agenda</SelectItem>
                                                <SelectItem value="tugas">Tugas</SelectItem>
                                                <SelectItem value="surat">Surat</SelectItem>
                                                <SelectItem value="keputusan">Keputusan</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className="grid gap-2">
                                    <Label>Deskripsi</Label>
                                    <Input value={kategoriForm.deskripsi} onChange={(e) => setKategoriForm({ ...kategoriForm, deskripsi: e.target.value })} />
                                </div>
                                <div className="grid gap-2">
                                    <Label>Warna</Label>
                                    <div className="flex gap-2">
                                        <Input type="color" value={kategoriForm.warna} onChange={(e) => setKategoriForm({ ...kategoriForm, warna: e.target.value })} className="w-12 h-10 p-1" />
                                        <Input value={kategoriForm.warna} onChange={(e) => setKategoriForm({ ...kategoriForm, warna: e.target.value })} className="flex-1" />
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'template' && (
                            <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label>Nama *</Label>
                                        <Input value={templateForm.nama} onChange={(e) => setTemplateForm({ ...templateForm, nama: e.target.value })} />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>Kategori *</Label>
                                        <Select value={templateForm.kategori} onValueChange={(v) => setTemplateForm({ ...templateForm, kategori: v })}>
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Edaran">Edaran</SelectItem>
                                                <SelectItem value="Undangan">Undangan</SelectItem>
                                                <SelectItem value="Rekomendasi">Rekomendasi</SelectItem>
                                                <SelectItem value="Persetujuan">Persetujuan</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className="grid gap-2">
                                    <Label>Deskripsi</Label>
                                    <Input value={templateForm.deskripsi} onChange={(e) => setTemplateForm({ ...templateForm, deskripsi: e.target.value })} />
                                </div>
                                <div className="grid gap-2">
                                    <Label>Konten Template *</Label>
                                    <div className="border rounded-md">
                                        <RichTextEditor
                                            content={templateForm.konten}
                                            onChange={(html) => setTemplateForm({ ...templateForm, konten: html })}
                                            placeholder="Gunakan {variabel} untuk placeholder"
                                            minHeight="300px"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Batal</Button>
                            <Button onClick={handleSave} disabled={isSaving}>
                                {isSaving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Menyimpan...</> : 'Simpan'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </DashboardLayout>
    )
}
