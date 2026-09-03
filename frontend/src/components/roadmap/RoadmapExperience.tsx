"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowDown,
  ArrowRight,
  BookOpen,
  Check,
  Compass,
  Lightbulb,
  Minus,
  Plus,
  RotateCcw,
  Search,
  Sparkles,
  Waypoints,
} from "lucide-react";
import Header from "@/components/Header";
import {
  roadmapRoutes,
  roadmapStats,
  type RoadmapNode,
} from "@/data/roadmap";
import styles from "./roadmap.module.css";

type HookAnswer = "older" | "younger" | "context";

const hookOptions: { id: HookAnswer; label: string }[] = [
  { id: "older", label: "哥哥" },
  { id: "younger", label: "弟弟" },
  { id: "context", label: "Not enough context" },
];

const rampStages = [
  {
    step: "01",
    title: "Notice",
    level: "No terminology needed",
    body: "Make a prediction about a word, sound, sentence, sign, or tiny dataset you can already inspect.",
  },
  {
    step: "02",
    title: "Compare",
    level: "Evidence enters",
    body: "Change one thing at a time. The contrast makes a hidden distinction visible and testable.",
  },
  {
    step: "03",
    title: "Name",
    level: "Academic vocabulary",
    body: "Meet the technical term only after you have seen the job it performs and can point to its evidence.",
  },
  {
    step: "04",
    title: "Formalize",
    level: "Models and notation",
    body: "Replace the first intuition with a precise definition, representation, alternatives, and limits.",
  },
  {
    step: "05",
    title: "Read",
    level: "Guided academic text",
    body: "Enter an authentic source with a purpose, a glossary, and questions you already know how to ask.",
  },
  {
    step: "06",
    title: "Solve",
    level: "Independent transfer",
    body: "Use the idea on a new language or olympiad problem where the surface clues look different.",
  },
];

function edgePath(from: RoadmapNode, to: RoadmapNode) {
  const startX = from.x + 108;
  const endX = to.x - 108;
  const bend = Math.max(48, (endX - startX) * 0.48);
  return `M ${startX} ${from.y} C ${startX + bend} ${from.y}, ${endX - bend} ${to.y}, ${endX} ${to.y}`;
}

export default function RoadmapExperience() {
  const [hookAnswer, setHookAnswer] = useState<HookAnswer | null>(null);
  const [selectedRouteSlug, setSelectedRouteSlug] = useState("translation");
  const [selectedNodeId, setSelectedNodeId] = useState("translation-not-replacement");
  const [visited, setVisited] = useState<string[]>([]);
  const [query, setQuery] = useState("");
  const [zoom, setZoom] = useState(1);
  const atlasRef = useRef<HTMLElement>(null);
  const mapRef = useRef<HTMLElement>(null);

  const route =
    roadmapRoutes.find((item) => item.slug === selectedRouteSlug) ??
    roadmapRoutes[0];
  const selectedNode =
    route.nodes.find((item) => item.id === selectedNodeId) ?? route.nodes[0];
  const progress = route.nodes.filter((node) =>
    visited.includes(`${route.slug}:${node.id}`),
  ).length;
  const readingReady = progress >= route.reading.readyAfter;

  const filteredRoutes = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return roadmapRoutes;
    return roadmapRoutes.filter((item) =>
      [item.question, item.academicAreas, item.teaser]
        .join(" ")
        .toLowerCase()
        .includes(normalized),
    );
  }, [query]);

  const viewBoxWidth = 1080 / zoom;
  const viewBoxHeight = 520 / zoom;
  const viewBoxX = Math.min(
    Math.max(
      selectedNode.x - viewBoxWidth / 2,
      Math.min(0, 1080 - viewBoxWidth),
    ),
    Math.max(0, 1080 - viewBoxWidth),
  );
  const viewBoxY = Math.min(
    Math.max(
      selectedNode.y - viewBoxHeight / 2,
      Math.min(0, 520 - viewBoxHeight),
    ),
    Math.max(0, 520 - viewBoxHeight),
  );

  function markVisited(routeSlug: string, nodeId: string) {
    const key = `${routeSlug}:${nodeId}`;
    setVisited((current) =>
      current.includes(key) ? current : [...current, key],
    );
  }

  function answerHook(answer: HookAnswer) {
    setHookAnswer(answer);
    markVisited("translation", "translation-not-replacement");
  }

  function chooseRoute(slug: string, shouldScroll = false) {
    const nextRoute = roadmapRoutes.find((item) => item.slug === slug);
    if (!nextRoute) return;
    setSelectedRouteSlug(slug);
    setSelectedNodeId(nextRoute.nodes[0].id);
    setZoom(1);
    if (shouldScroll) {
      window.requestAnimationFrame(() =>
        mapRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }),
      );
    }
  }

  function selectNode(node: RoadmapNode) {
    setSelectedNodeId(node.id);
    markVisited(route.slug, node.id);
  }

  function enterAtlas() {
    atlasRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function enterTranslationRoute() {
    chooseRoute("translation", true);
  }

  const hookResponse =
    hookAnswer === "context"
      ? "Exactly. The missing information is not a translation error—it was never selected by the English word."
      : "That translation can be right, but you had to invent an age relation the English word never supplied.";

  return (
    <div className={styles.shell}>
      <Header />

      <main>
        <section className={styles.hero}>
          <div className={styles.heroTexture} aria-hidden="true" />
          <div className={styles.heroInner}>
            <div className={styles.heroCopy}>
              <span className={styles.eyebrow}>LingoHub learning atlas · prototype</span>
              <h1>
                A word you know is about to become
                <em> a problem.</em>
              </h1>
              <p className={styles.heroLead}>
                Begin with an ordinary guess. Follow the crack it opens into
                meaning, grammar, sound, history, computation, and real
                linguistic analysis.
              </p>
              <button className={styles.textCta} onClick={enterAtlas}>
                See where the question leads <ArrowDown size={17} />
              </button>
            </div>

            <div className={styles.hookCard}>
              <div className={styles.hookHeader}>
                <span>First question</span>
                <span>~ 45 seconds</span>
              </div>
              <p className={styles.hookPrompt}>One English word. Two ordinary Chinese translations.</p>
              <div className={styles.translationLine}>
                <strong>brother</strong>
                <ArrowRight size={24} aria-hidden="true" />
                <span>哥哥</span>
                <span className={styles.or}>/</span>
                <span>弟弟</span>
              </div>
              <fieldset className={styles.hookChoices}>
                <legend>Which translation is correct?</legend>
                {hookOptions.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => answerHook(option.id)}
                    className={`${styles.choiceButton} ${
                      hookAnswer === option.id ? styles.choiceSelected : ""
                    }`}
                    aria-pressed={hookAnswer === option.id}
                  >
                    {hookAnswer === option.id && <Check size={15} />}
                    {option.label}
                  </button>
                ))}
              </fieldset>

              {hookAnswer ? (
                <div className={styles.reveal} aria-live="polite">
                  <p className={styles.revealAnswer}>{hookResponse}</p>
                  <div className={styles.contextExamples}>
                    <div>
                      <span>My brother is three years older.</span>
                      <strong>哥哥</strong>
                    </div>
                    <div>
                      <span>My brother just started primary school.</span>
                      <strong>弟弟</strong>
                    </div>
                  </div>
                  <div className={styles.academicReveal}>
                    <span>Now name what you saw</span>
                    <strong>Lexicalization</strong>
                    <p>
                      Languages can divide the same semantic field at different
                      boundaries. Translation reconstructs meaning; it does not
                      simply replace labels.
                    </p>
                  </div>
                  <button className={styles.primaryButton} onClick={enterTranslationRoute}>
                    Follow this idea into linguistics <ArrowRight size={17} />
                  </button>
                </div>
              ) : (
                <p className={styles.hookHint}>Choose before the sentence gives you any more clues.</p>
              )}
            </div>
          </div>
        </section>

        <section className={styles.rampSection}>
          <div className={styles.sectionHeading}>
            <div>
              <span className={styles.eyebrowDark}>The on-ramp</span>
              <h2>Zero-basic is a starting point, not a ceiling.</h2>
            </div>
            <p>
              Every route preserves academic terminology, formal models, and
              authentic sources. What changes is the order: experience gives each
              abstraction somewhere to attach.
            </p>
          </div>
          <div className={styles.rampTrack}>
            {rampStages.map((stage, index) => (
              <article className={styles.rampStage} key={stage.step}>
                <div className={styles.rampTopline}>
                  <span>{stage.step}</span>
                  {index < rampStages.length - 1 && <ArrowRight size={16} />}
                </div>
                <h3>{stage.title}</h3>
                <small>{stage.level}</small>
                <p>{stage.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.atlasSection} ref={atlasRef}>
          <div className={styles.atlasIntro}>
            <div>
              <span className={styles.eyebrowDark}>Choose a doorway</span>
              <h2>The field, arranged as questions you can enter.</h2>
            </div>
            <div className={styles.atlasStats} aria-label="Roadmap scope">
              <div><strong>{roadmapStats.routes}</strong><span>question routes</span></div>
              <div><strong>{roadmapStats.concepts}</strong><span>prototype concepts</span></div>
              <div><strong>{roadmapStats.academicAreas}</strong><span>academic areas</span></div>
            </div>
          </div>

          <label className={styles.searchBox}>
            <Search size={18} />
            <span className={styles.srOnly}>Search routes</span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Try ‘sounds’, ‘translation’, ‘brain’, or ‘computer’"
            />
          </label>

          <div className={styles.routeGrid}>
            {filteredRoutes.map((item) => (
              <button
                key={item.slug}
                type="button"
                data-tone={item.tone}
                onClick={() => chooseRoute(item.slug, true)}
                className={`${styles.routeCard} ${
                  item.slug === route.slug ? styles.routeCardSelected : ""
                }`}
              >
                <span className={styles.routeNumber}>{item.number}</span>
                <span className={styles.routeQuestion}>{item.question}</span>
                <span className={styles.routeAreas}>{item.academicAreas}</span>
                <span className={styles.routeTeaser}>{item.teaser}</span>
                <span className={styles.routeAction}>
                  Open submap <ArrowRight size={15} />
                </span>
              </button>
            ))}
          </div>

          {filteredRoutes.length === 0 && (
            <div className={styles.emptySearch}>
              No route matches that phrase yet. Try an everyday word or an
              academic field name.
            </div>
          )}
        </section>

        <section
          className={styles.mapSection}
          ref={mapRef}
          data-tone={route.tone}
        >
          <div className={styles.mapHeader}>
            <div className={styles.mapTitleBlock}>
              <span className={styles.routeKicker}>Submap {route.number}</span>
              <h2>{route.question}</h2>
              <p>{route.hook}</p>
              <div className={styles.academicAreas}>{route.academicAreas}</div>
            </div>
            <div className={styles.routePickerWrap}>
              <label htmlFor="route-picker">Switch question</label>
              <select
                id="route-picker"
                value={route.slug}
                onChange={(event) => chooseRoute(event.target.value)}
              >
                {roadmapRoutes.map((item) => (
                  <option key={item.slug} value={item.slug}>
                    {item.number} — {item.question}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className={styles.mapLayout}>
            <div className={styles.mapWorkspace} data-tone={route.tone}>
              <div className={styles.mapToolbar}>
                <div className={styles.mapLegend}>
                  <span><i className={styles.legendCurrent} /> Selected</span>
                  <span><i className={styles.legendExplored} /> Explored</span>
                  <span><i className={styles.legendOpen} /> Open next</span>
                </div>
                <div className={styles.zoomControls} aria-label="Map zoom controls">
                  <button
                    onClick={() => setZoom((value) => Math.max(0.82, value - 0.12))}
                    aria-label="Zoom out"
                  >
                    <Minus size={16} />
                  </button>
                  <span>{Math.round(zoom * 100)}%</span>
                  <button
                    onClick={() => setZoom((value) => Math.min(1.34, value + 0.12))}
                    aria-label="Zoom in"
                  >
                    <Plus size={16} />
                  </button>
                  <button onClick={() => setZoom(1)} aria-label="Reset zoom">
                    <RotateCcw size={15} />
                  </button>
                </div>
              </div>

              <div className={styles.graphViewport}>
                <svg
                  className={styles.graph}
                  viewBox={`${viewBoxX} ${viewBoxY} ${viewBoxWidth} ${viewBoxHeight}`}
                  role="img"
                  aria-label={`Concept map for ${route.question}`}
                >
                  <defs>
                    <marker
                      id="roadmap-arrow"
                      viewBox="0 0 10 10"
                      refX="8"
                      refY="5"
                      markerWidth="6"
                      markerHeight="6"
                      orient="auto-start-reverse"
                    >
                      <path d="M 0 0 L 10 5 L 0 10 z" />
                    </marker>
                  </defs>
                  {route.edges.map((edge) => {
                    const from = route.nodes.find((node) => node.id === edge.from);
                    const to = route.nodes.find((node) => node.id === edge.to);
                    if (!from || !to) return null;
                    return (
                      <path
                        className={styles.edge}
                        d={edgePath(from, to)}
                        key={`${edge.from}-${edge.to}`}
                        markerEnd="url(#roadmap-arrow)"
                      />
                    );
                  })}
                  {route.nodes.map((node, index) => {
                    const isSelected = node.id === selectedNode.id;
                    const isVisited = visited.includes(`${route.slug}:${node.id}`);
                    return (
                      <foreignObject
                        key={node.id}
                        x={node.x - 108}
                        y={node.y - 52}
                        width="216"
                        height="104"
                      >
                        <button
                          type="button"
                          onClick={() => selectNode(node)}
                          className={`${styles.mapNode} ${
                            isSelected ? styles.mapNodeSelected : ""
                          } ${isVisited ? styles.mapNodeVisited : ""}`}
                          aria-pressed={isSelected}
                        >
                          <span>{String(index + 1).padStart(2, "0")} · {node.term}</span>
                          <strong>{node.question}</strong>
                          {isVisited && <Check className={styles.nodeCheck} size={15} />}
                        </button>
                      </foreignObject>
                    );
                  })}
                </svg>

                <div className={styles.nodeList}>
                  {route.nodes.map((node, index) => (
                    <button
                      key={node.id}
                      type="button"
                      onClick={() => selectNode(node)}
                      className={node.id === selectedNode.id ? styles.nodeListSelected : ""}
                    >
                      <span>{String(index + 1).padStart(2, "0")}</span>
                      <div><strong>{node.question}</strong><small>{node.term}</small></div>
                      <ArrowRight size={16} />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <aside className={styles.conceptPanel} aria-live="polite">
              <div className={styles.panelTopline}>
                <span>Concept {String(route.nodes.indexOf(selectedNode) + 1).padStart(2, "0")}</span>
                <span>{visited.includes(`${route.slug}:${selectedNode.id}`) ? "Explored" : "Open"}</span>
              </div>
              <h3>{selectedNode.question}</h3>
              <div className={styles.termBadge}>{selectedNode.term}</div>

              <div className={styles.panelBlock}>
                <span><Lightbulb size={15} /> Try it first</span>
                <p>{selectedNode.tryThis}</p>
              </div>
              <div className={styles.panelBlock}>
                <span><Compass size={15} /> What you notice</span>
                <p>{selectedNode.plain}</p>
              </div>
              <div className={`${styles.panelBlock} ${styles.academicBlock}`}>
                <span><Sparkles size={15} /> Academic formulation</span>
                <p>{selectedNode.academic}</p>
              </div>
              <div className={styles.bridgeBlock}>
                <Waypoints size={17} />
                <p><strong>Bridge to the text.</strong> {selectedNode.readingBridge}</p>
              </div>
            </aside>
          </div>

          <div className={styles.readingGate}>
            <div className={styles.readingIcon}><BookOpen size={22} /></div>
            <div className={styles.readingCopy}>
              <span>Academic destination</span>
              <h3>{route.reading.title}</h3>
              <p>{route.destination}</p>
              <small>{route.reading.source}</small>
            </div>
            <div className={styles.readingProgress}>
              <div className={styles.progressLabel}>
                <span>{progress} of {route.nodes.length} explored</span>
                <span>{readingReady ? "You have the vocabulary" : `Suggested after ${route.reading.readyAfter}`}</span>
              </div>
              <div className={styles.progressTrack}>
                {route.nodes.map((node) => (
                  <i
                    key={node.id}
                    className={
                      visited.includes(`${route.slug}:${node.id}`)
                        ? styles.progressFilled
                        : ""
                    }
                  />
                ))}
              </div>
              <a
                href={route.reading.href}
                target="_blank"
                rel="noreferrer"
                className={readingReady ? styles.readingButtonReady : styles.readingButton}
              >
                {readingReady ? "Open the academic source" : "Preview the source anytime"}
                <ArrowRight size={16} />
              </a>
            </div>
          </div>
        </section>

        <section className={styles.closingSection}>
          <div>
            <span className={styles.eyebrowDark}>No locked doors</span>
            <h2>The path guides. It never decides what you are allowed to understand.</h2>
          </div>
          <p>
            Open any concept, cross into another submap, or go directly to a
            problem. The roadmap exists to reveal hidden prerequisites—not turn
            them into gates.
          </p>
          <Link href="/problems" className={styles.problemButton}>
            Browse the problem bank <ArrowRight size={17} />
          </Link>
        </section>
      </main>
    </div>
  );
}
