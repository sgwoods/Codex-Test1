# Release Policy

## Version Format

- We use Semantic Versioning across three release surfaces while the game is still evolving toward a stable arcade-quality release.
- Pre-production development format:
  - `MAJOR.MINOR.PATCH-prerelease`
- Production format:
  - `MAJOR.MINOR.PATCH`
- Production beta format:
  - `MAJOR.MINOR.PATCH-beta.<number>`
- Current build label format adds build metadata to the surface version:
  - `surface-version+build.<number>.sha.<shortcommit>`
- Dirty local builds append:
  - `.dirty`
- After `1.0.0`, production hotfixes should bump `PATCH`:
  - `1.0.1`
  - `1.0.2`
  - and so on
- After `1.0.0`, any production promotion that changes shipped user-visible
  behavior should bump `PATCH`, even if the change is a small hotfix.
- Use `MINOR` for meaningful public platform milestones even when the core
  Aurora gameplay contract intentionally stays close to the previous shipped
  baseline. The Platinum platform launch is the reference case:
  - `1.2.0` = `Platinum Release 1`
- Build metadata still changes on every publish, but build metadata alone is
  not the public hotfix number.

Examples:

- local `localhost`:
  - `1.2.0+build.363.sha.67c60e2.dirty`
- hosted `/dev`:
  - `1.2.0+build.363.sha.67c60e2`
- hosted `/beta`:
  - `1.2.0-beta.1+build.363.sha.67c60e2.beta`
- hosted `/production`:
  - `1.2.0+build.363.sha.67c60e2`

## Meaning

- `MAJOR`
  - reserve `1.x` for a public-quality release where the scoped product goal is
    stable and shippable
  - current scoped goal:
    - a polished four-stage slice (Stages `1`-`4`) rather than full long-form
      Galaga expansion
- `MINOR`
  - use for meaningful product milestones
  - examples:
    - Platinum platform release milestones
    - large systems additions
    - new stage/content breadth milestones
    - public lane or platform hosting expansions
- `PATCH`
  - use for smaller compatible improvements inside the current milestone
  - examples:
    - bug fixes
    - tuning passes
    - UI polish
    - harness/reporting improvements
- `prerelease`
  - `alpha`: active system building, rules changes, frequent balance changes
  - `beta`: feature-complete enough for broader testing, still tuning quality and regressions
  - `rc`: release candidate, only bug fixes and polish before a stable cut

## Hosted Release Lanes

- `localhost`
  - local engineering and debugging lane
  - typically served from:
    - `http://127.0.0.1:8000/`
- `dev`
  - manually published integration preview at:
    - `https://sgwoods.github.io/Aurora-Galactica/dev/`
  - this is the hosted mirror of the current local `localhost` candidate once
    it is stable enough to share
- `production`
  - published at:
    - `https://sgwoods.github.io/Aurora-Galactica/`
  - this is the official shared build
- `beta`
  - manually promoted at:
    - `https://sgwoods.github.io/Aurora-Galactica/beta/`
  - this is a distinct public checkpoint lane for less-frequent milestone playtesting
- `pre-production source`
  - day-to-day development happens in:
    - `https://github.com/sgwoods/Codex-Test1`

## Repository Roles

- `Codex-Test1`
  - development repo
  - active day-to-day engineering, tuning, issues, and harness work
- `Aurora-Galactica`
  - public release repo
  - promoted checkpoints intended for broader sharing and less frequent change

## Beta Promotion Workflow

1. Update source content in `Codex-Test1`:
   - gameplay/UI under `src/`
   - maintained docs and release metadata under the repo root
2. Build the current dev artifacts:
   - `npm run build`
3. Test the generated dev build in:
   - `/Users/stevenwoods/Documents/Codex-Test1/dist/dev/`
   - recommended local service startup:
     - `npm run local:resume`
4. Optionally publish the current local candidate into hosted `/dev`:
   - `npm run publish:dev`
5. Promote the current dev build into the beta lane:
   - `npm run promote:beta`
6. Review the generated output in:
   - `/Users/stevenwoods/Documents/Codex-Test1/dist/dev/`
   - `/Users/stevenwoods/Documents/Codex-Test1/dist/beta/`
7. Run the beta preflight:
   - `npm run publish:check:beta`
8. Publish the promoted beta snapshot with:
   - `npm run publish:beta`
9. Let GitHub Pages deploy from `Aurora-Galactica` so:
   - `https://sgwoods.github.io/Aurora-Galactica/beta/`
     serves the promoted checkpoint

The beta lane is intentionally a snapshot of selected generated artifacts under `dist/`, not a separate branch or a second build pipeline. `Codex-Test1` remains the engineering source of truth; `Aurora-Galactica` is the public release surface for both production and beta.

## Score/Data Lane Policy

- `production`
  - full online Supabase path
  - shared leaderboard reads enabled
  - score submission enabled
  - pilot account/auth/profile actions enabled
- `beta`
  - production-score read-only mirror by default
  - score submission disabled
  - pilot account/auth/profile writes disabled
  - local device scores still save normally
- `localhost` and hosted `/dev`
  - production-score read-only mirror by default
  - score submission disabled
  - pilot account/auth/profile writes disabled
  - local device scores still save normally

This is the current launch-safe answer to `#76`: non-production lanes no longer use the same default write path as production, even though they can still mirror production leaderboard reads.

Optional test-pilot override for non-production:

- `TEST_ACCOUNT_EMAIL`
  - enables one specific beta/dev pilot account for auth and write-flow testing
- `TEST_ACCOUNT_USER_ID`
  - excludes that pilot's scores from shared leaderboard reads
- when configured:
  - beta/dev may authenticate only that test pilot
  - score submission is enabled only while that pilot is signed in
  - production continues to reject that pilot account for normal use

## Production Publish Workflow

1. Treat production as a promotion from an approved beta candidate, not as a direct publish from arbitrary dev output.
2. Build and validate the current dev output:
   - `npm run build`
   - plus whatever harness/manual checks are appropriate for the release
3. Promote and review the beta candidate first:
   - `npm run publish:beta`
4. Once that beta candidate is explicitly approved, mark that exact beta snapshot as approved:
   - `npm run approve:beta`
5. Only then promote the matching release into the stable production artifact:
   - `npm run publish:production`
5. Let GitHub Pages deploy from `Aurora-Galactica` so:
   - `https://sgwoods.github.io/Aurora-Galactica/`
     serves the promoted production build

## Hotfix Process

A hotfix is a small, controlled production repair. It is not a fast path around
the release process.

Goals:

- fix the live issue without widening scope
- preserve evidence before mutating data
- add a regression when the failure can recur
- validate the exact fix in beta before promoting production

Required process:

1. Freeze scope to the specific production failure:
   - do not combine unrelated cleanup, refactor, or opportunistic polish
2. Preserve evidence first:
   - screenshots
   - user-visible symptoms
   - timestamps
   - score/account identifiers if relevant
   - production data inspection before mutation
3. Assess blast radius:
   - gameplay
   - auth
   - leaderboard/data integrity
   - replay/media
   - release tooling
4. Patch source in `Codex-Test1` first:
   - never treat direct production editing as the real fix
5. Add or update a focused regression:
   - especially for score submit, auth, replay, and game-over flows
6. Verify locally:
   - `npm run build`
   - focused harness checks
   - adjacent sanity checks for nearby behavior
   - when the hotfix touches an external runtime dependency, run a live probe of
     that dependency before beta if the probe is available
   - when the hotfix touches obvious gameplay input or motion, run the hotfix smoke suite:
     - `npm run harness:check:hotfix-smoke`
   - when the hotfix affects controls, overlays, or input lifecycles, run a hosted-lane input probe:
     - `npm run harness:check:live-input:beta`
7. Publish to beta first:
   - `npm run publish:beta`
8. Manually verify the exact failure in hosted beta
9. If the hotfix changes behavior that can remain stale in an already-open tab,
   provide an in-app refresh reminder:
   - tell the player that a new fix is available
   - tell them how to refresh
   - prefer a direct refresh action when the UI allows it
10. Approve beta and only then publish production:
   - `npm run approve:beta`
   - `npm run publish:production`
11. Verify the original user flow in production after release
12. Record the fix, regression coverage, and any production data correction

Production data rule:

- If a stopgap production data correction is required, inspect first and mutate
  minimally.
- Record exactly what changed.
- Still ship the real source fix through the normal hotfix path.

Aurora hotfix checklist:

```bash
npm run build
# run focused harness checks
npm run harness:check:hotfix-smoke
# if controls/input/overlay behavior changed
npm run harness:check:live-input:beta
# run external dependency probes when the hotfix touches them
npm run publish:beta
# manual hosted beta verification
npm run approve:beta
npm run publish:production
```

Hotfix smoke suite contents:

- `node tools/harness/check-input-mapping.js`
  - verifies playable left/right movement distance, expected key mapping, and no repeated input resets during active movement
- `node tools/harness/check-popup-surfaces.js`
  - verifies settings/help/pilot/score/feedback surfaces still open and fit correctly after UI-adjacent hotfixes
- `node tools/harness/check-feedback-submit-path.js`
  - verifies direct feedback success and fallback diagnostics are still intact
- `node tools/harness/check-remote-score-submit.js`
  - verifies leaderboard submission still works online and still degrades cleanly to local-only on failure

### True 1.0 Launch Baseline Reset

- `#130` is a required pre-`1.0` release operation.
- Before the true `1.0` production launch, reset the shared production
  leaderboard so the official public scoreboard starts from zero.
- Use a dry run first:
  - `SUPABASE_SERVICE_ROLE_KEY=... npm run leaderboard:inspect:production`
- Then execute the reset when the launch candidate is approved:
  - `SUPABASE_SERVICE_ROLE_KEY=... npm run leaderboard:reset:production`
- This operation deletes rows from the production `scores` table.
- It does not delete pilot accounts.
- It requires operator-only Supabase service-role access and should be treated
  as an explicit release step, not a routine browser-side admin action.

Tracked hardening item:

- `#113`
  - enforce localhost -> hosted `/dev` -> hosted `/beta` -> approve -> hosted `/production` as the only supported publish chain
  - production preflight fails if the current production publish is not sourced from the approved beta candidate

## Public Project Status Sync Workflow

1. Build the current dev output and promote the stable production artifact:
   - `npm run build`
   - `npm run promote:production`
2. Run:
   - `npm run sync:public`
3. This updates the separate `sgwoods/public` project-summary pages and manifests from:
   - `/Users/stevenwoods/Documents/Codex-Test1/dist/production/build-info.json`
   - `/Users/stevenwoods/Documents/Codex-Test1/release-notes.json`
4. It does not publish the playable game itself.

## Build Number

- Every build gets a build number, even when there is no major/minor release bump.
- Local default:
  - git commit count
- CI/Pages default:
  - GitHub Actions run number if available

This gives every build a unique identity without forcing a SemVer bump for every commit.

## Bump Guidance

- After `1.0.0`, use this production rule:
  - every user-visible production fix or improvement gets the next `PATCH`
    version
  - examples:
    - `1.0.1`
    - `1.0.2`
    - `1.0.3`
  - do not keep shipping visible production changes forever under the same
    public version with only `+build...` changing

- Bump `PATCH` when:
  - we make a contained improvement that should be visible or testable
  - the user-facing build is worth distinguishing from the last one
- Bump `MINOR` when:
  - a milestone is completed or clearly crossed
  - the overall player experience has materially advanced
  - the roadmap target shifts from one product phase to the next
- Bump prerelease indicator when:
  - we move from `alpha` to `beta`
  - or from `beta` to `rc`
- Bump `MAJOR` only when:
  - we intentionally declare a stable release baseline

## Recommendation Policy For Codex

- Recommend a `PATCH` bump after:
  - a player-visible gameplay/presentation improvement lands cleanly
  - or a release-worthy bug fix changes behavior
- Recommend a `MINOR` bump after:
  - a roadmap milestone closes
  - or a meaningful cluster of issues is completed together
- Do not recommend a version bump for:
  - purely exploratory work
  - failed tuning experiments
  - internal-only diagnostic changes unless they materially affect shipped behavior

## Release History Policy

- every meaningful release should add an entry under:
  - `/Users/stevenwoods/Documents/Codex-Test1/release-history/`
- required:
  - structured session summary
- optional but preferred:
  - verbatim raw chat transcript if exported from Codex
- subsequent release entries should capture the incremental work since the previous release entry

## Release Targets

- `pre-1.0`
  - current phase
  - production remains prerelease in SemVer terms while core gameplay and fidelity for the four-stage slice are still moving
- `beta`
  - target when:
    - the four-stage slice is stable enough for broader external playtesting
    - capture/rescue rules are settled for that slice
    - stage challenge/results/high-score flow is in place
    - visuals/audio are consistent enough for broader playtesting
  - hosted expectation:
    - use the manually promoted `/beta/` lane for these checkpoint builds rather than updating it on every production change
- `1.0`
  - target when:
    - Stage `1` through Stage `4` feel stable as one coherent game loop
    - the Stage `3` challenge stage is rewarding and readable
    - the Stage `4` endpoint is fair and beatable
    - core rule fidelity gaps inside the four-stage slice are resolved or
      consciously documented
    - the hosted build, high-score flow, and public project pages are suitable
      for general external use

## Post-1.0 Environment Goal

- keep production as the canonical public Aurora environment
- keep the current non-production read-only/default-local policy unless there is a strong reason to loosen it
- preferred order after `1.0`:
  1. decide whether beta should remain a production-read mirror or move to its own backend
  2. isolate non-production fully behind a separate Supabase project or clearly separate tables if shared reads stop being useful
  3. keep the active environment obvious in the build label and account/status surfaces
