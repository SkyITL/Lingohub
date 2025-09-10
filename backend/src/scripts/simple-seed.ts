import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')
  
  try {
    // Create basic tags
    console.log('Creating tags...')
    const tagData = [
      { name: 'phonology', category: 'field' },
      { name: 'morphology', category: 'field' },
      { name: 'syntax', category: 'field' },
      { name: 'semantics', category: 'field' },
      { name: 'easy', category: 'difficulty' },
      { name: 'medium', category: 'difficulty' },
      { name: 'hard', category: 'difficulty' },
    ]
    
    for (const tag of tagData) {
      await prisma.tag.upsert({
        where: { name: tag.name },
        update: {},
        create: tag
      })
    }
    
    // Create test users
    console.log('Creating users...')
    const hashedPassword = await bcrypt.hash('password123', 10)
    
    const user1 = await prisma.user.upsert({
      where: { email: 'demo@example.com' },
      update: {},
      create: {
        email: 'demo@example.com',
        username: 'demolinguist',
        password: hashedPassword,
        rating: 1500
      }
    })
    
    // Create sample problems
    console.log('Creating problems...')
    const problems = [
      {
        number: 'LH-010',
        title: 'Japanese Counting System',
        content: `# Japanese Counting System\n\nJapanese uses different counters for different objects:\n\n| Number | Books | People |\n|--------|-------|--------|\n| 1 | issatsu | hitori |\n| 2 | nisatsu | futari |\n| 3 | sansatsu | sannin |\n\nWhat patterns do you observe?`,
        officialSolution: 'The counter changes based on object type. Books use -satsu, people use special forms for 1-2, then -nin.',
        difficulty: 2,
        rating: 1300,
        source: 'IOL',
        year: 2023
      },
      {
        number: 'LH-011',
        title: 'Swahili Noun Classes',
        content: `# Swahili Noun Classes\n\nObserve these Swahili word pairs:\n\n| Singular | Plural |\n|----------|--------|\n| mtoto | watoto |\n| mtu | watu |\n| kitabu | vitabu |\n\nIdentify the pattern.`,
        officialSolution: 'Swahili uses prefixes: m-/wa- for people, ki-/vi- for objects.',
        difficulty: 2,
        rating: 1200,
        source: 'NACLO',
        year: 2023
      },
      {
        number: 'LH-012',
        title: 'Turkish Vowel Harmony',
        content: `# Turkish Vowel Harmony\n\nLook at these Turkish words:\n\n| Root | With Suffix |\n|------|-------------|\n| ev | evde |\n| köy | köyde |\n| okul | okulda |\n\nWhat rule determines the suffix form?`,
        officialSolution: 'Turkish has vowel harmony: front vowels take -de, back vowels take -da.',
        difficulty: 3,
        rating: 1400,
        source: 'IOL',
        year: 2022
      },
      {
        number: 'LH-013',
        title: 'Hawaiian Sound Changes',
        content: `# Hawaiian Loanwords\n\nEnglish words adapted to Hawaiian:\n\n| English | Hawaiian |\n|---------|----------|\n| Christmas | Kalikimaka |\n| Britain | Pelekania |\n\nWhat sound changes occur?`,
        officialSolution: 'Hawaiian replaces: r→l, s→k, adds vowels to break consonant clusters.',
        difficulty: 3,
        rating: 1500,
        source: 'APLO',
        year: 2022
      },
      {
        number: 'LH-014',
        title: 'Arabic Root System',
        content: `# Arabic Roots\n\nThe root K-T-B relates to writing:\n\n| Pattern | Word | Meaning |\n|---------|------|------|\n| KaTaBa | kataba | he wrote |\n| KiTāB | kitāb | book |\n| KāTiB | kātib | writer |\n\nHow does the root system work?`,
        officialSolution: 'Arabic uses 3-consonant roots with vowel patterns to create related words.',
        difficulty: 4,
        rating: 1600,
        source: 'IOL',
        year: 2021
      },
      {
        number: 'LH-015',
        title: 'Mandarin Tones',
        content: `# Mandarin Tones\n\nSame syllable, different tones:\n\n| Pinyin | Meaning |\n|--------|------|\n| mā | mother |\n| má | hemp |\n| mǎ | horse |\n| mà | scold |\n\nHow do tones affect meaning?`,
        officialSolution: 'Mandarin has 4 tones that completely change word meaning.',
        difficulty: 2,
        rating: 1250,
        source: 'NACLO',
        year: 2023
      },
      {
        number: 'LH-016',
        title: 'Russian Cases',
        content: `# Russian Case System\n\nObserve 'student' in different cases:\n\n| Case | Form | Usage |\n|------|------|-------|\n| Nominative | студент | subject |\n| Accusative | студента | direct object |\n| Dative | студенту | indirect object |\n\nWhat is the function of cases?`,
        officialSolution: 'Cases mark grammatical roles through word endings.',
        difficulty: 3,
        rating: 1450,
        source: 'UKLO',
        year: 2021
      },
      {
        number: 'LH-017',
        title: 'Korean Honorifics',
        content: `# Korean Honorific System\n\nPlain vs Honorific forms:\n\n| Plain | Honorific | Meaning |\n|-------|-----------|------|\n| 먹다 | 드시다 | eat |\n| 자다 | 주무시다 | sleep |\n\nWhen are honorifics used?`,
        officialSolution: 'Honorifics show respect to elders, superiors, or in formal situations.',
        difficulty: 3,
        rating: 1400,
        source: 'APLO',
        year: 2023
      },
      {
        number: 'LH-018',
        title: 'Welsh Mutations',
        content: `# Welsh Initial Mutations\n\nConsonants change after certain words:\n\n| Base | After 'dy' | After 'ei' |\n|------|------------|------------|\n| tad | dad | thad |\n| pen | ben | phen |\n\nWhat triggers these changes?`,
        officialSolution: 'Grammatical words trigger soft or aspirate mutations of initial consonants.',
        difficulty: 4,
        rating: 1650,
        source: 'UKLO',
        year: 2022
      },
      {
        number: 'LH-019',
        title: 'Navajo Verbs',
        content: `# Navajo Verb Complexity\n\nForms of 'go':\n\n| Navajo | Meaning |\n|--------|------|\n| yishááł | I am going |\n| nishááł | I went and returned |\n| déyá | I will go |\n\nWhat information is encoded?`,
        officialSolution: 'Navajo verbs encode direction, aspect, completion, and manner of motion.',
        difficulty: 5,
        rating: 1800,
        source: 'IOL',
        year: 2020
      }
    ]
    
    // Get tags for connecting
    const easyTag = await prisma.tag.findUnique({ where: { name: 'easy' } })
    const mediumTag = await prisma.tag.findUnique({ where: { name: 'medium' } })
    const hardTag = await prisma.tag.findUnique({ where: { name: 'hard' } })
    const phonologyTag = await prisma.tag.findUnique({ where: { name: 'phonology' } })
    const morphologyTag = await prisma.tag.findUnique({ where: { name: 'morphology' } })
    
    for (const problemData of problems) {
      // Determine which tags to connect based on difficulty
      const tagConnections = []
      if (problemData.difficulty <= 2 && easyTag) tagConnections.push({ id: easyTag.id })
      if (problemData.difficulty === 3 && mediumTag) tagConnections.push({ id: mediumTag.id })
      if (problemData.difficulty >= 4 && hardTag) tagConnections.push({ id: hardTag.id })
      
      // Add subject tags randomly
      if (Math.random() > 0.5 && phonologyTag) tagConnections.push({ id: phonologyTag.id })
      if (Math.random() > 0.5 && morphologyTag) tagConnections.push({ id: morphologyTag.id })
      
      const problem = await prisma.problem.create({
        data: {
          ...problemData,
          tags: {
            connect: tagConnections
          }
        }
      })
      
      // Add a sample solution
      if (user1) {
        await prisma.solution.create({
          data: {
            content: `Here's my approach to solving ${problemData.title}...`,
            problemId: problem.id,
            userId: user1.id,
            upvotes: Math.floor(Math.random() * 10),
            downvotes: Math.floor(Math.random() * 3)
          }
        })
      }
      
      console.log(`✅ Created: ${problemData.title}`)
    }
    
    console.log('\n✅ Database seeded successfully!')
    console.log(`- ${problems.length} problems created`)
    console.log('- Sample user: demo@example.com / password123')
    
  } catch (error) {
    console.error('❌ Error seeding database:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })