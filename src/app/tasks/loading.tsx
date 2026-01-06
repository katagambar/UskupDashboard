"use client"

import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export default function TasksLoading() {
    return (
        <div className="space-y-6 animate-in fade-in-50 duration-300">
            <div className="flex justify-between items-center">
                <div className="space-y-2">
                    <Skeleton className="h-8 w-40" />
                    <Skeleton className="h-4 w-72" />
                </div>
                <Skeleton className="h-10 w-36" />
            </div>

            {/* Stats row skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                    <Card key={i}>
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <Skeleton className="h-10 w-10 rounded-full" />
                                <div className="space-y-1">
                                    <Skeleton className="h-5 w-8" />
                                    <Skeleton className="h-3 w-20" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Task list skeleton */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <Skeleton className="h-6 w-32" />
                    <div className="flex gap-2">
                        <Skeleton className="h-8 w-8" />
                        <Skeleton className="h-8 w-8" />
                    </div>
                </CardHeader>
                <CardContent className="space-y-3">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="flex items-center gap-4 p-3 border rounded-lg">
                            <Skeleton className="h-5 w-5 rounded" />
                            <div className="flex-1 space-y-2">
                                <Skeleton className="h-4 w-3/4" />
                                <div className="flex gap-2">
                                    <Skeleton className="h-5 w-16 rounded-full" />
                                    <Skeleton className="h-5 w-20 rounded-full" />
                                </div>
                            </div>
                            <Skeleton className="h-8 w-24" />
                        </div>
                    ))}
                </CardContent>
            </Card>
        </div>
    )
}
