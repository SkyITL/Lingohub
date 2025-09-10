import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Adding sample problems to database...')
  
  const problems = [
    {
      number: 'LH-100',
      title: 'Introduction to Phonetics',
      content: 'What is the difference between [p] and [b] sounds? Both are bilabial stops, but one is voiced and one is voiceless.',
      officialSolution: '[p] is voiceless (no vocal cord vibration), [b] is voiced (vocal cords vibrate).',
      difficulty: 1,
      rating: 1000,
      source: 'Tutorial',
      year: 2024
    },
    {
      number: 'LH-101',
      title: 'Basic Morphology',
      content: 'In English, we add -s for plurals: cat→cats, dog→dogs. But some words are irregular: child→children, mouse→mice. Why?',
      officialSolution: 'Irregular plurals often come from older forms of English or other Germanic languages.',
      difficulty: 1,
      rating: 1100,
      source: 'Tutorial',
      year: 2024
    },
    {
      number: 'LH-102',
      title: 'Simple Syntax Trees',
      content: 'Draw a syntax tree for: "The cat sat on the mat"',
      officialSolution: '[S [NP The cat] [VP sat [PP on [NP the mat]]]]',
      difficulty: 2,
      rating: 1200,
      source: 'Practice',
      year: 2024
    },
    {
      number: 'LH-103',
      title: 'Language Families',
      content: 'Which languages belong to the Romance family? Name at least 5.',
      officialSolution: 'Spanish, French, Italian, Portuguese, Romanian (all descended from Latin)',
      difficulty: 1,
      rating: 1000,
      source: 'Quiz',
      year: 2024
    },
    {
      number: 'LH-104',
      title: 'IPA Practice',
      content: 'Transcribe "Hello" in IPA.',
      officialSolution: '/həˈloʊ/ (American) or /həˈləʊ/ (British)',
      difficulty: 2,
      rating: 1150,
      source: 'Practice',
      year: 2024
    }
  ]
  
  for (const p of problems) {
    try {
      await prisma.problem.create({ data: p })
      console.log(`✅ Created: ${p.title}`)
    } catch (error: any) {
      if (error.code === 'P2002') {
        console.log(`⏭️  Skipped: ${p.title} (already exists)`)
      } else {
        console.error(`❌ Error creating ${p.title}:`, error.message)
      }
    }
  }
  
  console.log('\n✅ Done! Added sample problems to database.')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())