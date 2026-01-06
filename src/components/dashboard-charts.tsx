"use client"

import {
    AreaChart,
    Area,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

// Color palette
const COLORS = {
    primary: '#3b82f6',
    secondary: '#8b5cf6',
    success: '#22c55e',
    warning: '#f59e0b',
    danger: '#ef4444',
    info: '#06b6d4',
    muted: '#6b7280'
}

const PIE_COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4']

// ========================================
// AREA CHART - For trends over time
// ========================================
interface AreaChartData {
    name: string
    value: number
    [key: string]: number | string
}

interface AreaChartProps {
    title: string
    description?: string
    data: AreaChartData[]
    dataKey?: string
    color?: string
    height?: number
}

export function DashboardAreaChart({
    title,
    description,
    data,
    dataKey = 'value',
    color = COLORS.primary,
    height = 200
}: AreaChartProps) {
    return (
        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                {description && <CardDescription className="text-xs">{description}</CardDescription>}
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={height}>
                    <AreaChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
                        <defs>
                            <linearGradient id={`gradient-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                                <stop offset="95%" stopColor={color} stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'var(--background)',
                                border: '1px solid var(--border)',
                                borderRadius: '8px'
                            }}
                        />
                        <Area
                            type="monotone"
                            dataKey={dataKey}
                            stroke={color}
                            fill={`url(#gradient-${dataKey})`}
                            strokeWidth={2}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    )
}

// ========================================
// BAR CHART - For comparisons
// ========================================
interface BarChartData {
    name: string
    value: number
    [key: string]: number | string
}

interface BarChartProps {
    title: string
    description?: string
    data: BarChartData[]
    dataKey?: string
    color?: string
    height?: number
}

export function DashboardBarChart({
    title,
    description,
    data,
    dataKey = 'value',
    color = COLORS.primary,
    height = 200
}: BarChartProps) {
    return (
        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                {description && <CardDescription className="text-xs">{description}</CardDescription>}
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={height}>
                    <BarChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" vertical={false} />
                        <XAxis
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }}
                        />
                        <Tooltip
                            cursor={{ fill: 'var(--muted)', opacity: 0.2 }}
                            contentStyle={{
                                backgroundColor: 'var(--background)',
                                border: '1px solid var(--border)',
                                borderRadius: '8px'
                            }}
                        />
                        <Bar
                            dataKey={dataKey}
                            fill={color}
                            radius={[4, 4, 0, 0]}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    )
}

// ========================================
// PIE CHART - For distribution
// ========================================
interface PieChartData {
    name: string
    value: number
}

interface PieChartProps {
    title: string
    description?: string
    data: PieChartData[]
    height?: number
    innerRadius?: number
    showLegend?: boolean
}

export function DashboardPieChart({
    title,
    description,
    data,
    height = 200,
    innerRadius = 40,
    showLegend = true
}: PieChartProps) {
    return (
        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                {description && <CardDescription className="text-xs">{description}</CardDescription>}
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={height}>
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            innerRadius={innerRadius}
                            outerRadius={70}
                            paddingAngle={2}
                            dataKey="value"
                        >
                            {data.map((_, index) => (
                                <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'var(--background)',
                                border: '1px solid var(--border)',
                                borderRadius: '8px'
                            }}
                        />
                        {showLegend && (
                            <Legend
                                iconType="circle"
                                iconSize={8}
                                wrapperStyle={{ fontSize: '11px' }}
                            />
                        )}
                    </PieChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    )
}

// ========================================
// MULTI-LINE CHART - For multiple series
// ========================================
interface MultiLineChartData {
    name: string
    [key: string]: number | string
}

interface LineConfig {
    dataKey: string
    color: string
    name?: string
}

interface MultiLineChartProps {
    title: string
    description?: string
    data: MultiLineChartData[]
    lines: LineConfig[]
    height?: number
}

export function DashboardMultiLineChart({
    title,
    description,
    data,
    lines,
    height = 200
}: MultiLineChartProps) {
    return (
        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                {description && <CardDescription className="text-xs">{description}</CardDescription>}
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={height}>
                    <LineChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'var(--background)',
                                border: '1px solid var(--border)',
                                borderRadius: '8px'
                            }}
                        />
                        <Legend
                            iconType="circle"
                            iconSize={8}
                            wrapperStyle={{ fontSize: '11px' }}
                        />
                        {lines.map((line, index) => (
                            <Line
                                key={index}
                                type="monotone"
                                dataKey={line.dataKey}
                                stroke={line.color}
                                name={line.name || line.dataKey}
                                strokeWidth={2}
                                dot={{ fill: line.color, strokeWidth: 2, r: 3 }}
                                activeDot={{ r: 5 }}
                            />
                        ))}
                    </LineChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    )
}

// ========================================
// STAT CARD WITH MINI CHART
// ========================================
interface StatCardWithChartProps {
    title: string
    value: string | number
    change?: number
    changeText?: string
    data: { name: string; value: number }[]
    color?: string
}

export function StatCardWithChart({
    title,
    value,
    change,
    changeText,
    data,
    color = COLORS.primary
}: StatCardWithChartProps) {
    const isPositive = change && change > 0

    return (
        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
            </CardHeader>
            <CardContent className="pb-2">
                <div className="flex items-baseline justify-between">
                    <div className="text-2xl font-bold">{value}</div>
                    {change !== undefined && (
                        <span className={`text-xs font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                            {isPositive ? '+' : ''}{change}%
                        </span>
                    )}
                </div>
                {changeText && (
                    <p className="text-xs text-muted-foreground">{changeText}</p>
                )}
                <div className="h-12 mt-2">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data}>
                            <defs>
                                <linearGradient id={`stat-gradient-${title}`} x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                                    <stop offset="95%" stopColor={color} stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <Area
                                type="monotone"
                                dataKey="value"
                                stroke={color}
                                fill={`url(#stat-gradient-${title})`}
                                strokeWidth={1.5}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    )
}
