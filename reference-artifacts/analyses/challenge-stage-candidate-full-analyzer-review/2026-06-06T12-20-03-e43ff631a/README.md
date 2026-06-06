# Challenge Candidate Full-Analyzer Review

Generated: 2026-06-06T12:20:03.324Z
Commit: e43ff631a
Branch: codex/aurora-challenge-movement-grammar

## Candidate

- Stage: 7
- Candidate: stage7-deconflict-wide-softbias-flat-sync
- Sweep decision: no-runtime-keeper-yet
- Sweep expected-label lift: 0/10
- Sweep target-video lift: 0.6/10

## Full Analyzer Trial

- Decision: rejected-full-analyzer-regression
- Current restored summary score: 4.3/10
- Trial summary score: 4.3/10
- Current restored movement score: 4.4/10
- Trial movement score: 4.4/10
- Current restored target-video object-track score: 3.6/10
- Trial target-video object-track score: 3.5/10
- Current restored Stage 7 object score: 4.8/10
- Trial Stage 7 object score: 4.8/10

## Read

Rejected stage7-deconflict-wide-softbias-flat-sync: the focused sweep found a narrow shape win, but the full analyzer did not confirm a player-facing improvement. Summary movement delta 0, target-video object-track delta -0.1, and Stage 7 target-fit delta 0.3 are not acceptable for runtime promotion.

## Next Step

Do not promote this candidate. Extend the scorer to compare full-stage vectors or author a stronger reference-path contract before the next runtime trial.
