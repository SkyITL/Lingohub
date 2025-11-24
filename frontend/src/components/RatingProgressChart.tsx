'use client'

import { useState, useEffect } from 'react'
import { submissionsApi } from '@/lib/api'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

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

interface RatingProgressChartProps {
  userId: string
  limit?: number
}

export default function RatingProgressChart({ userId, limit = 15 }: RatingProgressChartProps) {
  const [ratingHistory, setRatingHistory] = useState<RatingEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadRatingHistory()
  }, [userId])

  const loadRatingHistory = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await submissionsApi.getRatingHistory(userId, limit)
      setRatingHistory(response.data.ratingHistory)
    } catch (err: any) {
      console.error('Failed to load rating history:', err)
      setError('Failed to load rating history')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Rating Progress</h2>
        <div className="text-center py-8 text-gray-500">Loading rating history...</div>
      </div>
    )
  }

  if (error || ratingHistory.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Rating Progress</h2>
        <div className="text-center py-8 text-gray-500">
          {error || 'No rating history yet. Solve problems to see your progress!'}
        </div>
      </div>
    )
  }

  // Reverse to show oldest first (left to right)
  const sortedHistory = [...ratingHistory].reverse()

  // Calculate min and max for scaling
  const ratings = sortedHistory.map(r => r.newRating)
  const minRating = Math.min(...ratings)
  const maxRating = Math.max(...ratings)
  const range = maxRating - minRating || 100

  // SVG chart dimensions
  const svgWidth = 400
  const svgHeight = 200
  const padding = { top: 20, right: 20, bottom: 40, left: 40 }
  const chartWidth = svgWidth - padding.left - padding.right
  const chartHeight = svgHeight - padding.top - padding.bottom

  // Calculate points for line chart
  const points = sortedHistory.map((entry, index) => ({
    x: padding.left + (index / (sortedHistory.length - 1 || 1)) * chartWidth,
    y: padding.top + (1 - (entry.newRating - minRating) / range) * chartHeight,
    ...entry
  }))

  // Create SVG path for line
  const pathData = points.length > 0
    ? `M ${points.map(p => `${p.x},${p.y}`).join(' L ')}`
    : ''

  // Calculate stats
  const currentRating = sortedHistory[sortedHistory.length - 1]?.newRating || 0
  const startRating = sortedHistory[0]?.oldRating || 0
  const totalChange = currentRating - startRating
  const wins = sortedHistory.filter(r => r.change > 0).length
  const losses = sortedHistory.filter(r => r.change < 0).length

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Rating Progress</h2>
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-blue-50 rounded-lg p-3">
            <div className="text-xs text-gray-600 mb-1">Current Rating</div>
            <div className="text-2xl font-bold text-blue-600">{currentRating}</div>
          </div>
          <div className={`rounded-lg p-3 ${totalChange >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
            <div className="text-xs text-gray-600 mb-1">Total Change</div>
            <div className={`text-2xl font-bold ${totalChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {totalChange >= 0 ? '+' : ''}{totalChange}
            </div>
          </div>
          <div className="bg-green-50 rounded-lg p-3">
            <div className="text-xs text-gray-600 mb-1">Wins</div>
            <div className="text-2xl font-bold text-green-600">{wins}</div>
          </div>
          <div className="bg-red-50 rounded-lg p-3">
            <div className="text-xs text-gray-600 mb-1">Losses</div>
            <div className="text-2xl font-bold text-red-600">{losses}</div>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="mb-6 overflow-x-auto">
        <svg width={svgWidth} height={svgHeight} className="min-w-max">
          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((frac, i) => (
            <line
              key={`grid-${i}`}
              x1={padding.left}
              y1={padding.top + frac * chartHeight}
              x2={svgWidth - padding.right}
              y2={padding.top + frac * chartHeight}
              stroke="#e5e7eb"
              strokeDasharray="4"
            />
          ))}

          {/* Y-axis */}
          <line
            x1={padding.left}
            y1={padding.top}
            x2={padding.left}
            y2={svgHeight - padding.bottom}
            stroke="#d1d5db"
          />

          {/* X-axis */}
          <line
            x1={padding.left}
            y1={svgHeight - padding.bottom}
            x2={svgWidth - padding.right}
            y2={svgHeight - padding.bottom}
            stroke="#d1d5db"
          />

          {/* Y-axis labels */}
          {[0, 0.5, 1].map((frac, i) => {
            const rating = Math.round(minRating + frac * range)
            return (
              <text
                key={`y-label-${i}`}
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

          {/* Chart line */}
          {pathData && (
            <path
              d={pathData}
              fill="none"
              stroke="#3b82f6"
              strokeWidth="2"
            />
          )}

          {/* Data points */}
          {points.map((point, i) => (
            <circle
              key={`point-${i}`}
              cx={point.x}
              cy={point.y}
              r="4"
              fill={point.change > 0 ? '#10b981' : point.change < 0 ? '#ef4444' : '#6b7280'}
              stroke="white"
              strokeWidth="2"
            />
          ))}
        </svg>
      </div>

      {/* Recent entries table */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Recent Activity</h3>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {sortedHistory.slice(-5).reverse().map((entry) => (
            <div key={entry.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3 flex-1">
                {entry.change > 0 ? (
                  <TrendingUp className="h-4 w-4 text-green-600" />
                ) : entry.change < 0 ? (
                  <TrendingDown className="h-4 w-4 text-red-600" />
                ) : (
                  <Minus className="h-4 w-4 text-gray-600" />
                )}
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900">
                    {entry.problem.number}: {entry.problem.title}
                  </div>
                  <div className="text-xs text-gray-600">
                    {entry.oldRating} → {entry.newRating}
                  </div>
                </div>
              </div>
              <div className={`text-sm font-semibold ${
                entry.change > 0 ? 'text-green-600' : entry.change < 0 ? 'text-red-600' : 'text-gray-600'
              }`}>
                {entry.change > 0 ? '+' : ''}{entry.change}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
