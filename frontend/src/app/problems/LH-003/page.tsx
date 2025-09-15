import ProblemPageTemplate from "@/components/ProblemPageTemplate"

export default function ProblemLH003() {
  const problem = {
    "id": "LH-003",
    "number": "LH-003",
    "title": "Hawaiian Phonological Constraints",
    "content": "# Hawaiian Phonological Constraints\n\nHawaiian has one of the world's smallest phoneme inventories, with only 13 phonemes (8 consonants and 5 vowels). This leads to interesting phonological adaptations when borrowing words from other languages.\n\n## Data\n\nHere are some English words and their Hawaiian adaptations:\n\n| English | Hawaiian |\n|---------|-----------|\n| Christmas | Kalikimaka |\n| Britain | Pelekane |\n| throne | kelone |\n| brush | palaki |\n| Fred | Peleke |\n| trust | kaluku |\n| president | pelekikena |\n| print | palinika |\n\n## Additional Information\n\nHawaiian consonants: p, k, ʔ, h, m, n, l, w\nHawaiian vowels: a, e, i, o, u\n\nAll syllables in Hawaiian must be either V (vowel) or CV (consonant + vowel).\n\n## Tasks\n\n1. Describe the systematic changes that occur when English words are borrowed into Hawaiian\n2. Explain why these changes are necessary given Hawaiian's phonological constraints\n3. Predict the Hawaiian adaptation of:\n   - \"Frank\"\n   - \"Scotland\"",
    "officialSolution": "## Solution\n\n### Systematic Changes:\n\n1. **Consonant Substitutions:**\n   - t → k (no t in Hawaiian)\n   - r → l (no r in Hawaiian)\n   - s → k (no s in Hawaiian)\n   - f → p (no f in Hawaiian)\n   - b → p (no b in Hawaiian)\n   - d → k (no d in Hawaiian)\n   - g → k (no g in Hawaiian)\n\n2. **Syllable Structure Repairs:**\n   - Consonant clusters are broken up with epenthetic vowels\n   - Final consonants get an added vowel\n   - Usually 'a' or 'i' is inserted, following vowel harmony patterns\n\n### Predictions:\n- \"Frank\" → Palani (f→p, r→l, nk cluster broken, final consonant needs vowel)\n- \"Scotland\" → Kokolana (s→k, c→k, tl cluster broken, nd→na)",
    "difficulty": 3,
    "rating": 1500,
    "source": "UKLO",
    "year": 2020,
    "solveCount": 0,
    "tags": [
        "phonology",
        "austronesian",
        "intermediate"
    ]
}

  return <ProblemPageTemplate problem={problem} />
}