import Link from "next/link"
import { Star, Users, Calendar } from "lucide-react"

interface ProblemCardProps {
  id: string
  number: string
  title: string
  source: string
  year: number
  difficulty: number
  solveCount: number
  tags: string[]
}

export default function ProblemCard({
  id,
  number,
  title,
  source,
  year,
  difficulty,
  solveCount,
  tags
}: ProblemCardProps) {
  const renderStars = (count: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < count ? "text-yellow-400" : "text-gray-300"
        }`}
        fill={i < count ? "currentColor" : "none"}
      />
    ))
  }

  return (
    <Link href={`/problems/${id}`}>
      <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-mono text-blue-600 bg-blue-50 px-2 py-1 rounded">
              {number}
            </span>
            <span className="text-xs text-gray-500">{source} {year}</span>
          </div>
          <div className="flex items-center space-x-1">
            {renderStars(difficulty)}
          </div>
        </div>
        
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
          {title}
        </h3>
        
        <div className="flex items-center justify-between">
          <div className="flex flex-wrap gap-1">
            {tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full"
              >
                {tag}
              </span>
            ))}
            {tags.length > 3 && (
              <span className="text-xs text-gray-500">+{tags.length - 3} more</span>
            )}
          </div>
          
          <div className="flex items-center space-x-1 text-xs text-gray-500">
            <Users className="h-3 w-3" />
            <span>{solveCount}</span>
          </div>
        </div>
      </div>
    </Link>
  )
}