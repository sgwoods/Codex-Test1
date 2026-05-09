# Aurora Audio Promotion Precheck

Generated: `2026-05-09T21:38:29.375Z`

## Problem

Focused audio cue sweeps can find local candidates that look promising in isolation, then fail once placed in the full Aurora theme and event-gap scoring context.

## Strategy

Replace one cue in the latest full-theme metrics with a representative candidate capture, run the normal event-gap scorer against that synthetic theme, and block runtime promotion unless the cue and aggregate guardrails improve.

## Decision

- Cue: `playerHit`
- Candidate: `refclip-s20-d720-v100`
- Status: `precheck-reject`
- Runtime trial allowed: no
- Promote runtime from precheck alone: no
- Current cue gap: 4.91/10
- Simulated cue gap: 0.77/10
- Current worst segment: 7.2/10
- Simulated worst segment: 3.55/10

## Blockers

- No Ship Loss Body candidate cleared whole-cue, segment, duration, band, centroid, and role-match gates.

## Wins

- Full-theme cue gap improves by 4.14/10.
- Worst segment risk improves by 3.65/10.
- Theme average worst-segment risk improves by 0.17/10.

## Source Artifacts

- Candidate report: `reference-artifacts/analyses/aurora-audio-cue-candidates/latest-player-hit-focus.json`
- Candidate focus metrics: `reference-artifacts/analyses/aurora-audio-cue-candidates/2026-05-09-1d575086-audio-focus-211059/ship-loss/metrics.json`
- Theme metrics: `reference-artifacts/analyses/aurora-audio-theme-comparison/2026-05-09-main-bbcc8df1/metrics.json`
- Synthetic theme metrics: `reference-artifacts/analyses/aurora-audio-promotion-precheck/2026-05-09-bbcc8df1-dirty-playerHit/candidate-theme-metrics.json`
- Simulated event gap: `reference-artifacts/analyses/aurora-audio-promotion-precheck/2026-05-09-bbcc8df1-dirty-playerHit/event-gap/latest.json`

## Next Step

Do not promote playerHit; use this precheck evidence to pivot toward a stronger candidate family or the current highest-risk cue (stagePulse).

