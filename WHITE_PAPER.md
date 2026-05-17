# Platinum, Aurora, and the Conformance Project

Status: living white paper
Current draft: `v0.3.0-draft`
Date: `2026-05-16`
Audience: broad technical readers, interested builders, collaborators, future
reviewers, and public-facing project storytelling

This document is the maintained narrative explanation of what this project is
doing, why it is being built this way, and how the approach evolves over time.
It is intended to be both a promotional piece and a disciplined reminder to the
team: the software, the evidence program, the release process, and the
generative-AI workflow all matter together.

See also:

- [white-paper/README.md](white-paper/README.md)
- [white-paper/CITATION_LEDGER.md](white-paper/CITATION_LEDGER.md)

![Platinum Hero](reference-artifacts/diagrams/platinum/platinum-hero.svg)

## Overview / Preamble

This project is not only a browser game repo.

It is a deliberate attempt to build a professional software program around a
harder claim:

- that generative AI can help produce serious, well-released software
- that aggressive iteration does not need to mean careless iteration
- that reference-driven quality can be pursued with explicit evidence instead
  of vague taste alone
- that local harnesses, release lanes, review packets, and durable artifacts can
  keep AI-assisted work honest

`Platinum` is the reusable browser-arcade host. `Aurora Galactica` is the first
shipped application on that host. `Galaxy Guardians` is the second-game proof
that the platform, ingestion program, and conformance discipline can grow
beyond a single title.

The larger point is not "we used AI to make a game."

The larger point is that we are building a system in which:

- the product is real
- the releases are real
- the documentation is real
- the tests and harnesses are real
- the evidence is real
- and the model-assisted work is useful because it is forced to leave behind
  rerunnable artifacts

## Section Overview

- `1. Thesis`: what this project is trying to prove.
- `2. Program snapshot`: where Platinum, Aurora, and Galaxy Guardians stand
  right now.
- `3. Five-layer operating model`: platform, games, ingestion, harnesses, and
  release economics as one program.
- `4. Ingestion strategy`: how external evidence becomes structured game truth.
- `5. Harnessing and conformance`: how we measure quality instead of asserting
  it.
- `6. Release discipline`: how dev, beta, and production remain explicit and
  professional.
- `7. Generative AI role`: how model work accelerates the project without
  replacing evidence.
- `8. Historical evolution`: how the project moved from launch to platform to
  multi-game conformance.
- `9. Citation program`: how outside ideas and source work should be tracked.
- `10. Living-paper policy`: how this white paper should be maintained and
  released over time.

## How To Read This Paper

This page is meant to be the readable narrative layer, not the whole archive.

- Read this paper for the story, the method, and the architectural shape of the
  project.
- Use the diagrams, screenshots, and charts here as anchors, not as the full
  evidence pack.
- If you want implementation detail, detailed metrics, or release-by-release
  operational context, jump into the linked hosted documentation rather than
  making this paper carry everything.

Useful deeper surfaces:

- [project-guide.html](project-guide.html)
- [platinum-guide.html](platinum-guide.html)
- [application-guide.html](application-guide.html)
- [conformance-dashboard.html](conformance-dashboard.html)
- [release-dashboard.html](release-dashboard.html)
- [release-notes.html](release-notes.html)
- [white-paper.pdf](white-paper.pdf)

## First Draft

### 1. Thesis

The core thesis of this project is that generative-AI-assisted software can be
built aggressively without becoming hand-wavy, fragile, or unprofessional.

That requires a few non-negotiable rules:

- the software must ship as a real public product, not just as a demo
- improvements must be tied to evidence whenever the question is measurable
- platform boundaries must stay explicit so reuse is deliberate rather than
  accidental
- release claims must be backed by committed docs, review artifacts, and
  rerunnable checks
- model work should increase leverage, but repeated assessment should
  increasingly move into local CPU/browser harnesses

This is why Platinum, Aurora, Galaxy Guardians, ingestion, harnesses,
scorecards, review packets, and release notes belong in the same story.

![Current Aurora gameplay surface](export.mov.png)

The image above is intentionally simple: it reminds the reader that all of the
process, evidence, and release discipline in this paper exist in service of a
real playable artifact, not only a methodology exercise.

Further detail:

- [application-guide.html](application-guide.html)
- [release-notes.html](release-notes.html)

### 2. Program Snapshot

As of `2026-05-16`, the project can be described in one page:

| Area | Current role | Why it matters |
| --- | --- | --- |
| `Platinum` | Shipped browser-arcade host platform | Proves that reusable shell, services, lane model, and release discipline can exist without absorbing game-specific truth. |
| `Aurora Galactica` | First shipped playable Platinum application | Serves as the strongest current proof that the platform can host a real public game and improve its conformance over time. |
| `Galaxy Guardians` | Preview-first second-game and first-class ingestion/conformance target | Proves that the platform and the evidence program can support a second game without simply cloning Aurora. |
| Ingestion framework | Source-to-structured-evidence pipeline | Keeps new-game and fidelity work anchored in manifests, clips, event logs, waveforms, contact sheets, and provenance. |
| Harness and conformance system | Scorecards, correspondence checks, dashboards, and gates | Turns quality claims into measurable, reviewable outputs. |
| Release and economics program | Lane discipline, review packets, docs refresh, local-vs-cloud resource accounting | Makes the project look and behave like a professional release program rather than an endless prototype. |

Current maintained metric read:

| Scope | Current read | Interpretation |
| --- | --- | --- |
| `Aurora Galactica` | `9.2/10` release-quality conformance | Strong shipped baseline with known high-value gaps, especially audio identity and later depth. |
| `Galaxy Guardians` reference preview | `7.6/10` | Credible second-game proof, but intentionally not presented as production-ready parity. |
| `Galaxy Guardians` playtest-weighted preview | `6.9/10` | Useful reminder that a game can have process maturity before it has public-readiness maturity. |
| Local-vs-cloud resource split | about `92.8%` local wall, about `7.4%` declared GPU-equivalent wall | Shows the intended operating doctrine: repeated measurement local, model help strategic. |

![Aurora Pack Card](reference-artifacts/diagrams/platinum/aurora-pack-card.svg)

![Galaxy Guardians Pack Card](reference-artifacts/diagrams/platinum/galaxy-guardians-pack-card.svg)

These pack views help a broad reader understand one of the project’s central
claims: `Aurora Galactica` and `Galaxy Guardians` are not supposed to be two
skins on one game. They are meant to be separate applications living on one
host platform.

> TODO illustration:
> Choose a small three-panel progression strip that shows how the public face
> of the project evolved from `1.0.0` launch to `1.2.0` Platinum framing to
> `1.4.0` multi-game posture. The most illustrative version may be gameplay
> first, shell first, or docs/release-surface first, and we should pick that
> deliberately rather than guessing.

Further detail:

- [project-guide.html](project-guide.html)
- [platinum-guide.html](platinum-guide.html)

### 3. Five-Layer Operating Model

The repo already describes the work as a layered system. The white paper should
make that model legible at a glance.

```mermaid
flowchart TD
    A["Reference games, videos, manuals, and source artifacts"] --> B["Ingestion framework"]
    B --> C["Game-owned evidence: manifests, windows, event logs, cue catalogs, stage summaries"]
    C --> D["Applications: Aurora Galactica and Galaxy Guardians"]
    D --> E["Harnesses, scorecards, correspondence reports, dashboards"]
    E --> F["Release lanes, docs, review packets, and public claims"]
    F --> G["Observed gaps, player feedback, and next investment choices"]
    G --> B
    H["Platinum platform"] --> D
    H --> E
    H --> F
```

![Platinum Platform Stack](reference-artifacts/diagrams/platinum/platinum-platform-stack.svg)

![Platinum Pack Separation](reference-artifacts/diagrams/platinum/platinum-pack-separation.svg)

The important discipline is separation of ownership:

- `Platinum` owns shell, hosting, shared services, contracts, and release
  framing.
- Games own rules, scoring, progression, audiovisual identity, and their own
  conformance truth.
- Ingestion owns provenance and structured evidence.
- Harnesses own repeatable evaluation.
- Release discipline owns the public promise.

When those layers blur, the project becomes harder to explain, harder to test,
and easier to accidentally fake.

Further detail:

- [project-guide.html#platform-vs-applications](project-guide.html#platform-vs-applications)
- [platinum-guide.html](platinum-guide.html)
- [PROJECT_STATE_AND_CONFORMANCE_PROGRAM.md](PROJECT_STATE_AND_CONFORMANCE_PROGRAM.md)

### 4. Ingestion Strategy

Ingestion is the front half of engineering, not a side notebook.

The project does not want new games or fidelity improvements to come mainly
from memory, vibes, or post-hoc rationalization. Instead, it wants evidence to
arrive in structured forms that can be reused:

- source manifests
- preserved clips and windows
- frame contact sheets
- waveforms and spectrograms
- reference-side event logs
- semantic annotations
- confidence notes
- scorer and correspondence targets

For `Aurora`, this keeps Galaga-like timing, audio, pressure, and stage-shape
questions grounded in real artifacts.

For `Galaxy Guardians`, ingestion matters even more. It is the mechanism that
prevents the second game from turning into "Aurora with different labels." The
game should become more complete by promoting `Galaxian` evidence into
game-owned scoring, wave timing, sprite identity, audio expectations, and
runtime correspondence checks.

In short:

- external artifacts teach the game
- ingestion turns artifacts into structured evidence
- the application implements against that evidence
- Platinum stays the host rather than the hidden author of the game

![Galaga stage-opening reference contact sheet](reference-artifacts/analyses/galaga-stage-opening-timing/2026-04-12-main-a777fba/opening-contact-tight.png)

![Galaxian reference contact sheet](reference-artifacts/analyses/galaxian-reference/matt-hawkins-arcade-intro/frames/contact-sheet-reference-window.jpg)

These reference contact sheets are useful because they show the project’s
ingestion claim in a form a non-expert can understand quickly. We are not only
describing classic arcade behavior; we are collecting windows, studying them,
and turning them into reusable evidence.

> TODO illustration:
> Pick the single best “ingestion in action” image for v1. The strongest option
> might be a contact sheet, a waveform-plus-contact-sheet pair, or a staged
> comparison between raw source footage and the structured artifact family that
> comes out of it.

Further detail:

- [project-guide.html#classic-arcade-ingestion-framework-doc](project-guide.html#classic-arcade-ingestion-framework-doc)
- [application-guide.html](application-guide.html)
- [CLASSIC_ARCADE_INGESTION_FRAMEWORK.md](CLASSIC_ARCADE_INGESTION_FRAMEWORK.md)

### 5. Harnessing And Conformance

This project is serious about the difference between "better" and "better by a
rerunnable measure."

The conformance system exists so that quality can be described with more
precision than a mood:

- timing correspondence
- sequence correspondence
- outcome correspondence
- spatial correspondence
- visual correspondence
- audio correspondence
- persona and progression correspondence

The current Aurora scorecard turns this into a twelve-category quality model.
That matters for two reasons.

First, it helps choose investments that are actually player-visible.

Second, it protects the team from false confidence. A `10/10` is explicitly not
"perfect"; it means "maxed at current scorer resolution." Better evidence or a
better evaluator can lower a score while making the project more truthful.

The harness program also stays intentionally classified:

- `platform` harnesses protect shell, hosting, docs, and shared services
- `application` harnesses protect game-specific rules and behavior
- `boundary` harnesses protect the seam between Platinum and the games

Representative committed commands in this strategy include:

- `npm run harness:measure`
- `npm run review:code`
- `npm run review:ledger`
- `npm run harness:check:galaxy-guardians-first-class-conformance`

This is the deeper quality claim of the project: bugs, polish, and release
readiness should increasingly move from memory and opinion into explicit checks,
artifacts, and dashboards.

![Conformance score trends](reference-artifacts/analyses/conformance-economics/2026-05-14-1c788342/score-trends.svg)

![Persona performance distribution](reference-artifacts/analyses/persona-performance-distribution/performance-lines.svg)

The value of these charts is not only that they look rigorous. They show that
the project tries to externalize quality questions into surfaces that can be
inspected, debated, and rerun.

Further detail:

- [conformance-dashboard.html](conformance-dashboard.html)
- [project-guide.html#release-conformance-dashboard-doc](project-guide.html#release-conformance-dashboard-doc)
- [project-guide.html#conformance-economics-doc](project-guide.html#conformance-economics-doc)

### 6. Release Discipline And Professionalism

The project treats release engineering as part of product quality.

That means the release lanes are not cosmetic:

1. local `localhost`
2. hosted `/dev`
3. hosted `/beta`
4. hosted `/production`

Each lane carries a different stability promise, documentation expectation, and
testing posture. The project is intentionally trying to behave like a software
program with real public accountability:

- release notes are first-class
- docs are part of the release surface
- review packets and review-learning ledgers are durable evidence
- the white paper must read well both as hosted HTML and as printable PDF
- production claims should come from an approved beta lineage
- major releases should refresh dashboards, scorecards, and strategic docs

This matters because AI-assisted speed is only impressive if the public result
still feels trustworthy.

The "reviewer" mentality should therefore be explicit. The paper is not done
just because the words are present. The release surface should also be reviewed
for:

- repeated ideas that can be tightened
- diagrams or images that create awkward whitespace or weak page breaks
- TODOs that are unclear or more revealing of indecision than of real planning
- HTML reading flow on desktop and mobile
- PDF export quality, especially around image scale, table breaks, and diagram
  legibility

Further detail:

- [release-dashboard.html](release-dashboard.html)
- [release-notes.html](release-notes.html)
- [project-guide.html#testing-doc](project-guide.html#testing-doc)
- [project-guide.html#code-review-model-doc](project-guide.html#code-review-model-doc)
- [white-paper/REVIEWER_CHECKLIST.md](white-paper/REVIEWER_CHECKLIST.md)

### 7. How Generative AI Fits

The project does use generative AI heavily, but not as a substitute for
engineering structure.

The intended operating doctrine is:

- use models to design evaluators, synthesize options, write code, review code,
  summarize evidence, and tighten the next decision
- use local CPU/browser harnesses for repeated measurement, sweeps, and
  regression checks
- convert model-assisted insight into committed repo artifacts whenever
  possible
- log resource use and compare spend against score movement
- keep human review, public release notes, and versioned documentation in the
  loop

The repo already describes one part of this explicitly as a
"Karpathy-loop-like" pattern:

- inspect concrete examples
- improve the dataset and evaluator
- make a small candidate change
- run it
- study failures
- fold the learning back into the system

That is a strong fit for the broader project identity. The point is not merely
to ask a model for code. The point is to build a system in which model help
leaves behind better evaluators, better artifacts, and cheaper future
decisions.

![Compute minutes by resource](reference-artifacts/analyses/conformance-economics/2026-05-14-1c788342/compute-minutes-by-resource.svg)

![Cost per positive score point](reference-artifacts/analyses/conformance-economics/2026-05-14-1c788342/cost-per-positive-score-point.svg)

These charts help keep the AI story grounded. The point is not only that model
assistance exists; it is that the project is trying to compare that assistance
with local repeatable measurement and with visible quality movement.

Further detail:

- [project-guide.html#conformance-economics-doc](project-guide.html#conformance-economics-doc)
- [CONFORMANCE_ECONOMICS.md](CONFORMANCE_ECONOMICS.md)

### 8. Working Loop

The operating loop of this project is more important than any single feature.

```mermaid
flowchart LR
    A["Choose highest-value gap"] --> B["Gather or refine reference evidence"]
    B --> C["Build or tighten scorer / harness"]
    C --> D["Run local measurement"]
    D --> E["Use Codex/model help for implementation, synthesis, and review"]
    E --> F["Promote keepers into code, docs, and artifacts"]
    F --> G["Refresh scorecards, release docs, and priorities"]
    G --> A
```

This loop explains how the project tries to be both aggressive and controlled.
The aggressiveness comes from fast iteration and model-assisted leverage. The
control comes from evidence, harnesses, explicit ownership boundaries, and
release discipline.

> TODO illustration:
> Add one compact “question -> evidence -> harness -> change -> rerun” visual
> from a real case study. Audio cue alignment, stage-opening timing, or a
> Galaxy Guardians reference-promotion slice are the strongest current
> candidates, but we should choose the one that is most legible to a broad
> reader.

### 9. Historical Evolution So Far

The release notes already show a clear arc, and the white paper should make it
easy to retell.

| Release | Meaning | Strategic shift |
| --- | --- | --- |
| `1.0.0` | First public Aurora launch | The project became a real public product with live scoring, pilot identity, replay visibility, and a real release ladder. |
| `1.2.0` | Platinum Release 1 | Aurora was reframed as the first application on a reusable platform, making platform/application separation explicit. |
| `1.4.0` | Current multi-game and conformance baseline | The public line now carries stronger documentation, review evidence, persona/replay follow-through, and a clearer Galaxy Guardians posture. |

This means the project has already moved through three meaningful phases:

1. prove a public game can ship
2. prove the host platform is real
3. prove multi-game and conformance maturity can become part of the release
   identity

The next phase should be to prove that this method scales:

- deeper Aurora conformance
- stronger Galaxy Guardians first-class completeness
- cleaner shared Platinum operations
- more reusable ingestion and assessment infrastructure

> TODO illustration:
> Build a release-history gallery with one screenshot or architectural surface
> per milestone. The current paper names the milestones clearly, but a short
> visual strip would make the progression easier to absorb at a glance.

Further detail:

- [release-notes.html](release-notes.html)
- [project-guide.html#release-note-140-beta-1-doc](project-guide.html#release-note-140-beta-1-doc)
- [project-guide.html#release-note-130-production-refresh-doc](project-guide.html#release-note-130-production-refresh-doc)

### 10. Citation Program

This white paper should not quietly absorb ideas from other work without naming
them.

We want a maintained citation program that records:

- what outside work or source material influenced us
- how we used it
- what we learned from it
- what changed in the repo because of it
- what still needs to be recovered, linked, or tightened

The living ledger for that work starts here:

- [white-paper/CITATION_LEDGER.md](white-paper/CITATION_LEDGER.md)

The first open citation debt is the prior standalone assessment of the
Karpathy-style research/evaluator loop. The repo contains the conceptual thread
already, but the older assessment should be recovered and linked directly in a
future white-paper release rather than reconstructed from memory.

Further detail:

- [white-paper/CITATION_LEDGER.md](white-paper/CITATION_LEDGER.md)

### 11. Related Work

This project should periodically stop and look outward.

The right pattern is not to stuff the paper with literature. The right pattern
is to do focused searches, add high-signal sources, explain their relevance in
plain language, and keep the public references linked to a maintained log.

Current seeded related-work set:

- [Anthropic, "Building effective agents" (2024-12-19)](https://www.anthropic.com/engineering/building-effective-agents): relevant because it argues for simple, composable agent patterns and evaluator-optimizer loops rather than ornamental workflow complexity.
- [Anthropic, "Writing effective tools for agents - with agents" (2025-09-11)](https://www.anthropic.com/engineering/writing-tools-for-agents): relevant because our harnesses, scripts, and release tools are all explicit contracts between model assistance and deterministic system behavior.
- [Anthropic, "Demystifying evals for AI agents" (2026-01-09)](https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents): relevant because it reinforces our investment in transcripts, graders, repeated trials, and measurable evaluator quality instead of anecdotal confidence.
- [Anthropic, "Trustworthy agents in practice" (2026-04-09)](https://www.anthropic.com/engineering/building-trustworthy-agents): relevant because it frames guardrails, reviews, and operator-visible controls as part of the product surface, not only as implementation details.

Maintained deeper log:

- [white-paper/RELATED_WORK.md](white-paper/RELATED_WORK.md)

### 12. Why This Project Matters

The project matters because it is trying to demonstrate a concrete alternative
to two weak extremes.

It is not:

- slow, ceremonial process that kills iteration
- or fast AI-assisted output that cannot explain or defend itself

Instead, it aims for a middle path:

- ambitious shipping
- real public releases
- strong platform boundaries
- evidence-backed improvement
- local-first repeated measurement
- model-assisted leverage
- versioned documentation and release storytelling

If that works, the result is more than a good arcade project. It becomes a
useful pattern for how generative AI can participate in professional software
work without dissolving quality standards.

This is also why the paper should remain readable. A broad technical reader
does not need every source artifact inline. They need a coherent narrative,
selected visual proof, and obvious places to go next if they want more depth.

### 13. Living White Paper Policy

This document should evolve the same way the project evolves: intentionally,
versioned, and with historical memory preserved.

Working policy:

- `WHITE_PAPER.md` is the current living draft
- the hosted HTML and printable PDF should be kept aligned as two views of the
  same maintained release surface
- meaningful revisions should be snapshotted under `white-paper/releases/`
- each snapshot should preserve the exact white paper text for that release
- when a release PDF exists, the snapshot should preserve the Markdown, PDF,
  and generated PDF metadata together
- the citation ledger should be updated when outside work materially changes the
  project story
- the related-work log should be refreshed periodically with focused online
  searches and brief relevance commentary
- reviewer-checklist expectations should be treated as part of release quality,
  not optional cleanup
- every meaningful software release does not need a new white paper release, but
  every strategic narrative shift probably does

Good triggers for a new white paper release:

- a major public release family
- a major shift in the conformance program
- a stronger second-game milestone
- a meaningful change in the AI/harness/evidence operating model
- recovery of an important citation or conceptual influence

## Immediate Next Additions

- Recover and link the earlier Karpathy-style assessment if it exists outside
  this repo.
- Add a compact bibliography of internal canonical docs and public release
  notes.
- Add one deliberate progression gallery for milestone history and one deliberate
  “evidence in action” case-study image once we decide which examples explain
  the project most clearly.
- Keep the HTML and PDF release surfaces under reviewer scrutiny so that spacing,
  diagrams, repeated ideas, and print behavior all improve with the narrative.
- Keep the audience tuned for a broad technical and builder readership: assume
  interest, assume intelligence, but do not assume deep prior expertise.
