import ProblemPageTemplate from "@/components/ProblemPageTemplate"

export default function ProblemLH001() {
  const problem = {
    "id": "LH-001",
    "number": "LH-001",
    "title": "Swahili Noun Classes",
    "content": "# Swahili Noun Classes\n\nSwahili is a Bantu language spoken in East Africa. Like other Bantu languages, it has a complex noun class system where nouns are grouped into classes, and these classes determine agreement patterns with adjectives, verbs, and other modifiers.\n\n## Data\n\nConsider the following Swahili sentences and their English translations:\n\n| Swahili | English |\n|---------|---------|\n| Mtoto mdogo anacheza | The small child is playing |\n| Watoto wadogo wanacheza | The small children are playing |\n| Mti mkubwa unaanguka | The big tree is falling |\n| Miti mikubwa inaanguka | The big trees are falling |\n| Kitabu kizuri kinasomwa | The good book is being read |\n| Vitabu vizuri vinasomwa | The good books are being read |\n| Jiwe kubwa linaanguka | The big stone is falling |\n| Mawe makubwa yanaanguka | The big stones are falling |\n\n## Tasks\n\n1. Identify the noun class prefixes for singular and plural forms\n2. Explain the agreement pattern between nouns, adjectives, and verbs\n3. Translate into Swahili:\n   - \"The small tree is falling\"\n   - \"The good children are playing\"\n   - \"The small stones are falling\"",
    "officialSolution": "## Solution\n\n### Noun Class Prefixes:\n- Class 1/2 (people): m-/wa- (mtoto/watoto)\n- Class 3/4 (trees, plants): m-/mi- (mti/miti)\n- Class 7/8 (things): ki-/vi- (kitabu/vitabu)\n- Class 5/6 (augmentatives): ji-/ma- (jiwe/mawe)\n\n### Agreement Pattern:\nEach noun class has corresponding agreement prefixes for:\n- Adjectives: -dogo (small), -kubwa (big), -zuri (good)\n- Verbs: -na- (present tense marker) + verb stem\n\n### Translations:\n1. \"The small tree is falling\" → Mti mdogo unaanguka\n2. \"The good children are playing\" → Watoto wazuri wanacheza\n3. \"The small stones are falling\" → Mawe madogo yanaanguka",
    "difficulty": 3,
    "rating": 1400,
    "source": "IOL",
    "year": 2019,
    "solveCount": 0,
    "tags": [
        "morphology",
        "niger-congo",
        "intermediate"
    ]
}

  return <ProblemPageTemplate problem={problem} />
}