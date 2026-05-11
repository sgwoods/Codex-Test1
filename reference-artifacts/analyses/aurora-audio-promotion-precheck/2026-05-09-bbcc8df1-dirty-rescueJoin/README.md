# Aurora Audio Promotion Precheck

Generated: `2026-05-09T21:38:21.163Z`

## Problem

Focused audio cue sweeps can find local candidates that look promising in isolation, then fail once placed in the full Aurora theme and event-gap scoring context.

## Strategy

Replace one cue in the latest full-theme metrics with a representative candidate capture, run the normal event-gap scorer against that synthetic theme, and block runtime promotion unless the cue and aggregate guardrails improve.

## Decision

- Cue: `rescueJoin`
- Candidate: `refclip-s2320-d300-v95`
- Status: `precheck-trial-allowed`
- Runtime trial allowed: yes
- Promote runtime from precheck alone: no
- Current cue gap: 3.28/10
- Simulated cue gap: 2.79/10
- Current worst segment: 5.37/10
- Simulated worst segment: 4.81/10

## Blockers

- None.

## Wins

- Full-theme cue gap improves by 0.49/10.
- Worst segment risk improves by 0.56/10.

## Source Artifacts

- Candidate report: `reference-artifacts/analyses/aurora-audio-cue-candidates/latest-rescue-join.json`
- Candidate focus metrics: `reference-artifacts/analyses/aurora-audio-cue-candidates/2026-05-09-5eb9b0b1-dirty-audio-focus-205932/rescue-join/metrics.json`
- Theme metrics: `reference-artifacts/analyses/aurora-audio-theme-comparison/2026-05-09-main-bbcc8df1/metrics.json`
- Synthetic theme metrics: `reference-artifacts/analyses/aurora-audio-promotion-precheck/2026-05-09-bbcc8df1-dirty-rescueJoin/candidate-theme-metrics.json`
- Simulated event gap: `reference-artifacts/analyses/aurora-audio-promotion-precheck/2026-05-09-bbcc8df1-dirty-rescueJoin/event-gap/latest.json`

## Next Step

Try rescueJoin in the Aurora audio theme only as a measured runtime trial, then accept it only if full audio comparison, event gap, cue alignment, and quality scoring all hold or improve.

