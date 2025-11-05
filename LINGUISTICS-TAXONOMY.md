# Linguistics Problem Classification Taxonomy

This document defines the classification system for linguistics olympiad problems in LingoHub.

## Primary Categories (Linguistic Subfields)

### 1. Phonetics & Phonology
**Description**: Study of speech sounds and sound patterns
- **Phonetics**: Physical properties of sounds (articulation, acoustics)
- **Phonology**: Sound patterns and rules in languages
- **IPA**: International Phonetic Alphabet transcription
- **Stress & Tone**: Stress patterns, tonal systems
- **Syllable Structure**: Syllabification rules

**Example Problem Types**:
- Transcribing sounds using IPA
- Finding sound change patterns
- Identifying phonological rules
- Analyzing tone systems

### 2. Morphology
**Description**: Study of word formation and structure
- **Inflection**: Grammatical endings (tense, number, case)
- **Derivation**: Word formation (prefixes, suffixes)
- **Compounding**: Combining words
- **Allomorphy**: Morpheme variation based on context
- **Reduplication**: Repetition patterns

**Example Problem Types**:
- Analyzing verb conjugation patterns
- Identifying morpheme boundaries
- Finding inflectional paradigms
- Segmenting agglutinative words

### 3. Syntax
**Description**: Study of sentence structure and word order
- **Word Order**: SOV, SVO, VSO patterns
- **Agreement**: Subject-verb, noun-adjective agreement
- **Case Systems**: Nominative, accusative, ergative
- **Dependency**: Grammatical relationships
- **Tree Structures**: Phrase structure analysis

**Example Problem Types**:
- Determining word order rules
- Analyzing case marking patterns
- Building syntax trees
- Finding agreement rules

### 4. Semantics
**Description**: Study of meaning in language
- **Lexical Semantics**: Word meanings
- **Compositional Semantics**: Phrase and sentence meaning
- **Logical Relations**: Entailment, contradiction
- **Ambiguity**: Multiple interpretations
- **Semantic Fields**: Related word groups

**Example Problem Types**:
- Analyzing meaning relationships
- Resolving ambiguities
- Finding semantic patterns
- Logical reasoning with language

### 5. Pragmatics
**Description**: Study of language in context
- **Speech Acts**: Requests, commands, promises
- **Honorifics**: Politeness systems
- **Context Dependency**: Situational meaning
- **Implicature**: Implied meaning
- **Discourse**: Conversation structure

**Example Problem Types**:
- Analyzing honorific systems (Japanese, Korean)
- Understanding contextual usage
- Speech act identification

### 6. Writing Systems
**Description**: Study of scripts and orthography
- **Alphabet**: Letter-based systems
- **Syllabary**: Syllable-based systems (kana)
- **Logography**: Character-based systems (Chinese)
- **Abjad**: Consonant-only scripts (Arabic, Hebrew)
- **Abugida**: Consonant-vowel scripts (Devanagari, Ethiopic)
- **Historical Scripts**: Ancient writing systems

**Example Problem Types**:
- Deciphering unknown scripts
- Matching sounds to symbols
- Finding orthographic patterns
- Script evolution analysis

### 7. Historical Linguistics
**Description**: Study of language change over time
- **Sound Change**: Vowel shifts, consonant changes
- **Comparative Method**: Reconstructing proto-languages
- **Cognates**: Related words across languages
- **Language Families**: Genetic relationships
- **Etymology**: Word origins

**Example Problem Types**:
- Identifying sound correspondences
- Reconstructing proto-forms
- Finding cognate sets
- Tracing word evolution

### 8. Typology & Universals
**Description**: Cross-linguistic patterns and variation
- **Word Order Typology**: Universal correlations
- **Morphological Typology**: Isolating, agglutinative, fusional
- **Phonological Universals**: Common sound patterns
- **Implicational Universals**: If X then Y patterns

**Example Problem Types**:
- Identifying language type
- Finding universal patterns
- Cross-linguistic comparison

### 9. Lexical & Semantics
**Description**: Vocabulary and meaning systems
- **Number Systems**: Counting and numerals
- **Kinship Terms**: Family relationship vocabulary
- **Color Terms**: Color categorization
- **Classifiers**: Noun classification systems
- **Spatial Terms**: Location and direction

**Example Problem Types**:
- Decoding number systems
- Analyzing kinship terminology
- Understanding classifier usage
- Spatial deixis problems

### 10. Computational & Mathematical
**Description**: Logic and pattern recognition in language
- **Formal Languages**: Regular, context-free grammars
- **Automata**: Finite state machines
- **String Manipulation**: Pattern matching
- **Combinatorics**: Counting possibilities
- **Logic Puzzles**: Constraint satisfaction

**Example Problem Types**:
- Building finite state automata
- Grammar generation
- Logical deduction problems
- Algorithmic pattern finding

## Secondary Tags (Problem Features)

### Difficulty Modifiers
- `beginner-friendly`: Suitable for newcomers
- `pattern-recognition`: Requires finding patterns
- `logical-reasoning`: Heavy logical component
- `complex-data`: Large datasets or tables
- `multi-step`: Multiple sub-problems
- `minimal-pairs`: Contrast analysis

### Language Families
- `indo-european`: IE languages
- `sino-tibetan`: Chinese, Tibetan, Burmese
- `afro-asiatic`: Semitic, Egyptian
- `niger-congo`: Bantu and other African languages
- `austronesian`: Polynesian, Indonesian
- `uralic`: Finnish, Hungarian
- `altaic`: Turkic, Mongolic
- `caucasian`: Georgian, Chechen
- `dravidian`: Tamil, Telugu
- `native-american`: Indigenous American languages
- `aboriginal-australian`: Australian indigenous languages
- `constructed`: Artificial languages
- `sign-language`: Visual-gestural languages
- `extinct`: Dead/historical languages

### Geographical Regions
- `africa`
- `americas`
- `asia`
- `europe`
- `oceania`
- `middle-east`

### Special Features
- `rare-language`: Understudied/endangered languages
- `unusual-feature`: Typologically rare phenomena
- `cultural-context`: Requires cultural knowledge
- `cipher`: Encrypted/coded language
- `real-world-data`: Authentic language samples
- `minimal-linguistic-knowledge`: Logic puzzles in linguistic disguise

## Tag Combination Examples

**Problem**: "Swahili Noun Class Agreement"
- Primary: `morphology`
- Secondary: `syntax`, `agreement`, `niger-congo`, `africa`, `bantu`

**Problem**: "Japanese Honorific System"
- Primary: `pragmatics`
- Secondary: `morphology`, `honorifics`, `asia`, `cultural-context`

**Problem**: "Pirahã Number System"
- Primary: `lexical-semantics`
- Secondary: `number-systems`, `americas`, `rare-language`, `unusual-feature`

**Problem**: "Ancient Egyptian Hieroglyphs"
- Primary: `writing-systems`
- Secondary: `logography`, `historical`, `afro-asiatic`, `africa`, `extinct`

**Problem**: "Proto-Indo-European Reconstruction"
- Primary: `historical-linguistics`
- Secondary: `comparative-method`, `sound-change`, `indo-european`, `extinct`

## Implementation Notes

1. **Every problem should have**:
   - Exactly 1 primary category (main linguistic subfield)
   - 2-5 secondary tags (features, family, region)
   - 1 difficulty level (1-5 stars)

2. **Tag naming convention**:
   - Use lowercase with hyphens
   - Be descriptive but concise
   - Avoid redundancy with primary category

3. **Searchability**:
   - Users can filter by primary category
   - Users can filter by multiple secondary tags
   - Tags should enable finding similar problems

4. **Color coding** (for UI):
   - Primary categories: Distinct colors for each subfield
   - Language families: Cyan/teal shades
   - Geographical: Green shades
   - Features: Gray shades
   - Difficulty: As already implemented (gray to red)
