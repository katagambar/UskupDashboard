"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { AIAssistant } from "@/components/ai-assistant"

export default function AIAssistantPage() {
    return (
        <DashboardLayout>
            <div className="h-full">
                <AIAssistant />
            </div>
        </DashboardLayout>
    )
}
