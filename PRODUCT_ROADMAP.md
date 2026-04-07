# Product Roadmap

## Current Release Line

- shipped public line:
  - `1.2.0`
- release name:
  - `Platinum Release 1`

## Where We Are

The major platform milestone is now shipped.

That means the roadmap is no longer centered on "can we separate Platinum from
Aurora at all." It is centered on:

- keeping the shipped platform credible
- keeping Aurora stable as the first application on Platinum
- preparing the smallest useful second-application proof

## Near-Term Roadmap

### `1.2.1` Aurora Trust Fixes

Scope:

- dual-fighter surviving-ship correctness
- challenge-stage bonus-stage numbering
- carried/captured-fighter game-over presentation

Why this bundle:

- all are small player-visible trust fixes
- all fit naturally into a focused patch line
- none require reopening broad gameplay churn

### `1.2.x` Documentation And Platform Discipline

Scope:

- first-class hosted Platinum guide
- explicit platform versus application docs
- updated project guide, release dashboard, and readiness docs
- stronger docs gate between hosted `/beta` and hosted `/production`

Why this matters:

- the release process should not let a major platform step ship without a matching docs pass again

## Next Platform Milestone

### Second-Application Proof

Target:

- a small playable `Galaxy Guardians` slice in dev only

Minimum useful proof:

- formation rack
- dives
- flagship and escort behavior
- scoring
- single-shot constraint
- wrap-around threat
- life loss and game-over flow

This is the right next platform test because it proves the seam without forcing
an immediate second public game release.

## Longer-Term Platform Improvement Areas

- stronger pack schema and capability validation
- clearer storage and migration policy
- cleaner platform/application naming residue cleanup
- continued automation-first gating across hosted lanes and docs surfaces
