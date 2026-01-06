"use client"

import { useState, useEffect } from 'react'

interface User {
  id: string
  email: string
  name: string
  role: string
}

export function useCurrentUser() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  const checkAuth = async (retryCount = 0) => {
    const maxRetries = 3
    const retryDelay = 1000 // 1 second

    try {
      setIsLoading(true)
      const response = await fetch('/api/auth/me', {
        credentials: 'include'
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          setUser(result.user)
          setIsAuthenticated(true)
        } else {
          setUser(null)
          setIsAuthenticated(false)
        }
      } else {
        setUser(null)
        setIsAuthenticated(false)
      }
    } catch (error) {
      // Retry on network errors (server might still be starting)
      if (retryCount < maxRetries) {
        console.log(`Auth check retry ${retryCount + 1}/${maxRetries}...`)
        await new Promise(resolve => setTimeout(resolve, retryDelay))
        return checkAuth(retryCount + 1)
      }
      console.error('Auth check failed after retries:', error)
      setUser(null)
      setIsAuthenticated(false)
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (email: string, password: string, rememberMe: boolean = false) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, password, rememberMe }),
      })

      const result = await response.json()

      if (result.success) {
        setUser(result.user)
        setIsAuthenticated(true)
        await checkAuth() // Refetch user data after login
        return { success: true, user: result.user }
      } else {
        return { success: false, error: result.error }
      }
    } catch (error) {
      console.error('Login failed:', error)
      return { success: false, error: 'Network error' }
    }
  }

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      })

      setUser(null)
      setIsAuthenticated(false)
      return { success: true }
    } catch (error) {
      console.error('Logout failed:', error)
      return { success: false, error: 'Network error' }
    }
  }

  useEffect(() => {
    checkAuth()
  }, [])

  return {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    refetch: checkAuth
  }
}