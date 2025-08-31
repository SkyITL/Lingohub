'use client'

import { useState } from 'react'
import Header from "@/components/Header"
import { Button } from "@/components/ui/button"
import { 
  User, 
  Award, 
  BookOpen, 
  Clock, 
  TrendingUp, 
  Star,
  Calendar,
  Target,
  Trophy,
  Medal,
  CheckCircle,
  XCircle,
  BarChart3,
  Settings,
  Edit
} from "lucide-react"

const mockUser = {
  username: "linguistics_ace",
  fullName: "Alex Chen",
  email: "alex.chen@example.com",
  joinDate: "March 2023",
  country: "United States",
  school: "MIT",
  rating: 1847,
  rank: "#342",
  totalProblems: 89,
  solvedProblems: 67,
  averageTime: "38 min",
  currentStreak: 12,
  longestStreak: 28,
  achievements: [
    { name: "First Solve", description: "Solved your first problem", icon: Trophy, earned: true },
    { name: "Speed Demon", description: "Solved 5 problems under 15 minutes", icon: Clock, earned: true },
    { name: "Morphology Master", description: "Solved 20 morphology problems", icon: BookOpen, earned: true },
    { name: "Consistent", description: "30-day solving streak", icon: Calendar, earned: false },
    { name: "Perfectionist", description: "100% accuracy on 10 consecutive problems", icon: Target, earned: false },
    { name: "Community Helper", description: "Got 50 upvotes on solutions", icon: Star, earned: true },
  ]
}

const recentActivity = [
  { id: 1, type: 'solved', problem: 'LH-045: Georgian Script', difficulty: 3, timeAgo: '2 hours ago', points: 180 },
  { id: 2, type: 'attempted', problem: 'LH-023: Japanese Honorifics', difficulty: 4, timeAgo: '1 day ago', points: 0 },
  { id: 3, type: 'solved', problem: 'LH-012: Swahili Noun Classes', difficulty: 2, timeAgo: '2 days ago', points: 120 },
  { id: 4, type: 'discussion', problem: 'LH-001: Ubykh Verb Morphology', timeAgo: '3 days ago', action: 'Posted in discussion' },
  { id: 5, type: 'solved', problem: 'LH-034: Mandarin Tones', difficulty: 3, timeAgo: '1 week ago', points: 160 },
]

const topicStats = [
  { topic: 'Morphology', solved: 18, total: 25, percentage: 72 },
  { topic: 'Phonology', solved: 15, total: 20, percentage: 75 },
  { topic: 'Syntax', solved: 12, total: 18, percentage: 67 },
  { topic: 'Writing Systems', solved: 10, total: 12, percentage: 83 },
  { topic: 'Semantics', solved: 8, total: 14, percentage: 57 },
  { topic: 'Pragmatics', solved: 4, total: 8, percentage: 50 },
]

const competitions = [
  { name: 'IOL 2024', rank: '15th', score: '85/100', date: 'July 2024', status: 'completed' },
  { name: 'NACLO 2024', rank: '8th', score: '92/100', date: 'March 2024', status: 'completed' },
  { name: 'APLO 2023', rank: '23rd', score: '78/100', date: 'September 2023', status: 'completed' },
]

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'progress' | 'achievements' | 'settings'>('overview')

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'solved': return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'attempted': return <XCircle className="h-4 w-4 text-orange-500" />
      case 'discussion': return <User className="h-4 w-4 text-blue-500" />
      default: return <BookOpen className="h-4 w-4 text-gray-500" />
    }
  }

  const getTopicColor = (percentage: number) => {
    if (percentage >= 80) return 'bg-green-500'
    if (percentage >= 60) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-6">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-2xl font-bold text-white">
                  {mockUser.fullName.split(' ').map(n => n[0]).join('')}
                </span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{mockUser.fullName}</h1>
                <p className="text-gray-600">@{mockUser.username}</p>
                <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                  <span>{mockUser.school}</span>
                  <span>•</span>
                  <span>{mockUser.country}</span>
                  <span>•</span>
                  <span>Joined {mockUser.joinDate}</span>
                </div>
              </div>
            </div>
            <Button variant="outline">
              <Edit className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Rating</p>
                <p className="text-2xl font-bold text-blue-600">{mockUser.rating}</p>
                <p className="text-sm text-gray-500">Rank {mockUser.rank}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Problems Solved</p>
                <p className="text-2xl font-bold text-green-600">{mockUser.solvedProblems}</p>
                <p className="text-sm text-gray-500">of {mockUser.totalProblems} attempted</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Current Streak</p>
                <p className="text-2xl font-bold text-orange-600">{mockUser.currentStreak}</p>
                <p className="text-sm text-gray-500">Best: {mockUser.longestStreak} days</p>
              </div>
              <Calendar className="h-8 w-8 text-orange-600" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Average Time</p>
                <p className="text-2xl font-bold text-purple-600">{mockUser.averageTime}</p>
                <p className="text-sm text-gray-500">per problem</p>
              </div>
              <Clock className="h-8 w-8 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="border-b">
            <nav className="flex space-x-8 px-6">
              {[
                { key: 'overview', label: 'Overview' },
                { key: 'progress', label: 'Progress' },
                { key: 'achievements', label: 'Achievements' },
                { key: 'settings', label: 'Settings' }
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.key
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="grid lg:grid-cols-2 gap-8">
                {/* Recent Activity */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
                  <div className="space-y-4">
                    {recentActivity.map((activity) => (
                      <div key={activity.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                        {getActivityIcon(activity.type)}
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">
                            {activity.type === 'discussion' ? activity.action : 
                             activity.type === 'solved' ? 'Solved' : 'Attempted'} {activity.problem}
                          </p>
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            {activity.difficulty && (
                              <>
                                <div className="flex items-center">
                                  {Array.from({ length: activity.difficulty }, (_, i) => (
                                    <Star key={i} className="h-3 w-3 text-yellow-400 fill-current" />
                                  ))}
                                </div>
                                <span>•</span>
                              </>
                            )}
                            <span>{activity.timeAgo}</span>
                            {activity.points && (
                              <>
                                <span>•</span>
                                <span className="text-green-600">+{activity.points} pts</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Competition Results */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Competition Results</h3>
                  <div className="space-y-4">
                    {competitions.map((comp, index) => (
                      <div key={index} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-gray-900">{comp.name}</h4>
                          <span className="text-sm text-gray-500">{comp.date}</span>
                        </div>
                        <div className="flex items-center space-x-4 text-sm">
                          <div className="flex items-center space-x-1">
                            <Trophy className="h-4 w-4 text-yellow-500" />
                            <span>{comp.rank}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <BarChart3 className="h-4 w-4 text-blue-500" />
                            <span>{comp.score}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'progress' && (
              <div>
                <h3 className="text-lg font-semibold mb-6">Progress by Topic</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  {topicStats.map((topic) => (
                    <div key={topic.topic} className="p-6 border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium text-gray-900">{topic.topic}</h4>
                        <span className="text-sm text-gray-600">{topic.solved}/{topic.total}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                        <div 
                          className={`h-2 rounded-full ${getTopicColor(topic.percentage)}`}
                          style={{ width: `${topic.percentage}%` }}
                        />
                      </div>
                      <p className="text-sm text-gray-600">{topic.percentage}% completed</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'achievements' && (
              <div>
                <h3 className="text-lg font-semibold mb-6">Achievements</h3>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {mockUser.achievements.map((achievement) => (
                    <div 
                      key={achievement.name} 
                      className={`p-6 rounded-lg border-2 ${
                        achievement.earned 
                          ? 'bg-yellow-50 border-yellow-200' 
                          : 'bg-gray-50 border-gray-200 opacity-60'
                      }`}
                    >
                      <div className="flex items-center space-x-3 mb-3">
                        <achievement.icon className={`h-8 w-8 ${
                          achievement.earned ? 'text-yellow-600' : 'text-gray-400'
                        }`} />
                        <div>
                          <h4 className="font-medium text-gray-900">{achievement.name}</h4>
                          {achievement.earned && (
                            <span className="text-xs text-green-600 font-medium">EARNED</span>
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-gray-600">{achievement.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="max-w-2xl">
                <h3 className="text-lg font-semibold mb-6">Account Settings</h3>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                    <input 
                      type="text" 
                      defaultValue={mockUser.fullName}
                      className="w-full p-3 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
                    <input 
                      type="text" 
                      defaultValue={mockUser.username}
                      className="w-full p-3 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input 
                      type="email" 
                      defaultValue={mockUser.email}
                      className="w-full p-3 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">School/University</label>
                    <input 
                      type="text" 
                      defaultValue={mockUser.school}
                      className="w-full p-3 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                    <select className="w-full p-3 border rounded-lg">
                      <option value="us">United States</option>
                      <option value="uk">United Kingdom</option>
                      <option value="ca">Canada</option>
                      <option value="au">Australia</option>
                    </select>
                  </div>
                  <div className="flex space-x-4">
                    <Button>Save Changes</Button>
                    <Button variant="outline">Cancel</Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}