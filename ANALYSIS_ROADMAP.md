# Aurora Analysis Roadmap

This roadmap answers two questions:

1. What analyses can we run now with the tools and harnesses already in the repo?
2. What analyses should we extend or build next to support the next `/beta` candidate and later Platinum sibling work?

It is intended to keep analysis work persistent, reproducible, and tied to release movement instead of leaving important evidence in chat.

## Current Principle

Analysis work should produce at least one of these durable outputs:

- a committed reference profile
- a committed harness/check script
- a committed scorecard or release-facing summary
- a committed inventory or plan doc that captures the conclusion of a generated artifact

Generated artifacts under `reference-artifacts/analyses/...` do not all need to be committed, but analysis conclusions that influence release decisions must be captured in committed docs.

## Analyses We Can Run Now With Existing Tools

### Release And Candidate Integrity

- `npm run harness:check:dev-candidate-surfaces`
  - broad shell and panel regression sweep for hosted `/dev` candidate review
- `npm run harness:score:quality-conformance`
  - rolled-up quality score across timing, movement, audio, shell, rules, and progression
- `npm run harness:check:close-shot-hit`
  - targeted shot/hit trust regression
- `npm run harness:check:persona-stage2-safety`
  - targeted safety regression around the expert-stage-2 baseline

These are the current best candidate-health analyses before `/dev` and `/beta` movement.

### Timing And Stage Flow Fidelity

- `npm run harness:check:stage1-opening-correspondence`
  - stage-1 opening timing against the reference timing library
- `npm run harness:check:stage1-opening-spacing`
  - stage-1 opening geometry and spacing
- `npm run harness:check:challenge-stage-correspondence`
  - challenge entry and result timing correspondence
- `npm run harness:check:audio-cue-alignment`
  - cue spacing and alignment around stage flow and challenge transitions

These are already suitable for release shaping and are the strongest current tools for timing fidelity work.

### Rules And System Correspondence

- `npm run harness:check:capture-rescue-correspondence`
  - capture and rescue rule/state-transition fidelity
- `npm run harness:check:persona-progression-correspondence`
  - progression and persona ordering evidence
- `npm run harness:check:player-movement-conformance`
  - current movement-conformance measurement against joystick-translation principles

These support confidence in gameplay rules and overall pacing, not just isolated interactions.

### Audio Identity And Comparison

- `node tools/harness/analyze-audio-theme-comparison.js`
  - refreshed Aurora-vs-reference clip comparison
- `npm run harness:check:audio-cue-alignment`
  - cue timing and overlap behavior
- existing analyses under:
  - `reference-artifacts/analyses/galaga-audio-overlap`
  - `reference-artifacts/analyses/galaga-audio-cue-matrix`
  - `reference-artifacts/analyses/aurora-audio-theme-comparison`

These are enough to continue audio timing and phrase-quality work without building new infrastructure first.

### Challenge, Pressure, And Later-Stage Investigations

- `tools/harness/check-challenge-layout-sequence.js`
- `tools/harness/check-challenge-motion-profile.js`
- `tools/harness/check-challenge-outcome-distribution.js`
- `tools/harness/check-stage-pressure-balance.js`
- `tools/harness/check-late-run-ship-loss-soak.js`
- existing analysis packs:
  - `reference-artifacts/analyses/stage4-fairness`
  - `reference-artifacts/analyses/release-reference-pack`

These are already useful for later-stage fairness work and beta-readiness review.

### Visual And Snapshot Comparison

- `tools/harness/compare-stage-opening-snapshot.js`
- `tools/harness/compare-fullrun-carryover-snapshot.js`
- `tools/harness/check-carry-visuals.js`
- `tools/harness/check-boss-first-hit-visual.js`
- `tools/harness/check-opening-formation-layout.js`

These are useful for geometry and visual-regression checks where timing-only evidence is not enough.

## Analyses We Should Extend Or Build Next

### 1. Movement Reference Traces

Current movement conformance is useful but still abstract. The next step is to tie it to preserved gameplay footage using trace windows for:

- tap correction
- hold travel
- reversal
- movement while firing
- post-shot follow-through

This is now the highest-value movement-analysis extension because blind constant tuning already regressed conformance twice.

### 2. Later-Stage Trace Families

We should expand beyond stage-1 and challenge timing into reusable trace families for:

- Stage 4 opening pressure
- capture-to-recovery windows
- later-stage convoy-to-dive cadence

We already have partial source material in `release-reference-pack` and `stage4-fairness`; the next step is formal reference profiles and reusable checks.

### 3. Audio Identity Beyond Timing

Timing alignment is much better now. The next audio extensions should focus on:

- phrase length and truncation policy
- motif family coverage
- cue character and sustain vs effect-only feel
- scene-level cue stacking in live gameplay windows

Much of this can reuse the existing audio comparison pipeline without inventing a separate system.

### 4. Visual Cadence Trace Extraction

We should extract a small set of visual cadence traces from preserved footage for:

- opening convoy pulses
- boss-attack windows
- challenge-group spacing and sweep

This will strengthen both movement and stage-flow work by linking timing to visible board rhythm.

### 5. Galaxian Sibling Reference Library

The `galaxian-mechanics` archive is useful, but it is still mostly planning-level. The next serious sibling-pack analysis should build:

- a Galaxian event-family timing library
- formation/layout baselines
- flagship/escort scoring and dive traces

## Recommended Analysis Order From Here

1. Build movement reference traces from preserved gameplay footage.
2. Refresh movement-conformance scoring against those traces.
3. Expand later-stage cadence traces using `release-reference-pack` and `stage4-fairness`.
4. Keep refreshing quality scorecards after each meaningful fidelity pass.
5. Use the improved scorecard and supporting evidence to decide when the forward `/dev` line is strong enough for the next serious `/beta`.

## Release Use

Use this roadmap as the current default:

- for `/dev` improvements:
  - favor analyses we can already run now
- for `/beta` shaping:
  - require both existing checks and at least one extended fidelity analysis in the weak categories
- for future Platinum sibling work:
  - start by creating a reference library and trace inventory before tuning game behavior
