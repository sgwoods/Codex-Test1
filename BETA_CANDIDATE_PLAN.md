# Beta Candidate Plan

## Current State

The old `1.2.3` beta candidate has already been promoted and shipped, and the
`1.3.0` production family is now the stable public baseline.

Verified May 11, 2026 from the maintained source docs and local conformance
artifacts:

- hosted `/dev` carries the `1.3.0.1` hosted-dev review increment
- hosted `/beta` and hosted `/production` preserve the shipped `1.3.0` family
- local development is preparing the release-note/docs/readiness handoff for a
  possible beta request
- `main` remains the authoritative integration line for the deliberate `1.4.0`
  arcade-depth pickup

This document now records:

- what the current beta posture should be
- what the next hosted-dev increment should prove before beta is considered
- what the next beta family should be about

## What The Shipped `1.3.0` Family Proved

The shipped family established that Aurora / Platinum can carry:

- a stable Platinum-hosted Aurora production release
- a first public Galaxy Guardians second-cabinet preview
- layered platform/application version identity
- release dashboards, project guides, public project page sync, and
  conformance scorecards as normal release evidence
- production-safe settings defaults and developer-surface restrictions
- a disciplined beta-to-production release path with release authority controls

## Current Quality Position

Current local conformance read:

- overall score:
  - `9.2/10`
- strongest categories:
  - player movement conformance
  - shot/hit responsiveness
  - stage-1 geometry fidelity
  - capture/rescue rule fidelity
- weakest bundled category:
  - audio identity and cue alignment at `7.3/10`
- current audio process strength:
  - cue-contract readiness `9.09/10`
  - semantic event score `9.78/10`
  - acoustic event score `6.31/10`
  - highest current audio gap: `playerHit` tail after the calibrated
    ship-loss cue promotion

## What The Next Beta Should Be About

The next hosted `/beta` should not be a process-only or documentation-only
refresh.

Recommendation:

- do not mirror hosted `/dev` to hosted `/beta` automatically
- finish the coherent hosted `/dev` review package on `1.3.0.1`
- request beta if the candidate's user-visible lift and updated docs are
  accepted, and only from the release-authority machine

The next serious beta family should most likely belong to:

- `1.4.0` Arcade Depth

## Expected `1.4.0` Beta Themes

### Audio and event feedback

- move audio from `7.3/10` toward `7.5+`
- keep semantic score high while improving acoustic fit
- promote no runtime cue without focused gates, promotion precheck, live
  recapture, cue alignment, and quality-score guardrails
- use the latest ship-loss evidence: calibrated browser-reference gates and
  layered cue windows can promote a keeper, but residual tail/body fit still
  needs direct attention before audio can stop being the weakest category

### Level arc and challenge-stage depth

- improve stage-to-stage novelty and long-run non-repetition
- add richer alien entry and challenge-stage variation
- make later-stage reward and pressure windows feel authored, not repetitive

### Visual and cabinet read

- improve gameplay-scale visual reference grounding
- keep start/attract, scoring, help, popups, and cabinet frame consistent with
  arcade expectations

### Gameplay trust

- boss/capture/carry edge correctness
- replay-flow polish
- runtime-hardening follow-through

### Platform and release maturity

- cleaner Platinum/application seams
- stronger release and environment separation
- current dashboard, economics, and public project documentation visible in the
  lane

## Required Gate Set For The Next Beta Family

- `npm run build`
- targeted gameplay and platform harnesses for changed areas
- `npm run harness:score:quality-conformance`
- `npm run harness:analyze:conformance-economics`
- `npm run harness:build:release-conformance-dashboard`
- `npm run harness:build:dev-conformance-dashboard`
- refreshed committed scorecard
- refreshed public project page and project guide artifacts
- live beta verification
- current docs and release surfaces
- explicit beta approval before any production move
- release authority confirmed on the publishing machine before `publish:beta`

## Decision Rule

Do not refresh hosted `/beta` again until the next candidate can honestly
claim:

- it is more than a documentation-only or tooling-only change
- it is meaningfully better than the current shipped `1.3.0` family
- its weakest remaining gaps are understood and documented
- release authority permits the beta action on the machine performing it
