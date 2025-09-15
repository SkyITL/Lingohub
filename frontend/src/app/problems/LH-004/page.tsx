import ProblemPageTemplate from "@/components/ProblemPageTemplate"

export default function ProblemLH004() {
  const problem = {
    "id": "LH-004",
    "number": "LH-004",
    "title": "Ancient Egyptian Hieroglyphs",
    "content": "# Ancient Egyptian Hieroglyphs\n\nAncient Egyptian hieroglyphic writing combines logographic and alphabetic elements. Some signs represent whole words, while others represent sounds.\n\n## Data\n\nStudy these hieroglyphic representations (shown as transliterations) and their meanings:\n\n| Hieroglyphic | Transliteration | Meaning |\n|--------------|-----------------|------|\n| 𓊪𓏏𓇯 | pt | sky |\n| 𓊪𓏏𓇯𓏏 | ptt | ? |\n| 𓊖 | niwt | city |\n| 𓊖𓊖 | niwty | two cities |\n| 𓊖𓊖𓊖 | niwtw | cities (plural) |\n| 𓉐 | pr | house |\n| 𓉐𓅱 | prw | houses |\n| 𓉐𓏏 | prt | ? |\n| 𓄿𓏏𓆑 | itf | father |\n| 𓄿𓏏𓆑𓅱 | itfw | ? |\n\n## Tasks\n\n1. Identify which hieroglyphs are logograms (word signs) and which are phonograms (sound signs)\n2. Explain the Egyptian number and gender marking system\n3. Fill in the missing meanings marked with \"?\"\n4. How would you write \"fathers\" in hieroglyphs?",
    "officialSolution": "## Solution\n\n### Sign Types:\n- Logograms: 𓊖 (city), 𓉐 (house)\n- Phonograms: 𓊪 (p), 𓏏 (t), 𓇯 (determinative for sky), 𓅱 (w), 𓄿 (i), 𓆑 (f)\n\n### Number and Gender:\n- Dual (two): repeat logogram twice or add -y\n- Plural (3+): repeat logogram three times or add -w\n- Feminine: add -t\n\n### Missing Meanings:\n- ptt = \"sky\" (feminine form)\n- prt = \"house\" (feminine form) or \"winter\"\n- itfw = \"his father\" (with possessive -w)\n\n### \"Fathers\" (plural):\n𓄿𓏏𓆑𓅱 (itfw) or 𓄿𓏏𓆑𓄿𓏏𓆑𓄿𓏏𓆑",
    "difficulty": 4,
    "rating": 1600,
    "source": "IOL",
    "year": 2017,
    "solveCount": 0,
    "tags": [
        "writing-systems",
        "afroasiatic",
        "advanced"
    ]
}

  return <ProblemPageTemplate problem={problem} />
}