'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { useState, useEffect, Suspense } from 'react'
import Header from "@/components/Header"
import ProblemCard from "@/components/ProblemCard"
import SearchBar from "@/components/SearchBar"
import { Button } from "@/components/ui/button"
import { Filter, Grid, List, Star, Users } from "lucide-react"
import { useProblems } from '@/hooks/useProblems'

// Static mock problems for fallback
const mockProblems = [
  {
    id: "1",
    number: "LH-001",
    title: "Ubykh Verb Morphology",
    source: "IOL",
    year: 2007,
    difficulty: 4,
    solveCount: 234,
    tags: ["morphology", "verbs", "caucasian"]
  },
  {
    id: "2", 
    number: "LH-002",
    title: "Pirahã Number System",
    source: "APLO",
    year: 2008,
    difficulty: 2,
    solveCount: 892,
    tags: ["numbers", "counting", "amazonian"]
  },
  {
    id: "3",
    number: "LH-003", 
    title: "Lardil Phonological Processes",
    source: "NACLO",
    year: 2009,
    difficulty: 5,
    solveCount: 156,
    tags: ["phonology", "australian", "sound-changes"]
  },
  {
    id: "4",
    number: "LH-004",
    title: "Swahili Noun Classes",
    source: "IOL",
    year: 2010,
    difficulty: 3,
    solveCount: 567,
    tags: ["morphology", "bantu", "agreement"]
  },
  {
    id: "5",
    number: "LH-005",
    title: "Georgian Script Evolution",
    source: "UKLO",
    year: 2011,
    difficulty: 2,
    solveCount: 423,
    tags: ["writing-systems", "historical", "kartvelian"]
  },
  {
    id: "6",
    number: "LH-006",
    title: "Japanese Honorific System",
    source: "APLO",
    year: 2012,
    difficulty: 4,
    solveCount: 298,
    tags: ["pragmatics", "honorifics", "japanese"]
  }
]

// Load static problems from JSON
import problemsData from '@/data/problems.json'

function ProblemsPageContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [filters, setFilters] = useState<{
    search: string
    sources: string[]
    yearFrom: string
    yearTo: string
    difficulties: number[]
    topics: string[]
    status: string
  }>({
    search: searchParams.get('search') || '',
    sources: ['IOL', 'APLO', 'NACLO', 'UKLO'],
    yearFrom: '',
    yearTo: '',
    difficulties: [],
    topics: [],
    status: 'all'
  })
  const [sortBy, setSortBy] = useState('difficulty')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list')
  const [showFilters, setShowFilters] = useState(false)
  
  // Check for tag filter in URL
  useEffect(() => {
    const tagParam = searchParams.get('tags')
    if (tagParam) {
      setFilters(prev => ({ ...prev, topics: [tagParam] }))
    }
  }, [searchParams])

  // Use static data for now since API might be slow
  const staticProblems = problemsData.problems

  // Apply client-side filtering
  const filteredProblems = staticProblems.filter(problem => {
    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      if (!problem.title.toLowerCase().includes(searchLower) &&
          !problem.number.toLowerCase().includes(searchLower) &&
          !problem.content.toLowerCase().includes(searchLower)) {
        return false
      }
    }

    // Source filter
    if (filters.sources.length > 0 && filters.sources.length < 4) {
      if (!filters.sources.includes(problem.source)) {
        return false
      }
    }

    // Difficulty filter
    if (filters.difficulties.length > 0) {
      if (!filters.difficulties.includes(problem.difficulty)) {
        return false
      }
    }

    // Topic filter
    if (filters.topics.length > 0) {
      const problemTags = problem.tags.map(t => t.toLowerCase())
      const hasMatchingTag = filters.topics.some(topic => 
        problemTags.some(tag => tag.includes(topic.toLowerCase()))
      )
      if (!hasMatchingTag) {
        return false
      }
    }

    // Year filter
    if (filters.yearFrom && problem.year < parseInt(filters.yearFrom)) {
      return false
    }
    if (filters.yearTo && problem.year > parseInt(filters.yearTo)) {
      return false
    }

    return true
  })

  // Sort problems
  const sortedProblems = [...filteredProblems].sort((a, b) => {
    switch (sortBy) {
      case 'difficulty':
        return a.difficulty - b.difficulty
      case 'year-desc':
        return b.year - a.year
      case 'rating':
        return b.rating - a.rating
      default:
        return a.number.localeCompare(b.number)
    }
  })

  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const handleSourceToggle = (source: string) => {
    setFilters(prev => ({
      ...prev,
      sources: prev.sources.includes(source)
        ? prev.sources.filter(s => s !== source)
        : [...prev.sources, source]
    }))
  }

  const handleDifficultyToggle = (difficulty: number) => {
    setFilters(prev => ({
      ...prev,
      difficulties: prev.difficulties.includes(difficulty)
        ? prev.difficulties.filter(d => d !== difficulty)
        : [...prev.difficulties, difficulty]
    }))
  }

  const handleTopicToggle = (topic: string) => {
    setFilters(prev => ({
      ...prev,
      topics: prev.topics.includes(topic)
        ? prev.topics.filter(t => t !== topic)
        : [...prev.topics, topic]
    }))
  }

  const resetFilters = () => {
    setFilters({
      search: '',
      sources: ['IOL', 'APLO', 'NACLO', 'UKLO'],
      yearFrom: '',
      yearTo: '',
      difficulties: [],
      topics: [],
      status: 'all'
    })
  }

  const ProblemListItem = ({ problem }: { problem: any }) => (
    <div 
      className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => router.push(`/problems/${problem.number}`)}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <span className="text-sm font-mono text-blue-600 bg-blue-50 px-2 py-1 rounded">{problem.number}</span>
            <span className="text-sm text-gray-500">{problem.source} {problem.year}</span>
            <div className="flex items-center space-x-1">
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
          <h3 className="font-semibold text-gray-900 mb-1">{problem.title}</h3>
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <div className="flex items-center space-x-1">
              <Users className="h-4 w-4" />
              <span>{problem.solveCount} solved</span>
            </div>
            <div className="flex space-x-2">
              {problem.tags.slice(0, 3).map((tag: string) => (
                <span key={tag} className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="flex">
        {/* Filters Sidebar - Desktop */}
        <div className="hidden lg:block w-64 bg-white border-r p-6 min-h-screen">
          <div className="sticky top-6">
            <h2 className="text-lg font-semibold mb-6">Filters</h2>
            
            {/* Sources */}
            <div className="mb-6">
              <h3 className="font-medium mb-3">Source</h3>
              <div className="space-y-2">
                {["IOL", "APLO", "NACLO", "UKLO"].map((source) => (
                  <label key={source} className="flex items-center">
                    <input 
                      type="checkbox" 
                      className="rounded mr-2" 
                      checked={filters.sources.includes(source)}
                      onChange={() => handleSourceToggle(source)}
                    />
                    <span className="text-sm">{source}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Year Range */}
            <div className="mb-6">
              <h3 className="font-medium mb-3">Year Range</h3>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  placeholder="2000"
                  value={filters.yearFrom}
                  onChange={(e) => handleFilterChange('yearFrom', e.target.value)}
                  className="w-20 px-2 py-1 border rounded text-sm"
                />
                <span>-</span>
                <input
                  type="number"
                  placeholder="2024"
                  value={filters.yearTo}
                  onChange={(e) => handleFilterChange('yearTo', e.target.value)}
                  className="w-20 px-2 py-1 border rounded text-sm"
                />
              </div>
            </div>

            {/* Difficulty */}
            <div className="mb-6">
              <h3 className="font-medium mb-3">Difficulty</h3>
              <div className="space-y-2">
                {[1, 2, 3, 4, 5].map((stars) => (
                  <label key={stars} className="flex items-center">
                    <input 
                      type="checkbox" 
                      className="rounded mr-2" 
                      checked={filters.difficulties.includes(stars)}
                      onChange={() => handleDifficultyToggle(stars)}
                    />
                    <div className="flex items-center space-x-1">
                      {Array.from({ length: stars }, (_, i) => (
                        <Star key={i} className="h-4 w-4 text-yellow-400" fill="currentColor" />
                      ))}
                      {Array.from({ length: 5 - stars }, (_, i) => (
                        <Star key={i + stars} className="h-4 w-4 text-gray-300" fill="none" />
                      ))}
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Tags/Topics */}
            <div className="mb-6">
              <h3 className="font-medium mb-3">Topics</h3>
              <div className="max-h-60 overflow-y-auto space-y-2">
                {[
                  "morphology", "phonology", "syntax", "semantics", "pragmatics",
                  "writing-systems", "phonetics", "historical", "ipa", "english",
                  "tutorial", "plurals", "trees", "grammar", "language-families",
                  "romance", "transcription", "historical-linguistics", 
                  "african-languages", "noun-classes", "greek"
                ].map((tag) => (
                  <label key={tag} className="flex items-center">
                    <input 
                      type="checkbox" 
                      className="rounded mr-2" 
                      checked={filters.topics.includes(tag)}
                      onChange={() => handleTopicToggle(tag)}
                    />
                    <span className="text-sm capitalize">{tag.replace('-', ' ')}</span>
                  </label>
                ))}
              </div>
            </div>

            <Button variant="outline" size="sm" className="w-full" onClick={resetFilters}>
              Reset Filters
            </Button>
          </div>
        </div>

        {/* Mobile Filter Button */}
        <div className="lg:hidden fixed bottom-4 right-4 z-50">
          <Button onClick={() => setShowFilters(!showFilters)} className="rounded-full shadow-lg">
            <Filter className="h-5 w-5" />
          </Button>
        </div>

        {/* Mobile Filters Modal */}
        {showFilters && (
          <div className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40" onClick={() => setShowFilters(false)}>
            <div className="absolute right-0 top-0 h-full w-80 bg-white p-6 overflow-y-auto" onClick={e => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold">Filters</h2>
                <button onClick={() => setShowFilters(false)} className="text-gray-500">✕</button>
              </div>
              
              {/* Same filter content as desktop */}
              {/* Sources */}
              <div className="mb-6">
                <h3 className="font-medium mb-3">Source</h3>
                <div className="space-y-2">
                  {["IOL", "APLO", "NACLO", "UKLO"].map((source) => (
                    <label key={source} className="flex items-center">
                      <input 
                        type="checkbox" 
                        className="rounded mr-2" 
                        checked={filters.sources.includes(source)}
                        onChange={() => handleSourceToggle(source)}
                      />
                      <span className="text-sm">{source}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Difficulty */}
              <div className="mb-6">
                <h3 className="font-medium mb-3">Difficulty</h3>
                <div className="space-y-2">
                  {[1, 2, 3, 4, 5].map((stars) => (
                    <label key={stars} className="flex items-center">
                      <input 
                        type="checkbox" 
                        className="rounded mr-2" 
                        checked={filters.difficulties.includes(stars)}
                        onChange={() => handleDifficultyToggle(stars)}
                      />
                      <div className="flex items-center space-x-1">
                        {Array.from({ length: stars }, (_, i) => (
                          <Star key={i} className="h-4 w-4 text-yellow-400" fill="currentColor" />
                        ))}
                        {Array.from({ length: 5 - stars }, (_, i) => (
                          <Star key={i + stars} className="h-4 w-4 text-gray-300" fill="none" />
                        ))}
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <Button variant="outline" size="sm" className="w-full" onClick={resetFilters}>
                Reset Filters
              </Button>
            </div>
          </div>
        )}

        {/* Problems List */}
        <div className="flex-1 p-6">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-4">
                <h1 className="text-3xl font-bold">Problem Bank</h1>
                <div className="flex items-center space-x-4">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-3 py-2 border rounded-lg"
                  >
                    <option value="number">Problem Number</option>
                    <option value="difficulty">Difficulty</option>
                    <option value="year-desc">Year (Newest)</option>
                    <option value="rating">Rating</option>
                  </select>
                  
                  <div className="flex border rounded-lg">
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-2 ${viewMode === 'list' ? 'bg-gray-100' : ''}`}
                    >
                      <List className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-2 ${viewMode === 'grid' ? 'bg-gray-100' : ''}`}
                    >
                      <Grid className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Search Bar */}
              <SearchBar 
                placeholder="Search problems..."
                value={filters.search}
                onChange={(value) => handleFilterChange('search', value)}
              />
            </div>

            {/* Active Filters Display */}
            {(filters.difficulties.length > 0 || filters.topics.length > 0 || 
              (filters.sources.length > 0 && filters.sources.length < 4)) && (
              <div className="mb-4 flex flex-wrap gap-2">
                {filters.difficulties.map(d => (
                  <span key={d} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                    {d} star{d > 1 ? 's' : ''}
                    <button onClick={() => handleDifficultyToggle(d)} className="ml-2">×</button>
                  </span>
                ))}
                {filters.topics.map(t => (
                  <span key={t} className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                    {t}
                    <button onClick={() => handleTopicToggle(t)} className="ml-2">×</button>
                  </span>
                ))}
                {filters.sources.length > 0 && filters.sources.length < 4 && filters.sources.map(s => (
                  <span key={s} className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm">
                    {s}
                    <button onClick={() => handleSourceToggle(s)} className="ml-2">×</button>
                  </span>
                ))}
              </div>
            )}

            {/* Results Count */}
            <div className="text-gray-600 mb-4">
              Found {sortedProblems.length} problem{sortedProblems.length !== 1 ? 's' : ''}
            </div>

            {/* Problems Grid/List */}
            {sortedProblems.length > 0 ? (
              viewMode === 'grid' ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {sortedProblems.map((problem) => (
                    <ProblemCard key={problem.id} {...problem} />
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {sortedProblems.map((problem) => (
                    <ProblemListItem key={problem.id} problem={problem} />
                  ))}
                </div>
              )
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No problems found matching your filters.</p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={resetFilters}
                >
                  Reset Filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ProblemsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center h-96">
          <div className="text-gray-500">Loading problems...</div>
        </div>
      </div>
    }>
      <ProblemsPageContent />
    </Suspense>
  )
}