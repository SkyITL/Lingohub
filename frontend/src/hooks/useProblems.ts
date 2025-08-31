import { useQuery } from '@tanstack/react-query'
import { problemsApi } from '@/lib/api'

export function useProblems(filters?: Record<string, any>) {
  return useQuery({
    queryKey: ['problems', filters],
    queryFn: async () => {
      const response = await problemsApi.getAll(filters)
      return response.data.problems || []
    }
  })
}

export function useProblem(id: string) {
  return useQuery({
    queryKey: ['problem', id],
    queryFn: async () => {
      const response = await problemsApi.getById(id)
      return response.data
    },
    enabled: !!id
  })
}

export function useProblemsStats() {
  return useQuery({
    queryKey: ['problems', 'stats'],
    queryFn: async () => {
      const response = await problemsApi.getStats()
      return response.data
    }
  })
}