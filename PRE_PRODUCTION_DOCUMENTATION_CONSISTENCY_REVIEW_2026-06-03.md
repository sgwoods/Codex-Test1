# Pre-Production Documentation Consistency Review

Date: June 3, 2026

Goal:

- review whether the current docs tell one coherent production story before any
  `1.4.1` decision

## Executive Read

Documentation consistency is improved in this pass, but it is not fully clean.

What is now cleaner:

- `RELEASE_LANE_MODEL.md` reflects the current live `/dev`, `/beta`, and
  `/production` lane labels
- `RELEASE_READINESS_REVIEW.md` now describes the current public line as
  `1.4.0`, not the old refreshed `1.3.0` family
- `PRODUCT_ROADMAP.md` now frames the project as post-`1.4.0`, with `1.4.1`
  as the next likely production candidate family
- `release-dashboard.json` no longer exposes the stale title
  `Post-1.3.0 Second Application Proof`

What still remains inconsistent:

- a large number of docs still point to the older
  `/Users/steven/Documents/Codex-Test1/...` checkout path rather than the
  current `/Users/steven/Projects-All/Codex-Test1/...` authority checkout
- some historical docs are still written as if they are current operational
  guidance rather than archived release history

## Findings

### `P1` Current release-story drift existed in active docs

Before this pass, active docs were mixing:

- current `1.4.0` live production language
- older refreshed `1.3.0` public-family language
- next-candidate wording that still read like `1.4.0` was not shipped

High-impact examples:

- `RELEASE_READINESS_REVIEW.md`
- `PRODUCT_ROADMAP.md`
- `release-dashboard.json`

This matters because production docs should answer, unambiguously:

- what is live now
- what lane is under review now
- what the next public version would be

### `P2` Historical documents are not always clearly historical

Some docs like `STRATEGIC_BETA_REVIEW.md` still contain older `1.3.0` / `1.3.0.1`
lane history. That is acceptable if the file is treated as a historical review
record, but misleading if a reader expects it to be the live current release
source.

Recommendation:

- keep historical records
- add clearer framing when a file is retrospective rather than live operational
  truth

### `P2` Absolute local paths drifted after checkout migration

There is a large path-consistency problem across many docs:

- `ARCHITECTURE.md`
- `APPLICATIONS_ON_PLATINUM.md`
- `PLATINUM.md`
- `CONTRIBUTING.md`
- `SOURCE_MAP.md`
- many historical analysis READMEs

These still reference:

- `/Users/steven/Documents/Codex-Test1/...`

instead of the current active authority checkout:

- `/Users/steven/Projects-All/Codex-Test1/...`

This is not a runtime blocker, but it weakens:

- handoff clarity
- operator confidence
- architecture review credibility
- machine-to-machine continuation accuracy

## Current Production Recommendation

Do not use the current documentation set as the final justification for `1.4.1`
yet.

The docs are now less misleading than they were at the start of this pass, but
there is still enough path drift and historical/current blending that a final
production push should wait until the high-value documentation cleanup is
finished.

## Best Next Documentation Steps

1. Normalize active operational docs to the current checkout path:
   - `ARCHITECTURE.md`
   - `APPLICATIONS_ON_PLATINUM.md`
   - `PLATINUM.md`
   - `CONTRIBUTING.md`
   - `SOURCE_MAP.md`
2. Mark historical release-review docs more explicitly as retrospective where
   needed.
3. Re-run the production-doc consistency pass after that normalization.
