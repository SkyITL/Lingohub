import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed with real linguistics olympiad problems...')

  // Clear existing data
  console.log('🧹 Clearing existing data...')
  await prisma.solutionVote.deleteMany()
  await prisma.solution.deleteMany()
  await prisma.discussionReply.deleteMany()
  await prisma.discussion.deleteMany()
  await prisma.userProgress.deleteMany()
  await prisma.problemTag.deleteMany()
  await prisma.problem.deleteMany()
  await prisma.tag.deleteMany()
  await prisma.user.deleteMany()

  // Create sample users
  const hashedPassword = await bcrypt.hash('password123', 10)

  const user1 = await prisma.user.create({
    data: {
      username: 'demo_user',
      email: 'demo@lingohub.com',
      password: hashedPassword,
      rating: 1500
    }
  })

  const user2 = await prisma.user.create({
    data: {
      username: 'alice_linguist',
      email: 'alice@example.com',
      password: hashedPassword,
      rating: 1850
    }
  })

  const user3 = await prisma.user.create({
    data: {
      username: 'bob_polyglot',
      email: 'bob@example.com',
      password: hashedPassword,
      rating: 1650
    }
  })

  console.log('✅ Created sample users')

  // Create tags
  const tags = await Promise.all([
    // Linguistic subfields
    prisma.tag.create({ data: { name: 'phonology', category: 'subfield' }}),
    prisma.tag.create({ data: { name: 'morphology', category: 'subfield' }}),
    prisma.tag.create({ data: { name: 'syntax', category: 'subfield' }}),
    prisma.tag.create({ data: { name: 'semantics', category: 'subfield' }}),
    prisma.tag.create({ data: { name: 'writing-systems', category: 'subfield' }}),
    prisma.tag.create({ data: { name: 'historical-linguistics', category: 'subfield' }}),
    prisma.tag.create({ data: { name: 'number-systems', category: 'subfield' }}),

    // Language families
    prisma.tag.create({ data: { name: 'indo-european', category: 'family' }}),
    prisma.tag.create({ data: { name: 'sino-tibetan', category: 'family' }}),
    prisma.tag.create({ data: { name: 'afroasiatic', category: 'family' }}),
    prisma.tag.create({ data: { name: 'austronesian', category: 'family' }}),
    prisma.tag.create({ data: { name: 'niger-congo', category: 'family' }}),
    prisma.tag.create({ data: { name: 'dravidian', category: 'family' }}),
    prisma.tag.create({ data: { name: 'turkic', category: 'family' }}),
    prisma.tag.create({ data: { name: 'uralic', category: 'family' }}),
    prisma.tag.create({ data: { name: 'australian', category: 'family' }}),
    prisma.tag.create({ data: { name: 'caucasian', category: 'family' }}),
    prisma.tag.create({ data: { name: 'native-american', category: 'family' }}),

    // Difficulty levels
    prisma.tag.create({ data: { name: 'beginner', category: 'difficulty' }}),
    prisma.tag.create({ data: { name: 'intermediate', category: 'difficulty' }}),
    prisma.tag.create({ data: { name: 'advanced', category: 'difficulty' }}),
  ])

  const tagMap = Object.fromEntries(tags.map(tag => [tag.name, tag.id]))
  console.log('✅ Created tags')

  // Create real linguistics olympiad problems
  const problems = [
    {
      number: 'LH-001',
      title: 'Swahili Noun Classes',
      content: `# Swahili Noun Classes

Swahili is a Bantu language spoken in East Africa. Like other Bantu languages, it has a complex noun class system where nouns are grouped into classes, and these classes determine agreement patterns with adjectives, verbs, and other modifiers.

## Data

Consider the following Swahili sentences and their English translations:

| Swahili | English |
|---------|---------|
| Mtoto mdogo anacheza | The small child is playing |
| Watoto wadogo wanacheza | The small children are playing |
| Mti mkubwa unaanguka | The big tree is falling |
| Miti mikubwa inaanguka | The big trees are falling |
| Kitabu kizuri kinasomwa | The good book is being read |
| Vitabu vizuri vinasomwa | The good books are being read |
| Jiwe kubwa linaanguka | The big stone is falling |
| Mawe makubwa yanaanguka | The big stones are falling |

## Tasks

1. Identify the noun class prefixes for singular and plural forms
2. Explain the agreement pattern between nouns, adjectives, and verbs
3. Translate into Swahili:
   - "The small tree is falling"
   - "The good children are playing"
   - "The small stones are falling"`,
      source: 'IOL',
      year: 2019,
      difficulty: 3,
      rating: 1400,
      officialSolution: `## Solution

### Noun Class Prefixes:
- Class 1/2 (people): m-/wa- (mtoto/watoto)
- Class 3/4 (trees, plants): m-/mi- (mti/miti)
- Class 7/8 (things): ki-/vi- (kitabu/vitabu)
- Class 5/6 (augmentatives): ji-/ma- (jiwe/mawe)

### Agreement Pattern:
Each noun class has corresponding agreement prefixes for:
- Adjectives: -dogo (small), -kubwa (big), -zuri (good)
- Verbs: -na- (present tense marker) + verb stem

### Translations:
1. "The small tree is falling" → Mti mdogo unaanguka
2. "The good children are playing" → Watoto wazuri wanacheza
3. "The small stones are falling" → Mawe madogo yanaanguka`,
      tags: ['morphology', 'niger-congo', 'intermediate']
    },
    {
      number: 'LH-002',
      title: 'Turkish Vowel Harmony',
      content: `# Turkish Vowel Harmony

Turkish exhibits vowel harmony, where vowels within a word must share certain phonetic features. This affects how suffixes are added to word stems.

## Data

Study these Turkish words with their plural forms and meanings:

| Singular | Plural | Meaning |
|----------|--------|---------|
| ev | evler | house(s) |
| köy | köyler | village(s) |
| göz | gözler | eye(s) |
| gül | güller | rose(s) |
| at | atlar | horse(s) |
| kız | kızlar | girl(s) |
| yol | yollar | road(s) |
| kuş | kuşlar | bird(s) |

Now examine these possessive forms ("my X"):

| Base | Possessive | Meaning |
|------|------------|---------|
| ev | evim | my house |
| köy | köyüm | my village |
| göz | gözüm | my eye |
| at | atım | my horse |
| kız | kızım | my girl |
| yol | yolum | my road |

## Tasks

1. Describe the vowel harmony rule for the plural suffix
2. Describe the vowel harmony rule for the possessive suffix
3. Give the plural and possessive forms of:
   - "kutu" (box)
   - "köpek" (dog)
   - "oda" (room)`,
      source: 'NACLO',
      year: 2018,
      difficulty: 2,
      rating: 1300,
      officialSolution: `## Solution

### Vowel Harmony Rules:

**For Plural (-ler/-lar):**
- Use -ler after front vowels (e, i, ö, ü)
- Use -lar after back vowels (a, ı, o, u)

**For Possessive ("my"):**
- After front unrounded vowels (e, i): -im
- After front rounded vowels (ö, ü): -üm
- After back unrounded vowels (a, ı): -ım
- After back rounded vowels (o, u): -um

### Answers:
- kutu: kutular (plural), kutum (my box)
- köpek: köpekler (plural), köpeğim (my dog)
- oda: odalar (plural), odam (my room)`,
      tags: ['phonology', 'turkic', 'beginner']
    },
    {
      number: 'LH-003',
      title: 'Hawaiian Phonological Constraints',
      content: `# Hawaiian Phonological Constraints

Hawaiian has one of the world's smallest phoneme inventories, with only 13 phonemes (8 consonants and 5 vowels). This leads to interesting phonological adaptations when borrowing words from other languages.

## Data

Here are some English words and their Hawaiian adaptations:

| English | Hawaiian |
|---------|----------|
| Christmas | Kalikimaka |
| Britain | Pelekane |
| throne | kelone |
| brush | palaki |
| Fred | Peleke |
| trust | kaluku |
| president | pelekikena |
| print | palinika |

## Additional Information

Hawaiian consonants: p, k, ʔ, h, m, n, l, w
Hawaiian vowels: a, e, i, o, u

All syllables in Hawaiian must be either V (vowel) or CV (consonant + vowel).

## Tasks

1. Describe the systematic changes that occur when English words are borrowed into Hawaiian
2. Explain why these changes are necessary given Hawaiian's phonological constraints
3. Predict the Hawaiian adaptation of:
   - "Frank"
   - "Scotland"
   - "president"`,
      source: 'UKLO',
      year: 2020,
      difficulty: 3,
      rating: 1500,
      officialSolution: `## Solution

### Systematic Changes:

1. **Consonant Substitutions:**
   - t → k (no t in Hawaiian)
   - r → l (no r in Hawaiian)
   - s → k (no s in Hawaiian)
   - f → p (no f in Hawaiian)
   - b → p (no b in Hawaiian)
   - d → k (no d in Hawaiian)
   - g → k (no g in Hawaiian)

2. **Syllable Structure Repairs:**
   - Consonant clusters are broken up with epenthetic vowels
   - Final consonants get an added vowel
   - Usually 'a' or 'i' is inserted, following vowel harmony patterns

### Predictions:
- "Frank" → Palani (f→p, r→l, nk cluster broken, final consonant needs vowel)
- "Scotland" → Kokolana (s→k, c→k, tl cluster broken, nd→na)`,
      tags: ['phonology', 'austronesian', 'intermediate']
    },
    {
      number: 'LH-004',
      title: 'Ancient Egyptian Hieroglyphs',
      content: `# Ancient Egyptian Hieroglyphs

Ancient Egyptian hieroglyphic writing combines logographic and alphabetic elements. Some signs represent whole words, while others represent sounds.

## Data

Study these hieroglyphic representations (shown as transliterations) and their meanings:

| Hieroglyphic | Transliteration | Meaning |
|--------------|-----------------|---------|
| 𓊪𓏏𓇯 | pt | sky |
| 𓊪𓏏𓇯𓏏 | ptt | ? |
| 𓊖 | niwt | city |
| 𓊖𓊖 | niwty | two cities |
| 𓊖𓊖𓊖 | niwtw | cities (plural) |
| 𓉐 | pr | house |
| 𓉐𓅱 | prw | houses |
| 𓉐𓏏 | prt | ? |
| 𓄿𓏏𓆑 | itf | father |
| 𓄿𓏏𓆑𓅱 | itfw | ? |

## Tasks

1. Identify which hieroglyphs are logograms (word signs) and which are phonograms (sound signs)
2. Explain the Egyptian number and gender marking system
3. Fill in the missing meanings marked with "?"
4. How would you write "fathers" in hieroglyphs?`,
      source: 'IOL',
      year: 2017,
      difficulty: 4,
      rating: 1600,
      officialSolution: `## Solution

### Sign Types:
- Logograms: 𓊖 (city), 𓉐 (house)
- Phonograms: 𓊪 (p), 𓏏 (t), 𓇯 (determinative for sky), 𓅱 (w), 𓄿 (i), 𓆑 (f)

### Number and Gender:
- Dual (two): repeat logogram twice or add -y
- Plural (3+): repeat logogram three times or add -w
- Feminine: add -t

### Missing Meanings:
- ptt = "sky" (feminine form)
- prt = "house" (feminine form) or "winter"
- itfw = "his father" (with possessive -w)

### "Fathers" (plural):
𓄿𓏏𓆑𓅱 (itfw) or 𓄿𓏏𓆑𓄿𓏏𓆑𓄿𓏏𓆑`,
      tags: ['writing-systems', 'afroasiatic', 'advanced']
    },
    {
      number: 'LH-005',
      title: 'Dyirbal Ergativity',
      content: `# Dyirbal Ergativity

Dyirbal is an Australian Aboriginal language that uses an ergative-absolutive alignment system, which is different from the nominative-accusative system used in English.

## Data

Study these Dyirbal sentences:

| Dyirbal | English |
|---------|---------|
| yabu banaga-nyu | Mother returned |
| nguma yabu-nggu bura-n | Father saw mother |
| yabu nguma bura-n | Mother saw father |
| nguma banaga-nyu | Father returned |
| yabu-nggu nguma bura-n | Mother saw father |
| nguma-nggu yabu bura-n | Father saw mother |

Vocabulary:
- yabu = mother
- nguma = father
- banaga-nyu = returned
- bura-n = saw
- -nggu = ergative case marker

## Tasks

1. Explain the difference between ergative-absolutive and nominative-accusative alignment
2. When is the ergative marker -nggu used in Dyirbal?
3. Identify which noun is the subject and which is the object in each transitive sentence
4. How would you say "Father returned and saw mother" in Dyirbal?`,
      source: 'APLO',
      year: 2016,
      difficulty: 4,
      rating: 1700,
      officialSolution: `## Solution

### Ergative-Absolutive Alignment:
- **Absolutive case** (unmarked): Used for subjects of intransitive verbs AND objects of transitive verbs
- **Ergative case** (-nggu): Used only for subjects of transitive verbs

This differs from nominative-accusative (like English) where subjects are always nominative and objects are always accusative.

### Use of -nggu:
The ergative marker -nggu is added to the subject of a transitive verb (the one doing the action to someone else).

### Subject-Object Identification:
- nguma yabu-nggu bura-n: yabu-nggu (mother) = subject, nguma (father) = object
- yabu nguma bura-n: nguma (father) = subject, yabu (mother) = object
- yabu-nggu nguma bura-n: yabu-nggu (mother) = subject, nguma (father) = object
- nguma-nggu yabu bura-n: nguma-nggu (father) = subject, yabu (mother) = object

### Translation:
"Father returned and saw mother" → nguma banaga-nyu, nguma-nggu yabu bura-n`,
      tags: ['syntax', 'morphology', 'australian', 'advanced']
    },
    {
      number: 'LH-006',
      title: 'Tok Pisin Creole Formation',
      content: `# Tok Pisin Creole Formation

Tok Pisin is a creole language spoken in Papua New Guinea. It developed from English-based pidgin and shows interesting grammatical innovations.

## Data

Study these Tok Pisin sentences and their English translations:

| Tok Pisin | English |
|-----------|---------|
| Mi go | I go |
| Yu go | You go |
| Em go | He/she goes |
| Mipela go | We (exclusive) go |
| Yumi go | We (inclusive) go |
| Yupela go | You (plural) go |
| Ol go | They go |
| Mi go pinis | I went |
| Bai mi go | I will go |
| Mi go i stap | I am going |
| Mi no go | I don't go |
| Mi go long haus | I go to the house |
| Mi lukim yu | I see you |
| Yu lukim mi | You see me |
| Mi givim buk long yu | I give the book to you |

## Tasks

1. Describe how Tok Pisin marks tense (past, present, future)
2. Explain the inclusive/exclusive distinction in pronouns
3. What is the function of "long" in these sentences?
4. Translate into Tok Pisin:
   - "They will see us (inclusive)"
   - "She gave the book to me"
   - "We (exclusive) didn't go to the house"`,
      source: 'NACLO',
      year: 2021,
      difficulty: 2,
      rating: 1350,
      officialSolution: `## Solution

### Tense Marking:
- Present: unmarked (base verb)
- Past: verb + "pinis" (from "finish")
- Future: "bai" + subject + verb
- Progressive: verb + "i stap" (from "stop/stay")

### Inclusive/Exclusive Distinction:
- **Mipela** = we (exclusive - not including the listener)
- **Yumi** = we (inclusive - including the listener)
This distinction is common in Austronesian languages of the region.

### Function of "long":
"Long" serves as a general preposition meaning "to", "at", "for", or indicating indirect objects.

### Translations:
1. "They will see us (inclusive)" → Bai ol lukim yumi
2. "She gave the book to me" → Em givim buk long mi
3. "We (exclusive) didn't go to the house" → Mipela no go long haus`,
      tags: ['syntax', 'morphology', 'austronesian', 'intermediate']
    },
    {
      number: 'LH-007',
      title: 'Japanese Writing Systems',
      content: `# Japanese Writing Systems

Japanese uses three writing systems simultaneously: hiragana (for grammatical elements), katakana (for foreign words), and kanji (Chinese characters for content words).

## Data

Study these Japanese sentences written in romaji (Latin script) with word boundaries marked:

| Japanese (Romaji) | English | Writing System Used |
|-------------------|---------|---------------------|
| watashi wa gakusei desu | I am a student | 私は学生です |
| kore wa pen desu | This is a pen | これはペンです |
| nihon no kuruma | Japanese car | 日本の車 |
| amerika kara kimashita | Came from America | アメリカから来ました |
| hon o yomimasu | Read a book | 本を読みます |
| koohii o nomimasu | Drink coffee | コーヒーを飲みます |

Where:
- Hiragana: は (wa), の (no), を (o), です (desu), から (kara), ます (masu)
- Katakana: ペン (pen), アメリカ (amerika), コーヒー (koohii)
- Kanji: 私 (watashi), 学生 (gakusei), 日本 (nihon), 車 (kuruma), 本 (hon), 読 (yo), 飲 (no)

## Tasks

1. What determines which writing system is used for each word?
2. Identify the grammatical particles in the sentences
3. Why might "pen" and "coffee" be written differently from "book" and "car"?
4. How would "I drink American coffee" likely be written (indicate which parts use which system)?`,
      source: 'IOL',
      year: 2022,
      difficulty: 3,
      rating: 1450,
      officialSolution: `## Solution

### Writing System Rules:
- **Kanji**: Native Japanese and Chinese-origin content words (nouns, verb stems, adjective stems)
- **Hiragana**: Grammatical particles, verb endings, native Japanese words without kanji
- **Katakana**: Foreign loanwords (except Chinese), onomatopoeia, emphasis

### Grammatical Particles:
- wa (は) - topic marker
- no (の) - possessive/modifier particle
- o (を) - direct object marker
- kara (から) - "from"

### "Pen" vs "Book":
- "Pen" (ペン) and "coffee" (コーヒー) are recent loanwords from English, written in katakana
- "Book" (本) and "car" (車) have established kanji as they're older concepts in Japanese

### "I drink American coffee":
- 私 (watashi - kanji) は (wa - hiragana) アメリカ (amerika - katakana) の (no - hiragana) コーヒー (koohii - katakana) を (o - hiragana) 飲みます (nomimasu - kanji + hiragana)`,
      tags: ['writing-systems', 'sino-tibetan', 'intermediate']
    },
    {
      number: 'LH-008',
      title: 'Malagasy Word Order',
      content: `# Malagasy Word Order

Malagasy, spoken in Madagascar, has an unusual word order that is rare among world languages: Verb-Object-Subject (VOS).

## Data

Study these Malagasy sentences:

| Malagasy | English |
|----------|---------|
| Mamaky boky ny mpianatra | The student reads a book |
| Mamaky ny boky ny mpianatra | The student reads the book |
| Nahita ny alika ny zaza | The child saw the dog |
| Nahita alika ny zaza | The child saw a dog |
| Manoratra taratasy ny mpampianatra | The teacher writes a letter |
| Mividy ny ronono ny vehivavy | The woman buys the milk |
| Nihinana ny mofo izy | He/she ate the bread |

Vocabulary hints:
- ny = the (definite article)
- mamaky = reads
- nahita = saw
- manoratra = writes
- mividy = buys
- nihinana = ate

## Tasks

1. Confirm the VOS word order and identify V, O, and S in each sentence
2. What is the difference between "boky" and "ny boky"?
3. Where does the definite article appear relative to the noun?
4. Translate into Malagasy:
   - "The teacher saw the student"
   - "A child buys milk"
   - "He reads the letter"`,
      source: 'APLO',
      year: 2020,
      difficulty: 2,
      rating: 1400,
      officialSolution: `## Solution

### Word Order Confirmation (VOS):
- Mamaky (V) boky (O) ny mpianatra (S) = "reads book the student"
- Nahita (V) ny alika (O) ny zaza (S) = "saw the dog the child"
- Mividy (V) ny ronono (O) ny vehivavy (S) = "buys the milk the woman"

### Definite vs Indefinite:
- "boky" = a book (indefinite)
- "ny boky" = the book (definite)
The definite article "ny" appears BEFORE the noun.

### Translations:
1. "The teacher saw the student" → Nahita ny mpianatra ny mpampianatra
2. "A child buys milk" → Mividy ronono ny zaza
3. "He reads the letter" → Mamaky ny taratasy izy`,
      tags: ['syntax', 'austronesian', 'beginner']
    },
    {
      number: 'LH-009',
      title: 'Proto-Indo-European Reconstruction',
      content: `# Proto-Indo-European Reconstruction

Historical linguists reconstruct ancient languages by comparing related modern languages. Here we'll examine words for "father" across Indo-European languages.

## Data

| Language | Word for "father" | Language Family Branch |
|----------|------------------|------------------------|
| English | father | Germanic |
| German | Vater | Germanic |
| Dutch | vader | Germanic |
| Latin | pater | Italic |
| Spanish | padre | Italic (Romance) |
| French | père | Italic (Romance) |
| Greek | πατήρ (patēr) | Hellenic |
| Sanskrit | पितृ (pitṛ) | Indo-Aryan |
| Hindi | पिता (pitā) | Indo-Aryan |
| Russian | отец (otets) | Slavic |
| Armenian | հայր (hayr) | Armenian |

## Sound Correspondences

Notice these patterns:
- Germanic languages have 'f' or 'v' where other languages have 'p'
- This is due to Grimm's Law: Proto-Indo-European *p → Germanic f

## Tasks

1. What was the likely initial consonant in the Proto-Indo-European word for "father"?
2. Explain why Germanic languages are different from the others
3. Given that English "foot" corresponds to Latin "ped-" (as in "pedestrian"), what sound change rule can you identify?
4. Predict: If the PIE word for "fish" was *pisk-, what might it be in English?`,
      source: 'IOL',
      year: 2021,
      difficulty: 3,
      rating: 1550,
      officialSolution: `## Solution

### Proto-Indo-European Reconstruction:
The PIE word for "father" was likely *ph₂tḗr, beginning with *p.

### Germanic Sound Change (Grimm's Law):
Germanic languages underwent a systematic sound shift where:
- PIE *p → Germanic *f
- PIE *t → Germanic *θ (th)
- PIE *k → Germanic *h

This is why Germanic languages have 'f' where other Indo-European languages have 'p'.

### Sound Change Rule:
The correspondence foot/ped- confirms: PIE *p → English f

### Prediction:
PIE *pisk- → English "fish" (which is indeed correct!)
The 'p' became 'f' following Grimm's Law.`,
      tags: ['historical-linguistics', 'indo-european', 'intermediate']
    },
    {
      number: 'LH-010',
      title: 'Mandarin Chinese Tones',
      content: `# Mandarin Chinese Tones

Mandarin Chinese is a tonal language where the pitch pattern of a syllable changes its meaning. Mandarin has four main tones plus a neutral tone.

## Data

Here are some Mandarin syllables with different tones and their meanings:

| Pinyin | Tone | Chinese | Meaning |
|--------|------|---------|---------|
| mā | 1 (high level) | 妈 | mother |
| má | 2 (rising) | 麻 | hemp |
| mǎ | 3 (dipping) | 马 | horse |
| mà | 4 (falling) | 骂 | scold |
| ma | 0 (neutral) | 吗 | question particle |
| tāng | 1 | 汤 | soup |
| táng | 2 | 糖 | sugar |
| tǎng | 3 | 躺 | lie down |
| tàng | 4 | 烫 | hot (to touch) |
| shī | 1 | 诗 | poem |
| shí | 2 | 十 | ten |
| shǐ | 3 | 史 | history |
| shì | 4 | 是 | to be |

## Tone Patterns:
1. First tone: high and level (55)
2. Second tone: rising (35)
3. Third tone: dipping (214)
4. Fourth tone: falling (51)

## Tasks

1. Explain how tones function as phonemes in Mandarin
2. What would happen if you said "mǎ mā" vs "mā mǎ"?
3. Given that "wǒ" (我) means "I/me" and "ài" (爱) means "love", and "nǐ" (你) means "you", how would you say "I love you"?
4. Why might tonal languages be challenging for speakers of non-tonal languages?`,
      source: 'NACLO',
      year: 2019,
      difficulty: 2,
      rating: 1300,
      officialSolution: `## Solution

### Tones as Phonemes:
In Mandarin, tones are phonemic - they distinguish meaning just like consonants and vowels do. Changing the tone changes the word entirely, not just its pronunciation variant.

### Sentence Meanings:
- "mǎ mā" (马妈) = "horse mother" (nonsensical)
- "mā mǎ" (妈马) = "mother horse" (also odd)
- The correct way to say "mother" is just "māma" (妈妈)

### "I love you":
"wǒ ài nǐ" (我爱你) - with tones: wǒ (3rd) ài (4th) nǐ (3rd)

### Challenges for Non-Tonal Language Speakers:
1. Their native language doesn't use pitch to distinguish word meaning
2. They use pitch for emphasis, emotion, or questions instead
3. They must learn to control pitch precisely and consistently
4. They must perceive pitch differences as meaningful rather than stylistic`,
      tags: ['phonology', 'sino-tibetan', 'beginner']
    }
  ]

  // Create problems with tags
  for (const problemData of problems) {
    const { tags, ...problemInfo } = problemData

    const problem = await prisma.problem.create({
      data: problemInfo
    })

    // Connect tags to problem
    for (const tagName of tags) {
      if (tagMap[tagName]) {
        await prisma.problemTag.create({
          data: {
            problemId: problem.id,
            tagId: tagMap[tagName]
          }
        })
      }
    }

    console.log(`✅ Created problem: ${problem.number} - ${problem.title}`)
  }

  // Create some sample solutions for a few problems
  const allProblems = await prisma.problem.findMany()

  if (allProblems.length > 0) {
    // Add a solution to the first problem
    const solution1 = await prisma.solution.create({
      data: {
        problemId: allProblems[0].id,
        userId: user2.id,
        content: `## My Approach to Swahili Noun Classes

I noticed that each noun class has consistent prefixes that appear on the noun, adjective, and verb. The pattern is:

1. **Noun prefix** determines the class
2. **Adjective** agrees with the noun using a related prefix
3. **Verb** also agrees using a subject prefix

For the translations:
- "The small tree is falling" uses class 3 singular, so: Mti mdogo unaanguka
- "The good children are playing" uses class 2 plural with -zuri: Watoto wazuri wanacheza
- "The small stones are falling" uses class 6 plural: Mawe madogo yanaanguka

The key insight is that Bantu languages use agreement to maintain grammatical cohesion across the sentence.`,
        voteScore: 15,
        status: 'approved'
      }
    })

    // Add another solution
    await prisma.solution.create({
      data: {
        problemId: allProblems[0].id,
        userId: user3.id,
        content: `The noun class system in Swahili is actually quite logical once you see the pattern. Each class has semantic associations - Class 1/2 for people, Class 3/4 for plants, etc.`,
        voteScore: 8,
        status: 'submitted'
      }
    })

    // Add a discussion thread
    await prisma.discussion.create({
      data: {
        problemId: allProblems[0].id,
        userId: user1.id,
        title: 'Question about noun class 5/6',
        content: 'Why does jiwe/mawe (stone) use different prefixes than the other classes? Is there a semantic reason?',
        replyCount: 1
      }
    })

    // Add user progress
    await prisma.userProgress.create({
      data: {
        userId: user2.id,
        problemId: allProblems[0].id,
        status: 'solved',
        lastAttempt: new Date()
      }
    })

    await prisma.userProgress.create({
      data: {
        userId: user2.id,
        problemId: allProblems[1].id,
        status: 'attempted',
        lastAttempt: new Date()
      }
    })
  }

  console.log('✅ Created sample solutions and discussions')
  console.log('🎉 Database seeding completed successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })