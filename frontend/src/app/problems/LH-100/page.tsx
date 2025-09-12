import ProblemPageTemplate from "@/components/ProblemPageTemplate"

export default function ProblemLH100() {
  const problem = {
    "id": "LH-100",
    "number": "LH-100",
    "title": "Introduction to Phonetics",
    "content": "What is the difference between [p] and [b] sounds? Both are bilabial stops, but one is voiced and one is voiceless.",
    "officialSolution": "[p] is voiceless (no vocal cord vibration), [b] is voiced (vocal cords vibrate).",
    "difficulty": 1,
    "rating": 1000,
    "source": "Tutorial",
    "year": 2024,
    "solveCount": 145,
    "tags": [
        "phonetics",
        "phonology",
        "tutorial"
    ]
}

  return <ProblemPageTemplate problem={problem} />
}