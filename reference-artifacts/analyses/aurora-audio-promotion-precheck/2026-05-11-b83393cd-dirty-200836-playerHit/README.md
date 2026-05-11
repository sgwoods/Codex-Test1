# Aurora Audio Promotion Precheck

Generated: `2026-05-11T20:08:36.559Z`

## Problem

Focused audio cue sweeps can find local candidates that look promising in isolation, then fail once placed in the full Aurora theme and event-gap scoring context.

## Strategy

Replace one cue in the latest full-theme metrics with a representative candidate capture, run the normal event-gap scorer against that synthetic theme, and block runtime promotion unless the cue and aggregate guardrails improve.

## Decision

- Cue: `playerHit`
- Candidate: `curated-segment-tail-lift`
- Status: `precheck-trial-allowed`
- Runtime trial allowed: yes
- Promote runtime from precheck alone: no
- Current cue gap: 6.19/10
- Simulated cue gap: 3.54/10
- Current worst segment: 7.37/10
- Simulated worst segment: 7.43/10

## Blockers

- None.

## Warnings

- Worst segment risk worsens by 0.06/10, inside calibrated trial tolerance 0.12/10 after a 2.65/10 cue-gap win.

## Wins

- Full-theme cue gap improves by 2.65/10.

## Source Artifacts

- Candidate report: `reference-artifacts/analyses/aurora-audio-cue-candidates/latest-player-hit-focus.json`
- Candidate focus metrics: `reference-artifacts/analyses/aurora-audio-cue-candidates/2026-05-11-b83393cd-dirty-audio-focus-200625/ship-loss/metrics.json`
- Theme metrics: `reference-artifacts/analyses/aurora-audio-theme-comparison/2026-05-11-main-23c856ad-175746/metrics.json`
- Synthetic theme metrics: `reference-artifacts/analyses/aurora-audio-promotion-precheck/2026-05-11-b83393cd-dirty-200836-playerHit/candidate-theme-metrics.json`
- Simulated event gap: `reference-artifacts/analyses/aurora-audio-promotion-precheck/2026-05-11-b83393cd-dirty-200836-playerHit/event-gap/latest.json`

## Next Step

Try playerHit in the Aurora audio theme only as a measured runtime trial, then accept it only if full audio comparison, event gap, cue alignment, and quality scoring all hold or improve.
