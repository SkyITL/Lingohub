import ProblemPageTemplate from "@/components/ProblemPageTemplate"

export default function ProblemLH110() {
  const problem = {
    "id": "LH-110",
    "number": "LH-110",
    "title": "Greek Alphabet Origins",
    "content": "The Greek alphabet was adapted from the Phoenician script. What major innovation did the Greeks introduce to the writing system?",
    "officialSolution": "The Greeks added vowel letters. Phoenician only had consonants. Greek converted some Phoenician consonant letters (like aleph→alpha for A) into vowels, creating the first true alphabet.",
    "difficulty": 2,
    "rating": 1150,
    "source": "Quiz",
    "year": 2024,
    "solveCount": 342,
    "tags": [
        "writing-systems",
        "historical",
        "greek"
    ]
}

  return <ProblemPageTemplate problem={problem} />
}