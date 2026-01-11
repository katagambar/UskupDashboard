'use client'

/**
 * Lazy Load Components
 * 
 * Dynamic imports for heavy components to optimize bundle size.
 * These components will only be loaded when needed.
 */

import dynamic from 'next/dynamic'
import { ComponentType, ReactNode } from 'react'

// Loading skeleton component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center p-8">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
  </div>
)

const LoadingSkeleton = () => (
  <div className="animate-pulse space-y-4 p-4">
    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
    <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded" />
  </div>
)

// ============================================
// LAZY LOADED COMPONENTS
// ============================================

// Note: PDF Export (src/lib/pdf-export.tsx) is a library, not a component
// Use: import { exportSuratToPDF } from '@/lib/pdf-export'
// The library itself is already optimized for on-demand loading

/**
 * Markdown Renderer (react-markdown + remark-gfm = ~100KB)
 * Lazy loaded for pages with markdown content
 */
export const LazyMarkdownRenderer = dynamic(
  () => import('@/components/ui/markdown').then(mod => ({ 
    default: mod.MarkdownRenderer 
  })),
  {
    loading: () => <LoadingSkeleton />,
    ssr: false,
  }
)

/**
 * Chart Components (recharts = ~200KB)
 * Only loaded on analytics/dashboard pages
 */
export const LazyBarChart = dynamic(
  () => import('recharts').then(mod => mod.BarChart as ComponentType<any>),
  {
    loading: () => <LoadingSkeleton />,
    ssr: false,
  }
)

export const LazyLineChart = dynamic(
  () => import('recharts').then(mod => mod.LineChart as ComponentType<any>),
  {
    loading: () => <LoadingSkeleton />,
    ssr: false,
  }
)

export const LazyPieChart = dynamic(
  () => import('recharts').then(mod => mod.PieChart as ComponentType<any>),
  {
    loading: () => <LoadingSkeleton />,
    ssr: false,
  }
)

export const LazyAreaChart = dynamic(
  () => import('recharts').then(mod => mod.AreaChart as ComponentType<any>),
  {
    loading: () => <LoadingSkeleton />,
    ssr: false,
  }
)

/**
 * Animated Components (framer-motion = ~100KB)
 * Lazy loaded for pages with heavy animations
 */
export const LazyAnimatedModal = dynamic(
  () => import('@/components/ui/animated').then(mod => ({ 
    default: mod.AnimatedModal 
  })),
  {
    loading: () => null,
    ssr: false,
  }
)

/**
 * Date Picker (optional heavy date library)
 */
export const LazyDatePicker = dynamic(
  () => import('react-day-picker').then(mod => mod.DayPicker),
  {
    loading: () => <LoadingSkeleton />,
    ssr: false,
  }
)

// ============================================
// WRAPPER COMPONENTS
// ============================================

/**
 * Suspense wrapper for client-side only components
 */
export function ClientOnly({ children }: { children: ReactNode }) {
  if (typeof window === 'undefined') {
    return <LoadingSpinner />
  }
  return <>{children}</>
}

/**
 * Helper to create lazy-loaded sections
 */
export function lazySection<T extends object>(
  importFn: () => Promise<{ default: ComponentType<T> }>,
  loadingComponent?: ReactNode
) {
  return dynamic(importFn, {
    loading: () => <>{loadingComponent || <LoadingSkeleton />}</>,
    ssr: false,
  })
}

// ============================================
// EXPORTS
// ============================================

export { LoadingSpinner, LoadingSkeleton }
