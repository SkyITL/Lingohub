import ProblemPageTemplate from "@/components/ProblemPageTemplate"

export default function ProblemLH005() {
  const problem = {
    "id": "LH-005",
    "number": "LH-005",
    "title": "Dyirbal Ergativity",
    "content": "# Dyirbal Ergativity\n\nDyirbal is an Australian Aboriginal language that uses an ergative-absolutive alignment system, which is different from the nominative-accusative system used in English.\n\n## Data\n\nStudy these Dyirbal sentences:\n\n| Dyirbal | English |\n|---------|---------|\n| yabu banaga-nyu | Mother returned |\n| nguma yabu-nggu bura-n | Father saw mother |\n| yabu nguma bura-n | Mother saw father |\n| nguma banaga-nyu | Father returned |\n| yabu-nggu nguma bura-n | Mother saw father |\n| nguma-nggu yabu bura-n | Father saw mother |\n\nVocabulary:\n- yabu = mother\n- nguma = father\n- banaga-nyu = returned\n- bura-n = saw\n- -nggu = ergative case marker\n\n## Tasks\n\n1. Explain the difference between ergative-absolutive and nominative-accusative alignment\n2. When is the ergative marker -nggu used in Dyirbal?\n3. Identify which noun is the subject and which is the object in each transitive sentence\n4. How would you say \"Father returned and saw mother\" in Dyirbal?",
    "officialSolution": "## Solution\n\n### Ergative-Absolutive Alignment:\n- **Absolutive case** (unmarked): Used for subjects of intransitive verbs AND objects of transitive verbs\n- **Ergative case** (-nggu): Used only for subjects of transitive verbs\n\nThis differs from nominative-accusative (like English) where subjects are always nominative and objects are always accusative.\n\n### Use of -nggu:\nThe ergative marker -nggu is added to the subject of a transitive verb (the one doing the action to someone else).\n\n### Subject-Object Identification:\n- nguma yabu-nggu bura-n: yabu-nggu (mother) = subject, nguma (father) = object\n- yabu nguma bura-n: nguma (father) = subject, yabu (mother) = object\n- yabu-nggu nguma bura-n: yabu-nggu (mother) = subject, nguma (father) = object\n- nguma-nggu yabu bura-n: nguma-nggu (father) = subject, yabu (mother) = object\n\n### Translation:\n\"Father returned and saw mother\" → nguma banaga-nyu, nguma-nggu yabu bura-n",
    "difficulty": 4,
    "rating": 1700,
    "source": "APLO",
    "year": 2016,
    "solveCount": 0,
    "tags": [
        "syntax",
        "morphology",
        "australian",
        "advanced"
    ]
}

  return <ProblemPageTemplate problem={problem} />
}