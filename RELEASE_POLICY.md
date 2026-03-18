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
  - reserve `1.x` for a public-quality release where core gameplay, rules fidelity, and presentation are stable
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

## Release Targets

- `alpha`
  - current phase
  - core gameplay and fidelity still moving
- `beta`
  - target when:
    - later-stage progression is stable
    - capture/rescue rules are settled
    - manual-backed scoring/results behavior is in place
    - visuals/audio are consistent enough for broader playtesting
- `1.0`
  - target when:
    - arcade feel is stable across early and mid-game
    - core rule fidelity gaps are resolved or consciously documented
    - hosted build is suitable for general external use
