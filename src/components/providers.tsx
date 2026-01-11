"use client"

import { Suspense } from "react"
import { ThemeProvider } from "@/components/theme-provider"
import { QueryProvider } from "@/lib/query-client"
import { NavigationProgress } from "@/components/navigation-progress"
import { ServiceWorkerRegistration } from "@/components/pwa-register"

interface ProvidersProps {
  children: React.ReactNode
}

export function Providers({ children }: ProvidersProps) {
  return (
    <QueryProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="dark"
        enableSystem
        disableTransitionOnChange
      >
        <ServiceWorkerRegistration />
        <Suspense fallback={null}>
          <NavigationProgress />
        </Suspense>
        {children}
      </ThemeProvider>
    </QueryProvider>
  )
}
