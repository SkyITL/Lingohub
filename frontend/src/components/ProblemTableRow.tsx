import Link from 'next/link'
import { cn } from '@/lib/utils'

interface ProblemTableRowProps {
  id: string
  number: string
  title: string
  source: string
  year: number
  difficulty: number
  rating?: number
  tags?: string[]
  solveCount?: number
  passRate?: number
}

const difficultyColors = {
  1: 'bg-gray-100 text-gray-700',
  2: 'bg-blue-100 text-blue-700',
  3: 'bg-yellow-100 text-yellow-700',
  4: 'bg-orange-100 text-orange-700',
  5: 'bg-red-100 text-red-700',
}

const difficultyLabels = {
  1: '入门',
  2: '普及-',
  3: '普及/提高',
  4: '普及+/提高',
  5: '提高+/省选-',
}

export default function ProblemTableRow({
  id,
  number,
  title,
  source,
  year,
  difficulty,
  rating,
  tags,
  solveCount,
  passRate
}: ProblemTableRowProps) {
  return (
    <tr className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
      {/* Checkbox */}
      <td className="px-4 py-3 text-center">
        <input type="checkbox" className="w-4 h-4 rounded border-gray-300" />
      </td>

      {/* Problem Number */}
      <td className="px-4 py-3 text-gray-700 font-mono text-sm">
        {number}
      </td>

      {/* Title */}
      <td className="px-4 py-3">
        <Link
          href={`/problems/${id}`}
          className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
        >
          {title}
        </Link>
      </td>

      {/* Tags */}
      <td className="px-4 py-3">
        <div className="flex flex-wrap gap-1">
          {/* Display Algorithm/Show Tags button like Luogu */}
          <button className="text-xs text-blue-600 hover:underline">
            显示算法标签
          </button>
          {/* Source Tag */}
          <span className="px-2 py-0.5 bg-cyan-500 text-white rounded text-xs">
            {source}
          </span>
          {/* Year Tag */}
          <span className="px-2 py-0.5 bg-blue-500 text-white rounded text-xs">
            {year}
          </span>
          {/* Additional tags if any */}
          {tags?.slice(0, 2).map(tag => (
            <span key={tag} className="px-2 py-0.5 bg-gray-200 text-gray-700 rounded text-xs">
              {tag}
            </span>
          ))}
        </div>
      </td>

      {/* Difficulty */}
      <td className="px-4 py-3 text-center">
        <span className={cn(
          "px-3 py-1 rounded text-xs font-medium inline-block",
          difficultyColors[difficulty as keyof typeof difficultyColors]
        )}>
          {difficultyLabels[difficulty as keyof typeof difficultyLabels]}
        </span>
      </td>

      {/* Pass Rate */}
      <td className="px-4 py-3 text-center">
        <div className="w-full">
          <div className="text-xs text-gray-600 mb-1">
            {passRate ? `${passRate.toFixed(1)}%` : '-'}
          </div>
          {passRate && (
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div
                className="bg-blue-500 h-1.5 rounded-full"
                style={{ width: `${passRate}%` }}
              />
            </div>
          )}
        </div>
      </td>
    </tr>
  )
}
