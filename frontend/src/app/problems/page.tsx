'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { useState, useEffect, Suspense } from 'react'
import Header from "@/components/Header"
import ProblemCard from "@/components/ProblemCard"
import ProblemTableRow from "@/components/ProblemTableRow"
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
  const [page, setPage] = useState(1)
  const limit = 24 // Problems per page

  // Check for tag filter in URL
  useEffect(() => {
    const tagParam = searchParams.get('tags')
    if (tagParam) {
      setFilters(prev => ({ ...prev, topics: [tagParam] }))
    }
  }, [searchParams])

  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1)
  }, [filters, sortBy])

  // Fetch problems from API with filters
  const apiFilters: Record<string, any> = {
    page,
    limit
  }

  if (filters.search) apiFilters.search = filters.search
  if (filters.sources.length > 0 && filters.sources.length < 4) {
    apiFilters.source = filters.sources.join(',')
  }
  if (filters.difficulties.length > 0) {
    apiFilters.difficulty = filters.difficulties.join(',')
  }
  if (filters.topics.length > 0) {
    apiFilters.tags = filters.topics.join(',')
  }
  if (filters.yearFrom || filters.yearTo) {
    const yearFrom = filters.yearFrom || '2000'
    const yearTo = filters.yearTo || new Date().getFullYear().toString()
    apiFilters.year = `${yearFrom}-${yearTo}`
  }
  if (sortBy) apiFilters.sortBy = sortBy

  // Use API to fetch problems
  const { data: apiResponse, isLoading, error } = useProblems(apiFilters)

  // Extract problems from API response
  const apiProblems = apiResponse?.problems || []

  // API already handles most filtering, just apply status filter if needed
  const filteredProblems = apiProblems.filter((problem: any) => {
    // Status filter (requires auth, handled client-side)
    if (filters.status && filters.status !== 'all') {
      if (problem.userStatus !== filters.status) {
        return false
      }
    }
    return true
  })

  // API already handles sorting, no need to sort again
  const sortedProblems = filteredProblems

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
                  "beginner-friendly",
                  "morphology-noun", "morphology-verb", "phonology", "syntax", "semantics",
                  "segmentation", "translation", "correspondence",
                  "writing-systems", "number-systems",
                  "comparative-method", "cultural-context",
                  "rare-language", "extinct", "ancient",
                  "native-american", "indo-european", "austronesian", "sino-tibetan",
                  "papuan", "niger-congo", "afro-asiatic", "uralic",
                  "asia", "americas", "oceania", "europe", "africa"
                ].map((tag) => (
                  <label key={tag} className="flex items-center">
                    <input
                      type="checkbox"
                      className="rounded mr-2"
                      checked={filters.topics.includes(tag)}
                      onChange={() => handleTopicToggle(tag)}
                    />
                    <span className="text-sm capitalize">{tag.replace(/-/g, ' ')}</span>
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

            {/* Error State */}
            {error && (
              <div className="text-center py-12">
                <p className="text-red-500 text-lg">Failed to load problems. Please try again.</p>
              </div>
            )}

            {/* Results Count */}
            {!error && apiResponse?.pagination && (
              <div className="text-gray-600 mb-4">
                Showing {sortedProblems.length} of {apiResponse.pagination.total} problem{apiResponse.pagination.total !== 1 ? 's' : ''}
              </div>
            )}

            {/* Loading State */}
            {isLoading && (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <p className="text-gray-500 mt-4">Loading problems...</p>
              </div>
            )}

            {/* Problems Table */}
            {!isLoading && !error && sortedProblems.length > 0 ? (
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                        Number
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Title
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tags
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                        Difficulty
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                        Pass Rate
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedProblems.map((problem) => (
                      <ProblemTableRow
                        key={problem.id}
                        id={problem.id}
                        number={problem.number}
                        title={problem.title}
                        source={problem.source}
                        year={problem.year}
                        difficulty={problem.difficulty}
                        rating={problem.rating}
                        tags={problem.tags}
                        solveCount={problem.solveCount}
                        passRate={problem.passRate}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            ) : !isLoading && !error && (
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

            {/* Pagination Controls - Luogu Style */}
            {!isLoading && !error && apiResponse?.pagination && sortedProblems.length > 0 && apiResponse.pagination.totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-8">
                <span className="text-sm text-gray-600 mr-2">
                  {apiResponse.pagination.totalPages} pages
                </span>

                {/* First Page */}
                <button
                  onClick={() => setPage(1)}
                  disabled={page === 1}
                  className="min-w-[36px] h-9 px-3 rounded-md text-sm font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 shadow-sm"
                >
                  ≪
                </button>

                {/* Previous Page */}
                <button
                  onClick={() => setPage(p => p - 1)}
                  disabled={page === 1}
                  className="min-w-[36px] h-9 px-3 rounded-md text-sm font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 shadow-sm"
                >
                  ‹
                </button>

                {/* Page Numbers */}
                {(() => {
                  const totalPages = apiResponse.pagination.totalPages
                  const currentPage = page
                  const pageNumbers: (number | string)[] = []

                  // Always show first page
                  if (totalPages >= 1) {
                    pageNumbers.push(1)
                  }

                  // Calculate range around current page
                  let startPage = Math.max(2, currentPage - 2)
                  let endPage = Math.min(totalPages - 1, currentPage + 2)

                  // Add ellipsis after first page if needed
                  if (startPage > 2) {
                    pageNumbers.push('...')
                  }

                  // Add pages around current page
                  for (let i = startPage; i <= endPage; i++) {
                    pageNumbers.push(i)
                  }

                  // Add ellipsis before last page if needed
                  if (endPage < totalPages - 1) {
                    pageNumbers.push('...')
                  }

                  // Always show last page if there's more than 1 page
                  if (totalPages > 1) {
                    pageNumbers.push(totalPages)
                  }

                  return pageNumbers.map((pageNum, idx) => {
                    if (pageNum === '...') {
                      return (
                        <span key={`ellipsis-${idx}`} className="px-2 text-gray-400">
                          ...
                        </span>
                      )
                    }

                    const isActive = pageNum === currentPage
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setPage(pageNum as number)}
                        className={`min-w-[36px] h-9 px-3 rounded-md text-sm font-medium transition-all shadow-sm ${
                          isActive
                            ? 'bg-blue-600 text-white border border-blue-600 hover:bg-blue-700'
                            : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                        }`}
                      >
                        {pageNum}
                      </button>
                    )
                  })
                })()}

                {/* Next Page */}
                <button
                  onClick={() => setPage(p => p + 1)}
                  disabled={page >= apiResponse.pagination.totalPages}
                  className="min-w-[36px] h-9 px-3 rounded-md text-sm font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 shadow-sm"
                >
                  ›
                </button>

                {/* Last Page */}
                <button
                  onClick={() => setPage(apiResponse.pagination.totalPages)}
                  disabled={page >= apiResponse.pagination.totalPages}
                  className="min-w-[36px] h-9 px-3 rounded-md text-sm font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 shadow-sm"
                >
                  ≫
                </button>
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