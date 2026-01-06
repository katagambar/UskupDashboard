'use client'

import { useEffect } from 'react'

/**
 * Global Error Handler Component
 * 
 * Handles runtime errors like ChunkLoadError by automatically
 * reloading the page when chunk loading fails.
 */
export function GlobalErrorHandler({ children }: { children: React.ReactNode }) {
    useEffect(() => {
        // Handle ChunkLoadError by reloading
        const handleError = (event: ErrorEvent) => {
            if (
                event.message?.includes('ChunkLoadError') ||
                event.message?.includes('Loading chunk') ||
                event.message?.includes('Failed to load chunk')
            ) {
                console.warn('Chunk load error detected, reloading page...')
                // Prevent infinite reload loop
                const lastReload = localStorage.getItem('lastChunkErrorReload')
                const now = Date.now()

                if (!lastReload || now - parseInt(lastReload) > 10000) {
                    localStorage.setItem('lastChunkErrorReload', now.toString())
                    window.location.reload()
                }
            }
        }

        // Handle unhandled promise rejections (like fetch errors)
        const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
            if (event.reason?.message?.includes('Failed to fetch')) {
                console.warn('Network error occurred, retrying...')
                // Don't reload for fetch errors - let the retry logic handle it
            }
        }

        window.addEventListener('error', handleError)
        window.addEventListener('unhandledrejection', handleUnhandledRejection)

        return () => {
            window.removeEventListener('error', handleError)
            window.removeEventListener('unhandledrejection', handleUnhandledRejection)
        }
    }, [])

    return <>{children}</>
}
