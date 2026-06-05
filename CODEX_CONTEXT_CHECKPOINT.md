# Codex Context Checkpoint

Generated: 2026-06-04 18:40:56 EDT
Label: aurora-runtime-state-isolation-guard

This is the durable recovery point for Aurora / Platinum runtime-boundary work
on this MacBook.

## Current Repo State

- Repo path: `/Users/sgwoods/Development/Codex/Codex-test1`
- Branch: `codex/aurora-runtime-state-adapter-boundary`
- Latest completed commit before this checkpoint update: `62fb16099 Route Aurora gameplay through adapter runtime state`
- Release lanes were not published from this work.

## Objective

Refactor Aurora Galactica toward the Galaxy Guardians runtime pattern and add
enough harness coverage to trust future parallel/persona/conformance runs:

- Aurora runtime state is created through `createAuroraRuntimeState(opts)`.
- Aurora gameplay ticks through `stepAuroraRuntime(state, dt, input)`.
- Platinum calls Aurora through the registered Gameplay Adapter boundary.
- Multi-instance state separation is guarded by a browser-backed harness.

## Completed In This Pass

- Added `tools/harness/check-aurora-runtime-state-isolation.js`.
- Added package scripts:
  - `harness:check:aurora-runtime-state-isolation`
  - `harness:check:game-picker-shell`
- Added harness-only `__galagaHarness__.checkAuroraRuntimeStateIsolation()`.
  This keeps internal runtime calls testable without widening production globals.
- The new isolation harness:
  - creates two Aurora runtime states
  - verifies factory-level nested objects and arrays are not aliased
  - starts both states
  - mutates bullets/effects/scores independently
  - steps state A and state B independently
  - verifies the adapter owns and updates an active Aurora runtime state
- The harness found a real state alias:
  - `S.profile` was assigned the shared `stageBandProfile(...)` object during `spawnStage`.
- Fixed the leak by cloning the stage-band profile into each runtime state:
  - `S.profile = Object.assign({}, stageBandProfile(...))`

## Verification Run

Passed:

- `npm run build`
- `npm run harness:check:aurora-runtime-state-isolation`
- `npm run harness:check:gameplay-adapter-boundaries`
- `npm run harness:check:game-picker-shell`
- `npm run harness:check:platinum-pack-boot`
- `npm run harness:check:player-two-mode`
- `npm run harness:check:challenge-tour-watch-mode`

## Current State Of The Refactor

The adapter boundary is now coherent, and the first multi-instance isolation
guard is in place. The new guard verifies that the most important runtime
containers are distinct across two active Aurora states:

- player object
- enemies
- player bullets
- enemy bullets
- effects
- stars
- challenge metadata
- score stats
- stage-band profile

This is still a staged migration:

- Rendering and UI continue to use the active global `S` compatibility alias.
- `setActiveAuroraRuntimeState(state)` intentionally points that alias at the
  adapter-owned state for current rendering and harness compatibility.
- The next architecture pass should reduce remaining non-render global `S`
  reads and decide how far rendering should move toward explicit snapshots.

## Recommended Next Steps

1. Commit and push the isolation harness and profile-clone fix.
2. Add a second isolation harness for replay/headless-style stepping if we need
   stronger proof before broad persona simulations.
3. Continue removing non-render global `S` reads from gameplay helpers outside
   the immediate tick path.
4. Return to the user-visible quality roadmap:
   - first five challenging stages
   - challenge-stage movement grammar
   - persona challenge-tour evaluation
   - before/after video evidence windows
5. Use the new isolation harness as a required guard whenever we add long-cycle
   conformance automation that creates multiple Aurora runtime states.

## Exact Restart Prompt

```text
You are continuing Aurora Galactica / Platinum runtime-boundary work from a durable Codex checkpoint.

Repo path:
/Users/sgwoods/Development/Codex/Codex-test1

Start by running:
git switch codex/aurora-runtime-state-adapter-boundary
git status --short --branch
git log -5 --oneline --decorate
npm run machine:status

Read first:
- CODEX_CONTEXT_CHECKPOINT.md
- RESTART_FROM_HERE.md
- RELEASE_POLICY.md
- PLATFORM_APP_SEPARATION_ARCHITECTURE_REVIEW_2026-06-03.md

Current checkpoint:
- label: aurora-runtime-state-isolation-guard
- generated: 2026-06-04 18:40:56 EDT
- branch: codex/aurora-runtime-state-adapter-boundary

Continue from the verified adapter-boundary and runtime-isolation guard work. Do not publish release lanes unless explicitly requested and release authority/publish checks permit it.
```
