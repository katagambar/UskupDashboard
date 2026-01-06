"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
    ArrowLeft,
    Send,
    CheckCircle,
    Clock,
    User,
    MessageSquare,
    Gavel,
    AlertTriangle
} from "lucide-react"

interface Opinion {
    id: string
    content: string
    recommendation: string | null
    createdAt: string
    author: {
        id: string
        name: string
        role: string
        jabatan: string | null
    }
}

interface Issue {
    id: string
    title: string
    description: string
    category: string | null
    priority: string
    status: string
    decision: string | null
    decisionDate: string | null
    decisionNotes: string | null
    createdAt: string
    creator: {
        id: string
        name: string
        role: string
        jabatan: string | null
    }
    opinions: Opinion[]
}

const statusLabels: Record<string, string> = {
    DRAFT: "Draft",
    OPEN: "Menunggu Pendapat",
    IN_REVIEW: "Sedang Direview",
    DECIDED: "Keputusan Diambil",
    CLOSED: "Ditutup",
}

export default function IssueDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params)
    const router = useRouter()
    const [issue, setIssue] = useState<Issue | null>(null)
    const [loading, setLoading] = useState(true)

    // Opinion form
    const [opinionContent, setOpinionContent] = useState("")
    const [recommendation, setRecommendation] = useState("")
    const [submittingOpinion, setSubmittingOpinion] = useState(false)

    // Decision form (untuk Uskup)
    const [decision, setDecision] = useState("")
    const [decisionNotes, setDecisionNotes] = useState("")
    const [submittingDecision, setSubmittingDecision] = useState(false)

    useEffect(() => {
        fetchIssue()
    }, [id])

    const fetchIssue = async () => {
        try {
            setLoading(true)
            const res = await fetch(`/api/issues/${id}`)
            const data = await res.json()

            if (data.success) {
                setIssue(data.data)
            }
        } catch (error) {
            console.error("Failed to fetch issue:", error)
        } finally {
            setLoading(false)
        }
    }

    const handleSubmitOpinion = async () => {
        if (!opinionContent) return

        try {
            setSubmittingOpinion(true)
            const res = await fetch(`/api/issues/${id}/opinions`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ content: opinionContent, recommendation })
            })

            const data = await res.json()
            if (data.success) {
                setOpinionContent("")
                setRecommendation("")
                fetchIssue()
            } else {
                alert(data.error)
            }
        } catch (error) {
            console.error("Failed to submit opinion:", error)
        } finally {
            setSubmittingOpinion(false)
        }
    }

    const handleMakeDecision = async () => {
        if (!decision) return

        try {
            setSubmittingDecision(true)
            const res = await fetch(`/api/issues/${id}/decide`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ decision, decisionNotes })
            })

            const data = await res.json()
            if (data.success) {
                fetchIssue()
            } else {
                alert(data.error)
            }
        } catch (error) {
            console.error("Failed to make decision:", error)
        } finally {
            setSubmittingDecision(false)
        }
    }

    const handleOpenForConsultation = async () => {
        try {
            const res = await fetch(`/api/issues/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: "OPEN", consultantIds: [] })
            })

            if (res.ok) {
                fetchIssue()
            }
        } catch (error) {
            console.error("Failed to open for consultation:", error)
        }
    }

    if (loading) {
        return (
            <DashboardLayout>
                <div className="space-y-6 animate-pulse">
                    <div className="h-8 bg-muted rounded w-1/3" />
                    <div className="h-48 bg-muted rounded" />
                    <div className="h-32 bg-muted rounded" />
                </div>
            </DashboardLayout>
        )
    }

    if (!issue) {
        return (
            <DashboardLayout>
                <div className="text-center py-12">
                    <AlertTriangle className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h2 className="mt-4 font-semibold">Isu tidak ditemukan</h2>
                    <Button className="mt-4" onClick={() => router.push("/issues")}>
                        Kembali ke daftar
                    </Button>
                </div>
            </DashboardLayout>
        )
    }

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.push("/issues")}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div className="flex-1">
                        <h1 className="text-2xl font-bold">{issue.title}</h1>
                        <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline">{statusLabels[issue.status]}</Badge>
                            <Badge>{issue.priority}</Badge>
                            {issue.category && <Badge variant="secondary">{issue.category}</Badge>}
                        </div>
                    </div>

                    {issue.status === "DRAFT" && (
                        <Button onClick={handleOpenForConsultation}>
                            Buka untuk Konsultasi
                        </Button>
                    )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Description */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Deskripsi Isu</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="whitespace-pre-wrap">{issue.description}</p>
                            </CardContent>
                        </Card>

                        {/* Opinions */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <MessageSquare className="h-5 w-5" />
                                    Pendapat ({issue.opinions.length})
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {issue.opinions.length === 0 ? (
                                    <p className="text-muted-foreground text-center py-8">
                                        Belum ada pendapat yang masuk
                                    </p>
                                ) : (
                                    issue.opinions.map((opinion) => (
                                        <div key={opinion.id} className="border rounded-lg p-4">
                                            <div className="flex items-start gap-3">
                                                <Avatar className="h-10 w-10">
                                                    <AvatarFallback>
                                                        {opinion.author.name?.charAt(0) || "?"}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="flex-1">
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <p className="font-medium">{opinion.author.name}</p>
                                                            <p className="text-sm text-muted-foreground">
                                                                {opinion.author.jabatan || opinion.author.role}
                                                            </p>
                                                        </div>
                                                        {opinion.recommendation && (
                                                            <Badge variant="outline">{opinion.recommendation}</Badge>
                                                        )}
                                                    </div>
                                                    <p className="mt-2 text-sm whitespace-pre-wrap">{opinion.content}</p>
                                                    <p className="text-xs text-muted-foreground mt-2">
                                                        {new Date(opinion.createdAt).toLocaleString('id-ID')}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}

                                {/* Opinion Form */}
                                {(issue.status === "OPEN" || issue.status === "IN_REVIEW") && (
                                    <>
                                        <Separator className="my-4" />
                                        <div className="space-y-4">
                                            <h4 className="font-medium">Berikan Pendapat Anda</h4>
                                            <div className="space-y-2">
                                                <Textarea
                                                    placeholder="Tulis pendapat atau telaah Anda..."
                                                    rows={4}
                                                    value={opinionContent}
                                                    onChange={(e) => setOpinionContent(e.target.value)}
                                                />
                                            </div>
                                            <div className="flex items-end gap-4">
                                                <div className="flex-1 space-y-2">
                                                    <Label>Rekomendasi</Label>
                                                    <Select value={recommendation} onValueChange={setRecommendation}>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Pilih rekomendasi" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="Setuju">Setuju</SelectItem>
                                                            <SelectItem value="Setuju dengan Catatan">Setuju dengan Catatan</SelectItem>
                                                            <SelectItem value="Perlu Kajian">Perlu Kajian Lebih Lanjut</SelectItem>
                                                            <SelectItem value="Tolak">Tolak</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <Button
                                                    onClick={handleSubmitOpinion}
                                                    disabled={submittingOpinion || !opinionContent}
                                                >
                                                    <Send className="mr-2 h-4 w-4" />
                                                    {submittingOpinion ? "Mengirim..." : "Kirim Pendapat"}
                                                </Button>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </CardContent>
                        </Card>

                        {/* Decision (if made) */}
                        {issue.decision && (
                            <Card className="border-green-200 bg-green-50 dark:bg-green-900/20">
                                <CardHeader>
                                    <CardTitle className="text-lg flex items-center gap-2 text-green-700 dark:text-green-400">
                                        <Gavel className="h-5 w-5" />
                                        Keputusan Uskup
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="font-medium text-lg">{issue.decision}</p>
                                    {issue.decisionNotes && (
                                        <p className="mt-2 text-muted-foreground">{issue.decisionNotes}</p>
                                    )}
                                    <p className="text-sm text-muted-foreground mt-4">
                                        Diputuskan pada: {issue.decisionDate && new Date(issue.decisionDate).toLocaleString('id-ID')}
                                    </p>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Info Card */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Informasi Isu</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <User className="h-4 w-4 text-muted-foreground" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">Dibuat oleh</p>
                                        <p className="font-medium">{issue.creator.name}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Clock className="h-4 w-4 text-muted-foreground" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">Tanggal dibuat</p>
                                        <p className="font-medium">
                                            {new Date(issue.createdAt).toLocaleDateString('id-ID', {
                                                dateStyle: 'long'
                                            })}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Decision Form (Uskup only - TODO: check user role) */}
                        {issue.status !== "DECIDED" && issue.status !== "CLOSED" && issue.opinions.length > 0 && (
                            <Card className="border-primary/50">
                                <CardHeader>
                                    <CardTitle className="text-base flex items-center gap-2">
                                        <Gavel className="h-4 w-4" />
                                        Ambil Keputusan
                                    </CardTitle>
                                    <CardDescription>
                                        Sebagai Uskup, Anda dapat mengambil keputusan akhir
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label>Keputusan</Label>
                                        <Textarea
                                            placeholder="Tulis keputusan akhir..."
                                            rows={3}
                                            value={decision}
                                            onChange={(e) => setDecision(e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Catatan Tambahan (Opsional)</Label>
                                        <Textarea
                                            placeholder="Catatan atau instruksi lanjutan..."
                                            rows={2}
                                            value={decisionNotes}
                                            onChange={(e) => setDecisionNotes(e.target.value)}
                                        />
                                    </div>
                                    <Button
                                        className="w-full"
                                        onClick={handleMakeDecision}
                                        disabled={submittingDecision || !decision}
                                    >
                                        <CheckCircle className="mr-2 h-4 w-4" />
                                        {submittingDecision ? "Menyimpan..." : "Simpan Keputusan"}
                                    </Button>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    )
}
