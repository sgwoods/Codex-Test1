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

Repository roles:

- source of truth for engineering, issues, and planning:
  - [sgwoods/Codex-Test1](https://github.com/sgwoods/Codex-Test1)
- public release host and GitHub Pages deployment:
  - [sgwoods/Aurora-Galactica](https://github.com/sgwoods/Aurora-Galactica)

See also:

- [REPOSITORY_ROLE_MAP.md](REPOSITORY_ROLE_MAP.md)

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

- [RELEASE_LANE_MODEL.md](RELEASE_LANE_MODEL.md)

## Release Authority Rule

Aurora now uses a one-authority release model.

That means:

- topic branches and ordinary development may happen from more than one machine
- `main` remains the only integration branch
- hosted `/beta` and hosted `/production` may only be published from the
  machine recorded in
  [release-authority.json](release-authority.json)

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

## Replication Policy Between Repos

Aurora uses selective replication between:

- source repo:
  - [sgwoods/Codex-Test1](https://github.com/sgwoods/Codex-Test1)
- public release host:
  - [sgwoods/Aurora-Galactica](https://github.com/sgwoods/Aurora-Galactica)

This is intentional. We should not mirror the full engineering repo into the
release host on every publish.

Working model:

- `Codex-Test1`
  - factory
  - contains full engineering context
- `Aurora-Galactica`
  - showroom
  - contains the public release package

### What Must Stay In `Codex-Test1`

- active source code history
- issues
- planning and roadmap docs
- harnesses and experimental tooling
- internal analyses unless they are part of the public release story
- machine bootstrap, release authority, and engineering workflow internals

### What Should Replicate To `Aurora-Galactica`

- production-ready built code and assets
- hosted documentation for the live lane being published
- release notes, dashboard, and build metadata
- public-facing guides
- enough mirrored context that the release host makes sense as a public repo

### Replication Levels

1. `dev mirror`
   - hosted runtime
   - minimal hosted docs
   - build metadata
   - enough release context to explain the lane
2. `beta mirror`
   - full candidate runtime
   - release docs
   - release dashboard
   - public guides
   - candidate metadata
3. `production mirror`
   - full public package
   - polished hosted docs
   - stable release metadata
   - public release-facing context

Rule:

- no replication is needed for ordinary local or topic-branch work
- selective replication is appropriate for hosted `/dev`
- full public-package replication is expected for hosted `/beta` and hosted
  `/production`

## Current Promotion Reality

As of April 26, 2026:

- hosted `/dev` is live at `1.2.3+build.532.sha.b959491`
- hosted `/beta` is live at `1.2.3-beta.1+build.532.sha.b959491.beta`
- hosted `/production` is live at `1.2.3+build.532.sha.b959491`

That means:

- the current shipped dev, beta, and production families are aligned
- the next release cycle should work from `main`
- the next release cycle should let the lanes diverge again only when there is
  a coherent improvement bundle worth sharing

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
