"use client"

import { useState, useEffect } from "react"
import { SidebarNav } from "@/components/sidebar-nav"
import { Header } from "@/components/header"
import { Sheet, SheetContent } from "@/components/ui/sheet"

interface DashboardLayoutProps {
  children: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Prevent hydration mismatch by only rendering after mount
  useEffect(() => {
    setMounted(true)
  }, [])

  // Show a minimal loading state on server/initial render
  if (!mounted) {
    return (
      <div className="flex h-screen bg-muted/40">
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <div className="h-16 border-b bg-background" /> {/* Header placeholder */}
          <main className="flex-1 overflow-auto">
            <div className="p-4 md:p-6">
              {children}
            </div>
          </main>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-muted/40">
      {/* Mobile Sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="w-72 p-0 bg-gray-50 dark:bg-gradient-to-b dark:from-slate-900 dark:via-slate-900/95 dark:to-slate-950 dark:text-white" title="Menu Navigasi">
          <SidebarNav onItemClick={() => setSidebarOpen(false)} />
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 flex-col border-r shrink-0 bg-gray-50 dark:bg-gradient-to-b dark:from-slate-900 dark:via-slate-900/95 dark:to-slate-950 dark:text-white">
        <SidebarNav />
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-auto">
          <div className="p-4 md:p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}