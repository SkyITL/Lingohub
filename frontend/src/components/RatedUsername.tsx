'use client'

import { interpolateRatingColor } from '@/utils/ratingColor'

interface RatedUsernameProps {
  username: string
  rating?: number
  showRating?: boolean
  className?: string
}

/**
 * Display a username with color based on rating
 * Color gradient: gray (low) → green → cyan → blue → purple → yellow → orange → red (high)
 */
export default function RatedUsername({
  username,
  rating,
  showRating = false,
  className = ''
}: RatedUsernameProps) {
  const color = rating ? interpolateRatingColor(rating) : { hex: '#666' }

  return (
    <span style={{ color: color.hex, fontWeight: 600 }} className={className}>
      {username}
      {showRating && rating && (
        <span style={{ marginLeft: '4px', fontSize: '0.85em', color: color.hex, fontWeight: 600 }}>
          ({rating})
        </span>
      )}
    </span>
  )
}
