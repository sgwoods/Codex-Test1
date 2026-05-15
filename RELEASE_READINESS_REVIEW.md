# Release Readiness Review

## Current Read

Aurora `1.4.0` is now the release currently live on hosted `/production`.

Verified May 14, 2026:

- hosted `/production`
  - current live family: `1.4.0`
- hosted `/beta`
  - current reviewed family: `1.4.0 beta`
- hosted `/dev`
  - current forward review line: `1.4.0.1`

For exact active labels, use each lane's `build-info.json`. The important
release truth is that hosted `/production` now carries the deliberate public
`1.4.0` family, while hosted `/dev` remains on the visible `1.4.0.1`
forward-review line and hosted `/beta` remains the approved `1.4.0-beta.1`
production-source lane.

## What This Production Release Means

This is a real public SemVer family move. `1.4.0` is now the shipped public
line on Platinum.

The fourth-segment `1.4.0.1` line remains the hosted-dev review signal. It
helped review the current family on the authority machine, while hosted `/beta`
carried the approved `1.4.0-beta.1` source candidate that was promoted into
hosted `/production`.

Retrospective versioning note:

- this same-family production refresh is now treated as an exception rather
  than the preferred production model
- a future production bundle with this much game-quality, conformance,
  ingestion, and release-surface movement should normally publish as at least a
  new `PATCH` release
- if the public release story itself changes materially, it should instead cut
  the next `MINOR` family

What is now live in the refreshed public line:

- provenance-backed public docs and guides
- current conformance dashboard and economics story
- application artifact conformance scoring
- runtime static sprite-capture scoring
- a measured calibrated ship-loss audio cue lift
- clearer layered release identity across bundle, platform, and applications

## Current Public Quality Position

Current maintained quality read for the refreshed public family:

- overall quality score:
  - `9.2/10`
- weakest high-value category:
  - audio identity and cue alignment at `7.3/10`
- audio support:
  - semantic event score `9.78/10`
  - acoustic event score `6.31/10`
  - cue alignment `9/9`
- current strong supporting categories:
  - level arc and encounter shape at `8.8/10`
  - boss entry and formation grammar at `9.2/10`
  - player movement, shot/hit responsiveness, capture/rescue rules, and key
    shell surfaces at current guardrail passes

Important interpretation:

- `10/10` still means maxed at current scorer resolution, not perfect arcade
  imitation
- the improved public score comes from a better measured bundle, not from
  relaxing standards
- future score changes may go down as measurement gets sharper, and that can
  still represent project progress

## What Is Now True

- `Platinum` is a shipped browser-arcade host platform with committed release
  authority, multi-lane discipline, and first-class hosted docs
- `Aurora Galactica` remains the primary shipped playable application on
  Platinum
- `Galaxy Guardians` remains a preview application and ingestion-backed
  second-cabinet proof, now with a playable beta-candidate lane and
  production-capable preview metadata aligned to the runtime intent
- hosted `/beta` now carries the first deliberate `1.4.0-beta.1` candidate
  while hosted `/production` remains on the refreshed public `1.3.0` family
- hosted `/dev` remains the forward review lane and still uses the
  fourth-segment `1.4.0.1` display line
- layered release identity is now explicit across the integrated bundle, the
  Platinum platform, and each application
- the shipped public line is backed by committed docs, harnesses, dashboards,
  and quality artifacts rather than chat-only release state

## Evidence Supporting The Refreshed Public Line

The refreshed public family is supported by these durable sources:

- quality roll-up:
  - `reference-artifacts/analyses/quality-conformance/2026-05-11-b83393cd`
- conformance dashboard source:
  - `RELEASE_CONFORMANCE_DASHBOARD.md`
- conformance economics source:
  - `CONFORMANCE_ECONOMICS.md`
- public-document provenance source:
  - `documentation-provenance.json`
- strategic lane review:
  - `STRATEGIC_BETA_REVIEW.md`
- detailed public refresh note:
  - [RELEASE_NOTE_1.3.0_PRODUCTION_CONFORMANCE_REFRESH.md](RELEASE_NOTE_1.3.0_PRODUCTION_CONFORMANCE_REFRESH.md)

The refreshed line also has direct verification evidence:

- `npm run build`
- `npm run harness:check:documentation-freshness`
- `npm run publish:check:beta`
- `npm run publish:verify:beta`
- `npm run approve:beta`
- `npm run publish:check:production`
- `npm run publish:verify:production`
- `npm run verify:public`

## Code Review And Boundary Read

The current production decision should treat the platform/application boundary
as strong enough for the refreshed `1.3.0` public line, while still keeping
`1.4.0` follow-through visible.

Current durable read:

- shared service ownership is reasonably clean
- pack selection and shell ownership are meaningfully separated from Aurora
  rules
- version tracking is explicit across bundle, platform, and application records
- remaining next-cycle seams still include:
  - Aurora-shaped compatibility names in some platform-owned storage and
    migration surfaces
  - a still-preview `Galaxy Guardians` application that needs more of its own
    ingestion-backed conformance package before a stronger public claim

These are no longer ship blockers for the refreshed public line. They are the
correct `1.4.0` and later follow-through targets.

## Documentation Contract For Production

The refreshed `1.3.0` public line depends on these docs being current and
committed:

- [README.md](README.md)
- [PLAN.md](PLAN.md)
- [PRODUCT_ROADMAP.md](PRODUCT_ROADMAP.md)
- [GO_FORWARD_EXECUTION_PLAN.md](GO_FORWARD_EXECUTION_PLAN.md)
- [PROJECT_STATE_AND_CONFORMANCE_PROGRAM.md](PROJECT_STATE_AND_CONFORMANCE_PROGRAM.md)
- [PLATINUM.md](PLATINUM.md)
- [APPLICATIONS_ON_PLATINUM.md](APPLICATIONS_ON_PLATINUM.md)
- [RELEASE_POLICY.md](RELEASE_POLICY.md)
- [TESTING_AND_RELEASE_GATES.md](TESTING_AND_RELEASE_GATES.md)
- [QUALITY_RELEASE_SCORECARD.md](QUALITY_RELEASE_SCORECARD.md)
- [BETA_TO_PRODUCTION_PLAN.md](BETA_TO_PRODUCTION_PLAN.md)
- [CODE_REVIEW_MODEL.md](CODE_REVIEW_MODEL.md)
- [REVIEW_LEARNING_LEDGER.md](REVIEW_LEARNING_LEDGER.md)
- [RELEASE_NOTE_1.3.0_PRODUCTION_CONFORMANCE_REFRESH.md](RELEASE_NOTE_1.3.0_PRODUCTION_CONFORMANCE_REFRESH.md)
- [release-dashboard.json](release-dashboard.json)
- [release-notes.json](release-notes.json)
- [release-manifest.json](release-manifest.json)

## Current Follow-Up Work

The refreshed `1.3.0` production push is complete. The follow-up work now is:

1. keep the refreshed public `1.3.0` line trustworthy
2. use hosted `/dev` and hosted `/beta` to review the live `1.4.0` candidate
   family rather than treating every source change as a lane move
3. shift the active execution frame to `1.4.0` arcade depth and
   platform-contract cleanup
4. continue `Galaxy Guardians` through measured ingestion and game-owned
   runtime/conformance work without over-claiming polish
5. keep layered platform/application release tracking visible in docs,
   dashboards, manifests, and build surfaces

## Recommendation

Recommendation: treat the refreshed `1.3.0` public family as the stable current
line and begin the next `1.4.0` pickup deliberately rather than letting the
release story drift back into unprioritized polish.

The strongest reasons are:

- hosted `/production`, hosted `/beta`, and the source docs now tell one
  coherent refreshed `1.3.0` story
- the public documentation and conformance surfaces now explain evidence and
  cost more honestly than the earlier shipped line
- the remaining gaps are next-cycle authenticity and depth opportunities, not
  obvious blockers to the current public line
