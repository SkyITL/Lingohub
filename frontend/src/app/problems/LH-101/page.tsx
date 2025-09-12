import ProblemPageTemplate from "@/components/ProblemPageTemplate"

export default function ProblemLH101() {
  const problem = {
    "id": "LH-101",
    "number": "LH-101",
    "title": "Basic Morphology",
    "content": "In English, we add -s for plurals: cat→cats, dog→dogs. But some words are irregular: child→children, mouse→mice. Why?",
    "officialSolution": "Irregular plurals often come from older forms of English or other Germanic languages.",
    "difficulty": 1,
    "rating": 1100,
    "source": "Tutorial",
    "year": 2024,
    "solveCount": 234,
    "tags": [
        "morphology",
        "english",
        "plurals"
    ]
}

  return <ProblemPageTemplate problem={problem} />
}