"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import {
  User,
  Bell,
  Shield,
  Palette,
  Globe,
  Mail,
  Lock,
  Smartphone,
  Monitor,
  Volume2,
  Eye,
  Download,
  Loader2,
  CheckCircle,
  RefreshCw,
  Database,
  Link,
  AlertCircle,
  Server
} from "lucide-react"
import { showSuccess, showError } from "@/lib/alerts"
import { UserManagement } from "@/components/settings/user-management"

interface UserProfile {
  id: string
  name: string | null
  email: string
  role: string
  image: string | null
}

export default function SettingsPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)

  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [profileForm, setProfileForm] = useState({
    name: '',
    email: '',
    telepon: '+62 31 531 1234',
    alamat: 'Jl. Johar No. 33, Surabaya 60241'
  })

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    sms: false,
    taskReminders: true,
    meetingReminders: true,
    deadlineAlerts: true,
    systemUpdates: false
  })

  const [preferences, setPreferences] = useState({
    language: "id",
    timezone: "Asia/Jakarta",
    dateFormat: "DD/MM/YYYY",
    timeFormat: "24",
    defaultView: "dashboard",
    autoSave: true,
    compactMode: false
  })

  const [security, setSecurity] = useState({
    twoFactor: false,
    sessionTimeout: "30",
    loginAlerts: true,
    passwordExpiry: "90"
  })

  // Pororomo sync states
  const [pororomoConfig, setPororomoConfig] = useState({
    apiUrl: '',
    apiKey: '',
    username: '',
    password: ''
  })
  const [pororomoStatus, setPororomoStatus] = useState<{
    isConfigured: boolean
    lastTestAt: string | null
    testResult: string | null
  }>({ isConfigured: false, lastTestAt: null, testResult: null })
  const [isTesting, setIsTesting] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)
  const [isSavingConfig, setIsSavingConfig] = useState(false)
  const [syncHistory, setSyncHistory] = useState<Array<{
    id: string
    status: string
    recordsSync: number
    startedAt: string
    completedAt: string | null
  }>>([])

  // Fetch user profile on mount
  useEffect(() => {
    async function fetchProfile() {
      try {
        const response = await fetch('/api/user/settings', {
          credentials: 'include'
        })
        const result = await response.json()
        if (result.success && result.data) {
          setProfile(result.data)
          setProfileForm(prev => ({
            ...prev,
            name: result.data.name || '',
            email: result.data.email || ''
          }))
        }
      } catch (error) {
        console.error('Failed to fetch profile:', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchProfile()
  }, [])

  // Fetch Pororomo config and sync history
  useEffect(() => {
    async function fetchPororomoData() {
      try {
        // Fetch config
        const configRes = await fetch('/api/pororomo/config')
        const configData = await configRes.json()
        if (configData.success && configData.data) {
          setPororomoConfig({
            apiUrl: configData.data.apiUrl || '',
            apiKey: '',
            username: configData.data.username || '',
            password: ''
          })
          setPororomoStatus({
            isConfigured: !!configData.data.apiUrl,
            lastTestAt: configData.data.lastTestAt,
            testResult: configData.data.testResult
          })
        }

        // Fetch sync history
        const syncRes = await fetch('/api/pororomo/sync')
        const syncData = await syncRes.json()
        if (syncData.success && syncData.data?.history) {
          setSyncHistory(syncData.data.history)
        }
      } catch (error) {
        console.error('Failed to fetch Pororomo data:', error)
      }
    }
    fetchPororomoData()
  }, [])

  // Pororomo handlers
  const handleSavePororomoConfig = async () => {
    setIsSavingConfig(true)
    try {
      const response = await fetch('/api/pororomo/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pororomoConfig)
      })
      const result = await response.json()
      if (result.success) {
        showSuccess('Konfigurasi Pororomo berhasil disimpan')
        setPororomoStatus(prev => ({ ...prev, isConfigured: true }))
      } else {
        showError(result.error || 'Gagal menyimpan konfigurasi')
      }
    } catch {
      showError('Gagal menyimpan konfigurasi')
    } finally {
      setIsSavingConfig(false)
    }
  }

  const handleTestConnection = async () => {
    setIsTesting(true)
    try {
      const response = await fetch('/api/pororomo/connection', { method: 'POST' })
      const result = await response.json()
      if (result.success) {
        showSuccess(result.message || 'Koneksi berhasil')
        setPororomoStatus(prev => ({ ...prev, testResult: 'success', lastTestAt: new Date().toISOString() }))
      } else {
        showError(result.message || 'Koneksi gagal')
        setPororomoStatus(prev => ({ ...prev, testResult: 'failed' }))
      }
    } catch {
      showError('Test koneksi gagal')
    } finally {
      setIsTesting(false)
    }
  }

  const handleSyncNow = async () => {
    setIsSyncing(true)
    try {
      const response = await fetch('/api/pororomo/sync', { method: 'POST' })
      const result = await response.json()
      if (result.success) {
        showSuccess(result.message || 'Sinkronisasi selesai')
        // Refresh sync history
        const syncRes = await fetch('/api/pororomo/sync')
        const syncData = await syncRes.json()
        if (syncData.success && syncData.data?.history) {
          setSyncHistory(syncData.data.history)
        }
      } else {
        showError(result.message || 'Sinkronisasi gagal')
      }
    } catch {
      showError('Sinkronisasi gagal')
    } finally {
      setIsSyncing(false)
    }
  }

  // Handle profile save
  const handleSaveProfile = async () => {
    setIsSaving(true)
    try {
      const response = await fetch('/api/user/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: profileForm.name,
          email: profileForm.email
        })
      })
      const result = await response.json()
      if (result.success) {
        setProfile(result.data)
        showSuccess('Profil berhasil diperbarui')
      } else {
        showError(result.error || 'Gagal menyimpan profil')
      }
    } catch (error) {
      showError('Gagal menyimpan profil')
    } finally {
      setIsSaving(false)
    }
  }

  // Handle password change
  const handleChangePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showError('Password baru dan konfirmasi tidak cocok')
      return
    }

    setIsChangingPassword(true)
    try {
      const response = await fetch('/api/user/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(passwordForm)
      })
      const result = await response.json()
      if (result.success) {
        showSuccess('Password berhasil diubah')
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
      } else {
        showError(result.error || 'Gagal mengubah password')
      }
    } catch (error) {
      showError('Gagal mengubah password')
    } finally {
      setIsChangingPassword(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pengaturan</h1>
          <p className="text-muted-foreground">
            Kelola preferensi dan pengaturan akun Anda
          </p>
        </div>

        <Tabs defaultValue="profile" className="space-y-4">
          <TabsList className="flex-wrap h-auto">
            <TabsTrigger value="profile">Profil</TabsTrigger>
            <TabsTrigger value="notifications">Notifikasi</TabsTrigger>
            <TabsTrigger value="preferences">Preferensi</TabsTrigger>
            <TabsTrigger value="security">Keamanan</TabsTrigger>
            <TabsTrigger value="sync">Sinkronisasi</TabsTrigger>
            <TabsTrigger value="users">Pengguna</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Informasi Profil</CardTitle>
                <CardDescription>
                  Perbarui informasi profil Anda
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="nama">Nama Lengkap</Label>
                        <Input
                          id="nama"
                          value={profileForm.name}
                          onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="gelar">Role</Label>
                        <Input id="gelar" value={profile?.role || ''} disabled className="bg-muted" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={profileForm.email}
                          onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="telepon">Telepon</Label>
                        <Input
                          id="telepon"
                          value={profileForm.telepon}
                          onChange={(e) => setProfileForm({ ...profileForm, telepon: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="alamat">Alamat</Label>
                      <Input
                        id="alamat"
                        value={profileForm.alamat}
                        onChange={(e) => setProfileForm({ ...profileForm, alamat: e.target.value })}
                      />
                    </div>
                    <div className="flex justify-end">
                      <Button onClick={handleSaveProfile} disabled={isSaving}>
                        {isSaving ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Menyimpan...
                          </>
                        ) : (
                          'Simpan Perubahan'
                        )}
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Ubah Password</CardTitle>
                <CardDescription>
                  Perbarui password akun Anda
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="current-password">Password Saat Ini</Label>
                  <Input
                    id="current-password"
                    type="password"
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-password">Password Baru</Label>
                  <Input
                    id="new-password"
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Konfirmasi Password Baru</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  />
                </div>
                <div className="flex justify-end">
                  <Button onClick={handleChangePassword} disabled={isChangingPassword}>
                    {isChangingPassword ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Mengubah...
                      </>
                    ) : (
                      'Ubah Password'
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Pengaturan Notifikasi</CardTitle>
                <CardDescription>
                  Kelola bagaimana Anda menerima notifikasi
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Notifikasi Email</Label>
                      <p className="text-sm text-muted-foreground">
                        Terima notifikasi penting melalui email
                      </p>
                    </div>
                    <Switch
                      checked={notifications.email}
                      onCheckedChange={(checked) =>
                        setNotifications({ ...notifications, email: checked })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Notifikasi Push</Label>
                      <p className="text-sm text-muted-foreground">
                        Terima notifikasi real-time di browser
                      </p>
                    </div>
                    <Switch
                      checked={notifications.push}
                      onCheckedChange={(checked) =>
                        setNotifications({ ...notifications, push: checked })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Notifikasi SMS</Label>
                      <p className="text-sm text-muted-foreground">
                        Terima notifikasi penting melalui SMS
                      </p>
                    </div>
                    <Switch
                      checked={notifications.sms}
                      onCheckedChange={(checked) =>
                        setNotifications({ ...notifications, sms: checked })
                      }
                    />
                  </div>
                </div>

                <div className="border-t pt-6">
                  <h4 className="text-lg font-semibold mb-4">Jenis Notifikasi</h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Reminder Tugas</Label>
                        <p className="text-sm text-muted-foreground">
                          Notifikasi untuk tugas yang akan datang
                        </p>
                      </div>
                      <Switch
                        checked={notifications.taskReminders}
                        onCheckedChange={(checked) =>
                          setNotifications({ ...notifications, taskReminders: checked })
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Reminder Pertemuan</Label>
                        <p className="text-sm text-muted-foreground">
                          Notifikasi untuk agenda pertemuan
                        </p>
                      </div>
                      <Switch
                        checked={notifications.meetingReminders}
                        onCheckedChange={(checked) =>
                          setNotifications({ ...notifications, meetingReminders: checked })
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Alert Deadline</Label>
                        <p className="text-sm text-muted-foreground">
                          Notifikasi untuk deadline yang akan tiba
                        </p>
                      </div>
                      <Switch
                        checked={notifications.deadlineAlerts}
                        onCheckedChange={(checked) =>
                          setNotifications({ ...notifications, deadlineAlerts: checked })
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Update Sistem</Label>
                        <p className="text-sm text-muted-foreground">
                          Notifikasi untuk pembaruan sistem
                        </p>
                      </div>
                      <Switch
                        checked={notifications.systemUpdates}
                        onCheckedChange={(checked) =>
                          setNotifications({ ...notifications, systemUpdates: checked })
                        }
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button>Simpan Pengaturan</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="preferences" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Preferensi Umum</CardTitle>
                <CardDescription>
                  Sesuaikan pengalaman pengguna Anda
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="language">Bahasa</Label>
                    <Select value={preferences.language} onValueChange={(value) =>
                      setPreferences({ ...preferences, language: value })
                    }>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="id">Bahasa Indonesia</SelectItem>
                        <SelectItem value="en">English</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="timezone">Zona Waktu</Label>
                    <Select value={preferences.timezone} onValueChange={(value) =>
                      setPreferences({ ...preferences, timezone: value })
                    }>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Asia/Jakarta">WIB (GMT+7)</SelectItem>
                        <SelectItem value="Asia/Makassar">WITA (GMT+8)</SelectItem>
                        <SelectItem value="Asia/Jayapura">WIT (GMT+9)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date-format">Format Tanggal</Label>
                    <Select value={preferences.dateFormat} onValueChange={(value) =>
                      setPreferences({ ...preferences, dateFormat: value })
                    }>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                        <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                        <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="time-format">Format Waktu</Label>
                    <Select value={preferences.timeFormat} onValueChange={(value) =>
                      setPreferences({ ...preferences, timeFormat: value })
                    }>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="24">24 Jam</SelectItem>
                        <SelectItem value="12">12 Jam (AM/PM)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="default-view">Tampilan Default</Label>
                  <Select value={preferences.defaultView} onValueChange={(value) =>
                    setPreferences({ ...preferences, defaultView: value })
                  }>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dashboard">Dashboard</SelectItem>
                      <SelectItem value="agenda">Agenda</SelectItem>
                      <SelectItem value="tasks">Tugas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Auto Save</Label>
                      <p className="text-sm text-muted-foreground">
                        Simpan perubahan secara otomatis
                      </p>
                    </div>
                    <Switch
                      checked={preferences.autoSave}
                      onCheckedChange={(checked) =>
                        setPreferences({ ...preferences, autoSave: checked })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Mode Compact</Label>
                      <p className="text-sm text-muted-foreground">
                        Tampilkan tampilan yang lebih ringkas
                      </p>
                    </div>
                    <Switch
                      checked={preferences.compactMode}
                      onCheckedChange={(checked) =>
                        setPreferences({ ...preferences, compactMode: checked })
                      }
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button>Simpan Preferensi</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Keamanan Akun</CardTitle>
                <CardDescription>
                  Kelola pengaturan keamanan akun Anda
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Two-Factor Authentication</Label>
                      <p className="text-sm text-muted-foreground">
                        Tambahkan lapisan keamanan ekstra
                      </p>
                    </div>
                    <Switch
                      checked={security.twoFactor}
                      onCheckedChange={(checked) =>
                        setSecurity({ ...security, twoFactor: checked })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Login Alerts</Label>
                      <p className="text-sm text-muted-foreground">
                        Terima notifikasi saat ada login baru
                      </p>
                    </div>
                    <Switch
                      checked={security.loginAlerts}
                      onCheckedChange={(checked) =>
                        setSecurity({ ...security, loginAlerts: checked })
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="session-timeout">Session Timeout (menit)</Label>
                    <Select value={security.sessionTimeout} onValueChange={(value) =>
                      setSecurity({ ...security, sessionTimeout: value })
                    }>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="15">15 menit</SelectItem>
                        <SelectItem value="30">30 menit</SelectItem>
                        <SelectItem value="60">1 jam</SelectItem>
                        <SelectItem value="120">2 jam</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password-expiry">Password Expiry (hari)</Label>
                    <Select value={security.passwordExpiry} onValueChange={(value) =>
                      setSecurity({ ...security, passwordExpiry: value })
                    }>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="30">30 hari</SelectItem>
                        <SelectItem value="60">60 hari</SelectItem>
                        <SelectItem value="90">90 hari</SelectItem>
                        <SelectItem value="180">180 hari</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="border-t pt-6">
                  <h4 className="text-lg font-semibold mb-4">Aktivitas Login Terakhir</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Monitor className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium">Chrome - Windows</p>
                          <p className="text-sm text-muted-foreground">192.168.1.100 • Surabaya</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm">Hari ini, 09:15</p>
                        <Badge variant="outline">Aktif</Badge>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Smartphone className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium">Safari - iPhone</p>
                          <p className="text-sm text-muted-foreground">192.168.1.101 • Surabaya</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm">Kemarin, 14:30</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button>Simpan Pengaturan Keamanan</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab Sinkronisasi Data */}
          <TabsContent value="sync" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Sinkronisasi Data Eksternal
                </CardTitle>
                <CardDescription>
                  Konfigurasi koneksi ke sistem eksternal untuk sinkronisasi data
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Pororomo API Configuration */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Server className="h-4 w-4" />
                    API Pororomo (Database Imam)
                  </h3>
                  <div className="p-4 border rounded-lg space-y-4 bg-muted/50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {pororomoStatus.isConfigured ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-yellow-500" />
                        )}
                        <span className="text-sm">
                          Status: {pororomoStatus.isConfigured ? 'Terkonfigurasi' : 'Belum Terkonfigurasi'}
                        </span>
                      </div>
                      <Badge
                        variant="outline"
                        className={pororomoStatus.testResult === 'success' ? 'text-green-600' :
                          pororomoStatus.testResult === 'failed' ? 'text-red-600' : 'text-yellow-600'}
                      >
                        {pororomoStatus.testResult === 'success' ? 'Connected' :
                          pororomoStatus.testResult === 'failed' ? 'Failed' : 'Pending Setup'}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="pororomo-url">API URL</Label>
                        <Input
                          id="pororomo-url"
                          placeholder="https://api.pororomo.keuskupan-sby.or.id"
                          value={pororomoConfig.apiUrl}
                          onChange={(e) => setPororomoConfig({ ...pororomoConfig, apiUrl: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="pororomo-key">API Key</Label>
                        <Input
                          id="pororomo-key"
                          type="password"
                          placeholder="Masukkan API Key"
                          value={pororomoConfig.apiKey}
                          onChange={(e) => setPororomoConfig({ ...pororomoConfig, apiKey: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Endpoint yang Tersedia</Label>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <p>• <code className="bg-muted px-1 rounded">/api/imam</code> - Data imam keuskupan</p>
                        <p>• <code className="bg-muted px-1 rounded">/api/paroki</code> - Data paroki (opsional)</p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={handleTestConnection} disabled={isTesting || !pororomoConfig.apiUrl}>
                        {isTesting ? (
                          <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Testing...</>
                        ) : (
                          <><Link className="h-4 w-4 mr-2" />Test Koneksi</>
                        )}
                      </Button>
                      <Button size="sm" onClick={handleSyncNow} disabled={isSyncing || !pororomoStatus.isConfigured}>
                        {isSyncing ? (
                          <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Syncing...</>
                        ) : (
                          <><RefreshCw className="h-4 w-4 mr-2" />Sinkronkan Sekarang</>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Sync Schedule */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Jadwal Sinkronisasi Otomatis</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="sync-interval">Interval Sinkronisasi</Label>
                      <Select defaultValue="daily">
                        <SelectTrigger id="sync-interval">
                          <SelectValue placeholder="Pilih interval" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="hourly">Setiap Jam</SelectItem>
                          <SelectItem value="daily">Harian</SelectItem>
                          <SelectItem value="weekly">Mingguan</SelectItem>
                          <SelectItem value="manual">Manual</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="sync-time">Waktu Sinkronisasi</Label>
                      <Input id="sync-time" type="time" defaultValue="02:00" />
                    </div>
                  </div>
                </div>

                {/* Sync History */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Riwayat Sinkronisasi</h3>
                  {syncHistory.length > 0 ? (
                    <div className="border rounded-lg divide-y">
                      {syncHistory.slice(0, 5).map((log) => (
                        <div key={log.id} className="p-3 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {log.status === 'success' ? (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            ) : (
                              <AlertCircle className="h-4 w-4 text-red-500" />
                            )}
                            <span className="text-sm">{log.recordsSync} records</span>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {new Date(log.startedAt).toLocaleString('id-ID')}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="border rounded-lg p-4 text-center text-muted-foreground">
                      <Database className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Belum ada riwayat sinkronisasi</p>
                      <p className="text-xs">Konfigurasi API terlebih dahulu untuk memulai</p>
                    </div>
                  )}
                </div>

                <div className="flex justify-end">
                  <Button onClick={handleSavePororomoConfig} disabled={isSavingConfig}>
                    {isSavingConfig ? (
                      <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Menyimpan...</>
                    ) : (
                      'Simpan Konfigurasi Sync'
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab Manajemen Pengguna */}
          <TabsContent value="users" className="space-y-4">
            <UserManagement currentUserRole={profile?.role || 'STAFF'} isProfileLoading={isLoading} />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout >
  )
}