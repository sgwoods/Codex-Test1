# White Paper Illustration Plan

This document tracks the visuals that support the white paper, the deeper
reference materials that should stay nearby in hosted docs, and the places where
we still need to choose the most illustrative image or chart deliberately.

## Selection Rules

- Prefer visuals that a broad technical or builder reader can interpret quickly.
- Use the main paper for orientation-quality visuals, not for every supporting
  artifact.
- Put deeper evidence families in the hosted guides, dashboards, and linked
  source documents instead of overloading the main narrative.
- When a visual choice is ambiguous, keep a placeholder in the paper and record
  the decision debt here.

## Current In-Paper Visuals

| White-paper section | Current asset | Why it works |
| --- | --- | --- |
| Overview / thesis | `reference-artifacts/diagrams/platinum/platinum-hero.svg` | Gives the paper an immediate project identity and platform-level frame. |
| Thesis | `export.mov.png` | Shows that the evidence and release program serve a real playable artifact. |
| Program snapshot | `reference-artifacts/diagrams/platinum/aurora-pack-card.svg` | Makes Aurora legible as an application on the platform. |
| Program snapshot | `reference-artifacts/diagrams/platinum/galaxy-guardians-pack-card.svg` | Shows second-game identity without requiring a long explanation. |
| Five-layer operating model | `reference-artifacts/diagrams/platinum/platinum-platform-stack.svg` | Reinforces platform-versus-application separation. |
| Five-layer operating model | `reference-artifacts/diagrams/platinum/platinum-pack-separation.svg` | Helps explain ownership boundaries at a glance. |
| Ingestion strategy | `reference-artifacts/analyses/galaga-stage-opening-timing/2026-04-12-main-a777fba/opening-contact-tight.png` | Makes ingestion concrete through a visible reference-study artifact. |
| Ingestion strategy | `reference-artifacts/analyses/galaxian-reference/matt-hawkins-arcade-intro/frames/contact-sheet-reference-window.jpg` | Supports the claim that Galaxy Guardians is grounded in its own source family. |
| Harnessing and conformance | `reference-artifacts/analyses/conformance-economics/2026-05-14-1c788342/score-trends.svg` | Turns progress into an at-a-glance measurable story. |
| Harnessing and conformance | `reference-artifacts/analyses/persona-performance-distribution/performance-lines.svg` | Shows that quality is evaluated across viewpoints, not through one metric alone. |
| Release and economics | `reference-artifacts/analyses/conformance-economics/2026-05-14-1c788342/compute-minutes-by-resource.svg` | Makes local-first measurement strategy visible. |
| Release and economics | `reference-artifacts/analyses/conformance-economics/2026-05-14-1c788342/cost-per-positive-score-point.svg` | Connects release ambition to investment discipline. |

## Deeper Supporting Visuals

These are better linked from hosted guides or follow-on detail pages than pushed
directly into the main narrative unless a specific section needs them.

- `reference-artifacts/analyses/conformance-economics/2026-05-14-1c788342/largest-score-deltas.svg`
- `reference-artifacts/analyses/conformance-economics/2026-05-14-1c788342/gpu-equivalent-use-by-purpose.svg`
- `reference-artifacts/analyses/conformance-economics/2026-05-14-1c788342/cpu-use-by-purpose.svg`
- `reference-artifacts/analyses/conformance-economics/2026-05-14-1c788342/gameplay-improvement-by-project-part.svg`
- hosted `conformance-dashboard.html`
- hosted `release-dashboard.html`
- hosted `project-guide.html`
- hosted `public-project-page.html`

## Open Illustration TODOs

### Release-history progression strip

- White-paper placeholder exists.
- Best candidate still needs discussion:
- `1.0.0` public game surface
- `1.2.0` Platinum framing surface
- `1.4.0` multi-game and conformance surface
- Decision question: should the strip emphasize gameplay evolution, platform
  architecture, or public release/documentation maturity?

### Ingestion in action

- White-paper placeholder exists.
- Best candidate still needs discussion:
- contact sheet only
- waveform plus contact sheet pair
- raw source clip to structured artifact pipeline graphic
- Decision question: what most clearly teaches the ingestion idea to a
  non-expert reader in one glance?

### Evidence loop case study

- White-paper placeholder exists.
- Best candidate still needs discussion:
- question -> artifact -> harness -> result graphic
- screenshot pair showing before and after measured correction
- release-note excerpt plus chart plus artifact collage
- Decision question: which single case study best shows how AI-assisted work is
  kept honest by rerunnable evidence?

### Milestone gallery

- White-paper placeholder exists.
- Best candidate still needs discussion:
- one screenshot per milestone release
- one diagram per maturity phase
- one mixed gallery of game, platform, and dashboard surfaces
- Decision question: should the gallery feel product-led, architecture-led, or
  release-led?

## Likely Next Additions

- Add one screenshot from the hosted conformance dashboard.
- Add one screenshot from the hosted release dashboard.
- Add one architectural illustration that shows ingestion, games, Platinum, and
  release lanes on a single page.
- Add one progression visual based on preserved historical release surfaces.
