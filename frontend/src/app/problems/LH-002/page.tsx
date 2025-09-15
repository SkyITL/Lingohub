import ProblemPageTemplate from "@/components/ProblemPageTemplate"

export default function ProblemLH002() {
  const problem = {
    "id": "LH-002",
    "number": "LH-002",
    "title": "Turkish Vowel Harmony",
    "content": "# Turkish Vowel Harmony\n\nTurkish exhibits vowel harmony, where vowels within a word must share certain phonetic features. This affects how suffixes are added to word stems.\n\n## Data\n\nStudy these Turkish words with their plural forms and meanings:\n\n| Singular | Plural | Meaning |\n|----------|--------|---------|\n| ev | evler | house(s) |\n| köy | köyler | village(s) |\n| göz | gözler | eye(s) |\n| gül | güller | rose(s) |\n| at | atlar | horse(s) |\n| kız | kızlar | girl(s) |\n| yol | yollar | road(s) |\n| kuş | kuşlar | bird(s) |\n\nNow examine these possessive forms (\"my X\"):\n\n| Base | Possessive | Meaning |\n|------|------------|---------|\n| ev | evim | my house |\n| köy | köyüm | my village |\n| göz | gözüm | my eye |\n| at | atım | my horse |\n| kız | kızım | my girl |\n| yol | yolum | my road |\n\n## Tasks\n\n1. Describe the vowel harmony rule for the plural suffix\n2. Describe the vowel harmony rule for the possessive suffix\n3. Give the plural and possessive forms of:\n   - \"kutu\" (box)\n   - \"köpek\" (dog)\n   - \"oda\" (room)",
    "officialSolution": "## Solution\n\n### Vowel Harmony Rules:\n\n**For Plural (-ler/-lar):**\n- Use -ler after front vowels (e, i, ö, ü)\n- Use -lar after back vowels (a, ı, o, u)\n\n**For Possessive (\"my\"):**\n- After front unrounded vowels (e, i): -im\n- After front rounded vowels (ö, ü): -üm\n- After back unrounded vowels (a, ı): -ım\n- After back rounded vowels (o, u): -um\n\n### Answers:\n- kutu: kutular (plural), kutum (my box)\n- köpek: köpekler (plural), köpeğim (my dog)\n- oda: odalar (plural), odam (my room)",
    "difficulty": 2,
    "rating": 1300,
    "source": "NACLO",
    "year": 2018,
    "solveCount": 0,
    "tags": [
        "phonology",
        "turkic",
        "beginner"
    ]
}

  return <ProblemPageTemplate problem={problem} />
}