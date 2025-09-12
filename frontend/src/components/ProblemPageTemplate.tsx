'use client'

import { useState } from 'react'
import Link from "next/link"
import Header from "@/components/Header"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Bookmark, Share2, Download, Star, Eye, Copy, Twitter, Link2, FileText, FileDown, Send, X } from "lucide-react"

interface ProblemData {
  id: string
  number: string
  title: string
  content: string
  officialSolution: string
  difficulty: number
  rating: number
  source: string
  year: number
  solveCount: number
  tags: string[]
}

interface ProblemPageTemplateProps {
  problem: ProblemData
}

export default function ProblemPageTemplate({ problem }: ProblemPageTemplateProps) {
  const [showSolution, setShowSolution] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const [showShareMenu, setShowShareMenu] = useState(false)
  const [showDownloadMenu, setShowDownloadMenu] = useState(false)
  const [showSubmitModal, setShowSubmitModal] = useState(false)
  const [solutionText, setSolutionText] = useState('')
  const [copied, setCopied] = useState(false)

  const handleCopyLink = () => {
    const url = window.location.href
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleShareTwitter = () => {
    const text = `Check out this linguistics problem: ${problem.title}`
    const url = window.location.href
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank')
  }

  const handleDownloadText = () => {
    const content = `LingoHub Problem ${problem.number}
Title: ${problem.title}
Source: ${problem.source} ${problem.year}
Difficulty: ${problem.difficulty}/5
Rating: ${problem.rating}

PROBLEM:
${problem.content}

SOLUTION:
${problem.officialSolution}

Tags: ${problem.tags.join(', ')}
`
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${problem.number}_${problem.title.replace(/\s+/g, '_')}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    setShowDownloadMenu(false)
  }

  const handleDownloadJSON = () => {
    const blob = new Blob([JSON.stringify(problem, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${problem.number}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    setShowDownloadMenu(false)
  }

  const handleSubmitSolution = () => {
    if (solutionText.trim()) {
      // In a real app, this would send to the backend
      alert('Solution submitted successfully! (In production, this would save to the database)')
      setShowSubmitModal(false)
      setSolutionText('')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation */}
        <div className="mb-6">
          <Link href="/problems" className="inline-flex items-center text-gray-600 hover:text-gray-900">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Problems
          </Link>
        </div>

        {/* Problem Header */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <span className="text-sm font-mono text-blue-600 bg-blue-50 px-2 py-1 rounded">
                  {problem.number}
                </span>
                <span className="text-sm text-gray-500">{problem.source} {problem.year}</span>
              </div>
              <h1 className="text-3xl font-bold text-gray-900">{problem.title}</h1>
            </div>
            
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsSaved(!isSaved)}
                className={isSaved ? "bg-yellow-50 border-yellow-400" : ""}
              >
                {isSaved ? <Bookmark className="h-4 w-4 text-yellow-600 fill-current" /> : <Bookmark className="h-4 w-4" />}
              </Button>
              
              {/* Share Button with Dropdown */}
              <div className="relative">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    setShowShareMenu(!showShareMenu)
                    setShowDownloadMenu(false)
                  }}
                >
                  <Share2 className="h-4 w-4" />
                </Button>
                {showShareMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border z-10">
                    <button
                      onClick={handleCopyLink}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      {copied ? <Copy className="h-4 w-4 mr-2 text-green-600" /> : <Link2 className="h-4 w-4 mr-2" />}
                      {copied ? 'Copied!' : 'Copy Link'}
                    </button>
                    <button
                      onClick={handleShareTwitter}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <Twitter className="h-4 w-4 mr-2" />
                      Share on Twitter
                    </button>
                  </div>
                )}
              </div>

              {/* Download Button with Dropdown */}
              <div className="relative">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    setShowDownloadMenu(!showDownloadMenu)
                    setShowShareMenu(false)
                  }}
                >
                  <Download className="h-4 w-4" />
                </Button>
                {showDownloadMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border z-10">
                    <button
                      onClick={handleDownloadText}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Download as Text
                    </button>
                    <button
                      onClick={handleDownloadJSON}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <FileDown className="h-4 w-4 mr-2" />
                      Download as JSON
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center">
              {Array.from({ length: 5 }, (_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${i < problem.difficulty ? "text-yellow-400 fill-current" : "text-gray-300"}`}
                />
              ))}
              <span className="ml-2">Difficulty</span>
            </div>
            <div className="flex items-center">
              <span className="font-medium">Rating:</span>
              <span className="ml-1">{problem.rating}</span>
            </div>
            <div className="flex items-center">
              <Eye className="h-4 w-4 mr-1" />
              <span>{problem.solveCount} solved</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mt-4">
            {problem.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm hover:bg-gray-200 cursor-pointer transition-colors"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Problem Content */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Problem</h2>
          <div className="prose max-w-none">
            <p className="text-gray-700 text-lg leading-relaxed">{problem.content}</p>
          </div>
        </div>

        {/* Solution Section */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Official Solution</h2>
            <Button
              onClick={() => setShowSolution(!showSolution)}
              variant={showSolution ? "outline" : "default"}
            >
              {showSolution ? "Hide Solution" : "Show Solution"}
            </Button>
          </div>
          
          {showSolution ? (
            <div className="prose max-w-none">
              <p className="text-gray-700 leading-relaxed">{problem.officialSolution}</p>
            </div>
          ) : (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-yellow-800">
                Click "Show Solution" to reveal the answer. Try solving it yourself first!
              </p>
            </div>
          )}
        </div>

        {/* User Solutions Section */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Community Solutions</h2>
            <Button onClick={() => setShowSubmitModal(true)}>
              <Send className="h-4 w-4 mr-2" />
              Submit Solution
            </Button>
          </div>
          
          <div className="text-center py-8 text-gray-500">
            No community solutions yet. Be the first to submit one!
          </div>
        </div>
      </div>

      {/* Submit Solution Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Submit Your Solution</h2>
                <button
                  onClick={() => setShowSubmitModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              <div className="mb-4">
                <p className="text-gray-600 mb-2">Problem: {problem.title}</p>
                <p className="text-sm text-gray-500">Share your approach and solution with the community</p>
              </div>

              <textarea
                value={solutionText}
                onChange={(e) => setSolutionText(e.target.value)}
                placeholder="Explain your solution here... You can describe your approach, the patterns you noticed, and how you arrived at the answer."
                className="w-full h-64 p-4 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              <div className="flex justify-end space-x-3 mt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowSubmitModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmitSolution}
                  disabled={!solutionText.trim()}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Submit Solution
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}