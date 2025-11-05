# Linguistics Olympiad Problem Categories

Based on the classification system from linguistics olympiad literature, this document defines the official problem categories for LingoHub.

## Primary Categories

These are the main linguistic subfields that problems can be classified under. Each problem should have **exactly one** primary category.

### 1. Writing Systems
**Code**: `writing-systems`
**Description**: Problems involving scripts, orthography, and writing conventions

**Subcategories**:
- Pictographic/Ideographic systems
- Logographic systems (Chinese characters)
- Syllabic systems (syllabaries) - Japanese kana, etc.
- Alphabetic systems (alphabets)
- Abjad systems (Arabic, Hebrew)
- Abugida systems (Devanagari, Ethiopic, Thai)
- Featural systems (Korean Hangul)
- Sign language notation
- Braille alphabet

**Example Problems**: Hmong, Luwian, Tagbanwa, Japanese Braille, Armenian, Ogham, New York Point, Lepcha, Arabic-Hebrew, Javanese, Thai

---

### 2. Phonetics
**Code**: `phonetics`
**Description**: Physical properties and classification of speech sounds

**Subcategories**:
- Classification of sounds
  - Place of articulation
  - Manner of articulation
  - Voicing
  - Other consonant characteristics
- Vowels
  - Backness
  - Height
  - Roundness
  - Other vowel characteristics
- Syllable structure and syllabification
- Versification (poetic meter)
- Stress patterns
- Tone systems

**Example Problems**: Somali, Manobo

---

### 3. Phonology
**Code**: `phonology`
**Description**: Sound patterns and phonological rules in languages

**Subcategories**:
- Complementary distribution
- Phonological processes
- Vowel harmony
- Initial consonant mutation

**Example Problems**: Irish, Roro, Behaviour of nasal consonants, Valley Yokuts, Evenki, La-Mi, Tolaki, Sorba, Arabic, Sesotho, Dutch, Finnish-Estonian, Bari, Cushillococa Ticuna

---

### 4. Morphology (Noun and Noun Phrase)
**Code**: `morphology-noun`
**Description**: Word formation and structure focusing on nouns

**Subcategories**:
- Basic morphological analysis
- Variables of the noun (case, number, gender)
- Classifiers
- Reduplication
- Suppletion
- Expressing possession
- Colour terms

**Example Problems**: Zulu, Swedish, Maori, Bulgarian, Japanese (classifiers), Fijian, Ancient Greek, Colours, Ulwa, Palauan, Norwegian, Afrihili, Maltese, Latvian, Ilocano, Irish, Iaai

---

### 5. Morphology (Verb and Verb Phrase)
**Code**: `morphology-verb`
**Description**: Word formation and structure focusing on verbs

**Subcategories**:
- Variables of the verb
- TAM (Tense, Aspect, Mood)
  - Tense
  - Aspect
  - Mood (Realis/Irrealis)
  - Verbal expression of modality
  - Evidentiality
- Arguments and argument structure
- Segmenting verbs
- Patterns for arguments
- Pronoun hierarchy
- Verb semantics

**Example Problems**: Swahili, Dabida, Ge'ez, Itelmen, Proto-Algonquian, Tabasaran, Swahili, Tariana, Gec, Gyarung, Hakhun, Cree, Ainu, Rotokas, Dinka

---

### 6. Syntax
**Code**: `syntax`
**Description**: Sentence structure and word order patterns

**Subcategories**:
- Word order patterns
- Focusing
- Morphosyntactic alignment
- Split alignment

**Example Problems**: Nung, Morphosyntactic alignments, Luiseño, Beja, Mundari, Swahili, Arabic, Welsh, Tadaksahak, Sandawe

---

### 7. Semantics
**Code**: `semantics`
**Description**: Meaning in language, especially logical and compositional aspects

**Subcategories**:
- Graph method
- Semantic relationships
- Logic problems

**Example Problems**: Lango, Guarani, Basque, Turkish, Chinese, Hausa, Tetum, Malagasy

---

### 8. Number Systems
**Code**: `number-systems`
**Description**: Counting systems and numeral patterns

**Subcategories**:
- Basic counting systems
- Overcounting
- Subtractive systems
- Body-part counting systems
- Time expressions

**Example Problems**: Quenya, Embera Chami, Yup'ik, Umbu-Ungu, Huli, Yoruba, Czech, Swahili, Danish, Estonian, Waorani, Selkup, Vambon, Alamblak, Chabu, Tifal, Mansi

---

### 9. Kinship Systems
**Code**: `kinship`
**Description**: Family relationship terminology and kinship structures

**Example Problems**: Arawak

---

### 10. Orientation & Spatial Systems
**Code**: `orientation-spatial`
**Description**: Directional and spatial reference systems

**Example Problems**: Manam

---

### 11. Other
**Code**: `other`
**Description**: Problems that don't fit neatly into the above categories or combine multiple areas

This includes hybrid problems, computational linguistics puzzles, and problems with unique characteristics.

---

## Secondary Tags

These provide additional classification and can be applied in combination with primary categories.

### Linguistic Features
- `pattern-recognition` - Requires identifying patterns
- `logical-reasoning` - Heavy logical/mathematical component
- `minimal-pairs` - Contrast analysis
- `reconstruction` - Historical reconstruction
- `comparative-method` - Cross-linguistic comparison
- `segmentation` - Breaking words/sentences into parts
- `translation` - Translation tasks
- `correspondence` - Finding systematic correspondences
- `rule-discovery` - Discovering linguistic rules

### Language Families
- `indo-european` - IE languages
- `sino-tibetan` - Chinese, Tibetan, Burmese
- `afro-asiatic` - Semitic, Egyptian, Cushitic, Berber
- `niger-congo` - Bantu and other African
- `austronesian` - Polynesian, Indonesian, Malay
- `uralic` - Finnish, Hungarian, Estonian
- `turkic` - Turkish, etc.
- `caucasian` - Georgian, Chechen
- `dravidian` - Tamil, Telugu
- `native-american` - Indigenous American
- `aboriginal-australian` - Australian indigenous
- `papuan` - New Guinea languages
- `hmong-mien` - Hmong, Mien
- `tai-kadai` - Thai, Lao
- `constructed` - Artificial languages
- `sign-language` - Visual-gestural languages
- `isolate` - Language isolates (Basque, etc.)

### Geographical Regions
- `africa`
- `americas`
- `asia`
- `europe`
- `oceania`
- `middle-east`

### Special Characteristics
- `rare-language` - Understudied/endangered
- `unusual-feature` - Typologically rare
- `extinct` - Dead/historical language
- `ancient` - Ancient languages
- `cipher` - Encoded/cryptographic
- `beginner-friendly` - Good for newcomers
- `complex-data` - Large datasets/tables
- `multi-step` - Multiple sub-problems
- `cultural-context` - Requires cultural knowledge

---

## Tagging Guidelines

### Every problem must have:
1. **Exactly 1 primary category** (from categories 1-11)
2. **2-5 secondary tags** (linguistic features, language family, region, special characteristics)
3. **1 difficulty rating** (1-5 stars)
4. **1 source** (IOL, APLO, NACLO, UKLO, or other)
5. **1 year**

### Examples:

**Problem: "Zulu Noun Classes"**
- Primary: `morphology-noun`
- Secondary: `pattern-recognition`, `niger-congo`, `africa`, `beginner-friendly`
- Difficulty: 2
- Source: IOL
- Year: 2007

**Problem: "Swahili Verb Arguments"**
- Primary: `morphology-verb`
- Secondary: `segmentation`, `pattern-recognition`, `niger-congo`, `africa`
- Difficulty: 3
- Source: IOL
- Year: 2008

**Problem: "Japanese Classifiers"**
- Primary: `morphology-noun`
- Secondary: `pattern-recognition`, `cultural-context`, `asia`
- Difficulty: 3
- Source: APLO
- Year: 2012

**Problem: "Quenya Number System"**
- Primary: `number-systems`
- Secondary: `pattern-recognition`, `constructed`, `beginner-friendly`
- Difficulty: 2
- Source: IOL
- Year: 2009

**Problem: "Ancient Greek Possession"**
- Primary: `morphology-noun`
- Secondary: `indo-european`, `europe`, `ancient`, `extinct`
- Difficulty: 4
- Source: IOL
- Year: 2015

**Problem: "Hmong Script"**
- Primary: `writing-systems`
- Secondary: `hmong-mien`, `asia`, `rare-language`
- Difficulty: 3
- Source: IOL
- Year: 2011

**Problem: "Nung Word Order"**
- Primary: `syntax`
- Secondary: `sino-tibetan`, `asia`, `rare-language`
- Difficulty: 4
- Source: IOL
- Year: 2016

---

## Color Coding for UI

### Primary Categories
- `writing-systems`: Purple (#9333EA)
- `phonetics`: Pink (#EC4899)
- `phonology`: Rose (#F43F5E)
- `morphology-noun`: Blue (#3B82F6)
- `morphology-verb`: Indigo (#6366F1)
- `syntax`: Green (#10B981)
- `semantics`: Yellow (#EAB308)
- `number-systems`: Orange (#F97316)
- `kinship`: Teal (#14B8A6)
- `orientation-spatial`: Cyan (#06B6D4)
- `other`: Gray (#6B7280)

### Secondary Tags
- Language families: Cyan shades
- Geographic regions: Green shades
- Linguistic features: Blue shades
- Special characteristics: Gray shades
- Difficulty: Gray → Blue → Yellow → Orange → Red (as currently implemented)

---

## Implementation Notes

1. **Database Schema**: The Tag model should have a `category` field to distinguish primary from secondary tags
2. **Search/Filter**: Users should be able to filter by:
   - Primary category (single select)
   - Secondary tags (multi-select)
   - Difficulty
   - Source
   - Year range
3. **Display**: Problems should show:
   - Primary category badge (large, colored)
   - Up to 3 secondary tag badges (smaller)
   - "+" indicator if more tags exist
4. **Validation**: Backend should enforce that each problem has exactly 1 primary category
