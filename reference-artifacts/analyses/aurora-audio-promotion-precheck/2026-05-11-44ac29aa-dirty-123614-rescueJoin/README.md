# Aurora Audio Promotion Precheck

Generated: `2026-05-11T12:36:14.845Z`

## Problem

Focused audio cue sweeps can find local candidates that look promising in isolation, then fail once placed in the full Aurora theme and event-gap scoring context.

## Strategy

Replace one cue in the latest full-theme metrics with a representative candidate capture, run the normal event-gap scorer against that synthetic theme, and block runtime promotion unless the cue and aggregate guardrails improve.

## Decision

- Cue: `rescueJoin`
- Candidate: `refclip-s2399-d300-v105`
- Status: `precheck-reject`
- Runtime trial allowed: no
- Promote runtime from precheck alone: no
- Current cue gap: 3.27/10
- Simulated cue gap: 3.6/10
- Current worst segment: 4.69/10
- Simulated worst segment: 5.38/10

## Blockers

- Full-theme cue gap worsens by 0.33/10.
- Worst segment risk worsens by 0.69/10.

## Wins

- None measured.

## Source Artifacts

- Candidate report: `reference-artifacts/analyses/aurora-audio-cue-candidates/latest-rescue-join.json`
- Candidate focus metrics: `reference-artifacts/analyses/aurora-audio-cue-candidates/2026-05-11-44ac29aa-dirty-audio-focus-121239/rescue-join/metrics.json`
- Theme metrics: `reference-artifacts/analyses/aurora-audio-theme-comparison/2026-05-11-main-44ac29aa-021631/metrics.json`
- Synthetic theme metrics: `reference-artifacts/analyses/aurora-audio-promotion-precheck/2026-05-11-44ac29aa-dirty-123614-rescueJoin/candidate-theme-metrics.json`
- Simulated event gap: `reference-artifacts/analyses/aurora-audio-promotion-precheck/2026-05-11-44ac29aa-dirty-123614-rescueJoin/event-gap/latest.json`

## Next Step

Do not promote rescueJoin; use this precheck evidence to pivot toward a stronger candidate family or the current highest-risk cue (stagePulse).
