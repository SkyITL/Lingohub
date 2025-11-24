'use client'

import { useState, useEffect } from 'react'
import Header from "@/components/Header"
import { useAuth } from "@/contexts/AuthContext"
import { submissionsApi } from "@/lib/api"
import { interpolateRatingColor } from "@/utils/ratingColor"
import Link from 'next/link'

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
  const { user } = useAuth()
  const [ratingHistory, setRatingHistory] = useState<RatingEntry[]>([])
  const [currentRating, setCurrentRating] = useState(user?.rating || 1200)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!user?.id) return
    loadRatingHistory()
  }, [user?.id])

  const loadRatingHistory = async () => {
    if (!user?.id) return
    try {
      setIsLoading(true)
      const response = await submissionsApi.getRatingHistory(user.id, 50)
      const history = response.data.ratingHistory
      setRatingHistory(history)

      // Get the latest rating from history
      if (history.length > 0) {
        setCurrentRating(history[0].newRating)
      }
    } catch (err) {
      console.error('Failed to load rating history:', err)
    } finally {
      setIsLoading(false)
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
      <Header />

      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '32px 16px' }}>
        {/* Rating Header */}
        <div style={{ marginBottom: '32px' }}>
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

        {/* Recent Problems */}
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#111', marginBottom: '16px' }}>
            Recent Problems
          </h2>
          {isLoading ? (
            <p style={{ color: '#999' }}>Loading...</p>
          ) : ratingHistory.length === 0 ? (
            <p style={{ color: '#999' }}>No submissions yet</p>
          ) : (
            <table style={{ width: '100%', fontSize: '14px', borderCollapse: 'collapse' }}>
              <tbody>
                {ratingHistory.map((entry) => {
                  const changeColor = interpolateRatingColor(entry.newRating)
                  return (
                    <tr key={entry.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                      <td style={{ padding: '12px 8px 12px 0' }}>
                        <Link
                          href={`/problems/${entry.problem.number}`}
                          style={{ color: '#2563eb', textDecoration: 'none' }}
                        >
                          {entry.problem.number}
                        </Link>
                      </td>
                      <td style={{ padding: '12px 12px', maxWidth: '300px' }}>
                        <Link
                          href={`/problems/${entry.problem.number}`}
                          style={{ color: '#2563eb', textDecoration: 'none', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                        >
                          {entry.problem.title}
                        </Link>
                      </td>
                      <td style={{ padding: '12px 12px', textAlign: 'right', color: '#666' }}>
                        {entry.oldRating} → {entry.newRating}
                      </td>
                      <td
                        style={{
                          padding: '12px 0',
                          textAlign: 'right',
                          fontWeight: '600',
                          color: changeColor.hex
                        }}
                      >
                        {entry.change > 0 ? '+' : ''}{entry.change}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
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
  const maxBarHeight = 120
  const chartPadding = 20

  return (
    <div style={{
      border: '1px solid #d1d5db',
      borderRadius: '4px',
      padding: '20px',
      backgroundColor: '#f9fafb',
      overflowX: 'auto'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'flex-end',
        gap: '4px',
        minWidth: ratings.length > 10 ? ratings.length * 16 : '100%',
        height: '200px',
        padding: '20px 0'
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
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        paddingTop: '16px',
        borderTop: '1px solid #e5e7eb',
        fontSize: '12px',
        color: '#666'
      }}>
        <span>{Math.round(minRating)}</span>
        <span>{Math.round(minRating + range / 2)}</span>
        <span>{Math.round(maxRating)}</span>
      </div>
    </div>
  )
}
