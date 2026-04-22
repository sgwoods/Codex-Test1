# Aurora Release Lane Model

This document defines the purpose, stability expectation, testing rigor, and
documentation refresh rules for every Aurora / Platinum release lane.

It exists to keep development agile while making release movement more
professional, explicit, and repeatable.

## Current Published State

As of April 21, 2026:

- hosted `/dev`
  - `1.2.3+build.432.sha.9d7b2a8`
  - branch `main`
  - commit `9d7b2a8`
  - built `Apr 12 2026, 10:36 AM EDT`
- hosted `/beta`
  - `1.2.3-beta.1+build.388.sha.13c8421.beta`
  - branch `beta`
  - commit `13c8421`
  - built `Apr 10 2026, 8:56 AM EDT`
- hosted `/production`
  - `1.2.3+build.388.sha.13c8421`
  - branch `main`
  - commit `13c8421`
  - built `Apr 10 2026, 8:56 AM EDT`

This means:

- hosted `/dev` is ahead of hosted `/beta` and hosted `/production`
- hosted `/beta` and hosted `/production` still represent the same stable
  shipped line
- any new hosted `/dev` candidate should clearly improve on the current
  published `/dev`, not merely differ from it

## Lane Definitions

### 1. Local `localhost`

Purpose:

- active engineering lane
- place for narrow changes, fast diagnostics, harness work, and manual review

Expected stability:

- may be incomplete or mixed while a branch is under active work
- should still remain understandable, commit-first, and recoverable

Testing rigor:

- targeted harnesses for the change
- one nearby regression check
- manual inspection when feel or polish matters

Documentation expectations:

- source docs should stay current enough that work is not trapped in chat or
  memory
- no hosted-doc refresh required for ordinary local work

Promotion rule:

- local work can become a hosted `/dev` candidate only when it is:
  - intentionally scoped
  - clearly better than the current hosted `/dev`
  - backed by the smallest trusted relevant gate set

### 2. Hosted `/dev`

Purpose:

- shared integration preview
- hosted mirror of the current best local candidate
- place to judge whether a candidate is good enough to replace the current live
  dev surface

Expected stability:

- should be coherent and reviewable, not a scratchpad
- may still contain unfinished work relative to `/beta`
- should not be replaced casually

Testing rigor:

- local build and publish preflight
- targeted harness set for changed areas
- one or more boundary checks
- live verification after publish
- manual comparison against the currently published `/dev`

Documentation expectations:

- hosted lane metadata must be current:
  - `build-info.json`
  - `release-dashboard.html`
  - `release-notes.json`
- the current quality score and scorecard should be refreshed for any serious
  candidate replacement of hosted `/dev`
- source docs do not need a full release refresh for every `/dev` publish
- but any change to release framing, lane meaning, or operator workflow should
  be documented before or with the publish

Promotion rule:

- do not replace hosted `/dev` unless the candidate is demonstrably better than
  the existing hosted `/dev`
- the comparison should cover:
  - changed gameplay or shell surfaces
  - relevant harness evidence
  - release/readiness implications

### 3. Hosted `/beta`

Purpose:

- serious release-candidate lane
- stable enough for focused review, validation, and confidence-building

Expected stability:

- materially more stable than hosted `/dev`
- no knowingly loose or mixed work
- should represent an intentionally assembled candidate, not a branch snapshot

Testing rigor:

- stronger gate set than hosted `/dev`
- relevant application / platform / boundary checks
- live verification after publish
- explicit review of any release-facing deltas from the previous hosted `/beta`
- manual review of feel, presentation, and fidelity topics where automation is
  still incomplete

Documentation expectations:

- lane metadata refreshed
- release dashboard and notes refreshed
- quality score and scorecard refreshed, with the top remaining gaps called out
- if this is a meaningful `x.y` candidate or a substantial release-family
  update, complete the full documentation pass before approval

Approval rule:

- hosted `/beta` must be explicitly approved before hosted `/production`
- approval should mean:
  - the candidate is stable
  - docs and release framing are honest
  - the quality score and largest remaining gaps are explicitly recorded
  - major known issues are either fixed or explicitly accepted

### 4. Hosted `/production`

Purpose:

- official public promise
- stable public reference for gameplay, platform presentation, and docs

Expected stability:

- highest confidence lane
- should move only from an approved hosted `/beta`

Testing rigor:

- production preflight
- live verification
- final docs / release artifact confirmation
- public project page sync and verification

Documentation expectations:

- complete hosted release surface must be current
- for meaningful `x.y` releases, the full documentation set is part of the
  promotion gate
- the top-level public Aurora project page is part of the production contract

Promotion rule:

- do not publish hosted `/production` from local enthusiasm
- publish only when the candidate has already proven itself on hosted `/beta`

## Release Hygiene Rules

### Rule 1: `/dev` Must Be Intentionally Better

Because hosted `/dev` is already a public integration surface, we should not
replace it just because local branches have accumulated work.

A new `/dev` candidate should answer:

- what concrete user-facing or release-confidence improvement does it provide
  over the current hosted `/dev`?
- what risk does it retire?
- what remaining risk does it still carry?

### Rule 2: `/beta` Should Be Small And Defensible

Hosted `/beta` should not be a staging dump.

It should be:

- intentionally scoped
- demonstrably more stable than hosted `/dev`
- easy to explain in release notes and dashboard language

### Rule 3: Documentation Refresh Is Part Of The Release

Documentation refresh is required:

- always for lane metadata and hosted release surfaces
- for major `x.y` releases between hosted `/beta` and hosted `/production`
- whenever release meaning, lane meaning, or operating procedure changes in a
  way that future work depends on

### Rule 4: Diagnostics Are Not Automatically Release Content

New harnesses, diagnostics, and internal release notes are important, but they
do not automatically justify a live-lane replacement.

They should usually be treated as:

- professionalism improvements
- confidence improvements
- release enablers

Only promote them when they accompany a candidate that is also meaningfully
better as a hosted surface.

## Recommended Promotion Flow

1. define the candidate package explicitly
2. classify what is:
   - live-candidate content
   - confidence infrastructure
   - deferred work
3. validate locally with the smallest trusted relevant gate set
4. compare the candidate against the current hosted `/dev`
5. if better, publish hosted `/dev`
6. verify hosted `/dev`
7. when stable enough, promote hosted `/beta`
8. verify and approve hosted `/beta`
9. complete docs pass when required
10. promote hosted `/production`

## Current Plan Intention

Near-term goal:

- build a next hosted `/dev` candidate that is clearly better than
  `main@9d7b2a8`

Medium-term goal:

- turn that improved hosted `/dev` into a disciplined, high-confidence hosted
  `/beta`

Long-term goal:

- keep release movement professional enough that each lane has a clear purpose,
  clear quality bar, and clear documentation contract

See also:

- `/Users/steven/Documents/Codex-Test1/DEV_CANDIDATE_REVIEW_CHECKLIST.md`
