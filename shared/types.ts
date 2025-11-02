// User Types
export interface User {
  id: string
  username: string
  email: string
  rating: number
  createdAt: string
}

export interface UserStats {
  solved: number
  solutions: number
  discussions: number
  unsolved?: number
  bookmarked?: number
}

export interface UserProfile extends User {
  joinDate: string
  stats: UserStats
}

// Problem Types
export interface Problem {
  id: string
  number: string
  title: string
  source: string
  year: number
  difficulty: number
  rating: number
  solveCount: number
  tags: string[]
  userStatus?: 'unsolved' | 'solved' | 'bookmarked'
}

export interface ProblemDetail extends Problem {
  content: string
  officialSolution?: string
  pdfUrl?: string | null
  solutionPdfUrl?: string | null
  stats: {
    solveCount: number
    solutionCount: number
    discussionCount: number
  }
}

// Solution Types
export interface Solution {
  id: string
  content: string
  voteScore: number
  createdAt: string
  user: {
    id: string
    username: string
    rating: number
  }
  userVote?: number
  voteCount?: number
}

// Discussion Types
export interface Discussion {
  id: string
  problemId: string
  title: string
  content: string
  replyCount: number
  createdAt: string
  updatedAt: string
  user: {
    id: string
    username: string
    rating: number
  }
}

// API Response Types
export interface ApiResponse<T> {
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// Filter Types
export interface ProblemFilters {
  source?: string
  year?: string
  difficulty?: number
  tags?: string[]
  status?: 'unsolved' | 'solved' | 'bookmarked'
  search?: string
  page?: number
  limit?: number
  sortBy?: 'difficulty' | 'year-desc' | 'year-asc' | 'title' | 'rating'
}

// Auth Types
export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  username: string
  email: string
  password: string
}

export interface AuthResponse {
  token: string
  user: User
  message: string
}