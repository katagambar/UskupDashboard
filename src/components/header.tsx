"use client"

import { usePathname } from "next/navigation"
import { ThemeToggle } from "@/components/theme-toggle"
import { Notifications } from "@/components/notifications"
import { SmartInbox } from "@/components/smart-inbox"
import { Button } from "@/components/ui/button"
import { Menu, Search } from "lucide-react"
import { Input } from "@/components/ui/input"

// Page titles mapping
const pageTitles: Record<string, { title: string; description?: string }> = {
  "/": { title: "Dashboard", description: "Ringkasan aktivitas keuskupan" },
  "/ai-assistant": { title: "AI Assistant", description: "Asisten teologis Katolik Magisterium" },
  "/analytics": { title: "Analytics", description: "Visualisasi data keuskupan" },
  "/notulensi": { title: "Notulensi", description: "Catatan rapat dan pertemuan" },
  "/agenda": { title: "Agenda", description: "Jadwal kegiatan uskup" },
  "/tasks": { title: "Tugas Uskup", description: "Daftar tugas dan tindak lanjut" },
  "/surat": { title: "Surat Menyurat", description: "Korespondensi keuskupan" },
  "/issues": { title: "Konsultasi", description: "Konsultasi dan pendapat" },
  "/reports": { title: "Laporan", description: "Laporan dari unit kerja" },
  "/reports/summary": { title: "Executive Summary", description: "Ringkasan kesehatan unit kerja" },
  "/timeline": { title: "Timeline & Report", description: "Laporan dan timeline" },
  "/database-imam": { title: "Database Imam", description: "Data imam keuskupan" },
  "/master-data": { title: "Master Data", description: "Kelola data master" },
  "/profil": { title: "Profil Uskup", description: "Informasi pribadi uskup" },
  "/settings": { title: "Pengaturan", description: "Konfigurasi aplikasi" },
}

interface HeaderProps {
  onMenuClick?: () => void
}

export function Header({ onMenuClick }: HeaderProps) {
  const pathname = usePathname()
  const pageInfo = pageTitles[pathname] || { title: "Dashboard", description: "" }

  return (
    <header className="h-20 border-b border-gray-200 dark:border-slate-700/50 bg-gray-50 dark:bg-gradient-to-r dark:from-slate-900 dark:to-slate-950 flex items-center gap-4 px-4 md:px-6 shrink-0">
      {/* Mobile Menu Button */}
      {onMenuClick && (
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden shrink-0 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-white/10"
          onClick={onMenuClick}
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Menu</span>
        </Button>
      )}

      {/* Page Title */}
      <div className="flex-1 min-w-0">
        <h1 className="text-lg font-semibold truncate text-gray-900 dark:text-white">{pageInfo.title}</h1>
        {pageInfo.description && (
          <p className="text-sm text-gray-500 dark:text-slate-400 truncate hidden sm:block">
            {pageInfo.description}
          </p>
        )}
      </div>

      {/* Search - Desktop only */}
      <div className="hidden lg:flex relative w-64">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-slate-400" />
        <Input
          placeholder="Cari..."
          className="pl-9 h-9 bg-white dark:bg-slate-800/50 border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-500 focus:ring-blue-500"
        />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 shrink-0">
        <SmartInbox />
        <Notifications />
        <ThemeToggle />
      </div>
    </header>
  )
}