"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { useCurrentUser } from "@/hooks/useAuth"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  LayoutDashboard,
  FileText,
  Calendar,
  CheckSquare,
  Mail,
  BarChart3,
  Users,
  Settings,
  UserCheck,
  Database,
  LogOut,
  ChevronsUpDown,
  MessageSquareMore,
  FileBarChart,
  PieChart,
  Sparkles,
} from "lucide-react"

const sidebarNavItems = [
  { title: "Dashboard", href: "/", icon: LayoutDashboard },
  { title: "Agenda", href: "/agenda", icon: Calendar },
  { title: "Tugas Uskup", href: "/tasks", icon: CheckSquare },
  { title: "Surat Menyurat", href: "/surat", icon: Mail },
  { title: "Notulensi", href: "/notulensi", icon: FileText },
  { title: "Konsultasi", href: "/issues", icon: MessageSquareMore },
  { title: "Laporan", href: "/reports", icon: FileBarChart },
  { title: "Timeline & Report", href: "/timeline", icon: BarChart3 },
  { title: "Pengaturan", href: "/settings", icon: Settings },
  { title: "Master Data", href: "/master-data", icon: Database },
  { title: "Database Imam", href: "/database-imam", icon: Users },
  { title: "Analytics", href: "/analytics", icon: PieChart },
  { title: "AI Assistant", href: "/ai-assistant", icon: Sparkles },
]

interface SidebarNavProps {
  className?: string
  onItemClick?: () => void
}

export function SidebarNav({ className, onItemClick }: SidebarNavProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout } = useCurrentUser()

  const handleSignOut = async () => {
    const result = await logout()
    if (result.success) {
      router.push("/auth/signin")
    }
  }

  const handleNavigation = (href: string) => {
    if (onItemClick) onItemClick()
    router.push(href)
  }

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Sidebar Header - Logo Keuskupan */}
      <div className="h-20 flex items-center gap-3 px-4 border-b border-gray-200 dark:border-white/10 shrink-0">
        <img
          src="/logo-keuskupan.jpg"
          alt="Logo Keuskupan Surabaya"
          className="h-14 w-14 object-contain shrink-0 rounded-2xl"
        />
        <div className="flex flex-col">
          <span className="font-bold text-lg leading-tight text-gray-900 dark:text-white">Keuskupan</span>
          <span className="font-bold text-lg leading-tight text-gray-900 dark:text-white">Surabaya</span>
        </div>
      </div>

      {/* Navigation - Scrollable */}
      <nav className="flex-1 overflow-auto py-4 px-3">
        <ul className="space-y-1">
          {sidebarNavItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  prefetch={true}
                  onClick={onItemClick}
                  className={cn(
                    "flex items-center w-full justify-start h-10 text-sm font-semibold px-4 rounded-md transition-colors",
                    "hover:bg-gray-100 dark:hover:bg-white/10",
                    isActive
                      ? "bg-blue-50 text-blue-700 dark:bg-blue-600/30 dark:text-white"
                      : "text-gray-800 dark:text-slate-300"
                  )}
                >
                  <item.icon className={cn(
                    "mr-3 h-4 w-4",
                    isActive ? "text-blue-600 dark:text-blue-400" : "text-gray-500 dark:text-slate-400"
                  )} strokeWidth={2.5} />
                  {item.title}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* User Section - h-16 untuk proporsional */}
      <div className="h-16 border-t border-gray-200 dark:border-white/10 px-3 flex items-center shrink-0">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="w-full h-12 justify-start gap-3 px-2 hover:bg-gray-100 dark:hover:bg-white/10 text-gray-900 dark:text-white"
            >
              <Avatar className="h-9 w-9 shrink-0">
                <AvatarImage src="/bishop-avatar.jpg" alt="Uskup" />
                <AvatarFallback className="bg-linear-to-br from-primary/20 to-primary/10 text-primary text-sm font-medium">
                  USK
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 text-left min-w-0">
                <p className="text-sm font-medium truncate leading-tight">
                  {user?.name || "Pengguna"}
                </p>
                <p className="text-xs text-muted-foreground truncate leading-tight">
                  Uskup Surabaya
                </p>
              </div>
              <ChevronsUpDown className="h-4 w-4 text-muted-foreground shrink-0" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-56"
            side="top"
            align="start"
            sideOffset={8}
          >
            <DropdownMenuLabel>
              <div className="flex flex-col">
                <span className="font-medium">
                  {user?.name || "Pengguna"}
                </span>
                <span className="text-xs font-normal text-muted-foreground">
                  {user?.email || "user@keuskupan.org"}
                </span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => handleNavigation('/profil')}>
              <UserCheck className="mr-2 h-4 w-4" />
              Profil Uskup
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleNavigation('/settings')}>
              <Settings className="mr-2 h-4 w-4" />
              Pengaturan
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleSignOut}
              className="text-destructive focus:text-destructive"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Keluar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}