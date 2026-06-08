# Beta To Production Plan

Historical snapshot: this May 2026 production-promotion record describes the
`1.4.0` public promotion path. It is not the current beta-to-production plan.
Use [CURRENT_PROJECT_STATE.md](CURRENT_PROJECT_STATE.md),
[RELEASE_SCHEDULE_AND_ISSUE_SPINE_2026-06-07.md](RELEASE_SCHEDULE_AND_ISSUE_SPINE_2026-06-07.md),
and [TESTING_AND_RELEASE_GATES.md](TESTING_AND_RELEASE_GATES.md) before any new
hosted `/beta` or hosted `/production` movement.

## Current Release State

As of May 14, 2026:

- hosted `/beta`
  - approved `1.4.0-beta.1` production-source lane
- hosted `/production`
  - live `1.4.0` public line

This means the deliberate `1.4.0` candidate family has now been promoted into
the public line. Hosted `/beta` remains the approved source lane for that move,
while hosted `/production` now carries the shipped `1.4.0` public family.

Retrospective versioning note:

- this same-family `1.3.0` production path is now treated as an exception
- future production promotions with similar quality, gameplay, conformance, and
  ingestion lift should move at least a real `PATCH` version
- only true production-failure remediation should normally reuse the exact same
  public production version

## Why This Promotion Mattered

The case for this promotion was:

- hosted `/dev` had a coherent post-production bundle with real player-visible
  and reviewer-visible value
- the public docs and dashboards had become part of the product contract, not
  just engineering support material
- the measured ship-loss audio lift was good enough to move from review into
  the public line
- the remaining known issues were next-cycle authenticity/depth work, not
  blockers to refreshing the current public family

## Production Preconditions Used

This refresh depended on all of the following from one coherent committed
source state:

1. release authority confirmed on `imacm1 / iMacM1`
2. local tree clean
3. documentation refreshed before publish
4. documentation freshness harness green
5. hosted `/dev` verified as the expected review source
6. hosted `/beta` republished from the refreshed source docs/artifacts
7. beta approval repeated against the refreshed candidate
8. `dist/production` promoted from that approved beta candidate

## Commands Used

From the authoritative Aurora repo:

- `npm run machine:bootstrap`
- `npm run machine:status`
- `npm run machine:doctor`
- `npm run release:show-authority`
- `npm run build`
- `npm run harness:check:documentation-freshness`
- `npm run publish:check:dev`
- `npm run publish:verify:dev`
- `npm run publish:beta`
- `npm run approve:beta`
- `npm run publish:production`

And then verify:

- hosted `/beta` build label
- hosted `/production` build label
- public project page sync
- post-publish machine doctor

## Required Artifact Preservation

The following artifact families remain part of the durable release record for
this refreshed public family:

- `reference-artifacts/analyses/quality-conformance/2026-05-11-b83393cd`
- `documentation-provenance.json`
- generated public project page, project guide, release dashboard, and
  conformance dashboard
- current release notes, release dashboard data, and release manifest
- current conformance dashboard source and economics source

These are release assets, not disposable scratch artifacts.

## Beta And Production Replication Expectation

For beta and production, the release-host repo should receive the full public
release package, not just the compiled game files.

That package includes:

- shipped runtime and assets
- hosted guides
- release dashboard and release notes
- build metadata
- public-facing provenance and conformance context

It does not need to duplicate the entire engineering repo.

The authoritative source for:

- issues
- planning
- harnesses
- engineering history

remains:

- [sgwoods/Codex-Test1](https://github.com/sgwoods/Codex-Test1)

## Current Risk View

Main accepted risks for this refreshed public line:

- audio identity is still the weakest high-value category
- challenge-stage arrival/novelty and level-arc depth still need the larger
  `1.4.0` pickup
- temporal sprite-motion scoring is still incomplete compared with static
  runtime-crop scoring
- Galaxy Guardians remains preview-first, not a polished second shipped game

These are visible next-cycle targets, not hidden ship blockers.

## Next-Cycle Release Direction

### Immediate After Production

- keep hosted `/production` trustworthy on the refreshed public `1.3.0` family
- keep hosted `/dev` and hosted `/beta` aligned around the `1.4.0` candidate
  family
- refresh scorecards, dashboards, and source docs whenever the next real review
  candidate is assembled

### Next Minor Release

Current likely target:

- `1.4.0`

Focus:

- stronger audio identity
- alien entry and challenge-stage novelty
- level arc and encounter shape
- boss/formation grammar precision
- visual reference grounding
- continued Platinum/Aurora boundary cleanup
- deeper ingestion-backed Galaxy Guardians evidence

### Next Major Release

A major release should still wait until Platinum is clearly hosting more than
one meaningful game experience cleanly.

Current long-term major-release threshold:

- at least two meaningfully playable Platinum applications
- same-control compliance clearly documented and proven
- pack schema and boundary naming cleaner than the current transitional state
- ingestion-driven game-owned conformance packages mature enough to support
  launch claims
- persona-vs-player or learn-by-playing tooling materially more mature

## Current Non-Destructive Readiness Checks

Current directly observed checks for this production path:

- `npm run build`
- `npm run harness:check:documentation-freshness`
- `npm run publish:check:dev`
- `npm run publish:verify:dev`
- `npm run publish:check:beta`
- `npm run publish:verify:beta`
- `npm run publish:check:production`
- `npm run publish:verify:production`
- `npm run verify:public`

## Current Release-Order Note

The refresh chain for this public line ran from accepted hosted `/dev` review
work on the authoritative source repo through refreshed hosted `/beta`,
approved beta promotion, production publish, and public-page verification.

The release record is not complete unless the public project surfaces also
reflect the same shipped family and evidence story.
