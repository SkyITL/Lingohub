'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import Header from "@/components/Header"
import ProblemCard from "@/components/ProblemCard"
import SearchBar from "@/components/SearchBar"
import { Button } from "@/components/ui/button"
import { Filter, Grid, List, Star, Users } from "lucide-react"
import { useProblems } from '@/hooks/useProblems'

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

export default function ProblemsPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [filters, setFilters] = useState({
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
  
  // Transform frontend filters to API format
  const apiFilters = {
    search: filters.search || undefined,
    source: filters.sources.length > 0 && filters.sources.length < 4 ? filters.sources.join(',') : undefined,
    tags: filters.topics.length > 0 ? filters.topics.join(',') : undefined,
    difficulty: filters.difficulties.length > 0 ? filters.difficulties.join(',') : undefined,
    year: filters.yearFrom && filters.yearTo ? `${filters.yearFrom}-${filters.yearTo}` : undefined,
    status: filters.status !== 'all' ? filters.status : undefined,
    sortBy
  }

  // Remove undefined values
  const cleanFilters = Object.fromEntries(
    Object.entries(apiFilters).filter(([_, value]) => value !== undefined)
  )

  const { data: problems = [], isLoading, error } = useProblems(cleanFilters)
  
  // Debug logging
  console.log('Current filters:', filters)
  console.log('API filters:', cleanFilters)
  console.log('Problems received:', problems.length)

  useEffect(() => {
    const search = searchParams.get('search')
    if (search) {
      setFilters(prev => ({ ...prev, search }))
    }
  }, [searchParams])

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
      onClick={() => router.push(`/problems/${problem.id}`)}
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
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{problem.title}</h3>
          <div className="flex items-center space-x-4">
            <div className="flex space-x-1">
              {problem.tags.map((tag: string) => (
                <span key={tag} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                  {tag}
                </span>
              ))}
            </div>
            <div className="flex items-center space-x-1 text-sm text-gray-600">
              <Users className="h-3 w-3" />
              <span>{problem.solveCount}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )


  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Problem Bank</h1>
          <p className="text-gray-600 mt-2">500+ linguistics olympiad problems from competitions worldwide</p>
        </div>

        <div className="flex gap-8">
          {/* Filter Sidebar */}
          <div className="w-80 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-sm border p-6 sticky top-8">
              <div className="flex items-center mb-6">
                <Filter className="h-5 w-5 mr-2" />
                <h2 className="text-lg font-semibold">Filters</h2>
              </div>

              {/* Source Filter */}
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
                          <Star key={i} className="h-4 w-4 text-gray-300" fill="none" />
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
                    "Morphology", "Phonology", "Syntax", "Semantics", "Pragmatics",
                    "Writing Systems", "Number Systems", "Kinship Terms", "Sound Changes",
                    "Grammatical Gender", "Case Systems", "Verb Agreement", "Tone Systems",
                    "Historical Linguistics", "Language Families", "Typology"
                  ].map((tag) => (
                    <label key={tag} className="flex items-center">
                      <input 
                        type="checkbox" 
                        className="rounded mr-2" 
                        checked={filters.topics.includes(tag.toLowerCase().replace(' ', '-'))}
                        onChange={() => handleTopicToggle(tag.toLowerCase().replace(' ', '-'))}
                      />
                      <span className="text-sm">{tag}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Status (if logged in) */}
              <div className="mb-6">
                <h3 className="font-medium mb-3">Status</h3>
                <div className="space-y-2">
                  {[
                    { label: "All", value: "all" },
                    { label: "Unsolved", value: "unsolved" },
                    { label: "Solved", value: "solved" },
                    { label: "Bookmarked", value: "bookmarked" }
                  ].map((status) => (
                    <label key={status.value} className="flex items-center">
                      <input
                        type="radio"
                        name="status"
                        value={status.value}
                        className="mr-2"
                        checked={filters.status === status.value}
                        onChange={(e) => handleFilterChange('status', e.target.value)}
                      />
                      <span className="text-sm">{status.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex space-x-3">
                <Button variant="outline" size="sm" className="flex-1" onClick={resetFilters}>
                  Reset
                </Button>
                <Button size="sm" className="flex-1">
                  Apply
                </Button>
              </div>
            </div>
          </div>

          {/* Problems List */}
          <div className="flex-1">
            {/* Search and Results Header */}
            <div className="bg-white rounded-lg shadow-sm border p-4 mb-6 space-y-4">
              {/* Search Bar */}
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <SearchBar 
                    placeholder="Search problems by title, ID, or topic..." 
                    className="w-full"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Button 
                    variant={viewMode === 'list' ? 'default' : 'outline'} 
                    size="sm"
                    onClick={() => setViewMode('list')}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant={viewMode === 'grid' ? 'default' : 'outline'} 
                    size="sm"
                    onClick={() => setViewMode('grid')}
                  >
                    <Grid className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              {/* Results Info and Sort */}
              <div className="flex items-center justify-between pt-2 border-t">
                <div className="text-sm text-gray-600">
                  {isLoading ? 'Loading...' : `Showing ${Array.isArray(problems) ? Math.min(problems.length, 6) : 0} of ${Array.isArray(problems) ? problems.length : 0} problems`}
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-600">Sort by:</span>
                  <select 
                    className="border rounded px-3 py-1 text-sm"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                  >
                    <option value="difficulty">Difficulty</option>
                    <option value="year-desc">Year (Newest)</option>
                    <option value="year-asc">Year (Oldest)</option>
                    <option value="popular">Most Solved</option>
                    <option value="challenging">Least Solved</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Problems Display */}
            {viewMode === 'grid' ? (
              <div className="grid lg:grid-cols-2 gap-6">
                {isLoading ? (
                  <div className="col-span-2 text-center py-8">
                    <div className="text-gray-500">Loading problems...</div>
                  </div>
                ) : error ? (
                  <div className="col-span-2 text-center py-8">
                    <div className="text-red-500">Error loading problems. Please try again.</div>
                  </div>
                ) : !Array.isArray(problems) || problems.length === 0 ? (
                  <div className="col-span-2 text-center py-8">
                    <div className="text-gray-500">No problems found matching your criteria.</div>
                  </div>
                ) : (
                  problems.slice(0, 6).map((problem) => (
                    <ProblemCard key={problem.id} {...problem} />
                  ))
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {isLoading ? (
                  <div className="text-center py-8">
                    <div className="text-gray-500">Loading problems...</div>
                  </div>
                ) : error ? (
                  <div className="text-center py-8">
                    <div className="text-red-500">Error loading problems. Please try again.</div>
                  </div>
                ) : !Array.isArray(problems) || problems.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-gray-500">No problems found matching your criteria.</div>
                  </div>
                ) : (
                  problems.slice(0, 6).map((problem) => (
                    <ProblemListItem key={problem.id} problem={problem} />
                  ))
                )}
              </div>
            )}

            {/* Pagination */}
            <div className="mt-8 flex items-center justify-center">
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" disabled>
                  Previous
                </Button>
                {[1, 2, 3, 4, 5].map((page) => (
                  <Button
                    key={page}
                    variant={page === 1 ? "default" : "outline"}
                    size="sm"
                    className="w-8"
                  >
                    {page}
                  </Button>
                ))}
                <span className="text-gray-500">...</span>
                <Button variant="outline" size="sm" className="w-8">
                  84
                </Button>
                <Button variant="outline" size="sm">
                  Next
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}