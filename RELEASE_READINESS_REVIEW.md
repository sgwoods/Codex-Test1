# Release Readiness Review

## Current Read

`1.2.1 - Aurora trust-fix and copy-boundary patch` is currently live on hosted `/production`.

`1.2.2 - Runtime freeze hardening patch` is the current hosted `/beta` candidate for promotion.

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

- late-run runtime exceptions that can still exist even though the loop now traps and surfaces them
- keeping docs and hosted lanes aligned after source changes
- strengthening the platform/application boundary as the second game becomes more real

## What `1.2.2` Is Intended To Ship
`1.2.2` is a narrow runtime-stability patch.

It bundles:

- runtime loop hardening so one-frame update or draw exceptions no longer silently dead-frame the run
- visible export guidance when a runtime fault is trapped
- a fix for restart-time async score-submit crashes
- a targeted late-run ship-loss soak gate for beta-to-production promotion

This is the right shape for the patch:

- small surface area
- high trust value
- better diagnostics if the remaining underlying freeze trigger still exists

## What `1.2.1` Shipped
`1.2.1` shipped as a narrow and Aurora-scoped fast-follow patch.

It bundles:

- dual-fighter surviving-ship correctness
- challenge stages treated as bonus stages in visible numbering
- suppression of carry/capture visuals under game-over/results
- broader carry-state overlay coverage
- clearer ownership of startup and wait-mode shell copy between Platinum and the hosted applications

This was the intended shape: a trustworthy fast-follow patch without reopening broad gameplay tuning or platform-shell redesign.

## Recommended Rule Going Forward

For every meaningful `x.y` release:

1. finish the code candidate
2. verify local `localhost`
3. verify hosted `/dev`
4. promote and verify hosted `/beta`
5. complete the full documentation refresh
6. approve hosted `/beta`
7. only then publish hosted `/production`
