'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Header from "@/components/Header"
import ProblemCard from "@/components/ProblemCard"
import { Button } from "@/components/ui/button"
import { Bookmark, BookmarkX, Filter } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"

// Mock problem data - in real app this would come from API
const mockProblemsData = [
  {
    id: "cme6g4z12000h13voftsl1t66",
    number: "LH-001",
    title: "Ubykh Verb Morphology",
    source: "IOL",
    year: 2007,
    difficulty: 4,
    solveCount: 234,
    tags: ["morphology", "verbs", "caucasian"]
  },
  {
    id: "cme6g4z19000i13vop4hpc884",
    number: "LH-002",
    title: "Pirahã Number System",
    source: "APLO",
    year: 2008,
    difficulty: 2,
    solveCount: 892,
    tags: ["numbers", "counting", "amazonian"]
  },
  {
    id: "cme6g4z1d000j13voc29jvjhg",
    number: "LH-003",
    title: "Lardil Phonological Processes",
    source: "NACLO",
    year: 2009,
    difficulty: 5,
    solveCount: 156,
    tags: ["phonology", "australian", "sound-changes"]
  },
  {
    id: "cme6g4z1g000k13vorpzw03jd",
    number: "LH-004",
    title: "Swahili Noun Classes",
    source: "IOL",
    year: 2010,
    difficulty: 3,
    solveCount: 567,
    tags: ["morphology", "bantu", "agreement"]
  },
  {
    id: "cme6g4z1k000l13vocdwrnfwv",
    number: "LH-005",
    title: "Georgian Script Evolution",
    source: "UKLO",
    year: 2011,
    difficulty: 2,
    solveCount: 423,
    tags: ["writing-systems", "historical", "kartvelian"]
  },
  {
    id: "cme6g4z1o000m13vor6gqehnk",
    number: "LH-006",
    title: "Japanese Honorific System",
    source: "APLO",
    year: 2012,
    difficulty: 4,
    solveCount: 298,
    tags: ["pragmatics", "honorifics", "japanese"]
  }
]

export default function SavedProblemsPage() {
  const router = useRouter()
  const { user, isLoading } = useAuth()
  const [savedProblemIds, setSavedProblemIds] = useState<string[]>([])
  const [savedProblems, setSavedProblems] = useState<any[]>([])

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!isLoading && !user) {
      router.push('/auth/login')
      return
    }

    // Load saved problems from localStorage
    const saved = JSON.parse(localStorage.getItem('savedProblems') || '[]')
    setSavedProblemIds(saved)
    
    // Filter mock data to show only saved problems
    const saved_problems = mockProblemsData.filter(problem => saved.includes(problem.id))
    setSavedProblems(saved_problems)
  }, [user, isLoading, router])

  const handleRemoveSaved = (problemId: string) => {
    const updatedSaved = savedProblemIds.filter(id => id !== problemId)
    setSavedProblemIds(updatedSaved)
    localStorage.setItem('savedProblems', JSON.stringify(updatedSaved))
    
    // Update displayed problems
    const updatedProblems = savedProblems.filter(problem => problem.id !== problemId)
    setSavedProblems(updatedProblems)
  }

  const clearAllSaved = () => {
    setSavedProblemIds([])
    setSavedProblems([])
    localStorage.removeItem('savedProblems')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-64 mb-4"></div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-48 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return null // Will redirect to login
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <Bookmark className="h-8 w-8 mr-3 text-blue-600" />
                Saved Problems
              </h1>
              <p className="text-gray-600 mt-2">
                {savedProblems.length} problem{savedProblems.length !== 1 ? 's' : ''} saved
              </p>
            </div>
            {savedProblems.length > 0 && (
              <Button 
                variant="outline" 
                onClick={clearAllSaved}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <BookmarkX className="h-4 w-4 mr-2" />
                Clear All
              </Button>
            )}
          </div>
        </div>

        {savedProblems.length === 0 ? (
          <div className="text-center py-16">
            <Bookmark className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-600 mb-2">No Saved Problems</h2>
            <p className="text-gray-500 mb-6">
              Save problems you want to revisit later by clicking the bookmark icon.
            </p>
            <Button onClick={() => router.push('/problems')}>
              Browse Problems
            </Button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedProblems.map((problem) => (
              <div key={problem.id} className="relative">
                <ProblemCard {...problem} />
                <button
                  onClick={() => handleRemoveSaved(problem.id)}
                  className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-sm hover:bg-red-50 transition-colors"
                  title="Remove from saved"
                >
                  <BookmarkX className="h-4 w-4 text-red-600" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}