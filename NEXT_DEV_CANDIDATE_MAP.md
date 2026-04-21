# Next Hosted Dev Candidate Map

This document inventories the work currently available on
`codex/document-project-principles` relative to the current published hosted
`/dev` lane at commit `9d7b2a8`.

The purpose is to decide what should actually go into the next serious hosted
`/dev` candidate and what should remain as supporting infrastructure or deferred
work.

## Baselines

Current hosted `/dev`:

- commit `9d7b2a8`
- label `1.2.3+build.432.sha.9d7b2a8`
- published April 12, 2026

Stable hosted `/beta` and hosted `/production`:

- commit `13c8421`
- published April 10, 2026

Current working branch:

- `codex/document-project-principles`

## Inventory Since Hosted `/dev`

### Bucket A: Release And Workflow Professionalization

These items improve discipline, recovery safety, and machine portability.
They are important, but they do not by themselves justify replacing hosted
`/dev`.

Included work:

- recovery-safe workflow docs
- release-state mapping
- development principles
- correspondence framework
- developer machine baseline
- go-forward execution plan
- release lane model

Representative commits:

- `b7b3616` document recovery-safe local-support workflow
- `d3b9657` document Aurora release-state map
- `3e23932` document Aurora development principles
- `344b2cb` add Aurora go-forward execution plan
- `998817a` document Aurora correspondence framework
- `4dec5ca` add persona progression correspondence and machine baseline

Recommendation:

- keep this work on the branch
- preserve it as release-enabling infrastructure
- do not treat it as the reason to replace hosted `/dev`

### Bucket B: Confidence And Test Infrastructure

These items make future releases more trustworthy and diagnosable.
They are strong reasons to improve our candidate process, but they are still
mostly internal unless paired with meaningful hosted-surface improvements.

Included work:

- deterministic `close-shot-hit` repair
- progression reporting improvements
- stage-1 timing and spacing correspondence
- capture/rescue correspondence
- challenge-stage correspondence
- persona progression correspondence
- expert and professional focused stage-2 harnesses
- shot-window and shot-cadence diagnostics

Representative commits:

- `e7b8486` make close-shot harness playback deterministic
- `1c09788` add stage1 correspondence check
- `7081c7a` add stage1 opening spacing correspondence check
- `07d629a` add capture/rescue correspondence check
- `0b55be8` add challenge-stage correspondence check
- `c59cd0b` make persona progression checks incremental
- `a2bbef4` add expert stage-2 safety guardrail
- `cca29d9` add professional stage-2 safety harness
- `19c119f` add professional stage-2 throughput harness
- `fc61fbf` add professional dive-awards harness
- `12434af` add professional boss-window harness
- `42977e2` add professional pre-boss-clear harness
- `37287e4` add professional shot-window diagnostic harness
- `57a2543` add professional shot-cadence diagnostic harness

Recommendation:

- keep these as required support for professionalized release movement
- include them in the next hosted `/dev` branch history
- but describe them as confidence improvements, not as user-facing release
  content

### Bucket C: Candidate Gameplay And Runtime Changes

These are the changes most likely to matter when deciding whether the next
hosted `/dev` is genuinely better than the current live `/dev`.

Included work:

- recovered combat changes in `src/js/05-player-combat.js`
- recovered hitbox tuning in `src/js/21-render-board.js`
- expert stage-2 safety and related `src/js/05-player-flow.js` refinement
- any other runtime-visible behavior changes that survive the current branch

Representative commits:

- `efc7a44` recover local combat and hitbox tuning changes
- `a2bbef4` add expert stage-2 safety guardrail

Current view:

- these are the most plausible core of a next hosted `/dev` improvement set
- they should be validated manually against the current hosted `/dev`
- they should also be backed by the relevant targeted harnesses

Recommendation:

- treat Bucket C as the real hosted-surface candidate package
- if Bucket C does not provide a compelling improvement over live hosted `/dev`,
  do not replace hosted `/dev` yet

### Bucket D: Known Marginal Or Deferred Work

These items are understood well enough to defer intentionally.

Included work:

- the remaining `expert -> professional` persona gap on seed `51101`

Current view:

- real but narrow
- not broad enough to block all release movement
- should not consume more time unless it begins to affect visible gameplay
  quality or release confidence materially

Recommendation:

- defer
- keep the diagnostics
- do not make this the reason to hold the entire release path hostage

## What Should Justify The Next Hosted `/dev`

The next hosted `/dev` should be justified by:

1. a clearly better hosted-surface candidate package from Bucket C
2. confidence support from Bucket B
3. release/process support from Bucket A

It should not be justified by:

- docs alone
- diagnostics alone
- marginal persona tuning alone

## Proposed Acceptance Questions For Replacing Hosted `/dev`

Before replacing hosted `/dev`, answer:

1. What hosted-surface behavior is better than `9d7b2a8`?
2. What targeted harness evidence supports that claim?
3. What regressions have been checked nearby?
4. What known issues remain, and are they acceptable for `/dev`?
5. Is the candidate strong enough that we would want to continue shaping it
   toward hosted `/beta` rather than immediately backing away from it?

## Minimal Trusted Gate Set For A Next Hosted `/dev`

For the current candidate direction, the minimum trusted gate set should likely
include:

- local build
- relevant gameplay harnesses for the actual runtime changes
- one boundary smoke
- manual comparison against current hosted `/dev`
- live verify after publish

If the candidate includes release-surface changes:

- metadata verification
- release dashboard / notes verification

## Next Decision

The next real decision is:

- define the smallest Bucket C package that is truly better than current hosted
  `/dev`

Only after that should we publish a new hosted `/dev` and begin the path toward
the next stable hosted `/beta`.
