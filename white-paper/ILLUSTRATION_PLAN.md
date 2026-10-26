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
- Resolve ambiguous choices before release. Use an evidence-backed table or
  caption when a new image is not justified. Do not put editorial instructions
  in the published paper. Record optional enhancements separately.

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

## Illustration Decisions, 2026-10-25

### Release-history progression strip

- Use the three-column release progression in Section 2. The release notes
  support the milestones. Current screenshots are not historical evidence.

### Ingestion in action

- Use the existing stage-opening contact sheet as the primary example, with
  the source-to-decision table and an explicit limit on what frames can prove.
  Keep the Guardians sheet as a separate source-family example.

### Evidence loop case study

- Use the dated Stage 3 rejected-candidate case from Section 5. The compact
  decision table shows why a fit improvement did not justify reduced scoring
  opportunity. It does not claim that all fidelity work is complete.

### Milestone gallery

- Use the milestone table in Section 10 together with the Section 2 progression.
  A future gallery needs release-specific captures and provenance; it is not
  a requirement for this edition.

## Likely Next Additions

- Add one screenshot from the hosted conformance dashboard.
- Add one screenshot from the hosted release dashboard.
- Add one architectural illustration that shows ingestion, games, Platinum, and
  release lanes on a single page.
- Add one progression visual based on preserved historical release surfaces.
