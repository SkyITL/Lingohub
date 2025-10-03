import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Deleting all solution votes...')
  await prisma.solutionVote.deleteMany()

  console.log('Deleting all solutions...')
  const result = await prisma.solution.deleteMany()

  console.log(`Successfully deleted ${result.count} solutions`)
}

main()
  .catch((e) => {
    console.error('Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
