'use client'

import { useState, useEffect, createContext, useContext, ReactNode } from 'react'
import { logger } from '@/lib/logger'

interface User {
  id: string
  username: string
  email: string
  rating: number
  createdAt: string
}

interface AuthContextType {
  user: User | null
  token: string | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (username: string, email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Get API URL with same logic as api.ts
const getApiUrl = () => {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return `${process.env.NEXT_PUBLIC_API_URL}/api`
  }

  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
    return 'https://lingohub-backend.vercel.app/api'
  }

  return 'http://localhost:4000/api'
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Load auth state from localStorage on mount
  useEffect(() => {
    logger.info('AuthContext: Initializing')

    const savedToken = localStorage.getItem('lingohub_token')
    const savedUser = localStorage.getItem('lingohub_user')

    if (savedToken && savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser)
        setToken(savedToken)
        setUser(parsedUser)
        logger.success('AuthContext: Restored user session from localStorage', {
          username: parsedUser.username,
          userId: parsedUser.id
        })
      } catch (error) {
        logger.error('AuthContext: Error parsing saved user data', {
          error: error instanceof Error ? error.message : 'Unknown error'
        })
        localStorage.removeItem('lingohub_token')
        localStorage.removeItem('lingohub_user')
      }
    } else {
      logger.info('AuthContext: No saved session found')
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    const apiUrl = getApiUrl()
    const loginUrl = `${apiUrl}/auth/login`

    logger.auth('Login attempt started', { email, loginUrl })

    try {
      const response = await fetch(loginUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        logger.error('Login failed', {
          status: response.status,
          error: data.error || 'Unknown error',
          email
        })
        throw new Error(data.error || 'Login failed')
      }

      setToken(data.token)
      setUser(data.user)
      localStorage.setItem('lingohub_token', data.token)
      localStorage.setItem('lingohub_user', JSON.stringify(data.user))

      logger.success('Login successful', {
        username: data.user.username,
        userId: data.user.id,
        email: data.user.email
      })
    } catch (error) {
      logger.error('Login error', {
        error: error instanceof Error ? error.message : 'Unknown error',
        email
      })
      throw error
    }
  }

  const register = async (username: string, email: string, password: string) => {
    const apiUrl = getApiUrl()
    const registerUrl = `${apiUrl}/auth/register`

    logger.auth('Registration attempt started', { username, email, registerUrl })

    try {
      const response = await fetch(registerUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        logger.error('Registration failed', {
          status: response.status,
          error: data.error || 'Unknown error',
          username,
          email
        })
        throw new Error(data.error || 'Registration failed')
      }

      setToken(data.token)
      setUser(data.user)
      localStorage.setItem('lingohub_token', data.token)
      localStorage.setItem('lingohub_user', JSON.stringify(data.user))

      logger.success('Registration successful', {
        username: data.user.username,
        userId: data.user.id,
        email: data.user.email
      })
    } catch (error) {
      logger.error('Registration error', {
        error: error instanceof Error ? error.message : 'Unknown error',
        username,
        email
      })
      throw error
    }
  }

  const logout = () => {
    logger.auth('Logout', {
      username: user?.username,
      userId: user?.id
    })

    setToken(null)
    setUser(null)
    localStorage.removeItem('lingohub_token')
    localStorage.removeItem('lingohub_user')

    logger.success('Logout successful')
  }

  return (
    <AuthContext.Provider value={{
      user,
      token,
      isLoading,
      login,
      register,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
