'use client'

import { useState, useEffect } from 'react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { useKeyboardShortcuts, globalShortcuts } from '@/hooks/useKeyboardShortcuts'

interface KeyboardShortcutsDialogProps {
    open?: boolean
    onOpenChange?: (open: boolean) => void
}

export function KeyboardShortcutsDialog({ open, onOpenChange }: KeyboardShortcutsDialogProps) {
    const [isOpen, setIsOpen] = useState(open ?? false)

    useEffect(() => {
        if (open !== undefined) {
            setIsOpen(open)
        }
    }, [open])

    const handleOpenChange = (newOpen: boolean) => {
        setIsOpen(newOpen)
        onOpenChange?.(newOpen)
    }

    // Open dialog with ? key
    useKeyboardShortcuts([
        {
            key: '?',
            action: () => handleOpenChange(true),
            description: 'Show keyboard shortcuts'
        }
    ])

    const shortcuts = [
        { keys: ['?'], description: 'Tampilkan bantuan ini' },
        { keys: ['Ctrl', 'D'], description: 'Ke Dashboard' },
        { keys: ['Ctrl', 'A'], description: 'Ke Agenda' },
        { keys: ['Ctrl', 'T'], description: 'Ke Tugas' },
        { keys: ['Ctrl', 'N'], description: 'Ke Notulensi' },
        { keys: ['Ctrl', 'K'], description: 'Pencarian' },
        { keys: ['Shift', 'N'], description: 'Buat item baru' },
        { keys: ['Esc'], description: 'Tutup dialog' },
    ]

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Pintasan Keyboard</DialogTitle>
                    <DialogDescription>
                        Gunakan pintasan keyboard untuk navigasi lebih cepat
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    {shortcuts.map((shortcut, index) => (
                        <div key={index} className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">
                                {shortcut.description}
                            </span>
                            <div className="flex gap-1">
                                {shortcut.keys.map((key, keyIndex) => (
                                    <Badge key={keyIndex} variant="outline" className="font-mono text-xs">
                                        {key}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </DialogContent>
        </Dialog>
    )
}
