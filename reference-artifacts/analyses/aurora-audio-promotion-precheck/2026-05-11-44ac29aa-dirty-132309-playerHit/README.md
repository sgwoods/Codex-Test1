# Aurora Audio Promotion Precheck

Generated: `2026-05-11T13:23:09.463Z`

## Problem

Focused audio cue sweeps can find local candidates that look promising in isolation, then fail once placed in the full Aurora theme and event-gap scoring context.

## Strategy

Replace one cue in the latest full-theme metrics with a representative candidate capture, run the normal event-gap scorer against that synthetic theme, and block runtime promotion unless the cue and aggregate guardrails improve.

## Decision

- Cue: `playerHit`
- Candidate: `promoted-active-window`
- Status: `precheck-trial-allowed`
- Runtime trial allowed: yes
- Promote runtime from precheck alone: no
- Current cue gap: 7.31/10
- Simulated cue gap: 0.74/10
- Current worst segment: 7.97/10
- Simulated worst segment: 2.2/10

## Blockers

- None.

## Wins

- Full-theme cue gap improves by 6.57/10.
- Worst segment risk improves by 5.77/10.
- Theme average worst-segment risk improves by 0.27/10.

## Source Artifacts

- Candidate report: `reference-artifacts/analyses/aurora-audio-cue-candidates/latest-player-hit-focus.json`
- Candidate focus metrics: `reference-artifacts/analyses/aurora-audio-cue-candidates/2026-05-11-44ac29aa-dirty-audio-focus-131800/ship-loss/metrics.json`
- Theme metrics: `reference-artifacts/analyses/aurora-audio-theme-comparison/2026-05-11-main-44ac29aa-123708/metrics.json`
- Synthetic theme metrics: `reference-artifacts/analyses/aurora-audio-promotion-precheck/2026-05-11-44ac29aa-dirty-132309-playerHit/candidate-theme-metrics.json`
- Simulated event gap: `reference-artifacts/analyses/aurora-audio-promotion-precheck/2026-05-11-44ac29aa-dirty-132309-playerHit/event-gap/latest.json`

## Next Step

Try playerHit in the Aurora audio theme only as a measured runtime trial, then accept it only if full audio comparison, event gap, cue alignment, and quality scoring all hold or improve.
