'use client'

import Link from "next/link"
import { useRouter } from "next/navigation"
import { Search, BookOpen, Users, Trophy, ArrowRight, Star } from "lucide-react"
import Header from "@/components/Header"
import ProblemCard from "@/components/ProblemCard"
import SearchBar from "@/components/SearchBar"
import { Button } from "@/components/ui/button"
import { useProblems, useProblemsStats } from "@/hooks/useProblems"

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
  }
]

export default function Home() {
  const router = useRouter()
  const { data: recentProblems, isLoading } = useProblems({ limit: 3, sortBy: 'year-desc' })
  const { data: stats } = useProblemsStats()

  const displayProblems = recentProblems?.problems?.length > 0 ? recentProblems.problems : mockProblems

  const handleAuthClick = (type: 'login' | 'register') => {
    router.push(`/auth/${type}`)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold mb-6">
            Global Linguistics Olympiad Hub
          </h1>
          <p className="text-xl mb-8 text-blue-100 max-w-2xl mx-auto">
            Master linguistic puzzles, compete with peers, and explore the fascinating world of languages through IOL, APLO, NACLO and more.
          </p>
          
          {/* Core Search Bar */}
          <div className="max-w-2xl mx-auto mb-8">
            <SearchBar 
              placeholder="Search by problem ID, title, or linguistic topic..."
              large={true}
            />
          </div>
        </div>
      </section>

      {/* Quick Access */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Quick Access by Competition</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { name: "IOL", count: 156, color: "bg-red-500" },
              { name: "APLO", count: 89, color: "bg-green-500" },
              { name: "NACLO", count: 124, color: "bg-blue-500" },
              { name: "UKLO", count: 67, color: "bg-purple-500" }
            ].map((comp) => (
              <Link
                key={comp.name}
                href={`/problems?source=${comp.name}`}
                className="text-center p-6 rounded-xl border-2 border-gray-200 hover:border-gray-300 hover:shadow-md transition-all"
              >
                <div className={`w-16 h-16 ${comp.color} rounded-full mx-auto mb-4 flex items-center justify-center text-white font-bold text-xl`}>
                  {comp.name.slice(0, 2)}
                </div>
                <h3 className="font-semibold text-lg">{comp.name}</h3>
                <p className="text-gray-600">{comp.count} problems</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Today's Challenge */}
      <section className="py-16 bg-gradient-to-r from-orange-50 to-red-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Today's Challenge</h2>
            <p className="text-gray-600">Hand-picked problem to sharpen your linguistic reasoning</p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <div className="flex items-center space-x-3 mb-2">
                    <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-medium">
                      Today&apos;s Pick
                    </span>
                    <span className="text-gray-500">IOL 2015 #4</span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">
                    Tundra Nenets Case System
                  </h3>
                </div>
                <div className="text-right">
                  <div className="flex items-center justify-end space-x-1 mb-1">
                    {Array.from({ length: 3 }, (_, i) => (
                      <Star key={i} className="h-6 w-6 text-orange-600" fill="currentColor" />
                    ))}
                    {Array.from({ length: 2 }, (_, i) => (
                      <Star key={i + 3} className="h-6 w-6 text-gray-300" fill="none" />
                    ))}
                  </div>
                  <div className="text-sm text-gray-500">347 solved</div>
                </div>
              </div>
              
              <p className="text-gray-700 mb-6">
                Explore the complex case marking system of Tundra Nenets, a Uralic language spoken in northern Russia. 
                This problem challenges you to identify morphological patterns and predict case forms.
              </p>
              
              <div className="flex items-center justify-between">
                <div className="flex space-x-2">
                  {["morphology", "case-system", "uralic"].map((tag) => (
                    <span key={tag} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                      {tag}
                    </span>
                  ))}
                </div>
                <Button 
                  className="bg-orange-600 hover:bg-orange-700"
                  onClick={() => router.push('/problems/LH-100')}
                >
                  Try Now <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Activity */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-3xl font-bold">Recent Problems</h2>
            <Link href="/problems" className="text-blue-600 hover:text-blue-800 font-medium">
              View All Problems →
            </Link>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {isLoading ? (
              Array.from({ length: 3 }, (_, i) => (
                <div key={i} className="bg-white border border-gray-200 rounded-lg p-4 animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-6 bg-gray-200 rounded w-full mb-4"></div>
                  <div className="flex space-x-2">
                    <div className="h-4 bg-gray-200 rounded w-16"></div>
                    <div className="h-4 bg-gray-200 rounded w-20"></div>
                  </div>
                </div>
              ))
            ) : (
              displayProblems.map((problem) => (
                <ProblemCard key={problem.id} {...problem} />
              ))
            )}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">{stats?.totalProblems || 0}</div>
              <div className="text-gray-400">Problems Available</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">{stats?.totalSolutions || 0}</div>
              <div className="text-gray-400">Solutions Submitted</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">{stats?.totalUsers || 0}</div>
              <div className="text-gray-400">Active Users</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">{Object.keys(stats?.sourceBreakdown || {}).length}</div>
              <div className="text-gray-400">Competition Sources</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-bold text-lg mb-4">LingoHub</h3>
              <p className="text-gray-600 text-sm">
                The ultimate platform for linguistics olympiad preparation and community learning.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><Link href="/problems">Problem Bank</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Competitions</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><Link href="/problems?source=IOL">IOL Problems</Link></li>
                <li><Link href="/problems?source=APLO">APLO Problems</Link></li>
                <li><Link href="/problems?source=NACLO">NACLO Problems</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Connect</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><Link href="/about">About</Link></li>
                <li><Link href="/contribute">Contribute</Link></li>
                <li><Link href="/contact">Contact</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t mt-8 pt-8 text-center text-gray-600 text-sm">
            © 2024 LingoHub. Built for the linguistics community.
          </div>
        </div>
      </footer>
    </div>
  )
}
