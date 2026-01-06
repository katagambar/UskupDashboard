"use client"

import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export default function SuratLoading() {
    return (
        <div className="space-y-6 animate-in fade-in-50 duration-300">
            <div className="flex justify-between items-center">
                <div className="space-y-2">
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-4 w-64" />
                </div>
                <Skeleton className="h-10 w-36" />
            </div>

            {/* Filter and search skeleton */}
            <div className="flex gap-4">
                <Skeleton className="h-10 flex-1 max-w-sm" />
                <Skeleton className="h-10 w-32" />
                <Skeleton className="h-10 w-32" />
            </div>

            {/* Table skeleton */}
            <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-32" />
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {/* Table header */}
                        <div className="grid grid-cols-6 gap-4 pb-3 border-b">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-16" />
                        </div>
                        {/* Table rows */}
                        {[...Array(8)].map((_, i) => (
                            <div key={i} className="grid grid-cols-6 gap-4 py-3 border-b">
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-32" />
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-6 w-20 rounded-full" />
                                <Skeleton className="h-8 w-8" />
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
