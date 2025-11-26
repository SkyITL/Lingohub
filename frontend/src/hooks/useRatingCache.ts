import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'

export function useRatingCache() {
  const { user } = useAuth()
  const [cachedRating, setCachedRating] = useState<number | null>(null)

  useEffect(() => {
    if (!user?.id) return

    // Load initial cached rating
    const cached = localStorage.getItem(`lingohub_rating_${user.id}`)
    if (cached) {
      setCachedRating(parseInt(cached, 10))
    }

    // Listen for storage changes from other tabs/windows
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === `lingohub_rating_${user.id}` && e.newValue) {
        setCachedRating(parseInt(e.newValue, 10))
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [user?.id])

  const updateRatingCache = (rating: number) => {
    if (!user?.id) return
    localStorage.setItem(`lingohub_rating_${user.id}`, rating.toString())
    setCachedRating(rating)
  }

  return { cachedRating, updateRatingCache }
}
