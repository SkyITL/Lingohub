'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search } from 'lucide-react'
import { Button } from './ui/button'

interface SearchBarProps {
  placeholder?: string
  className?: string
  large?: boolean
}

export default function SearchBar({ placeholder = "Search problems, topics, or IDs...", className = "", large = false }: SearchBarProps) {
  const [query, setQuery] = useState('')
  const router = useRouter()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/problems?search=${encodeURIComponent(query.trim())}`)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch(e as any)
    }
  }

  return (
    <form onSubmit={handleSearch} className={`relative ${className}`}>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className={`${large ? 'h-6 w-6' : 'h-5 w-5'} text-gray-400`} />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={`
            block w-full ${large ? 'pl-12 pr-4 py-4 text-lg' : 'pl-10 pr-3 py-2'} 
            text-gray-900 border border-gray-300 rounded-lg 
            focus:ring-2 focus:ring-blue-500 focus:border-transparent
            ${large ? 'rounded-xl shadow-xl bg-white/95 backdrop-blur-sm border-white/20' : 'bg-white'}
          `}
        />
        {large && (
          <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
            <Button type="submit" className="bg-white text-blue-600 hover:bg-gray-50">
              Search
            </Button>
          </div>
        )}
      </div>
    </form>
  )
}