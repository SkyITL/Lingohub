export type RoadmapTone =
  | "ochre"
  | "coral"
  | "teal"
  | "blue"
  | "violet"
  | "green";

export type RoadmapNode = {
  id: string;
  question: string;
  term: string;
  plain: string;
  academic: string;
  tryThis: string;
  readingBridge: string;
  x: number;
  y: number;
};

export type RoadmapEdge = {
  from: string;
  to: string;
};

export type RoadmapRoute = {
  slug: string;
  number: string;
  sectionTitle: string;
  question: string;
  academicAreas: string;
  teaser: string;
  hook: string;
  destination: string;
  tone: RoadmapTone;
  reading: {
    title: string;
    source: string;
    href: string;
    readyAfter: number;
  };
  nodes: RoadmapNode[];
  edges: RoadmapEdge[];
};

type NodeInput = Omit<RoadmapNode, "x" | "y">;

const nodePositions = [
  { x: 126, y: 260 },
  { x: 370, y: 124 },
  { x: 370, y: 396 },
  { x: 620, y: 260 },
  { x: 874, y: 124 },
  { x: 874, y: 396 },
];

const sharedEdges: RoadmapEdge[] = [
  { from: "0", to: "1" },
  { from: "0", to: "2" },
  { from: "1", to: "3" },
  { from: "2", to: "3" },
  { from: "3", to: "4" },
  { from: "3", to: "5" },
];

function createRoute(
  route: Omit<RoadmapRoute, "nodes" | "edges"> & { nodes: NodeInput[] },
): RoadmapRoute {
  return {
    ...route,
    nodes: route.nodes.map((item, index) => ({
      ...item,
      ...nodePositions[index],
    })),
    edges: sharedEdges.map((edge) => ({
      from: route.nodes[Number(edge.from)].id,
      to: route.nodes[Number(edge.to)].id,
    })),
  };
}

export const roadmapRoutes: RoadmapRoute[] = [
  createRoute({
    slug: "translation",
    number: "01",
    sectionTitle: "Introduction",
    question: "Why can one word need two translations?",
    academicAreas: "Lexical semantics · Pragmatics · Translation",
    teaser:
      "Begin with brother → 哥哥 / 弟弟 and discover why translation is reconstruction, not replacement.",
    hook: "One familiar word produces two ordinary answers. What information is missing?",
    destination:
      "Read an introductory account of form, meaning, context, and cross-linguistic lexicalization without treating technical vocabulary as a wall.",
    tone: "ochre",
    reading: {
      title: "Introductory semantics and lexical typology",
      source: "MIT OpenCourseWare + WALS",
      href: "https://ocw.mit.edu/courses/24-900-introduction-to-linguistics-spring-2022/download/",
      readyAfter: 4,
    },
    nodes: [
      {
        id: "translation-not-replacement",
        question: "Which brother is it?",
        term: "Lexicalization",
        plain:
          "English packages older and younger male siblings into one common word. Chinese commonly asks the word itself to preserve the age relation.",
        academic:
          "Lexicalization is the conventional encoding of a concept in a lexical item. Languages may partition the same semantic domain with non-equivalent category boundaries.",
        tryThis:
          "Choose 哥哥 or 弟弟 before seeing any sentence. Then identify exactly what evidence you lacked.",
        readingBridge:
          "You now have a concrete referent for lexicalization when the term appears in a semantics text.",
      },
      {
        id: "context-fills-gaps",
        question: "What did the sentence leave unsaid?",
        term: "Contextual enrichment",
        plain:
          "A listener combines the words with age, speaker, situation, and prior conversation to recover a more specific interpretation.",
        academic:
          "Pragmatic enrichment supplies contextually licensed content beyond a sentence's conventionally encoded semantic meaning.",
        tryThis:
          "Compare ‘My brother is three years older’ with ‘My brother started primary school.’ Which clue resolves the translation?",
        readingBridge:
          "This distinction prepares you to separate sentence meaning from utterance interpretation.",
      },
      {
        id: "semantic-fields",
        question: "Do words draw the same borders?",
        term: "Semantic field",
        plain:
          "Words for relatives, colors, motion, and space divide continuous experience into reusable categories—but not always at the same boundaries.",
        academic:
          "A semantic field is a structured domain of related lexical meanings. Cross-linguistic comparison asks which distinctions are obligatorily or conventionally lexicalized.",
        tryThis:
          "Sketch the family relations covered by sibling, brother, 哥哥, and 弟弟. Notice overlap instead of forcing pairs.",
        readingBridge:
          "You are ready to read lexical-semantic diagrams as competing partitions of a domain.",
      },
      {
        id: "form-meaning-context",
        question: "Where does an interpretation come from?",
        term: "Form · meaning · context",
        plain:
          "The sound or marks are the form; the conventional concept is meaning; the situation helps select and enrich an interpretation.",
        academic:
          "Linguistic analysis distinguishes an expression's form, its encoded semantic contribution, its possible referents, and pragmatic inference in context.",
        tryThis:
          "For ‘bank,’ list the visible form, two conventional meanings, and one sentence that selects each.",
        readingBridge:
          "These distinctions are the vocabulary used by later readings in semantics, pragmatics, and translation studies.",
      },
      {
        id: "translation-equivalence",
        question: "What should a translation preserve?",
        term: "Translation equivalence",
        plain:
          "A translation may preserve reference, implication, tone, social relationship, or structure—but rarely matches every dimension at once.",
        academic:
          "Equivalence is multidimensional rather than simple identity: semantic, pragmatic, stylistic, and functional correspondences can pull in different directions.",
        tryThis:
          "Translate 您 and 你 into English, then state which social distinction the pronoun loses and how context might restore it.",
        readingBridge:
          "A later text's competing accounts of equivalence now answer a problem you have already encountered.",
      },
      {
        id: "semantic-typology",
        question: "Is this pattern bigger than two languages?",
        term: "Semantic typology",
        plain:
          "A second and third language show whether a contrast is unique, widespread, or only one of several possible systems.",
        academic:
          "Semantic typology compares how languages encode conceptual domains and evaluates recurring patterns without treating one language's categories as universal.",
        tryThis:
          "Compare one kinship distinction across three languages, recording both the terms and the social contexts in which speakers use them.",
        readingBridge:
          "You can now approach cross-linguistic maps critically: each map encodes analytical choices and evidence limits.",
      },
    ],
  }),
  createRoute({
    slug: "decoding",
    number: "02",
    sectionTitle: "Decode from Evidence",
    question: "How can I decode a language I have never learned?",
    academicAreas: "Linguistic analysis · Data methods",
    teaser:
      "Turn an unfamiliar table into evidence, hypotheses, counterexamples, and a reproducible explanation.",
    hook: "Six unknown expressions, six translations—and no dictionary. Where is the first reliable clue?",
    destination:
      "Read structured linguistic datasets and explain a rule from evidence rather than intuition.",
    tone: "coral",
    reading: {
      title: "How Linguists Solve Problems",
      source: "Language Science Press",
      href: "https://langsci-press.org/catalog/book/420",
      readyAfter: 4,
    },
    nodes: [
      {
        id: "find-an-anchor",
        question: "Which clue can I trust first?",
        term: "Anchor",
        plain:
          "Begin with a repeated form, repeated meaning, or uniquely simple pair that limits the number of possible explanations.",
        academic:
          "An anchor is an analytically useful correspondence supported by controlled comparison, not an official linguistic category.",
        tryThis: "Circle one element that repeats on both sides of a tiny translated dataset.",
        readingBridge: "This supplies a practical entrance to distributional analysis.",
      },
      {
        id: "minimal-contrast",
        question: "Which two lines differ least?",
        term: "Minimal contrast",
        plain: "Pairs that change in only one place help isolate what that change contributes.",
        academic:
          "Controlled contrasts support causal inference about form–meaning correspondences while reducing confounding differences.",
        tryThis: "Subtract the shared parts of two nearly identical examples.",
        readingBridge: "Formal exercises will call this controlling variables or identifying a minimal pair.",
      },
      {
        id: "segment-recurring-parts",
        question: "Where should I split the expression?",
        term: "Segmentation",
        plain: "Recurring pieces suggest boundaries, but one match is only a hypothesis.",
        academic:
          "Segmentation proposes discrete units whose distributions and meanings remain consistent across the dataset.",
        tryThis: "Mark every recurrence before assigning any translation to a piece.",
        readingBridge: "This is the analytical doorway to morphology and writing-system problems.",
      },
      {
        id: "test-a-rule",
        question: "Does my rule predict every line?",
        term: "Hypothesis testing",
        plain: "A useful rule predicts unseen forms and survives examples you did not use to invent it.",
        academic:
          "Analysis cycles through hypothesis, prediction, falsification, and revision; explanatory coverage matters more than an attractive first pattern.",
        tryThis: "Hide one row, build a rule, and use it to reconstruct the hidden answer.",
        readingBridge: "Later methods texts formalize the cycle you have already performed.",
      },
      {
        id: "handle-counterevidence",
        question: "Exception—or evidence my rule is wrong?",
        term: "Counterevidence",
        plain: "An awkward row may reveal a missing condition, another process, or a mistaken analysis.",
        academic:
          "Counterexamples delimit a generalization's domain and can motivate conditioning environments, competing rules, or reanalysis.",
        tryThis: "Write two rival explanations for one row that resists your current rule.",
        readingBridge: "You are prepared for analyses that distinguish a general rule from its conditioning environment.",
      },
      {
        id: "write-the-analysis",
        question: "Could someone reproduce my reasoning?",
        term: "Interlinear analysis",
        plain: "A complete solution maps pieces, states ordering rules, and demonstrates them on the data.",
        academic:
          "Interlinear glossing and explicit rule notation separate observed forms, morpheme-level analysis, and free translation.",
        tryThis: "Explain one form in three lines: original, segmented gloss, natural translation.",
        readingBridge: "You can now read and produce the conventional format used in typology and documentation.",
      },
    ],
  }),
  createRoute({
    slug: "words",
    number: "03",
    sectionTitle: "Word Structure",
    question: "How can one word contain a whole sentence?",
    academicAreas: "Morphology · Lexicon · Morphosyntax",
    teaser: "Take words apart, then discover how languages package events and participants differently.",
    hook: "If one written word translates as ‘I will make him return,’ is it still only one word?",
    destination: "Read interlinear glosses and compare morphological systems across languages.",
    tone: "teal",
    reading: {
      title: "Morphology in 24.900 Introduction to Linguistics",
      source: "MIT OpenCourseWare",
      href: "https://ocw.mit.edu/courses/24-900-introduction-to-linguistics-spring-2022/download/",
      readyAfter: 4,
    },
    nodes: [
      {
        id: "word-pieces",
        question: "Which pieces keep returning?",
        term: "Morpheme",
        plain: "The smallest recurring form with a stable grammatical or lexical contribution is a useful first unit.",
        academic: "A morpheme is a minimal pairing of form and meaning or grammatical function.",
        tryThis: "Color repeated pieces in a six-form verb table.",
        readingBridge: "You can now interpret morpheme boundaries in a glossed example.",
      },
      {
        id: "roots-and-affixes",
        question: "Which piece carries the central idea?",
        term: "Root · stem · affix",
        plain: "A root contributes the lexical core; other pieces attach to a base or stem.",
        academic: "Root, base, and stem describe different structural roles within morphological composition.",
        tryThis: "Identify what stays when tense and person change.",
        readingBridge: "These labels make morphological trees and paradigms readable.",
      },
      {
        id: "morpheme-order",
        question: "Why does the order of pieces matter?",
        term: "Morphotactics",
        plain: "Languages constrain which meaningful pieces may combine and where each appears.",
        academic: "Morphotactics describes ordering and co-occurrence restrictions among morphemes.",
        tryThis: "Predict which of two affix orders a table supports.",
        readingBridge: "You can follow template-based and hierarchical analyses of words.",
      },
      {
        id: "inflection-and-derivation",
        question: "Is this a new word or a new form?",
        term: "Inflection · derivation",
        plain: "Some changes fit a word into a sentence; others create a related lexeme.",
        academic: "Inflection realizes grammatical features; derivation forms lexemes, though the boundary is language-dependent.",
        tryThis: "Sort walked, walker, unhappy, and cats by what changed.",
        readingBridge: "You can now evaluate—not merely memorize—the classic distinction.",
      },
      {
        id: "agreement-and-case",
        question: "Can a word record the people around it?",
        term: "Agreement · case",
        plain: "Word endings may track who acts, who is affected, possession, number, or noun class.",
        academic: "Agreement copies or covaries with features; case marks a nominal's morphosyntactic or semantic relation.",
        tryThis: "Locate person and participant markers in a verb paradigm.",
        readingBridge: "This bridges morphology into sentence structure and alignment.",
      },
      {
        id: "polysynthesis",
        question: "Where does a word end and a sentence begin?",
        term: "Polysynthesis",
        plain: "Some languages routinely build highly complex words that express information carried by whole phrases elsewhere.",
        academic: "Polysynthesis clusters multiple lexical and grammatical morphemes within a phonological word; definitions remain theoretically debated.",
        tryThis: "Compare how the same event is packaged across an isolating and a polysynthetic example.",
        readingBridge: "You are ready for typological texts that treat ‘word’ as an analytical question.",
      },
    ],
  }),
  createRoute({
    slug: "sentences",
    number: "04",
    sectionTitle: "Sentence Structure",
    question: "How do languages show who did what?",
    academicAreas: "Syntax · Case · Alignment",
    teaser: "Follow participants through word order, endings, agreement, omission, and structural grouping.",
    hook: "If a sentence has no familiar word order, how can a listener still find the actor?",
    destination: "Read basic syntactic representations and compare morphosyntactic alignment systems.",
    tone: "blue",
    reading: {
      title: "Syntax in 24.900 Introduction to Linguistics",
      source: "MIT OpenCourseWare",
      href: "https://ocw.mit.edu/courses/24-900-introduction-to-linguistics-spring-2022/download/",
      readyAfter: 4,
    },
    nodes: [
      {
        id: "participants-and-roles",
        question: "Who acts, and who is affected?",
        term: "Semantic roles",
        plain: "Events involve participants such as agents, experiencers, themes, and recipients.",
        academic: "Semantic roles characterize participant relations at the syntax–semantics interface.",
        tryThis: "Label the participants in ‘The key opened the door’ and ‘Mina opened the door.’",
        readingBridge: "This prevents grammatical subject from being confused with doer.",
      },
      {
        id: "word-order",
        question: "Can position identify a role?",
        term: "Constituent order",
        plain: "Languages use recurring orders, but order can be flexible when other signals carry more work.",
        academic: "Constituent-order typology compares the relative order of subject, object, verb, and phrase-internal heads and dependents.",
        tryThis: "Infer a likely order from three translated sentences.",
        readingBridge: "You can now interpret SOV labels as abstractions, not word-by-word formulas.",
      },
      {
        id: "constituency",
        question: "Which words behave as a group?",
        term: "Constituency",
        plain: "Words form nested units that can move, be replaced, or answer a question together.",
        academic: "Constituency tests diagnose hierarchical phrase structure, though individual diagnostics are language-specific.",
        tryThis: "Replace a phrase with it, they, there, or do so and observe what stays together.",
        readingBridge: "Tree diagrams now represent evidence-backed grouping rather than decorative branches.",
      },
      {
        id: "case-and-agreement",
        question: "Can endings identify a role?",
        term: "Case · agreement",
        plain: "Markers on nouns or verbs can track grammatical relations even when words move.",
        academic: "Case and agreement distribute morphosyntactic features across heads and dependents.",
        tryThis: "Reorder a marked sentence and ask which interpretations remain possible.",
        readingBridge: "This gives concrete evidence for feature-based syntactic descriptions.",
      },
      {
        id: "omitted-arguments",
        question: "How can a missing word still be understood?",
        term: "Argument omission",
        plain: "Grammar and discourse can make a participant recoverable without pronouncing it.",
        academic: "Null arguments interact with agreement, discourse accessibility, and a language's argument-realization system.",
        tryThis: "Compare English ‘I ate’ with contexts where the omitted object is understood.",
        readingBridge: "You can approach pro-drop and valency without assuming absence means no structure.",
      },
      {
        id: "alignment",
        question: "Do all languages group subjects alike?",
        term: "Morphosyntactic alignment",
        plain: "Languages can group the single participant of ‘sleep’ with the actor of ‘see’ or with its affected participant.",
        academic: "Alignment systems compare the morphosyntactic treatment of S, A, and P, including nominative–accusative and ergative–absolutive patterns.",
        tryThis: "Build a three-row S/A/P comparison before naming the alignment.",
        readingBridge: "The notation in typological and olympiad texts now encodes a relationship you can reconstruct.",
      },
    ],
  }),
  createRoute({
    slug: "sounds",
    number: "05",
    sectionTitle: "Sound Systems",
    question: "Why do languages hear and organize sounds differently?",
    academicAreas: "Phonetics · Phonology · Prosody",
    teaser: "Move from the physical gesture of a sound to the contrasts and patterns a language builds from it.",
    hook: "Two sounds can be ‘the same’ to one listener and signal different words to another. How?",
    destination: "Read IPA, phoneme distributions, and introductory phonological rules.",
    tone: "violet",
    reading: {
      title: "The International Phonetic Alphabet",
      source: "International Phonetic Association",
      href: "https://www.internationalphoneticassociation.org/content/ipa-chart-projects",
      readyAfter: 4,
    },
    nodes: [
      {
        id: "sound-gesture",
        question: "What is your mouth doing?",
        term: "Articulatory phonetics",
        plain: "Speech sounds differ in airflow, constriction location, constriction type, and vocal-fold activity.",
        academic: "Consonants are classified by airstream, place, manner, and laryngeal setting; vowels by tongue position and lip configuration.",
        tryThis: "Alternate [p] and [b] with a hand on your throat.",
        readingBridge: "IPA rows and columns now correspond to actions you can feel.",
      },
      {
        id: "sound-contrast",
        question: "Which differences change a word?",
        term: "Phoneme · minimal pair",
        plain: "A small sound difference is contrastive when it can distinguish meanings in that language.",
        academic: "Phonemes are contrastive units supported by distributions and minimal-pair evidence.",
        tryThis: "Compare pin/bin and the closest equivalent contrasts in another language.",
        readingBridge: "You can now distinguish a phonetic difference from a phonological contrast.",
      },
      {
        id: "predictable-sounds",
        question: "When is a difference predictable?",
        term: "Allophony",
        plain: "A language may pronounce one category differently in environments where the variants never compete.",
        academic: "Allophones are context-conditioned realizations analyzed through complementary distribution and phonetic similarity.",
        tryThis: "Compare the first sounds of English pin and spin while holding paper near your mouth.",
        readingBridge: "Distribution tables and environment notation now answer an audible puzzle.",
      },
      {
        id: "sound-processes",
        question: "Why do neighboring sounds reshape each other?",
        term: "Phonological process",
        plain: "Sounds may assimilate, delete, insert, or alternate to fit their environment.",
        academic: "Phonological processes map underlying representations to context-sensitive surface realizations.",
        tryThis: "Say ‘in Paris’ and ‘in Beijing’ quickly; track any place-of-articulation shift.",
        readingBridge: "Feature notation becomes a compressed description of a pattern you can produce.",
      },
      {
        id: "prosody",
        question: "Can melody change meaning?",
        term: "Tone · stress · intonation",
        plain: "Pitch, prominence, duration, and rhythm can distinguish words or organize whole utterances.",
        academic: "Prosody includes lexical tone, metrical stress, intonational structure, and their phonetic realization.",
        tryThis: "Say ‘Really.’ as a question, confirmation, and disbelief.",
        readingBridge: "You can separate lexical and utterance-level functions in prosodic descriptions.",
      },
      {
        id: "ipa",
        question: "How can we record sounds precisely?",
        term: "IPA transcription",
        plain: "The IPA gives analysts a shared notation for speech sounds independent of ordinary spelling.",
        academic: "Broad and narrow phonetic transcription represent contrastive categories and increasingly fine phonetic detail.",
        tryThis: "Transcribe three sounds by articulatory description before locating their symbols.",
        readingBridge: "You are ready to use—not merely stare at—the official IPA chart.",
      },
    ],
  }),
  createRoute({
    slug: "writing",
    number: "06",
    sectionTitle: "Writing Systems",
    question: "How can marks carry language?",
    academicAreas: "Writing systems · Decipherment",
    teaser: "Ask what signs represent before assuming they are pictures, letters, or direct containers of meaning.",
    hook: "A carved bird may depict a bird, spell a sound, classify a word—or do several jobs.",
    destination: "Analyze sign inventories, scripts, and parallel texts without confusing writing with language itself.",
    tone: "green",
    reading: {
      title: "Writing-system problems",
      source: "Linguistics Olympiad: Training Guide",
      href: "https://langsci-press.org/catalog/book/420",
      readyAfter: 4,
    },
    nodes: [
      {
        id: "writing-represents-language",
        question: "Is a picture already writing?",
        term: "Glottography",
        plain: "Writing systematically represents units of language; an image can communicate without encoding an utterance.",
        academic: "Glottographic systems map visible signs to linguistic units, unlike purely semasiographic communication.",
        tryThis: "Decide whether a restroom icon records a particular spoken sentence.",
        readingBridge: "You can now question the widespread ‘pictures became words’ shortcut.",
      },
      {
        id: "sign-values",
        question: "What can one sign stand for?",
        term: "Phonogram · logogram · determinative",
        plain: "A sign may represent a sound sequence, a word, or a cue about a word's category.",
        academic: "Scripts commonly combine phonographic, logographic, and disambiguating functions rather than fitting a pure type.",
        tryThis: "Classify the jobs of symbols in a rebus and an emoji sentence.",
        readingBridge: "Historical-script descriptions now offer testable sign functions.",
      },
      {
        id: "inventory-and-direction",
        question: "What can repetition and direction reveal?",
        term: "Sign inventory · text direction",
        plain: "Frequency, position, orientation, and repeated sequences constrain how a script might work.",
        academic: "Internal analysis of graphemic distribution can identify boundaries, directionality, and sign classes before values are known.",
        tryThis: "Find the repeating proper-name-shaped sequence in two inscriptions.",
        readingBridge: "You can read a sign table as evidence, not as decoration.",
      },
      {
        id: "mixed-writing-systems",
        question: "Must a script use only one principle?",
        term: "Mixed writing system",
        plain: "Real scripts often combine several representational strategies.",
        academic: "Writing-system typology describes dominant mappings while recognizing polyvalence, allography, and mixed representation.",
        tryThis: "List phonetic and semantic jobs performed by elements in one familiar script.",
        readingBridge: "You are prepared for typologies that are dimensions rather than rigid boxes.",
      },
      {
        id: "decipherment",
        question: "How is an unknown script deciphered?",
        term: "Decipherment",
        plain: "Analysts combine internal patterns, known names, related languages, and external context—then test readings across texts.",
        academic: "Decipherment assigns linguistic values through converging epigraphic, linguistic, archaeological, and comparative evidence.",
        tryThis: "Rank three clues by what each can establish and what it cannot.",
        readingBridge: "Claims of decipherment become arguments whose evidence you can audit.",
      },
      {
        id: "parallel-texts",
        question: "Why did the Rosetta Stone help?",
        term: "Parallel text · triangulation",
        plain: "Versions of related content provide anchors, but they are not necessarily word-for-word copies.",
        academic: "Parallel texts constrain interpretation by aligning discourse, names, formulae, and sign sequences across known and unknown systems.",
        tryThis: "Explain why three scripts strengthen a case without automatically proving every sign value.",
        readingBridge: "You can enter historical accounts of decipherment with a model of both their power and limits.",
      },
    ],
  }),
  createRoute({
    slug: "interpretation",
    number: "07",
    sectionTitle: "Meaning in Context",
    question: "Why can two correct translations still feel different?",
    academicAreas: "Semantics · Pragmatics · Discourse",
    teaser: "Trace what words encode, what contexts supply, and what speakers invite listeners to infer.",
    hook: "‘It's cold in here’ may report temperature—or ask someone to close a window.",
    destination: "Read introductory semantics and pragmatics while tracking their different explanatory jobs.",
    tone: "ochre",
    reading: {
      title: "Semantics and pragmatics in introductory linguistics",
      source: "MIT OpenCourseWare",
      href: "https://ocw.mit.edu/courses/24-900-introduction-to-linguistics-spring-2022/download/",
      readyAfter: 4,
    },
    nodes: [
      {
        id: "ambiguity",
        question: "Can the same form encode two structures?",
        term: "Lexical · structural ambiguity",
        plain: "A word or sentence can conventionally support more than one interpretation.",
        academic: "Ambiguity arises when an expression has multiple lexical entries or compositional structures, distinct from contextual vagueness.",
        tryThis: "Draw two readings of ‘I saw the person with the telescope.’",
        readingBridge: "Formal representations now diagnose where readings diverge.",
      },
      {
        id: "implicature",
        question: "How do we mean more than we say?",
        term: "Conversational implicature",
        plain: "Listeners infer an extra message from the words, situation, and expectation of cooperation.",
        academic: "Implicatures are defeasible pragmatic inferences derived from utterance content and conversational expectations.",
        tryThis: "Explain what ‘Some students passed’ often suggests—and how to cancel that suggestion.",
        readingBridge: "Defeasibility tests in pragmatics now have a concrete purpose.",
      },
      {
        id: "deixis",
        question: "Who are I, here, and now?",
        term: "Deixis",
        plain: "Some expressions can only be resolved relative to a speaker, place, time, or discourse position.",
        academic: "Deictic expressions are interpreted against a context index containing participant, spatial, temporal, social, or discourse coordinates.",
        tryThis: "Move a note saying ‘Meet me here tomorrow’ to a new reader and track what breaks.",
        readingBridge: "Context indices become solutions to an everyday coordination problem.",
      },
      {
        id: "presupposition",
        question: "What does a sentence quietly assume?",
        term: "Presupposition",
        plain: "Some background commitments survive even when a sentence is questioned or denied.",
        academic: "Presuppositions are projective background inferences associated with triggers and managed through common-ground update.",
        tryThis: "Negate ‘Lee stopped running’ and identify what still seems assumed.",
        readingBridge: "Projection and accommodation answer patterns you can already test.",
      },
      {
        id: "discourse-coherence",
        question: "Why do some sentences belong together?",
        term: "Discourse coherence",
        plain: "Listeners connect sentences through reference, cause, contrast, time, and shared topics.",
        academic: "Discourse coherence depends on referential cohesion, rhetorical relations, information structure, and models of discourse state.",
        tryThis: "Reorder four sentences and defend the most coherent sequence.",
        readingBridge: "Discourse trees and information-structure labels now describe felt differences in flow.",
      },
      {
        id: "common-ground",
        question: "How can explanation cross a gap?",
        term: "Common ground · audience design",
        plain: "A speaker estimates what is shared, supplies missing context, and revises when evidence shows the estimate was wrong.",
        academic: "Communication dynamically updates common ground; audience design models how utterances adapt to interlocutors' knowledge and perspective.",
        tryThis: "Explain recursion once to a programmer and once to a younger sibling; compare the bridges you build.",
        readingBridge: "You can connect pragmatics to education, writing, and communication-interface design.",
      },
    ],
  }),
  createRoute({
    slug: "worlds-in-words",
    number: "08",
    sectionTitle: "Lexical Worlds",
    question: "How do languages count, map space, and describe family?",
    academicAreas: "Lexicon · Cognition · Semantic typology",
    teaser: "Compare the conceptual systems hidden inside ordinary words without mistaking difference for deficiency.",
    hook: "A number may reveal a base; a direction may require a coastline; a relative may encode age.",
    destination: "Read typological descriptions of structured lexical domains and evaluate their evidence.",
    tone: "coral",
    reading: {
      title: "Lexical categories in the World Atlas of Language Structures",
      source: "WALS Online",
      href: "https://wals.info/chapter/s1",
      readyAfter: 4,
    },
    nodes: [
      {
        id: "numeral-systems",
        question: "What arithmetic is hidden in a number word?",
        term: "Numeral system",
        plain: "Number expressions combine units through addition, multiplication, subtraction, or special grouping.",
        academic: "Numeral typology analyzes bases, compositional operations, ordering, and numeral classifiers.",
        tryThis: "Infer a base from translations of five unfamiliar numerals.",
        readingBridge: "Formal numeral rules become compact statements of arithmetic structure.",
      },
      {
        id: "kinship-systems",
        question: "Which relations deserve separate words?",
        term: "Kinship terminology",
        plain: "Kin terms may encode generation, gender, lineage, relative age, or side of the family.",
        academic: "Kinship systems lexicalize selected genealogical and social distinctions and organize them into contrastive paradigms.",
        tryThis: "Build a feature table for six kin terms instead of translating them one by one.",
        readingBridge: "Anthropological-linguistic diagrams now represent dimensions you can test.",
      },
      {
        id: "spatial-frames",
        question: "Where is left if nobody is facing you?",
        term: "Frames of reference",
        plain: "Languages can anchor spatial descriptions to a body, an object, or fixed environmental directions.",
        academic: "Relative, intrinsic, and absolute frames of reference coordinate spatial language with cognitive and cultural practices.",
        tryThis: "Describe one object using each frame and note what information each requires.",
        readingBridge: "You can interpret cognitive-linguistic claims through an explicit comparison.",
      },
      {
        id: "color-categories",
        question: "Where does one color word stop?",
        term: "Color categorization",
        plain: "Color perception is continuous, while languages conventionalize named regions and boundaries.",
        academic: "Color-term research examines perceptual constraints, lexical category systems, usage, and methodological comparability.",
        tryThis: "Compare category boundaries, not only lists of translated color labels.",
        readingBridge: "You are equipped to separate universalist evidence from oversimplified internet claims.",
      },
      {
        id: "time-and-aspect",
        question: "Does grammar locate time—or shape an event?",
        term: "Tense · aspect",
        plain: "Tense locates events relative to a reference point; aspect presents their internal temporal shape.",
        academic: "Grammatical tense relates temporal intervals, while viewpoint and situation aspect encode completion, duration, iteration, and boundaries.",
        tryThis: "Compare ‘I read,’ ‘I was reading,’ and ‘I have read’ on a timeline.",
        readingBridge: "Temporal notation becomes a tool for distinctions ordinary labels blur.",
      },
      {
        id: "classification-systems",
        question: "Why must some nouns be counted differently?",
        term: "Classifier · noun class",
        plain: "Languages may group nouns by shape, animacy, function, or inherited grammatical classes.",
        academic: "Classifier systems and grammatical gender/noun class categorize nominals through distinct morphosyntactic distributions.",
        tryThis: "Compare English ‘sheets of paper’ with a language where numeral classifiers are routine.",
        readingBridge: "You can read category inventories without treating glosses as exact meanings.",
      },
    ],
  }),
  createRoute({
    slug: "diversity-change",
    number: "09",
    sectionTitle: "Diversity & Change",
    question: "Why are languages different, related, and changing?",
    academicAreas: "Typology · Historical linguistics · Contact",
    teaser: "Compare structures fairly, trace regular change, and separate inheritance from borrowing.",
    hook: "Shared words may indicate a common ancestor, a loan, coincidence—or a tempting mistake.",
    destination: "Read typological maps and basic comparative reconstructions with attention to method.",
    tone: "teal",
    reading: {
      title: "How WALS compares structural diversity",
      source: "WALS Online",
      href: "https://wals.info/chapter/s1",
      readyAfter: 4,
    },
    nodes: [
      {
        id: "typological-comparison",
        question: "How can we compare unlike systems fairly?",
        term: "Linguistic typology",
        plain: "Comparison begins with a defined feature and comparable evidence, not a familiar-language checklist.",
        academic: "Typology studies distributions and dependencies of structural features across a genealogically and geographically balanced sample.",
        tryThis: "Define one word-order feature precisely enough for two analysts to code it alike.",
        readingBridge: "Atlas symbols now represent an operational definition and sample, not a language's essence.",
      },
      {
        id: "universals-tendencies",
        question: "Does a common pattern count as a rule?",
        term: "Universal · tendency",
        plain: "Some generalizations are absolute; many are statistical tendencies with meaningful exceptions.",
        academic: "Linguistic universals range from unrestricted claims to implicational and distributional tendencies conditioned by sampling and analysis.",
        tryThis: "Rewrite ‘all languages…’ as a testable claim with possible counterevidence.",
        readingBridge: "You can read universals as hypotheses rather than trivia.",
      },
      {
        id: "language-families",
        question: "What makes languages relatives?",
        term: "Genealogical classification",
        plain: "Related languages descend from a common historical variety; similarity alone does not prove this.",
        academic: "Genealogical classification relies on systematic correspondences and shared innovations rather than isolated look-alikes.",
        tryThis: "Separate evidence from ancestry, borrowing, and chance in a cognate set.",
        readingBridge: "Family trees now summarize an argument about descent.",
      },
      {
        id: "regular-sound-change",
        question: "Why do related words differ regularly?",
        term: "Sound correspondence",
        plain: "A sound in one language may repeatedly align with another sound in the same historical environments.",
        academic: "The comparative method establishes regular correspondence sets and reconstructs conditioned historical changes.",
        tryThis: "Find one recurring initial-sound correspondence across four cognates.",
        readingBridge: "Reconstruction notation now compresses a repeatable inference.",
      },
      {
        id: "language-contact",
        question: "Can neighbors reshape one another?",
        term: "Language contact",
        plain: "Speakers borrow words and may converge in sounds, grammar, and discourse practices.",
        academic: "Contact-induced change interacts with bilingualism, social dominance, intensity of contact, and structural compatibility.",
        tryThis: "Classify one shared feature as likely inheritance, borrowing, or unresolved.",
        readingBridge: "You can resist explaining every similarity with a family tree.",
      },
      {
        id: "reconstruction",
        question: "Can we infer an unattested ancestor?",
        term: "Comparative reconstruction",
        plain: "Regular correspondences let analysts propose earlier forms that explain several descendants economically.",
        academic: "Proto-forms are hypotheses derived through correspondence sets, directionality evidence, and system-wide plausibility.",
        tryThis: "Choose between two proto-sounds and state which changes each requires.",
        readingBridge: "Asterisked forms become explicit inferences with inspectable assumptions.",
      },
    ],
  }),
  createRoute({
    slug: "society",
    number: "10",
    sectionTitle: "Language & Society",
    question: "Why do we speak differently with different people?",
    academicAreas: "Sociolinguistics · Multilingualism · Policy",
    teaser: "Treat variation as patterned social information, not noise or failed grammar.",
    hook: "The same speaker may change vocabulary, pronunciation, or language before entering a different room.",
    destination: "Read sociolinguistic accounts of variation, identity, ideology, and multilingual practice.",
    tone: "blue",
    reading: {
      title: "Language variation and society",
      source: "University of Michigan Linguistics",
      href: "https://lsa.umich.edu/linguistics/fields-of-study.html",
      readyAfter: 4,
    },
    nodes: [
      {
        id: "register-and-style",
        question: "Why does one speaker have many voices?",
        term: "Register · style",
        plain: "People adapt linguistic choices to activity, audience, relationship, and desired identity.",
        academic: "Register and style describe patterned intra-speaker variation linked to situations, stances, and social meanings.",
        tryThis: "Compare how you would request help from a friend, teacher, and automated system.",
        readingBridge: "Variation becomes structured data rather than inconsistency.",
      },
      {
        id: "dialect-variation",
        question: "Where does a dialect begin?",
        term: "Dialect · variety",
        plain: "Every speaker uses systematic varieties; borders reflect social networks as much as maps.",
        academic: "A variety is a distribution of linguistic features associated with communities, regions, practices, and identities.",
        tryThis: "Map one variable feature without ranking its variants as better or worse.",
        readingBridge: "You can interpret dialect surveys without treating standards as neutral baselines.",
      },
      {
        id: "code-switching",
        question: "Why switch languages mid-conversation?",
        term: "Code-switching",
        plain: "Multilingual speakers deploy their repertoires for topic, alignment, quotation, precision, or identity.",
        academic: "Code-switching exhibits grammatical constraints and interactional functions; it is not random linguistic confusion.",
        tryThis: "Annotate what changes immediately before and after one observed switch.",
        readingBridge: "You can connect structural and social analyses of multilingual data.",
      },
      {
        id: "prestige-and-ideology",
        question: "Who decides what sounds ‘proper’?",
        term: "Language ideology · prestige",
        plain: "Judgments about language often reflect institutions, histories, and speakers' social positions.",
        academic: "Language ideologies naturalize social evaluations of forms; overt and covert prestige distribute value unevenly.",
        tryThis: "Trace one ‘grammar correction’ to a communicative need or a social convention.",
        readingBridge: "Critical sociolinguistic texts now name mechanisms behind familiar judgments.",
      },
      {
        id: "variation-and-change",
        question: "Can today's variation become tomorrow's grammar?",
        term: "Variationist sociolinguistics",
        plain: "Competing forms spread unevenly across generations, networks, and situations.",
        academic: "Variationist analysis models socially and linguistically conditioned probabilities and apparent- or real-time change.",
        tryThis: "List variables that might predict use of one competing form.",
        readingBridge: "Statistical patterns become evidence about change in progress.",
      },
      {
        id: "policy-and-endangerment",
        question: "How can institutions change a language's future?",
        term: "Language policy · vitality",
        plain: "Schooling, media, migration, discrimination, and community choices affect where a language can be used and transmitted.",
        academic: "Language vitality is shaped by intergenerational transmission, domains of use, policy, resources, and speaker agency.",
        tryThis: "Evaluate a policy by asking whose goals, access, and linguistic rights it supports.",
        readingBridge: "You can approach endangerment as a social process, not a property of a language.",
      },
    ],
  }),
  createRoute({
    slug: "mind",
    number: "11",
    sectionTitle: "Language & Mind",
    question: "How do children and brains learn language?",
    academicAreas: "Acquisition · Psycholinguistics · Neurolinguistics",
    teaser: "Follow language from patterned input to prediction, production, memory, and neural evidence.",
    hook: "Children produce forms they were never taught—and errors adults rarely make.",
    destination: "Read introductory experimental work with a vocabulary for tasks, evidence, and competing explanations.",
    tone: "violet",
    reading: {
      title: "Language acquisition and processing fields",
      source: "University of Michigan Linguistics",
      href: "https://lsa.umich.edu/linguistics/fields-of-study.html",
      readyAfter: 4,
    },
    nodes: [
      {
        id: "acquisition-patterns",
        question: "How can a child discover a system?",
        term: "Language acquisition",
        plain: "Children extract patterns from interaction while cognitive, social, and linguistic capacities develop together.",
        academic: "Acquisition research tests how input, learning mechanisms, representation, interaction, and maturation explain developmental trajectories.",
        tryThis: "Treat goed as evidence: what rule must the child have generalized?",
        readingBridge: "Developmental errors become windows into representation rather than failures.",
      },
      {
        id: "word-segmentation-mind",
        question: "How does a baby find words in continuous speech?",
        term: "Statistical learning",
        plain: "Learners track which sounds tend to occur together and combine those cues with rhythm, meaning, and interaction.",
        academic: "Statistical learning uses distributional regularities such as transitional probabilities, alongside prosodic and social cues.",
        tryThis: "Mark likely boundaries in a repeated artificial sound stream.",
        readingBridge: "Experimental measures now test a specific segmentation hypothesis.",
      },
      {
        id: "sentence-processing",
        question: "How do we understand before a sentence ends?",
        term: "Incremental processing",
        plain: "Listeners predict and revise interpretations word by word under memory limits.",
        academic: "Psycholinguistic parsing is incremental, expectation-sensitive, and constrained by working memory and competing structures.",
        tryThis: "Track your first interpretation of a garden-path sentence and where it fails.",
        readingBridge: "Reading-time graphs become traces of changing expectations.",
      },
      {
        id: "language-production",
        question: "What do slips reveal about speaking?",
        term: "Language production",
        plain: "Planning moves from a message toward words, structures, and sounds; slips reveal partially separate stages.",
        academic: "Production models distinguish conceptualization, lexical selection, morphosyntactic encoding, phonological encoding, and articulation.",
        tryThis: "Classify a slip by which units exchanged or competed.",
        readingBridge: "Process diagrams now summarize evidence from observable errors and timing.",
      },
      {
        id: "bilingual-mind",
        question: "Are two languages ever fully switched off?",
        term: "Bilingual processing",
        plain: "A multilingual mind manages co-activated systems using context, proficiency, control, and experience.",
        academic: "Bilingual processing research examines cross-language activation, lexical access, switching, control, and variable dominance.",
        tryThis: "Predict when a visually similar word across languages helps or interferes.",
        readingBridge: "You can treat bilingualism as a dynamic system rather than two monolinguals combined.",
      },
      {
        id: "brain-and-language",
        question: "What can the brain tell us about language?",
        term: "Neurolinguistics",
        plain: "Brain injury, electrical responses, and imaging constrain models, but no colorful region alone explains language.",
        academic: "Neurolinguistics relates temporally and spatially distributed neural evidence to component processes and representations.",
        tryThis: "Ask whether one brain result distinguishes two competing linguistic explanations.",
        readingBridge: "You can read neural claims without confusing correlation, localization, and mechanism.",
      },
    ],
  }),
  createRoute({
    slug: "computation",
    number: "12",
    sectionTitle: "Language & Computation",
    question: "How can a computer work with language?",
    academicAreas: "Corpus linguistics · NLP · Formal models",
    teaser: "Turn language into representations a machine can process—then ask what each representation leaves out.",
    hook: "Before a model can ‘understand’ a sentence, someone must decide what counts as a unit and a success.",
    destination: "Read introductory NLP pipelines and evaluate models through linguistic error analysis.",
    tone: "green",
    reading: {
      title: "Computational linguistics as a field",
      source: "University of Michigan Linguistics",
      href: "https://lsa.umich.edu/linguistics/fields-of-study.html",
      readyAfter: 4,
    },
    nodes: [
      {
        id: "tokenization",
        question: "What should count as one unit?",
        term: "Tokenization",
        plain: "Spaces are one clue, but contractions, compounds, punctuation, scripts, and morphology complicate the split.",
        academic: "Tokenization maps text to processing units whose granularity interacts with orthography, morphology, vocabulary, and model architecture.",
        tryThis: "Tokenize don't, New York, and an unspaced Chinese sentence in two defensible ways.",
        readingBridge: "A preprocessing step becomes a linguistic design decision.",
      },
      {
        id: "corpus-evidence",
        question: "What can millions of examples show?",
        term: "Corpus linguistics",
        plain: "Searchable language collections reveal frequency and context, provided their sources and annotations fit the question.",
        academic: "Corpus inference depends on sampling, representativeness, metadata, annotation, and statistical comparison.",
        tryThis: "Design a corpus query that could distinguish two meanings of one word.",
        readingBridge: "Frequency tables become claims tied to a defined population and measure.",
      },
      {
        id: "distributional-representation",
        question: "Can context give a word coordinates?",
        term: "Distributional semantics",
        plain: "Words appearing in similar surroundings can receive nearby numerical representations.",
        academic: "Distributional models estimate semantic similarity from co-occurrence patterns, encoding some relations while conflating or omitting others.",
        tryThis: "Predict which words share contexts but not reference or sentiment.",
        readingBridge: "Vector diagrams now visualize a specific operational account of similarity.",
      },
      {
        id: "computational-parsing",
        question: "How can a model find structure?",
        term: "Parsing",
        plain: "A parser predicts how tokens relate or nest, using rules, probabilities, or learned representations.",
        academic: "Constituency and dependency parsing infer latent syntactic structure and are evaluated against annotated analyses.",
        tryThis: "Give two parses for an ambiguous sentence and identify the disambiguating context.",
        readingBridge: "Parser outputs become hypotheses you can linguistically inspect.",
      },
      {
        id: "speech-and-multimodality",
        question: "What changes when language is sound or image?",
        term: "Speech · multimodal modeling",
        plain: "Audio, gesture, text, and emoji carry different signals that must be aligned without pretending they are equivalent.",
        academic: "Multimodal models integrate representations with distinct temporal, visual, semantic, and contextual structures.",
        tryThis: "List what an emoji contributes beyond its Unicode label in a three-turn dialogue.",
        readingBridge: "Architecture diagrams now answer a representational problem rather than adding unexplained boxes.",
      },
      {
        id: "evaluation-and-bias",
        question: "When is a high score misleading?",
        term: "Evaluation · dataset bias",
        plain: "A model can exploit accidental patterns, majority labels, duplicates, or an unrealistic data split.",
        academic: "Robust evaluation requires task-valid metrics, leakage controls, distribution analysis, baselines, and subgroup or error inspection.",
        tryThis: "Explain why reshuffling a pre-labeled dataset might change a dialogue model's score.",
        readingBridge: "You can read an NLP result as an empirical argument with inspectable assumptions.",
      },
    ],
  }),
  createRoute({
    slug: "fieldwork",
    number: "13",
    sectionTitle: "Fieldwork & Ethics",
    question: "How can linguists learn from speakers responsibly?",
    academicAreas: "Field methods · Documentation · Ethics",
    teaser: "Build evidence with speakers and communities while treating consent, variation, and return as part of the method.",
    hook: "A perfect recording is not useful evidence if nobody knows its context—or agreed to its future use.",
    destination: "Read field-method and documentation materials with ethical and analytical questions in view.",
    tone: "ochre",
    reading: {
      title: "Fieldwork and language documentation",
      source: "University of Michigan Linguistics",
      href: "https://lsa.umich.edu/linguistics/fields-of-study.html",
      readyAfter: 4,
    },
    nodes: [
      {
        id: "elicitation",
        question: "How do you ask a question that produces evidence?",
        term: "Elicitation",
        plain: "Good prompts vary one factor, establish context, and leave room for the speaker to reject an unnatural form.",
        academic: "Elicitation designs judgments, productions, narratives, and paradigms while monitoring translation and task effects.",
        tryThis: "Rewrite ‘How do you say X?’ as a contextualized prompt with a contrast.",
        readingBridge: "An elicitation guide now reads as experimental design.",
      },
      {
        id: "recording-context",
        question: "What must travel with a recording?",
        term: "Metadata",
        plain: "Speaker choices, setting, participants, equipment, genre, permissions, and relationships make a recording interpretable.",
        academic: "Documentation metadata supports provenance, access control, discoverability, and later analytical reuse.",
        tryThis: "Create the minimum context record for a five-minute conversation.",
        readingBridge: "Archive requirements become safeguards for interpretation.",
      },
      {
        id: "speaker-variation",
        question: "Whose language does one example represent?",
        term: "Sampling · variation",
        plain: "Speakers differ by community, age, experience, setting, identity, and moment; no individual is a transparent stand-in for all.",
        academic: "Field sampling relates claims to participant populations, genres, interactional conditions, and intra-speaker variability.",
        tryThis: "Narrow an overbroad claim until the collected evidence can support it.",
        readingBridge: "Descriptive statements now carry an explicit evidential scope.",
      },
      {
        id: "annotation",
        question: "How does a recording become analyzable?",
        term: "Transcription · annotation · glossing",
        plain: "Time alignment, transcription, translation, segmentation, and notes preserve different layers of evidence.",
        academic: "Annotation aligns primary data with analytical tiers while documenting uncertainty, conventions, and revision history.",
        tryThis: "Separate what was heard, what was translated, and what was analytically inferred.",
        readingBridge: "Multi-tier displays now protect the distinction between evidence and analysis.",
      },
      {
        id: "consent-and-access",
        question: "Who should decide how data is used?",
        term: "Informed consent · access protocol",
        plain: "Permission is specific, revisable, and shaped by foreseeable audiences and community norms.",
        academic: "Ethical documentation treats consent, intellectual property, privacy, risk, and access as ongoing negotiated practices.",
        tryThis: "Compare permission to record, publish, archive, train a model, and share openly.",
        readingBridge: "Ethics sections become methodological commitments rather than paperwork.",
      },
      {
        id: "community-collaboration",
        question: "What should research return?",
        term: "Collaborative documentation",
        plain: "Goals, materials, training, credit, governance, and access can be designed with—not merely for—a community.",
        academic: "Collaborative approaches redistribute authority across research questions, data stewardship, analysis, outputs, and attribution.",
        tryThis: "Add a community-defined output and decision point to a research plan.",
        readingBridge: "You can evaluate a project's success beyond the researcher's publication.",
      },
    ],
  }),
  createRoute({
    slug: "olympiad",
    number: "14",
    sectionTitle: "Synthesis",
    question: "Can I solve a puzzle in a language I have never seen?",
    academicAreas: "Olympiad synthesis · Proof · Strategy",
    teaser: "Combine structural knowledge with disciplined evidence and write a solution another person can verify.",
    hook: "The puzzle promises enough information. Your task is to discover what kind of system could generate it.",
    destination: "Move from guided examples into official IOL sample and past problems.",
    tone: "coral",
    reading: {
      title: "Official sample problems",
      source: "International Linguistics Olympiad",
      href: "https://ioling.org/problems/samples/",
      readyAfter: 4,
    },
    nodes: [
      {
        id: "self-contained-evidence",
        question: "What am I allowed to assume?",
        term: "Self-contained reasoning",
        plain: "The data supplies the needed system; outside knowledge can distract as easily as it helps.",
        academic: "Olympiad analysis treats the problem statement as a closed evidential domain while using general analytical methods.",
        tryThis: "Separate stated facts, safe logical consequences, and cultural guesses.",
        readingBridge: "You can approach an unknown language without treating unfamiliarity as missing knowledge.",
      },
      {
        id: "organize-the-table",
        question: "How should I rearrange the evidence?",
        term: "Data normalization",
        plain: "Reordering, aligning, and marking repetitions can make a hidden relation visible.",
        academic: "Analytical normalization creates comparable representations while preserving the original observations.",
        tryThis: "Sort examples by one repeated meaning and align suspected pieces.",
        readingBridge: "A dense problem becomes a dataset with dimensions you control.",
      },
      {
        id: "olympiad-contrasts",
        question: "Which comparison removes the most uncertainty?",
        term: "Contrastive analysis",
        plain: "Choose pairs that isolate a single change before tackling rows where everything differs.",
        academic: "Contrastive evidence constrains mappings and interaction rules through controlled differences.",
        tryThis: "Rank three possible comparisons by information gained.",
        readingBridge: "Strategy becomes principled selection of evidence.",
      },
      {
        id: "olympiad-falsification",
        question: "Where could my rule fail?",
        term: "Falsification",
        plain: "Actively search for the row your favorite rule explains least well.",
        academic: "Falsification tests discriminating predictions among competing analyses rather than accumulating only confirmations.",
        tryThis: "Invent two rules that fit an anchor, then find the row that separates them.",
        readingBridge: "Harder solutions become comparisons among models, not inspired guesses.",
      },
      {
        id: "cross-layer-synthesis",
        question: "What if two systems interact?",
        term: "Morphophonology · morphosyntax",
        plain: "An ending may change a sound; a word's form may depend on its sentence role. Solve layers, then reconnect them.",
        academic: "Interface analysis separates component generalizations before modeling their ordered or simultaneous interaction.",
        tryThis: "Label each clue sound, word, sentence, or meaning—then draw the cross-layer dependency.",
        readingBridge: "Multi-part problems become linked subproblems rather than one opaque leap.",
      },
      {
        id: "proof-like-solution",
        question: "How do I make the answer convincing?",
        term: "Evidence-based explanation",
        plain: "State mappings and rules, demonstrate them on examples, then show how they generate the requested answers.",
        academic: "A reproducible analysis distinguishes observations, generalizations, derivations, residual uncertainty, and final predictions.",
        tryThis: "Add one worked derivation and one confirming example to a bare answer.",
        readingBridge: "You are ready to compare your reasoning with official solutions rather than only checking outputs.",
      },
    ],
  }),
];

export type RoadmapMacroNode = {
  slug: string;
  x: number;
  y: number;
};

export type RoadmapMacroEdge = {
  from: string;
  to: string;
  kind: "main" | "cross";
};

// Editorial positions make the large-scale curriculum legible before a learner
// enters any one submap. Edges are suggested relationships, never hard locks.
export const roadmapMacroNodes: RoadmapMacroNode[] = [
  { slug: "translation", x: 112, y: 290 },
  { slug: "decoding", x: 320, y: 290 },
  { slug: "words", x: 535, y: 95 },
  { slug: "sentences", x: 535, y: 225 },
  { slug: "sounds", x: 535, y: 355 },
  { slug: "writing", x: 535, y: 485 },
  { slug: "interpretation", x: 770, y: 95 },
  { slug: "worlds-in-words", x: 770, y: 225 },
  { slug: "diversity-change", x: 770, y: 355 },
  { slug: "society", x: 770, y: 485 },
  { slug: "mind", x: 1005, y: 120 },
  { slug: "computation", x: 1005, y: 290 },
  { slug: "fieldwork", x: 1005, y: 460 },
  { slug: "olympiad", x: 1248, y: 290 },
];

export const roadmapMacroEdges: RoadmapMacroEdge[] = [
  { from: "translation", to: "decoding", kind: "main" },
  { from: "translation", to: "interpretation", kind: "main" },
  { from: "translation", to: "worlds-in-words", kind: "main" },
  { from: "decoding", to: "words", kind: "main" },
  { from: "decoding", to: "sentences", kind: "main" },
  { from: "decoding", to: "sounds", kind: "main" },
  { from: "decoding", to: "writing", kind: "main" },
  { from: "words", to: "diversity-change", kind: "main" },
  { from: "sentences", to: "interpretation", kind: "main" },
  { from: "sounds", to: "mind", kind: "main" },
  { from: "writing", to: "diversity-change", kind: "main" },
  { from: "interpretation", to: "society", kind: "main" },
  { from: "worlds-in-words", to: "diversity-change", kind: "main" },
  { from: "diversity-change", to: "fieldwork", kind: "main" },
  { from: "society", to: "fieldwork", kind: "main" },
  { from: "mind", to: "computation", kind: "main" },
  { from: "computation", to: "olympiad", kind: "main" },
  { from: "fieldwork", to: "olympiad", kind: "main" },
  { from: "words", to: "computation", kind: "cross" },
  { from: "sentences", to: "computation", kind: "cross" },
  { from: "sounds", to: "diversity-change", kind: "cross" },
  { from: "interpretation", to: "mind", kind: "cross" },
  { from: "decoding", to: "olympiad", kind: "cross" },
];

export const roadmapStats = {
  routes: roadmapRoutes.length,
  concepts: roadmapRoutes.reduce((total, route) => total + route.nodes.length, 0),
  academicAreas: 13,
};
