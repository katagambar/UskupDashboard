"use client"

import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
    return (
        <div className="space-y-6 animate-in fade-in-50 duration-500">
            {/* Header skeleton */}
            <div className="space-y-2">
                <Skeleton className="h-8 w-64" />
                <Skeleton className="h-4 w-96" />
            </div>

            {/* Stats cards skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="rounded-lg border bg-card p-6">
                        <div className="flex items-center justify-between">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-8 w-8 rounded-full" />
                        </div>
                        <Skeleton className="h-8 w-16 mt-2" />
                        <Skeleton className="h-3 w-32 mt-2" />
                    </div>
                ))}
            </div>

            {/* Content skeleton */}
            <div className="rounded-lg border bg-card">
                <div className="p-6 border-b">
                    <Skeleton className="h-6 w-48" />
                </div>
                <div className="p-6 space-y-4">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="flex items-center space-x-4">
                            <Skeleton className="h-10 w-10 rounded-full" />
                            <div className="space-y-2 flex-1">
                                <Skeleton className="h-4 w-3/4" />
                                <Skeleton className="h-3 w-1/2" />
                            </div>
                            <Skeleton className="h-8 w-20" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
