import ProblemPageTemplate from "@/components/ProblemPageTemplate"

export default function ProblemLH006() {
  const problem = {
    "id": "LH-006",
    "number": "LH-006",
    "title": "Tok Pisin Creole Formation",
    "content": "# Tok Pisin Creole Formation\n\nTok Pisin is a creole language spoken in Papua New Guinea. It developed from English-based pidgin and shows interesting grammatical innovations.\n\n## Data\n\nStudy these Tok Pisin sentences and their English translations:\n\n| Tok Pisin | English |\n|-----------|---------|\n| Mi go | I go |\n| Yu go | You go |\n| Em go | He/she goes |\n| Mipela go | We (exclusive) go |\n| Yumi go | We (inclusive) go |\n| Yupela go | You (plural) go |\n| Ol go | They go |\n| Mi go pinis | I went |\n| Bai mi go | I will go |\n| Mi go i stap | I am going |\n| Mi no go | I don't go |\n| Mi go long haus | I go to the house |\n| Mi lukim yu | I see you |\n| Yu lukim mi | You see me |\n| Mi givim buk long yu | I give the book to you |\n\n## Tasks\n\n1. Describe how Tok Pisin marks tense (past, present, future)\n2. Explain the inclusive/exclusive distinction in pronouns\n3. What is the function of \"long\" in these sentences?\n4. Translate into Tok Pisin:\n   - \"They will see us (inclusive)\"\n   - \"She gave the book to me\"\n   - \"We (exclusive) didn't go to the house\"",
    "officialSolution": "## Solution\n\n### Tense Marking:\n- Present: unmarked (base verb)\n- Past: verb + \"pinis\" (from \"finish\")\n- Future: \"bai\" + subject + verb\n- Progressive: verb + \"i stap\" (from \"stop/stay\")\n\n### Inclusive/Exclusive Distinction:\n- **Mipela** = we (exclusive - not including the listener)\n- **Yumi** = we (inclusive - including the listener)\nThis distinction is common in Austronesian languages of the region.\n\n### Function of \"long\":\n\"Long\" serves as a general preposition meaning \"to\", \"at\", \"for\", or indicating indirect objects.\n\n### Translations:\n1. \"They will see us (inclusive)\" → Bai ol lukim yumi\n2. \"She gave the book to me\" → Em givim buk long mi\n3. \"We (exclusive) didn't go to the house\" → Mipela no go long haus",
    "difficulty": 2,
    "rating": 1350,
    "source": "NACLO",
    "year": 2021,
    "solveCount": 0,
    "tags": [
        "syntax",
        "morphology",
        "austronesian",
        "intermediate"
    ]
}

  return <ProblemPageTemplate problem={problem} />
}