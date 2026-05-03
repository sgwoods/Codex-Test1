# Conformance Metrics Overview

Generated: `2026-05-03T13:08:07.772Z`

This document summarizes the current conformance scoring model for both the shipped Aurora application and the Galaxy Guardians 0.1 development preview. Aurora uses the release-quality scorecard; Guardians uses a reference-conformance preview metric set that is intentionally more conservative because its Galaxian evidence is still being promoted from source footage into frame-level measurements.

## Overall Comparison

| Game / scope | Primary score | Secondary scores | Status | Weakest current area | Evidence |
| --- | --- | --- | --- | --- | --- |
| Aurora Galactica current dev line | 8.8/10 | strongest Shot and hit responsiveness 10/10; weakest Audio identity and cue alignment 6.1/10 | release-quality conformance score | Audio identity and cue alignment (6.1/10) | reference-artifacts/analyses/quality-conformance/2026-05-03-5f92eab/report.json |
| Galaxy Guardians 0.1 dev preview | 6.9/10 | maturity 5.8/10; gate coverage 9/10; public readiness 3.5/10 | dev-preview-reference-conformance-model-not-public-release-score | Audio character and reference fit | reference-artifacts/analyses/galaxy-guardians-identity/reference-conformance-0.1.json |

## Galaxy Guardians 0.1 Preview Metrics

| Metric | Weight | Score | Evidence level | Current read | Remaining gap |
| --- | --- | --- | --- | --- | --- |
| Reference source coverage | 8 | 8.5/10 | source-manifested-contact-sheets-waveforms | Three Galaxian sources are committed with manifests, contact sheets, and waveform windows. | Promote more windows into frame-level timing measurements. |
| Promoted semantic event coverage | 14 | 7/10 | promoted-event-log-plus-runtime-events | The preview covers the core runtime promoted events: formation entry, rack complete, dives, flagship/escort pressure, single-shot fire, shot resolution, and wrap/return. | Attract mission text and score-advance-table behavior are not yet first-class playable-preview systems. |
| Formation and rack timing | 12 | 5.8/10 | promoted-events-with-runtime-bands | Formation entry, settle, rack complete, and first-dive delay are modeled and gated, with the quick peek adjusted to a tighter and calmer rack. | Timing is still not derived from direct frame-level Galaxian extraction, so the score remains conservative. |
| Movement and pressure model | 14 | 5.2/10 | reference-window-inspired-runtime-contract | Scout dives, flagship dives, escort joins, and wrap/return pressure are implemented and gated, and this pass slowed the first pressure cycle. | Local play still reads as approximate; dive curves, lower-field traversal, and wave-to-wave pacing need direct measurement from the source videos. |
| Single-shot threat and scoring | 12 | 7/10 | game-owned-runtime-and-score-contract | Single-shot firing, enemy shots, role-specific score values, player loss, and game-over behavior are implemented without Aurora capture/dual-fighter semantics. | The Galaxian score table and level progression scoring are not yet fully modeled. |
| Visual alien identity | 10 | 6.4/10 | game-owned-visual-catalog-and-readability-gate | Flagship, escort, scout, and player interceptor visuals are smaller and closer to Galaxian contact-sheet proportions while remaining distinct and gated. | Sprites are still hand-authored preview approximations rather than extracted pixel-faithful reference assets. |
| Audio character and reference fit | 10 | 4.5/10 | internal-cue-shape-contract | Runtime cue IDs and role-separated cue shapes are gated. | This is the least reference-faithful Guardians area: acoustic comparison against Galaxian footage is not yet automated. |
| Platform and game boundaries | 10 | 10/10 | pack-adapter-renderer-boundary-gates | The preview remains dev-only, does not inherit Aurora capture/dual/challenge/scoring mechanics, and uses Platinum only through shared capability boundaries. | Keep this mandatory as Guardians gets more real gameplay. |
| Evidence durability | 10 | 8.5/10 | source-controlled-artifacts-and-harnesses | The reference profile, event log, identity artifacts, and 0.1 gates are committed and rerunnable. | Add a generated Guardians numeric score artifact per run once the metrics are less manually calibrated. |

## Aurora Galactica Current Metrics

| Metric | Score | Evidence | Current read |
| --- | --- | --- | --- |
| Player movement conformance | 8.1/10 | player-movement report | Current movement scored 8.1/10 against the control-principles profile, versus 10/10 for the shipped local baseline. |
| Shot and hit responsiveness | 10/10 | close-shot-hit, movement fire window | Close-shot responsiveness passed, and movement-fire post-shot travel was 79.68, with shot delay 3ms. |
| Stage-1 opening timing fidelity | 8.5/10 | stage1-opening-first-dive report | 4/4 metrics were within tolerance; worst current delta was 0.18. |
| Stage-1 opening geometry fidelity | 10/10 | stage1-opening-spacing report | Geometry held steady with 0 changed targets and max drift 0. |
| Dive fairness and safety | 9.1/10 | persona-stage2-safety | Shared stage-2 safety seeds passed, which keeps the early dive/collision windows within the intended persona guardrail. |
| Capture and rescue rule fidelity | 10/10 | capture-rescue correspondence | 3/3 capture scenarios matched, with worst tracked-time drift 0.004. |
| Challenge-stage timing fidelity | 8.4/10 | challenge-stage correspondence | 5/5 challenge timing metrics were within tolerance; worst current delta was 0.483. |
| Progression and persona depth | 8.8/10 | persona-progression correspondence | 20/20 persona checks passed; progression ordering is still missing one ordering edge case. |
| Audio identity and cue alignment | 6.1/10 | audio-cue-alignment correspondence, aurora-audio-theme-comparison, galaga-audio-overlap | Audio score blends cue identity with measured cue timing. The dedicated cue-alignment report passed 9/9 metrics, with worst current delta 6.317. |
| UI, shell, and graphics integrity | 9.2/10 | dev candidate surface suite | The bundled front-door, panel, dock, graphics, attract, leaderboard, and audio shell surface suite passed. |

## Guardians Scoring Decision

Guardians preview scoring should exist locally now, and it does: the dev runtime awards points by alien role, formation/dive state, and flagship escort count, with a harnessed contract in `npm run harness:check:galaxy-guardians-threat-scoring`. Persisted leaderboard submission should wait until the Galaxian score-advance table, wave progression, and public-release scoring policy are closer to reference conformance.

## Current Guardians Promotion Priorities

- automated frame-level rack-entry timing from matt-hawkins-arcade-intro
- automated dive-path extraction from arcades-lounge-level-5 and nenriki-15-wave-session
- Galaxian score-advance-table implementation and scoring conformance
- Guardians attract mission-language conformance
- acoustic cue comparison against waveform windows

