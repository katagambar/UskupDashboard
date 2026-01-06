"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Search, CheckCircle, Clock, AlertCircle, Calendar, User, Flag, Edit, Trash2, Eye } from "lucide-react"
import { showSuccess, showError, confirmDelete, confirmAction } from "@/lib/alerts"
import { useTasks, useCrud } from "@/hooks/useApi"
import { usePrioritas, useKategoriTugas } from "@/hooks/use-parameters"

interface Task {
  id: string
  judul: string
  deskripsi: string
  prioritas: string
  status: string
  progress: number
  deadline: string
  kategori: string
  penanggungJawab: string
  createdAt: string
  completedAt?: string
}

export default function TasksPage() {
  const { data: taskList, loading, refetch } = useTasks()
  const { create, update, remove, loading: crudLoading } = useCrud('/api/tasks')
  const { parameters: prioritasOptions } = usePrioritas()
  const { parameters: kategoriOptions } = useKategoriTugas()

  const [searchTerm, setSearchTerm] = useState("")
  const [filterPrioritas, setFilterPrioritas] = useState("semua")
  const [filterStatus, setFilterStatus] = useState("semua")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isProgressDialogOpen, setIsProgressDialogOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [formData, setFormData] = useState({
    judul: "",
    deskripsi: "",
    prioritas: "",
    deadline: "",
    kategori: "",
    penanggungJawab: ""
  })
  const [progressValue, setProgressValue] = useState(0)

  const filteredTasks = taskList.filter(item => {
    const matchesSearch = item.judul.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.deskripsi.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesPrioritas = filterPrioritas === "semua" || item.prioritas === filterPrioritas
    const matchesStatus = filterStatus === "semua" || item.status === filterStatus
    return matchesSearch && matchesPrioritas && matchesStatus
  })

  const handleCreate = async () => {


    const missingFields: string[] = []
    if (!formData.judul?.trim()) missingFields.push('judul')
    if (!formData.deskripsi?.trim()) missingFields.push('deskripsi')
    if (!formData.prioritas?.trim()) missingFields.push('prioritas')
    if (!formData.deadline?.trim()) missingFields.push('deadline')
    if (!formData.kategori?.trim()) missingFields.push('kategori')
    if (!formData.penanggungJawab?.trim()) missingFields.push('penanggungJawab')

    if (missingFields.length > 0) {

      showError(`Mohon lengkapi field: ${missingFields.join(', ')}`)
      return
    }



    const result = await create(formData)

    if (result.success) {
      showSuccess("Tugas berhasil ditambahkan")
      setIsCreateDialogOpen(false)
      resetForm()
      refetch()
    }
  }

  const handleEdit = (task: Task) => {


    setSelectedTask(task)
    const updatedFormData = {
      judul: task.judul,
      deskripsi: task.deskripsi,
      prioritas: task.prioritas,
      deadline: task.deadline,
      kategori: task.kategori,
      penanggungJawab: task.penanggungJawab
    }

    setFormData(updatedFormData)
    setIsEditDialogOpen(true)
  }

  const handleUpdate = async () => {


    if (!selectedTask) {
      showError("Tidak ada task yang dipilih")
      return
    }

    const missingFields: string[] = []
    if (!formData.judul?.trim()) missingFields.push('judul')
    if (!formData.deskripsi?.trim()) missingFields.push('deskripsi')
    if (!formData.prioritas?.trim()) missingFields.push('prioritas')
    if (!formData.deadline?.trim()) missingFields.push('deadline')
    if (!formData.kategori?.trim()) missingFields.push('kategori')
    if (!formData.penanggungJawab?.trim()) missingFields.push('penanggungJawab')

    if (missingFields.length > 0) {

      showError(`Mohon lengkapi field: ${missingFields.join(', ')}`)
      return
    }

    const result = await update(selectedTask.id, formData)

    if (result.success) {
      showSuccess("Tugas berhasil diperbarui")
      setIsEditDialogOpen(false)
      setSelectedTask(null)
      resetForm()
      refetch()
    }
  }

  const handleDelete = async (id: string, judul: string) => {
    const confirmed = await confirmDelete(`tugas "${judul}"`)
    if (confirmed) {
      const result = await remove(id)
      if (result.success) {
        showSuccess("Tugas berhasil dihapus")
        refetch()
      }
    }
  }

  const handleUpdateProgress = async (task: Task) => {
    setSelectedTask(task)
    setProgressValue(task.progress)
    setIsProgressDialogOpen(true)
  }

  const handleSaveProgress = async () => {
    if (!selectedTask) return

    const confirmed = await confirmAction(`Apakah Anda yakin ingin mengupdate progress tugas "${selectedTask.judul}" menjadi ${progressValue}%?`)
    if (confirmed) {
      const result = await update(selectedTask.id, { progress: progressValue })
      if (result.success) {
        showSuccess("Progress tugas berhasil diperbarui")
        setIsProgressDialogOpen(false)
        setSelectedTask(null)
        setProgressValue(0)
        refetch()
      }
    }
  }

  const resetForm = () => {
    setFormData({
      judul: "",
      deskripsi: "",
      prioritas: "",
      deadline: "",
      kategori: "",
      penanggungJawab: ""
    })
  }

  const getPrioritasBadge = (prioritas: string) => {
    switch (prioritas) {
      case "Tinggi":
        return <Badge className="bg-red-100 text-red-800">Tinggi</Badge>
      case "Sedang":
        return <Badge className="bg-yellow-100 text-yellow-800">Sedang</Badge>
      case "Rendah":
        return <Badge className="bg-green-100 text-green-800">Rendah</Badge>
      default:
        return <Badge variant="outline">{prioritas}</Badge>
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Selesai":
        return <Badge className="bg-green-100 text-green-800">Selesai</Badge>
      case "Dalam Proses":
        return <Badge className="bg-blue-100 text-blue-800">Dalam Proses</Badge>
      case "Menunggu":
        return <Badge variant="outline">Menunggu</Badge>
      case "Terlambat":
        return <Badge className="bg-red-100 text-red-800">Terlambat</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return "bg-green-500"
    if (progress >= 50) return "bg-yellow-500"
    return "bg-red-500"
  }

  const stats = {
    total: taskList.length,
    selesai: taskList.filter(t => t.status === "Selesai").length,
    dalamProses: taskList.filter(t => t.status === "Dalam Proses").length,
    menunggu: taskList.filter(t => t.status === "Menunggu").length,
    prioritasTinggi: taskList.filter(t => t.prioritas === "Tinggi").length
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Tugas Uskup</h1>
            <p className="text-muted-foreground">
              Kelola dan pantau tugas-tugas yang perlu diselesaikan
            </p>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Tugas Baru
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Tambah Tugas Baru</DialogTitle>
                <DialogDescription>
                  Tambahkan tugas baru untuk Uskup
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="judul">Judul Tugas *</Label>
                  <Input
                    id="judul"
                    placeholder="Masukkan judul tugas"
                    value={formData.judul}
                    onChange={(e) => setFormData({ ...formData, judul: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="deskripsi">Deskripsi *</Label>
                  <Textarea
                    id="deskripsi"
                    placeholder="Tuliskan deskripsi tugas..."
                    className="min-h-[100px]"
                    value={formData.deskripsi}
                    onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="prioritas">Prioritas *</Label>
                    <Select value={formData.prioritas} onValueChange={(value) => setFormData({ ...formData, prioritas: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih prioritas" />
                      </SelectTrigger>
                      <SelectContent>
                        {prioritasOptions.map((p) => (
                          <SelectItem key={p.id} value={p.nama}>{p.nama}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="deadline">Deadline *</Label>
                    <Input
                      id="deadline"
                      type="date"
                      value={formData.deadline}
                      onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="kategori">Kategori *</Label>
                  <Select value={formData.kategori} onValueChange={(value) => setFormData({ ...formData, kategori: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih kategori" />
                    </SelectTrigger>
                    <SelectContent>
                      {kategoriOptions.map((k) => (
                        <SelectItem key={k.id} value={k.nama}>{k.nama}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="penanggungJawab">Penanggung Jawab *</Label>
                  <Input
                    id="penanggungJawab"
                    placeholder="Masukkan nama penanggung jawab"
                    value={formData.penanggungJawab}
                    onChange={(e) => setFormData({ ...formData, penanggungJawab: e.target.value })}
                  />
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
                  Simpan Tugas
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Tugas</CardTitle>
              <Flag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Selesai</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.selesai}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Dalam Proses</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.dalamProses}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Menunggu</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.menunggu}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Prioritas Tinggi</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.prioritasTinggi}</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="aktif" className="space-y-4">
          <TabsList>
            <TabsTrigger value="aktif">Tugas Aktif</TabsTrigger>
            <TabsTrigger value="selesai">Selesai</TabsTrigger>
            <TabsTrigger value="semua">Semua Tugas</TabsTrigger>
          </TabsList>

          <TabsContent value="aktif" className="space-y-4">
            {/* Filters */}
            <Card>
              <CardHeader>
                <CardTitle>Filter dan Pencarian</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4 items-center">
                  <div className="relative flex-1">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Cari tugas..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                  <Select value={filterPrioritas} onValueChange={setFilterPrioritas}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Prioritas" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="semua">Semua</SelectItem>
                      {prioritasOptions.map((p) => (
                        <SelectItem key={p.id} value={p.nama}>{p.nama}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="semua">Semua</SelectItem>
                      <SelectItem value="Dalam Proses">Dalam Proses</SelectItem>
                      <SelectItem value="Menunggu">Menunggu</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Active Tasks */}
            <div className="grid gap-4">
              {filteredTasks.filter(task => task.status !== "Selesai").map((task) => (
                <Card key={task.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="space-y-3 flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-semibold">{task.judul}</h3>
                          {getPrioritasBadge(task.prioritas)}
                          {getStatusBadge(task.status)}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {task.deskripsi}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            Deadline: {new Date(task.deadline).toLocaleDateString('id-ID')}
                          </div>
                          <div className="flex items-center gap-1">
                            <User className="h-4 w-4" />
                            {task.penanggungJawab}
                          </div>
                          <Badge variant="outline">{task.kategori}</Badge>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span>Progress</span>
                            <span className="text-muted-foreground">{task.progress}%</span>
                          </div>
                          <Progress
                            value={task.progress}
                            className={`h-2 ${task.progress >= 80
                              ? '[&>div]:bg-gradient-to-r [&>div]:from-green-500 [&>div]:to-green-600'
                              : task.progress >= 50
                                ? '[&>div]:bg-gradient-to-r [&>div]:from-blue-500 [&>div]:to-blue-600'
                                : task.progress >= 25
                                  ? '[&>div]:bg-gradient-to-r [&>div]:from-yellow-500 [&>div]:to-orange-500'
                                  : '[&>div]:bg-gradient-to-r [&>div]:from-red-500 [&>div]:to-red-600'
                              }`}
                          />
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Button variant="outline" size="sm" onClick={() => handleUpdateProgress(task)}>
                          Update Progress
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleEdit(task)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(task.id, task.judul)}
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

          <TabsContent value="selesai" className="space-y-4">
            <div className="grid gap-4">
              {filteredTasks.filter(task => task.status === "Selesai").map((task) => (
                <Card key={task.id} className="opacity-75">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="space-y-3 flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-semibold line-through">{task.judul}</h3>
                          {getPrioritasBadge(task.prioritas)}
                          {getStatusBadge(task.status)}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {task.deskripsi}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <CheckCircle className="h-4 w-4" />
                            Selesai: {task.completedAt ? new Date(task.completedAt).toLocaleDateString('id-ID') : '-'}
                          </div>
                          <Badge variant="outline">{task.kategori}</Badge>
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Button variant="outline" size="sm">
                          Detail
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="semua" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Semua Tugas</CardTitle>
                <CardDescription>
                  Total {filteredTasks.length} tugas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Judul Tugas</TableHead>
                      <TableHead>Prioritas</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Progress</TableHead>
                      <TableHead>Deadline</TableHead>
                      <TableHead>Kategori</TableHead>
                      <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTasks.map((task) => (
                      <TableRow key={task.id}>
                        <TableCell className="font-medium">
                          <div>
                            <p className="font-medium">{task.judul}</p>
                            <p className="text-sm text-muted-foreground truncate max-w-xs">
                              {task.deskripsi}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>{getPrioritasBadge(task.prioritas)}</TableCell>
                        <TableCell>{getStatusBadge(task.status)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress
                              value={task.progress}
                              className={`h-2 w-16 ${task.progress >= 80
                                ? '[&>div]:bg-gradient-to-r [&>div]:from-green-500 [&>div]:to-green-600'
                                : task.progress >= 50
                                  ? '[&>div]:bg-gradient-to-r [&>div]:from-blue-500 [&>div]:to-blue-600'
                                  : task.progress >= 25
                                    ? '[&>div]:bg-gradient-to-r [&>div]:from-yellow-500 [&>div]:to-orange-500'
                                    : '[&>div]:bg-gradient-to-r [&>div]:from-red-500 [&>div]:to-red-600'
                                }`}
                            />
                            <span className="text-sm">{task.progress}%</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {new Date(task.deadline).toLocaleDateString('id-ID')}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{task.kategori}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="sm" onClick={() => handleEdit(task)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(task.id, task.judul)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Tugas</DialogTitle>
              <DialogDescription>
                Perbarui tugas yang ada
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-judul">Judul Tugas *</Label>
                <Input
                  id="edit-judul"
                  placeholder="Masukkan judul tugas"
                  value={formData.judul}
                  onChange={(e) => setFormData({ ...formData, judul: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-deskripsi">Deskripsi *</Label>
                <Textarea
                  id="edit-deskripsi"
                  placeholder="Tuliskan deskripsi tugas..."
                  className="min-h-[100px]"
                  value={formData.deskripsi}
                  onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-prioritas">Prioritas *</Label>
                  <Select value={formData.prioritas} onValueChange={(value) => setFormData({ ...formData, prioritas: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih prioritas" />
                    </SelectTrigger>
                    <SelectContent>
                      {prioritasOptions.map((p) => (
                        <SelectItem key={p.id} value={p.nama}>{p.nama}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-deadline">Deadline *</Label>
                  <Input
                    id="edit-deadline"
                    type="date"
                    value={formData.deadline}
                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-kategori">Kategori *</Label>
                <Select value={formData.kategori} onValueChange={(value) => setFormData({ ...formData, kategori: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih kategori" />
                  </SelectTrigger>
                  <SelectContent>
                    {kategoriOptions.map((k) => (
                      <SelectItem key={k.id} value={k.nama}>{k.nama}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-penanggungJawab">Penanggung Jawab *</Label>
                <Input
                  id="edit-penanggungJawab"
                  placeholder="Masukkan nama penanggung jawab"
                  value={formData.penanggungJawab}
                  onChange={(e) => setFormData({ ...formData, penanggungJawab: e.target.value })}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => {
                setIsEditDialogOpen(false)
                setSelectedTask(null)
                resetForm()
              }}>
                Batal
              </Button>
              <Button onClick={handleUpdate}>
                Update Tugas
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Progress Dialog */}
        <Dialog open={isProgressDialogOpen} onOpenChange={setIsProgressDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Update Progress</DialogTitle>
              <DialogDescription>
                {selectedTask && `Update progress untuk: ${selectedTask.judul}`}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="progress">Progress: {progressValue}%</Label>
                <input
                  type="range"
                  id="progress"
                  min="0"
                  max="100"
                  value={progressValue}
                  onChange={(e) => setProgressValue(Number(e.target.value))}
                  className="w-full"
                  aria-label="Progress slider"
                />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>0%</span>
                  <span>{progressValue}%</span>
                  <span>100%</span>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => {
                setIsProgressDialogOpen(false)
                setSelectedTask(null)
                setProgressValue(0)
              }}>
                Batal
              </Button>
              <Button onClick={handleSaveProgress}>
                Simpan Progress
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}