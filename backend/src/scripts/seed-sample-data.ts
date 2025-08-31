import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const sampleProblems = [
  {
    number: 'LH-001',
    title: 'Ubykh Verb Morphology',
    source: 'IOL',
    year: 2007,
    difficulty: 4,
    rating: 1800,
    content: `# Ubykh Verb Morphology

Ubykh is an extinct Northwest Caucasian language that was spoken in the Caucasus region. 

## Language Data

| Ubykh Form | English Translation |
|------------|-------------------|
| qʷənsaw | 'I am going' |
| wənsaw | 'you are going' |
| jənsaw | 'he/she is going' |
| qʷəntxʷn | 'I went' |
| wəntxʷn | 'you went' |
| jəntxʷn | 'he/she went' |

## Questions

1. Analyze the morphological structure of these verb forms.
2. Based on your analysis, how would you say: 'we are going', 'they went', 'you (plural) are going'?`,
    tags: ['morphology', 'verbs', 'caucasian']
  },
  {
    number: 'LH-002',
    title: 'Pirahã Number System',
    source: 'APLO',
    year: 2008,
    difficulty: 2,
    rating: 1200,
    content: `# Pirahã Number System

Pirahã is an Amazonian language with a unique approach to quantity.

## Language Data

- hói = 'small quantity'
- hoí = 'large quantity'

## Question

What can you deduce about the Pirahã number system from this data?`,
    tags: ['numbers', 'counting', 'amazonian']
  },
  {
    number: 'LH-003',
    title: 'Lardil Phonological Processes',
    source: 'NACLO',
    year: 2009,
    difficulty: 5,
    rating: 2100,
    content: `# Lardil Phonological Processes

Lardil is an Australian language with complex phonological rules.

## Language Data

| Surface Form | Underlying Form | Meaning |
|--------------|----------------|---------|
| yaka | yakan | 'fish' |
| wite | witen | 'inside' |
| kentapal | kentapalan | 'dugong' |

## Question

What phonological process is occurring here?`,
    tags: ['phonology', 'australian', 'sound-changes']
  },
  {
    number: 'LH-004',
    title: 'Swahili Noun Classes',
    source: 'IOL',
    year: 2010,
    difficulty: 3,
    rating: 1500,
    content: `# Swahili Noun Classes

Swahili has a complex noun class system.

## Language Data

- mtu mkubwa = 'big person'
- watu wakubwa = 'big people' 
- kisu kikubwa = 'big knife'
- visu vikubwa = 'big knives'

## Question

Analyze the agreement patterns in these phrases.`,
    tags: ['morphology', 'bantu', 'agreement']
  },
  {
    number: 'LH-005',
    title: 'Georgian Script Evolution',
    source: 'UKLO',
    year: 2011,
    difficulty: 2,
    rating: 1300,
    content: `# Georgian Script Evolution

Georgian has used three different scripts throughout its history.

## Question

Trace the development of Georgian writing systems and their characteristics.`,
    tags: ['writing-systems', 'historical', 'kartvelian']
  },
  {
    number: 'LH-006',
    title: 'Japanese Honorific System',
    source: 'APLO',
    year: 2012,
    difficulty: 4,
    rating: 1900,
    content: `# Japanese Honorific System

Japanese has complex honorific expressions.

## Language Data

- iku = 'to go' (plain)
- ikimasu = 'to go' (polite)
- irassharu = 'to go' (respectful)

## Question

Analyze the honorific system and its social implications.`,
    tags: ['pragmatics', 'honorifics', 'japanese']
  }
]

async function seedSampleData() {
  console.log('Starting sample data seeding...')
  
  try {
    // First, create tags
    const uniqueTags = [...new Set(sampleProblems.flatMap(p => p.tags))]
    
    for (const tagName of uniqueTags) {
      await prisma.tag.upsert({
        where: { name: tagName },
        update: {},
        create: {
          name: tagName,
          category: 'subfield'
        }
      })
    }
    
    console.log(`✅ Created/updated ${uniqueTags.length} tags`)

    // Then, create problems
    for (const problemData of sampleProblems) {
      const { tags, ...problemInfo } = problemData
      
      // Create the problem
      const problem = await prisma.problem.upsert({
        where: { number: problemInfo.number },
        update: problemInfo,
        create: problemInfo
      })

      // Link tags to the problem
      for (const tagName of tags) {
        const tag = await prisma.tag.findUnique({ where: { name: tagName } })
        if (tag) {
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
    }
    
    console.log(`✅ Created/updated ${sampleProblems.length} problems`)
    
    // Get final counts
    const stats = await prisma.problem.count()
    console.log(`📊 Total problems in database: ${stats}`)
    
  } catch (error) {
    console.error('❌ Error seeding data:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

if (require.main === module) {
  seedSampleData()
    .then(() => {
      console.log('🎉 Sample data seeding completed!')
      process.exit(0)
    })
    .catch((error) => {
      console.error('💥 Seeding failed:', error)
      process.exit(1)
    })
}

export default seedSampleData