import ProblemPageTemplate from "@/components/ProblemPageTemplate"

export default function ProblemLH007() {
  const problem = {
    "id": "LH-007",
    "number": "LH-007",
    "title": "Japanese Writing Systems",
    "content": "# Japanese Writing Systems\n\nJapanese uses three writing systems simultaneously: hiragana (for grammatical elements), katakana (for foreign words), and kanji (Chinese characters for content words).\n\n## Data\n\nStudy these Japanese sentences written in romaji (Latin script) with word boundaries marked:\n\n| Japanese (Romaji) | English | Writing System Used |\n|-------------------|---------|---------------------|\n| watashi wa gakusei desu | I am a student | 私は学生です |\n| kore wa pen desu | This is a pen | これはペンです |\n| nihon no kuruma | Japanese car | 日本の車 |\n| amerika kara kimashita | Came from America | アメリカから来ました |\n| hon o yomimasu | Read a book | 本を読みます |\n| koohii o nomimasu | Drink coffee | コーヒーを飲みます |\n\nWhere:\n- Hiragana: は (wa), の (no), を (o), です (desu), から (kara), ます (masu)\n- Katakana: ペン (pen), アメリカ (amerika), コーヒー (koohii)\n- Kanji: 私 (watashi), 学生 (gakusei), 日本 (nihon), 車 (kuruma), 本 (hon), 読 (yo), 飲 (no)\n\n## Tasks\n\n1. What determines which writing system is used for each word?\n2. Identify the grammatical particles in the sentences\n3. Why might \"pen\" and \"coffee\" be written differently from \"book\" and \"car\"?\n4. How would \"I drink American coffee\" likely be written (indicate which parts use which system)?",
    "officialSolution": "## Solution\n\n### Writing System Rules:\n- **Kanji**: Native Japanese and Chinese-origin content words (nouns, verb stems, adjective stems)\n- **Hiragana**: Grammatical particles, verb endings, native Japanese words without kanji\n- **Katakana**: Foreign loanwords (except Chinese), onomatopoeia, emphasis\n\n### Grammatical Particles:\n- wa (は) - topic marker\n- no (の) - possessive/modifier particle\n- o (を) - direct object marker\n- kara (から) - \"from\"\n\n### \"Pen\" vs \"Book\":\n- \"Pen\" (ペン) and \"coffee\" (コーヒー) are recent loanwords from English, written in katakana\n- \"Book\" (本) and \"car\" (車) have established kanji as they're older concepts in Japanese\n\n### \"I drink American coffee\":\n- 私 (watashi - kanji) は (wa - hiragana) アメリカ (amerika - katakana) の (no - hiragana) コーヒー (koohii - katakana) を (o - hiragana) 飲みます (nomimasu - kanji + hiragana)",
    "difficulty": 3,
    "rating": 1450,
    "source": "IOL",
    "year": 2022,
    "solveCount": 0,
    "tags": [
        "writing-systems",
        "sino-tibetan",
        "intermediate"
    ]
}

  return <ProblemPageTemplate problem={problem} />
}