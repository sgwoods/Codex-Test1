# Release Policy

## Version Format

We currently expose a SemVer-style integrated release version plus build
metadata for the hosted bundle.

Examples:

- local `localhost`:
  - `x.y.z.n+build.NNN.sha.abcdef0.dirty`
- hosted `/dev`:
  - `x.y.z.n+build.NNN.sha.abcdef0`
- hosted `/beta`:
  - `x.y.z-beta.1+build.NNN.sha.abcdef0.beta`
- hosted `/production`:
  - `x.y.z+build.NNN.sha.abcdef0`

These are bundle-version examples, not current live lane values.

## Layered Version Domains

Going forward, the repo should treat release identity as layered rather than
single-track.

The intended version domains are:

- integrated release version
  - the public version for the hosted bundle on a lane such as `1.3.0`
- Platinum platform version
  - the shared host contract, shell, services, tooling, and pack-compatibility
    version
- application version
  - the game-owned version for each shipped or previewed application such as
    `Aurora Galactica`, `Galaxy Guardians`, and future sibling games
- build identity
  - build number, commit hash, dirty state, and lane metadata
- hosted development version line
  - a fourth visible segment such as `1.3.0.1` for accumulated `/dev`
    increments between formal release families
  - this is a display/build-train line, not the `package.json` SemVer value

Rules:

- do not assume every version domain must move together
- keep `package.json` on valid SemVer, such as `1.3.0`, even when hosted
  `/dev` displays a fourth-segment line such as `1.3.0.1`
- a platform-only fix may advance the platform version without forcing every
  application version to change
- a game-only release may advance one game's version and the integrated bundle
  while the platform version stays compatible
- a full product milestone may move the integrated release version while also
  recording exactly which platform and application versions were bundled
- current hosted labels are still bundle-oriented, but docs, dashboards, and
  manifests should evolve toward showing platform and per-game versions
  explicitly

## Release Scope Direction

Public hosting still publishes one integrated bundle per lane today.

That does not mean we should flatten release discipline into one axis.

The source-of-truth direction is to support three distinct candidate scopes:

1. platform candidate
   - shared shell, services, pack contract, tooling, and publish behavior
2. application candidate
   - one game's rules, content, conformance evidence, and game-owned release
     story
3. integrated bundle candidate
   - the specific overall combination being promoted on hosted `/dev`,
     hosted `/beta`, or hosted `/production`

Each scope should be able to carry its own numbering, evidence, and test gate
without forcing unrelated areas to churn.

## Meaning

- `MAJOR`
  - reserve for true product-era breaks or major repositioning
- `MINOR`
  - use for meaningful public milestones
  - example:
    - `1.2.0` = `Platinum Release 1`
  - current planning read:
    - the next serious Aurora quality/fidelity release should likely be a
      `MINOR` step such as `1.3.0`, not a new `MAJOR`
- `PATCH`
  - use for smaller compatible improvements inside the current milestone
  - examples:
    - gameplay correctness fixes
    - UI polish
    - harness hardening
    - documentation and release-discipline follow-through inside the same release family
    - meaningful compatible production improvements that players can actually feel,
      including game-quality lifts, conformance improvements, and ingestion/runtime
      optimizations that directly support shipped quality
  - not the right bucket when the public candidate story changes materially,
    such as adding a second cabinet or second-game surface that changes the
    release promise even if it remains preview-scoped

## Production Version Regularity

Hosted `/dev` is allowed to use a fourth-segment review line such as `1.3.0.1`
because it is the integration/review lane.

Hosted `/beta` and hosted `/production` should be more regular and easier to
read publicly.

Rules:

- the normal expectation is that any beta or production promotion moves a real
  public SemVer version
- use at least a `PATCH` step for production-sized bundles that contain
  meaningful compatible player-facing value, including gameplay polish,
  conformance lifts, ingestion improvements that directly support shipped
  quality, or release-surface upgrades that materially improve trust
- use a `MINOR` step when the public release story itself changes, such as a
  new cabinet, a new serious application surface, or a broader platform/game
  milestone
- do not reuse the exact same public production version just because the work
  began as a hosted `/dev` review bundle
- reserve same-version production republish behavior for true production-failure
  remediation, such as correcting a broken publish, incomplete asset set, or
  serious production-only defect where the honest story is "repair the shipped
  release" rather than "announce a new release"
- when in doubt between same-version refresh and a compatible new public
  release, prefer at least the `PATCH` step

## Hosted Release Lanes

Repository roles:

- source of truth for engineering, issues, and planning:
  - [sgwoods/Codex-Test1](https://github.com/sgwoods/Codex-Test1)
- public release host and GitHub Pages deployment:
  - [sgwoods/Aurora-Galactica](https://github.com/sgwoods/Aurora-Galactica)

See also:

- [REPOSITORY_ROLE_MAP.md](REPOSITORY_ROLE_MAP.md)

## External Service Access Rule

External-service permissions are release artifacts when they affect runtime
behavior.

For Supabase, the current source of truth is:

- [SUPABASE_DATA_API_ACCESS.md](SUPABASE_DATA_API_ACCESS.md)
- [supabase/data-api-access-contract.sql](supabase/data-api-access-contract.sql)

The publish preflight runs `npm run harness:check:supabase-data-api-contract`.
That gate exists because Platinum uses Supabase Data API access for auth-backed
profiles and leaderboards, and Supabase public-schema table access now requires
explicit grants. Any new browser-visible table, including future replay video or
YouTube posting metadata, must land with grants, RLS posture, and policy
documentation before it can move through hosted `/dev`, `/beta`, or
`/production`.

The intended lane model is:

1. local `localhost`
2. hosted `/dev`
3. hosted `/beta`
4. hosted `/production`

Meaning:

- local `localhost`
  - active engineering lane
- hosted `/dev`
  - shared hosted integration preview
- hosted `/beta`
  - reviewed release candidate
- hosted `/production`
  - public stable promise

## Conformance Documentation Freshness

Release notes alone are not enough.

If a candidate claims new conformance work, ingestion-process improvements, or
updated release-readiness evidence, the generated conformance documentation must
move with it.

The minimum release-owned refresh bundle is:

- `reference-artifacts/analyses/conformance-economics/latest.json`
- `reference-artifacts/analyses/release-conformance-dashboard/latest.json`
- `reference-artifacts/analyses/application-artifact-conformance/latest.json`

The standard refresh command is:

- `npm run harness:refresh:release-conformance-docs`

Then:

- `npm run build`
- commit the refreshed artifacts
- run the normal publish preflight

The intended effect is simple: if `/dev`, `/beta`, or `/production` tells a
human that conformance has moved, the hosted documentation should not still be
quietly reading from an older analysis snapshot.

See also:

- [RELEASE_LANE_MODEL.md](RELEASE_LANE_MODEL.md)

## Security/Auth/Replay Storage Rule

Account, score, replay, and high-score video features are release-sensitive
surfaces. The maintained lock-down source is:

- [SECURITY_AUTH_REPLAY_STORAGE_LOCKDOWN.md](SECURITY_AUTH_REPLAY_STORAGE_LOCKDOWN.md)

Publish preflight runs:

```bash
npm run harness:check:security-auth-replay-storage
```

That gate keeps browser code free of service-role material, OAuth client
secrets, and YouTube upload endpoints; confirms top-10 video posting eligibility
is authenticated and confirmed-account only; preserves non-production test-pilot
limits; and keeps replay video browser-local until a server-owned upload/storage
policy exists.

## Release Authority Rule

Aurora now uses a one-authority release model.

That means:

- topic branches and ordinary development may happen from more than one machine
- `main` remains the only integration branch
- hosted `/beta` and hosted `/production` may only be published from the
  machine recorded in
  [release-authority.json](release-authority.json)

Current versioning read for the next cycle:

- the shipped `1.3.0` family is now the stable public baseline
- hosted `/dev` now carries the first `1.4.0.1` forward-review line for the
  next minor-family candidate
- hosted `/beta` now carries the first `1.4.0-beta.1` reviewed candidate for
  that family
- the May 12 same-family `1.3.0` production refresh should be treated as an
  exception, not the default model for future promotions
- the next coherent public candidate should not collapse back into a `1.3.1`
  fast-follow patch if it is really the first deliberate post-release depth and
  platform-contract bundle
- treat that kind of candidate as the next `MINOR` family step, currently
  expected to be `1.4.0`, and only change the actual runtime version when we
  intentionally cut the candidate branch
- while the current build label still centers the integrated version, we should
  also start treating the platform and each hosted game as independently
  tracked release surfaces

Useful commands:

```bash
npm run release:show-authority
npm run release:claim-authority -- --machine-id <id> --label "<label>"
```

## Replacement Rule For Hosted `/dev`

Hosted `/dev` is already a published integration surface.

That means a new hosted `/dev` publish should not happen just because a branch
contains additional work.

Before replacing hosted `/dev`, we should be able to answer:

1. what is concretely better than the current published hosted `/dev`
2. what supporting gate evidence backs that claim
3. what known issues remain and why they are acceptable for `/dev`

This is the core professionalism rule for the next release phase.

## Replication Policy Between Repos

Aurora uses selective replication between:

- source repo:
  - [sgwoods/Codex-Test1](https://github.com/sgwoods/Codex-Test1)
- public release host:
  - [sgwoods/Aurora-Galactica](https://github.com/sgwoods/Aurora-Galactica)

This is intentional. We should not mirror the full engineering repo into the
release host on every publish.

Working model:

- `Codex-Test1`
  - factory
  - contains full engineering context
- `Aurora-Galactica`
  - showroom
  - contains the public release package

### What Must Stay In `Codex-Test1`

- active source code history
- issues
- planning and roadmap docs
- harnesses and experimental tooling
- internal analyses unless they are part of the public release story
- machine bootstrap, release authority, and engineering workflow internals

### What Should Replicate To `Aurora-Galactica`

- production-ready built code and assets
- hosted documentation for the live lane being published
- release notes, dashboard, and build metadata
- public-facing guides
- enough mirrored context that the release host makes sense as a public repo

### Replication Levels

1. `dev mirror`
   - hosted runtime
   - minimal hosted docs
   - build metadata
   - enough release context to explain the lane
2. `beta mirror`
   - full candidate runtime
   - release docs
   - release dashboard
   - public guides
   - candidate metadata
3. `production mirror`
   - full public package
   - polished hosted docs
   - stable release metadata
   - public release-facing context

Rule:

- no replication is needed for ordinary local or topic-branch work
- selective replication is appropriate for hosted `/dev`
- full public-package replication is expected for hosted `/beta` and hosted
  `/production`

## Current Promotion Reality

As of May 14, 2026:

- hosted `/dev` is on the active `1.4.0.1` hosted-dev review line
- hosted `/beta` is on the active `1.4.0-beta.1` beta candidate lane
- hosted `/production` is on the shipped `1.3.0` public line

That means:

- hosted `/dev` and hosted `/beta` are intentionally ahead while hosted
  `/production` preserves the coherent shipped `1.3.0` family
- platform, application, and bundle tracking should stay explicit even when the
  lanes are close
- the next beta action should be an authority-gated promotion from an accepted
  hosted-dev review bundle, not an automatic mirror of `/dev`
- future beta/production promotions of similar scope should move a real public
  SemVer step rather than repeat the May 12 same-family production exception

## Major `x.y` Documentation Gate

For every meaningful `x.y` release, the gate between hosted `/beta` and hosted
`/production` should include a complete documentation refresh.

That refresh should cover at least:

- `release-notes.json`
- `release-dashboard.json`
- `QUALITY_RELEASE_SCORECARD.md`
- `README.md`
- `PLAN.md`
- `PRODUCT_ROADMAP.md`
- `ARCHITECTURE.md`
- `PLATINUM.md`
- `APPLICATIONS_ON_PLATINUM.md`
- `TESTING_AND_RELEASE_GATES.md`
- `RELEASE_READINESS_REVIEW.md`
- `STRATEGIC_BETA_REVIEW.md`
- hosted `project-guide.html`
- hosted `platinum-guide.html`
- hosted `player-guide.html`

This should be treated as a real release artifact pass, not optional cleanup.
After each major hosted `/beta` push, the strategic beta review must be
refreshed so the next lane decision is checked against near-term player value,
long-term platform/ingestion goals, documentation freshness, and
value-versus-compute evidence.

## Core Artifact Commit Rule

We should assume that any core artifact used to produce, validate, explain, or
approve a release must be committed at some stage of the process.

Core artifacts include:

- source code used in the lane being published
- release scripts and harness scripts
- reference profiles and correspondence check definitions
- scorecards, release notes, dashboards, and readiness docs
- release conformance analysis, including score tables, resource/time spend,
  economics charts, past-goal movement, and next-goal estimates
- curated reference inputs that the project depends on for tuning or review

Generated artifacts do not all need to live in git, but they must not be
ephemeral in practice.

Rule:

- the definitions, inputs, and documentation for a release must be committed
- generated outputs may stay uncommitted only when they are reproducible from
  committed code and committed reference inputs
- if a generated artifact is being relied on as a durable release record, it
  should itself be committed or copied into a committed summary document

This is the rule that keeps release knowledge out of chat-only or machine-only
 state.

## Promotion Workflow

1. build the local `localhost` candidate
2. verify local `localhost` gates
3. refresh the quality score, conformance economics, release conformance
   dashboard, and scorecard for the candidate
4. confirm release docs include detailed conformance analysis:
   - current score and gap tables
   - score trend and delta charts
   - measured wall/CPU/GPU/API/resource usage where available
   - past-goal movement and effort actually spent
   - next-goal estimates and expected resource classes
5. build the lane so `conformance-dashboard.html`,
   `conformance-dashboard-data.json`, and their `assets/` copies are included
   with the game, platform guides, and release dashboard
6. publish hosted `/dev` for integrated hosted review
7. promote hosted `/beta`
8. verify hosted `/beta`
9. complete any required docs pass for the release line
10. complete the architecture/code review cycle and ensure every review issue
    is addressed or explicitly dismissed in `review-dispositions.json`
11. confirm or hand off release authority intentionally
12. approve hosted `/beta`
13. promote and publish hosted `/production`

## Conformance Dashboard Release Boundary

The read-only conformance dashboard is now part of the Platinum release path.
It should ship with hosted `/dev`, hosted `/beta`, and hosted `/production`
whenever the game/platform bundle moves.

That does not mean the full ingestion framework is a public platform surface.

Release boundary:

- publish the dashboard and its compact data file as platform release assets,
  including the `assets/` copy used by the public Pages deployment
- expose the bundled read-only dashboard from the game settings/configuration
  panel in hosted `/dev`, `/beta`, and `/production`
- keep the public mirror Pages workflow aligned during production publish so
  top-level guide and conformance files are included in the deployed `_site`
- keep raw ingestion workspaces, source-media extraction, candidate clips,
  unreviewed traces, and annotation notebooks engineering-owned
- expose ingestion only as summarized release evidence unless a future
  Root-gated evidence browser is intentionally designed and approved
- keep metric definitions and reference truth owned by the game/application
  while Platinum owns the presentation and lane delivery contract

## Hosted `/dev` History Rule

By default, we should move hosted `/dev` forward in place rather than maintain a
separate public archive lane for every `/dev` build.

We already preserve `/dev` history through:

- git commits and branches
- build metadata
- release notes and dashboards
- the quality scorecard
- committed docs explaining why a new `/dev` replaced the prior one

Create a dedicated `/dev` archive only when:

- a milestone build needs to stay publicly inspectable
- a comparison build is needed for a major tuning effort
- a recovery or incident review needs a preserved hosted snapshot

Otherwise, move `/dev` forward and keep the record in git and committed release
artifacts.

## Policy Intention

The goal is not to create ceremony for its own sake.

The goal is to make sure:

- automation catches what it can
- hosted lanes are explicit
- docs and release surfaces stay aligned with the product we actually ship
- the quality score becomes part of release notes, not just a local experiment
- release decisions account for conformance return on compute/time investment,
  not only subjective polish intent
