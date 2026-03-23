# Release Policy

## Version Format

- We use Semantic Versioning with prerelease tags while the game is still evolving toward a stable arcade-quality release.
- Current format:
  - `MAJOR.MINOR.PATCH-prerelease`
- Current build label format:
  - `MAJOR.MINOR.PATCH-prerelease+build.<number>.sha.<shortcommit>`
- Dirty local builds append:
  - `.dirty`

Example:

- `0.5.0-alpha.1+build.54.sha.c04bd9c`

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

- `alpha`
  - continuously published at:
    - `https://sgwoods.github.io/Aurora-Galactica/`
  - expected to move frequently with active development, instrumentation, tuning, and UI changes
- `beta`
  - manually promoted at:
    - `https://sgwoods.github.io/Aurora-Galactica/beta/`
  - should move only when a build is materially better and worth broader checkpoint testing

## Beta Promotion Workflow

1. Build the current root artifacts:
   - `npm run build`
2. Promote the current artifacts into the beta lane:
   - `npm run promote:beta`
3. Commit the updated `/beta/` directory
4. Push `main` so GitHub Pages republishes both lanes

The beta lane is intentionally a snapshot of selected root artifacts, not a separate branch or a second build pipeline.

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

- `alpha`
  - current phase
  - core gameplay and fidelity for the four-stage slice are still moving
- `beta`
  - target when:
    - the four-stage slice is stable enough for broader external playtesting
    - capture/rescue rules are settled for that slice
    - stage challenge/results/high-score flow is in place
    - visuals/audio are consistent enough for broader playtesting
  - hosted expectation:
    - use the manually promoted `/beta/` lane for these checkpoint builds rather than updating it on every alpha change
- `1.0`
  - target when:
    - Stage `1` through Stage `4` feel stable as one coherent game loop
    - the Stage `3` challenge stage is rewarding and readable
    - the Stage `4` endpoint is fair and beatable
    - core rule fidelity gaps inside the four-stage slice are resolved or
      consciously documented
    - the hosted build, high-score flow, and public project pages are suitable
      for general external use
