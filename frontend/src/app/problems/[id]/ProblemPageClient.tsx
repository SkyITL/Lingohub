'use client'

import { useState, useEffect } from 'react'
import { solutionsApi, problemsApi } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'
import Header from "@/components/Header"
import { Button } from "@/components/ui/button"
import * as Tabs from "@radix-ui/react-tabs"
import {
  Bookmark,
  BookmarkCheck,
  Share2,
  Download,
  Star,
  ThumbsUp,
  ThumbsDown,
  MessageCircle,
  Eye,
  Calendar,
  Tag,
  Check,
  Send,
  X,
  Trash2,
  AlertTriangle
} from "lucide-react"

// Markdown content component
function MarkdownContent({ content }: { content: string }) {
  const [htmlContent, setHtmlContent] = useState('')

  useEffect(() => {
    const processMarkdown = async () => {
      try {
        const { marked } = await import('marked')

        // Configure marked to use GFM (GitHub Flavored Markdown) for tables
        marked.setOptions({
          gfm: true,
          breaks: true,
          tables: true
        })

        const html = marked(content)
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
      className="text-gray-700 linguistic-content"
      dangerouslySetInnerHTML={{ __html: htmlContent }}
    />
  )
}

interface ProblemPageClientProps {
  initialProblem: any
}

export default function ProblemPageClient({ initialProblem }: ProblemPageClientProps) {
  const { user } = useAuth()
  const [problem] = useState(initialProblem)
  const [isSaved, setIsSaved] = useState(false)
  const [shareText, setShareText] = useState('Share')
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)
  const [showSolutionForm, setShowSolutionForm] = useState(false)
  const [newSolution, setNewSolution] = useState('')
  const [sortBy, setSortBy] = useState('most-upvoted')
  const [solutions, setSolutions] = useState([])
  const [isLoadingSolutions, setIsLoadingSolutions] = useState(true)
  const [userSolution, setUserSolution] = useState(null)
  const [isEditingUserSolution, setIsEditingUserSolution] = useState(false)
  const [showSolutionWarning, setShowSolutionWarning] = useState(!initialProblem.viewedSolution)
  const [solutionRevealed, setSolutionRevealed] = useState(initialProblem.viewedSolution || false)
  const [showOfficialSolution, setShowOfficialSolution] = useState(false)
  const [selectedImages, setSelectedImages] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [imageError, setImageError] = useState('')

  // Load saved state and solutions
  useEffect(() => {
    const savedProblems = JSON.parse(localStorage.getItem('savedProblems') || '[]')
    setIsSaved(savedProblems.includes(problem.id))
    loadSolutions()
  }, [problem.id])

  // Reload solutions when sort changes
  useEffect(() => {
    loadSolutions()
  }, [sortBy, user])

  const loadSolutions = async () => {
    try {
      setIsLoadingSolutions(true)
      const sortMapping = {
        'most-upvoted': 'votes',
        'newest': 'newest',
        'oldest': 'oldest'
      }

      const response = await solutionsApi.getByProblem(problem.id, sortMapping[sortBy])
      const { solutions: loadedSolutions } = response.data

      // Transform solutions to ensure votes field exists
      const transformedSolutions = loadedSolutions.map((sol: any) => ({
        ...sol,
        votes: sol.voteScore || 0
      }))

      if (user) {
        // Separate user's own solution from others
        const userSol = transformedSolutions.find(sol => sol.user.id === user.id)
        const otherSolutions = transformedSolutions.filter(sol => sol.user.id !== user.id)

        setUserSolution(userSol || null)
        setSolutions(otherSolutions)
      } else {
        setSolutions(transformedSolutions)
        setUserSolution(null)
      }
    } catch (error) {
      console.error('❌ Failed to load solutions:', error)
    } finally {
      setIsLoadingSolutions(false)
    }
  }

  const handleSave = () => {
    const newSavedState = !isSaved
    setIsSaved(newSavedState)

    const savedProblems = JSON.parse(localStorage.getItem('savedProblems') || '[]')

    if (newSavedState) {
      if (!savedProblems.includes(problem.id)) {
        savedProblems.push(problem.id)
        localStorage.setItem('savedProblems', JSON.stringify(savedProblems))
      }
    } else {
      const updatedProblems = savedProblems.filter((problemId: string) => problemId !== problem.id)
      localStorage.setItem('savedProblems', JSON.stringify(updatedProblems))
    }
  }

  const handleShare = async () => {
    const url = window.location.href
    try {
      await navigator.clipboard.writeText(url)
      setShareText('Copied!')
      setTimeout(() => setShareText('Share'), 2000)
    } catch (err) {
      console.error('Failed to copy URL:', err)
      const textArea = document.createElement('textarea')
      textArea.value = url
      document.body.appendChild(textArea)
      textArea.focus()
      textArea.select()
      try {
        document.execCommand('copy')
        setShareText('Copied!')
        setTimeout(() => setShareText('Share'), 2000)
      } catch (fallbackErr) {
        console.error('Fallback copy failed:', fallbackErr)
        setShareText('Copy failed')
        setTimeout(() => setShareText('Share'), 2000)
      }
      document.body.removeChild(textArea)
    }
  }

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    setImageError('')

    // Validate file count (max 5 files: images + PDFs)
    if (selectedImages.length + files.length > 5) {
      setImageError('You can upload a maximum of 5 files (images or PDFs)')
      return
    }

    const newImages: File[] = []
    const newPreviews: string[] = []
    let totalSize = selectedImages.reduce((sum, img) => sum + img.size, 0)

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const isPDF = file.type === 'application/pdf'
      const isImage = file.type.startsWith('image/')

      // Validate file type (images or PDF)
      if (!isImage && !isPDF) {
        setImageError(`${file.name} is not an image or PDF file`)
        continue
      }

      // Different size limits for images vs PDFs
      const maxFileSize = isPDF ? 10 * 1024 * 1024 : 5 * 1024 * 1024 // 10MB for PDF, 5MB for images (before compression)
      if (file.size > maxFileSize) {
        setImageError(`${file.name} is too large. Maximum size is ${isPDF ? '10MB for PDFs' : '5MB for images'}`)
        continue
      }

      let processedFile = file

      // Compress images (but not PDFs)
      if (isImage) {
        try {
          const imageCompression = (await import('browser-image-compression')).default
          const options = {
            maxSizeMB: 1, // Compress to max 1MB
            maxWidthOrHeight: 1920, // Max dimension
            useWebWorker: true,
            fileType: file.type as 'image/jpeg' | 'image/png' | 'image/webp'
          }
          processedFile = await imageCompression(file, options)
          console.log(`Compressed ${file.name} from ${(file.size / 1024).toFixed(0)}KB to ${(processedFile.size / 1024).toFixed(0)}KB`)
        } catch (error) {
          console.error('Image compression failed:', error)
          // If compression fails, use original (it's already under 5MB)
          processedFile = file
        }
      }

      // Validate total size after compression (15MB total)
      totalSize += processedFile.size
      const maxTotalSize = 15 * 1024 * 1024 // 15MB total
      if (totalSize > maxTotalSize) {
        setImageError('Total file size cannot exceed 15MB')
        continue
      }

      newImages.push(processedFile)

      // Create preview (for images only, PDFs show icon)
      const reader = new FileReader()
      reader.onloadend = () => {
        newPreviews.push(reader.result as string)
        if (newPreviews.length === newImages.length) {
          setImagePreviews([...imagePreviews, ...newPreviews])
        }
      }
      if (isPDF) {
        // For PDFs, store a placeholder
        newPreviews.push('PDF_PLACEHOLDER')
        if (newPreviews.length === newImages.length) {
          setImagePreviews([...imagePreviews, ...newPreviews])
        }
      } else {
        reader.readAsDataURL(processedFile)
      }
    }

    setSelectedImages([...selectedImages, ...newImages])
  }

  const handleRemoveImage = (index: number) => {
    const newImages = selectedImages.filter((_, i) => i !== index)
    const newPreviews = imagePreviews.filter((_, i) => i !== index)
    setSelectedImages(newImages)
    setImagePreviews(newPreviews)
    setImageError('')
  }

  const handleSubmitSolution = async () => {
    if (!newSolution.trim()) return

    if (newSolution.trim().length < 10) {
      alert('Solution must be at least 10 characters long.')
      return
    }

    try {
      if (userSolution && isEditingUserSolution) {
        console.log('Editing solution not implemented yet')
        return
      }

      if (!user) {
        alert('You must be logged in to submit a solution.')
        return
      }

      // Submit solution with files
      const response = await solutionsApi.submit(
        problem.id,
        newSolution,
        selectedImages.length > 0 ? selectedImages : undefined
      )
      const newSol = response.data.solution

      console.log('Solution submitted successfully:', newSol)

      // Reload solutions from backend
      await loadSolutions()

      // Clear form
      setNewSolution('')
      setSelectedImages([])
      setImagePreviews([])
      setImageError('')
      setShowSolutionForm(false)
      setIsEditingUserSolution(false)
    } catch (error) {
      console.error('Failed to submit solution:', error)

      let errorMessage = 'Unknown error occurred'
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error
      } else if (error.response?.data) {
        errorMessage = JSON.stringify(error.response.data)
      } else if (error.message) {
        errorMessage = error.message
      }

      alert(`Error submitting solution: ${errorMessage}`)
    }
  }

  const handleVote = async (solutionId: string, voteType: 1 | -1) => {
    try {
      const currentSolution = solutions.find(sol => sol.id === solutionId)
      if (!currentSolution) return

      const currentVote = currentSolution.userVote || 0
      let newVote = currentVote === voteType ? 0 : voteType

      const response = await solutionsApi.vote(solutionId, newVote)
      const { voteScore } = response.data

      setSolutions(prev => prev.map(solution => {
        if (solution.id === solutionId) {
          return {
            ...solution,
            userVote: newVote,
            votes: voteScore,
            voteScore: voteScore
          }
        }
        return solution
      }))
    } catch (error) {
      console.error('Failed to vote:', error)
    }
  }

  const getSortedSolutions = () => {
    const solutionsCopy = [...solutions]

    switch (sortBy) {
      case 'most-upvoted':
        return solutionsCopy.sort((a, b) => b.votes - a.votes)
      case 'newest':
        return solutionsCopy.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      case 'oldest':
        return solutionsCopy.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
      default:
        return solutionsCopy.sort((a, b) => b.votes - a.votes)
    }
  }

  const handleDeleteSolution = async () => {
    if (!userSolution) return

    const confirmDelete = confirm('Are you sure you want to delete your solution? This action cannot be undone.')
    if (!confirmDelete) return

    try {
      await solutionsApi.delete(userSolution.id)
      setUserSolution(null)
      console.log('Solution deleted successfully')
    } catch (error) {
      console.error('Failed to delete solution:', error)

      let errorMessage = 'Unknown error occurred'
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error
      } else if (error.response?.data) {
        errorMessage = JSON.stringify(error.response.data)
      } else if (error.message) {
        errorMessage = error.message
      }

      alert(`Error deleting solution: ${errorMessage}`)
    }
  }

  const handleDownloadPDF = async () => {
    // If original PDF is available, download that
    if (problem.pdfUrl) {
      const filename = `${problem.number}-${problem.title.replace(/[^a-zA-Z0-9]/g, '-')}.pdf`
      const link = document.createElement('a')
      link.href = problem.pdfUrl
      link.download = filename
      link.target = '_blank'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      return
    }

    // Fallback to generating PDF from markdown
    setIsGeneratingPDF(true)
    try {
      const { jsPDF } = await import('jspdf')

      const doc = new jsPDF()

      doc.setProperties({
        title: `${problem.number}: ${problem.title}`,
        subject: 'LingoHub Problem',
        author: 'LingoHub',
        creator: 'LingoHub Platform'
      })

      doc.setFont(undefined, 'normal')
      doc.setFontSize(12)

      const { marked } = await import('marked')
      let content = problem.content || 'No content available'

      const htmlContent = marked(content)

      // Convert HTML to plain text for PDF
      const plainText = htmlContent
        .replace(/<h([1-6])[^>]*>/g, (match, level) => `\n${'#'.repeat(parseInt(level))} `)
        .replace(/<\/h[1-6]>/g, '\n')
        .replace(/<p[^>]*>/g, '\n')
        .replace(/<\/p>/g, '\n')
        .replace(/<li[^>]*>/g, '• ')
        .replace(/<\/li>/g, '\n')
        .replace(/<ul[^>]*>|<\/ul>/g, '\n')
        .replace(/<ol[^>]*>|<\/ol>/g, '\n')
        .replace(/<strong[^>]*>|<\/strong>|<b[^>]*>|<\/b>/g, '')
        .replace(/<em[^>]*>|<\/em>|<i[^>]*>|<\/i>/g, '')
        .replace(/<code[^>]*>/g, '"')
        .replace(/<\/code>/g, '"')
        .replace(/<table[^>]*>|<\/table>/g, '\n')
        .replace(/<tr[^>]*>/g, '')
        .replace(/<\/tr>/g, '\n')
        .replace(/<td[^>]*>/g, '')
        .replace(/<\/td>/g, ' | ')
        .replace(/<th[^>]*>/g, '')
        .replace(/<\/th>/g, ' | ')
        .replace(/<thead[^>]*>|<\/thead>|<tbody[^>]*>|<\/tbody>/g, '')
        .replace(/<[^>]*>/g, '')
        .replace(/&quot;/g, '"')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&[^;]+;/g, ' ')
        .replace(/\n{3,}/g, '\n\n')
        .trim()

      const lines = plainText.split('\n')
      let yPosition = 20

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim()

        if (yPosition > 270) {
          doc.addPage()
          yPosition = 20
        }

        if (line === '') {
          yPosition += 3
          continue
        }

        if (line.startsWith('#')) {
          const headerLevel = (line.match(/^#+/) || [''])[0].length
          const headerText = line.replace(/^#+\s*/, '')

          yPosition += headerLevel === 1 ? 8 : 6
          doc.setFont(undefined, 'bold')
          doc.setFontSize(headerLevel === 1 ? 14 : 12)
          doc.text(headerText, 20, yPosition)
          doc.setFont(undefined, 'normal')
          doc.setFontSize(10)
          yPosition += 4
        } else {
          const wrappedLines = doc.splitTextToSize(line, 170)
          for (const wrappedLine of wrappedLines) {
            if (yPosition > 270) {
              doc.addPage()
              yPosition = 20
            }
            doc.text(wrappedLine, 20, yPosition)
            yPosition += 5
          }
        }
      }

      const pageCount = doc.internal.pages.length - 1
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i)
        doc.setFontSize(8)
        doc.setFont(undefined, 'italic')
        doc.text(`Page ${i} of ${pageCount}`, 185, 285)
      }

      const filename = `${problem.number}-${problem.title.replace(/[^a-zA-Z0-9]/g, '-')}.pdf`
      doc.save(filename)
    } catch (err) {
      console.error('PDF generation failed:', err)
      alert('Failed to generate PDF. Please try again.')
    } finally {
      setIsGeneratingPDF(false)
    }
  }

  const handleRevealSolution = async () => {
    if (!user) {
      alert('You must be logged in to view solutions.')
      return
    }

    try {
      // Call API to record solution view
      await problemsApi.viewSolution(problem.id)
      setSolutionRevealed(true)
      setShowSolutionWarning(false)
    } catch (error) {
      console.error('Failed to record solution view:', error)
      // Still reveal solution even if API call fails
      setSolutionRevealed(true)
      setShowSolutionWarning(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Problem Header */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <span className="text-lg font-mono text-blue-600 bg-blue-50 px-3 py-1 rounded-lg">
                {problem.number}
              </span>
              <div className="flex items-center space-x-1">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600">{problem.source} {problem.year}</span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={handleSave}>
                {isSaved ? (
                  <BookmarkCheck className="h-4 w-4 mr-1 text-blue-600" />
                ) : (
                  <Bookmark className="h-4 w-4 mr-1" />
                )}
                {isSaved ? 'Saved' : 'Save'}
              </Button>
              <Button variant="outline" size="sm" onClick={handleShare}>
                {shareText === 'Copied!' ? (
                  <Check className="h-4 w-4 mr-1 text-green-600" />
                ) : (
                  <Share2 className="h-4 w-4 mr-1" />
                )}
                {shareText}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownloadPDF}
                disabled={isGeneratingPDF}
              >
                <Download className={`h-4 w-4 mr-1 ${isGeneratingPDF ? 'animate-spin' : ''}`} />
                {isGeneratingPDF ? 'Generating...' : 'PDF'}
              </Button>
            </div>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {problem.title}
          </h1>

          <div className="flex items-center space-x-6 text-sm text-gray-600">
            <div className="flex items-center space-x-1">
              <span>Difficulty:</span>
              <div className="flex items-center">
                {Array.from({ length: 5 }, (_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < problem.difficulty ? "text-yellow-400" : "text-gray-300"
                    }`}
                    fill={i < problem.difficulty ? "currentColor" : "none"}
                  />
                ))}
              </div>
            </div>
            <div className="flex items-center space-x-1">
              <Eye className="h-4 w-4" />
              <span>{problem.stats?.solveCount || 0} solved</span>
            </div>
            <div className="flex items-center space-x-1">
              <MessageCircle className="h-4 w-4" />
              <span>{(userSolution ? 1 : 0) + solutions.length} solutions</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mt-4">
            {problem.tags?.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm"
              >
                <Tag className="h-3 w-3 mr-1" />
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Tabbed Content */}
        <div className="bg-white rounded-lg shadow-sm border">
          <Tabs.Root defaultValue="problem" className="w-full">
            <Tabs.List className="flex border-b">
              <Tabs.Trigger
                value="problem"
                className="px-6 py-4 font-medium text-gray-600 border-b-2 border-transparent data-[state=active]:text-blue-600 data-[state=active]:border-blue-600"
              >
                Problem
              </Tabs.Trigger>
              <Tabs.Trigger
                value="submit"
                className="px-6 py-4 font-medium text-gray-600 border-b-2 border-transparent data-[state=active]:text-blue-600 data-[state=active]:border-blue-600"
              >
                Submit Solution
              </Tabs.Trigger>
              <Tabs.Trigger
                value="solutions"
                className="px-6 py-4 font-medium text-gray-600 border-b-2 border-transparent data-[state=active]:text-blue-600 data-[state=active]:border-blue-600"
              >
                Solutions ({(userSolution ? 1 : 0) + solutions.length + 1})
              </Tabs.Trigger>
            </Tabs.List>

            {/* Problem Tab */}
            <Tabs.Content value="problem" className="p-6">
              {problem.pdfUrl ? (
                <div>
                  <div className="border rounded-lg overflow-hidden bg-gray-100" style={{ height: '800px' }}>
                    <iframe
                      src={problem.pdfUrl}
                      className="w-full h-full"
                      title="Problem PDF"
                    />
                  </div>
                  <div className="mt-2 text-sm text-gray-600">
                    <a
                      href={problem.pdfUrl}
                      download
                      className="text-blue-600 hover:underline inline-flex items-center gap-1"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Download className="h-4 w-4" />
                      Download Original PDF
                    </a>
                  </div>
                </div>
              ) : (
                <div className="prose prose-lg max-w-none">
                  <MarkdownContent content={problem.content || 'Problem content not available.'} />
                </div>
              )}
            </Tabs.Content>

            {/* Submit Solution Tab */}
            <Tabs.Content value="submit" className="p-6">
              <h2 className="text-2xl font-bold mb-4">Submit Your Solution</h2>
              {!user ? (
                <div className="text-center py-12">
                  <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-8 max-w-2xl mx-auto">
                    <p className="text-gray-700 mb-6">
                      You need to be logged in to submit a solution.
                    </p>
                    <Button size="lg" onClick={() => window.location.href = '/auth/login'}>
                      Login to Submit Solution
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Your Solution
                    </label>
                    <textarea
                      value={newSolution}
                      onChange={(e) => setNewSolution(e.target.value)}
                      className="w-full h-64 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Share your analysis and solution approach... Be clear and detailed in your reasoning."
                    />
                  </div>

                  {/* File Upload Section */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Upload Files (Optional)
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                      <input
                        type="file"
                        accept="image/*,application/pdf"
                        multiple
                        onChange={handleImageSelect}
                        className="hidden"
                        id="image-upload"
                        disabled={selectedImages.length >= 5}
                      />
                      <label
                        htmlFor="image-upload"
                        className={`flex flex-col items-center justify-center cursor-pointer ${
                          selectedImages.length >= 5 ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                      >
                        <Download className="h-8 w-8 text-gray-400 mb-2" />
                        <span className="text-sm text-gray-600">
                          {selectedImages.length >= 5
                            ? 'Maximum 5 files'
                            : 'Click to upload images or PDFs of your work'}
                        </span>
                        <span className="text-xs text-gray-500 mt-1">
                          Images: max 5MB (auto-compressed to ~1MB) | PDFs: max 10MB | Total: 15MB ({selectedImages.length}/5 files)
                        </span>
                      </label>
                    </div>

                    {/* Error Message */}
                    {imageError && (
                      <div className="mt-2 text-sm text-red-600">
                        {imageError}
                      </div>
                    )}

                    {/* File Previews */}
                    {imagePreviews.length > 0 && (
                      <div className="mt-4 grid grid-cols-3 gap-4">
                        {imagePreviews.map((preview, index) => {
                          const isPDF = preview === 'PDF_PLACEHOLDER'
                          return (
                            <div key={index} className="relative group">
                              {isPDF ? (
                                <div className="w-full h-32 flex items-center justify-center bg-red-50 rounded-lg border border-red-200">
                                  <FileText className="h-12 w-12 text-red-600" />
                                </div>
                              ) : (
                                <img
                                  src={preview}
                                  alt={`Preview ${index + 1}`}
                                  className="w-full h-32 object-cover rounded-lg border"
                                />
                              )}
                              <button
                                onClick={() => handleRemoveImage(index)}
                                className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <X className="h-4 w-4" />
                              </button>
                              <div className="text-xs text-gray-500 mt-1 truncate">
                                {selectedImages[index].name} ({(selectedImages[index].size / 1024).toFixed(0)}KB)
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-800">
                      <strong>Tips for a good solution:</strong>
                    </p>
                    <ul className="text-sm text-blue-800 mt-2 list-disc list-inside space-y-1">
                      <li>Explain your linguistic reasoning clearly</li>
                      <li>Show all your work and pattern analysis</li>
                      <li>Use tables or formatting to organize your answer</li>
                      <li>Upload photos/PDFs of handwritten work or diagrams (images auto-compressed)</li>
                      <li>Cite any assumptions or rules you discovered</li>
                    </ul>
                  </div>
                  <div className="flex justify-end space-x-3">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setNewSolution('')
                        setSelectedImages([])
                        setImagePreviews([])
                        setImageError('')
                      }}
                    >
                      Clear
                    </Button>
                    <Button
                      onClick={handleSubmitSolution}
                      disabled={!newSolution.trim()}
                    >
                      <Send className="h-4 w-4 mr-1" />
                      Submit Solution
                    </Button>
                  </div>
                </div>
              )}
            </Tabs.Content>

            {/* Solutions Tab (merged official + community) */}
            <Tabs.Content value="solutions" className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold">Solutions</h3>
                <div className="flex items-center space-x-3">
                  <Button
                    variant={showOfficialSolution ? "default" : "outline"}
                    size="sm"
                    onClick={() => setShowOfficialSolution(!showOfficialSolution)}
                  >
                    {showOfficialSolution ? "Show Community" : "Show Official"}
                  </Button>
                  {!showOfficialSolution && (
                    <select
                      className="border rounded px-3 py-2 text-sm"
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                    >
                      <option value="most-upvoted">Most Upvoted</option>
                      <option value="newest">Newest</option>
                      <option value="oldest">Oldest</option>
                    </select>
                  )}
                </div>
              </div>

              {showOfficialSolution ? (
                // Official Solution
                <>
                  {!solutionRevealed ? (
                    <div className="text-center py-12">
                      <div className="bg-red-50 border-2 border-red-200 rounded-lg p-8 max-w-2xl mx-auto">
                        <AlertTriangle className="h-16 w-16 text-red-600 mx-auto mb-4" />
                        <h3 className="text-2xl font-bold text-gray-900 mb-4">
                          ⚠️ Warning: Viewing Official Solution
                        </h3>
                        <p className="text-gray-700 mb-4">
                          Once you view the official solution, you will <strong>NOT</strong> be able to gain rating from solving this problem.
                        </p>
                        <p className="text-gray-700 mb-6">
                          Are you sure you want to continue? Make sure you&apos;ve attempted the problem first!
                        </p>
                        <Button
                          onClick={handleRevealSolution}
                          size="lg"
                          className="bg-red-600 hover:bg-red-700 text-white"
                        >
                          I Understand, Show Solution
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                        <p className="text-sm text-yellow-800">
                          ⚠️ You have viewed this solution. You cannot gain rating from this problem.
                        </p>
                      </div>

                      {problem.solutionPdfUrl ? (
                        <div>
                          <div className="border rounded-lg overflow-hidden bg-gray-100" style={{ height: '800px' }}>
                            <iframe
                              src={problem.solutionPdfUrl}
                              className="w-full h-full"
                              title="Official Solution PDF"
                            />
                          </div>
                          <div className="mt-2 text-sm text-gray-600">
                            <a
                              href={problem.solutionPdfUrl}
                              download
                              className="text-blue-600 hover:underline inline-flex items-center gap-1"
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <Download className="h-4 w-4" />
                              Download Solution PDF
                            </a>
                          </div>
                        </div>
                      ) : (
                        <div className="prose prose-lg max-w-none">
                          <MarkdownContent content={problem.officialSolution || 'Official solution not yet available.'} />
                        </div>
                      )}
                    </>
                  )}
                </>
              ) : (
                // Community Solutions
                <>

              <div className="space-y-6">
                {/* User's own solution first */}
                {userSolution && (
                  <div className="border-2 border-green-200 bg-green-50 rounded-lg p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                          {userSolution.user.username.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-medium flex items-center space-x-2">
                            <span>{userSolution.user.username}</span>
                            <span className="bg-green-600 text-white px-2 py-1 rounded text-xs font-semibold">
                              Your Solution
                            </span>
                          </div>
                          <div className="text-sm text-gray-500">
                            Rating: {userSolution.user.rating} • {new Date(userSolution.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="prose max-w-none">
                      <div className="text-gray-700 whitespace-pre-wrap">
                        {userSolution.content}
                      </div>
                    </div>

                    {/* Attachments */}
                    {userSolution.attachments && Array.isArray(userSolution.attachments) && userSolution.attachments.length > 0 && (
                      <div className="mt-4 pt-4 border-t">
                        <h4 className="text-sm font-semibold text-gray-700 mb-3">Attachments ({userSolution.attachments.length})</h4>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          {userSolution.attachments.map((attachment: any, index: number) => (
                            <div key={index} className="relative group">
                              {attachment.type === 'pdf' ? (
                                <a
                                  href={attachment.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex flex-col items-center justify-center h-32 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
                                >
                                  <FileText className="h-12 w-12 text-red-600 mb-2" />
                                  <span className="text-xs text-gray-600 text-center px-2 truncate w-full">{attachment.filename}</span>
                                </a>
                              ) : (
                                <a href={attachment.url} target="_blank" rel="noopener noreferrer">
                                  <img
                                    src={attachment.url}
                                    alt={attachment.filename}
                                    className="w-full h-32 object-cover rounded-lg border hover:opacity-90 transition-opacity cursor-pointer"
                                  />
                                </a>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Loading state */}
                {isLoadingSolutions && (
                  <div className="text-center py-8">
                    <div className="text-gray-500">Loading solutions...</div>
                  </div>
                )}

                {/* Other users' solutions */}
                {!isLoadingSolutions && getSortedSolutions().map((solution) => (
                  <div key={solution.id} className="border rounded-lg p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                          {solution.user.username.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-medium">{solution.user.username}</div>
                          <div className="text-sm text-gray-500">
                            Rating: {solution.user.rating} • {new Date(solution.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        {/* Voting buttons */}
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleVote(solution.id, 1)}
                            className={solution.userVote === 1 ? 'text-green-600 bg-green-50 hover:bg-green-100' : 'hover:bg-gray-100'}
                          >
                            <ThumbsUp className="h-4 w-4" />
                          </Button>
                          <span className="text-sm font-medium min-w-[2rem] text-center">
                            {solution.votes || 0}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleVote(solution.id, -1)}
                            className={solution.userVote === -1 ? 'text-red-600 bg-red-50 hover:bg-red-100' : 'hover:bg-gray-100'}
                          >
                            <ThumbsDown className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div className="prose max-w-none">
                      <div className="text-gray-700 whitespace-pre-wrap">
                        {solution.content}
                      </div>
                    </div>

                    {/* Attachments */}
                    {solution.attachments && Array.isArray(solution.attachments) && solution.attachments.length > 0 && (
                      <div className="mt-4 pt-4 border-t">
                        <h4 className="text-sm font-semibold text-gray-700 mb-3">Attachments ({solution.attachments.length})</h4>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          {solution.attachments.map((attachment: any, index: number) => (
                            <div key={index} className="relative group">
                              {attachment.type === 'pdf' ? (
                                <a
                                  href={attachment.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex flex-col items-center justify-center h-32 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
                                >
                                  <FileText className="h-12 w-12 text-red-600 mb-2" />
                                  <span className="text-xs text-gray-600 text-center px-2 truncate w-full">{attachment.filename}</span>
                                </a>
                              ) : (
                                <a href={attachment.url} target="_blank" rel="noopener noreferrer">
                                  <img
                                    src={attachment.url}
                                    alt={attachment.filename}
                                    className="w-full h-32 object-cover rounded-lg border hover:opacity-90 transition-opacity cursor-pointer"
                                  />
                                </a>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {/* Empty state */}
                {!isLoadingSolutions && !userSolution && solutions.length === 0 && (
                  <div className="text-center py-12">
                    <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <div className="text-gray-500">No solutions yet. Be the first to submit one!</div>
                  </div>
                )}
              </div>
                </>
              )}
            </Tabs.Content>
          </Tabs.Root>
        </div>
      </div>
    </div>
  )
}
