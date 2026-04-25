# Architect Review Response

This document responds to Architect Lueck's pre-restructure review of the
original `1.0.2` deployment-era code. The goal is to track which concerns are
already being addressed by the current platform refactor, which ones should
shape near-term work, and which ones belong to a later maturity phase.

Status labels used here:

- `Covered`
- `In Progress`
- `Later`
- `Not Now`

## 1. Key abstractions should be identified

Status:

- `Covered`

Response:

- This is now a core part of the architecture work.
- The runtime is already split into named concerns for:
  - input and shell helpers
  - replay and telemetry
  - platform services
  - leaderboard and account UI
  - player flow
  - player combat
  - enemy behavior
  - capture and rescue
  - scoring and awards
  - stage flow
  - render shell
  - board rendering
  - auth/session
  - leaderboard service
  - pack metadata
  - entity model
- The platform contract in
  `/Users/steven/Documents/Codex-Test1/ARCHITECTURE.md`
  now explicitly names:
  - `runtimeState`
  - `shellState`
  - `serviceAdapters`
  - `gamePack`

## 2. Magic constants should be stored structurally or commented clearly

Status:

- `In Progress`

Response:

- We have already started moving hardcoded values into pack-owned structures:
  - stage cadence
  - stage band profiles
  - formation layouts
  - scoring tables
  - challenge layout
  - frame accent themes
- This is visible in:
  - `/Users/steven/Documents/Codex-Test1/src/js/13-aurora-game-pack.js`
- We have not finished this work.
- Remaining magic values still exist in movement tuning, render spacing,
  animation timing, and some gameplay update paths.
- Near-term rule:
  - if a value describes stable game design or pack identity, move it into a
    pack/config structure
  - if a value is a local rendering or math detail, keep it close to code but
    comment it if the intent is not obvious

## 3. The harness may be too fragile if recordings are reused after motion changes

Status:

- `In Progress`

Response:

- This concern is valid and we have already seen examples of it.
- We now treat some older harnesses as too tied to precise run geometry.
- In response, we have been moving important guards toward:
  - state-based assertions
  - coarse behavioral envelopes
  - repeated-run averages where appropriate
- Examples:
  - hotfix movement checks now assert playable movement distance, not just
    non-zero drift
  - stage-pressure and squadron-spacing checks were adjusted away from brittle
    one-sample expectations
- The long-term direction is:
  - fewer tests that depend on exact replay paths
  - more tests that verify gameplay contracts

## 4. Tease apart systems to reduce harness flakiness and scope changes better

Status:

- `Covered`

Response:

- This is exactly what the current architecture restructure has been doing.
- We have separated gameplay, services, render, and shell concerns so tests can
  target smaller surfaces.
- That directly supports:
  - narrower regression checks
  - cleaner mocks and substitutions later
  - lower blast radius when changing one mechanic family

## 5. Use a database or specification set for enemy definitions

Status:

- `In Progress`

Response:

- We are not using a database yet, but we are moving in that direction through
  pack-owned entity construction and shared entity contracts.
- Current progress:
  - `/Users/steven/Documents/Codex-Test1/src/js/14-entity-model.js`
  - `/Users/steven/Documents/Codex-Test1/src/js/13-aurora-game-pack.js`
- The current enemy model now distinguishes:
  - core shared enemy fields
  - escort fields
  - capture/rescue fields
  - challenge-stage fields
- The next likely step is not a live database first.
- It is:
  - declarative enemy family/spec data owned by the pack
  - loaded into runtime helpers at startup
- That will give us the experimentation benefits Lueck described without
  prematurely forcing persistence infrastructure.

## 6. Fixes should be demonstrated by tests that fail first and pass after

Status:

- `Covered`

Response:

- This is now an explicit release rule for hotfixes.
- The `1.0.2` movement regression process is the concrete example:
  - we reproduced the failure on the shipped line
  - tightened the movement harness so the broken behavior failed
  - applied the fix
  - verified the test passed afterward
- We also added:
  - a hotfix smoke suite
  - a hosted-lane input probe
  - beta preflight checks for expected config

## 7. Parameterize broadly to support new enemies and future games

Status:

- `In Progress`

Response:

- This is one of the main goals of the platform work.
- We are now parameterizing:
  - stage cadence
  - formations
  - scoring
  - challenge structure
  - stage identity
  - shell/front-door content
  - audio planning
- The next important layer is:
  - enemy family specification
  - attack pattern specification
  - pack-owned front-door, quote, and audio profiles
- We are intentionally moving in this direction without pretending everything
  should become generic immediately.

## 8. Backwards compatibility and preserving older user data should be considered

Status:

- `Later`

Response:

- This is a real concern and we should not pretend we are fully handling it yet.
- Today the project mostly behaves like a single evolving live app with limited
  compatibility burden.
- We do already preserve some continuity in local/browser state through:
  - legacy local storage key fallback
  - pack-aware and lane-aware release metadata
  - version-aware score handling work
- But we do not yet have a mature compatibility policy for:
  - older replay formats
  - historical pack migrations
  - multi-version content or score schemas
- This becomes more important as soon as:
  - multiple game packs exist
  - score/history models become richer
  - curated content and audio registries become persistent

## 9. Migration work needs rollbacks, observability, and phased execution

Status:

- `Later`

Response:

- Agreed.
- This is the right concern for the future platform and service layer.
- It is not the main blocker for the current extraction phase, but it should be
  part of the next service maturity phase.
- We already have some building blocks:
  - hotfix discipline
  - beta before production
  - hosted-lane verification
  - build metadata and lane metadata
  - replay/session/system diagnostics
- What we do not yet have is a complete migration framework for:
  - score schema changes
  - replay schema changes
  - auth/profile changes
  - rollback-safe multi-step upgrades
- When platform services mature further, we should add:
  - explicit schema/version markers
  - forward/backward compatibility checks
  - migration status observability
  - rollback notes in release policy

## Practical Summary

The main review themes that are already actively addressed are:

- key abstractions
- scoped extraction
- fix-first regression tests
- broad parameterization direction

The main themes that are acknowledged but not complete yet are:

- structured removal of remaining magic constants
- declarative enemy specification data
- less fragile harness design
- compatibility and migration policy

That means Lueck's feedback remains a useful checklist, but most of it has now
been converted from vague concern into concrete ongoing architecture work.
