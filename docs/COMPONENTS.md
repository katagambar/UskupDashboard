# 🧩 Components & Hooks Documentation

## UI Components

Dashboard menggunakan **shadcn/ui** sebagai base component library dengan customization.

### Lokasi

```
src/components/
├── ui/                    # shadcn/ui components
│   ├── button.tsx
│   ├── card.tsx
│   ├── dialog.tsx
│   ├── input.tsx
│   ├── select.tsx
│   ├── table.tsx
│   ├── tabs.tsx
│   ├── skeletons.tsx      # Loading skeletons
│   └── ...
├── dashboard-layout.tsx   # Main layout
├── sidebar-nav.tsx        # Navigation sidebar
├── header.tsx             # Header component
├── providers.tsx          # App providers
└── keyboard-shortcuts-dialog.tsx
```

---

## Core Components

### DashboardLayout

Layout utama untuk semua halaman dashboard.

```tsx
import { DashboardLayout } from "@/components/dashboard-layout"

export default function Page() {
  return (
    <DashboardLayout>
      {/* Page content */}
    </DashboardLayout>
  )
}
```

**Features:**

- Responsive sidebar (static di desktop, Sheet di mobile)
- Mobile hamburger menu terintegrasi di Header
- Header dengan page title dinamis dan search bar
- Tinggi header proporsional (h-20 = 80px)

### Header

Header content area dengan info halaman dan actions.

**Features:**

- Page title dan description dinamis sesuai route
- Search bar (visible di desktop)
- Notifications dan Theme Toggle
- Mobile menu trigger

### SidebarNav

Navigasi sidebar dengan branding dan user section.

**Features:**

- Logo Keuskupan Surabaya dengan rounded corners
- Teks "Keuskupan Surabaya" dalam 2 baris
- Navigation menu dengan active state
- User section di bagian bawah dengan dropdown menu

```tsx
const sidebarNavItems = [
  { title: "Dashboard", href: "/", icon: LayoutDashboard },
  { title: "Agenda", href: "/agenda", icon: Calendar },
  { title: "Tugas Uskup", href: "/tasks", icon: CheckSquare },
  // ...
]
```

### Providers

Wrapper untuk app-wide providers.

```tsx
// Includes:
// - QueryProvider (TanStack Query)
// - ThemeProvider (Dark/Light mode)
```

---

## Loading Skeletons

Komponen skeleton untuk loading states. Lokasi: `src/components/ui/skeletons.tsx`

### Available Skeletons

| Component | Usage |
|-----------|-------|
| `Skeleton` | Base skeleton element |
| `CardSkeleton` | Card loading state |
| `TableSkeleton` | Table loading state |
| `TableRowSkeleton` | Single table row skeleton |
| `ListItemSkeleton` | List item loading |
| `DashboardStatsSkeleton` | Dashboard stats cards |
| `PageLoadingSkeleton` | Full page loading |
| `AgendaCardSkeleton` | Agenda card loading |
| `TaskCardSkeleton` | Task card loading |

### Usage

```tsx
import { CardSkeleton, TableSkeleton } from "@/components/ui/skeletons"

function MyComponent() {
  const { data, isLoading } = useQuery(...)
  
  if (isLoading) {
    return <CardSkeleton />
  }
  
  return <ActualContent data={data} />
}
```

---

## Custom Hooks

### useAuth

Hook untuk authentication state.

```tsx
import { useCurrentUser } from "@/hooks/useAuth"

function Component() {
  const { user, isAuthenticated, isLoading, login, logout } = useCurrentUser()
  
  // Login with remember me
  await login(email, password, rememberMe)
  
  // Logout
  await logout()
}
```

**Returns:**

| Property | Type | Description |
|----------|------|-------------|
| user | User \| null | Current user object |
| isAuthenticated | boolean | Auth status |
| isLoading | boolean | Loading state |
| login | function | Login function |
| logout | function | Logout function |
| checkAuth | function | Recheck auth status |

### useQueryApi (React Query)

Hooks untuk data fetching dengan caching.

```tsx
import { 
  useAgendaQuery, 
  useTasksQuery,
  useAgendaCrud 
} from "@/hooks/useQueryApi"

function Component() {
  // Query hooks
  const { data, isLoading, error } = useAgendaQuery()
  const { data: tasks } = useTasksQuery()
  
  // CRUD mutations
  const { create, update, remove } = useAgendaCrud()
  
  // Create
  await create.mutateAsync({ judul: "New Agenda", ... })
  
  // Update
  await update.mutateAsync({ id: "123", data: { judul: "Updated" } })
  
  // Delete
  await remove.mutateAsync("123")
}
```

**Available Query Hooks:**

- `useAgendaQuery()` - Fetch agenda list
- `useTasksQuery()` - Fetch tasks list
- `useNotulensiQuery()` - Fetch notulensi list
- `useImamQuery()` - Fetch imam list
- `useSuratQuery()` - Fetch surat list
- `useDecisionsQuery()` - Fetch decisions list

**Available CRUD Hooks:**

- `useAgendaCrud()` - CRUD for agenda
- `useTasksCrud()` - CRUD for tasks
- `useNotulensiCrud()` - CRUD for notulensi
- `useImamCrud()` - CRUD for imam
- `useSuratCrud()` - CRUD for surat
- `useDecisionsCrud()` - CRUD for decisions

### useKeyboardShortcuts

Hook untuk keyboard shortcuts.

```tsx
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts"

function Component() {
  useKeyboardShortcuts([
    {
      key: 'n',
      shift: true,
      action: () => setCreateDialogOpen(true),
      description: 'Create new item'
    },
    {
      key: 'Escape',
      action: () => setDialogOpen(false),
      description: 'Close dialog'
    }
  ])
}
```

**Shortcut Options:**

| Option | Type | Description |
|--------|------|-------------|
| key | string | Key to listen for |
| ctrl | boolean | Require Ctrl/Cmd key |
| shift | boolean | Require Shift key |
| alt | boolean | Require Alt key |
| action | function | Callback function |
| description | string | Description for help |

### useApi (Legacy)

Legacy hooks untuk backward compatibility.

```tsx
import { useAgenda, useTasks, useCrud } from "@/hooks/useApi"

function Component() {
  const { data, loading, refetch } = useAgenda()
  const { create, update, remove } = useCrud('/api/agenda')
}
```

> **Note:** Prefer `useQueryApi` hooks untuk caching dan better state management.

---

## Utility Components

### KeyboardShortcutsDialog

Dialog untuk menampilkan keyboard shortcuts.

```tsx
import { KeyboardShortcutsDialog } from "@/components/keyboard-shortcuts-dialog"

// Tekan ? untuk membuka dialog
```

**Default Shortcuts:**

| Shortcut | Action |
|----------|--------|
| `?` | Show help dialog |
| `Ctrl+D` | Go to Dashboard |
| `Ctrl+A` | Go to Agenda |
| `Ctrl+T` | Go to Tasks |
| `Shift+N` | Create new item |
| `Esc` | Close dialog |
