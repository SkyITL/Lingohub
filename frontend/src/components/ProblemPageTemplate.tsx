'use client'

import { useState, useEffect } from 'react'
import Link from "next/link"
import Header from "@/components/Header"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Bookmark, Share2, Download, Star, Eye, Copy, Twitter, Link2, FileText, FileDown, Send, X, Facebook, Mail, ThumbsUp, ThumbsDown, FileCode } from "lucide-react"
import { jsPDF } from 'jspdf'
import { useAuth } from '@/contexts/AuthContext'
import { solutionsApi } from '@/lib/api'

// Markdown content component
function MarkdownContent({ content }: { content: string }) {
  const [htmlContent, setHtmlContent] = useState('')

  useEffect(() => {
    const processMarkdown = async () => {
      try {
        const { marked } = await import('marked')
        const html = await marked(content)
        setHtmlContent(html)
      } catch (error) {
        console.error('Failed to process markdown:', error)
        setHtmlContent(content.replace(/\n/g, '<br>'))
      }
    }

    processMarkdown()
  }, [content])

  return (
    <div
      className="text-gray-700 linguistic-content prose max-w-none"
      dangerouslySetInnerHTML={{ __html: htmlContent }}
    />
  )
}

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

interface Solution {
  id: string
  content: string
  username?: string
  createdAt: string
  upvotes: number
  downvotes: number
}

interface ProblemPageTemplateProps {
  problem: ProblemData
}

export default function ProblemPageTemplate({ problem }: ProblemPageTemplateProps) {
  const { user } = useAuth()
  const [showSolution, setShowSolution] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const [showShareMenu, setShowShareMenu] = useState(false)
  const [showDownloadMenu, setShowDownloadMenu] = useState(false)
  const [showSubmitModal, setShowSubmitModal] = useState(false)
  const [solutionText, setSolutionText] = useState('')
  const [copied, setCopied] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [communitySolutions, setCommunitySolutions] = useState<Solution[]>([])
  const [loadingSolutions, setLoadingSolutions] = useState(true)

  // Load saved state from localStorage
  useEffect(() => {
    const savedProblems = JSON.parse(localStorage.getItem('savedProblems') || '[]')
    setIsSaved(savedProblems.includes(problem.number))
    
    // Fetch community solutions
    fetchSolutions()
  }, [problem.number])

  const fetchSolutions = async () => {
    try {
      // Using fetch instead of axios for now
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://lingohub-backend.vercel.app'}/api/solutions/problem/${problem.number}`)
      const data = await response.json()
      if (data.success) {
        setCommunitySolutions(data.data)
      }
    } catch (error) {
      console.error('Error fetching solutions:', error)
      // Set some mock data for demonstration
      setCommunitySolutions([])
    } finally {
      setLoadingSolutions(false)
    }
  }

  const handleSaveToggle = () => {
    const savedProblems = JSON.parse(localStorage.getItem('savedProblems') || '[]')
    
    if (isSaved) {
      const updated = savedProblems.filter((p: string) => p !== problem.number)
      localStorage.setItem('savedProblems', JSON.stringify(updated))
      setIsSaved(false)
    } else {
      savedProblems.push(problem.number)
      localStorage.setItem('savedProblems', JSON.stringify(savedProblems))
      setIsSaved(true)
    }
  }

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

  const handleShareFacebook = () => {
    const url = window.location.href
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank')
  }

  const handleShareEmail = () => {
    const subject = `LingoHub Problem: ${problem.title}`
    const body = `Check out this interesting linguistics problem:\n\n${problem.title}\n\n${window.location.href}`
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
  }

  const handleDownloadText = () => {
    const content = `LingoHub Problem ${problem.number}
=====================================
Title: ${problem.title}
Source: ${problem.source} ${problem.year}
Difficulty: ${'★'.repeat(problem.difficulty)}${'☆'.repeat(5 - problem.difficulty)}
Rating: ${problem.rating}

PROBLEM:
--------
${problem.content}

SOLUTION:
---------
${problem.officialSolution}

Tags: ${problem.tags.join(', ')}

=====================================
Downloaded from: ${window.location.href}
`
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
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
    const exportData = {
      ...problem,
      exportedAt: new Date().toISOString(),
      url: window.location.href
    }
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
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

  const handleDownloadPDF = () => {
    // Create a new jsPDF instance
    const doc = new jsPDF()
    
    // Set font and sizes
    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()
    const margin = 20
    const lineHeight = 7
    let yPosition = margin
    
    // Title
    doc.setFontSize(20)
    doc.setFont('helvetica', 'bold')
    doc.text(`${problem.number}: ${problem.title}`, margin, yPosition)
    yPosition += lineHeight * 2
    
    // Metadata
    doc.setFontSize(12)
    doc.setFont('helvetica', 'normal')
    doc.text(`Source: ${problem.source} ${problem.year}`, margin, yPosition)
    yPosition += lineHeight
    doc.text(`Difficulty: ${'★'.repeat(problem.difficulty)}${'☆'.repeat(5 - problem.difficulty)}`, margin, yPosition)
    yPosition += lineHeight
    doc.text(`Rating: ${problem.rating}`, margin, yPosition)
    yPosition += lineHeight * 2
    
    // Problem section
    doc.setFont('helvetica', 'bold')
    doc.text('PROBLEM:', margin, yPosition)
    yPosition += lineHeight
    
    doc.setFont('helvetica', 'normal')
    const problemLines = doc.splitTextToSize(problem.content, pageWidth - margin * 2)
    problemLines.forEach((line: string) => {
      if (yPosition > pageHeight - margin) {
        doc.addPage()
        yPosition = margin
      }
      doc.text(line, margin, yPosition)
      yPosition += lineHeight
    })
    
    yPosition += lineHeight
    
    // Solution section
    doc.setFont('helvetica', 'bold')
    doc.text('SOLUTION:', margin, yPosition)
    yPosition += lineHeight
    
    doc.setFont('helvetica', 'normal')
    const solutionLines = doc.splitTextToSize(problem.officialSolution, pageWidth - margin * 2)
    solutionLines.forEach((line: string) => {
      if (yPosition > pageHeight - margin) {
        doc.addPage()
        yPosition = margin
      }
      doc.text(line, margin, yPosition)
      yPosition += lineHeight
    })
    
    yPosition += lineHeight
    
    // Tags
    if (yPosition > pageHeight - margin * 2) {
      doc.addPage()
      yPosition = margin
    }
    doc.setFont('helvetica', 'bold')
    doc.text('Tags: ', margin, yPosition)
    doc.setFont('helvetica', 'normal')
    doc.text(problem.tags.join(', '), margin + 15, yPosition)
    
    // Footer
    doc.setFontSize(10)
    doc.text(`Downloaded from LingoHub`, margin, pageHeight - margin)
    doc.text(new Date().toLocaleDateString(), pageWidth - margin - 30, pageHeight - margin)
    
    // Save the PDF
    doc.save(`${problem.number}_${problem.title.replace(/\s+/g, '_')}.pdf`)
    setShowDownloadMenu(false)
  }

  const handleSubmitSolution = async () => {
    if (!solutionText.trim()) return

    if (solutionText.trim().length < 10) {
      alert('Solution must be at least 10 characters long.')
      return
    }

    if (!user) {
      alert('You must be logged in to submit a solution.')
      return
    }

    setIsSubmitting(true)
    try {
      const response = await solutionsApi.submit(problem.id, solutionText)
      const newSol = response.data.solution

      // Add the new solution to the list
      const newSolution: Solution = {
        id: newSol.id,
        content: newSol.content,
        username: user.username || 'You',
        createdAt: newSol.createdAt,
        upvotes: newSol.voteScore || 0,
        downvotes: 0
      }
      setCommunitySolutions([newSolution, ...communitySolutions])

      // Reset form
      setShowSubmitModal(false)
      setSolutionText('')

      // Show success message
      alert('Solution submitted successfully!')
    } catch (error: any) {
      console.error('Error submitting solution:', error)
      const errorMessage = error.response?.data?.error || error.message || 'Failed to submit solution'
      alert(`Error: ${errorMessage}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    
    if (hours < 1) return 'Just now'
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`
    const days = Math.floor(hours / 24)
    if (days < 30) return `${days} day${days > 1 ? 's' : ''} ago`
    return date.toLocaleDateString()
  }

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setShowShareMenu(false)
      setShowDownloadMenu(false)
    }
    
    if (showShareMenu || showDownloadMenu) {
      document.addEventListener('click', handleClickOutside)
      return () => document.removeEventListener('click', handleClickOutside)
    }
  }, [showShareMenu, showDownloadMenu])

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
                onClick={handleSaveToggle}
                className={isSaved ? "bg-yellow-50 border-yellow-400" : ""}
                title={isSaved ? "Remove from saved" : "Save problem"}
              >
                {isSaved ? <Bookmark className="h-4 w-4 text-yellow-600 fill-current" /> : <Bookmark className="h-4 w-4" />}
              </Button>
              
              {/* Share Button with Dropdown */}
              <div className="relative">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    setShowShareMenu(!showShareMenu)
                    setShowDownloadMenu(false)
                  }}
                  title="Share problem"
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
                    <button
                      onClick={handleShareFacebook}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <Facebook className="h-4 w-4 mr-2" />
                      Share on Facebook
                    </button>
                    <button
                      onClick={handleShareEmail}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <Mail className="h-4 w-4 mr-2" />
                      Share via Email
                    </button>
                  </div>
                )}
              </div>

              {/* Download Button with Dropdown */}
              <div className="relative">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    setShowDownloadMenu(!showDownloadMenu)
                    setShowShareMenu(false)
                  }}
                  title="Download problem"
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
                      onClick={handleDownloadPDF}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <FileCode className="h-4 w-4 mr-2" />
                      Download as PDF
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
              <Link
                key={tag}
                href={`/problems?tags=${tag}`}
                className="inline-flex items-center bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm hover:bg-gray-200 cursor-pointer transition-colors"
              >
                {tag}
              </Link>
            ))}
          </div>
        </div>

        {/* Problem Content */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Problem</h2>
          <MarkdownContent content={problem.content} />
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
            <MarkdownContent content={problem.officialSolution} />
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
            <h2 className="text-xl font-semibold">Community Solutions ({communitySolutions.length})</h2>
            <Button onClick={() => setShowSubmitModal(true)}>
              <Send className="h-4 w-4 mr-2" />
              Submit Solution
            </Button>
          </div>
          
          {loadingSolutions ? (
            <div className="text-center py-8 text-gray-500">Loading solutions...</div>
          ) : communitySolutions.length > 0 ? (
            <div className="space-y-4">
              {communitySolutions.map((solution) => (
                <div key={solution.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">{solution.username || 'Anonymous'}</span>
                      <span className="text-sm text-gray-500">{formatDate(solution.createdAt)}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button className="flex items-center space-x-1 text-gray-600 hover:text-green-600">
                        <ThumbsUp className="h-4 w-4" />
                        <span className="text-sm">{solution.upvotes}</span>
                      </button>
                      <button className="flex items-center space-x-1 text-gray-600 hover:text-red-600">
                        <ThumbsDown className="h-4 w-4" />
                        <span className="text-sm">{solution.downvotes}</span>
                      </button>
                    </div>
                  </div>
                  <p className="text-gray-700 whitespace-pre-line">{solution.content}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No community solutions yet. Be the first to submit one!
            </div>
          )}
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
                placeholder="Explain your solution here... 

You can describe:
- The patterns you noticed
- Your approach to solving the problem
- Step-by-step reasoning
- Any linguistic concepts involved"
                className="w-full h-64 p-4 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
              />

              <div className="text-sm text-gray-500 mt-2">
                {solutionText.length} characters
              </div>

              <div className="flex justify-end space-x-3 mt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowSubmitModal(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmitSolution}
                  disabled={!solutionText.trim() || isSubmitting}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Solution'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}