import ProblemPageTemplate from "@/components/ProblemPageTemplate"

export default function ProblemLH103() {
  const problem = {
    "id": "LH-103",
    "number": "LH-103",
    "title": "Language Families",
    "content": "Which languages belong to the Romance family? Name at least 5.",
    "officialSolution": "Spanish, French, Italian, Portuguese, Romanian (all descended from Latin)",
    "difficulty": 1,
    "rating": 1000,
    "source": "Quiz",
    "year": 2024,
    "solveCount": 467,
    "tags": [
        "historical",
        "language-families",
        "romance"
    ]
}

  return <ProblemPageTemplate problem={problem} />
}