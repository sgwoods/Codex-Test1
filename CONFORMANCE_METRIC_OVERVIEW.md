# Conformance Metric Overview

This document summarizes the current Aurora / Platinum conformance map: what is
scored numerically, what is gated as pass/fail, and where the next measurement
cycle should focus.

Last refreshed: May 2, 2026 on
`codex/macbook-pro-guardians-identity-0-1-candidate`.

## Current Aurora Score

Latest artifact:

- `reference-artifacts/analyses/quality-conformance/2026-05-02-7ef349b/`

### At A Glance

| Area | Score | Status | What It Means |
| --- | ---: | --- | --- |
| Overall Aurora quality | `8.8/10` | Strong | Public-quality baseline; still needs fidelity polish before the next serious beta claim. |
| Strongest category | `10/10` | Protected | Combat responsiveness, stage-1 geometry, and capture/rescue rules are the safest parts of the current model. |
| Weakest category | `6.1/10` | Needs work | Audio identity and cue alignment remain the biggest measurable quality gap. |
| Next visible feel gap | `8.0/10` | Needs work | Player movement is playable, but tap correction and hold travel need more reference-led tuning. |
| Guardians 0.1 preview | `6.9/10` reference conformance | Dev-preview | Local gameplay review showed the score needed to be more conservative on timing, pacing, and sprite fidelity. |

### Aurora Category Detail

| Category | Current score | Evidence posture | Read |
| --- | ---: | --- | --- |
| Overall quality | `8.8/10` | Numeric roll-up | Strong public-quality baseline, but not yet a fidelity finish line. |
| Player movement | `8.0/10` | Trace-backed harness | Still one of the main feel gaps; tap correction and hold travel need more reference-led work. |
| Shot and hit responsiveness | `10/10` | Harness-backed | Strong. Keep this protected while tuning movement and pacing. |
| Stage-1 opening timing | `8.5/10` | Reference timing harness | Healthy, but still not perfect. |
| Stage-1 opening geometry | `10/10` | Reference geometry harness | Strong. Preserve during level expansion. |
| Dive fairness and safety | `9.1/10` | Persona safety harness | Good enough for beta discussion; continue watching collision pressure. |
| Capture and rescue rules | `10/10` | Correspondence harness | Strong. Do not regress during platform/game separation work. |
| Challenge-stage timing | `8.4/10` | Correspondence harness | Needs richer challenge-stage content and timing variety in the level expansion cycle. |
| Progression and persona depth | `8.8/10` | Persona progression harness | Solid, with one remaining ordering edge case noted by the scorecard. |
| Audio identity and cue alignment | `6.1/10` | Audio comparison and correspondence artifacts | Weakest category. Cue phase gates are green again, but identity and acoustic fit remain the biggest quality gap. |
| UI, shell, graphics integrity | `9.2/10` | Dev-candidate surface suite | Strong after refreshing stale leaderboard/attract/audio phase expectations. |

### Release Read

| Rank | Opportunity | Current score | Release implication |
| ---: | --- | ---: | --- |
| 1 | Audio identity and cue alignment | `6.1/10` | Do not claim a major fidelity step until reference-derived acoustic/cue work improves. |
| 2 | Player movement conformance | `8.0/10` | Tune from measured traces; avoid blind control-constant changes. |
| 3 | Challenge-stage timing and content | `8.4/10` | Timing is decent, but content variety needs the level-expansion program. |
| 4 | Progression/persona depth | `8.8/10` | Good base; remaining edge cases should stay visible. |
| 5 | UI/shell/graphics integrity | `9.2/10` | Good enough for beta support when paired with game-fidelity gains. |

## Galaxy Guardians Preview Gates

Galaxy Guardians is still a development-preview application, not a public
playable release. It now has its own first reference conformance metric set,
separate from the Aurora `8.8/10` roll-up.

Current candidate artifact:

- `reference-artifacts/analyses/galaxy-guardians-identity/candidate-0.1.json`

Current reference metric artifact:

- `reference-artifacts/analyses/galaxy-guardians-identity/reference-conformance-0.1.json`

### Guardians Reference Score

| Metric | Score | Read |
| --- | ---: | --- |
| Reference conformance | `6.9/10` | Useful development-preview baseline, with the timing/pace/visual feel gap now scored more conservatively. |
| Reference maturity | `5.8/10` | Contact sheets, waveforms, and promoted event windows exist; frame-level extraction is still needed. |
| Implementation gate coverage | `9.0/10` | Most 0.1 runtime/visual/audio/platform gates are durable and rerunnable. |
| Public release readiness | `3.5/10` | The preview remains intentionally dev-only and should not be treated as public playable yet. |

### Guardians Reference Category Detail

| Category | Score | Status | Read |
| --- | ---: | --- | --- |
| Reference source coverage | `8.5/10` | Good | Three Galaxian sources are committed with manifests, contact sheets, and waveform windows. |
| Promoted semantic event coverage | `7.0/10` | Partial | Core runtime events are covered; attract mission text and score-advance table remain gaps. |
| Formation and rack timing | `5.8/10` | Partial | Entry, settle, rack complete, and first-dive delay are gated and calmer, but not frame-extracted. |
| Movement and pressure model | `5.2/10` | Weak | Scout, flagship, escort, and wrap pressure exist, but local play still reads approximate without measured path/timing extraction. |
| Single-shot threat and scoring | `7.0/10` | Partial | Single-shot play, enemy shots, player loss, and role scoring are game-owned. |
| Visual alien identity | `6.4/10` | Better preview, still partial | Sprites are smaller and closer to Galaxian contact-sheet proportions; not yet pixel-faithful extracted assets. |
| Audio character and reference fit | `4.5/10` | Weakest Guardians category | Runtime cue IDs are gated, but acoustic comparison against Galaxian footage is not automated. |
| Platform and game boundaries | `10.0/10` | Strong | Guardians remains dev-only and does not inherit Aurora capture/dual/challenge/scoring behavior. |
| Evidence durability | `8.5/10` | Good | Reference profile, event log, identity artifacts, and gates are source-controlled and rerunnable. |

### Guardians 0.1 Gate Detail

| Gate | Artifact / harness | Current posture |
| --- | --- | --- |
| Identity baseline | `identity-baseline-0.1.json`, `check-galaxy-guardians-identity-baseline.js` | Passes; game-owned visual/audio identity exists. |
| Formation entry | `formation-entry-0.1.json`, `check-galaxy-guardians-formation-entry.js` | Passes; rack entry, settle, and first-dive timing are explicit. |
| Movement pacing | `movement-pacing-0.1.json`, `check-galaxy-guardians-movement-pacing.js` | Passes; scout/flagship/escort pressure is measurable. |
| Threat and scoring | `threat-scoring-0.1.json`, `check-galaxy-guardians-threat-scoring.js` | Passes; single-shot and role scoring are game-owned. |
| Visual readability | `visual-readability-0.1.json`, `check-galaxy-guardians-visual-readability.js` | Passes; rows, palettes, hit flashes, and snapshots are distinct. |
| Audio character | `audio-character-0.1.json`, `check-galaxy-guardians-audio-character.js` | Passes; cue shapes, role-hit separation, and runtime cue coverage are explicit. |
| Candidate aggregate | `candidate-0.1.json`, `check-galaxy-guardians-0-1-candidate.js` | Passes; preview remains dev-only and does not inherit Aurora-only mechanics. |
| Platform boundaries | pack/adapters/renderer boundary harnesses | Passes; game behavior remains application-owned, with shared capability only through Platinum APIs. |

## Current Conformance Priorities

1. Audio identity remains the biggest Aurora gap.
- The next useful work is reference-derived acoustic and timing comparison,
  especially demo cadence, stage pulse, shots, dive cues, challenge transition,
  and game-over/loss behavior.

2. Player movement is the next most visible feel gap.
- Current score is `8.0/10`.
- The next tuning cycle should use preserved traces and direct frame-level
  reference extraction rather than blind constants.

3. Challenge-stage expansion needs to become content conformance, not just
   timing conformance.
- The current score measures timing, but future gates should also measure alien
  families, movement variety, scoring pressure, and stage-family progression.

4. Guardians 0.1 should move from internal contracts to reference-derived
   evidence.
- Current Guardians gates are useful and green, but many are still internal
  preview contracts. The next step is extracting more Galaxian reference
  timings and audio/visual windows from the provided videos.

5. Platform/game boundaries should stay mandatory.
- Any common behavior needed by both Aurora and Guardians belongs in Platinum as
  an API, interface, renderer hook, catalog, or harness capability.
- Game-specific behavior should remain owned by that game pack/runtime/adapter.

## Release Use

Before beta discussion:

- run `npm run harness:score:quality-conformance`
- run the Guardians 0.1 candidate gate if the beta includes the preview
- confirm browser-backed surface checks are green
- refresh `QUALITY_RELEASE_SCORECARD.md` if the numeric score materially changes
- keep generated conformance artifacts in `reference-artifacts/analyses/`

This MacBook may generate and push development evidence, but it must not approve
or publish beta/production unless release authority is explicitly transferred.
