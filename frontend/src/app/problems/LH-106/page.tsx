import ProblemPageTemplate from "@/components/ProblemPageTemplate"

export default function ProblemLH106() {
  const problem = {
    "id": "LH-106",
    "number": "LH-106",
    "title": "Swahili Noun Classes",
    "content": "Swahili nouns are grouped into classes. Given: mtoto/watoto (child/children), mtu/watu (person/people), kikapu/vikapu (basket/baskets). What are the plural forms of: mkulima (farmer), kikombe (cup)?",
    "officialSolution": "wakulima (farmers), vikombe (cups). Swahili uses noun class prefixes: m-/wa- for people, ki-/vi- for objects.",
    "difficulty": 2,
    "rating": 1200,
    "source": "IOL",
    "year": 2020,
    "solveCount": 234,
    "tags": [
        "morphology",
        "african-languages",
        "noun-classes"
    ]
}

  return <ProblemPageTemplate problem={problem} />
}