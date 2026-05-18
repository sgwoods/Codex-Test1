# Aurora Audio Promotion Precheck

Generated: `2026-05-15T20:24:02.432Z`

## Problem

Focused audio cue sweeps can find local candidates that look promising in isolation, then fail once placed in the full Aurora theme and event-gap scoring context.

## Strategy

Replace one cue in the latest full-theme metrics with a representative candidate capture, run the normal event-gap scorer against that synthetic theme, and block runtime promotion unless the cue and aggregate guardrails improve.

## Decision

- Cue: `rescueJoin`
- Candidate: `refclip-s2399-d180-v86`
- Status: `precheck-trial-allowed`
- Runtime trial allowed: yes
- Promote runtime from precheck alone: no
- Current cue gap: 3.19/10
- Simulated cue gap: 0.55/10
- Current worst segment: 4.74/10
- Simulated worst segment: 0.77/10

## Blockers

- None.

## Warnings

- None.

## Wins

- Full-theme cue gap improves by 2.64/10.
- Worst segment risk improves by 3.97/10.
- Theme average worst-segment risk improves by 0.19/10.

## Source Artifacts

- Candidate report: `reference-artifacts/analyses/aurora-audio-cue-candidates/latest-rescue-join.json`
- Candidate focus metrics: `reference-artifacts/analyses/aurora-audio-cue-candidates/2026-05-15-c8c7246f-dirty-audio-focus-202330/rescue-join/metrics.json`
- Theme metrics: `reference-artifacts/analyses/aurora-audio-theme-comparison/2026-05-15-main-c8c7246f-201649/metrics.json`
- Synthetic theme metrics: `reference-artifacts/analyses/aurora-audio-promotion-precheck/2026-05-15-c8c7246f-dirty-202402-rescueJoin/candidate-theme-metrics.json`
- Simulated event gap: `reference-artifacts/analyses/aurora-audio-promotion-precheck/2026-05-15-c8c7246f-dirty-202402-rescueJoin/event-gap/latest.json`

## Next Step

Try rescueJoin in the Aurora audio theme only as a measured runtime trial, then accept it only if full audio comparison, event gap, cue alignment, and quality scoring all hold or improve.
