
"use client"

import { useState, useEffect } from "react"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MoreHorizontal, Plus, Search, Trash2, Pencil, Loader2, ShieldAlert } from "lucide-react"
import { showSuccess, showError } from "@/lib/alerts"
import { canManageUsers, getRoleDisplayName } from "@/lib/rbac"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"

interface User {
    id: string
    name: string
    email: string
    role: string
    jabatan: string | null
    createdAt: string
}

const USER_ROLES = [
    "USKUP", "SEKRETARIS", "VIKJEN", "VIKYUD", "EKONOM",
    "DELEGATUS", "KURIA", "VIKEP", "KOMISI", "PAROKI", "STAFF"
]

export function UserManagement({ currentUserRole, isProfileLoading }: { currentUserRole: string, isProfileLoading?: boolean }) {
    const [users, setUsers] = useState<User[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")

    // Dialog States
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [editingUser, setEditingUser] = useState<User | null>(null)

    // Form State
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        role: "STAFF",
        jabatan: "",
        password: ""
    })
    const [isSaving, setIsSaving] = useState(false)

    // Use centralized RBAC for permission check
    const canManage = canManageUsers(currentUserRole)

    useEffect(() => {
        if (canManage) {
            fetchUsers()
        } else {
            setIsLoading(false)
        }
    }, [canManage])

    const fetchUsers = async () => {
        try {
            const res = await fetch('/api/users')
            const result = await res.json()
            if (result.success) {
                setUsers(result.data)
            } else {
                showError(result.error)
            }
        } catch (error) {
            console.error('Failed to fetch users', error)
            showError('Gagal mengambil data pengguna')
        } finally {
            setIsLoading(false)
        }
    }

    const handleSave = async () => {
        // Basic validation
        if (!formData.name || !formData.email || !formData.role) {
            showError("Nama, Email, dan Role wajib diisi")
            return
        }
        if (!editingUser && !formData.password) {
            showError("Password wajib diisi untuk pengguna baru")
            return
        }

        setIsSaving(true)
        try {
            const url = editingUser ? `/api/users/${editingUser.id}` : '/api/users'
            const method = editingUser ? 'PATCH' : 'POST'

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            })
            const result = await res.json()

            if (result.success) {
                showSuccess(editingUser ? 'Pengguna berhasil diperbarui' : 'Pengguna berhasil dibuat')
                setIsDialogOpen(false)
                fetchUsers()
                resetForm()
            } else {
                showError(result.error || 'Gagal menyimpan data')
            }
        } catch (error) {
            showError('Terjadi kesalahan saat menyimpan')
        } finally {
            setIsSaving(false)
        }
    }

    const handleDelete = async (id: string) => {
        try {
            const res = await fetch(`/api/users/${id}`, { method: 'DELETE' })
            const result = await res.json()
            if (result.success) {
                showSuccess('Pengguna berhasil dihapus')
                fetchUsers()
            } else {
                showError(result.error || 'Gagal menghapus pengguna')
            }
        } catch (error) {
            showError('Gagal menghapus pengguna')
        }
    }

    const openAddDialog = () => {
        setEditingUser(null)
        resetForm()
        setIsDialogOpen(true)
    }

    const openEditDialog = (user: User) => {
        setEditingUser(user)
        setFormData({
            name: user.name,
            email: user.email,
            role: user.role,
            jabatan: user.jabatan || "",
            password: "" // Don't fill password on edit
        })
        setIsDialogOpen(true)
    }

    const resetForm = () => {
        setFormData({ name: "", email: "", role: "STAFF", jabatan: "", password: "" })
    }

    const filteredUsers = users.filter(u =>
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.role.toLowerCase().includes(searchTerm.toLowerCase())
    )

    // Show loading while profile is being fetched
    if (isProfileLoading) {
        return (
            <Card>
                <CardContent className="flex flex-col items-center justify-center py-10">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    <p className="text-muted-foreground mt-2">Memuat data...</p>
                </CardContent>
            </Card>
        )
    }

    if (!canManage) {
        return (
            <Card>
                <CardContent className="flex flex-col items-center justify-center py-10 text-center">
                    <ShieldAlert className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold">Akses Ditolak</h3>
                    <p className="text-muted-foreground max-w-sm">
                        Anda tidak memiliki izin untuk mengelola pengguna. Silakan hubungi Sekretariat Keuskupan jika Anda memerlukan akses ini.
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">Role Anda: {currentUserRole}</p>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <CardTitle>Manajemen Pengguna</CardTitle>
                        <CardDescription>
                            Kelola akun staf dan pejabat keuskupan yang memiliki akses ke sistem.
                        </CardDescription>
                    </div>
                    <Button onClick={openAddDialog}>
                        <Plus className="mr-2 h-4 w-4" /> Tambah Pengguna
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                <div className="mb-4">
                    <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Cari nama, email, atau role..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-8 max-w-md"
                        />
                    </div>
                </div>

                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nama</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead>Jabatan</TableHead>
                                <TableHead className="text-right">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-24 text-center">
                                        <div className="flex justify-center"><Loader2 className="h-6 w-6 animate-spin" /></div>
                                    </TableCell>
                                </TableRow>
                            ) : filteredUsers.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                                        Belum ada pengguna yang ditemukan.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredUsers.map((user) => (
                                    <TableRow key={user.id}>
                                        <TableCell className="font-medium">{user.name}</TableCell>
                                        <TableCell>{user.email}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline" title={user.role}>
                                                {getRoleDisplayName(user.role)}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{user.jabatan || '-'}</TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                                        <span className="sr-only">Open menu</span>
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                                                    <DropdownMenuItem onClick={() => openEditDialog(user)}>
                                                        <Pencil className="mr-2 h-4 w-4" /> Edit Detail
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild>
                                                            <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-red-600">
                                                                <Trash2 className="mr-2 h-4 w-4" /> Hapus Akun
                                                            </DropdownMenuItem>
                                                        </AlertDialogTrigger>
                                                        <AlertDialogContent>
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle>Hapus Pengguna?</AlertDialogTitle>
                                                                <AlertDialogDescription>
                                                                    Apakah Anda yakin ingin menghapus akun <b>{user.name}</b>? Tindakan ini tidak dapat dibatalkan.
                                                                </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel>Batal</AlertDialogCancel>
                                                                <AlertDialogAction onClick={() => handleDelete(user.id)} className="bg-red-600">Hapus</AlertDialogAction>
                                                            </AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Create/Edit Dialog */}
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                            <DialogTitle>{editingUser ? 'Edit Pengguna' : 'Tambah Pengguna Baru'}</DialogTitle>
                            <DialogDescription>
                                Isi detail pengguna di bawah ini. {editingUser ? 'Kosongkan password jika tidak ingin mengubahnya.' : ''}
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="name" className="text-right">Nama</Label>
                                <Input id="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="col-span-3" />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="email" className="text-right">Email</Label>
                                <Input id="email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="col-span-3" />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="role" className="text-right">Role</Label>
                                <Select value={formData.role} onValueChange={(v) => setFormData({ ...formData, role: v })}>
                                    <SelectTrigger className="col-span-3">
                                        <SelectValue placeholder="Pilih Role" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {USER_ROLES.map(role => (
                                            <SelectItem key={role} value={role}>{role}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="jabatan" className="text-right">Jabatan (Opsional)</Label>
                                <Input id="jabatan" value={formData.jabatan} onChange={(e) => setFormData({ ...formData, jabatan: e.target.value })} className="col-span-3" placeholder="Contoh: Staff Sekretariat" />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="password" className="text-right">Password</Label>
                                <Input id="password" type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} className="col-span-3" placeholder={editingUser ? '(Tidak Berubah)' : 'Password Baru'} />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Batal</Button>
                            <Button onClick={handleSave} disabled={isSaving}>
                                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Simpan
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </CardContent>
        </Card>
    )
}
