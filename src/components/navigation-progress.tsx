"use client"

import { useEffect } from "react"
import { usePathname, useSearchParams } from "next/navigation"
import NProgress from "nprogress"

// Configure NProgress
NProgress.configure({
    minimum: 0.3,
    easing: "ease",
    speed: 300,
    showSpinner: false,
})

export function NavigationProgress() {
    const pathname = usePathname()
    const searchParams = useSearchParams()

    useEffect(() => {
        NProgress.done()
    }, [pathname, searchParams])

    return null
}

// Hook to manually trigger progress
export function useNavigationProgress() {
    const start = () => NProgress.start()
    const done = () => NProgress.done()
    const set = (n: number) => NProgress.set(n)

    return { start, done, set }
}
