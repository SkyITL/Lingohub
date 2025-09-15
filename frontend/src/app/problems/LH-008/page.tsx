import ProblemPageTemplate from "@/components/ProblemPageTemplate"

export default function ProblemLH008() {
  const problem = {
    "id": "LH-008",
    "number": "LH-008",
    "title": "Malagasy Word Order",
    "content": "# Malagasy Word Order\n\nMalagasy, spoken in Madagascar, has an unusual word order that is rare among world languages: Verb-Object-Subject (VOS).\n\n## Data\n\nStudy these Malagasy sentences:\n\n| Malagasy | English |\n|----------|---------|\n| Mamaky boky ny mpianatra | The student reads a book |\n| Mamaky ny boky ny mpianatra | The student reads the book |\n| Nahita ny alika ny zaza | The child saw the dog |\n| Nahita alika ny zaza | The child saw a dog |\n| Manoratra taratasy ny mpampianatra | The teacher writes a letter |\n| Mividy ny ronono ny vehivavy | The woman buys the milk |\n| Nihinana ny mofo izy | He/she ate the bread |\n\nVocabulary hints:\n- ny = the (definite article)\n- mamaky = reads\n- nahita = saw\n- manoratra = writes\n- mividy = buys\n- nihinana = ate\n\n## Tasks\n\n1. Confirm the VOS word order and identify V, O, and S in each sentence\n2. What is the difference between \"boky\" and \"ny boky\"?\n3. Where does the definite article appear relative to the noun?\n4. Translate into Malagasy:\n   - \"The teacher saw the student\"\n   - \"A child buys milk\"\n   - \"He reads the letter\"",
    "officialSolution": "## Solution\n\n### Word Order Confirmation (VOS):\n- Mamaky (V) boky (O) ny mpianatra (S) = \"reads book the student\"\n- Nahita (V) ny alika (O) ny zaza (S) = \"saw the dog the child\"\n- Mividy (V) ny ronono (O) ny vehivavy (S) = \"buys the milk the woman\"\n\n### Definite vs Indefinite:\n- \"boky\" = a book (indefinite)\n- \"ny boky\" = the book (definite)\nThe definite article \"ny\" appears BEFORE the noun.\n\n### Translations:\n1. \"The teacher saw the student\" → Nahita ny mpianatra ny mpampianatra\n2. \"A child buys milk\" → Mividy ronono ny zaza\n3. \"He reads the letter\" → Mamaky ny taratasy izy",
    "difficulty": 2,
    "rating": 1400,
    "source": "APLO",
    "year": 2020,
    "solveCount": 0,
    "tags": [
        "syntax",
        "austronesian",
        "beginner"
    ]
}

  return <ProblemPageTemplate problem={problem} />
}