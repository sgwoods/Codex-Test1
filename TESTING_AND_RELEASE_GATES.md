# Testing And Release Gates

This document describes the expected release discipline for `Platinum` and the
applications it hosts.

The rule is simple:

- automate the gate whenever we reasonably can
- use manual review for feel and presentation only where automation is weak

## Lane Model

The expected lane model is:

1. local `localhost`
- active engineering lane
- source of the current local candidate

2. hosted `/dev`
- shared integration preview
- hosted mirror of the current stable local candidate

3. hosted `/beta`
- reviewed release-candidate lane
- should be more disciplined than hosted `/dev`

4. hosted `/production`
- official public promise
- should only move from an approved hosted `/beta` candidate

## Documentation Gate For Major `x.y` Releases

For every meaningful `x.y` release, we should complete a full documentation pass
between hosted `/beta` and hosted `/production`.

That pass should refresh:

- `release-notes.json`
- `release-dashboard.json`
- `README.md`
- `PLAN.md`
- `PRODUCT_ROADMAP.md`
- `RELEASE_POLICY.md`
- `RELEASE_READINESS_REVIEW.md`
- `ARCHITECTURE.md`
- `PLATINUM.md`
- `APPLICATIONS_ON_PLATINUM.md`
- this testing and release gate document
- hosted `project-guide.html`
- hosted `platinum-guide.html`
- hosted `player-guide.html`

This was not enforced strongly enough before `1.2.0` reached hosted
`/production`.

From now on, it should be treated as part of the release contract.

## Front-Door Copy Gate

Startup, initiation, and wait-mode copy is part of the release surface.

For any candidate where front-door copy changes, we should verify:

- platform-owned shell copy still appears on the front door
- stale release placeholders are gone
- application-owned identity copy still appears correctly
- platform splash copy remains aligned with the current Platinum docs

The current automated front-door copy gate is:

- `node tools/harness/check-front-door-copy-surface.js`

## Required Automated Gates

### Local `localhost`

Before promotion from local `localhost` into hosted `/dev` or hosted `/beta`,
we expect:

- `npm run build`
- `node tools/build/check-publish-ready.js --lane dev`
- core gameplay and shell harnesses relevant to the candidate

Typical current examples include:

- `node tools/harness/check-input-mapping.js`
- `node tools/harness/check-new-game-reset.js`
- `node tools/harness/check-capture-lifecycle.js`
- `node tools/harness/check-challenge-motion-profile.js`
- `node tools/harness/check-remote-score-submit.js`
- `node tools/harness/check-pilot-records-panel.js`
- `node tools/harness/check-feedback-submit-path.js`
- `node tools/harness/check-platinum-pack-boot.js`
- `node tools/harness/check-game-picker-shell.js`
- `node tools/harness/check-popup-surfaces.js`
- `node tools/harness/check-dock-button-actions.js`
- `node tools/harness/check-persona-repeatability.js`
- `node tools/harness/check-front-door-copy-surface.js`
- `node tools/harness/check-runtime-loop-crash-capture.js`
- `node tools/harness/check-late-run-ship-loss-soak.js` for any candidate touching player lifecycle, scoring, or other late-run gameplay transitions

### Hosted `/dev`

Hosted `/dev` exists to catch "worked locally but not when hosted" problems.

Before promoting a candidate from hosted `/dev` to hosted `/beta`, we should
have:

- a clean local `check-publish-ready --lane dev`
- hosted `/dev` publish success
- hosted `/dev` label verification
- a short hosted `/dev` review for visual and feel checks

### Hosted `/beta`

Hosted `/beta` is the real production gate.

Before moving hosted `/beta` to hosted `/production`, we expect:

- `node tools/build/check-publish-ready.js --lane beta`
- hosted `/beta` publish success
- hosted `/beta` live label verification
- hosted `/beta` live-input verification when input or gameplay start behavior could be affected
- targeted soak coverage for any open freeze or long-session stability risk
- for the current late-run freeze family, that means:
  - `node tools/harness/check-late-run-ship-loss-soak.js`
- completed documentation refresh for any meaningful `x.y` release

### Hosted `/production`

Hosted `/production` should move only from an approved hosted `/beta` candidate.

Required path:

1. `npm run approve:beta`
2. `npm run promote:production`
3. `node tools/build/check-publish-ready.js --lane production`
4. hosted `/production` publish
5. hosted `/production` label verification

## First-Class Hosted Documentation Requirement

The hosted documentation set is now part of the release surface.

Every hosted lane should carry:

- `project-guide.html`
- `platinum-guide.html`
- `player-guide.html`
- `release-dashboard.html`
- `release-notes.json`
- `build-info.json`

That requirement is now enforced by the publish preflight.

## Remaining Improvement Areas

The release gate is stronger than it used to be, but there is still room to
improve:

- make more live-lane checks automatic instead of relying on memory
- keep platform-only and application-only harnesses clearly separated
- add stronger pack-contract validation as the second application becomes real
- keep docs refresh discipline boring and routine rather than exceptional

## Related Docs

- platform guide:
  - `/Users/stevenwoods/Documents/Codex-Test1/PLATINUM.md`
- application-layer guide:
  - `/Users/stevenwoods/Documents/Codex-Test1/APPLICATIONS_ON_PLATINUM.md`
- release policy:
  - `/Users/stevenwoods/Documents/Codex-Test1/RELEASE_POLICY.md`
- release readiness review:
  - `/Users/stevenwoods/Documents/Codex-Test1/RELEASE_READINESS_REVIEW.md`
