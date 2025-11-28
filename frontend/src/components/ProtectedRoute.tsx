'use client'

import { ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

interface ProtectedRouteProps {
  children: ReactNode
}

/**
 * Wrapper component for protected routes that require authentication
 * Redirects to login if user is not authenticated
 */
export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const router = useRouter()
  const { user, isLoading } = useAuth()

  // Still loading auth context
  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#666' }}>Loading...</p>
      </div>
    )
  }

  // Not authenticated, redirect to login
  if (!user) {
    router.push('/auth/login')
    return null
  }

  // Authenticated, render children
  return <>{children}</>
}
