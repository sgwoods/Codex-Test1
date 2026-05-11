# Aurora Audio Promotion Precheck

Generated: `2026-05-11T18:01:34.717Z`

## Problem

Focused audio cue sweeps can find local candidates that look promising in isolation, then fail once placed in the full Aurora theme and event-gap scoring context.

## Strategy

Replace one cue in the latest full-theme metrics with a representative candidate capture, run the normal event-gap scorer against that synthetic theme, and block runtime promotion unless the cue and aggregate guardrails improve.

## Decision

- Cue: `playerHit`
- Candidate: `segmented-loss-body-dip`
- Status: `precheck-reject`
- Runtime trial allowed: no
- Promote runtime from precheck alone: no
- Current cue gap: 6.19/10
- Simulated cue gap: 3.59/10
- Current worst segment: 7.37/10
- Simulated worst segment: 7.4/10

## Blockers

- No Ship Loss Body candidate cleared whole-cue, segment, duration, band, centroid, and role-match gates.

## Wins

- Full-theme cue gap improves by 2.6/10.

## Source Artifacts

- Candidate report: `reference-artifacts/analyses/aurora-audio-cue-candidates/latest-player-hit-focus.json`
- Candidate focus metrics: `reference-artifacts/analyses/aurora-audio-cue-candidates/2026-05-11-23c856ad-dirty-audio-focus-175606/ship-loss/metrics.json`
- Theme metrics: `reference-artifacts/analyses/aurora-audio-theme-comparison/2026-05-11-main-23c856ad-175746/metrics.json`
- Synthetic theme metrics: `reference-artifacts/analyses/aurora-audio-promotion-precheck/2026-05-11-23c856ad-dirty-180134-playerHit/candidate-theme-metrics.json`
- Simulated event gap: `reference-artifacts/analyses/aurora-audio-promotion-precheck/2026-05-11-23c856ad-dirty-180134-playerHit/event-gap/latest.json`

## Next Step

Do not promote playerHit; use this precheck evidence to pivot toward a stronger candidate family or the current highest-risk cue (playerHit).

