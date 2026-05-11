# Aurora Audio Promotion Precheck

Generated: `2026-05-10T13:09:31.819Z`

## Problem

Focused audio cue sweeps can find local candidates that look promising in isolation, then fail once placed in the full Aurora theme and event-gap scoring context.

## Strategy

Replace one cue in the latest full-theme metrics with a representative candidate capture, run the normal event-gap scorer against that synthetic theme, and block runtime promotion unless the cue and aggregate guardrails improve.

## Decision

- Cue: `stagePulse`
- Candidate: `cadence-phase-muted-square-body`
- Status: `precheck-reject`
- Runtime trial allowed: no
- Promote runtime from precheck alone: no
- Current cue gap: 5.18/10
- Simulated cue gap: 4.28/10
- Current worst segment: 7.04/10
- Simulated worst segment: 7.25/10

## Blockers

- No Formation Pulse candidate cleared whole-cue, segment, duration, band, centroid, and role-match gates.
- Worst segment risk worsens by 0.21/10.

## Wins

- Full-theme cue gap improves by 0.9/10.

## Source Artifacts

- Candidate report: `reference-artifacts/analyses/aurora-audio-cue-candidates/latest-formation-pulse.json`
- Candidate focus metrics: `reference-artifacts/analyses/aurora-audio-cue-candidates/2026-05-10-41f7caa8-dirty-audio-focus-130118/formation-pulse/metrics.json`
- Theme metrics: `reference-artifacts/analyses/aurora-audio-theme-comparison/2026-05-10-main-41f7caa8-130410/metrics.json`
- Synthetic theme metrics: `reference-artifacts/analyses/aurora-audio-promotion-precheck/2026-05-10-41f7caa8-dirty-130931-stagePulse/candidate-theme-metrics.json`
- Simulated event gap: `reference-artifacts/analyses/aurora-audio-promotion-precheck/2026-05-10-41f7caa8-dirty-130931-stagePulse/event-gap/latest.json`

## Next Step

Do not promote stagePulse; use this precheck evidence to pivot toward a stronger candidate family or the current highest-risk cue (stagePulse).

