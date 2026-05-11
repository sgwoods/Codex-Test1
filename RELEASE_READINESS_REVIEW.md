# Release Readiness Review

## Current Read

Aurora `1.3.0` is the release currently live on hosted `/production`.

Verified May 11, 2026:

- hosted `/production`
  - current live family: `1.3.0`
- hosted `/beta`
  - current live family: `1.3.0 beta`
- hosted `/dev`
  - current review family: `1.3.0.1`

For exact active labels, use each lane's `build-info.json`. The key release
decision is that hosted `/beta` and `/production` preserve the shipped `1.3.0`
family, while hosted `/dev` is intentionally ahead as the current
post-production review increment.

## Current Hosted-Dev Review Read

As of May 11, 2026, hosted `/dev` is intentionally ahead of the shipped family
as the `1.3.0.1` review increment. It carries the current conformance dashboard,
public documentation, resource-economics reporting, application artifact
scorecard, runtime sprite static-crop scoring, and a measured calibrated
ship-loss audio cue lift.

This changes the near-term release question from "is 1.3.0 shipped?" to "is
the 1.3.0.1 hosted-dev review bundle strong enough to request a beta publish
from the release-authority machine?"

Current local/dev review quality position:

- overall quality score:
  - `9.2/10`
- weakest high-value category:
  - audio identity and cue alignment at `7.3/10`
- current audio support:
  - semantic event score `9.78/10`
  - acoustic event score `6.31/10`
  - cue alignment `9/9`
- highest remaining audio gap:
  - residual `playerHit` tail after the calibrated ship-loss promotion

Release authority note: this MacBook may prepare and publish hosted `/dev`, but
hosted `/beta` and `/production` remain blocked here while release authority is
held by `imacm1 / iMacM1`.

## What Is Now True

- `Platinum` is a shipped browser-arcade host platform with committed release
  authority and lane discipline
- `Aurora Galactica` remains the primary shipped playable application on
  Platinum
- `Galaxy Guardians` is now part of the public product story as the first
  second-cabinet sneak peek, while still remaining a preview-first application
- hosted `/beta` and hosted `/production` are aligned around the same `1.3.0`
  release family, while hosted `/dev` carries the `1.3.0.1` review increment
- layered release identity is now explicit across the integrated bundle, the
  Platinum platform, and each application
- the shipped release family is backed by committed docs, harnesses, and
  quality artifacts rather than chat-only release state

## Current Shipped Candidate Quality

Current quality position for the shipped `1.3.0` family:

- overall quality score:
  - `8.8/10` from the latest full bundled rollup still used for this cycle
- strongest category:
  - combat responsiveness
- weakest bundled category:
  - audio identity and cue alignment at `6.1/10`

That quality read is good enough for ship, but it still justifies the explicit
`1.4.0` pickup focused on arcade depth and stronger measured identity work.

## Evidence Supporting The Shipped Release

The current shipped family is supported by these committed evidence sources:

- quality rollup:
  - `reference-artifacts/analyses/quality-conformance/2026-05-04-26ca77c`
- movement correspondence:
  - `reference-artifacts/analyses/correspondence/player-movement/2026-04-24-e1c2c65`
- audio cue alignment:
  - `reference-artifacts/analyses/correspondence/audio-cue-alignment/2026-04-24-e1c2c65`
- audio identity comparison:
  - `reference-artifacts/analyses/aurora-audio-theme-comparison/2026-04-24-main-ca481f2`
- reference video alignment:
  - `reference-artifacts/analyses/reference-video-alignment/stage1-opening-window-2026-04-24-e1c2c65`

The shipped family also has direct verification evidence:

- `npm run build`
- `npm run publish:check:beta`
- `npm run publish:check:production`
- hosted `/beta` live verification
- hosted `/production` live verification
- non-production pilot-account path verified for the configured test-pilot lane

## Code Review And Boundary Read

The production decision should treat the platform/application boundary as strong
enough for the `1.3.0` ship, but still deserving of explicit next-cycle work.

The dedicated boundary review remains captured in:

- [PLATINUM_INTERFACE_REVIEW.md](PLATINUM_INTERFACE_REVIEW.md)

Current read from that review:

- shared service ownership is reasonably clean
- pack selection and shell ownership are meaningfully separated from Aurora
  rules
- version tracking is now explicit across bundle, platform, and application
  records
- remaining non-blocking seams still include:
  - Aurora-shaped compatibility names inside some platform-owned storage and
    migration surfaces
  - a still-preview `Galaxy Guardians` application whose production presence is
    intentionally shell-first, not a fully shipped second game

These are not current ship blockers, but they are the correct `1.4.0`
follow-through targets.

## Documentation Contract For Production

The `1.3.0` shipped line depends on these docs being current and committed:

- [README.md](README.md)
- [PLAN.md](PLAN.md)
- [PRODUCT_ROADMAP.md](PRODUCT_ROADMAP.md)
- [GO_FORWARD_EXECUTION_PLAN.md](GO_FORWARD_EXECUTION_PLAN.md)
- [PLATINUM.md](PLATINUM.md)
- [APPLICATIONS_ON_PLATINUM.md](APPLICATIONS_ON_PLATINUM.md)
- [RELEASE_POLICY.md](RELEASE_POLICY.md)
- [TESTING_AND_RELEASE_GATES.md](TESTING_AND_RELEASE_GATES.md)
- [QUALITY_RELEASE_SCORECARD.md](QUALITY_RELEASE_SCORECARD.md)
- [BETA_TO_PRODUCTION_PLAN.md](BETA_TO_PRODUCTION_PLAN.md)
- [RELEASE_NOTE_1.3.0.1_HOSTED_DEV_REVIEW.md](RELEASE_NOTE_1.3.0.1_HOSTED_DEV_REVIEW.md)
- [release-dashboard.json](release-dashboard.json)
- [release-notes.json](release-notes.json)
- [release-manifest.json](release-manifest.json)

## Current Follow-Up Work

The production push is complete. The follow-up work now is:

1. keep the `1.3.0` production family trustworthy while it settles in public
2. review the `1.3.0.1` hosted-dev bundle and request beta only from the
   release-authority machine if accepted
3. shift the active execution frame to `1.4.0` arcade depth and
   platform-contract cleanup
4. continue `Galaxy Guardians` through measured evidence and application-owned
   runtime work without over-claiming polish
5. keep layered platform/application release tracking visible in docs,
   dashboards, and build surfaces

## Recommendation

Recommendation: treat the shipped `1.3.0` family as the stable new public line
and begin the `1.4.0` pickup deliberately rather than trying to rediscover the
post-release plan later.

The strongest argument for doing that now is:

- hosted `/production`, hosted `/beta`, and hosted `/dev` now tell one coherent
  `1.3.0` story
- the second-game preview is public, but still honestly framed as preview work
- the remaining gaps are next-cycle quality and product-depth opportunities, not
  obvious blockers to the current shipped family
