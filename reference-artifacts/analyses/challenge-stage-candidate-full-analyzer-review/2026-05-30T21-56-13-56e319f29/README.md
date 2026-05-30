# Challenge Candidate Full-Analyzer Review

Generated: 2026-05-30T21:56:13.230Z
Commit: 56e319f29
Branch: codex/macbook-fullscreen-timing-alignment-wip

## Candidate

- Stage: 7
- Candidate: stage7-target-controls-shape-only-p3
- Sweep decision: candidate-ready-for-full-analyzer-review
- Sweep expected-label lift: 0.4/10
- Sweep target-video lift: 1.5/10

## Full Analyzer Trial

- Decision: rejected-full-analyzer-regression
- Current restored summary score: 4.2/10
- Trial summary score: 4.2/10
- Current restored movement score: 4.2/10
- Trial movement score: 4.1/10
- Current restored target-video object-track score: 3.7/10
- Trial target-video object-track score: 3.6/10
- Current restored Stage 7 object score: 4.7/10
- Trial Stage 7 object score: 4.6/10

## Read

Rejected stage7-target-controls-shape-only-p3: the focused sweep found a narrow shape win, but the full analyzer did not confirm a player-facing improvement. Summary movement delta -0.1, target-video object-track delta -0.1, and Stage 7 target-fit delta -0.2 are not acceptable for runtime promotion.

## Next Step

Do not promote this candidate. Extend the scorer to compare full-stage vectors or author a stronger reference-path contract before the next runtime trial.
