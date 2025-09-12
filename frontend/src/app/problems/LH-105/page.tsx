import ProblemPageTemplate from "@/components/ProblemPageTemplate"

export default function ProblemLH105() {
  const problem = {
    "id": "LH-105",
    "number": "LH-105",
    "title": "Semantic Shift",
    "content": "The English word \"silly\" used to mean \"blessed\" or \"innocent\" in Middle English. How do words change meaning over time?",
    "officialSolution": "Semantic shift occurs through metaphor, metonymy, specialization, generalization, and social factors. \"Silly\" shifted from blessed → innocent → naive → foolish.",
    "difficulty": 2,
    "rating": 1250,
    "source": "Tutorial",
    "year": 2024,
    "solveCount": 198,
    "tags": [
        "semantics",
        "historical-linguistics",
        "english"
    ]
}

  return <ProblemPageTemplate problem={problem} />
}