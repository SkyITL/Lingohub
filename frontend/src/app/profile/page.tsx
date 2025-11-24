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
      setRatingHistory(response.data.ratingHistory)
    } catch (err) {
      console.error('Failed to load rating history:', err)
    } finally {
      setIsLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="flex items-center justify-center py-20">
          <p className="text-gray-600">Please log in to view your profile</p>
        </div>
      </div>
    )
  }

  const ratingColor = interpolateRatingColor(user.rating)

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Rating Header */}
        <div className="mb-8">
          <div
            className="inline-block px-6 py-3 rounded text-white font-bold text-2xl"
            style={{ backgroundColor: ratingColor.hex }}
          >
            {user.username} • {user.rating}
          </div>
        </div>

        {/* Rating Progress Chart */}
        <div className="mb-12">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Rating Change</h2>
          <RatingChart ratingHistory={ratingHistory} />
        </div>

        {/* Recent Problems */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Problems</h2>
          {isLoading ? (
            <p className="text-gray-500">Loading...</p>
          ) : ratingHistory.length === 0 ? (
            <p className="text-gray-500">No submissions yet</p>
          ) : (
            <table className="w-full text-sm">
              <tbody>
                {ratingHistory.map((entry) => {
                  const changeColor = interpolateRatingColor(entry.newRating)
                  return (
                    <tr key={entry.id} className="border-b hover:bg-gray-50">
                      <td className="py-2 pr-4">
                        <Link
                          href={`/problems/${entry.problem.number}`}
                          className="text-blue-600 hover:underline"
                        >
                          {entry.problem.number}
                        </Link>
                      </td>
                      <td className="py-2 px-4 flex-1">
                        <Link
                          href={`/problems/${entry.problem.number}`}
                          className="text-blue-600 hover:underline truncate"
                        >
                          {entry.problem.title}
                        </Link>
                      </td>
                      <td className="py-2 px-4 text-right text-gray-600">
                        {entry.oldRating} → {entry.newRating}
                      </td>
                      <td
                        className="py-2 pl-4 text-right font-semibold"
                        style={{ color: changeColor.hex }}
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

function RatingChart({ ratingHistory }: { ratingHistory: RatingEntry[] }) {
  if (ratingHistory.length === 0) {
    return <p className="text-gray-500">No data</p>
  }

  // Calculate min/max for scaling
  const ratings = ratingHistory.map(r => r.newRating).reverse()
  const minRating = Math.min(...ratings)
  const maxRating = Math.max(...ratings)
  const range = maxRating - minRating || 100

  // SVG dimensions
  const width = 800
  const height = 150
  const padding = { top: 10, right: 20, bottom: 30, left: 30 }
  const chartWidth = width - padding.left - padding.right
  const chartHeight = height - padding.top - padding.bottom

  // Calculate points
  const points = ratings.map((rating, index) => ({
    x: padding.left + (index / (ratings.length - 1 || 1)) * chartWidth,
    y: padding.top + (1 - (rating - minRating) / range) * chartHeight,
    rating
  }))

  // Create SVG path
  const pathData = points.length > 0
    ? `M ${points.map(p => `${p.x},${p.y}`).join(' L ')}`
    : ''

  return (
    <div className="border rounded overflow-x-auto bg-gray-50 p-4">
      <svg width={width} height={height} style={{ minWidth: '100%' }}>
        {/* Grid lines */}
        {[0, 0.5, 1].map((frac, i) => (
          <line
            key={`grid-${i}`}
            x1={padding.left}
            y1={padding.top + frac * chartHeight}
            x2={width - padding.right}
            y2={padding.top + frac * chartHeight}
            stroke="#e5e7eb"
            strokeDasharray="2,2"
          />
        ))}

        {/* Axes */}
        <line
          x1={padding.left}
          y1={padding.top}
          x2={padding.left}
          y2={height - padding.bottom}
          stroke="#d1d5db"
        />
        <line
          x1={padding.left}
          y1={height - padding.bottom}
          x2={width - padding.right}
          y2={height - padding.bottom}
          stroke="#d1d5db"
        />

        {/* Y-axis labels */}
        {[0, 0.5, 1].map((frac, i) => {
          const rating = Math.round(minRating + frac * range)
          return (
            <text
              key={`y-${i}`}
              x={padding.left - 10}
              y={padding.top + frac * chartHeight + 4}
              fontSize="12"
              textAnchor="end"
              fill="#6b7280"
            >
              {rating}
            </text>
          )
        })}

        {/* Line chart */}
        {pathData && (
          <path
            d={pathData}
            fill="none"
            stroke="#3b82f6"
            strokeWidth="2"
          />
        )}

        {/* Data points with color gradient */}
        {points.map((point, i) => {
          const entry = ratingHistory[ratingHistory.length - 1 - i]
          const pointColor = interpolateRatingColor(point.rating)
          return (
            <circle
              key={`point-${i}`}
              cx={point.x}
              cy={point.y}
              r="3"
              fill={pointColor.hex}
              stroke="white"
              strokeWidth="1"
            />
          )
        })}
      </svg>
    </div>
  )
}
