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
| Ingestion strategy | `reference-artifacts/diagrams/white-paper/source-to-metric-pipeline.svg` | Explains the source -> window -> contract -> runtime -> score -> release path without requiring private-source context. |
| Challenge-stage case study | `reference-artifacts/analyses/challenge-path-visuals/latest.svg` | Makes the challenge-stage blocker visible as route readability and object-path evidence rather than a mood. |
| Harnessing and conformance | `reference-artifacts/analyses/conformance-economics/2026-06-07-41688d988/score-trends.svg` | Turns progress into an at-a-glance measurable story. |
| Harnessing and conformance | `reference-artifacts/analyses/persona-performance-distribution/performance-lines.svg` | Shows that quality is evaluated across viewpoints, not through one metric alone. |
| Release and economics | `reference-artifacts/analyses/conformance-economics/2026-06-07-41688d988/compute-minutes-by-resource.svg` | Makes local-first measurement strategy visible. |
| Release and economics | `reference-artifacts/analyses/conformance-economics/2026-06-07-41688d988/cost-per-positive-score-point.svg` | Connects release ambition to investment discipline. |
| Working loop | `reference-artifacts/diagrams/white-paper/evidence-keeper-loop.svg` | Teaches how candidates become keepers, blockers, or documented deferrals. |
| Working loop | `reference-artifacts/analyses/reference-execution-source-attempts/stage3-challenge1/latest-source-attempt-contact-sheet.svg` | Provides a concrete before/after proof object from the June 9 Stage 3 source-attempt loop. |
| Historical evolution | `reference-artifacts/diagrams/white-paper/release-progression-gallery.svg` | Gives the reader a compact visual memory of the 1.0.0 -> 1.2.0 -> 1.4.0+ narrative arc. |

## Deeper Supporting Visuals

These are better linked from hosted guides or follow-on detail pages than pushed
directly into the main narrative unless a specific section needs them.

- `reference-artifacts/analyses/conformance-economics/2026-06-07-41688d988/largest-score-deltas.svg`
- `reference-artifacts/analyses/conformance-economics/2026-06-07-41688d988/gpu-equivalent-use-by-purpose.svg`
- `reference-artifacts/analyses/conformance-economics/2026-06-07-41688d988/cpu-use-by-purpose.svg`
- `reference-artifacts/analyses/conformance-economics/2026-06-07-41688d988/gameplay-improvement-by-project-part.svg`
- hosted `conformance-dashboard.html`
- hosted `release-dashboard.html`
- hosted `project-guide.html`
- hosted `public-project-page.html`

## First-Pass Decisions

The June 9 first pass resolves the previous broad TODOs this way:

- Release-history progression: use a first-party architectural progression
  gallery rather than screenshots, because it explains the strategic shift
  without depending on old generated surfaces.
- Ingestion in action: use a compact source-to-metric pipeline diagram in the
  main paper and reserve concrete proof sheets for case-study moments.
- Evidence loop case study: use the Stage 3 source-attempt contact sheet because
  it is current, private-boundary use is approved for this material, and it
  demonstrates before/after proof with guardrail context.
- Milestone gallery: fold it into the historical evolution section rather than
  adding a separate image wall.

## Remaining Illustration Questions

- Should the Stage 3 contact sheet stay in the main paper after the next hosted
  `/dev` review, or should it move to a linked project-guide section once the
  method is familiar?
- Would a release-dashboard screenshot teach lane discipline better than the
  current release-lane copy and progression diagram?
- Should Galaxy Guardians get one concrete proof image in the main paper once
  its v1 slice has a stronger runtime-facing artifact?

## Likely Next Additions

- Consider one screenshot from the hosted conformance dashboard after the next
  meaningful runtime change, if the dashboard itself is the clearest proof.
- Consider one screenshot from the hosted release dashboard if the lane
  discipline section needs a stronger visual anchor.
- Add a Guardians-specific proof image only after the v1 slice has an artifact
  that is more instructive than the current pack-card diagram.
