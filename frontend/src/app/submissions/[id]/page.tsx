'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { submissionsApi } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'
import Header from "@/components/Header"
import { Button } from "@/components/ui/button"
import {
  Award,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  ArrowLeft,
  FileText,
  ThumbsUp,
  ThumbsDown,
  Info
} from "lucide-react"
import Link from 'next/link'

interface SubmissionDetail {
  id: string
  problemId: string
  problemNumber: string
  problemTitle: string
  userId: string
  username: string
  content: string
  llmScore: number | null
  llmFeedback: string | null
  llmConfidence: string | null
  status: string
  createdAt: string
  attachments?: any[]
}

export default function SubmissionDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const [submission, setSubmission] = useState<SubmissionDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const submissionId = params.id as string

  useEffect(() => {
    loadSubmission()
  }, [submissionId])

  const loadSubmission = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await submissionsApi.getById(submissionId)
      setSubmission(response.data.submission)
    } catch (error: any) {
      console.error('Failed to load submission:', error)

      if (error.response?.status === 403) {
        setError('You do not have permission to view this submission')
      } else if (error.response?.status === 404) {
        setError('Submission not found')
      } else if (error.response?.status === 401) {
        setError('Please log in to view your submissions')
      } else {
        setError('Failed to load submission details')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusBadge = (score: number | null) => {
    if (score === null) {
      return (
        <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 text-gray-700">
          <Clock className="h-5 w-5" />
          <span className="text-base font-medium">Pending Evaluation</span>
        </div>
      )
    }

    if (score >= 70) {
      return (
        <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-100 text-green-700">
          <CheckCircle className="h-5 w-5" />
          <span className="text-base font-medium">Accepted ({score}/100)</span>
        </div>
      )
    }

    if (score >= 40) {
      return (
        <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-yellow-100 text-yellow-700">
          <AlertCircle className="h-5 w-5" />
          <span className="text-base font-medium">Partial Credit ({score}/100)</span>
        </div>
      )
    }

    return (
      <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-100 text-red-700">
        <XCircle className="h-5 w-5" />
        <span className="text-base font-medium">Wrong Answer ({score}/100)</span>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <div className="text-gray-500">Loading submission...</div>
          </div>
        </main>
      </div>
    )
  }

  if (error || !submission) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              {error || 'Submission not found'}
            </h2>
            <p className="text-gray-600 mb-6">
              {error === 'You do not have permission to view this submission'
                ? 'You can only view your own submissions.'
                : 'This submission may have been deleted or does not exist.'}
            </p>
            <Link href="/submissions">
              <Button>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Submissions
              </Button>
            </Link>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Back Button */}
        <div className="mb-6">
          <Link href="/submissions">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Submissions
            </Button>
          </Link>
        </div>

        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Submission Details
              </h1>
              <Link
                href={`/problems/${submission.problemNumber}`}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                {submission.problemNumber}: {submission.problemTitle}
              </Link>
            </div>
            {getStatusBadge(submission.llmScore)}
          </div>

          <div className="flex items-center gap-6 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>Submitted {new Date(submission.createdAt).toLocaleString()}</span>
            </div>
            {submission.llmConfidence && (
              <div className="flex items-center gap-2">
                <Info className="h-4 w-4" />
                <span>Confidence: {submission.llmConfidence}</span>
              </div>
            )}
          </div>
        </div>

        {/* Your Answer */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Your Answer
          </h2>
          <div className="prose max-w-none">
            <pre className="whitespace-pre-wrap bg-gray-50 p-4 rounded border border-gray-200 text-sm">
              {submission.content}
            </pre>
          </div>

          {/* Attachments */}
          {submission.attachments && submission.attachments.length > 0 && (
            <div className="mt-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Attachments:</h3>
              <div className="space-y-2">
                {submission.attachments.map((attachment: any, index: number) => (
                  <a
                    key={index}
                    href={attachment.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-blue-600 hover:text-blue-800 text-sm"
                  >
                    {attachment.filename || `Attachment ${index + 1}`}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* AI Feedback */}
        {submission.llmFeedback && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Award className="h-5 w-5 text-yellow-500" />
              AI Evaluation Feedback
            </h2>

            {submission.llmScore !== null && (
              <div className="mb-4 flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-3xl font-bold text-gray-900">{submission.llmScore}</span>
                  <span className="text-gray-500">/100</span>
                </div>
                {submission.llmScore >= 70 && (
                  <ThumbsUp className="h-6 w-6 text-green-600" />
                )}
                {submission.llmScore < 40 && (
                  <ThumbsDown className="h-6 w-6 text-red-600" />
                )}
              </div>
            )}

            <div className="prose max-w-none">
              <div className="whitespace-pre-wrap text-gray-700">
                {submission.llmFeedback}
              </div>
            </div>
          </div>
        )}

        {/* Pending Message */}
        {submission.llmScore === null && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h3 className="font-medium text-blue-900 mb-1">Evaluation Pending</h3>
                <p className="text-sm text-blue-800">
                  Your submission is being evaluated by our AI system. This usually takes a few moments.
                  Refresh the page to check for updates.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
