# Aurora Release Lane Model

This document defines the purpose, stability expectation, testing rigor, and
documentation refresh rules for every Aurora / Platinum release lane.

## Current Published State

As of June 3, 2026:

- hosted `/dev`
  - `1.4.0.1+build.1006.sha.ed8d7f18`
  - commit `ed8d7f18`
- hosted `/beta`
  - `1.4.0-beta.1+build.1006.sha.ed8d7f18.beta`
  - commit `ed8d7f18`
- hosted `/production`
  - `1.4.0+build.894.sha.1dc23d8a`
  - commit `1dc23d8a`

This means:

- `/dev` and `/beta` are aligned on the current authority-machine candidate
- `/production` still represents the last stable public release family
- `main` is the forward integration branch, and the current production lane is
  intentionally behind it

## Release Authority Model

Aurora now uses a one-authority release model.

That means:

- either machine may develop and push topic branches
- `main` is the only integration branch
- only the machine recorded in `release-authority.json` may approve beta,
  promote production, or publish beta/production

## Lane Definitions

### 1. Local `localhost`

Purpose:

- active engineering lane
- place for narrow changes, diagnostics, harness work, and manual comparison

Expected stability:

- may be mixed while a branch is under active work
- should still remain commit-first and recoverable

Testing rigor:

- targeted harnesses for the change
- one nearby regression check
- manual inspection when feel or polish matters

Documentation expectation:

- important work must not live only in chat
- source docs should remain current enough for restart and handoff

### 2. Hosted `/dev`

Purpose:

- shared integration preview
- comparison surface for the next live improvement bundle

Expected stability:

- coherent enough for review
- not a scratch lane
- intentionally replaceable, but not casually

Testing rigor:

- local build and publish preflight
- targeted changed-area harnesses
- one or more boundary checks
- live verification
- manual comparison against the currently published `/dev`

Documentation expectation:

- lane metadata current
- release dashboard and notes current enough for the candidate
- scorecard refreshed for serious `/dev` replacements

### 3. Hosted `/beta`

Purpose:

- serious release-candidate lane
- stable enough for explicit review and approval

Expected stability:

- materially more stable than `/dev`
- intentionally assembled, not just "latest branch state"

Testing rigor:

- stronger gate set than `/dev`
- relevant application, boundary, and platform checks
- live verification
- refreshed scorecard and release docs
- explicit approval before production

Documentation expectation:

- release-facing docs and quality evidence must be current
- all core release/testing/reference artifacts used to justify approval must be
  committed or summarized in committed docs

### 4. Hosted `/production`

Purpose:

- official public promise
- stable public reference for gameplay, platform presentation, and docs

Expected stability:

- highest-confidence lane
- moves only from an approved hosted `/beta`

Testing rigor:

- production preflight
- live verification
- public-page sync verification

Documentation expectation:

- complete hosted release surface must be current
- for meaningful `x.y` releases, the broader docs pass is part of the release
  contract

## Current Promotion Interpretation

Current live `/dev` and `/beta` match.

`/production` does not.

So the next release question is not "how do we get beta caught up to dev?"

It is:

- when the current `ed8d7f18` candidate is strong enough for production
- whether any additional release-process guardrails should land before the next
  production promotion

## Artifact Persistence Rule

Release confidence should never depend on uncommitted core artifacts.

What must be committed:

- runtime source
- harness and release scripts
- reference profiles
- scorecards and release-facing docs
- curated reference assets or committed manifests for those assets

What may stay generated-only:

- reproducible transient outputs under `reference-artifacts/analyses/...`

But if a generated output is needed later to explain or defend a release, its
important conclusions should also be present in committed docs.

## Mirror Expectations By Lane

The public release host repo does not need to mirror every engineering artifact
for every lane.

Lane-by-lane expectation:

- local `localhost`
  - no public-repo replication
- hosted `/dev`
  - runtime plus minimal hosted docs and metadata
- hosted `/beta`
  - full candidate public package
- hosted `/production`
  - full public package and polished hosted docs

The active engineering source of truth remains:

- [sgwoods/Codex-Test1](https://github.com/sgwoods/Codex-Test1)

The public mirror remains:

- [sgwoods/Aurora-Galactica](https://github.com/sgwoods/Aurora-Galactica)

See also:

- [REPOSITORY_ROLE_MAP.md](REPOSITORY_ROLE_MAP.md)

## Current Working Rule

Near-term:

- use `main` as the integration line
- keep hosted `/dev` and `/beta` coherent when intentionally publishing the
  current candidate family
- do not move hosted `/production` until the candidate is explicitly judged
  ready
- tighten the `/dev` to `/beta` freshness guard so beta cannot quietly move
  ahead of stale hosted `/dev`
