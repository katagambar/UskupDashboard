"use client"

import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export default function AgendaLoading() {
    return (
        <div className="space-y-6 animate-in fade-in-50 duration-300">
            <div className="flex justify-between items-center">
                <div className="space-y-2">
                    <Skeleton className="h-8 w-32" />
                    <Skeleton className="h-4 w-64" />
                </div>
                <Skeleton className="h-10 w-32" />
            </div>

            {/* Filter bar skeleton */}
            <div className="flex gap-4">
                <Skeleton className="h-10 w-48" />
                <Skeleton className="h-10 w-32" />
                <Skeleton className="h-10 w-32" />
            </div>

            {/* Calendar or list skeleton */}
            <Card>
                <CardHeader>
                    <div className="flex justify-between">
                        <Skeleton className="h-6 w-40" />
                        <div className="flex gap-2">
                            <Skeleton className="h-8 w-8" />
                            <Skeleton className="h-8 w-8" />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-7 gap-2">
                        {[...Array(35)].map((_, i) => (
                            <Skeleton key={i} className="h-24 rounded-md" />
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
