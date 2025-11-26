'use client'

import { useRouter } from "next/navigation"
import Link from "next/link"
import { Menu, User, LogOut, Bookmark } from "lucide-react"
import { Button } from "./ui/button"
import { useAuth } from "@/contexts/AuthContext"

interface HeaderProps {
  overrideRating?: number
}

export default function Header({ overrideRating }: HeaderProps) {
  const router = useRouter()
  const { user, logout, isLoading } = useAuth()
  const displayRating = overrideRating !== undefined ? overrideRating : user?.rating

  const handleAuthClick = (type: 'login' | 'register') => {
    router.push(`/auth/${type}`)
  }

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  return (
    <header className="sticky top-0 z-50 border-b bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Navigation */}
          <div className="flex items-center space-x-8">
            <Link href="/" className="text-2xl font-bold text-blue-600">
              LingoHub
            </Link>
            <nav className="hidden md:flex space-x-6">
              <Link href="/problems" className="text-gray-700 hover:text-blue-600 font-medium">
                Problems
              </Link>
              <Link href="/submissions" className="text-gray-700 hover:text-blue-600 font-medium">
                Submissions
              </Link>
            </nav>
          </div>


          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {isLoading ? (
              <div className="animate-pulse flex space-x-2">
                <div className="w-16 h-8 bg-gray-200 rounded"></div>
                <div className="w-20 h-8 bg-gray-200 rounded"></div>
              </div>
            ) : user ? (
              <>
                <button
                  onClick={() => router.push('/profile')}
                  className="header-button border"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    opacity: 1,
                    cursor: 'pointer',
                    background: 'none',
                    border: 'none',
                    padding: 0
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.8')}
                  onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
                >
                  <User style={{ width: '16px', height: '16px', color: '#666' }} />
                  <span style={{ fontSize: '14px', fontWeight: '500', color: '#666' }}>{user.username}</span>
                  <span style={{ fontSize: '12px', color: '#999' }}>({displayRating})</span>
                </button>
                <button
                  onClick={() => router.push('/profile/saved')}
                  className="header-button border"
                  style={{
                    padding: '6px 12px',
                    border: '1px solid #d1d5db',
                    backgroundColor: '#ffffff',
                    borderRadius: '4px',
                    fontSize: '13px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    color: '#666',
                    fontWeight: '500'
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f3f4f6')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#ffffff')}
                >
                  <Bookmark style={{ width: '14px', height: '14px' }} />
                  Saved
                </button>
                <button
                  onClick={handleLogout}
                  className="header-button border"
                  style={{
                    padding: '6px 12px',
                    border: '1px solid #d1d5db',
                    backgroundColor: '#ffffff',
                    borderRadius: '4px',
                    fontSize: '13px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    color: '#666',
                    fontWeight: '500'
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f3f4f6')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#ffffff')}
                >
                  <LogOut style={{ width: '14px', height: '14px' }} />
                  Logout
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => handleAuthClick('login')}
                  className="header-button border"
                  style={{
                    padding: '6px 12px',
                    border: '1px solid #d1d5db',
                    backgroundColor: '#ffffff',
                    borderRadius: '4px',
                    fontSize: '13px',
                    cursor: 'pointer',
                    color: '#666',
                    fontWeight: '500'
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f3f4f6')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#ffffff')}
                >
                  Login
                </button>
                <button
                  onClick={() => handleAuthClick('register')}
                  className="header-button border"
                  style={{
                    padding: '6px 12px',
                    border: 'none',
                    backgroundColor: '#2563eb',
                    color: '#ffffff',
                    borderRadius: '4px',
                    fontSize: '13px',
                    cursor: 'pointer',
                    fontWeight: '500'
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#1d4ed8')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#2563eb')}
                >
                  Register
                </button>
              </>
            )}
            <button
              style={{
                display: 'none',
                width: '40px',
                height: '40px',
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
                '@media (max-width: 768px)': {
                  display: 'flex'
                }
              }}
            >
              <Menu style={{ width: '20px', height: '20px' }} />
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}