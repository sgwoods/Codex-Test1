# Dev Publication And Local Beta Freeze

Date: October 14, 2026, America/New_York.
Baseline: pushed clean main 7dab1d79.
Authorized: step 4 gated DEV publication/review, then step 5 local beta assignment
and exact package freeze. No beta/production publication or beta approval.

## Completed Results

Clean source: 8e93394bbc290d374d005cf13206e42e8c099b78, main, pushed.
Step4 PASS: preflight, development PDF, review/publish gates, hosted identity,
required hosted assets and public-theme browser smoke. First preparation PDF
navigation timed out; unchanged retry passed. Publication wrapper PDF passed.
Public artifact commit f7be418 changes 22 paths, all under dev/. Full before/after
blob comparison confirms every non-dev file unchanged, not only build labels.

Hosted DEV: 1.4.1.2+build.1195.sha.8e93394b, development lane.
Local/hosted index SHA256:
0b0298b86f88456312929878ebf5b8a8b689fefa94bb9382807d3d5df5c9cddd.
Localhost :8000 matches the same dist/dev bytes. Browser screenshot inspected:
game canvas, player ship, enemies and HUD render. Smoke exercised normal start,
movement, public settings, and playerShot/gameStart cue activity. Dummy login
fields were filled but not submitted. This does not prove live authentication,
audible quality, sustained play or a fresh Stage31 conformance review.

Hosted beta unchanged: 1.4.1-beta.1+build.1168.sha.edd6a736.beta (June11).
Hosted production unchanged: 1.4.1+build.1164.sha.54398ff5 (June11).

Step5 PASS: unchanged canonical promotion and beta PDF render produced local
1.4.2-beta.1+build.1195.sha.8e93394b.beta from main@8e93394b clean.
The DEV input and beta output are preserved read-only, with a full per-file
SHA256 inventory, source identity and tool hashes. 599 beta files, 86,208,738 bytes.
Beta index SHA256:
72f465c5ca9e53cd9cf69ebf34c0cc5be665a129ef4c1fca8b416210c775d313.
Canonical JSON inventory SHA256:
9c858c85c5557c08590d7cbf05823c957c43dba92626dfda4cb3ae6f46e04946.
Private primary evidence: private-artifacts/beta-candidate-1.4.2-beta.1-oct14
contains beta/, dev-input/, inventory.json and freeze-receipt.json.
Frozen package/DEV directories are owner-read/execute only, files owner-read
only; the owner can still change permissions. Hashes detect subsequent changes.

All beta file hashes were compared against the 50 private reference-audio files
in the preserved DEV input: zero matches; no reference-audio payload paths.
Beta metadata has no configured test-account emails/user IDs. Exported browser
harness assignments are absent. Existing beta security scan observed zero of
six tracked issues. Its beta status is advisory, not a comprehensive security
clearance or asset licensing audit. Complete exact-package tests remain step6.

## Next Actions

6. Test this exact frozen package, not a new build: runtime, assets, security,
   gameplay and channel gating. Goal: prevent package-only player failures.
7. Sustained play and live login/settings/audible public audio. Goal: complete,
   reliable player sessions. No live credentials were used in the hosted smoke.
8. Resolve exact-byte delivery before explicit approval and beta publication.
   Existing publish:beta rebuilds DEV, promotes and renders PDF. It can change
   source/timestamps/bytes and cannot blindly publish this frozen candidate.
   Either provide gated delivery of accepted frozen bytes or freeze/test the
   final wrapper output and re-establish hosted-DEV source correspondence.
   Do not bypass release gates, relabel generated identity or publish raw.

No new gameplay change or additional gameplay quality gain is claimed in steps
4/5. They expose accepted repairs for shared review and create an exact test
target. No beta/production publication or beta approval occurred. NOT BETA-READY.

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
not repaired by hand-editing output. The package is now frozen as recorded above;
complete exact-package validation is still open.
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

## Independent Review

Two bounded read-only specialists approve step4 and the local step5 freeze.
The publication reviewer independently compared the full public Git trees,
unchanged beta/production metadata and DEV Git blob hash. Its initial evidence
did not include an independently retained HTTP index response; the lead then
retained that response and capture receipt privately and confirmed the same
hash. The freeze reviewer rehashed all599 package files, tool hashes and all50
private-audio comparisons. Neither review is beta publication approval.
Both identified the exact-byte publication constraint as a later requirement.
Raw review messages and capture receipts remain private; summary.json records
the accepted scope. A documentation-only result commit does not change the
frozen/published source identity8e93394b or authorize a rebuild/publication.
