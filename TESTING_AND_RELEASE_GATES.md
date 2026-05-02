# Testing And Release Gates

This document describes the expected release discipline for `Platinum` and the
applications it hosts.

The rule is simple:

- automate the gate whenever we reasonably can
- use manual review for feel and presentation only where automation is weak

## Machine And Authority Gate

Aurora now assumes:

- `main` is the only integration branch
- one machine holds release authority at a time
- hosted `/beta` and hosted `/production` may only be published from that
  authority machine

The practical startup and readiness commands are now:

- `npm run machine:bootstrap`
- `npm run machine:ensure-browser`
- `npm run machine:doctor`
- `npm run machine:status`
- `npm run release:show-authority`

This means machine readiness and release authority are now part of release
discipline, not just local convention.

Browser-backed gates use Playwright-managed Chromium. They must not launch the
user's installed Google Chrome by default. In Codex Desktop on macOS, run these
browser-backed commands with escalated sandbox permissions; the harness launcher
will refuse sandboxed browser starts to avoid macOS Chromium/Chrome SIGABRT
crash dialogs.

## Bug-Fix Discipline

We should not address a bug without also deciding how the fix is protected in
the appropriate staging harness.

Default rule:

1. identify the bug family:
   - platform
   - application
   - boundary
   - release / pipeline
2. add or update a targeted automated check when the behavior is stable enough
   to measure
3. if automation is not yet practical, record the manual gate explicitly and
   leave a clear follow-up path toward automation

This is how we stay agile without relying on memory-only fixes.

See also:

- [DEVELOPMENT_PRINCIPLES.md](DEVELOPMENT_PRINCIPLES.md)

## Lane Model

The expected lane model is:

1. local `localhost`
- active engineering lane
- source of the current local candidate

2. hosted `/dev`
- shared integration preview
- hosted mirror of the current stable local candidate
- should only be replaced when the new candidate is intentionally better than
  the currently published hosted `/dev`

3. hosted `/beta`
- reviewed release-candidate lane
- should be more disciplined than hosted `/dev`

4. hosted `/production`
- official public promise
- should only move from an approved hosted `/beta` candidate

See also:

- [MULTI_MACHINE_WORKFLOW.md](MULTI_MACHINE_WORKFLOW.md)
- [release-authority.json](release-authority.json)

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

## Harness Classification

To keep development fluid while still protecting release quality, harnesses
should be thought of in three buckets:

1. `platform`
- protects `Platinum` shell behavior
- protects hosted lane surfaces and release framing
- should not require deep application gameplay validation unless the platform
  change could affect gameplay hosting

Typical examples:
- `node tools/harness/check-popup-surfaces.js`
- `node tools/harness/check-dock-button-actions.js`
- `node tools/harness/check-front-door-copy-surface.js`
- `node tools/harness/check-platinum-pack-boot.js`

2. `application`
- protects game-specific rules and progression
- should stay contained to the application layer whenever possible

Typical examples:
- `node tools/harness/check-dual-final-life-survivor.js`
- `node tools/harness/check-challenge-bonus-stage-numbering.js`
- `node tools/harness/check-extra-ship-awards.js`
- `node tools/harness/check-late-run-ship-loss-soak.js`

3. `boundary`
- protects the seam between platform and applications
- answers:
  - did a game change leak into platform behavior?
  - did a platform change alter game behavior unintentionally?
- future fidelity/trueness work should deepen game-owned state and cue models
  without moving game-specific rules, audiovisual mapping, or reference logic
  into `Platinum`

Typical examples:
- `node tools/harness/check-platinum-pack-boot.js`
- `node tools/harness/check-game-picker-shell.js`
- `node tools/harness/check-front-door-copy-surface.js`

The release process should prefer running the smallest relevant set of checks
that covers the actual risk, rather than running every check for every change.

Harness work should also follow the project reference program:

- bug fixes should gain coverage in the right harness family
- fidelity changes should use measured reference artifacts where possible
- platform/application seam changes should prove that the boundary still holds

## Gate Profiles By Change Type

We want:

- fast iteration on `main`
- meaningful integration confidence on hosted `/dev`
- disciplined promotion into hosted `/beta`
- cautious promotion into hosted `/production`

The way to do that is to choose a gate profile based on the type of change.

### Profile A: Application-only change

Use this when the change is primarily inside a hosted game such as `Aurora`
and should not alter `Platinum` platform behavior.

Examples:
- scoring changes
- life and death rules
- stage sequencing
- capture/carry gameplay fixes
- enemy behavior tuning

Required:
- targeted application harnesses for the changed behavior
- one adjacent regression check for the same gameplay family
- at least one boundary check proving the application change did not leak into
  the platform
- for fidelity work, prefer expanding application-owned state/cue granularity
  instead of adding platform-owned exceptions for one game

Typical boundary checks:
- `node tools/harness/check-platinum-pack-boot.js`
- `node tools/harness/check-game-picker-shell.js`

### Profile B: Platform-only change

Use this when the change is primarily in `Platinum` hosting behavior and should
not alter application gameplay rules.

Examples:
- shell layout
- popup framework
- dock behavior
- front-door platform surfaces
- hosted docs and lane surfaces

Required:
- platform harnesses for the changed area
- one quick application smoke or boot check proving the platform still hosts
  games correctly

Typical application containment checks:
- `node tools/harness/check-platinum-pack-boot.js`
- `node tools/harness/check-new-game-reset.js`
- `node tools/harness/check-galaxy-guardians-0-1-candidate.js` when the changed
  surface touches the `Galaxy Guardians` dev-preview identity, runtime events,
  cue IDs, scoring, or preview/public boundary.
- `node tools/harness/check-galaxy-guardians-audio-character.js` when the
  changed surface touches Guardians cue definitions, audio theme identity,
  runtime cue IDs, or role-specific hit/loss/game-over sound behavior.
- `node tools/harness/check-galaxy-guardians-formation-entry.js` when the changed
  surface touches Guardians stage start, rack-entry, rack-settle, or first-dive
  timing.
- `node tools/harness/check-galaxy-guardians-visual-readability.js` when the
  changed surface touches Guardians sprites, role palettes, preview rendering,
  hit feedback, or gameplay-scale visual identity.

### Profile C: Boundary change

Use this when the change explicitly crosses between platform and application
responsibility.

Examples:
- startup / wait-mode copy ownership
- game picker launch / preview behavior
- pack contracts
- shell surfaces that combine platform and app-owned data

Required:
- at least one platform check
- at least one application check
- one or more explicit boundary checks

This is the highest-leakage-risk category and should be treated accordingly.

### Profile D: Release / pipeline change

Use this when the change affects build, publish, release metadata, hosted docs,
or lane verification rather than gameplay or shell behavior directly.

Examples:
- publish tooling
- production metadata rewrite
- asset copy policy
- documentation gate enforcement
- runtime-loaded media under `assets/`
- top-level public project page sync freshness

Required:
- publish preflight
- live lane verification
- asset and metadata validation
- docs presence checks where relevant

For this profile, asset validation should include runtime-loaded files, not
just shell-visible images. If a lane uses files under `assets/` at runtime,
publish and verify should treat those files as part of the release contract.

For production, the release contract also includes the top-level
`sgwoods/public` Aurora project page. A production release is not complete if
the public page still shows stale release/build/focus content after the publish
and sync steps.

If public sync must be rerun after production is already live, it should run
from current clean `main` and a current tokenized public template, while also
proving that local `dist/production` still matches the live production lane
exactly. That keeps the public page current without silently inventing a new
"production" build that has not actually been released.

This profile should not automatically pull in deep gameplay suites unless the
change also affects gameplay delivery.

## Lane-Specific Rigor

Use the lane purpose to decide how rigorous the gate set must be.

### Local `localhost`

- targeted checks only
- adjacent regression check
- manual inspection where needed

### Hosted `/dev`

- enough confidence to justify replacing the current live hosted `/dev`
- targeted checks for changed areas
- at least one boundary or containment check
- live verify after publish
- manual comparison against the current published hosted `/dev`

### Hosted `/beta`

- stronger gate set than hosted `/dev`
- candidate should be intentionally assembled and stable
- live verify after publish
- review of release-facing deltas
- docs refresh where required for the release family

### Hosted `/production`

- approved hosted `/beta` only
- full production preflight
- live verify
- top-level public project page sync and verify

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

Selection rule:

- choose the smallest harness set that matches the active gate profile
- avoid dragging platform-wide or gameplay-wide suites into every change unless
  the change actually crosses those boundaries

### Hosted `/dev`

Hosted `/dev` exists to catch "worked locally but not when hosted" problems.

Before promoting a candidate from hosted `/dev` to hosted `/beta`, we should
have:

- a clean local `check-publish-ready --lane dev`
- hosted `/dev` publish success
- hosted `/dev` label verification
- a short hosted `/dev` review for visual and feel checks

Hosted `/dev` is the preferred place to catch:

- local-versus-hosted differences
- platform/application boundary drift
- shell or copy regressions that are awkward to judge from local-only runs
- missing runtime-loaded assets that do not show up until the hosted lane is
  exercised

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

Hosted `/beta` should be strict by risk, not strict by volume:

- application-only candidates should primarily run application and boundary
  gates
- platform-only candidates should primarily run platform and boundary gates
- boundary candidates should run both
- release/pipeline candidates should emphasize publish and lane verification

### Hosted `/production`

Hosted `/production` should move only from an approved hosted `/beta` candidate.

Required path:

1. `npm run approve:beta`
2. `npm run promote:production`
3. `node tools/build/check-publish-ready.js --lane production`
4. hosted `/production` publish
5. hosted `/production` label verification
6. `npm run sync:public`
7. `npm run verify:public`

The public `sgwoods/public` sync is part of the production release contract, not a manual follow-up.

Production promotion must also start from a clean tree:

- the local source tree must be clean before `promote:production`
- the release machine must be on `main`, and local `main` must match `origin/main`
- the approved beta candidate must not have been promoted from a dirty source state
- the public sync step must validate the current `src/public/aurora-galactica.template.html` template and the production artifact must have been rebuilt from that exact clean checkout
- if either condition fails, production promotion should stop

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
- keep platform-only, application-only, and boundary harnesses clearly separated
- add stronger pack-contract validation as the second application becomes real
- keep docs refresh discipline boring and routine rather than exceptional
- formalize check ownership so every application-level change proves it did not
  leak into `Platinum`, and every platform-level change proves it did not alter
  hosted game rules unintentionally

## Related Docs

- platform guide:
  - [PLATINUM.md](PLATINUM.md)
- application-layer guide:
  - [APPLICATIONS_ON_PLATINUM.md](APPLICATIONS_ON_PLATINUM.md)
- release policy:
  - [RELEASE_POLICY.md](RELEASE_POLICY.md)
- release readiness review:
  - [RELEASE_READINESS_REVIEW.md](RELEASE_READINESS_REVIEW.md)
