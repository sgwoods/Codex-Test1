# Codex Context Checkpoint

Generated: 2026-06-04 14:54:03 EDT
Label: aurora-runtime-state-adapter-boundary-wip

This is the durable recovery point for pausing local Aurora / Platinum work on
this MacBook. Treat this as a WIP checkpoint, not as a merge-ready refactor.

## Current Repo State

- Repo path: `/Users/sgwoods/Development/Codex/Codex-test1`
- Branch: `codex/aurora-runtime-state-adapter-boundary`
- Base HEAD before WIP edits: `b7e485eaa Add public overview slides to white-paper release path`
- Release authority: MacBook M4 has been used for engineering work, but do not publish dev/beta/prod unless current release authority checks permit it.
- Main/release lanes should be considered unaffected by this WIP branch.

## Active Objective

Refactor Aurora Galactica toward the Galaxy Guardians runtime pattern:

- Create isolated Aurora runtime state through `createAuroraRuntimeState(opts)`.
- Convert Aurora gameplay ticking toward `stepAuroraRuntime(state, dt, input)`.
- Expand the Aurora gameplay adapter so Platinum calls the adapter boundary.
- Remove the engine-core fallback that directly calls Aurora gameplay from the global `update(dt)`.

The final goal is structural isolation: Aurora should eventually be able to run
many independent runtime instances without race conditions caused by the global
`S` object.

## Completed In This WIP

- Added `createAuroraRuntimeState(opts)` in `src/js/00-boot.js`.
- Replaced the direct `const S = { ... }` initializer with:
  - `let S = createAuroraRuntimeState();`
  - `let AURORA_ACTIVE_RUNTIME_STATE = S;`
  - `setActiveAuroraRuntimeState(state)`
  - `currentAuroraRuntimeState()`
  - `isAuroraRuntimeState(value)`
- Exported the new runtime-state helpers on `window`.
- Updated these helpers to accept/pass explicit state where practical:
  - `shotCap(state)`
  - `recTime(state)`
  - `advanceGameplayClock(dt, state)`
  - `snapshot(state)`
- Began state-parameter conversion in:
  - `src/js/02-replay-telemetry.js`
  - `src/js/05-player-combat.js`
  - `src/js/05-player-flow.js`
  - `src/js/06-enemy-behavior.js`
  - `src/js/07-capture-rescue.js`
  - `src/js/08-score-awards.js`
  - `src/js/09-stage-flow.js`
- Added compatibility overloads to several helpers so old harness calls can still work during the migration.

## Known WIP Risks

This branch is intentionally incomplete.

- `src/js/10-gameplay.js` has not yet been refactored.
- `stepAuroraRuntime(state, dt, input)` has not yet been created.
- The bottom-level global `update(dt)` still needs to remove the hardcoded Aurora fallback.
- `src/js/13-gameplay-adapter-registry.js` still needs an Aurora adapter with active runtime state, `update(dt)`, and `snapshot()`.
- Some patched call sites now call `ex(S, ...)` and `bossDamageFx(S, ...)`, but `src/js/10-gameplay.js` still has the old `ex(x, y, ...)` and `bossDamageFx(x, y)` signatures. Build/runtime may fail until those are updated.
- `src/js/05-player-flow.js` still needs explicit state conversion for:
  - `runHarnessPlayer`
  - `runAttractPlayer`
  - `updatePlayerControl`
- The branch has not been build-tested after the partial refactor.
- The global `S` compatibility alias still exists and is still used by render/UI/harness surfaces. That is deliberate for this first pass, but it is not yet the full isolation target.

## Recommended Resume Steps

1. Confirm branch and worktree:
   - `git switch codex/aurora-runtime-state-adapter-boundary`
   - `git status --short --branch`
2. Inspect the interrupted state:
   - `git show --stat HEAD`
   - `git diff -- src/js/00-boot.js src/js/10-gameplay.js src/js/13-gameplay-adapter-registry.js`
3. Patch `src/js/10-gameplay.js`:
   - Add compatibility overloads for `ex(state, x, y, ...)` and `bossDamageFx(state, x, y)`.
   - Introduce `stepAuroraRuntime(state, dt, input = {})`.
   - Make `updateAuroraGameplay(dt)` a compatibility wrapper only if still needed.
   - Ensure all tick-loop calls pass the explicit runtime state.
4. Patch `src/js/05-player-flow.js`:
   - Convert `runHarnessPlayer(state, dt, p, cfg)`.
   - Convert `runAttractPlayer(state, dt, p)`.
   - Convert `updatePlayerControl(state, dt, p)`.
5. Patch `src/js/13-gameplay-adapter-registry.js`:
   - Give `AURORA_GAMEPLAY_ADAPTER` an active state.
   - Add `update(dt, input)` calling `stepAuroraRuntime`.
   - Add `snapshot()`.
6. Enforce the Platinum seam:
   - Remove the hardcoded `return updateAuroraGameplay(dt);` fallback from global `update(dt)`.
   - Make the engine call only the current adapter/dev-preview adapter when playable.
7. Search for missed legacy calls:
   - `rg -n "ex\\(|bossDamageFx\\(|updatePlayerBullets\\(|updateEnemyBullets\\(|updateEnemyBodyCollisions\\(|updateReleasedCapture\\(|finalizeChallengeClear\\(|updatePlayerControl\\(|updateEnemy\\(|updateChallengeEnemy\\(|runStage1Script\\(|fireEnemyBullet\\(|logEnemyAttackStart\\(" src/js`
8. Run verification after the structural pass:
   - `npm run build`
   - `npm run harness:check:game-picker-shell`
   - `npm run harness:check:platinum-pack-boot`
   - `npm run harness:check:sprite-render-mode-guard`
   - `npm run harness:check:player-two-mode`
   - `npm run harness:check:challenge-tour-watch-mode`
   - `npm run harness:score:quality-conformance`
9. If the branch becomes coherent, commit a non-WIP refactor commit.
10. Do not publish dev/beta/prod from this branch unless explicitly requested and release authority permits it.

## Current Dirty Files At Pause

```text
M src/js/00-boot.js
M src/js/02-replay-telemetry.js
M src/js/05-player-combat.js
M src/js/05-player-flow.js
M src/js/06-enemy-behavior.js
M src/js/07-capture-rescue.js
M src/js/08-score-awards.js
M src/js/09-stage-flow.js
M CODEX_CONTEXT_CHECKPOINT.md
```

## Exact Restart Prompt

```text
You are continuing paused Aurora Galactica / Platinum work from a durable Codex checkpoint.

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
- label: aurora-runtime-state-adapter-boundary-wip
- generated: 2026-06-04 14:54:03 EDT
- branch: codex/aurora-runtime-state-adapter-boundary
- base commit before WIP edits: b7e485eaa Add public overview slides to white-paper release path

Continue the active objective: finish the Aurora runtime-state adapter-boundary refactor. This is a WIP partial refactor and should not be treated as build-clean until the listed resume steps and verification commands pass.
```
