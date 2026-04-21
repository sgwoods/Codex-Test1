# Aurora And Platinum Go-Forward Execution Plan

This document turns the development principles into a concrete operating plan.

Use it when deciding:

- what to work on next
- how bugs move from report to fix
- how reference fidelity work should be structured
- how release candidates should be assembled and promoted

## Current Working Reality

We are operating in a post-release stewardship phase.

That means:

- the live `1.2.3` line should remain trustworthy
- stable `beta` / `production` artifacts are preserved and should not be
  rewritten casually
- current `main` contains forward work not yet reflected in stable beta
- recovered local work exists and should be integrated intentionally
- release gates are important, but individual harnesses may need repair before
  they can be trusted again

The project is therefore not in a "ship fast from wherever we are" mode.

It is in a "continue deliberately without losing agility" mode.

## Operating Priorities

### 1. Keep The Live Line Trustworthy

Always preserve:

- hosted `/production`
- hosted `/beta`
- checked-in local `dist/beta`
- checked-in local `dist/production`
- release metadata and approval lineage

No work should overwrite those baselines unless we are intentionally performing
a new promotion cycle.

### 2. Require Harness Thinking For Bug Fixes

Default workflow for any bug:

1. reproduce the issue
2. classify it:
   - platform
   - application
   - boundary
   - release / pipeline
3. identify the right staging harness family
4. decide whether:
   - an existing check should be updated
   - a new targeted check should be added
   - a temporary manual gate is needed before automation is practical
5. implement the fix
6. run the targeted check plus one nearby regression check
7. record any remaining automation gap explicitly

The rule is:

- no bug fix should disappear into code history without a corresponding test or
  a documented reason it is still manual

### 3. Keep Change Scope Small

Default branch and commit behavior:

- one topic per branch
- one concern per commit
- small changes over mixed bundles
- preserve reviewability for later laptop or release integration

Preferred branch families:

- `codex/safe-*`
- `codex/recovery-*`
- `codex/pre-beta-*`
- `codex/reference-*`

### 4. Use The Smallest Relevant Gate Set

For each change, choose the smallest useful gate profile that covers the risk.

Examples:

- gameplay bug:
  - targeted application harness
  - one nearby gameplay regression check
  - one boundary smoke if relevant
- platform shell change:
  - platform check
  - one pack-boot or reset smoke
- release-tooling change:
  - publish preflight
  - metadata verification
  - live-lane verification where relevant

Avoid running every check for every change unless the candidate truly warrants
that cost.

## Reference Fidelity Program

### Aurora / Galaga Track

Continue treating `Galaga` as the main fidelity reference for Aurora.

For each fidelity topic:

1. identify the source
2. capture reference artifacts
3. describe current Aurora behavior
4. define the gap
5. connect the gap to:
   - an issue
   - a harness or metric
   - a release or milestone

Preferred artifact outputs:

- timing reports
- event-family libraries
- scenario logs
- contact sheets
- captured clips
- cue matrices
- waveforms
- reference README summaries

See also:

- `/Users/steven/Documents/Codex-Test1/CORRESPONDENCE_FRAMEWORK.md`

### Second-Game / Galaxian Track

Start a parallel but staged reference program for the `Galaxian`-inspired
second game.

Initial focus:

- single-shot pressure
- wrap-around threat
- flagship / escort behavior
- formation cadence
- scoring rhythm
- audiovisual identity

The goal is not immediate implementation.

The goal is to build the same kind of durable reference base we now expect for
Aurora.

### Variation Rule

Variation is allowed when it is:

- intentional
- documented
- still true to the original arcade experience as tribute
- implemented on the game side rather than by bending the platform

Every meaningful divergence should be explainable.

## Persona And Difficulty Evidence

Treat persona evidence as part of gameplay tuning, not as optional polish.

We should maintain or expand checks that help answer:

- can novice players enter the game successfully?
- can intermediate players progress deeper by learning?
- can advanced players demonstrate that later stages are survivable with
  stronger skill?
- does difficulty rise in a meaningful curve rather than in noisy spikes?

Useful evidence sources:

- persona harnesses
- repeatability checks
- run summaries
- loss clustering
- stage metrics
- score flow
- challenge outcomes

Current active finding:

- the first persona/progression correspondence pass preserved all per-persona
  baseline guardrails but did not preserve a strict current progression ladder
- on the current `full-run-persona` seeds, `advanced` outperformed `expert`
- the clearest concrete difference in the current evidence is that `expert`
  loses two early stage-2 lives to boss-collision events, while `advanced`
  survives that early window and carries farther
- treat this as an active tuning and persona-definition investigation item
  before using current progression evidence as a clean signal of skill ordering
- that `advanced -> expert` issue has since been repaired with the expert
  stage-2 safety guardrail and targeted expert tuning
- the remaining progression issue is now `expert -> professional`
- current stage-2 throughput evidence says the gap is concentrated on shared
  seed `51101`, where `professional` stays alive but misses the highest-value
  dive conversions that `expert` turns into `1600`-point awards
- the focused `professional-stage2-dive-awards` harness now captures that
  difference directly on seed `51101` as `3600` high-value boss-dive points
  for `expert` versus `800` for `professional`
- the newer `professional-stage2-boss-window` harness shows the gap starts even
  earlier: on seed `51101`, `expert` produces `3` boss attack starts in the key
  window while `professional` produces only `1`
- the `professional-stage2-pre-boss-clear` harness narrows the cause again:
  before the boss window opens, `professional` matches `expert` on total
  pre-boss kill count and even exceeds it on pre-boss points, but fails to
  remove the one formation boss that `expert` clears for `150`
- the newer `professional-stage2-shot-window` diagnostic harness should be used
  to compare early shot cadence, bullet occupancy, and cooldown state around
  that missing formation-boss conversion on seed `51101`
- the `professional-stage2-shot-cadence` diagnostic harness should be used
  alongside it to compare pre-boss shot count, shot spacing, and the timing of
  first boss damage between `expert` and `professional`
- keep the improved `professional` decision logging in place and use that
  evidence to shape the next narrow tuning pass around high-value dive
  conversion and pre-boss sequencing rather than generic aggression or
  survivability

Manual play should still validate feel, but the evidence should make difficulty
claims explicit.

## Release-Candidate Assembly Plan

When unreleased work has diverged, assemble the next candidate intentionally.

Recommended order:

1. preserve stable beta/prod baselines
2. repair untrusted gates that block confidence
3. choose the candidate foundation:
   - forward `main`
   - or a controlled `pre-beta` branch from the stable shipped line
4. integrate changes in narrow groups
5. validate each group before moving to the next
6. only then publish hosted `/dev`
7. only after hosted `/dev` is trustworthy, consider `/beta`
8. only after approved `/beta`, consider `/production`

## Immediate Execution Sequence

### Phase 1: Validation And Candidate Hygiene

1. keep stable beta/prod artifacts untouched
2. continue repairing any untrusted harnesses that block confidence
3. manually validate recovered Aurora gameplay changes
4. decide the next candidate foundation explicitly

### Phase 2: Controlled Candidate Construction

1. create a controlled candidate branch
2. bring in recovered gameplay work in isolated commits
3. bring in harness or tooling fixes separately
4. validate after each integration step

### Phase 3: Reference Expansion

1. continue Galaga timing / audiovisual / rules analysis
2. build comparable artifact patterns for the future Galaxian-inspired game
3. keep reference outputs durable and reusable
4. build correspondence reports that compare:
   - reference vs candidate
   - shipped baseline vs candidate
   - forward line vs recovered work

### Phase 4: Release Movement

1. refresh local candidate
2. publish hosted `/dev`
3. verify hosted `/dev`
4. promote hosted `/beta`
5. verify hosted `/beta`
6. complete docs pass when required
7. approve hosted `/beta`
8. promote hosted `/production`

## Decision Rule

When unsure, prefer the option that:

- preserves the stable live line
- keeps the platform/application seam explicit
- leaves a measurable test or artifact behind
- makes later integration easier rather than harder
