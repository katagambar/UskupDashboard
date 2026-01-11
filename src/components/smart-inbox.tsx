"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
    Bell,
    FileText,
    MessageSquare,
    ClipboardList,
    AlertTriangle,
    CheckCircle,
    ChevronRight,
    RefreshCw,
    Inbox
} from "lucide-react"
import { cn } from "@/lib/utils"

interface InboxItem {
    id: string
    type: 'SURAT_PENDING' | 'DISPOSITION' | 'CRITICAL_REPORT' | 'ISSUE_PENDING' | 'TASK_URGENT'
    title: string
    description: string
    priority: 'HIGH' | 'MEDIUM' | 'LOW'
    createdAt: string
    actionUrl: string
}

interface InboxData {
    total: number
    byType: {
        suratPending: number
        dispositions: number
        criticalReports: number
        issuePending: number
        taskUrgent: number
    }
    items: InboxItem[]
}

const typeConfig = {
    SURAT_PENDING: {
        icon: FileText,
        label: 'Surat',
        color: 'text-blue-600 bg-blue-50 dark:bg-blue-950/50'
    },
    DISPOSITION: {
        icon: ClipboardList,
        label: 'Disposisi',
        color: 'text-purple-600 bg-purple-50 dark:bg-purple-950/50'
    },
    CRITICAL_REPORT: {
        icon: AlertTriangle,
        label: 'Laporan',
        color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/50'
    },
    ISSUE_PENDING: {
        icon: MessageSquare,
        label: 'Konsultasi',
        color: 'text-green-600 bg-green-50 dark:bg-green-950/50'
    },
    TASK_URGENT: {
        icon: CheckCircle,
        label: 'Tugas',
        color: 'text-red-600 bg-red-50 dark:bg-red-950/50'
    }
}

const priorityColors = {
    HIGH: 'bg-red-500',
    MEDIUM: 'bg-amber-500',
    LOW: 'bg-gray-400'
}

export function SmartInbox() {
    const router = useRouter()
    const [open, setOpen] = useState(false)
    const [data, setData] = useState<InboxData | null>(null)
    const [isLoading, setIsLoading] = useState(false)

    const fetchInbox = async () => {
        setIsLoading(true)
        try {
            const response = await fetch('/api/inbox')
            const result = await response.json()
            if (result.success) {
                setData(result.data)
            }
        } catch (error) {
            console.error('Failed to fetch inbox:', error)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        if (open) {
            fetchInbox()
        }
    }, [open])

    // Auto-refresh every minute
    useEffect(() => {
        const interval = setInterval(() => {
            if (open) fetchInbox()
        }, 60000)
        return () => clearInterval(interval)
    }, [open])

    const handleItemClick = (url: string) => {
        setOpen(false)
        router.push(url)
    }

    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        const now = new Date()
        const diff = now.getTime() - date.getTime()
        const hours = Math.floor(diff / (1000 * 60 * 60))
        const days = Math.floor(hours / 24)

        if (hours < 1) return 'Baru saja'
        if (hours < 24) return `${hours} jam lalu`
        if (days < 7) return `${days} hari lalu`
        return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
    }

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <Inbox className="h-5 w-5" />
                    {data && data.total > 0 && (
                        <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-[10px] font-bold text-white flex items-center justify-center">
                            {data.total > 9 ? '9+' : data.total}
                        </span>
                    )}
                    <span className="sr-only">Smart Inbox</span>
                </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-96 p-0" title="Smart Inbox">
                <SheetHeader className="p-4 border-b">
                    <div className="flex items-center justify-between">
                        <SheetTitle className="flex items-center gap-2">
                            <Bell className="h-5 w-5" />
                            Smart Inbox
                        </SheetTitle>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={fetchInbox}
                            disabled={isLoading}
                        >
                            <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
                        </Button>
                    </div>
                    {data && (
                        <div className="flex gap-2 flex-wrap mt-2">
                            {data.byType.suratPending > 0 && (
                                <Badge variant="secondary" className="gap-1">
                                    <FileText className="h-3 w-3" />
                                    {data.byType.suratPending}
                                </Badge>
                            )}
                            {data.byType.issuePending > 0 && (
                                <Badge variant="secondary" className="gap-1">
                                    <MessageSquare className="h-3 w-3" />
                                    {data.byType.issuePending}
                                </Badge>
                            )}
                            {data.byType.criticalReports > 0 && (
                                <Badge variant="secondary" className="gap-1">
                                    <AlertTriangle className="h-3 w-3" />
                                    {data.byType.criticalReports}
                                </Badge>
                            )}
                            {data.byType.taskUrgent > 0 && (
                                <Badge variant="secondary" className="gap-1">
                                    <CheckCircle className="h-3 w-3" />
                                    {data.byType.taskUrgent}
                                </Badge>
                            )}
                        </div>
                    )}
                </SheetHeader>

                <ScrollArea className="h-[calc(100vh-140px)]">
                    {isLoading && !data ? (
                        <div className="flex items-center justify-center py-12">
                            <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
                        </div>
                    ) : data?.items.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <CheckCircle className="h-12 w-12 text-green-500 mb-3" />
                            <p className="font-medium">Semua Beres!</p>
                            <p className="text-sm text-muted-foreground">
                                Tidak ada item yang perlu ditindaklanjuti
                            </p>
                        </div>
                    ) : (
                        <div className="divide-y">
                            {data?.items.map((item) => {
                                const config = typeConfig[item.type]
                                const Icon = config.icon

                                return (
                                    <div
                                        key={item.id}
                                        className="p-3 hover:bg-muted/50 cursor-pointer transition-colors"
                                        onClick={() => handleItemClick(item.actionUrl)}
                                    >
                                        <div className="flex gap-3">
                                            <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0", config.color)}>
                                                <Icon className="h-5 w-5" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-2">
                                                    <p className="font-medium text-sm truncate">{item.title}</p>
                                                    <div className={cn("w-2 h-2 rounded-full flex-shrink-0 mt-1.5", priorityColors[item.priority])} />
                                                </div>
                                                <p className="text-xs text-muted-foreground truncate">{item.description}</p>
                                                <p className="text-xs text-muted-foreground mt-1">{formatDate(item.createdAt)}</p>
                                            </div>
                                            <ChevronRight className="h-4 w-4 text-muted-foreground self-center flex-shrink-0" />
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </ScrollArea>
            </SheetContent>
        </Sheet>
    )
}
