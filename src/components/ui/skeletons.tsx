import { cn } from "@/lib/utils"

interface SkeletonProps {
    className?: string
}

export function Skeleton({ className }: SkeletonProps) {
    return (
        <div
            className={cn(
                "animate-pulse rounded-md bg-muted",
                className
            )}
        />
    )
}

// Card Skeleton
export function CardSkeleton({ className }: SkeletonProps) {
    return (
        <div className={cn("rounded-xl border bg-card p-6 space-y-4", className)}>
            <div className="space-y-2">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-3 w-1/4" />
            </div>
            <Skeleton className="h-8 w-16" />
        </div>
    )
}

// Table Row Skeleton
export function TableRowSkeleton({ cols = 5 }: { cols?: number }) {
    return (
        <div className="flex items-center space-x-4 py-4 border-b">
            {Array.from({ length: cols }).map((_, i) => (
                <Skeleton key={i} className="h-4 flex-1" />
            ))}
        </div>
    )
}

// Table Skeleton
export function TableSkeleton({ rows = 5, cols = 5 }: { rows?: number; cols?: number }) {
    return (
        <div className="rounded-xl border bg-card">
            {/* Header */}
            <div className="flex items-center space-x-4 py-4 px-6 border-b bg-muted/50">
                {Array.from({ length: cols }).map((_, i) => (
                    <Skeleton key={i} className="h-4 flex-1" />
                ))}
            </div>
            {/* Rows */}
            <div className="px-6">
                {Array.from({ length: rows }).map((_, i) => (
                    <TableRowSkeleton key={i} cols={cols} />
                ))}
            </div>
        </div>
    )
}

// Dashboard Stats Skeleton
export function DashboardStatsSkeleton() {
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
                <CardSkeleton key={i} />
            ))}
        </div>
    )
}

// List Item Skeleton
export function ListItemSkeleton() {
    return (
        <div className="flex items-center space-x-4 py-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
            </div>
        </div>
    )
}

// Page Loading Skeleton
export function PageLoadingSkeleton() {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="space-y-2">
                <Skeleton className="h-8 w-1/4" />
                <Skeleton className="h-4 w-1/3" />
            </div>

            {/* Stats Cards */}
            <DashboardStatsSkeleton />

            {/* Content Area */}
            <div className="grid gap-6 md:grid-cols-2">
                <div className="rounded-xl border bg-card p-6 space-y-4">
                    <Skeleton className="h-6 w-1/3" />
                    {Array.from({ length: 4 }).map((_, i) => (
                        <ListItemSkeleton key={i} />
                    ))}
                </div>
                <div className="rounded-xl border bg-card p-6 space-y-4">
                    <Skeleton className="h-6 w-1/3" />
                    <Skeleton className="h-[200px]" />
                </div>
            </div>
        </div>
    )
}

// Agenda Card Skeleton
export function AgendaCardSkeleton() {
    return (
        <div className="rounded-xl border bg-card p-6 space-y-3">
            <div className="flex justify-between items-start">
                <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                        <Skeleton className="h-5 w-2/3" />
                        <Skeleton className="h-5 w-16" />
                    </div>
                    <div className="flex items-center gap-4">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-4 w-32" />
                    </div>
                    <Skeleton className="h-4 w-full" />
                </div>
                <div className="flex gap-2">
                    <Skeleton className="h-8 w-8" />
                    <Skeleton className="h-8 w-8" />
                </div>
            </div>
        </div>
    )
}

// Task Card Skeleton  
export function TaskCardSkeleton() {
    return (
        <div className="rounded-xl border bg-card p-6 space-y-3">
            <div className="flex justify-between items-start">
                <div className="space-y-3 flex-1">
                    <div className="flex items-center gap-2">
                        <Skeleton className="h-5 w-1/2" />
                        <Skeleton className="h-5 w-16" />
                        <Skeleton className="h-5 w-20" />
                    </div>
                    <Skeleton className="h-4 w-3/4" />
                    <div className="flex items-center gap-4">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-4 w-24" />
                    </div>
                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <Skeleton className="h-3 w-16" />
                            <Skeleton className="h-3 w-10" />
                        </div>
                        <Skeleton className="h-2 w-full" />
                    </div>
                </div>
                <div className="flex gap-2 ml-4">
                    <Skeleton className="h-8 w-24" />
                    <Skeleton className="h-8 w-8" />
                    <Skeleton className="h-8 w-8" />
                </div>
            </div>
        </div>
    )
}
