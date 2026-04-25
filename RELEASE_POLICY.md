# Release Policy

## Version Format

We use a SemVer-style public version plus build metadata.

Examples:

- local `localhost`:
  - `x.y.z+build.NNN.sha.abcdef0.dirty`
- hosted `/dev`:
  - `x.y.z+build.NNN.sha.abcdef0`
- hosted `/beta`:
  - `x.y.z-beta.1+build.NNN.sha.abcdef0.beta`
- hosted `/production`:
  - `x.y.z+build.NNN.sha.abcdef0`

These are format examples, not current live lane values.

## Meaning

- `MAJOR`
  - reserve for true product-era breaks or major repositioning
- `MINOR`
  - use for meaningful public milestones
  - example:
    - `1.2.0` = `Platinum Release 1`
  - current planning read:
    - the next serious Aurora quality/fidelity release should likely be a
      `MINOR` step such as `1.3.0`, not a new `MAJOR`
- `PATCH`
  - use for smaller compatible improvements inside the current milestone
  - examples:
    - gameplay correctness fixes
    - UI polish
    - harness hardening
    - documentation and release-discipline follow-through inside the same release family

## Hosted Release Lanes

The intended lane model is:

1. local `localhost`
2. hosted `/dev`
3. hosted `/beta`
4. hosted `/production`

Meaning:

- local `localhost`
  - active engineering lane
- hosted `/dev`
  - shared hosted integration preview
- hosted `/beta`
  - reviewed release candidate
- hosted `/production`
  - public stable promise

See also:

- `/Users/steven/Documents/Codex-Test1/RELEASE_LANE_MODEL.md`

## Release Authority Rule

Aurora now uses a one-authority release model.

That means:

- topic branches and ordinary development may happen from more than one machine
- `main` remains the only integration branch
- hosted `/beta` and hosted `/production` may only be published from the
  machine recorded in
  [release-authority.json](/Users/steven/Documents/Codex-Test1/release-authority.json)

Useful commands:

```bash
npm run release:show-authority
npm run release:claim-authority -- --machine-id <id> --label "<label>"
```

## Replacement Rule For Hosted `/dev`

Hosted `/dev` is already a published integration surface.

That means a new hosted `/dev` publish should not happen just because a branch
contains additional work.

Before replacing hosted `/dev`, we should be able to answer:

1. what is concretely better than the current published hosted `/dev`
2. what supporting gate evidence backs that claim
3. what known issues remain and why they are acceptable for `/dev`

This is the core professionalism rule for the next release phase.

## Current Promotion Reality

As of April 25, 2026:

- hosted `/dev` remains the older integration lane at `1.2.3+build.470.sha.e4732eb`
- hosted `/beta` is live at `1.2.3-beta.1+build.489.sha.f6ba6c2.beta`
- hosted `/production` is live at `1.2.3+build.489.sha.f6ba6c2`

That means:

- the current shipped beta and production families are aligned
- the next release cycle should work from `main`
- hosted `/dev` can move again during the next polish cycle when there is a
  coherent improvement bundle worth sharing

## Major `x.y` Documentation Gate

For every meaningful `x.y` release, the gate between hosted `/beta` and hosted
`/production` should include a complete documentation refresh.

That refresh should cover at least:

- `release-notes.json`
- `release-dashboard.json`
- `QUALITY_RELEASE_SCORECARD.md`
- `README.md`
- `PLAN.md`
- `PRODUCT_ROADMAP.md`
- `ARCHITECTURE.md`
- `PLATINUM.md`
- `APPLICATIONS_ON_PLATINUM.md`
- `TESTING_AND_RELEASE_GATES.md`
- `RELEASE_READINESS_REVIEW.md`
- hosted `project-guide.html`
- hosted `platinum-guide.html`
- hosted `player-guide.html`

This should be treated as a real release artifact pass, not optional cleanup.

## Core Artifact Commit Rule

We should assume that any core artifact used to produce, validate, explain, or
approve a release must be committed at some stage of the process.

Core artifacts include:

- source code used in the lane being published
- release scripts and harness scripts
- reference profiles and correspondence check definitions
- scorecards, release notes, dashboards, and readiness docs
- curated reference inputs that the project depends on for tuning or review

Generated artifacts do not all need to live in git, but they must not be
ephemeral in practice.

Rule:

- the definitions, inputs, and documentation for a release must be committed
- generated outputs may stay uncommitted only when they are reproducible from
  committed code and committed reference inputs
- if a generated artifact is being relied on as a durable release record, it
  should itself be committed or copied into a committed summary document

This is the rule that keeps release knowledge out of chat-only or machine-only
 state.

## Promotion Workflow

1. build the local `localhost` candidate
2. verify local `localhost` gates
3. refresh the quality score and scorecard for the candidate
4. publish hosted `/dev` for integrated hosted review
5. promote hosted `/beta`
6. verify hosted `/beta`
7. complete any required docs pass for the release line
8. confirm or hand off release authority intentionally
9. approve hosted `/beta`
10. promote and publish hosted `/production`

## Hosted `/dev` History Rule

By default, we should move hosted `/dev` forward in place rather than maintain a
separate public archive lane for every `/dev` build.

We already preserve `/dev` history through:

- git commits and branches
- build metadata
- release notes and dashboards
- the quality scorecard
- committed docs explaining why a new `/dev` replaced the prior one

Create a dedicated `/dev` archive only when:

- a milestone build needs to stay publicly inspectable
- a comparison build is needed for a major tuning effort
- a recovery or incident review needs a preserved hosted snapshot

Otherwise, move `/dev` forward and keep the record in git and committed release
artifacts.

## Policy Intention

The goal is not to create ceremony for its own sake.

The goal is to make sure:

- automation catches what it can
- hosted lanes are explicit
- docs and release surfaces stay aligned with the product we actually ship
- the quality score becomes part of release notes, not just a local experiment
