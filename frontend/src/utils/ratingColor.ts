/**
 * Rating color scaling similar to Codeforces
 * Smooth gradient from gray → blue → purple → yellow → orange → red
 */

export interface RatingColor {
  bg: string        // Background color class
  text: string      // Text color class
  hex: string       // Hex color for custom styling
  tier: string      // Rating tier name
}

export function getRatingColor(rating: number): RatingColor {
  // Gradient mapping: smooth color scaling with rating
  // Based on Codeforces rating color scheme

  if (rating < 800) {
    // Gray: Newbie
    return {
      bg: 'bg-gray-600',
      text: 'text-gray-600',
      hex: '#6B7280',
      tier: 'Newbie'
    }
  } else if (rating < 1200) {
    // Green: Pupil
    return {
      bg: 'bg-green-500',
      text: 'text-green-500',
      hex: '#10B981',
      tier: 'Pupil'
    }
  } else if (rating < 1400) {
    // Cyan: Specialist
    return {
      bg: 'bg-cyan-500',
      text: 'text-cyan-500',
      hex: '#06B6D4',
      tier: 'Specialist'
    }
  } else if (rating < 1600) {
    // Blue: Expert
    return {
      bg: 'bg-blue-600',
      text: 'text-blue-600',
      hex: '#2563EB',
      tier: 'Expert'
    }
  } else if (rating < 1900) {
    // Purple: Candidate Master
    return {
      bg: 'bg-purple-600',
      text: 'text-purple-600',
      hex: '#9333EA',
      tier: 'Candidate Master'
    }
  } else if (rating < 2200) {
    // Yellow/Orange: Master
    return {
      bg: 'bg-yellow-500',
      text: 'text-yellow-500',
      hex: '#F59E0B',
      tier: 'Master'
    }
  } else if (rating < 2400) {
    // Orange: International Master
    return {
      bg: 'bg-orange-600',
      text: 'text-orange-600',
      hex: '#EA580C',
      tier: 'International Master'
    }
  } else {
    // Red: Grandmaster
    return {
      bg: 'bg-red-600',
      text: 'text-red-600',
      hex: '#DC2626',
      tier: 'Grandmaster'
    }
  }
}

/**
 * Interpolate between two colors based on rating within a range
 * For smooth color transitions between tiers
 */
export function interpolateRatingColor(rating: number): {
  hex: string
  rgba: string
} {
  const colors = [
    { threshold: 800, hex: '#6B7280', name: 'Gray' },      // Newbie
    { threshold: 1200, hex: '#10B981', name: 'Green' },    // Pupil
    { threshold: 1400, hex: '#06B6D4', name: 'Cyan' },     // Specialist
    { threshold: 1600, hex: '#2563EB', name: 'Blue' },     // Expert
    { threshold: 1900, hex: '#9333EA', name: 'Purple' },   // CM
    { threshold: 2200, hex: '#F59E0B', name: 'Yellow' },   // Master
    { threshold: 2400, hex: '#EA580C', name: 'Orange' },   // IM
    { threshold: 3500, hex: '#DC2626', name: 'Red' }       // GM
  ]

  // Find the two colors to interpolate between
  let startColor = colors[0]
  let endColor = colors[colors.length - 1]

  for (let i = 0; i < colors.length - 1; i++) {
    if (rating >= colors[i].threshold && rating < colors[i + 1].threshold) {
      startColor = colors[i]
      endColor = colors[i + 1]
      break
    }
  }

  // Calculate interpolation factor (0 to 1)
  const range = endColor.threshold - startColor.threshold
  const progress = Math.min(1, (rating - startColor.threshold) / range)

  // Interpolate RGB values
  const start = hexToRgb(startColor.hex)
  const end = hexToRgb(endColor.hex)

  const r = Math.round(start.r + (end.r - start.r) * progress)
  const g = Math.round(start.g + (end.g - start.g) * progress)
  const b = Math.round(start.b + (end.b - start.b) * progress)

  const hex = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
  const rgba = `rgba(${r}, ${g}, ${b}, 1)`

  return { hex: hex.toUpperCase(), rgba }
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      }
    : { r: 0, g: 0, b: 0 }
}
