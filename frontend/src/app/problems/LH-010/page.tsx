import ProblemPageTemplate from "@/components/ProblemPageTemplate"

export default function ProblemLH010() {
  const problem = {
    "id": "LH-010",
    "number": "LH-010",
    "title": "Mandarin Chinese Tones",
    "content": "# Mandarin Chinese Tones\n\nMandarin Chinese is a tonal language where the pitch pattern of a syllable changes its meaning. Mandarin has four main tones plus a neutral tone.\n\n## Data\n\nHere are some Mandarin syllables with different tones and their meanings:\n\n| Pinyin | Tone | Chinese | Meaning |\n|--------|------|---------|------|\n| mā | 1 (high level) | 妈 | mother |\n| má | 2 (rising) | 麻 | hemp |\n| mǎ | 3 (dipping) | 马 | horse |\n| mà | 4 (falling) | 骂 | scold |\n| ma | 0 (neutral) | 吗 | question particle |\n| tāng | 1 | 汤 | soup |\n| táng | 2 | 糖 | sugar |\n| tǎng | 3 | 躺 | lie down |\n| tàng | 4 | 烫 | hot (to touch) |\n| shī | 1 | 诗 | poem |\n| shí | 2 | 十 | ten |\n| shǐ | 3 | 史 | history |\n| shì | 4 | 是 | to be |\n\n## Tone Patterns:\n1. First tone: high and level (55)\n2. Second tone: rising (35)\n3. Third tone: dipping (214)\n4. Fourth tone: falling (51)\n\n## Tasks\n\n1. Explain how tones function as phonemes in Mandarin\n2. What would happen if you said \"mǎ mā\" vs \"mā mǎ\"?\n3. Given that \"wǒ\" (我) means \"I/me\" and \"ài\" (爱) means \"love\", and \"nǐ\" (你) means \"you\", how would you say \"I love you\"?\n4. Why might tonal languages be challenging for speakers of non-tonal languages?",
    "officialSolution": "## Solution\n\n### Tones as Phonemes:\nIn Mandarin, tones are phonemic - they distinguish meaning just like consonants and vowels do. Changing the tone changes the word entirely, not just its pronunciation variant.\n\n### Sentence Meanings:\n- \"mǎ mā\" (马妈) = \"horse mother\" (nonsensical)\n- \"mā mǎ\" (妈马) = \"mother horse\" (also odd)\n- The correct way to say \"mother\" is just \"māma\" (妈妈)\n\n### \"I love you\":\n\"wǒ ài nǐ\" (我爱你) - with tones: wǒ (3rd) ài (4th) nǐ (3rd)\n\n### Challenges for Non-Tonal Language Speakers:\n1. Their native language doesn't use pitch to distinguish word meaning\n2. They use pitch for emphasis, emotion, or questions instead\n3. They must learn to control pitch precisely and consistently\n4. They must perceive pitch differences as meaningful rather than stylistic",
    "difficulty": 2,
    "rating": 1300,
    "source": "NACLO",
    "year": 2019,
    "solveCount": 0,
    "tags": [
        "phonology",
        "sino-tibetan",
        "beginner"
    ]
}

  return <ProblemPageTemplate problem={problem} />
}