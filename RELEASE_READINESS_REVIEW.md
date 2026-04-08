# Release Readiness Review

## Current Read

`1.2.0 - Platinum Release 1` is already live on hosted `/production`.

That means this document is now serving two jobs:

1. record the current release-readiness posture of the shipped line
2. record the process lesson that a full major-release documentation pass must be treated as part of the gate between hosted `/beta` and hosted `/production`

## What Is Now True

- `Platinum` is a real shipped platform
- `Aurora Galactica` is the first shipped playable application on Platinum
- hosted lanes exist for local `localhost`, hosted `/dev`, hosted `/beta`, and hosted `/production`
- the current release ladder is proven end-to-end
- the hosted documentation set now needs to be treated as part of the release surface rather than a nice-to-have side artifact

## Documentation Lesson From `1.2.0`

The major miss in the original `1.2.0` promotion was not broad product failure.

It was that the documentation pass was not strong enough or explicit enough.

The correction is:

- make the Platinum guide a first-class hosted page
- keep platform docs and application docs separate
- require the hosted docs set in publish preflight
- require a complete docs refresh for meaningful `x.y` releases before hosted `/production` promotion

## Current Documentation Contract

Hosted docs that should exist per lane:

- `project-guide.html`
- `platinum-guide.html`
- `player-guide.html`
- `release-dashboard.html`
- `release-notes.json`
- `build-info.json`

Core maintained source docs behind that hosted set:

- `/Users/stevenwoods/Documents/Codex-Test1/README.md`
- `/Users/stevenwoods/Documents/Codex-Test1/PLAN.md`
- `/Users/stevenwoods/Documents/Codex-Test1/PRODUCT_ROADMAP.md`
- `/Users/stevenwoods/Documents/Codex-Test1/ARCHITECTURE.md`
- `/Users/stevenwoods/Documents/Codex-Test1/PLATINUM.md`
- `/Users/stevenwoods/Documents/Codex-Test1/APPLICATIONS_ON_PLATINUM.md`
- `/Users/stevenwoods/Documents/Codex-Test1/TESTING_AND_RELEASE_GATES.md`
- `/Users/stevenwoods/Documents/Codex-Test1/RELEASE_POLICY.md`
- `/Users/stevenwoods/Documents/Codex-Test1/release-dashboard.json`
- `/Users/stevenwoods/Documents/Codex-Test1/release-notes.json`
- `/Users/stevenwoods/Documents/Codex-Test1/project-guide.json`
- `/Users/stevenwoods/Documents/Codex-Test1/platinum-guide.json`
- `/Users/stevenwoods/Documents/Codex-Test1/player-guide.json`

## Current Release Risk View

Main remaining risks are now smaller and more operational than architectural:

- small Aurora trust-fix issues in the `1.2.x` patch line
- keeping docs and hosted lanes aligned after source changes
- strengthening the platform/application boundary as the second game becomes more real

## Current `1.2.1` Candidate Shape

The current `1.2.1` patch candidate is intended to be narrow and Aurora-scoped.

It currently bundles:

- dual-fighter surviving-ship correctness
- challenge stages treated as bonus stages in visible numbering
- suppression of carry/capture visuals under game-over/results
- broader carry-state overlay coverage
- clearer ownership of startup and wait-mode shell copy between Platinum and the hosted applications

The goal is to promote these as a trustworthy fast-follow patch without reopening broad gameplay tuning or platform-shell redesign.

## Recommended Rule Going Forward

For every meaningful `x.y` release:

1. finish the code candidate
2. verify local `localhost`
3. verify hosted `/dev`
4. promote and verify hosted `/beta`
5. complete the full documentation refresh
6. approve hosted `/beta`
7. only then publish hosted `/production`
