'use client'

import { useState } from 'react'
import Link from "next/link"
import Header from "@/components/Header"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Bookmark, Share2, Download, Star, ThumbsUp, MessageCircle, Eye } from "lucide-react"

export default function ProblemLH105() {
  const [showSolution, setShowSolution] = useState(false)
  const [isSaved, setIsSaved] = useState(false)

  const problem = {
    id: 'LH-105',
    number: 'LH-105',
    title: 'Semantic Shift',
    content: 'The English word "silly" used to mean "blessed" or "innocent" in Middle English. How do words change meaning over time?',
    officialSolution: 'Semantic shift occurs through metaphor, metonymy, specialization, generalization, and social factors. "Silly" shifted from blessed → innocent → naive → foolish.',
    difficulty: 2,
    rating: 1250,
    source: 'Tutorial',
    year: 2024,
    solveCount: 198,
    tags: ['semantics', 'historical-linguistics', 'english']
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
              >
                {isSaved ? <Bookmark className="h-4 w-4 fill-current" /> : <Bookmark className="h-4 w-4" />}
              </Button>
              <Button variant="outline" size="sm">
                <Share2 className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4" />
              </Button>
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
                className="inline-flex items-center bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm"
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
            <Button>Submit Solution</Button>
          </div>
          
          <div className="text-center py-8 text-gray-500">
            No community solutions yet. Be the first to submit one!
          </div>
        </div>
      </div>
    </div>
  )
}