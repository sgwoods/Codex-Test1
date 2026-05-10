# Aurora Audio Promotion Precheck

Generated: `2026-05-10T14:00:15.872Z`

## Problem

Focused audio cue sweeps can find local candidates that look promising in isolation, then fail once placed in the full Aurora theme and event-gap scoring context.

## Strategy

Replace one cue in the latest full-theme metrics with a representative candidate capture, run the normal event-gap scorer against that synthetic theme, and block runtime promotion unless the cue and aggregate guardrails improve.

## Decision

- Cue: `stagePulse`
- Candidate: `refclip-s540-d360-v105`
- Status: `precheck-reject`
- Runtime trial allowed: no
- Promote runtime from precheck alone: no
- Current cue gap: 5.24/10
- Simulated cue gap: 0.71/10
- Current worst segment: 7.25/10
- Simulated worst segment: 2.48/10

## Blockers

- No Formation Pulse candidate cleared whole-cue, segment, duration, band, centroid, and role-match gates.

## Wins

- Full-theme cue gap improves by 4.53/10.
- Worst segment risk improves by 4.77/10.
- Theme average worst-segment risk improves by 0.22/10.

## Source Artifacts

- Candidate report: `reference-artifacts/analyses/aurora-audio-cue-candidates/latest-formation-pulse.json`
- Candidate focus metrics: `reference-artifacts/analyses/aurora-audio-cue-candidates/2026-05-10-8c3e3571-dirty-audio-focus-134957/formation-pulse/metrics.json`
- Theme metrics: `reference-artifacts/analyses/aurora-audio-theme-comparison/2026-05-10-main-d5dfeffe-132842/metrics.json`
- Synthetic theme metrics: `reference-artifacts/analyses/aurora-audio-promotion-precheck/2026-05-10-8c3e3571-dirty-140015-stagePulse/candidate-theme-metrics.json`
- Simulated event gap: `reference-artifacts/analyses/aurora-audio-promotion-precheck/2026-05-10-8c3e3571-dirty-140015-stagePulse/event-gap/latest.json`

## Next Step

Do not promote stagePulse; use this precheck evidence to pivot toward a stronger candidate family or the current highest-risk cue (stagePulse).
