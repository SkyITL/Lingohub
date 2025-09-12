import ProblemPageTemplate from "@/components/ProblemPageTemplate"

export default function ProblemLH104() {
  const problem = {
    "id": "LH-104",
    "number": "LH-104",
    "title": "IPA Practice",
    "content": "Transcribe \"Hello\" in IPA.",
    "officialSolution": "/həˈloʊ/ (American) or /həˈləʊ/ (British)",
    "difficulty": 2,
    "rating": 1150,
    "source": "Practice",
    "year": 2024,
    "solveCount": 289,
    "tags": [
        "phonetics",
        "ipa",
        "transcription"
    ]
}

  return <ProblemPageTemplate problem={problem} />
}