"use client"

import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export default function NotulensiLoading() {
    return (
        <div className="space-y-6 animate-in fade-in-50 duration-300">
            <div className="flex justify-between items-center">
                <div className="space-y-2">
                    <Skeleton className="h-8 w-36" />
                    <Skeleton className="h-4 w-72" />
                </div>
                <Skeleton className="h-10 w-40" />
            </div>

            {/* Filter skeleton */}
            <div className="flex gap-4">
                <Skeleton className="h-10 flex-1 max-w-sm" />
                <Skeleton className="h-10 w-32" />
            </div>

            {/* Cards grid skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
                    <Card key={i}>
                        <CardHeader className="pb-3">
                            <div className="flex justify-between">
                                <div className="space-y-2">
                                    <Skeleton className="h-5 w-48" />
                                    <Skeleton className="h-3 w-24" />
                                </div>
                                <Skeleton className="h-6 w-16 rounded-full" />
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-3/4" />
                            <div className="flex gap-2 pt-2">
                                <Skeleton className="h-8 w-20" />
                                <Skeleton className="h-8 w-20" />
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}
