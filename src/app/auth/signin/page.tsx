'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useTheme } from 'next-themes'
import { useCurrentUser } from '@/hooks/useAuth'
import { Mail, Lock, Eye, EyeOff, LogIn, Shield, Info, Sun, Moon } from 'lucide-react'

// ============ LEFT PANEL COMPONENT ============
function LeftPanel() {
  return (
    <div
      className="hidden lg:flex lg:w-1/2 relative overflow-hidden items-center justify-center p-12 bg-[#0F4C81]"
    >
      {/* Background Pattern Overlay */}
      <div
        className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"
      />

      {/* Gradient Overlay */}
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center text-white max-w-lg animate-fade-in">
        {/* Circular Logo Container with Glass Effect */}
        <div className="bg-white/10 backdrop-blur-sm p-6 rounded-full mb-8 shadow-2xl border border-white/20 transform hover:scale-105 transition-transform duration-500">
          <div className="w-40 h-40 rounded-full overflow-hidden flex items-center justify-center bg-white/5">
            <img
              alt="Lambang Keuskupan Surabaya"
              className="w-full h-full object-cover drop-shadow-lg"
              src="/logo-keuskupan.jpg"
            />
          </div>
        </div>

        <h1 className="font-serif text-4xl font-bold mb-4 tracking-wide text-white drop-shadow-md">
          Keuskupan Surabaya
        </h1>

        <p className="text-blue-100 text-lg leading-relaxed">
          "Diligere Sicut Christus Dilexit"<br />
          <span className="text-sm italic opacity-90 mt-2 block text-blue-200">Mencintai seperti Kristus mencintai</span>
        </p>
      </div>
    </div>
  )
}

// ============ THEME TOGGLE COMPONENT ============
function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Avoid hydration mismatch by only rendering after mount
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  const isDark = theme === 'dark'

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={() => setTheme(isDark ? 'light' : 'dark')}
        className="bg-white dark:bg-surface-dark text-gray-800 dark:text-white p-3 rounded-full shadow-lg border border-gray-200 dark:border-border-dark hover:scale-110 transition-transform focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-blue dark:focus:ring-offset-gray-900"
        aria-label="Toggle Dark Mode"
      >
        {isDark ? (
          <Sun className="h-5 w-5" />
        ) : (
          <Moon className="h-5 w-5" />
        )}
      </button>
    </div>
  )
}

// ============ LOGIN FORM COMPONENT ============
function LoginForm() {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  })

  const router = useRouter()
  const { login } = useCurrentUser()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const result = await login(formData.email, formData.password, formData.rememberMe)
      if (result.success) {
        router.push('/')
        router.refresh()
      } else {
        setError(result.error || 'Email atau password salah')
      }
    } catch (err) {
      setError('Terjadi kesalahan saat login')
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    })
  }

  return (
    <div className="w-full max-w-md space-y-8 animate-fade-in relative z-10">

      {/* Header */}
      <div className="text-center lg:text-left">
        <div className="flex items-center justify-center lg:justify-start gap-3 mb-2">
          <Shield className="text-primary-blue h-8 w-8 dark:text-blue-400" strokeWidth={2.5} />
          <h2 className="text-3xl font-bold tracking-wide text-gray-900 dark:text-white font-display">
            Dashboard Uskup
          </h2>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
          Selamat datang kembali. Silakan masuk ke akun Anda.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        <div className="space-y-5">
          {/* Email Field */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Email
            </label>
            <div className="relative rounded-md shadow-sm group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-primary-blue transition-colors" />
              </div>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="nama@keuskupan-sby.or.id"
                value={formData.email}
                onChange={handleChange}
                className="pl-10 block w-full rounded-lg placeholder-gray-400 focus:ring-2 focus:ring-secondary-warm focus:border-secondary-warm sm:text-sm py-3 transition-colors shadow-sm outline-none focus:outline-none border border-gray-300 text-gray-900 dark:border-gray-800 dark:text-white bg-[var(--login-input-bg)]"
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Password
            </label>
            <div className="relative rounded-md shadow-sm group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-primary-blue transition-colors" />
              </div>
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                className="pl-10 pr-10 block w-full rounded-lg placeholder-gray-400 focus:ring-2 focus:ring-secondary-warm focus:border-secondary-warm sm:text-sm py-3 transition-colors shadow-sm outline-none focus:outline-none border border-gray-300 text-gray-900 dark:border-gray-800 dark:text-white bg-[var(--login-input-bg)]"
              />
              <div
                className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer text-gray-400 hover:text-primary-blue transition-colors"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </div>
            </div>
          </div>
        </div>

        {/* Remember Me & Forgot Password */}
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              id="rememberMe"
              name="rememberMe"
              type="checkbox"
              checked={formData.rememberMe}
              onChange={handleChange}
              className="h-4 w-4 text-primary-blue focus:ring-primary-blue border-gray-300 rounded dark:bg-surface-dark dark:border-gray-600 cursor-pointer"
            />
            <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-600 dark:text-gray-400 cursor-pointer">
              Ingat saya selama 30 hari
            </label>
          </div>
          <div className="text-sm">
            <a href="#" className="font-medium text-secondary-warm hover:text-yellow-600 dark:hover:text-yellow-400 transition-colors">
              Lupa password?
            </a>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Submit Button */}
        <div>
          <button
            type="submit"
            disabled={isLoading}
            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-semibold rounded-lg text-white bg-[#0F4C81] hover:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            <span className="absolute left-0 inset-y-0 flex items-center pl-3">
              <LogIn className="h-5 w-5 text-blue-200 group-hover:text-white group-hover:translate-x-1 transition-all" />
            </span>
            {isLoading ? 'Memproses...' : 'Masuk Dashboard'}
          </button>
        </div>
      </form>

      {/* Demo Credentials Box */}
      <div className="mt-6 bg-[#eff6ff] dark:bg-[#161b22] rounded-lg p-4 text-xs text-gray-600 dark:text-gray-400 animate-fade-in border border-blue-100 dark:border-gray-700">
        <p className="font-semibold text-primary-blue dark:text-blue-400 mb-2 flex items-center gap-1">
          <Info className="h-4 w-4" /> Demo Credentials
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <div>
            <span className="block text-gray-500 dark:text-gray-500 mb-0.5">Email:</span>
            <code
              className="bg-white dark:bg-black/20 px-2 py-1 rounded border border-gray-200 dark:border-gray-700 select-all font-mono block sm:inline-block w-full sm:w-auto cursor-pointer hover:border-primary-blue transition-colors text-xs"
              onClick={() => setFormData(prev => ({ ...prev, email: 'uskup@keuskupan-sby.or.id' }))}
            >
              uskup@keuskupan-sby.or.id
            </code>
          </div>
          <div>
            <span className="block text-gray-500 dark:text-gray-500 mb-0.5">Password:</span>
            <code
              className="bg-white dark:bg-black/20 px-2 py-1 rounded border border-gray-200 dark:border-gray-700 select-all font-mono block sm:inline-block w-full sm:w-auto cursor-pointer hover:border-primary-blue transition-colors text-xs"
              onClick={() => setFormData(prev => ({ ...prev, password: 'UskupSBY2025!' }))}
            >
              UskupSBY2025!
            </code>
          </div>
        </div>
      </div>
    </div>
  )
}

// ============ MAIN SIGNIN PAGE ============
export default function SignIn() {
  return (
    <div className="flex w-full min-h-screen transition-colors duration-300 bg-gray-100 dark:bg-[#0a0e14] text-gray-800 dark:text-gray-100 antialiased">
      {/* Left Panel - Hidden on mobile */}
      <LeftPanel />

      {/* Right Panel - Main Login Area */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-6 sm:p-12 lg:p-24 relative transition-colors duration-300 bg-[var(--login-card-bg)]">
        {/* Background Textures for Right Panel */}
        <div
          className="absolute inset-0 opacity-[0.02] dark:opacity-[0.05] pointer-events-none mix-blend-multiply dark:mix-blend-overlay bg-[url('https://www.transparenttextures.com/patterns/white-diamond.png')]"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50/50 via-transparent to-gray-100/30 dark:from-black/20 dark:via-transparent dark:to-black/20 pointer-events-none" />

        {/* Mobile Header (Logo) */}
        <div className="lg:hidden mb-8 text-center animate-fade-in">
          <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-primary-blue/10 p-2 flex items-center justify-center">
            <img
              alt="Logo Keuskupan"
              className="w-20 h-20 object-cover rounded-lg drop-shadow-md"
              src="/logo-keuskupan.jpg"
            />
          </div>
          <h2 className="font-serif text-2xl font-bold text-primary-blue dark:text-white">Keuskupan Surabaya</h2>
        </div>

        {/* Login Form Container */}
        <LoginForm />

        {/* Footer */}
        <div className="mt-8 text-center relative z-10">
          <p className="text-xs text-gray-400 dark:text-gray-500">
            © 2025 Keuskupan Surabaya. All rights reserved.
          </p>
        </div>
      </div>

      {/* Floating Theme Toggle */}
      <ThemeToggle />
    </div>
  )
}