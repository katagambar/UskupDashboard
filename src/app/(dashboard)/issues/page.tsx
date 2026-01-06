"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
    Plus,
    Search,
    MessageSquare,
    Clock,
    CheckCircle,
    AlertTriangle,
    FileText,
    Users
} from "lucide-react"

interface Issue {
    id: string
    title: string
    description: string
    category: string | null
    priority: string
    status: string
    createdAt: string
    creator: {
        id: string
        name: string
        role: string
    }
    _count?: {
        opinions: number
    }
}

const statusColors: Record<string, string> = {
    DRAFT: "bg-gray-500",
    OPEN: "bg-blue-500",
    IN_REVIEW: "bg-yellow-500",
    DECIDED: "bg-green-500",
    CLOSED: "bg-gray-400",
}

const statusLabels: Record<string, string> = {
    DRAFT: "Draft",
    OPEN: "Menunggu Pendapat",
    IN_REVIEW: "Sedang Direview",
    DECIDED: "Keputusan Diambil",
    CLOSED: "Ditutup",
}

const priorityColors: Record<string, string> = {
    LOW: "bg-gray-400",
    MEDIUM: "bg-blue-400",
    HIGH: "bg-orange-500",
    URGENT: "bg-red-500",
}

export default function IssuesPage() {
    const [issues, setIssues] = useState<Issue[]>([])
    const [loading, setLoading] = useState(true)
    const [statusFilter, setStatusFilter] = useState<string>("all")
    const [searchQuery, setSearchQuery] = useState("")
    const [isCreateOpen, setIsCreateOpen] = useState(false)
    const [creating, setCreating] = useState(false)

    // Form state
    const [newIssue, setNewIssue] = useState({
        title: "",
        description: "",
        category: "",
        priority: "MEDIUM"
    })

    useEffect(() => {
        fetchIssues()
    }, [statusFilter])

    const fetchIssues = async () => {
        try {
            setLoading(true)
            const params = new URLSearchParams()
            if (statusFilter !== "all") params.set("status", statusFilter)

            const res = await fetch(`/api/issues?${params}`)
            const data = await res.json()

            if (data.success) {
                setIssues(data.data)
            }
        } catch (error) {
            console.error("Failed to fetch issues:", error)
        } finally {
            setLoading(false)
        }
    }

    const handleCreate = async () => {
        if (!newIssue.title || !newIssue.description) return

        try {
            setCreating(true)
            const res = await fetch("/api/issues", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newIssue)
            })

            const data = await res.json()
            if (data.success) {
                setIsCreateOpen(false)
                setNewIssue({ title: "", description: "", category: "", priority: "MEDIUM" })
                fetchIssues()
            }
        } catch (error) {
            console.error("Failed to create issue:", error)
        } finally {
            setCreating(false)
        }
    }

    const filteredIssues = issues.filter(issue =>
        issue.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        issue.description.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold">Konsultasi & Disposisi</h1>
                        <p className="text-muted-foreground">
                            Kelola isu dan minta pendapat dari pejabat strategis
                        </p>
                    </div>

                    <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="mr-2 h-4 w-4" />
                                Buat Isu Baru
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-lg">
                            <DialogHeader>
                                <DialogTitle>Buat Isu Baru</DialogTitle>
                                <DialogDescription>
                                    Buat isu atau kasus yang memerlukan konsultasi dari pejabat lain
                                </DialogDescription>
                            </DialogHeader>

                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label htmlFor="title">Judul Isu</Label>
                                    <Input
                                        id="title"
                                        placeholder="Contoh: Proposal Pembangunan Gereja Baru"
                                        value={newIssue.title}
                                        onChange={(e) => setNewIssue({ ...newIssue, title: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="description">Deskripsi</Label>
                                    <Textarea
                                        id="description"
                                        placeholder="Jelaskan detail isu dan apa yang perlu dikonsultasikan..."
                                        rows={4}
                                        value={newIssue.description}
                                        onChange={(e) => setNewIssue({ ...newIssue, description: e.target.value })}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="category">Kategori</Label>
                                        <Select
                                            value={newIssue.category}
                                            onValueChange={(v) => setNewIssue({ ...newIssue, category: v })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Pilih kategori" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Pastoral">Pastoral</SelectItem>
                                                <SelectItem value="Keuangan">Keuangan</SelectItem>
                                                <SelectItem value="Hukum Kanonik">Hukum Kanonik</SelectItem>
                                                <SelectItem value="Pembangunan">Pembangunan</SelectItem>
                                                <SelectItem value="SDM">SDM</SelectItem>
                                                <SelectItem value="Lainnya">Lainnya</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="priority">Prioritas</Label>
                                        <Select
                                            value={newIssue.priority}
                                            onValueChange={(v) => setNewIssue({ ...newIssue, priority: v })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="LOW">Rendah</SelectItem>
                                                <SelectItem value="MEDIUM">Sedang</SelectItem>
                                                <SelectItem value="HIGH">Tinggi</SelectItem>
                                                <SelectItem value="URGENT">Urgent</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </div>

                            <DialogFooter>
                                <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                                    Batal
                                </Button>
                                <Button onClick={handleCreate} disabled={creating || !newIssue.title}>
                                    {creating ? "Membuat..." : "Buat Isu"}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>

                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Cari isu..."
                            className="pl-9"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Filter status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Semua Status</SelectItem>
                            <SelectItem value="DRAFT">Draft</SelectItem>
                            <SelectItem value="OPEN">Menunggu Pendapat</SelectItem>
                            <SelectItem value="IN_REVIEW">Sedang Direview</SelectItem>
                            <SelectItem value="DECIDED">Keputusan Diambil</SelectItem>
                            <SelectItem value="CLOSED">Ditutup</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Issues Grid */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[...Array(6)].map((_, i) => (
                            <Card key={i} className="animate-pulse">
                                <CardHeader>
                                    <div className="h-5 bg-muted rounded w-3/4" />
                                    <div className="h-4 bg-muted rounded w-1/2 mt-2" />
                                </CardHeader>
                                <CardContent>
                                    <div className="h-4 bg-muted rounded w-full" />
                                    <div className="h-4 bg-muted rounded w-2/3 mt-2" />
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : filteredIssues.length === 0 ? (
                    <Card>
                        <CardContent className="py-12 text-center">
                            <FileText className="mx-auto h-12 w-12 text-muted-foreground/50" />
                            <h3 className="mt-4 font-semibold">Belum ada isu</h3>
                            <p className="text-muted-foreground">
                                Buat isu baru untuk memulai proses konsultasi
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredIssues.map((issue) => (
                            <Card
                                key={issue.id}
                                className="hover:shadow-md transition-shadow cursor-pointer"
                                onClick={() => window.location.href = `/issues/${issue.id}`}
                            >
                                <CardHeader className="pb-3">
                                    <div className="flex items-start justify-between gap-2">
                                        <CardTitle className="text-base line-clamp-2">
                                            {issue.title}
                                        </CardTitle>
                                        <Badge className={priorityColors[issue.priority]}>
                                            {issue.priority}
                                        </Badge>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Badge variant="outline" className={statusColors[issue.status]}>
                                            {statusLabels[issue.status]}
                                        </Badge>
                                        {issue.category && (
                                            <Badge variant="secondary">{issue.category}</Badge>
                                        )}
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                                        {issue.description}
                                    </p>
                                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                                        <div className="flex items-center gap-1">
                                            <Users className="h-3 w-3" />
                                            <span>{issue.creator.name}</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="flex items-center gap-1">
                                                <MessageSquare className="h-3 w-3" />
                                                <span>{issue._count?.opinions || 0}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Clock className="h-3 w-3" />
                                                <span>{new Date(issue.createdAt).toLocaleDateString('id-ID')}</span>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </DashboardLayout>
    )
}
