import ProblemPageTemplate from "@/components/ProblemPageTemplate"

export default function ProblemLH102() {
  const problem = {
    "id": "LH-102",
    "number": "LH-102",
    "title": "Simple Syntax Trees",
    "content": "Draw a syntax tree for: \"The cat sat on the mat\"",
    "officialSolution": "[S [NP The cat] [VP sat [PP on [NP the mat]]]]",
    "difficulty": 2,
    "rating": 1200,
    "source": "Practice",
    "year": 2024,
    "solveCount": 312,
    "tags": [
        "syntax",
        "trees",
        "grammar"
    ]
}

  return <ProblemPageTemplate problem={problem} />
}