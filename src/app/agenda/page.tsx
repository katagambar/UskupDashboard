"use client"

import { useState, useRef, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Plus, Search, Calendar as CalendarIcon, Clock, MapPin, Users, RefreshCw, ExternalLink, Edit, Trash2, Eye } from "lucide-react"
import { formatDate, DateRanges } from "@/lib/dateUtils"
import { showSuccess, showError, confirmDelete } from "@/lib/alerts"
import { useAgenda, useCrud } from "@/hooks/useApi"
import { useJenisPertemuan } from "@/hooks/use-parameters"
import { isRedDay, getHolidayName } from "@/lib/indonesian-holidays"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useLiturgicalCalendar } from "@/hooks/use-liturgical-calendar"
import { getLiturgicalColor, getLiturgicalDotColor } from "@/lib/liturgical-calendar"
import { DayButton, getDefaultClassNames } from "react-day-picker"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface Agenda {
  id: string
  judul: string
  tanggal: string         // Start date
  tanggalAkhir?: string   // End date (optional for multi-day)
  waktu: string           // Start time
  waktuAkhir?: string     // End time (optional)
  lokasi: string
  jenis: string
  peserta: string
  deskripsi: string
  status: string
  googleCalendarId?: string
}

// Context to pass agenda list to CustomDayButton
import { createContext, useContext } from "react"
const AgendaContext = createContext<Agenda[]>([])

function CustomDayButton({
  className,
  day,
  modifiers,
  ...props
}: React.ComponentProps<typeof DayButton>) {
  const defaultClassNames = getDefaultClassNames()
  const year = day.date.getFullYear()
  const month = day.date.getMonth()
  
  // For December (month 11), the liturgical data is actually in NEXT year's calendar
  // because the liturgical year starts with Advent (late Nov/early Dec)
  const liturgicalYear = month === 11 ? year + 1 : year
  const { data: liturgicalEvents } = useLiturgicalCalendar(liturgicalYear)
  
  // Get agenda list from context
  const agendaList = useContext(AgendaContext)

  const getLiturgicalEvent = (date: Date) => {
    if (!liturgicalEvents) return null
    // Use manual date construction to avoid timezone issues with toISOString
    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, '0')
    const d = String(date.getDate()).padStart(2, '0')
    const dateStr = `${y}-${m}-${d}`
    return liturgicalEvents.find(e => e.date === dateStr)
  }

  // Check if date has agenda items (including multi-day ranges)
  const getAgendaCount = (date: Date) => {
    if (!agendaList || agendaList.length === 0) return 0
    
    // Normalize date to start of day for comparison
    const checkDate = new Date(date.getFullYear(), date.getMonth(), date.getDate())
    
    return agendaList.filter(item => {
      const startDate = new Date(item.tanggal)
      const startNorm = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate())
      
      // If tanggalAkhir exists, use it; otherwise same as start (single-day)
      const endDate = item.tanggalAkhir ? new Date(item.tanggalAkhir) : startDate
      const endNorm = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate())
      
      // Check if checkDate falls within [startNorm, endNorm]
      return checkDate >= startNorm && checkDate <= endNorm
    }).length
  }

  const event = getLiturgicalEvent(day.date)
  const colorClass = event ? getLiturgicalColor(event.color) : ""
  const liturgyDotColor = event ? getLiturgicalDotColor(event.color) : ""
  const agendaCount = getAgendaCount(day.date)

  const ref = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    if (modifiers.focused) ref.current?.focus()
  }, [modifiers.focused])

  return (
    <Button
      ref={ref}
      variant="ghost"
      size="icon"
      data-day={day.date.toLocaleDateString()}
      data-selected-single={
        modifiers.selected &&
        !modifiers.range_start &&
        !modifiers.range_end &&
        !modifiers.range_middle
      }
      data-range-start={modifiers.range_start}
      data-range-end={modifiers.range_end}
      data-range-middle={modifiers.range_middle}
      className={cn(
        "relative data-[selected-single=true]:bg-primary data-[selected-single=true]:text-primary-foreground data-[range-middle=true]:bg-accent data-[range-middle=true]:text-accent-foreground data-[range-start=true]:bg-primary data-[range-start=true]:text-primary-foreground data-[range-end=true]:bg-primary data-[range-end=true]:text-primary-foreground group-data-[focused=true]/day:border-ring group-data-[focused=true]/day:ring-ring/50 dark:hover:text-accent-foreground flex aspect-square size-auto w-full min-w-[var(--cell-size)] flex-col gap-1 leading-none font-normal group-data-[focused=true]/day:z-10 group-data-[focused=true]/day:ring-[3px] data-[range-end=true]:rounded-md data-[range-end=true]:rounded-r-md data-[range-middle=true]:rounded-none data-[range-start=true]:rounded-md data-[range-start=true]:rounded-l-md [&>span]:text-xs [&>span]:opacity-70",
        defaultClassNames.day,
        className
      )}
      {...props}
    >
      <span className="text-sm font-medium">{day.date.getDate()}</span>
      {/* Agenda marker dot - above the date number */}
      {/* Green = 1 event, Gold = 2 events, Red = 3+ events */}
      {agendaCount > 0 && (
        <div className={`agenda-dot absolute -top-0.5 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full shadow-sm ${
          agendaCount === 1 ? 'bg-green-500' : 
          agendaCount === 2 ? 'bg-amber-500' : 
          'bg-red-500'
        }`} />
      )}
      {/* Liturgical event dot - at bottom, color matches liturgy color */}
      {event && (
        <div className={`liturgical-dot ${liturgyDotColor}`} />
      )}
    </Button>
  )
}

export default function AgendaPage() {
  const { data: agendaList, loading, refetch } = useAgenda()
  const { create, update, remove, loading: crudLoading } = useCrud('/api/agenda')
  const { parameters: jenisPertemuanOptions } = useJenisPertemuan()

  const [searchTerm, setSearchTerm] = useState("")
  const [filterJenis, setFilterJenis] = useState("semua")
  const [filterStartDate, setFilterStartDate] = useState("")
  const [filterEndDate, setFilterEndDate] = useState("")
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [selectedAgenda, setSelectedAgenda] = useState<Agenda | null>(null)
  const [isSyncing, setIsSyncing] = useState(false)
  const [formData, setFormData] = useState({
    judul: "",
    tanggal: "",
    tanggalAkhir: "",     // End date for multi-day
    waktu: "",
    waktuAkhir: "",       // End time (optional)
    lokasi: "",
    jenis: "",
    peserta: "",
    deskripsi: "",
    isMultiDay: false     // Toggle for multi-day mode
  })

  // Liturgical Calendar State
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date())
  
  // For December, fetch next year's liturgical calendar (liturgical year starts with Advent)
  const liturgicalYear = currentMonth.getMonth() === 11 ? currentMonth.getFullYear() + 1 : currentMonth.getFullYear()
  const { data: liturgicalEvents } = useLiturgicalCalendar(liturgicalYear)
  
  // Also fetch next year for when selectedDate is in December
  const selectedDateLiturgicalYear = selectedDate && selectedDate.getMonth() === 11 
    ? selectedDate.getFullYear() + 1 
    : selectedDate?.getFullYear() || currentMonth.getFullYear()
  const { data: selectedDateLiturgicalEvents } = useLiturgicalCalendar(selectedDateLiturgicalYear)

  useEffect(() => {
    if (liturgicalEvents && liturgicalEvents.length > 0) {
      console.log(`Loaded ${liturgicalEvents.length} liturgical events for liturgical year ${liturgicalYear}`)
    }
  }, [liturgicalEvents, liturgicalYear])

  /*

      const prevBtn = document.querySelector('[aria-label="Go to the Previous Month"]') as HTMLElement
      const nextBtn = document.querySelector('[aria-label="Go to the Next Month"]') as HTMLElement
      
      if (monthContainer && prevBtn && nextBtn) {
        // Make container relative with row layout
        monthContainer.style.cssText = `
          position: relative !important;
          display: grid !important;
          grid-template-columns: auto 1fr auto !important;
          grid-template-rows: auto auto !important;
          align-items: center !important;
          gap: 12px !important;
        `
        
        // Position prev button at start with larger size
        prevBtn.style.cssText = prevBtn.style.cssText + `
          grid-column: 1 !important;
          grid-row: 1 !important;
          justify-self: start !important;
          width: 40px !important;
          height: 40px !important;
        `
        
        // Position next button at end with larger size
        nextBtn.style.cssText = nextBtn.style.cssText + `
          grid-column: 3 !important;
          grid-row: 1 !important;
          justify-self: end !important;
          width: 40px !important;
          height: 40px !important;
        `
        
        // Find month caption and position it in center with larger font
        const caption = monthContainer.querySelector('.rdp-month_caption') as HTMLElement
        if (caption) {
          caption.style.cssText = `
            grid-column: 2 !important;
            grid-row: 1 !important;
            justify-self: center !important;
            text-align: center !important;
            font-size: 1.5rem !important;
            font-weight: 700 !important;
          `
        }
        
        // Position the month grid to span all columns
        const monthGrid = monthContainer.querySelector('.rdp-month_grid') as HTMLElement
        if (monthGrid) {
          monthGrid.style.cssText = `
            grid-column: 1 / -1 !important;
            grid-row: 2 !important;
          `
        }
        
        // Make day cells larger
        const dayCells = document.querySelectorAll('.rdp-day') as NodeListOf<HTMLElement>
        dayCells.forEach(cell => {
          cell.style.cssText = cell.style.cssText + `
            width: 56px !important;
            height: 56px !important;
          `
        })
        
        // Make day buttons larger with bigger font
        const dayButtons = document.querySelectorAll('.rdp-day_button') as NodeListOf<HTMLElement>
        dayButtons.forEach(btn => {
          btn.style.cssText = btn.style.cssText + `
            width: 52px !important;
            height: 52px !important;
            font-size: 1.125rem !important;
            font-weight: 500 !important;
          `
        })
        
        // Make weekday headers larger
        const weekdays = document.querySelectorAll('.rdp-weekday') as NodeListOf<HTMLElement>
        weekdays.forEach(wd => {
          wd.style.cssText = wd.style.cssText + `
            font-size: 0.95rem !important;
            font-weight: 600 !important;
            padding: 8px !important;
          `
        })
        
        return true
      }
      return false
    }
    
    // Apply with requestAnimationFrame for better timing
    const rafApply = () => {
      requestAnimationFrame(() => {
        if (!applyNavStyles()) {
          setTimeout(rafApply, 100)
        }
      })
    }
    rafApply()
    
    // Use MutationObserver to re-apply styles whenever DOM changes
    const calendarSlot = document.querySelector('[data-slot="calendar"]')
    let observer: MutationObserver | null = null
    
    if (calendarSlot) {
      observer = new MutationObserver(() => {
        applyNavStyles()
      })
      observer.observe(calendarSlot, { 
        childList: true, 
        subtree: true, 
        attributes: true,
        attributeFilter: ['class', 'style']
      })
    }
    
  */

  const getLiturgicalEventForSidebar = (date: Date) => {
    // For December dates, use selectedDateLiturgicalEvents (which fetches year+1)
    const eventsToUse = date.getMonth() === 11 ? selectedDateLiturgicalEvents : liturgicalEvents
    if (!eventsToUse) return null
    
    // Manual construction for timezone safety (Local YYYY-MM-DD)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const dayVal = String(date.getDate()).padStart(2, '0')
    const dateStr = `${year}-${month}-${dayVal}`

    return eventsToUse.find(e => e.date === dateStr)
  }

  const filteredAgenda = agendaList.filter(item => {
    const matchesSearch = item.judul.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.lokasi.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterJenis === "semua" || item.jenis === filterJenis
    
    // Date range filter
    let matchesDateRange = true
    if (filterStartDate || filterEndDate) {
      const itemDate = new Date(item.tanggal)
      const itemEndDate = item.tanggalAkhir ? new Date(item.tanggalAkhir) : itemDate
      
      if (filterStartDate) {
        const startFilter = new Date(filterStartDate)
        // Agenda ends before filter start = exclude
        if (itemEndDate < startFilter) matchesDateRange = false
      }
      if (filterEndDate) {
        const endFilter = new Date(filterEndDate)
        // Agenda starts after filter end = exclude
        if (itemDate > endFilter) matchesDateRange = false
      }
    }
    
    return matchesSearch && matchesFilter && matchesDateRange
  })

  const handleSyncGoogleCalendar = async () => {
    setIsSyncing(true)
    try {
      // Call bulk sync API
      const response = await fetch('/api/google-calendar/sync', {
        method: 'GET',
        credentials: 'include',
      })
      const result = await response.json()
      
      if (result.success) {
        showSuccess(result.message || "Google Calendar berhasil disinkronkan")
        if (result.synced > 0) {
          refetch() // Refresh agenda list to show updated googleCalendarId
        }
      } else {
        showError(result.error || "Gagal sync ke Google Calendar")
      }
    } catch (error: any) {
      showError(error.message || "Terjadi kesalahan saat sync")
    } finally {
      setIsSyncing(false)
    }
  }


  const handleCreate = async () => {
    if (!formData.judul || !formData.tanggal || !formData.waktu || !formData.lokasi || !formData.jenis || !formData.peserta) {
      showError("Mohon lengkapi semua field yang wajib diisi")
      return
    }
    
    // Validate end date if multi-day
    if (formData.isMultiDay && !formData.tanggalAkhir) {
      showError("Mohon isi tanggal selesai untuk agenda multi-hari")
      return
    }

    // Prepare data for API (exclude isMultiDay flag, include tanggalAkhir if set)
    const apiData = {
      judul: formData.judul,
      tanggal: formData.tanggal,
      tanggalAkhir: formData.isMultiDay ? formData.tanggalAkhir : null,
      waktu: formData.waktu,
      waktuAkhir: formData.isMultiDay ? formData.waktuAkhir : null,
      lokasi: formData.lokasi,
      jenis: formData.jenis,
      peserta: formData.peserta,
      deskripsi: formData.deskripsi
    }

    const result = await create(apiData)
    if (result.success) {
      showSuccess("Agenda berhasil ditambahkan")
      setIsCreateDialogOpen(false)
      resetForm()
      refetch()
    }
  }

  const handleEdit = (agenda: Agenda) => {
    setSelectedAgenda(agenda)
    const hasEndDate = agenda.tanggalAkhir && agenda.tanggalAkhir !== agenda.tanggal
    setFormData({
      judul: agenda.judul,
      tanggal: agenda.tanggal,
      tanggalAkhir: agenda.tanggalAkhir || "",
      waktu: agenda.waktu,
      waktuAkhir: agenda.waktuAkhir || "",
      lokasi: agenda.lokasi,
      jenis: agenda.jenis,
      peserta: agenda.peserta,
      deskripsi: agenda.deskripsi,
      isMultiDay: hasEndDate || false
    })
    setIsEditDialogOpen(true)
  }

  const handleUpdate = async () => {
    if (!selectedAgenda || !formData.judul || !formData.tanggal || !formData.waktu || !formData.lokasi || !formData.jenis || !formData.peserta) {
      showError("Mohon lengkapi semua field yang wajib diisi")
      return
    }
    
    // Validate end date if multi-day
    if (formData.isMultiDay && !formData.tanggalAkhir) {
      showError("Mohon isi tanggal selesai untuk agenda multi-hari")
      return
    }

    // Prepare data for API
    const apiData = {
      judul: formData.judul,
      tanggal: formData.tanggal,
      tanggalAkhir: formData.isMultiDay ? formData.tanggalAkhir : null,
      waktu: formData.waktu,
      waktuAkhir: formData.isMultiDay ? formData.waktuAkhir : null,
      lokasi: formData.lokasi,
      jenis: formData.jenis,
      peserta: formData.peserta,
      deskripsi: formData.deskripsi
    }

    const result = await update(selectedAgenda.id, apiData)
    if (result.success) {
      showSuccess("Agenda berhasil diperbarui")
      setIsEditDialogOpen(false)
      setSelectedAgenda(null)
      resetForm()
      refetch()
    }
  }


  const handleDelete = async (id: string, judul: string) => {
    const confirmed = await confirmDelete(`agenda "${judul}"`)
    if (confirmed) {
      const result = await remove(id)
      if (result.success) {
        showSuccess("Agenda berhasil dihapus")
        refetch()
      }
    }
  }

  const handleView = (agenda: Agenda) => {
    setSelectedAgenda(agenda)
    setIsViewDialogOpen(true)
  }

  const resetForm = () => {
    setFormData({
      judul: "",
      tanggal: "",
      tanggalAkhir: "",
      waktu: "",
      waktuAkhir: "",
      lokasi: "",
      jenis: "",
      peserta: "",
      deskripsi: "",
      isMultiDay: false
    })
  }

  const getJenisBadge = (jenis: string) => {
    switch (jenis) {
      case "Kuria":
        return <Badge className="bg-blue-100 text-blue-800">Kuria</Badge>
      case "Pastoral":
        return <Badge className="bg-green-100 text-green-800">Pastoral</Badge>
      case "Komisi":
        return <Badge className="bg-purple-100 text-purple-800">Komisi</Badge>
      default:
        return <Badge variant="outline">{jenis}</Badge>
    }
  }

  const getAgendaForDate = (date: Date) => {
    // Normalize date for comparison
    const checkDate = new Date(date.getFullYear(), date.getMonth(), date.getDate())
    
    return agendaList.filter(item => {
      const startDate = new Date(item.tanggal)
      const startNorm = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate())
      
      // If tanggalAkhir exists, use it; otherwise same as start
      const endDate = item.tanggalAkhir ? new Date(item.tanggalAkhir) : startDate
      const endNorm = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate())
      
      // Include agenda if checkDate falls within [start, end]
      return checkDate >= startNorm && checkDate <= endNorm
    })
  }

  return (
    <DashboardLayout>
      <style dangerouslySetInnerHTML={{ __html: `
        /* ============================================================
           REACT-DAY-PICKER v9 - COMPLETE LAYOUT FIX
           ============================================================ */
        
        /* ROOT: Center and constrain */
        .rdp {
          --rdp-cell-size: 64px !important;
          max-width: 560px !important;
          margin: 0 auto !important;
        }
        
        /* MONTH: CSS Grid Layout for horizontal navigation */
        .rdp-month {
          display: grid !important;
          grid-template-columns: auto 1fr auto !important;
          grid-template-rows: auto auto !important;
          align-items: center !important;
          gap: 12px 8px !important;
        }
        
        /* Position navigation buttons on first row */
        .rdp-month > button:first-of-type,
        .rdp-button_previous {
          grid-column: 1 !important;
          grid-row: 1 !important;
          width: 40px !important;
          height: 40px !important;
        }
        
        .rdp-month_caption {
          grid-column: 2 !important;
          grid-row: 1 !important;
          text-align: center !important;
          font-size: 37px !important; /* User specified */
          font-weight: 700 !important;
          justify-self: center !important;
        }
        
        .rdp-month > button:nth-of-type(2),
        .rdp-button_next {
          grid-column: 3 !important;
          grid-row: 1 !important;
          width: 40px !important;
          height: 40px !important;
        }
        
        .rdp-month_grid {
          grid-column: 1 / -1 !important;
          grid-row: 2 !important;
        }

        /* GRID: Flatten table structure */
        .rdp-month_grid, .rdp-table {
          display: grid !important;
          grid-template-columns: repeat(7, 1fr) !important;
          width: 100% !important;
        }

        .rdp-head, .rdp-tbody, .rdp-row,
        .rdp-month thead, .rdp-month tbody, .rdp-month tr {
          display: contents !important;
        }
        
        /* CELLS: Flex center, consistent sizing */
        .rdp-head_cell, .rdp-cell, .rdp-day,
        .rdp-month th, .rdp-month td {
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          min-height: 72px !important; /* LARGER cells */
          padding: 4px !important;
        }

        /* WEEKDAY HEADERS */
        .rdp-weekday, .rdp-month th {
          font-size: 20px !important; /* User specified */
          font-weight: 600 !important;
          text-transform: uppercase !important;
          opacity: 0.8 !important;
        }

        /* DAY BUTTONS: MASSIVE Font */
        .rdp-day_button {
          width: 64px !important;
          height: 64px !important;
          min-width: 64px !important;
          min-height: 64px !important;
          border-radius: 50% !important;
          font-size: 2.5rem !important; /* 40px */
          font-weight: 700 !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          line-height: 1 !important;
          padding: 0 !important;
          margin: 0 !important;
        }

        /* TARGET NESTED SPAN - This is where the number actually lives */
        .rdp-day_button span,
        .rdp-day_button > span,
        .rdp-day_button * {
          font-size: 2.5rem !important; /* 40px - MASSIVE */
          font-weight: 700 !important;
          line-height: 1 !important;
        }

        /* LITURGICAL DOTS */
        .liturgical-dot {
          position: absolute !important;
          bottom: 4px !important;
          left: 50% !important;
          transform: translateX(-50%) !important;
          width: 6px !important;
          height: 6px !important;
          border-radius: 50% !important;
          z-index: 20 !important;
        }
      `}} />
      
      {/* FORCE VISUALS SCRIPT: MutationObserver for MASSIVE font size enforcement */}
      <script dangerouslySetInnerHTML={{ __html: `
        (function() {
          const forceStyles = () => {
            // Force day button styles - MASSIVE FONTS
            document.querySelectorAll('.rdp-day_button').forEach(btn => {
               btn.style.setProperty('width', '64px', 'important');
               btn.style.setProperty('height', '64px', 'important');
               btn.style.setProperty('min-width', '64px', 'important');
               btn.style.setProperty('min-height', '64px', 'important');
               btn.style.setProperty('max-height', '64px', 'important');
               btn.style.setProperty('padding', '0', 'important'); 
               btn.style.setProperty('border-radius', '50%', 'important');
               btn.style.setProperty('font-size', '2.5rem', 'important');
               btn.style.setProperty('font-weight', '700', 'important');
               btn.style.setProperty('line-height', '1', 'important');
               btn.style.setProperty('display', 'flex', 'important');
               btn.style.setProperty('align-items', 'center', 'important');
               btn.style.setProperty('justify-content', 'center', 'important');
               
               // TARGET NESTED SPAN - the actual number element
               const spans = btn.querySelectorAll('span');
               spans.forEach(span => {
                  span.style.setProperty('font-size', '2.5rem', 'important');
                  span.style.setProperty('font-weight', '700', 'important');
                  span.style.setProperty('line-height', '1', 'important');
               });
            });

            // Force weekday header styles - LARGER
            document.querySelectorAll('.rdp-weekday').forEach(header => {
               header.style.setProperty('font-size', '20px', 'important');
               header.style.setProperty('font-weight', '600', 'important');
               header.style.setProperty('text-transform', 'uppercase', 'important');
               // Also target any child spans
               header.querySelectorAll('*').forEach(child => {
                  child.style.setProperty('font-size', '20px', 'important');
               });
            });
            
            // Force month caption styles - 37px as specified
            // Target both rdp-month_caption AND rdp-caption_label
            document.querySelectorAll('.rdp-month_caption, .rdp-caption_label').forEach(caption => {
               caption.style.setProperty('font-size', '37px', 'important');
               caption.style.setProperty('font-weight', '700', 'important');
               caption.style.setProperty('text-align', 'center', 'important');
               // Override any nested elements with text-sm class
               caption.querySelectorAll('*').forEach(child => {
                  child.style.setProperty('font-size', '37px', 'important');
               });
            });
            
            // Force nav container to flex row
            document.querySelectorAll('.rdp-nav').forEach(nav => {
               nav.style.setProperty('display', 'flex', 'important');
               nav.style.setProperty('flex-direction', 'row', 'important');
               nav.style.setProperty('justify-content', 'space-between', 'important');
               nav.style.setProperty('align-items', 'center', 'important');
               nav.style.setProperty('width', '100%', 'important');
               nav.style.setProperty('margin-bottom', '16px', 'important');
            });
          };

          requestAnimationFrame(forceStyles);
          setTimeout(forceStyles, 100);
          setTimeout(forceStyles, 500);

          const observer = new MutationObserver(forceStyles);
          observer.observe(document.body, { childList: true, subtree: true });
        })();
      ` }} />
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Agenda Kegiatan</h1>
            <p className="text-muted-foreground">
              Pengelolaan Agenda Kegiatan Keuskupan
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleSyncGoogleCalendar}
              disabled={isSyncing}
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
              {isSyncing ? 'Sinkronisasi...' : 'Sync Google Calendar'}
            </Button>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Agenda Baru
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Tambah Agenda Baru</DialogTitle>
                  <DialogDescription>
                    Tambahkan agenda pertemuan baru
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="judul">Judul Agenda *</Label>
                    <Input
                      id="judul"
                      placeholder="Masukkan judul agenda"
                      value={formData.judul}
                      onChange={(e) => setFormData({ ...formData, judul: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="tanggal">Tanggal *</Label>
                      <Input
                        id="tanggal"
                        type="date"
                        value={formData.tanggal}
                        onChange={(e) => setFormData({ ...formData, tanggal: e.target.value })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="waktu">Waktu *</Label>
                      <Input
                        id="waktu"
                        type="time"
                        value={formData.waktu}
                        onChange={(e) => setFormData({ ...formData, waktu: e.target.value })}
                      />
                    </div>
                  </div>
                  
                  {/* Multi-day toggle */}
                  <div className="flex items-center space-x-2 py-2">
                    <Switch 
                      id="multi-day"
                      checked={formData.isMultiDay}
                      onCheckedChange={(checked) => setFormData({
                        ...formData, 
                        isMultiDay: checked,
                        tanggalAkhir: checked ? formData.tanggalAkhir : ""
                      })}
                    />
                    <Label htmlFor="multi-day">Agenda lebih dari 1 hari</Label>
                  </div>
                  
                  {/* Conditional End Date/Time fields */}
                  {formData.isMultiDay && (
                    <div className="grid grid-cols-2 gap-4 p-3 bg-muted/30 rounded-lg border border-dashed">
                      <div className="grid gap-2">
                        <Label htmlFor="tanggalAkhir">Tanggal Selesai *</Label>
                        <Input
                          id="tanggalAkhir"
                          type="date"
                          value={formData.tanggalAkhir}
                          min={formData.tanggal}
                          onChange={(e) => setFormData({ ...formData, tanggalAkhir: e.target.value })}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="waktuAkhir">Waktu Selesai</Label>
                        <Input
                          id="waktuAkhir"
                          type="time"
                          value={formData.waktuAkhir}
                          onChange={(e) => setFormData({ ...formData, waktuAkhir: e.target.value })}
                        />
                      </div>
                    </div>
                  )}
                  <div className="grid gap-2">
                    <Label htmlFor="lokasi">Lokasi *</Label>
                    <Input
                      id="lokasi"
                      placeholder="Masukkan lokasi pertemuan"
                      value={formData.lokasi}
                      onChange={(e) => setFormData({ ...formData, lokasi: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="jenis">Jenis Pertemuan *</Label>
                    <Select value={formData.jenis} onValueChange={(value) => setFormData({ ...formData, jenis: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih jenis" />
                      </SelectTrigger>
                      <SelectContent>
                        {jenisPertemuanOptions.map((j) => (
                          <SelectItem key={j.id} value={j.nama}>{j.nama}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="peserta">Peserta *</Label>
                    <Input
                      id="peserta"
                      placeholder="Jumlah peserta atau nama peserta"
                      value={formData.peserta}
                      onChange={(e) => setFormData({ ...formData, peserta: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="deskripsi">Deskripsi</Label>
                    <Textarea
                      id="deskripsi"
                      placeholder="Tuliskan deskripsi agenda..."
                      className="min-h-[100px]"
                      value={formData.deskripsi}
                      onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="sync-google" className="rounded" title="Sinkronkan dengan Google Calendar" />
                    <Label htmlFor="sync-google">Sinkronkan dengan Google Calendar</Label>
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => {
                    setIsCreateDialogOpen(false)
                    resetForm()
                  }}>
                    Batal
                  </Button>
                  <Button onClick={handleCreate}>
                    Simpan Agenda
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Tabs defaultValue="list" className="space-y-4">
          <TabsList>
            <TabsTrigger value="list">Daftar Agenda</TabsTrigger>
            <TabsTrigger value="calendar">Kalender</TabsTrigger>
          </TabsList>

          <TabsContent value="list" className="space-y-4">
            {/* Filters */}
            <Card>
              <CardHeader>
                <CardTitle>Filter dan Pencarian</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-4 items-end">
                  <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Cari agenda..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                  <Select value={filterJenis} onValueChange={setFilterJenis}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filter jenis" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="semua">Semua Jenis</SelectItem>
                      {jenisPertemuanOptions.map((j) => (
                        <SelectItem key={j.id} value={j.nama}>{j.nama}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="flex gap-2 items-end">
                    <div className="grid gap-1">
                      <Label className="text-xs text-muted-foreground">Dari Tanggal</Label>
                      <Input
                        type="date"
                        value={filterStartDate}
                        onChange={(e) => setFilterStartDate(e.target.value)}
                        className="w-[150px]"
                      />
                    </div>
                    <div className="grid gap-1">
                      <Label className="text-xs text-muted-foreground">Sampai Tanggal</Label>
                      <Input
                        type="date"
                        value={filterEndDate}
                        onChange={(e) => setFilterEndDate(e.target.value)}
                        className="w-[150px]"
                      />
                    </div>
                    {(filterStartDate || filterEndDate) && (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => {
                          setFilterStartDate("")
                          setFilterEndDate("")
                        }}
                        className="text-xs"
                      >
                        Reset
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Agenda List */}
            <div className="grid gap-4">
              {filteredAgenda.map((item) => (
                <Card key={item.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-semibold">{item.judul}</h3>
                          {getJenisBadge(item.jenis)}
                          {item.googleCalendarId && (
                            <Badge variant="outline" className="text-xs">
                              <CalendarIcon className="w-3 h-3 mr-1" />
                              Google Calendar
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <CalendarIcon className="h-4 w-4" />
                            {new Date(item.tanggal).toLocaleDateString('id-ID')}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {item.waktu}
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {item.lokasi}
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            {item.peserta}
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {item.deskripsi}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleEdit(item)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        {item.googleCalendarId && (
                          <Button variant="outline" size="sm">
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(item.id, item.judul)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="calendar" className="space-y-6">
            {/* Calendar - Full Width */}
            {/* Split Layout: Info Panel (Left) vs Calendar (Right) */}
            <div className="grid grid-cols-1 lg:grid-cols-[350px_1fr] gap-6 items-start">
              
              {/* Left Panel: Detailed Day Info */}
              <Card className="h-full border-none shadow-none bg-transparent lg:bg-card lg:border lg:shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle>Detail Hari</CardTitle>
                  <CardDescription>Informasi lengkap tanggal terpilih</CardDescription>
                </CardHeader>
                <CardContent>
                  {selectedDate ? (
                    <div className={cn(
                      "flex flex-col gap-6 p-6 rounded-xl border transition-all",
                      selectedDate && isRedDay(selectedDate)
                        ? "bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-900/50"
                        : selectedDate && getLiturgicalEventForSidebar(selectedDate)
                          ? "bg-purple-50 border-purple-200 dark:bg-purple-950/20 dark:border-purple-900/50"
                          : "bg-card border-border shadow-sm dark:bg-muted/10"
                    )}>
                      {/* Big Date Display */}
                      <div className="flex flex-col items-center justify-center text-center pb-4 border-b border-border/10">
                        <span className="text-8xl font-black tracking-tighter text-foreground/90">
                          {selectedDate.getDate()}
                        </span>
                        <span className="text-xl font-medium text-muted-foreground uppercase tracking-widest">
                          {selectedDate.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
                        </span>
                      </div>

                      {/* Day & Event Info */}
                      <div className="space-y-4">
                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">Hari</p>
                          <p className={cn(
                            "text-2xl font-bold",
                            isRedDay(selectedDate) ? "text-red-600 dark:text-red-400" : "text-foreground"
                          )}>
                            {selectedDate.toLocaleDateString('id-ID', { weekday: 'long' })}
                          </p>
                        </div>

                        {/* Event Details Priority: Liturgy First, then Holiday Info */}
                        {getLiturgicalEventForSidebar(selectedDate) && (
                          <div className="space-y-1">
                            <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">Event Liturgi</p>
                            <div className="flex items-start gap-2 text-purple-600 dark:text-purple-400">
                              <span className="text-xl mt-0.5">✝️</span>
                              <div>
                                <p className="text-lg font-semibold leading-tight">
                                  {getLiturgicalEventForSidebar(selectedDate)?.name}
                                </p>
                                {getLiturgicalEventForSidebar(selectedDate)?.color && (
                                  <Badge variant="outline" className="mt-2 capitalize bg-background/50 backdrop-blur">
                                    {getLiturgicalEventForSidebar(selectedDate)?.color}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        )}

                        {isRedDay(selectedDate) && (
                          <div className="space-y-1">
                            <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">Keterangan Libur</p>
                            <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                              <span className="text-xl">🎌</span>
                              <p className="text-lg font-semibold leading-tight">
                                {getHolidayName(selectedDate) || (selectedDate.getDay() === 0 ? "Hari Minggu" : "Hari Libur Nasional")}
                              </p>
                            </div>
                          </div>
                        )}
                        
                        {!getLiturgicalEventForSidebar(selectedDate) && !isRedDay(selectedDate) && (
                           <div className="space-y-1">
                             <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">Keterangan</p>
                             <p className="text-lg text-muted-foreground">Hari Biasa</p>
                          </div>
                        )}

                        {/* Agenda Count Message */}
                        {(() => {
                          const agendaCount = getAgendaForDate(selectedDate).length
                          if (agendaCount === 0) return null
                          const dotColor = agendaCount === 1 ? 'bg-green-500' : agendaCount === 2 ? 'bg-amber-500' : 'bg-red-500'
                          const textColor = agendaCount === 1 ? 'text-green-600 dark:text-green-400' : agendaCount === 2 ? 'text-amber-600 dark:text-amber-400' : 'text-red-600 dark:text-red-400'
                          return (
                            <div className="space-y-1 pt-2 border-t border-border/50">
                              <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">Agenda Hari Ini</p>
                              <div className={`flex items-center gap-2 ${textColor}`}>
                                <div className={`w-3 h-3 rounded-full ${dotColor}`} />
                                <p className="text-lg font-semibold">
                                  Ada {agendaCount} agenda pada hari ini
                                </p>
                              </div>
                            </div>
                          )
                        })()}
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-[300px] text-muted-foreground bg-muted/10 rounded-xl border border-dashed">
                      <CalendarIcon className="h-12 w-12 mb-4 opacity-20" />
                      <p>Pilih tanggal di kalender</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Right Panel: Calendar */}
              <Card className="h-full border-none shadow-none lg:border lg:shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CalendarIcon className="h-5 w-5" />
                    Kalender Agenda
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex justify-center p-0 lg:p-6">
                  <AgendaContext.Provider value={agendaList}>
                    <TooltipProvider>
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        month={currentMonth}
                        onMonthChange={setCurrentMonth}
                        navLayout="around"
                        components={{
                          DayButton: CustomDayButton
                        }}
                        className="rounded-lg border shadow-sm p-6 calendar-large w-full max-w-none"
                        modifiers={{
                          holiday: (date) => isRedDay(date)
                        }}
                        modifiersClassNames={{
                          holiday: "text-red-500 font-bold hover:text-red-600"
                        }}
                      />
                    </TooltipProvider>
                  </AgendaContext.Provider>
                </CardContent>
              </Card>
            </div>

            {/* Selected Date Agenda - Below Calendar */}
            <Card>
              <CardHeader className="bg-muted/30">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="h-5 w-5" />
                      Agenda {selectedDate?.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </CardTitle>
                    <CardDescription>
                      {getAgendaForDate(selectedDate || new Date()).length} agenda terjadwal
                    </CardDescription>
                  </div>
                  <Badge variant="outline" className="text-lg px-3 py-1">
                    {getAgendaForDate(selectedDate || new Date()).length}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                {getAgendaForDate(selectedDate || new Date()).length > 0 ? (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {getAgendaForDate(selectedDate || new Date()).map((item) => (
                      <div key={item.id} className="flex flex-col space-y-3 rounded-lg border p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between">
                          <h4 className="font-semibold text-base line-clamp-2">{item.judul}</h4>
                          {getJenisBadge(item.jenis)}
                        </div>
                        <div className="space-y-2 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            <span>{item.waktu}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            <span>{item.lokasi}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            <span>{item.peserta}</span>
                          </div>
                        </div>
                        <div className="flex gap-2 pt-2 border-t">
                          <Button size="sm" variant="outline" className="flex-1" onClick={() => handleView(item)}>
                            <Eye className="h-3 w-3 mr-1" /> Detail
                          </Button>
                          <Button size="sm" variant="outline" className="flex-1" onClick={() => handleEdit(item)}>
                            <Edit className="h-3 w-3 mr-1" /> Edit
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <CalendarIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium">Tidak ada agenda</p>
                    <p className="text-sm">Tidak ada agenda terjadwal pada tanggal ini</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Agenda</DialogTitle>
              <DialogDescription>
                Perbarui agenda pertemuan
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-judul">Judul Agenda *</Label>
                <Input
                  id="edit-judul"
                  placeholder="Masukkan judul agenda"
                  value={formData.judul}
                  onChange={(e) => setFormData({ ...formData, judul: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-tanggal">Tanggal *</Label>
                  <Input
                    id="edit-tanggal"
                    type="date"
                    value={formData.tanggal}
                    onChange={(e) => setFormData({ ...formData, tanggal: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-waktu">Waktu *</Label>
                  <Input
                    id="edit-waktu"
                    type="time"
                    value={formData.waktu}
                    onChange={(e) => setFormData({ ...formData, waktu: e.target.value })}
                  />
                </div>
              </div>
              
              {/* Multi-day toggle for Edit */}
              <div className="flex items-center space-x-2 py-2">
                <Switch 
                  id="edit-multi-day"
                  checked={formData.isMultiDay}
                  onCheckedChange={(checked) => setFormData({
                    ...formData, 
                    isMultiDay: checked,
                    tanggalAkhir: checked ? formData.tanggalAkhir : ""
                  })}
                />
                <Label htmlFor="edit-multi-day">Agenda lebih dari 1 hari</Label>
              </div>
              
              {/* Conditional End Date/Time fields for Edit */}
              {formData.isMultiDay && (
                <div className="grid grid-cols-2 gap-4 p-3 bg-muted/30 rounded-lg border border-dashed">
                  <div className="grid gap-2">
                    <Label htmlFor="edit-tanggalAkhir">Tanggal Selesai *</Label>
                    <Input
                      id="edit-tanggalAkhir"
                      type="date"
                      value={formData.tanggalAkhir}
                      min={formData.tanggal}
                      onChange={(e) => setFormData({ ...formData, tanggalAkhir: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-waktuAkhir">Waktu Selesai</Label>
                    <Input
                      id="edit-waktuAkhir"
                      type="time"
                      value={formData.waktuAkhir}
                      onChange={(e) => setFormData({ ...formData, waktuAkhir: e.target.value })}
                    />
                  </div>
                </div>
              )}
              <div className="grid gap-2">
                <Label htmlFor="edit-lokasi">Lokasi *</Label>
                <Input
                  id="edit-lokasi"
                  placeholder="Masukkan lokasi pertemuan"
                  value={formData.lokasi}
                  onChange={(e) => setFormData({ ...formData, lokasi: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-jenis">Jenis Pertemuan *</Label>
                <Select value={formData.jenis} onValueChange={(value) => setFormData({ ...formData, jenis: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih jenis" />
                  </SelectTrigger>
                  <SelectContent>
                    {jenisPertemuanOptions.map((j) => (
                      <SelectItem key={j.id} value={j.nama}>{j.nama}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-peserta">Peserta *</Label>
                <Input
                  id="edit-peserta"
                  placeholder="Jumlah peserta atau nama peserta"
                  value={formData.peserta}
                  onChange={(e) => setFormData({ ...formData, peserta: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-deskripsi">Deskripsi</Label>
                <Textarea
                  id="edit-deskripsi"
                  placeholder="Tuliskan deskripsi agenda..."
                  className="min-h-[100px]"
                  value={formData.deskripsi}
                  onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => {
                setIsEditDialogOpen(false)
                setSelectedAgenda(null)
                resetForm()
              }}>
                Batal
              </Button>
              <Button onClick={handleUpdate}>
                Update Agenda
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout >
  )
}