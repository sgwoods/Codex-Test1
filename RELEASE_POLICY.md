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

Examples:

- pre-production:
  - `0.5.0-alpha.1+build.115.sha.b0d812c`
- production:
  - `0.5.0+build.9.sha.457df28`
- production beta:
  - `0.5.0-beta.1+build.9.sha.457df28.beta`

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
    - major gameplay fidelity improvement
    - large systems addition
    - new stage/content breadth milestone
    - public playtest readiness
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

- `production`
  - published at:
    - `https://sgwoods.github.io/Aurora-Galactica/`
  - this is the official shared build, even while SemVer remains prerelease before `1.0`
- `beta`
  - manually promoted at:
    - `https://sgwoods.github.io/Aurora-Galactica/beta/`
  - this is a distinct public checkpoint lane for less-frequent milestone playtesting
- `pre-production`
  - day-to-day development happens in:
    - `https://github.com/sgwoods/Codex-Test1`
  - this is the active engineering line and not the canonical shared play URL

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
4. Promote the current dev build into the beta lane:
   - `npm run promote:beta`
5. Review the generated output in:
   - `/Users/stevenwoods/Documents/Codex-Test1/dist/dev/`
   - `/Users/stevenwoods/Documents/Codex-Test1/dist/beta/`
6. Run the beta preflight:
   - `npm run publish:check:beta`
7. Publish the promoted beta snapshot with:
   - `npm run publish:beta`
8. Let GitHub Pages deploy from `Aurora-Galactica` so:
   - `https://sgwoods.github.io/Aurora-Galactica/beta/`
     serves the promoted checkpoint

The beta lane is intentionally a snapshot of selected generated artifacts under `dist/`, not a separate branch or a second build pipeline. `Codex-Test1` remains the engineering source of truth; `Aurora-Galactica` is the public release surface for both production and beta.

## Production Publish Workflow

1. Build and validate the current dev output:
   - `npm run build`
   - plus whatever harness/manual checks are appropriate for the release
2. Promote the approved dev build into the stable production artifact:
   - `npm run promote:production`
3. Run the production preflight:
   - `npm run publish:check:production`
4. Publish the generated production surface with:
   - `npm run publish:production`
5. Let GitHub Pages deploy from `Aurora-Galactica` so:
   - `https://sgwoods.github.io/Aurora-Galactica/`
     serves the promoted production build

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

- after `1.0`, cleanly separate production and non-production score/data paths
- production should remain the canonical public Aurora environment
- non-production should no longer write directly into the same live score path
  by default
- preferred order after `1.0`:
  1. keep Aurora production and Aurora beta together only if that remains useful
  2. isolate pre-production/dev writes behind a separate environment, separate
     tables, or a no-submit/dev-only mode
  3. make the active environment obvious in the build label and account/status
     surfaces
