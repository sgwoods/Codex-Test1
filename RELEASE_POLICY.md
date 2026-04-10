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

## Major `x.y` Documentation Gate

For every meaningful `x.y` release, the gate between hosted `/beta` and hosted
`/production` should include a complete documentation refresh.

That refresh should cover at least:

- `release-notes.json`
- `release-dashboard.json`
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

## Promotion Workflow

1. build the local `localhost` candidate
2. verify local `localhost` gates
3. publish hosted `/dev` for integrated hosted review
4. promote hosted `/beta`
5. verify hosted `/beta`
6. complete any required docs pass for the release line
7. approve hosted `/beta`
8. promote and publish hosted `/production`

## Policy Intention

The goal is not to create ceremony for its own sake.

The goal is to make sure:

- automation catches what it can
- hosted lanes are explicit
- docs and release surfaces stay aligned with the product we actually ship
