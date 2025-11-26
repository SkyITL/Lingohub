'use client'

import { useState, useEffect } from 'react'
import Header from "@/components/Header"
import { useAuth } from "@/contexts/AuthContext"
import { useRatingCache } from "@/hooks/useRatingCache"
import { submissionsApi, usersApi } from "@/lib/api"
import { interpolateRatingColor } from "@/utils/ratingColor"
import Link from 'next/link'
import axios from 'axios'

interface RatingEntry {
  id: string
  userId: string
  problemId: string
  oldRating: number
  newRating: number
  change: number
  problemRating: number
  createdAt: string
  problem: {
    id: string
    number: string
    title: string
    rating: number
  }
}

export default function ProfilePage() {
  const { user, token } = useAuth()
  const { cachedRating, updateRatingCache } = useRatingCache()
  const [ratingHistory, setRatingHistory] = useState<RatingEntry[]>([])
  const [currentRating, setCurrentRating] = useState(cachedRating || user?.rating || 1200)
  const [isLoading, setIsLoading] = useState(true)
  const [isResetting, setIsResetting] = useState(false)
  const [resetMessage, setResetMessage] = useState('')

  useEffect(() => {
    if (!user?.id) return
    loadRatingHistory()
  }, [user?.id])

  const loadRatingHistory = async () => {
    if (!user?.id) return
    try {
      setIsLoading(true)

      // Fetch current user profile to get latest rating from database
      const profileResponse = await usersApi.getProfile(user.id)
      const currentUserRating = profileResponse.data.user.rating

      // Fetch rating history
      const historyResponse = await submissionsApi.getRatingHistory(user.id, 50)
      const history = historyResponse.data.ratingHistory

      // Get the latest rating from history, or use current profile rating
      let ratingToUse = currentUserRating
      if (history.length > 0) {
        ratingToUse = history[0].newRating
      }

      // Update state and cache (this will trigger Header to re-render via useRatingCache hook)
      setCurrentRating(ratingToUse)
      updateRatingCache(ratingToUse)
      setRatingHistory(history)
    } catch (err) {
      console.error('Failed to load rating history:', err)
      // Try to use cached rating on error
      if (cachedRating) {
        setCurrentRating(cachedRating)
      } else if (user?.rating) {
        setCurrentRating(user.rating)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleResetRating = async () => {
    if (!user?.id || !token) return
    if (!confirm('Are you sure you want to reset your rating and rating history? This cannot be undone.')) {
      return
    }

    try {
      setIsResetting(true)
      setResetMessage('')

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://lingohub-backend.vercel.app/api'
      const response = await axios.post(
        `${apiUrl}/admin/users/${user.id}/reset-rating`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      )

      setResetMessage('Rating reset successfully!')
      setCurrentRating(1200)
      setRatingHistory([])

      // Update cache with reset rating
      updateRatingCache(1200)

      // Reload after 2 seconds
      setTimeout(() => {
        loadRatingHistory()
      }, 2000)
    } catch (error: any) {
      console.error('Failed to reset rating:', error)
      setResetMessage(`Error: ${error.response?.data?.error || error.message}`)
    } finally {
      setIsResetting(false)
    }
  }

  if (!user) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: 'white' }}>
        <Header />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: '80px' }}>
          <p style={{ color: '#666' }}>Please log in to view your profile</p>
        </div>
      </div>
    )
  }

  const ratingColor = interpolateRatingColor(currentRating)

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'white' }}>
      <Header overrideRating={currentRating} />

      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '32px 16px' }}>
        {/* Rating Header */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <div
              style={{
                display: 'inline-block',
                padding: '16px 24px',
                borderRadius: '4px',
                backgroundColor: ratingColor.hex,
                color: 'white',
                fontSize: '20px',
                fontWeight: 'bold'
              }}
            >
              {user.username} • {currentRating}
            </div>
            <button
              onClick={handleResetRating}
              disabled={isResetting}
              style={{
                padding: '8px 16px',
                backgroundColor: '#e5e7eb',
                color: '#666',
                border: 'none',
                borderRadius: '4px',
                fontSize: '14px',
                cursor: isResetting ? 'not-allowed' : 'pointer',
                opacity: isResetting ? 0.6 : 1,
                fontWeight: '500'
              }}
            >
              {isResetting ? 'Resetting...' : 'Reset Rating'}
            </button>
          </div>
          {resetMessage && (
            <p style={{ marginTop: '12px', fontSize: '14px', color: resetMessage.startsWith('Error') ? '#dc2626' : '#059669' }}>
              {resetMessage}
            </p>
          )}
        </div>

        {/* Rating Change Chart */}
        <div style={{ marginBottom: '48px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#111', marginBottom: '16px' }}>
            Rating Change
          </h2>
          {isLoading ? (
            <p style={{ color: '#999' }}>Loading...</p>
          ) : ratingHistory.length === 0 ? (
            <p style={{ color: '#999' }}>No data</p>
          ) : (
            <SimpleChart ratingHistory={ratingHistory} />
          )}
        </div>

        {/* Completed Problems */}
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#111', marginBottom: '16px' }}>
            All Completed
          </h2>
          {isLoading ? (
            <p style={{ color: '#999' }}>Loading...</p>
          ) : ratingHistory.length === 0 ? (
            <p style={{ color: '#999' }}>No submissions yet</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
              {ratingHistory.map((entry) => (
                <div key={entry.id}>
                  <Link
                    href={`/problems/${entry.problem.number}`}
                    style={{ color: '#2563eb', textDecoration: 'none', fontSize: '14px' }}
                  >
                    {entry.problem.number}
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function SimpleChart({ ratingHistory }: { ratingHistory: RatingEntry[] }) {
  if (ratingHistory.length === 0) {
    return <p style={{ color: '#999' }}>No data</p>
  }

  const ratings = ratingHistory.map(r => r.newRating).reverse()
  const minRating = Math.min(...ratings)
  const maxRating = Math.max(...ratings)
  const range = maxRating - minRating || 100

  // Create a simple bar chart using divs
  const maxBarHeight = 150
  const yAxisWidth = 40

  return (
    <div style={{
      border: '1px solid #d1d5db',
      borderRadius: '4px',
      padding: '20px',
      backgroundColor: '#f9fafb',
    }}>
      <div style={{
        display: 'flex',
        gap: '12px',
      }}>
        {/* Y-axis labels */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          width: yAxisWidth,
          height: `${maxBarHeight + 20}px`,
          fontSize: '12px',
          color: '#666',
          textAlign: 'right',
          paddingTop: '0px',
          paddingBottom: '0px'
        }}>
          <span>{Math.round(maxRating)}</span>
          <span>{Math.round(minRating + range / 2)}</span>
          <span>{Math.round(minRating)}</span>
        </div>

        {/* Chart bars */}
        <div style={{
          display: 'flex',
          alignItems: 'flex-end',
          gap: '4px',
          overflowX: 'auto',
          minWidth: ratings.length > 10 ? ratings.length * 16 : '100%',
          height: `${maxBarHeight}px`,
          borderLeft: '1px solid #d1d5db',
          paddingLeft: '12px'
        }}>
          {ratings.map((rating, idx) => {
            const height = ((rating - minRating) / range) * maxBarHeight
            const entry = ratingHistory[ratingHistory.length - 1 - idx]
            const color = interpolateRatingColor(rating)

            return (
              <div
                key={idx}
                style={{
                  width: '12px',
                  height: `${height}px`,
                  backgroundColor: color.hex,
                  borderRadius: '2px',
                  transition: 'all 0.2s',
                  cursor: 'pointer'
                }}
                title={`${rating} (${entry.problem.number})`}
              />
            )
          })}
        </div>
      </div>
    </div>
  )
}
