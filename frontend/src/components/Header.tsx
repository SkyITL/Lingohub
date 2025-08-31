'use client'

import { useRouter } from "next/navigation"
import Link from "next/link"
import { Menu, User, LogOut, Bookmark } from "lucide-react"
import { Button } from "./ui/button"
import { useAuth } from "@/contexts/AuthContext"

export default function Header() {
  const router = useRouter()
  const { user, logout, isLoading } = useAuth()

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
                <div className="hidden md:flex items-center space-x-2">
                  <User className="h-4 w-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-900">{user.username}</span>
                  <span className="text-xs text-gray-500">({user.rating})</span>
                </div>
                <Button variant="outline" size="sm" onClick={() => router.push('/profile/saved')}>
                  <Bookmark className="h-4 w-4 mr-1" />
                  Saved
                </Button>
                <Button variant="outline" size="sm" onClick={handleLogout}>
                  <LogOut className="h-4 w-4 mr-1" />
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" size="sm" onClick={() => handleAuthClick('login')}>
                  Login
                </Button>
                <Button size="sm" onClick={() => handleAuthClick('register')}>
                  Register
                </Button>
              </>
            )}
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}