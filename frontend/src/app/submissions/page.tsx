'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { solutionsApi } from '@/lib/api'
import Header from "@/components/Header"
import { Button } from "@/components/ui/button"
import {
  Award,
  Clock,
  User,
  FileText,
  CheckCircle,
  XCircle,
  AlertCircle,
  Filter
} from "lucide-react"
import Link from 'next/link'

interface Submission {
  id: string
  problemId: string
  problemNumber: string
  problemTitle: string
  userId: string
  username: string
  llmScore: number | null
  llmConfidence: string | null
  status: string
  createdAt: string
  isOwnSubmission: boolean
}

export default function SubmissionsPage() {
  const { user } = useAuth()
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'mine'>('all')

  useEffect(() => {
    loadSubmissions()
  }, [filter, user])

  const loadSubmissions = async () => {
    try {
      setIsLoading(true)

      const userId = filter === 'mine' && user ? user.id : undefined
      const response = await solutionsApi.getAllSubmissions(userId)

      const loadedSubmissions = response.data.submissions.map((sub: any) => ({
        ...sub,
        isOwnSubmission: user ? sub.userId === user.id : false
      }))

      setSubmissions(loadedSubmissions)
    } catch (error) {
      console.error('Failed to load submissions:', error)
      setSubmissions([])
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusBadge = (score: number | null, confidence: string | null) => {
    if (score === null) {
      return (
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-100 text-gray-700">
          <Clock className="h-4 w-4" />
          <span className="text-sm font-medium">Pending</span>
        </div>
      )
    }

    if (score >= 70) {
      return (
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-100 text-green-700">
          <CheckCircle className="h-4 w-4" />
          <span className="text-sm font-medium">Accepted ({score})</span>
        </div>
      )
    }

    if (score >= 40) {
      return (
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-yellow-100 text-yellow-700">
          <AlertCircle className="h-4 w-4" />
          <span className="text-sm font-medium">Partial ({score})</span>
        </div>
      )
    }

    return (
      <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-100 text-red-700">
        <XCircle className="h-4 w-4" />
        <span className="text-sm font-medium">Wrong ({score})</span>
      </div>
    )
  }

  const getConfidenceBadge = (confidence: string | null) => {
    if (!confidence) return null

    const colors = {
      high: 'bg-green-50 text-green-700 border-green-200',
      medium: 'bg-yellow-50 text-yellow-700 border-yellow-200',
      low: 'bg-orange-50 text-orange-700 border-orange-200'
    }

    return (
      <span className={`text-xs px-2 py-1 rounded border ${colors[confidence as keyof typeof colors] || colors.medium}`}>
        {confidence}
      </span>
    )
  }

  const filteredSubmissions = filter === 'mine'
    ? submissions.filter(s => s.isOwnSubmission)
    : submissions

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Submissions</h1>
          <p className="text-gray-600">View your submission history and results</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Filter className="h-5 w-5 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Filter:</span>
              <div className="flex gap-2">
                <Button
                  variant={filter === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter('all')}
                >
                  All Submissions
                </Button>
                <Button
                  variant={filter === 'mine' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter('mine')}
                  disabled={!user}
                >
                  My Submissions
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Submissions Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="text-gray-500">Loading submissions...</div>
            </div>
          ) : filteredSubmissions.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 mb-2">
                {filter === 'mine' ? 'No submissions yet' : 'No submissions found'}
              </p>
              {!user && filter === 'mine' && (
                <p className="text-sm text-gray-400">Please log in to view your submissions</p>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Problem
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Score
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredSubmissions.map((submission) => (
                    <tr key={submission.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link
                          href={`/problems/${submission.problemNumber}`}
                          className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                          {submission.problemNumber}: {submission.problemTitle}
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-900">
                            {submission.isOwnSubmission ? 'You' : submission.username}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(submission.llmScore, submission.llmConfidence)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {submission.llmScore !== null ? (
                            <>
                              <Award className="h-4 w-4 text-yellow-500" />
                              <span className="text-sm font-medium">{submission.llmScore}/100</span>
                              {getConfidenceBadge(submission.llmConfidence)}
                            </>
                          ) : (
                            <span className="text-sm text-gray-400">-</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 text-sm text-gray-500">
                          <Clock className="h-4 w-4" />
                          {new Date(submission.createdAt).toLocaleString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {submission.isOwnSubmission && (
                          <Link href={`/submissions/${submission.id}`}>
                            <Button variant="ghost" size="sm">
                              View Details
                            </Button>
                          </Link>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Info card */}
        {!user && (
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> Log in to submit solutions and track your submission history.
            </p>
          </div>
        )}
      </main>
    </div>
  )
}
