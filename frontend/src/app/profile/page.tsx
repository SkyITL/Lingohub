'use client'

import { useState, useEffect } from 'react'
import Header from "@/components/Header"
import RatingProgressChart from "@/components/RatingProgressChart"
import { useAuth } from "@/contexts/AuthContext"
import { submissionsApi } from "@/lib/api"
import { interpolateRatingColor, getRatingColor } from "@/utils/ratingColor"
import {
  TrendingUp,
  TrendingDown,
  ArrowUp,
  ArrowDown,
  Link as LinkIcon
} from "lucide-react"

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
      const response = await submissionsApi.getRatingHistory(user.id, 10)
      setRatingHistory(response.data.ratingHistory)
    } catch (err) {
      console.error('Failed to load rating history:', err)
    } finally {
      setIsLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center py-20">
          <p className="text-gray-600">Please log in to view your profile</p>
        </div>
      </div>
    )
  }

  const ratingColor = interpolateRatingColor(user.rating)
  const tier = getRatingColor(user.rating)

  // Calculate stats
  const wins = ratingHistory.filter(r => r.change > 0).length
  const losses = ratingHistory.filter(r => r.change < 0).length
  const totalChange = ratingHistory.reduce((sum, r) => sum + r.change, 0)

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <Header />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Rating Card */}
        <div
          className="rounded-lg shadow-lg p-8 mb-8 text-white"
          style={{ background: `linear-gradient(135deg, ${ratingColor.hex} 0%, ${ratingColor.hex}dd 100%)` }}
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold mb-2">{user.username}</h1>
              <p className="text-lg opacity-90">{tier.tier}</p>
            </div>
            <div className="text-right">
              <div className="text-6xl font-bold">{user.rating}</div>
              <p className="text-sm opacity-75 mt-2">Current Rating</p>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-4 mt-8 bg-white bg-opacity-10 rounded-lg p-4">
            <div>
              <p className="text-sm opacity-75 mb-1">Last 10 Changes</p>
              <p className={`text-2xl font-bold ${totalChange >= 0 ? 'text-green-200' : 'text-red-200'}`}>
                {totalChange >= 0 ? '+' : ''}{totalChange}
              </p>
            </div>
            <div>
              <p className="text-sm opacity-75 mb-1">Wins</p>
              <p className="text-2xl font-bold text-green-200">{wins}</p>
            </div>
            <div>
              <p className="text-sm opacity-75 mb-1">Losses</p>
              <p className="text-2xl font-bold text-red-200">{losses}</p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Rating Chart - Takes 2 columns */}
          <div className="lg:col-span-2">
            <RatingProgressChart userId={user.id} limit={15} />
          </div>

          {/* Recent Problems - Right column */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Problems</h2>
            {isLoading ? (
              <div className="text-center py-8 text-gray-500">Loading...</div>
            ) : ratingHistory.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No submissions yet</div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {ratingHistory.map((entry, idx) => {
                  const changeColor = interpolateRatingColor(entry.newRating)
                  return (
                    <div
                      key={entry.id}
                      className="border-l-4 pl-4 py-2 rounded hover:bg-gray-50 transition-colors"
                      style={{ borderColor: changeColor.hex }}
                    >
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {entry.problem.number}
                          </p>
                          <p className="text-xs text-gray-600 truncate">
                            {entry.problem.title}
                          </p>
                        </div>
                        <div
                          className="text-sm font-bold whitespace-nowrap flex-shrink-0"
                          style={{ color: changeColor.hex }}
                        >
                          {entry.change > 0 ? '+' : ''}{entry.change}
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>
                          {entry.oldRating} → {entry.newRating}
                        </span>
                        <span>
                          {new Date(entry.createdAt).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Rating Tiers Reference */}
        <div className="bg-white rounded-lg shadow-sm p-6 mt-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Rating Tiers</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-8 gap-3">
            {[
              { min: 0, max: 800, name: 'Newbie', color: '#6B7280' },
              { min: 800, max: 1200, name: 'Pupil', color: '#10B981' },
              { min: 1200, max: 1400, name: 'Specialist', color: '#06B6D4' },
              { min: 1400, max: 1600, name: 'Expert', color: '#2563EB' },
              { min: 1600, max: 1900, name: 'CM', color: '#9333EA' },
              { min: 1900, max: 2200, name: 'Master', color: '#F59E0B' },
              { min: 2200, max: 2400, name: 'IM', color: '#EA580C' },
              { min: 2400, max: 3500, name: 'GM', color: '#DC2626' },
            ].map((tier, idx) => (
              <div
                key={idx}
                className={`text-center p-3 rounded-lg border-2 transition-all ${
                  user.rating >= tier.min && user.rating < tier.max
                    ? 'border-current scale-105'
                    : 'border-gray-200'
                }`}
                style={{
                  backgroundColor: `${tier.color}15`,
                  borderColor: user.rating >= tier.min && user.rating < tier.max ? tier.color : '#E5E7EB'
                }}
              >
                <p
                  className="text-xs font-bold mb-1"
                  style={{
                    color: tier.color
                  }}
                >
                  {tier.name}
                </p>
                <p className="text-xs text-gray-600">{tier.min}-{tier.max}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
