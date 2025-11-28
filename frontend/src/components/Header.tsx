'use client'

import { useRouter } from "next/navigation"
import Link from "next/link"
import { Menu, User, LogOut, Bookmark } from "lucide-react"
import { Button } from "./ui/button"
import { useAuth } from "@/contexts/AuthContext"
import { useRatingCache } from "@/hooks/useRatingCache"
import { interpolateRatingColor } from "@/utils/ratingColor"
import './header.css'

interface HeaderProps {
  overrideRating?: number
}

export default function Header({ overrideRating }: HeaderProps) {
  const router = useRouter()
  const { user, logout, isLoading } = useAuth()
  const { cachedRating } = useRatingCache()

  // Priority: overrideRating (from profile page) > cachedRating > user.rating
  const displayRating = overrideRating !== undefined ? overrideRating : (cachedRating || user?.rating)
  const ratingColor = displayRating ? interpolateRatingColor(displayRating) : { hex: '#666' }

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
                  className="header-profile-button"
                >
                  <User style={{ width: '16px', height: '16px', color: ratingColor.hex }} />
                  <span style={{ color: ratingColor.hex, fontWeight: 600 }}>{user.username}</span>
                  <span style={{ color: ratingColor.hex, fontWeight: 600 }}>({displayRating})</span>
                </button>
                <button
                  onClick={() => router.push('/profile/saved')}
                  className="header-secondary-button"
                >
                  <Bookmark style={{ width: '14px', height: '14px' }} />
                  Saved
                </button>
                <button
                  onClick={handleLogout}
                  className="header-secondary-button"
                >
                  <LogOut style={{ width: '14px', height: '14px' }} />
                  Logout
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => handleAuthClick('login')}
                  className="header-secondary-button"
                >
                  Login
                </button>
                <button
                  onClick={() => handleAuthClick('register')}
                  className="header-primary-button"
                >
                  Register
                </button>
              </>
            )}
            <button
              className="header-menu-button"
            >
              <Menu style={{ width: '20px', height: '20px' }} />
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}