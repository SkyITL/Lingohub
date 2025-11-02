import { notFound } from 'next/navigation'
import ProblemPageClient from './ProblemPageClient'

// This function tells Next.js which problem IDs to pre-generate at build time
export async function generateStaticParams() {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'
    const response = await fetch(`${apiUrl}/api/problems?limit=100`, {
      next: { revalidate: 3600 } // Cache for 1 hour during build
    })

    if (!response.ok) {
      console.error('Failed to fetch problems for static generation')
      return []
    }

    const data = await response.json()
    const problems = data.problems || []

    console.log(`Generating static params for ${problems.length} problems`)

    return problems.map((problem: any) => ({
      id: problem.number // Use problem number as ID (e.g., "LH-IOL-2003-1")
    }))
  } catch (error) {
    console.error('Error generating static params:', error)
    return []
  }
}

// This is a Server Component that fetches data at build time
export default async function ProblemDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'
    const response = await fetch(`${apiUrl}/api/problems/${id}`, {
      next: { revalidate: 3600 } // Revalidate every hour in production
    })

    if (!response.ok) {
      notFound()
    }

    const problem = await response.json()

    // Pass the pre-fetched problem data to the client component
    return <ProblemPageClient initialProblem={problem} />
  } catch (error) {
    console.error('Failed to load problem:', error)
    notFound()
  }
}

// Metadata for SEO
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'
    const response = await fetch(`${apiUrl}/api/problems/${id}`, {
      next: { revalidate: 3600 }
    })

    if (!response.ok) {
      return {
        title: 'Problem Not Found - LingoHub'
      }
    }

    const problem = await response.json()

    return {
      title: `${problem.number}: ${problem.title} - LingoHub`,
      description: `Solve ${problem.title} from ${problem.source} ${problem.year}. Difficulty: ${problem.difficulty}/5 stars.`
    }
  } catch (error) {
    return {
      title: 'Problem - LingoHub'
    }
  }
}
