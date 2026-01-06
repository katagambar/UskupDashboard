'use client'

import { useEffect, useCallback } from 'react'

interface KeyboardShortcut {
    key: string
    ctrl?: boolean
    shift?: boolean
    alt?: boolean
    action: () => void
    description: string
}

interface UseKeyboardShortcutsOptions {
    enabled?: boolean
}

export function useKeyboardShortcuts(
    shortcuts: KeyboardShortcut[],
    options: UseKeyboardShortcutsOptions = {}
) {
    const { enabled = true } = options

    const handleKeyDown = useCallback(
        (event: KeyboardEvent) => {
            if (!enabled) return

            // Don't trigger shortcuts when typing in input fields
            const target = event.target as HTMLElement
            if (
                target.tagName === 'INPUT' ||
                target.tagName === 'TEXTAREA' ||
                target.isContentEditable
            ) {
                // Only allow escape key in input fields
                if (event.key !== 'Escape') return
            }

            for (const shortcut of shortcuts) {
                const keyMatches = event.key.toLowerCase() === shortcut.key.toLowerCase()
                const ctrlMatches = shortcut.ctrl ? event.ctrlKey || event.metaKey : !event.ctrlKey && !event.metaKey
                const shiftMatches = shortcut.shift ? event.shiftKey : !event.shiftKey
                const altMatches = shortcut.alt ? event.altKey : !event.altKey

                if (keyMatches && ctrlMatches && shiftMatches && altMatches) {
                    event.preventDefault()
                    shortcut.action()
                    return
                }
            }
        },
        [shortcuts, enabled]
    )

    useEffect(() => {
        if (enabled) {
            document.addEventListener('keydown', handleKeyDown)
            return () => document.removeEventListener('keydown', handleKeyDown)
        }
    }, [handleKeyDown, enabled])
}

// Predefined shortcut sets
export const globalShortcuts = {
    showHelp: { key: '?', description: 'Tampilkan bantuan keyboard' },
    goToDashboard: { key: 'd', ctrl: true, description: 'Ke Dashboard' },
    goToAgenda: { key: 'a', ctrl: true, description: 'Ke Agenda' },
    goToTasks: { key: 't', ctrl: true, description: 'Ke Tugas' },
    goToNotulensi: { key: 'n', ctrl: true, description: 'Ke Notulensi' },
    createNew: { key: 'n', shift: true, description: 'Buat item baru' },
    search: { key: 'k', ctrl: true, description: 'Pencarian' },
    escape: { key: 'Escape', description: 'Tutup dialog / batalkan' },
}
