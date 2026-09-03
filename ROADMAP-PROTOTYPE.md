# LingoHub Interactive Roadmap Prototype

Date: 2026-09-02
Updated: 2026-09-03
Route: `/roadmap`

## Outcome

The prototype tests one central product claim:

> A person with no linguistics background can enter through an ordinary language puzzle and reach real academic terminology, formal explanations, readings, and olympiad practice without a discontinuous jump.

It is a frontend prototype with local interaction state. It does not yet persist progress to the database or provide complete long-form lessons.

## Implemented experience

### 1. Zero-basic opening hook

The page opens with an answerable translation question:

```text
brother → 哥哥 / 弟弟
```

The learner chooses 哥哥, 弟弟, or “Not enough context.” The response changes according to that choice, then reveals two contexts and introduces **lexicalization** only after the distinction is visible.

### 2. Explicit ramp into academic reading

The page explains and applies a shared sequence:

```text
Notice → Compare → Name → Formalize → Read → Solve
```

The sequence is not a list of difficulty levels. It specifies the intellectual work the interface must support at each transition.

### 3. Interconnected fourteen-section atlas

Fourteen searchable sections cover translation, analytical method, morphology, syntax, sounds, writing, meaning and context, lexical systems, typology and history, society, mind, computation, fieldwork, and olympiad synthesis.

The sections first appear as a clickable macro-scale graph. **Section 01 · Introduction** is visibly marked as the shared entrance; solid and dashed edges distinguish dominant routes from cross-field connections. Every macro node, searchable card, route picker, and submap header uses the same section number and title.

Learner-facing cards still use ordinary questions, while academic field names remain visible as subtitles. On narrow screens, the graph becomes a semantic list that states each section's connections in text.

### 4. Divisible interactive submaps

Every route opens an independent six-node submap. The prototype supports:

- switching among submaps;
- selecting any concept without a hard lock;
- visible prerequisite direction through graph edges;
- zoom controls that recenter on the selected node;
- route-specific color and content;
- a semantic list in place of the graph on smaller screens;
- explored-state and route-progress indicators.
- textual links to the selected submap's connected sections.

### 5. Academic detail panel

Every concept selection displays four connected layers:

1. **Try it first:** a concrete manipulation or prediction;
2. **What you notice:** the pattern in plain language;
3. **Academic formulation:** precise disciplinary language;
4. **Bridge to the text:** what the learner can now recognize or evaluate in a later reading.

The academic formulation is present for all 84 prototype concepts.

### 6. Reading destination

Each submap has an authentic external destination from MIT OpenCourseWare, WALS, the International Phonetic Association, the University of Michigan, Language Science Press, or the International Linguistics Olympiad.

After four nodes are explored, the call to action changes from “Preview the source anytime” to “Open the academic source.” The source is never locked.

## Files

- `frontend/src/app/roadmap/page.tsx` — route and metadata;
- `frontend/src/components/roadmap/RoadmapExperience.tsx` — interaction and page structure;
- `frontend/src/components/roadmap/roadmap.module.css` — responsive visual system;
- `frontend/src/data/roadmap.ts` — fourteen routes and 84 concept records;
- `frontend/src/components/Header.tsx` — Roadmap navigation entry;
- `ROADMAP-ARCHITECTURE.md` — product and data architecture;
- `LINGUISTICS-STUDY-ROADMAP.md` — curriculum design.

## Verification

- Focused ESLint check on the roadmap component and data model after the macro-map update: passed.
- Repository-wide TypeScript check: reached the new files without reporting errors there, but the repository currently has pre-existing errors in `next.config.ts`, the home/problem pages, and submission/problem components.
- Production build: the project was moved from the Vercel-blocked Next.js 15.4.6 release to the patched 15.5.24 Maintenance LTS release. The lockfile passes an offline `npm ci --dry-run`, and the production build compiles successfully and statically generates `/roadmap`. The earlier build-time Google `next/font` dependency also remains removed, so deployment does not depend on downloading Geist during compilation.
- Local browser run: the sandbox does not permit binding the Next development server to port 3000, so visual browser inspection was not available in this session.

## Deliberate prototype boundaries

- Progress lasts for the current page session only.
- The prototype uses a dependency-free SVG concept map with selection and zoom. The production architecture still recommends React Flow for drag-panning, a minimap, richer path highlighting, and mature keyboard behavior.
- Nodes use one route-local graph pattern; a later content system should allow route-specific graph topologies and shared canonical concepts.
- The “Try it first” activities are prompts rather than full interactive exercises, except for the opening translation hook.
- Academic sources are external links rather than embedded guided-reading pages.
- Problem links currently lead to the problem bank rather than concept-specific selections.

## Recommended next build slice

Build the complete version of **Section 01 · Introduction** before expanding every route equally:

1. turn all six translation nodes into working micro-interactions;
2. write the Layer B core lessons;
3. create an annotated guided reading with glossary anchors;
4. map three appropriate LingoHub problems as Start Here, Practice, and Challenge;
5. test the route with learners who have never taken linguistics;
6. revise the ramp where they can name a term but cannot transfer it.

This vertical slice will test whether the central educational mechanism works before database and authoring infrastructure make it expensive to change.
