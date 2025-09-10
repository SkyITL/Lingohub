import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

// Linguistics problem templates
const problemTemplates = [
  {
    title: "Swahili Noun Classes",
    content: `# Swahili Noun Classes

Consider the following Swahili nouns and their plural forms:

| Singular | Plural | English |
|----------|--------|---------|
| mtoto | watoto | child/children |
| mtu | watu | person/people |
| mgeni | wageni | guest/guests |
| kikapu | vikapu | basket/baskets |
| kitabu | vitabu | book/books |
| kiti | viti | chair/chairs |

Now translate:
1. mkulima (farmer) → plural: ?
2. kikombe (cup) → plural: ?
3. mti (tree) → plural: ?`,
    solution: "1. wakulima (farmers)\n2. vikombe (cups)\n3. miti (trees)\n\nSwahili uses noun class prefixes: m-/wa- for people, ki-/vi- for objects, m-/mi- for plants.",
    difficulty: 2,
    complexity: 1200,
    source: "IOL",
    year: 2020,
    tags: ["morphology", "african-languages", "noun-classes"]
  },
  {
    title: "Turkish Vowel Harmony",
    content: `# Turkish Vowel Harmony

Observe these Turkish words with suffixes:

| Root | With suffix | Meaning |
|------|-------------|---------|
| ev | evde | in the house |
| köy | köyde | in the village |
| okul | okulda | in the school |
| göl | gölde | in the lake |
| kız | kızda | at the girl |
| kuş | kuşta | at the bird |

Complete:
1. deniz (sea) + locative suffix = ?
2. adam (man) + locative suffix = ?`,
    solution: "1. denizde (in the sea)\n2. adamda (at the man)\n\nTurkish has vowel harmony: back vowels (a,ı,o,u) take -da, front vowels (e,i,ö,ü) take -de.",
    difficulty: 2,
    complexity: 1300,
    source: "NACLO",
    year: 2021,
    tags: ["phonology", "turkic-languages", "vowel-harmony"]
  },
  {
    title: "Japanese Counting System",
    content: `# Japanese Counting System

Japanese uses different counters for different types of objects:

| Number | Books (冊) | People (人) | Animals (匹) |
|--------|-----------|------------|-------------|
| 1 | issatsu | hitori | ippiki |
| 2 | nisatsu | futari | nihiki |
| 3 | sansatsu | sannin | sanbiki |
| 4 | yonsatsu | yonin | yonhiki |
| 5 | gosatsu | gonin | gohiki |

What is the pattern? How would you say "6 books" and "6 people"?`,
    solution: "6 books: rokusatsu\n6 people: rokunin\n\nJapanese counters change based on the object type and sometimes undergo sound changes.",
    difficulty: 3,
    complexity: 1400,
    source: "APLO",
    year: 2019,
    tags: ["morphology", "asian-languages", "counting-systems"]
  },
  {
    title: "Hawaiian Phonological Rules",
    content: `# Hawaiian Phonological Rules

Hawaiian has a limited sound inventory. Consider these Hawaiian words borrowed from English:

| English | Hawaiian | 
|---------|----------|
| Christmas | Kalikimaka |
| Britain | Pelekania |
| Florence | Pololeka |
| George | Keoki |

Based on the pattern, how would Hawaiian adapt:
1. "Sandra"
2. "Thomas"`,
    solution: "1. Kanela or Kanala\n2. Komaka or Koma\n\nHawaiian replaces: s→k, r→l, consonant clusters are broken up with vowels, no 't' sound (→k).",
    difficulty: 3,
    complexity: 1500,
    source: "IOL",
    year: 2018,
    tags: ["phonology", "austronesian-languages", "loanwords"]
  },
  {
    title: "Russian Case System",
    content: `# Russian Case System

Observe these Russian sentences:

| Russian | English |
|---------|---------|
| Студент читает книгу | The student reads a book |
| Книга на столе | The book is on the table |
| Я даю книгу студенту | I give the book to the student |
| Стол студента большой | The student's table is big |

Notice how 'книга' (book) and 'студент' (student) change form. Identify the cases and their functions.`,
    solution: "Nominative (subject): студент, книга\nAccusative (direct object): книгу\nDative (indirect object): студенту\nGenitive (possession): студента\nPrepositional (location): столе",
    difficulty: 4,
    complexity: 1600,
    source: "UKLO",
    year: 2022,
    tags: ["morphology", "slavic-languages", "case-systems"]
  },
  {
    title: "Mandarin Tones",
    content: `# Mandarin Tones

Mandarin Chinese has four tones that change word meaning:

| Pinyin | Tone | Character | Meaning |
|--------|------|-----------|---------|
| ma | 1st (high level) | 妈 | mother |
| ma | 2nd (rising) | 麻 | hemp |
| ma | 3rd (falling-rising) | 马 | horse |
| ma | 4th (falling) | 骂 | scold |

Given: bā (八) = eight, bá (拔) = pull out, bǎ (把) = handle

What might bà mean based on the pattern?`,
    solution: "bà (爸) means 'father'. The fourth tone (falling) completes the tonal set for the 'ba' syllable.",
    difficulty: 2,
    complexity: 1250,
    source: "NACLO",
    year: 2020,
    tags: ["phonology", "tonal-languages", "asian-languages"]
  },
  {
    title: "Arabic Root System",
    content: `# Arabic Root System

Arabic words are built from three-consonant roots. The root K-T-B relates to writing:

| Pattern | Word | Meaning |
|---------|------|---------|
| KaTaBa | kataba | he wrote |
| KāTiB | kātib | writer |
| maKTaB | maktab | office |
| KiTāB | kitāb | book |
| maKTūB | maktūb | written/letter |

Given the root D-R-S (study), identify:
1. DaRaSa = ?
2. DāRiS = ?`,
    solution: "1. DaRaSa = he studied\n2. DāRiS = student\n\nThe patterns: FaʿaLa = verb, FāʿiL = active participle (doer).",
    difficulty: 4,
    complexity: 1700,
    source: "IOL",
    year: 2019,
    tags: ["morphology", "semitic-languages", "root-systems"]
  },
  {
    title: "Inuktitut Polysynthesis",
    content: `# Inuktitut Polysynthesis

Inuktitut can express entire sentences in one word:

| Inuktitut | English |
|-----------|---------|
| tusaa | hear |
| tusaanngit | not hear |
| tusaajuq | he/she hears |
| tusaanngittuq | he/she does not hear |
| tusaajara | I hear him/her |
| tusaanngittara | I do not hear him/her |

Analyze the morpheme structure and translate:
1. tusaajanga = ?`,
    solution: "tusaajanga = he/she hears him/her\n\nMorphemes: tusaa (hear) + ju (3rd person subject) + nga (3rd person object)",
    difficulty: 5,
    complexity: 1800,
    source: "NACLO",
    year: 2021,
    tags: ["morphology", "polysynthetic-languages", "indigenous-languages"]
  },
  {
    title: "Thai Script Direction",
    content: `# Thai Script and Tone Marks

Thai combines consonants, vowels, and tone marks in complex ways:

| Thai | Romanization | Meaning |
|------|--------------|---------|
| น้ำ | náam | water |
| ไม้ | mái | wood |
| ใหม่ | mài | new |
| หมา | mǎa | dog |

Note: Vowels can appear before, after, above, or below consonants. 
Tone marks appear above the consonant.

How does Thai differ from linear alphabetic writing?`,
    solution: "Thai is non-linear: vowels surround consonants, tones stack above. น้ำ = n + ำ (am vowel) + ้ (tone). Visual arrangement carries phonetic information.",
    difficulty: 3,
    complexity: 1450,
    source: "APLO",
    year: 2020,
    tags: ["writing-systems", "tonal-languages", "southeast-asian"]
  },
  {
    title: "Navajo Verb Complexity",
    content: `# Navajo Verb System

Navajo verbs are highly complex. Consider forms of 'to go':

| Navajo | English |
|--------|---------|
| yishááł | I am going |
| nishááł | I went and returned |
| déyá | I will go |
| yíyá | he/she went |
| naasháa | I am going around |
| ch'íníyá | I went out horizontally |

What aspects of motion does Navajo encode in its verbs?`,
    solution: "Navajo encodes: direction, completion, repetition, manner of motion, and return journey. Each prefix/suffix adds specific aspectual meaning.",
    difficulty: 5,
    complexity: 1900,
    source: "IOL",
    year: 2017,
    tags: ["morphology", "indigenous-languages", "verb-systems"]
  },
  {
    title: "Korean Honorifics",
    content: `# Korean Honorific System

Korean changes based on social relationships:

| Plain | Honorific | English |
|-------|-----------|---------|
| 먹다 (meokda) | 드시다 (deusida) | to eat |
| 자다 (jada) | 주무시다 (jumusida) | to sleep |
| 있다 (itda) | 계시다 (gyesida) | to exist/be |
| 집 (jip) | 댁 (daek) | house |

When would you use each form? What social factors determine the choice?`,
    solution: "Honorific forms are used for: elders, superiors, strangers, formal situations. Plain forms for: friends, younger people, informal contexts. Social hierarchy determines language choice.",
    difficulty: 3,
    complexity: 1400,
    source: "APLO",
    year: 2022,
    tags: ["pragmatics", "asian-languages", "honorifics"]
  },
  {
    title: "Welsh Mutations",
    content: `# Welsh Initial Consonant Mutations

Welsh consonants change based on grammatical context:

| Base Form | After 'dy' (your) | After 'ei' (his) | English |
|-----------|-------------------|------------------|---------|
| tad | dad | thad | father |
| pen | ben | phen | head |
| cath | gath | chath | cat |

This is called 'soft mutation' after 'dy' and 'aspirate mutation' after 'ei'.

Apply the pattern:
1. car (car) after 'dy' = ?
2. car after 'ei' = ?`,
    solution: "1. dy gar (your car) - soft mutation: c→g\n2. ei char (his car) - aspirate mutation: c→ch\n\nMutations mark grammatical relationships in Celtic languages.",
    difficulty: 4,
    complexity: 1650,
    source: "UKLO",
    year: 2019,
    tags: ["morphology", "celtic-languages", "mutations"]
  },
  {
    title: "Tagalog Focus System",
    content: `# Tagalog Focus System

Tagalog marks which element is in focus:

| Tagalog | Focus | English |
|---------|-------|---------|
| Bumili ang babae ng libro | Actor | The woman bought a book |
| Binili ng babae ang libro | Object | The book was bought by the woman |
| Binilhan ng babae ng libro ang tindahan | Location | The store was where the woman bought a book |

How does focus affect word order and marking?`,
    solution: "Focus is marked by 'ang' and verb affixes change: -um- (actor), -in- (object), -an (location). Word order is flexible but 'ang' phrase is prominent.",
    difficulty: 4,
    complexity: 1700,
    source: "IOL",
    year: 2021,
    tags: ["syntax", "austronesian-languages", "focus-systems"]
  },
  {
    title: "Sanskrit Sandhi Rules",
    content: `# Sanskrit Sandhi (Sound Changes)

When Sanskrit words combine, sounds change at boundaries:

| Word 1 | Word 2 | Combined | Meaning |
|--------|--------|----------|---------|
| rama | api | ramāpi | Rama also |
| tava | idam | tavēdam | your this |
| mama | uktvā | mamōktvā | my having said |

What phonological rules govern these changes?`,
    solution: "Sandhi rules: a+a→ā (long vowel), a+i→e, a+u→o. Adjacent vowels merge into long vowels or diphthongs to maintain flow.",
    difficulty: 4,
    complexity: 1600,
    source: "IOL",
    year: 2018,
    tags: ["phonology", "indo-european", "sandhi"]
  },
  {
    title: "Maori Possessives",
    content: `# Māori Possession Types

Māori distinguishes two types of possession:

| A-class | O-class | English |
|---------|---------|---------|
| taku pukapuka | tōku whare | my book / my house |
| tāna kai | tōna matua | his/her food / his/her parent |
| ā Mere mahi | ō Mere tīpuna | Mere's work / Mere's ancestors |

What determines A-class vs O-class possession?`,
    solution: "A-class: things you control/create (work, food, books). O-class: things that control/create you (house, parents, ancestors). Active vs passive relationship.",
    difficulty: 3,
    complexity: 1500,
    source: "APLO",
    year: 2023,
    tags: ["morphology", "polynesian-languages", "possession"]
  }
]

async function seedMockData() {
  console.log('🌱 Starting mock data seed...')
  
  try {
    // Create tags first with categories
    const tags = [
      // Linguistic Fields
      { name: "morphology", category: "field" },
      { name: "phonology", category: "field" },
      { name: "syntax", category: "field" },
      { name: "semantics", category: "field" },
      { name: "pragmatics", category: "field" },
      { name: "writing-systems", category: "field" },
      { name: "historical-linguistics", category: "field" },
      
      // Language Families
      { name: "african-languages", category: "region" },
      { name: "asian-languages", category: "region" },
      { name: "european-languages", category: "region" },
      { name: "indigenous-languages", category: "region" },
      { name: "austronesian-languages", category: "family" },
      { name: "semitic-languages", category: "family" },
      { name: "slavic-languages", category: "family" },
      { name: "turkic-languages", category: "family" },
      { name: "celtic-languages", category: "family" },
      { name: "indo-european", category: "family" },
      { name: "polynesian-languages", category: "family" },
      
      // Features
      { name: "tonal-languages", category: "feature" },
      { name: "polysynthetic-languages", category: "feature" },
      { name: "case-systems", category: "feature" },
      { name: "verb-systems", category: "feature" },
      { name: "noun-classes", category: "feature" },
      { name: "vowel-harmony", category: "feature" },
      { name: "mutations", category: "feature" },
      { name: "honorifics", category: "feature" },
      { name: "focus-systems", category: "feature" },
      { name: "possession", category: "feature" },
      { name: "counting-systems", category: "feature" },
      { name: "loanwords", category: "feature" },
      { name: "root-systems", category: "feature" },
      { name: "sandhi", category: "feature" }
    ]
    
    console.log('Creating tags...')
    for (const tag of tags) {
      await prisma.tag.upsert({
        where: { name: tag.name },
        update: {},
        create: { 
          name: tag.name,
          category: tag.category 
        }
      })
    }
    
    // Create some sample users
    console.log('Creating sample users...')
    const users = []
    for (let i = 1; i <= 5; i++) {
      const user = await prisma.user.upsert({
        where: { email: `user${i}@example.com` },
        update: {},
        create: {
          email: `user${i}@example.com`,
          username: `linguist${i}`,
          password: await bcrypt.hash('password123', 10),
          rating: 1200 + (i * 100)
        }
      })
      users.push(user)
    }
    
    // Create problems with proper numbering
    console.log('Creating linguistics problems...')
    let problemNumber = 6 // Start from LH-006 since we already have 5
    
    for (const template of problemTemplates) {
      const tags = await prisma.tag.findMany({
        where: { name: { in: template.tags } }
      })
      
      const problem = await prisma.problem.create({
        data: {
          number: `LH-${String(problemNumber).padStart(3, '0')}`,
          title: template.title,
          content: template.content,
          officialSolution: template.solution,
          difficulty: template.difficulty,
          rating: template.complexity, // rating is the complexity score
          source: template.source,
          year: template.year,
          tags: {
            connect: tags.map(tag => ({ id: tag.id }))
          }
        }
      })
      
      // Add some random solutions from users
      const numSolutions = Math.floor(Math.random() * 3) + 1
      for (let i = 0; i < numSolutions; i++) {
        const randomUser = users[Math.floor(Math.random() * users.length)]
        await prisma.solution.create({
          data: {
            content: `This is a sample solution for ${template.title}. The key insight is understanding the pattern...`,
            problemId: problem.id,
            userId: randomUser.id,
            upvotes: Math.floor(Math.random() * 10),
            downvotes: Math.floor(Math.random() * 3)
          }
        })
      }
      
      // Add some user progress
      for (const user of users) {
        if (Math.random() > 0.5) {
          await prisma.userProgress.create({
            data: {
              userId: user.id,
              problemId: problem.id,
              status: Math.random() > 0.3 ? 'solved' : 'attempted',
              lastAttempt: new Date()
            }
          })
        }
      }
      
      problemNumber++
      console.log(`✅ Created problem: ${template.title}`)
    }
    
    console.log('✅ Mock data seeding completed!')
    console.log(`Created ${problemTemplates.length} problems with solutions and user progress`)
    
  } catch (error) {
    console.error('Error seeding mock data:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run the seed function
seedMockData()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })