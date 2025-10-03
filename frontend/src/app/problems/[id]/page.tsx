'use client'

import { useState, useEffect, use } from 'react'
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
  Copy,
  Send,
  X,
  Trash2
} from "lucide-react"

// Markdown content component
function MarkdownContent({ content }: { content: string }) {
  const [htmlContent, setHtmlContent] = useState('')
  
  useEffect(() => {
    const processMarkdown = async () => {
      try {
        const { marked } = await import('marked')
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

export default function ProblemDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { user } = useAuth()
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
  const [problem, setProblem] = useState(null)
  const [isLoadingProblem, setIsLoadingProblem] = useState(true)

  // Load problem and solutions
  useEffect(() => {
    const savedProblems = JSON.parse(localStorage.getItem('savedProblems') || '[]')
    setIsSaved(savedProblems.includes(id))

    // Load problem and solutions
    loadProblem()
  }, [id])

  // Separate effect for loading solutions - depends on user state
  useEffect(() => {
    loadSolutions()
  }, [id, sortBy, user])
  
  const loadProblem = async () => {
    try {
      setIsLoadingProblem(true)
      const response = await problemsApi.getById(id)
      setProblem(response.data)
    } catch (error) {
      console.error('Failed to load problem:', error)
    } finally {
      setIsLoadingProblem(false)
    }
  }
  
  const loadSolutions = async () => {
    try {
      setIsLoadingSolutions(true)
      const sortMapping = {
        'most-upvoted': 'votes',
        'newest': 'newest',
        'oldest': 'oldest'
      }

      // Use the problem ID from the loaded problem data, fall back to URL id for initial load
      const problemId = problem?.id || id
      console.log('🔍 Loading solutions for problem:', problemId, 'User:', user?.username || 'Not logged in')

      const response = await solutionsApi.getByProblem(problemId, sortMapping[sortBy])
      const { solutions: loadedSolutions } = response.data
      console.log('📦 Loaded solutions:', loadedSolutions.length, 'solutions')

      // Transform solutions to ensure votes field exists
      const transformedSolutions = loadedSolutions.map((sol: any) => ({
        ...sol,
        votes: sol.voteScore || 0
      }))

      if (user) {
        // Separate user's own solution from others
        const userSol = transformedSolutions.find(sol => sol.user.id === user.id)
        const otherSolutions = transformedSolutions.filter(sol => sol.user.id !== user.id)

        console.log('👤 User solution:', userSol ? 'Found' : 'Not found', 'Other solutions:', otherSolutions.length)
        console.log('👤 User ID:', user.id, 'Solution user IDs:', transformedSolutions.map(s => s.user.id))

        setUserSolution(userSol || null)
        setSolutions(otherSolutions)
      } else {
        console.log('❌ No user logged in, showing all solutions')
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
    
    // Save to localStorage for now (TODO: implement backend integration)
    const savedProblems = JSON.parse(localStorage.getItem('savedProblems') || '[]')
    
    if (newSavedState) {
      // Add to saved problems if not already there
      if (!savedProblems.includes(id)) {
        savedProblems.push(id)
        localStorage.setItem('savedProblems', JSON.stringify(savedProblems))
      }
      console.log('Problem saved:', id)
    } else {
      // Remove from saved problems
      const updatedProblems = savedProblems.filter((problemId: string) => problemId !== id)
      localStorage.setItem('savedProblems', JSON.stringify(updatedProblems))
      console.log('Problem unsaved:', id)
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
      // Fallback for older browsers
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

  const handleSubmitSolution = async () => {
    if (!newSolution.trim()) return
    
    if (newSolution.trim().length < 10) {
      alert('Solution must be at least 10 characters long.')
      return
    }
    
    try {
      if (userSolution && isEditingUserSolution) {
        // Edit existing solution - we'll implement this when backend supports it
        console.log('Editing solution not implemented yet')
        return
      }
      
      // Submit new solution
      if (!problem) {
        alert('Problem not loaded yet. Please wait.')
        return
      }
      
      if (!user) {
        alert('You must be logged in to submit a solution.')
        return
      }
      
      console.log('User data:', user)
      console.log('Problem data:', problem)
      console.log('Submitting solution with data:', { problemId: problem.id, content: newSolution })
      const response = await solutionsApi.submit(problem.id, newSolution)
      const newSol = response.data.solution

      console.log('Solution submitted successfully:', newSol)

      // Reload solutions from backend to ensure consistency
      await loadSolutions()

      // Clear form
      setNewSolution('')
      setShowSolutionForm(false)
      setIsEditingUserSolution(false)
    } catch (error) {
      console.error('Failed to submit solution:', error)
      console.error('Error details:', error.response?.data)
      console.error('Status:', error.response?.status)
      
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
      // Determine new vote value
      const currentSolution = solutions.find(sol => sol.id === solutionId)
      if (!currentSolution) return
      
      const currentVote = currentSolution.userVote || 0
      let newVote = currentVote === voteType ? 0 : voteType
      
      // Call API
      const response = await solutionsApi.vote(solutionId, newVote)
      const { voteScore } = response.data
      
      // Update local state
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
    if (!problem) {
      alert('Problem not loaded yet. Please wait.')
      return
    }

    setIsGeneratingPDF(true)
    try {
      // Dynamic import to avoid SSR issues
      const { jsPDF } = await import('jspdf')
      
      const doc = new jsPDF()
      
      // Set up document properties
      doc.setProperties({
        title: `${problem.number}: ${problem.title}`,
        subject: 'LingoHub Problem',
        author: 'LingoHub',
        creator: 'LingoHub Platform'
      })

      // Start with content directly, no header info
      doc.setFont(undefined, 'normal')
      doc.setFontSize(12)
      
      // Parse and format the markdown content
      const { marked } = await import('marked')
      let content = problem.content || 'No content available'
      
      console.log('Raw problem content:', content)
      console.log('Content type:', typeof content)
      
      // Convert markdown to HTML first
      const htmlContent = marked(content)
      console.log('HTML content:', htmlContent)
      
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
        .replace(/<[^>]*>/g, '') // Remove any remaining HTML tags
        .replace(/&quot;/g, '"')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&[^;]+;/g, ' ') // Remove any other HTML entities
        .replace(/\n{3,}/g, '\n\n') // Normalize multiple line breaks
        .trim()
      
      // Split content into lines and add to PDF with proper formatting
      const lines = plainText.split('\n')
      let yPosition = 20
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim()
        
        if (yPosition > 270) { // If near bottom of page, add new page
          doc.addPage()
          yPosition = 20
        }
        
        if (line === '') {
          yPosition += 3 // Add small space for empty lines
          continue
        }
        
        // Handle headers
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
          // Regular content - wrap text if too long
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

      // Simple footer (optional)
      const pageCount = doc.internal.pages.length - 1
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i)
        doc.setFontSize(8)
        doc.setFont(undefined, 'italic')
        doc.text(`Page ${i} of ${pageCount}`, 185, 285)
      }

      // Download the PDF
      const filename = `${problem.number}-${problem.title.replace(/[^a-zA-Z0-9]/g, '-')}.pdf`
      doc.save(filename)
      
      console.log('PDF generated and downloaded:', filename)
    } catch (err) {
      console.error('PDF generation failed:', err)
      alert('Failed to generate PDF. Please try again.')
    } finally {
      setIsGeneratingPDF(false)
    }
  }

  if (isLoadingProblem) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <div className="text-gray-500">Loading problem...</div>
          </div>
        </div>
      </div>
    )
  }

  if (!problem) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <div className="text-red-500">Problem not found</div>
          </div>
        </div>
      </div>
    )
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
              <span>{problem.solveCount || 0} solved</span>
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
                value="official"
                className="px-6 py-4 font-medium text-gray-600 border-b-2 border-transparent data-[state=active]:text-blue-600 data-[state=active]:border-blue-600"
              >
                Official Solution
              </Tabs.Trigger>
              <Tabs.Trigger
                value="solutions"
                className="px-6 py-4 font-medium text-gray-600 border-b-2 border-transparent data-[state=active]:text-blue-600 data-[state=active]:border-blue-600"
              >
                User Solutions ({(userSolution ? 1 : 0) + solutions.length})
              </Tabs.Trigger>
            </Tabs.List>

            {/* Problem Tab */}
            <Tabs.Content value="problem" className="p-6">
              <div className="prose prose-lg max-w-none">
                <MarkdownContent content={problem.content || 'Problem content not available.'} />
              </div>
            </Tabs.Content>

            {/* Official Solution Tab */}
            <Tabs.Content value="official" className="p-6">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-yellow-800">
                  ⚠️ Official solutions contain spoilers. Make sure you've attempted the problem first!
                </p>
              </div>
              
              <Button 
                variant="outline" 
                className="mb-6"
                onClick={() => {
                  // Toggle solution visibility
                }}
              >
                Show Official Solution
              </Button>
            </Tabs.Content>

            {/* User Solutions Tab */}
            <Tabs.Content value="solutions" className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold">Community Solutions</h3>
                <div className="flex items-center space-x-3">
                  <select 
                    className="border rounded px-3 py-2 text-sm"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                  >
                    <option value="most-upvoted">Most Upvoted</option>
                    <option value="newest">Newest</option>
                    <option value="oldest">Oldest</option>
                  </select>
                  {!user ? (
                    <Button size="sm" onClick={() => window.location.href = '/auth/login'}>
                      Login to Submit Solution
                    </Button>
                  ) : userSolution ? (
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => {
                          setNewSolution(userSolution.content)
                          setIsEditingUserSolution(true)
                          setShowSolutionForm(true)
                        }}
                      >
                        Edit Your Solution
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={handleDeleteSolution}
                        className="text-red-600 hover:text-red-700 hover:border-red-300"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  ) : (
                    <Button size="sm" onClick={() => setShowSolutionForm(true)}>
                      Submit Solution
                    </Button>
                  )}
                </div>
              </div>

              {/* Solution Submission Form */}
              {showSolutionForm && (
                <div className="border rounded-lg p-6 mb-6 bg-blue-50">
                  <h4 className="text-lg font-semibold mb-4">
                    {isEditingUserSolution ? 'Edit Your Solution' : 'Submit Your Solution'}
                  </h4>
                  <textarea
                    value={newSolution}
                    onChange={(e) => setNewSolution(e.target.value)}
                    placeholder="Share your analysis and solution approach..."
                    className="w-full h-32 p-3 border rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <div className="flex items-center justify-end space-x-3 mt-4">
                    <Button variant="outline" size="sm" onClick={() => {
                      setShowSolutionForm(false)
                      setIsEditingUserSolution(false)
                      setNewSolution('')
                    }}>
                      <X className="h-4 w-4 mr-1" />
                      Cancel
                    </Button>
                    <Button 
                      size="sm" 
                      onClick={handleSubmitSolution}
                      disabled={!newSolution.trim()}
                    >
                      <Send className="h-4 w-4 mr-1" />
                      {isEditingUserSolution ? 'Update' : 'Submit'}
                    </Button>
                  </div>
                </div>
              )}

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
            </Tabs.Content>
          </Tabs.Root>
        </div>
      </div>
    </div>
  )
}