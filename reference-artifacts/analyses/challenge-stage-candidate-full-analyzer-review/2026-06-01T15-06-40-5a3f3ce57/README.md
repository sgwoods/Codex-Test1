# Challenge Candidate Full-Analyzer Review

Generated: 2026-06-01T15:06:40.506Z
Commit: 5a3f3ce57
Branch: codex/macbook-challenge-stage-gameplay-spectacle

## Candidate

- Stage: 3
- Candidate: stage3-target-balanced-b75-p1
- Sweep decision: candidate-ready-for-full-analyzer-review
- Sweep expected-label lift: 0.2/10
- Sweep target-video lift: 0.7/10

## Full Analyzer Trial

- Decision: reject-full-analyzer
- Current restored summary score: 4.4/10
- Trial summary score: 4.4/10
- Current restored movement score: 4.3/10
- Trial movement score: 4.3/10
- Current restored target-video object-track score: 2.6/10
- Trial target-video object-track score: 2.7/10
- Current restored Stage 3 object score: 4.8/10
- Trial Stage 3 object score: 4.9/10

## Read

Rejected stage3-target-balanced-b75-p1: the focused sweep found a narrow shape win, but the full analyzer did not confirm a player-facing improvement. Summary movement delta 0, target-video object-track delta 0.1, and Stage 3 target-fit delta 0 are not acceptable for runtime promotion.

## Next Step

Do not promote this candidate. Extend the scorer to compare full-stage vectors or author a stronger reference-path contract before the next runtime trial.
