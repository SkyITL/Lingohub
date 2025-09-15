import ProblemPageTemplate from "@/components/ProblemPageTemplate"

export default function ProblemLH009() {
  const problem = {
    "id": "LH-009",
    "number": "LH-009",
    "title": "Proto-Indo-European Reconstruction",
    "content": "# Proto-Indo-European Reconstruction\n\nHistorical linguists reconstruct ancient languages by comparing related modern languages. Here we'll examine words for \"father\" across Indo-European languages.\n\n## Data\n\n| Language | Word for \"father\" | Language Family Branch |\n|----------|------------------|------------------------|\n| English | father | Germanic |\n| German | Vater | Germanic |\n| Dutch | vader | Germanic |\n| Latin | pater | Italic |\n| Spanish | padre | Italic (Romance) |\n| French | père | Italic (Romance) |\n| Greek | πατήρ (patēr) | Hellenic |\n| Sanskrit | पितृ (pitṛ) | Indo-Aryan |\n| Hindi | पिता (pitā) | Indo-Aryan |\n| Russian | отец (otets) | Slavic |\n| Armenian | հայր (hayr) | Armenian |\n\n## Sound Correspondences\n\nNotice these patterns:\n- Germanic languages have 'f' or 'v' where other languages have 'p'\n- This is due to Grimm's Law: Proto-Indo-European *p → Germanic f\n\n## Tasks\n\n1. What was the likely initial consonant in the Proto-Indo-European word for \"father\"?\n2. Explain why Germanic languages are different from the others\n3. Given that English \"foot\" corresponds to Latin \"ped-\" (as in \"pedestrian\"), what sound change rule can you identify?\n4. Predict: If the PIE word for \"fish\" was *pisk-, what might it be in English?",
    "officialSolution": "## Solution\n\n### Proto-Indo-European Reconstruction:\nThe PIE word for \"father\" was likely *ph₂tḗr, beginning with *p.\n\n### Germanic Sound Change (Grimm's Law):\nGermanic languages underwent a systematic sound shift where:\n- PIE *p → Germanic *f\n- PIE *t → Germanic *θ (th)\n- PIE *k → Germanic *h\n\nThis is why Germanic languages have 'f' where other Indo-European languages have 'p'.\n\n### Sound Change Rule:\nThe correspondence foot/ped- confirms: PIE *p → English f\n\n### Prediction:\nPIE *pisk- → English \"fish\" (which is indeed correct!)\nThe 'p' became 'f' following Grimm's Law.",
    "difficulty": 3,
    "rating": 1550,
    "source": "IOL",
    "year": 2021,
    "solveCount": 0,
    "tags": [
        "historical-linguistics",
        "indo-european",
        "intermediate"
    ]
}

  return <ProblemPageTemplate problem={problem} />
}