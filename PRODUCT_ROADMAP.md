# Product Roadmap

## Current Release Line

- shipped public line:
  - `1.2.3`
- release name:
  - `Aurora score-surface polish patch`

Current beta candidate:

- `1.2.3-beta.1+build.484.sha.baa1726.beta`

## Where We Are

The first major platform milestone is now shipped.

That means the roadmap is no longer centered on "can we separate Platinum from
Aurora at all." It is centered on:

- keeping the shipped platform credible
- keeping Aurora stable as the first application on Platinum
- preparing the smallest useful second-application proof
- promoting the current materially improved beta to production

## Near-Term Roadmap

### Current Production Promotion

Scope:

- approve the current hosted beta candidate
- promote it to hosted production from the approved artifact set
- verify the public release surfaces and synced docs

Why this bundle:

- production is materially stale relative to beta
- the current beta already carries the latest timing, movement, audio, and
  release-discipline work
- this closes the current release cycle cleanly before the next minor cycle

### `1.3.0` Aurora And Platinum Minor

Scope:

- further audio identity polish
- serious player-ship movement refinement against real Galaga footage
- continued Platinum/Aurora boundary cleanup
- richer reference-video ingestion and event-log extraction
- stronger persona annotation and eventual player-versus-persona scaffolding

Why this bundle:

- it keeps the next public step focused on measurable fidelity and platform
  maturity rather than a rushed second-game launch
- ship movement is still one of the clearest places where Aurora can feel less
  authentic than the arcade reference when lateral motion reads as too jerky or
  too fast

### Historical `1.2.1` Aurora Trust Fixes

Scope:

- dual-fighter surviving-ship correctness
- challenge-stage bonus-stage numbering
- carried/captured-fighter game-over presentation

Why this bundle:

- all are small player-visible trust fixes
- all fit naturally into a focused patch line
- none require reopening broad gameplay churn

### Historical `1.2.x` Documentation And Platform Discipline

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
- same-control compliance across multiple shipped games
- persona-opponent support and simulation-trained persona experimentation
