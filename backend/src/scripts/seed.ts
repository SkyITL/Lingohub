import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Starting database seed...')

  // Create sample users
  const hashedPassword = await bcrypt.hash('password123', 10)
  
  const user1 = await prisma.user.upsert({
    where: { email: 'alice@example.com' },
    update: {},
    create: {
      username: 'alice_linguist',
      email: 'alice@example.com',
      password: hashedPassword,
      rating: 1850
    }
  })

  const user2 = await prisma.user.upsert({
    where: { email: 'bob@example.com' },
    update: {},
    create: {
      username: 'bob_polyglot',
      email: 'bob@example.com', 
      password: hashedPassword,
      rating: 1624
    }
  })

  // Create sample problems
  const problems = [
    {
      number: 'LH-001',
      title: 'Ubykh Verb Morphology',
      content: `# Ubykh Verb Morphology

Ubykh was a Northwest Caucasian language that became extinct in 1992. It had one of the most complex consonant systems ever documented, with around 84 consonants.

## Problem

Given the following Ubykh verb forms:

| Ubykh | English |
|-------|---------|
| sə-q'ʷa | I go |
| wə-q'ʷa | you go |
| a-q'ʷa | he/she goes |
| sə-q'ʷa-n | we go |
| sə-kʷən | I come |
| wə-kʷən | you come |

**Question**: What would be the Ubykh forms for:
1. "they go"
2. "you (plural) go" 
3. "I came"`,
      source: 'IOL',
      year: 2007,
      difficulty: 4,
      rating: 1800,
      officialSolution: 'Based on the patterns: 1) ra-q\'ʷa (they go), 2) sə-q\'ʷa-x (you plural go), 3) sə-kʷən-s (I came)',
      tags: ['morphology', 'verbs', 'caucasian']
    },
    {
      number: 'LH-002', 
      title: 'Pirahã Number System',
      content: `# Pirahã Number System

Pirahã is an Amazonian language famous for potentially having no exact number words beyond "few" and "many".

## Problem

A linguist studying Pirahã collected these expressions:

| Pirahã | Context |
|--------|---------|
| hói | one stick |
| hoí | two sticks |
| baágiso | many sticks |

**Question**: What can you conclude about the Pirahã number system from this limited data?`,
      source: 'APLO',
      year: 2008,
      difficulty: 2,
      rating: 1200,
      officialSolution: 'The data suggests Pirahã may have approximate quantity words rather than exact numbers.',
      tags: ['numbers', 'counting', 'amazonian']
    },
    {
      number: 'LH-003',
      title: 'Lardil Phonological Processes',
      content: `# Lardil Phonological Processes

Lardil is an Australian Aboriginal language with interesting phonological alternations.

## Problem

Examine these Lardil word pairs:

| Uninflected | Accusative | English |
|-------------|------------|---------|
| kurka | kurkan | kangaroo |
| wanka | wankan | arm |
| yalulu | yalulun | flame |

**Question**: What is the rule for forming the accusative case?`,
      source: 'NACLO',
      year: 2009,
      difficulty: 5,
      rating: 2100,
      officialSolution: 'Add -n suffix, but if the word ends in a vowel, change the final vowel to -n.',
      tags: ['phonology', 'australian', 'sound-changes']
    },
    {
      number: 'LH-004',
      title: 'Swahili Noun Classes',
      content: `# Swahili Noun Classes

Swahili has a complex noun class system that affects agreement patterns.

## Problem

Study these Swahili phrases:

| Swahili | English |
|---------|---------|
| mti mkubwa | big tree |
| miti mikubwa | big trees |
| kiti kikubwa | big chair |
| viti vikubwa | big chairs |

**Question**: What are the rules governing noun class agreement in Swahili?`,
      source: 'IOL',
      year: 2010,
      difficulty: 3,
      rating: 1500,
      officialSolution: 'Adjectives must agree with nouns in class. M-/mi- class uses m-/mi- prefixes, ki-/vi- class uses ki-/vi- prefixes.',
      tags: ['morphology', 'bantu', 'agreement']
    },
    {
      number: 'LH-005',
      title: 'Georgian Script Evolution',
      content: `# Georgian Script Evolution

Georgian has three distinct scripts that developed over time.

## Problem

Match these Georgian words in different scripts:

**Mkhedruli (modern)**: კაცი, ღმერთი  
**Nuskhuri (medieval)**: ⴉⴀⴚⴈ, ⴖⴋⴄⴐⴇⴈ  
**Asomtavruli (ancient)**: ႩႠႺႨ, ႶႫႤႰႧႨ

**Question**: Which words mean "man" and "God" respectively?`,
      source: 'UKLO',
      year: 2011,
      difficulty: 2,
      rating: 1100,
      officialSolution: 'კაცი/ⴉⴀⴚⴈ/ႩႠႺႨ means "man", ღმერთი/ⴖⴋⴄⴐⴇⴈ/ႶႫႤႰႧႨ means "God"',
      tags: ['writing-systems', 'historical', 'kartvelian']
    }
  ]

  // Create problems with tags
  for (const problemData of problems) {
    const { tags, ...problemInfo } = problemData
    
    const problem = await prisma.problem.upsert({
      where: { number: problemData.number },
      update: problemInfo,
      create: problemInfo
    })

    // Create tags and connect them
    for (const tagName of tags) {
      const tag = await prisma.tag.upsert({
        where: { name: tagName },
        update: {},
        create: { name: tagName, category: 'topic' }
      })

      await prisma.problemTag.upsert({
        where: {
          problemId_tagId: {
            problemId: problem.id,
            tagId: tag.id
          }
        },
        update: {},
        create: {
          problemId: problem.id,
          tagId: tag.id
        }
      })
    }
  }

  // Create sample solutions
  const problem1 = await prisma.problem.findFirst({ where: { number: 'LH-001' } })
  if (problem1) {
    await prisma.solution.upsert({
      where: { id: 'sample-solution-1' },
      update: {},
      create: {
        id: 'sample-solution-1',
        content: 'Looking at the morphological patterns, I believe the person markers are: sə- (1st person), wə- (2nd person), a- (3rd person). The plural marker appears to be -n.',
        userId: user1.id,
        problemId: problem1.id,
        voteScore: 10
      }
    })
  }

  console.log('✅ Database seeded successfully!')
  console.log(`Created ${problems.length} problems`)
  console.log('Created 2 sample users')
  console.log('Created 1 sample solution')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })