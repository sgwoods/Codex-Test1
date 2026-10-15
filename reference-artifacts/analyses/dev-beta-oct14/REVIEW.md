# Dev Publication And Local Beta Freeze

Date: October 14, 2026, America/New_York.
Baseline: pushed clean main 7dab1d79.
Authorized: step 4 gated DEV publication/review, then step 5 local beta assignment
and exact package freeze. No beta/production publication or beta approval.

## Dev Preparation

Development iteration advances to2, display version1.4.1.2. Platform/application
versions stay1.4.1. Integrated package/lock version is assigned1.4.2 before the
shared source is built and published, so canonical promotion can later assign
distinct1.4.2-beta.1 without relabeling generated output or changing tools.
A dated1.4.1.2-dev note
describes accepted player improvements and limitations, rather than falling back
to stale production notes. No new gameplay source change.

Before-state evidence: dev1.4.1.1+build1224.sha7b16af66 (October6),
beta1.4.1-beta.1+build1168.shaedd6a736.beta (June11),
production1.4.1+build1164.sha54398ff5 (June11). Full remote artifact-tree inventory
is captured privately before publication so non-dev files can be compared after.

Use existing release:preflight:dev and publish:dev wrappers, not raw publishing.
Inspect/commit any generated freshness changes; stop on gate failures, diagnose
recursion rather than weakening checks. Verify exact hosted dev build/lane/SHA,
public-safe smoke and unchanged protected beta/production content before step5.
Publication cannot be silently undone by a later verification failure.

## Local Beta Boundary

Existing promoter derives beta from package SemVer. Assign integrated1.4.2,
then promote the exact clean source reviewed on dev1.4.1.2 to local1.4.2-beta.1.
The dev display train and integrated candidate version are explicitly separate
domains; no unrelated platform/game version bump. Both note entries share an
accurate candidate source note. Canonical promotion retains dev-note provenance;
it does not reselect/render separate beta note HTML. This limitation is explicit,
not repaired by hand-editing output. No beta package is frozen or validated yet.
Freeze must retain the reviewed source identity, full file inventory/SHA256s,
promoter provenance, private-data/audio exclusions and immutable package bytes.
Step6 will validate that exact package; step7 will cover sustained play and live
login/settings/audible audio; step8 requires explicit beta publication approval.

Raw logs/build metadata and any account-bearing development observations remain
under owner-only private-artifacts/dev-beta-oct14. Public summaries must not
reintroduce personal paths or configured test-account lists. Existing private
archive backup is provider-confirmed, not an independent second-device restore.

No complete beta security, gameplay soak or audibility approval is implied by a
dev gate pass or a local package freeze. Beta remains NOT READY.
