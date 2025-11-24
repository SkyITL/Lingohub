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
  Info,
  Flag
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
  const [showFlagModal, setShowFlagModal] = useState(false)
  const [flagReason, setFlagReason] = useState<string>('')
  const [flagDetails, setFlagDetails] = useState<string>('')
  const [flagging, setFlagging] = useState(false)
  const [flagMessage, setFlagMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const submissionId = params.id as string

  useEffect(() => {
    loadSubmission()

    // Poll for updates every 3 seconds while evaluation is pending
    let pollInterval: NodeJS.Timeout | null = null

    const startPolling = async () => {
      pollInterval = setInterval(async () => {
        try {
          const response = await submissionsApi.getById(submissionId)
          const currentSubmission = response.data.submission
          setSubmission(currentSubmission)

          // Stop polling once evaluation is complete (score is no longer null)
          if (currentSubmission.llmScore !== null) {
            if (pollInterval) clearInterval(pollInterval)
          }
        } catch (error) {
          // Keep polling even if there's an error
          console.log('Polling submission update...')
        }
      }, 3000)
    }

    startPolling()

    return () => {
      if (pollInterval) clearInterval(pollInterval)
    }
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

  const handleFlagSubmission = async () => {
    if (!flagReason) {
      setFlagMessage({ type: 'error', text: 'Please select a reason' })
      return
    }

    try {
      setFlagging(true)
      await submissionsApi.flag(submissionId, flagReason, flagDetails)
      setFlagMessage({ type: 'success', text: 'Submission flagged successfully. Thank you for helping keep the community safe!' })
      setShowFlagModal(false)
      setFlagReason('')
      setFlagDetails('')
      // Clear message after 3 seconds
      setTimeout(() => setFlagMessage(null), 3000)
    } catch (error: any) {
      console.error('Failed to flag submission:', error)
      setFlagMessage({ type: 'error', text: error.response?.data?.error || 'Failed to flag submission' })
    } finally {
      setFlagging(false)
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
            <div className="flex items-center gap-3">
              {getStatusBadge(submission.llmScore)}
              {submission.userId !== user?.id && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFlagModal(true)}
                  className="text-orange-600 border-orange-200 hover:bg-orange-50"
                >
                  <Flag className="h-4 w-4 mr-2" />
                  Flag
                </Button>
              )}
            </div>
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

        {/* Flag Message */}
        {flagMessage && (
          <div className={`mt-6 p-4 rounded-lg ${
            flagMessage.type === 'success'
              ? 'bg-green-50 border border-green-200 text-green-700'
              : 'bg-red-50 border border-red-200 text-red-700'
          }`}>
            {flagMessage.text}
          </div>
        )}

        {/* Flag Modal */}
        {showFlagModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Flag className="h-5 w-5 text-orange-600" />
                Flag Submission for Review
              </h2>

              <p className="text-gray-600 mb-6">
                Help us maintain community standards by flagging submissions that violate our guidelines.
              </p>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-900 mb-3">
                  Reason for flagging:
                </label>
                <div className="space-y-2">
                  {[
                    { value: 'incorrect', label: 'Incorrect evaluation - I believe the AI got it wrong' },
                    { value: 'plagiarism', label: 'Plagiarism - This may be copied work' },
                    { value: 'spam', label: 'Spam - Not a genuine submission' }
                  ].map((option) => (
                    <label key={option.value} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        name="flag-reason"
                        value={option.value}
                        checked={flagReason === option.value}
                        onChange={(e) => setFlagReason(e.target.value)}
                        className="w-4 h-4"
                      />
                      <span className="text-gray-700">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Additional details (optional):
                </label>
                <textarea
                  value={flagDetails}
                  onChange={(e) => setFlagDetails(e.target.value)}
                  placeholder="Explain why you're flagging this submission..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                  rows={3}
                />
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowFlagModal(false)
                    setFlagReason('')
                    setFlagDetails('')
                  }}
                  disabled={flagging}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleFlagSubmission}
                  disabled={flagging || !flagReason}
                  className="flex-1 bg-orange-600 hover:bg-orange-700 text-white"
                >
                  {flagging ? 'Flagging...' : 'Flag Submission'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
