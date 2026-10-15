# Beta Candidate Readiness

Updated October 15, 2026. Prior baseline: cf0e7a666067ede385865ba02e73d1454eb132d1.
Scope: Aurora correctness and release hardening. No beta or production publication
is authorized by this preparation packet. Stage 7 remains paused.

## Status

October15: step6 exact frozen beta checks PASS. Both games, 13 page policies,
public channel/account surfaces, ordinary results/restart, settings persistence
and six tracked security observations checked. Step7 automated longer-play
checks PASS: 600 browser seconds toStage159, 120 real seconds Stage3->27, no
runtime fault and measured effects signal. One unseeded tour is not all-seed,
perfect-route or original-speed acceptance. Live login and human listening are
still unverified; publication acceptance is held. Human authorized step8 subject
to checks, not production. No beta or production was published.
Music playback acceptance FAILED in two browser surfaces: default YouTube
playlist reports unavailable while Aurora says playing. This is a confirmed
state mismatch, not yet a diagnosed provider/source defect. Investigate before
publication; changing runtime/playlist source requires a new validated freeze.

Frozen delivery now has a guarded no-rebuild route, with full preflight plus
inventory/Git-path/blob/mode checks and mandatory post-push hosted-byte checks.
Real beta preflight and staged dry run PASS at pushed2412e8fd, without public
push or package mutation. Music/live-auth acceptance still blocks release.
The existing alternate playlist also reports unavailable in the automated
browser; compare HTTPS/provider/browser behavior before changing source IDs.
Full results are recorded in
analyses/beta-acceptance-oct15/REVIEW.md. Use publish:beta:frozen only after
acceptance; normal publish:beta would replace the freeze. Beta is NOT READY
until remaining acceptance and real gates pass. No gameplay source changed.

October 14 steps 4 and 5 COMPLETE. Hosted DEV is
1.4.1.2+build.1195.sha.8e93394b. Preflight, publish gates, hosted identity and
public-theme browser smoke passed. All 22 artifact changes are dev-only;
hosted beta1.4.1-beta.1 and production1.4.1 are unchanged.
Local beta1.4.2-beta.1 uses the same clean source and is frozen read-only with
599-file checksums and tool provenance. Tracked security observations: zero.
Private reference-audio hash matches: zero across 50 private audio files.
This is not full beta acceptance. Current packet: analyses/dev-beta-oct14.

Remaining ordered path:
6. Test the exact frozen beta package: runtime, assets, security and gameplay.
   Player benefit: detect packaging faults before players receive the candidate.
7. Test sustained play, live login, settings persistence and audible public audio.
   Player benefit: verify complete sessions, not only a short startup.
8. Resolve exact-byte delivery, obtain explicit beta approval, then publish and
   verify beta through release gates. Current publish:beta rebuilds/re-promotes;
   it cannot be assumed to publish the frozen bytes. No bypass is authorized.
   Player benefit: the released candidate is the one that passed testing.
No beta/production publication is authorized. Beta remains NOT READY.
These results supersede historical pending step4/5 statements below.

October 14: steps 4 and 5 authorized. Prepare hosted dev1.4.1.2 and verify it,
then assign/freeze a local beta candidate only. Hosted beta/production must not
change. Exact-package/security/runtime and sustained-play/live account/audio
checks remain later steps. Beta publication is NOT authorized or ready.
See analyses/dev-beta-oct14/REVIEW.md for the current release packet.

October 14 step 3 COMPLETE at 5e968bfd. Local dev preflight passed. Sanitized
source was pushed and fetch-verified. The approved private iCloud copy passes
100 archive checks and recovery. The provider confirms 108 files uploaded with
no errors. This is not a second-device restore test. No gameplay change or hosted
game-lane publication occurred. The docs-only follow-up also needs final gate and
source verification. Dev security is advisory, not beta security clearance.
Next: step 4 authorized dev publish and hosted review, after checking dev iteration
and release notes. Then step 5 exact beta freeze; step 6 package/security/gameplay;
step 7 sustained play, login/settings/audio; step 8 explicit beta approval and
publication. Beta remains NOT READY. Details: analyses/dev-gates-oct14/REVIEW.md.
Final gate and backup receipts are retained privately.

October14 step3 is in progress. First preflight refreshed stale evidence and
stopped on generated dirtiness; no gameplay change, push or hosted publication.
Correction: main/origin equality is a coded beta/production requirement, not a
DEV preflight prerequisite. Our delivery plan still requires sanitized-source
push/verification before hosteddev. Local DEV gates can be prepared first.
Private-backup confirmation/verification remains open before that source push.
Dev security is advisory and not equivalent to beta-package security acceptance.
See analyses/dev-gates-oct14/REVIEW.md for exact run results and open conditions.

October 14 step 2 COMPLETE locally. main fast-forwarded to sanitized14607bed
from fresh remote181d8e29; both full-range reviews approve local integration.
Clean build1.4.1.1+build1191.sha14607bed, index7876635a...935b13. Fresh34blue,
10clearance,37/33/37hit replays and selected platform/guard/audio/combat checks
pass. No new gameplay source changes. Localhost serves this integrated build;
the docs-only report follow-up retains that exact tested runtime identity.
No push or publication; main is ahead of origin and cannot pass final publish
readiness until approved sanitized-source push/fetch equality is established.
Private off-machine backup remains unverified; iCloud-copy permission pending.
Step3 ordering: local freshness/review checks, verified private backup, explicit
source-push authorization, push/fetch equality, final clean dev preflight. Then
step4hosteddev;step5exactbetapackage;step6package/security/gameplay;step7soak/live
login/settings/audio;step8explicitbetaapprovalandpublication. Beta is NOT READY.
Evidence: analyses/main-integration-oct14/REVIEW.md and summary.json.

October 14 step 1: sanitized-delivery approach approved and prepared locally on
codex/macbookpro-sanitized-delivery-oct14 from origin/main 181d8e29. Accepted
runtime/tool bytes are unchanged from preserved 7ec2c98b; changed evidence/docs
are sanitized with recoverable private originals. See analyses/sanitized-delivery-
oct14/README.md. This is not main integration or a fresh runtime gate pass.
Private archive local recovery is verified; off-machine backup is not verified.
Next recommended action is delivery-range review/current-main integration under
normal coordination, then dev gates and hosted dev review. No push or publish.
All exact beta-package/runtime/soak/live account/audio checks and final approval
remain required. Beta is NOT READY.

October 14 dev gate attempt: BLOCKED before push or publication. Preflight
refreshed stale conformance/review outputs and stopped on generated dirtiness.
No source gameplay changes. PUBLIC source-repository audit also found repeated
test-account email metadata/local filesystem paths and three 68-69 MB historical
raw reports. Website lane selection excludes raw evidence but source history
does not. Resolve source-delivery privacy/storage before integration/push.
Recommended: retain preserved local history and build a separately reviewed
sanitized delivery branch; no history rewrite or public push without disposition.
Generated gate outputs are preserved for inspection, not a release pass.
See analyses/dev-readiness-oct14/REVIEW.md for the ordered remaining beta path.
Beta remains NOT READY. No beta or production publication is authorized.

October 14 checkpoint: source review and local freeze are COMPLETE under
CANDIDATE_FREEZE_OCT14.md. Source commit 5d76dc73, clean build 1227, development
index 6074264c...45d04b. Fresh 34 blue, ten clearance, three retained-hit replays
and early motion checks pass. Both bounded independent reviews approve.
See analyses/candidate-freeze-oct14/REVIEW.md. A documentation-only follow-up
does not change the frozen runtime identity. Before any push, review the three
68-69 MB historical reports for storage/private-artifact handling.
No beta number is assigned. Package 1.4.1 and local
development line 1.4.1.1 remain unchanged; use the clean source SHA/build identity.
The prior path evidence below remains valid for its exact recorded source bytes.
Final clean-build regression evidence is recorded separately. No hosted
lane changes or release-readiness claim are part of this step.

October 13 current: NOT BETA-READY. Measured primary-theme path blockers are
CLOSED LOCALLY. Both parallel blue repairs are accepted after cross-review.
Combined 34 blue cases and ten green/yellow cases pass: 40 full-view targets,
zero blue contacts/row-risk samples, 37/33/37 recorded hits with legal inputs.
Largest blue join: 149.459 -> 4.718px. Maximum exit step: 8.661px, below the
12px/60Hz engineering budget. Early motion-profile/build/syntax/diff pass.
Source 1f5df7a1...dac31, renderer 0dc98523...c036cc, localhost 0ba6d5a1...d5ce2,
build 1226 dirty. Evidence: analyses/blue-path-oct13. No commit/push/publication.

Stage 35 has nine reviewed hit-time changes from an earlier interception,
with all 33 killed IDs, score and 48 shots retained. Other saved replays remain
ordered-exact. An additional real Stage 31 late hit is preserved. Later no-fire
stages last 2.4-3.2s longer with visible play; empty wait is about 0.033s and
spawn cadence remains 4.433-4.434s. Some individual full-view windows lose up to
0.350s (A) or 0.300s (B), explicitly accepted provisionally. Exact original
speed, every seed/dual ship and perfect feasibility remain unproved. Unsupported
route variants retain baseline behavior. Lab fallback extents are checked,
while full lab-mode timing remains outside the primary-theme gate. CSP repair
remains closed; repeat exact-package checks after freeze.

### Remaining Work And Planning Allowance

| Work | Player outcome | Active effort estimate |
| --- | --- | --- |
| Range review, checkpoint and source/version freeze | A reproducible candidate with known scope | 2-4 hours |
| Authorized dev gates/review and exact beta package/security/runtime checks | Reviewed gameplay survives packaging and public boundaries | 2-4 hours |
| Bounded soak, live sign-in, audible audio and final approval review | Reliable repeated play, settings and sound | 2-4 hours |

Plan approximately 6-12 remaining active engineering/review hours with focused
sessions and bounded sustained-play checks. The parallel path packet is complete;
it is not a scheduled/background commitment or a release-date guarantee.
Approval/account-access waiting, hosted/security faults or fresh gate failures
extend elapsed time. Prepare range/release review and package-check inputs in parallel;
do not validate final bytes before the source is frozen. Exact original lane
geometry, broad perfect-pilot optimization, exhaustive seeds/endless stages,
Stage7 and architecture refactoring remain outside this beta critical path.
Demonstrated infeasibility or lost valid shots remain correctness blockers.

If a new gameplay defect is demonstrated during candidate checks, open a measured
bounded repair or scope decision. Current measured blue blockers are resolved.
No beta/production approval is implied by these estimates or local passes.

The October12 entries below are historical and superseded by this status.

October 12 current: NOT BETA-READY, but a bounded gameplay repair is now accepted
locally. The green/yellow clearance envelope plus wholly-offscreen lifecycle
correction removes the confirmed scoped ship-row overlaps. Matched normal-key
shots remain 37/33/37 kills at31/35/39, with identical shot/kill/loss events.
Stage3/27 controls and unrelated paths remain exact. The new two-theme gate
passes ten cases, with40 full-view targets and no scoped contacts or combat.
It verifies actual resolved theme and no player firing. Baseline and first-
revision negative checks show that it detects contacts and the invisible tail.

Final later empty tail0.216s is below baseline0.233-0.250s; post-clear cadence
is4.433-4.434s. Later no-fire challenges last about0.4s longer, with additional
visible opportunity rather than extra empty waiting. This pacing is provisional,
not an original-game measurement. Evidence:analyses/middle-path-oct12.
Source5ec66e40...13c89; localhost bundleb2177360...126096, build1226 dirty.

Next: repair the remaining later-green discontinuous joins, then remaining blue
exits/ship contacts, preserving this clearance and the actual shot witnesses.
Do not restart broad pilot optimization. These defects still block beta.
Then freeze/review source and version, obtain authorized dev review through
existing gates, validate exact beta package/soak/auth/audio and request beta
publication approval. No release, commit or push occurred in this packet.

The following status predates the accepted middle-path repair.

October 12 latest: NOT BETA-READY. The single later-stage exit candidate was
tested and rejected. Centre contacts became zero at 35/39/63/127, with full
entry and unchanged result cadence, but matched normal controls lost three
previously demonstrated kills across Stages 35/39. The candidate was not
integrated. The accepted localhost source and bundle remain unchanged.

The new normal-arrow column check exposes an acceptance gap: Stage 31's
previous zero-contact result was centre-only. Left/right probes produce 3/1
contacts at Stage 31, 4/1 at Stage 35, and 6/1 at Stage 39. Several occur before
the exit phase. No ship loss is implied, but the visual/no-contact goal is not
met. An exit-only repair cannot fix the preserved middle-path crossings.
Evidence and independent rejection: analyses/later-exit-oct12.

Recommended next decision: permit a bounded, measured middle-path plus exit
repair for the affected green/yellow paths. Define first-risk intervals and
reference relationships before editing; preserve full entry and demonstrated
shots. Keep Stage 3 keepers and unaffected paths unchanged. Test centre and
side positions, then representative later reuse. Do not continue endpoint
sweeps or assume that Stage 31 pattern reuse is already safe. The alternative
is an explicit nonlethal-contact waiver; it is not recommended or authorized.

After gameplay acceptance: source/version freeze and review, authorized dev
gates/publication, exact beta packaging and soak/account/audio checks, then
explicit beta approval. CSP repair remains closed; no new release was made.

Historical status before this rejected trial follows.

October12 latest: steps1and2 completed. CSP gap CLOSED for the13 top-level beta
HTML pages. The repaired full599-file package passes browser policy/ordinary-flow
checks; stronger gate reproduces the old two-page failure and accepts the fix.
Only those two pages changed; index hash alone is unchanged. Full inventory
digestee45ae7978f438b667ee30a892d29668e0581641aa0c3fc7a947a39f081051d2.
Evidence:analyses/beta-csp-oct12. Host headers/nested assets remain outside this
bounded fix. No deployment or new gameplay change occurred in these two steps.

Late-game review is COMPLETE, with FAIL disposition for current35/39 exits:
fresh captures reproduce3/7 contacts in both themes, including visible ship
overlaps. Separate exit joins jump85-121pxblue/about219pxgreen. Nonlethal behavior
does not waive visual correctness. Stage31 stays0contacts. Its disclosed
shorter full-view durations remain provisional trade-offs with preserved real
shots; perfect feasibility remains unproved, not demonstrated impossible.
See analyses/late-exit-disposition-oct12 and late-contact-visual-review-oct12.

Immediate next action:one bounded shared blue/green exit-continuity candidate
for later failing paths, preserving preexit motion and Stage3/31. Accept only
with readable safe exits, full entry, actual shot witnesses and cadence; verify
35/39 plus later63/127. Player benefit:missed targets leave smoothly without
passing through the ship. Broader bounded pattern reuse remains a content-choice
fallback if this fails; do not start ten separate endpoint experiments.

Then freeze/review source and version, run authorized matchingdev, repeat exact
beta package plus soak/liveauth/audio, and request beta publication approval.
Assessment:packaging risk is reduced; gameplay blockers are now specifically
classified. NOT beta-ready. No automatic waiver, version assignment or publish.

The following status and numbered sequence predate this completed follow-up.

October12 completed: Group5 bounded repair integrated and actual local beta
package rehearsal passed. Lead source06 is1b442dfa...167ce532; development bundle
9c320d50...85ef4fa, beta rehearsal e9322289...1ccf0d3. Localhost rebuilt14:32EDT.
Stage31 contacts are now0 (previous2), all40 enter fully, recorded input retains
37kills/80shots/0losses and identical events. Clear21.417 ->spawn25.850 gives
4.433s cadence. Group5 full-view time decreases0.183-1.117s per target; accepted
for provisional local use, not perfect feasibility or exact original fidelity.
Stage35/39 remain3/7 nonlethal contacts; unchanged is not a release disposition.

Rehearsal label1.4.1-beta.1+build.1226.sha.cf0e7a66.beta was generated locally.
No next release version was assigned. All ordinary-flow/public-boundary checks
passed, with no script errors, missing assets or private-audio requests.
See analyses/beta-rehearsal-oct12/REVIEW.md and runtime.json. Controlled-clock
smoke does not cover live sign-in, audible/streamed music or a long soak.
The promotion tool's clean metadata is not source cleanliness. Source remains
dirty; no commit, push, hosted dev, beta or production publication occurred.

Recommended remaining sequence:
Before freeze, repair the P2 CSP coverage gap in releases.html and
project-overview-slides.html, or record an explicit release disposition. The
independent audit found no exact private-audio bytes (599files/50privatehashes),
but the gate missed those two unprotected auxiliary pages. Keep hosted-header
and backend-RLS limitations explicit; do not restore public score writes.

1. One bounded gameplay acceptance packet: review later-stage contacts and
   provisional exit opportunity trade-offs. Player benefit: fair readable exits.
   Use existing evidence and adopted bounded late-game policy before new tuning.
2. Close the local public-package security audit and player-copy limitations;
   freeze scope/version and review local changes plus retained range coverage.
   Player benefit: consistent controls, sound and honest account/score messages.
3. Commit/integrate/push only with the required authorization, run dev gates,
   publish the authorized dev candidate and verify identity. Player benefit:
   the reviewed game and release candidate are the same game.
4. Repeat exact beta packaging after freeze, then bounded soak, live account
   and audio checks. Request explicit beta approval only after those gates pass.
   Player benefit: confidence in repeated play, settings and sign-in.

Assessment: meaningful forward progress. The specific Stage31 contact blocker
is closed for provisional local review and package behavior is now measured.
Do not reopen pilot heuristics or expand reference census on the beta critical
path. Do not call the candidate beta-ready while the decisions above remain.

The following October12 status predates the Group5/rehearsal result above.

Current assessment: NOT beta-ready. The lead checkout is dirty and37 commits
ahead of the locally recorded origin/main (no new fetch in this assessment).
Localhost build1226 matches dist/dev by SHA256 cda9e24b...decf8a6 after the14:12
rebuild. The build number did not advance; source/package hashes identify it. No current
dist/beta/build-info.json exists. Package/manifest version remains1.4.1;
1.4.2-beta.1 is a proposed candidate version, not assigned or published.

The provisional green and Group1 exits reduce Stage31 no-fire contacts4to2.
The remaining two are nonlethal blue Group5 crossings. A new full-field Group1 reference
shows final outward lower-side departure, so upward Group3/green evidence must
not define that exit. Group1-only trial passed and is integrated for localhost:
40/40 entry, same37 pilot kills/80shots/0losses, unchanged stage completion.
Three targets lose0.483/1.383/0.733s total full-view time; recorded early shots
remain intact, universal shot-opportunity preservation is not established.
See analyses/blue-group1-reference-oct12 and stage31-blue-contact-diagnosis-oct12.

The normal-input feasibility instrument achieves37/40 with0losses on one fixed
Stage31 artifact/seed. Two controller experiments did not improve hits. Retain
the instrument; stop heuristic optimization on the beta critical path. Failure
to obtain40/40 does not demonstrate an impossible stage. Perfect feasibility
remains a gameplay constraint; a perfect heuristic pilot is not a release gate.

## Current Release Boundary

- Required: resolve confirmed inappropriate Stage31 crossings and discontinuous
  exits under the adopted acceptance policy; preserve entry and real shots.
- Required: review provisional green/combat behavior, freeze reproducible source,
  validate exact public beta bytes, ordinary flows/audio/account boundaries,
  private-byte exclusion, security dispositions and a bounded soak.
- Explicit disposition: other observed nonlethal contacts, firing-related blank
  intervals and documented residual security findings. Record severity and
  player effect; do not silently waive them or treat all telemetry as a defect.
- Research beyond this beta: exact geometry for every original lane, complete
  reference census, further pilot optimization and optional endless complexity.
  A demonstrated impossible target or loss of usable shooting time remains a
  correctness issue regardless of this research boundary.

## Plan Assessment

Evidence quality has improved substantially: actual input replay, target IDs,
source/package hashes and original survivor frames replace indirect metrics.
Release progress is slower: many experiments, one provisional exit improvement,
and no current beta package. Repeated endpoint guesses and pilot tuning have low
recent return. Use one affected-group reference, one scoped candidate and one
acceptance decision. Keep release/package review parallel to gameplay work.
After final gameplay acceptance, stop adding research requirements and freeze
the candidate. Public package behavior is the next major independent risk.

Next parallel lane: prepare an isolated local beta-package rehearsal from an
identified development artifact while remaining exit work proceeds. Record its
source hashes and provisional status; promotion metadata alone does not prove a
clean source. This can expose public audio/settings/account-boundary faults
early. Repeat candidate-specific package checks after source/version freeze.
No rehearsal satisfies hosted-dev matching or publication approval by itself.
For later stages35/39, evaluate the adopted bounded pattern-reuse policy before
starting further bespoke geometry work. Any behavior change needs its own
measured acceptance; it is not an automatic waiver of existing defects.

## Historical Status (October 6-8)

The entries below retain their original evidence context. Statements about a
clean checkout, four local contacts, or no provisional design are historical;
the current status and later user-authorized local review above supersede them.

October8 exit trial rejected: contacts4->0 but9 targets lose continuous full-view
time. Source restored; details in reference-artifacts/analyses/exit-trial-oct08/
REVIEW.md. Exit blocker remains. Bounded combat scaling integrated locally with
VM and full-runtime passes; long-run fairness and current package checks remain.

October 7 test implementation: check-public-package-runtime now asserts that
an otherwise valid unprivileged Stage31 schedule-trial request throws the
expected guard error before starting or replacing runtime and leaves no override.
Hypatia reviewed the actual diff; no blocking finding. Syntax/diff pass only;
no beta artifact exists for execution. Do not count this as package acceptance.

October 7 independent packaged-beta audit (Hypatia, read-only at cf0e7a66):
dist/beta/build-info.json is absent. Dev success is not actual beta-package
acceptance. Promotion strips harness exports, test accounts and reference audio;
validate the resulting bytes with check-public-package-runtime --root dist/beta
--expected-sha <candidate> --flows. Existing schedule-trial rejection uses a
synthetic channel fixture; add a bounded actual-package assertion when packaging.
Beta security gate can exit successfully despite findings or absent artifacts;
require explicit SEC-001 through SEC-006 disposition and full package hash checks
for renamed private audio, not exit status alone. No package checks ran in this
audit. Freeze version and candidate first, then local promotion, exact-package
smoke, account/audio/soak limits, and existing final publish gate. No publication.

October 7 scope update: unique endless levels are not required for beta.
See AURORA_LATE_GAME_POLICY_OCT07.md for bounded pattern reuse after a provisional
Stage 30 boundary. Existing exit acceptance remains required. Raw-stage firing
calculations need a focused audit; no late-game failure or repair is yet measured.

Reference acquisition advanced on October7: Stage31 candidate screened through
23-hit result and subsequentStage32 banner. Five survivor samples show upward
turning; exact wave identity, original settings and complete numerical exits
remain open. See STAGE31_SURVIVOR_SCREENING_OCT07.md. Beta blocker is now
trajectory measurement/repair acceptance, not total absence of missed footage.
No gameplay improvement is claimed from this evidence step.

Human selected original missed-target footage first on October 7. No
noncanonical exit design is authorized. Initial discovery lead:
https://galaga.group/micro31/ (defines Stage31/Challenge8 and arcade settings).
This page is not exit evidence; candidate recordings still need inspection,
edition/settings identification, surviving-target tracking and provenance.

October 7 repair feasibility decision: no source candidate selected. Lead and
independent reviewer inspected current geometry and four rejected experiments.
Exit anchoring previously reduced lane 7 full-view dwell from 1.967 to 0.867
seconds; middle correction reduced sampled green hit witnesses from 28 to 14.
Removing the 48px bias changes trajectories beyond the observed contact frames
and does not establish safety elsewhere. Do not repeat these repairs.

Required decision: obtain identified surviving missed-target original footage,
or approve an Aurora-specific exit contract without an original-fidelity claim.
The latter must define corridor, continuity/speed, duration and permissible
opportunity trade-offs before testing. Current scheduled Stage 31 needs matched
per-target dwell and real firing witnesses; earlier timing packets cannot
silently become its acceptance thresholds. A question was presented to the
human; no answer is assumed. Beta remains blocked, not source-repair complete.

Fresh `harness:check:challenge-motion-profile` passes. It checks first-challenge
motion and early-stage contracts/spacing; it does not validate late-stage exits.
No source tuning, build refresh, push or publication occurred in this decision.

October 7 follow-up: current contact discovery/replay passes in both themes
(eight sequences, 56 captures). Evidence is in
`reference-artifacts/analyses/challenge-contact-sequences/2026-10-07T13-22-54-573Z-cf0e7a66/REVIEW.md`.
Two inspected post-contact crown frames show clear ship overlap; two are
edge cases, not automatically accepted. No gameplay repair has been accepted.

The independent integration-range review found no auth/score source changes.
Describe this as a correctness and public-boundary patch, not new account or
score-security hardening. Include cadence/audio handoff, entry geometry,
Guardians capacity and private-byte exclusion subject to combined validation.
Stage 31 schedule acceptance is conditional. Optional dev launcher/trial hooks
require public negative tests; omit them only through a separately reviewed
candidate, not an untested last-minute deletion. Guardians preview exposure
already exists on main; it is not introduced by this packet.

Not beta-ready. Hosted dev is build 1224 / 7b16af66, with a known-issues review.
The lead branch is clean at the audit baseline and is 37 commits ahead of
origin/main after fetch, with no remote-only commits. This is not an approval
to merge or push all 37 commits without reviewing their release scope.
Release authority currently matches MacBook-Pro. Older iMac authority notes
must not override the current authority check.

## Evidence Disposition

Hosted Stage 31 has 40/40 full entries in the no-fire run and 4.405-second
clear-to-spawn timing. Four nonlethal contacts remain open: approximately
7.957, 11.395, 21.482 and 21.699 seconds. No enemy shots, attack starts or ship
losses were observed. Individual temporal and visual review is required;
nonlethal collision-box contact is not itself an automatic failure or pass.

The Professional run has a 1.167-second interval with no targets. The archived
successful-firing reference also has sampled intervals without intact targets:
the 248-252-second sheet shows explosions/score labels at 248.6/248.8 seconds,
no intact targets at 249.0/249.2, and new entry at 249.4. This is qualitative
evidence only. It does not establish an exact pause tolerance, fully blank
duration, missed-target exit path, or perfect-route feasibility. Do not compress
the accepted schedule merely to remove this observed firing-related interval.

Reference video, private and persisted:
`private-artifacts/repo-mirror/reference-artifacts/analyses/challenge-visibility-oct03/challenge-all2.mp4`.
Verified SHA-256: `8d29ea711d09d243a2904bf9538981d97fe1fa323e4f920177688fa2b4c4c840`.
Sheet provenance:
`reference-artifacts/analyses/reference-wave-previews/2026-10-05T12-08-15-502Z-d686a350/manifest.json`.
Hosted observations:
`reference-artifacts/analyses/hosted-stage31-review/2026-10-06T15-26-10-376Z-7b16af66/README.md`.

## Required Tasks

1. Complete the scoped Stage31 Group1/5 exit repairs and acceptance. Repair only
   confirmed inappropriate ship overlap, with measured path evidence and
   regression checks. Player benefit: targets do not pass through the ship in
   a way that looks wrong. Do not use the old fixed contact-frame capture as
   current evidence; the accepted schedule changed its event timing.
2. Freeze the candidate scope and version. Propose `1.4.2-beta.1` for the
   correctness patch, subject to version-policy and historical account/score
   scope reconciliation. Player benefit: a clear, limited set of fixes.
3. Confirm coverage of the retained 37-commit range review, close review gaps,
   and review accepted local changes. Then obtain source push authorization
   and integrate into clean main matching origin/main. Player benefit: beta
   uses one reproducible source baseline, not a mixture of experiments.
4. Refresh candidate-specific evidence and run dev preflight. Obtain dev publish
   authorization and verify the matching hosted candidate. Player benefit:
   the reviewed game is the game selected for beta.
5. Prepare the actual beta package without publication. Inspect the resulting
   bytes and identity. Do not treat development or synthetic beta fixtures as
   packaged-beta acceptance. Player benefit: correct assets and public behavior.
6. Test that package: public audio, private/harness exclusion, account boundaries,
   score submission policy, settings, boot/restart/Watch and game switching.
   Review security observations explicitly, even where beta gates only warn.
   Player benefit: safe accounts and working controls and sound.
7. Run a bounded soak, independent review and beta preflight against that exact
   candidate. Record remaining issues and their dispositions. Player benefit:
   fewer failures during ordinary repeated play.
8. Request explicit beta publication approval only after tasks 1-7 pass.
   Verify hosted identity and smoke after publication. Production is separate.

## Parallel Work

Fresh local check: `npm run harness:check:challenge-collision` passed. Its
Stage 3 scenario recorded zero bullets, attack starts and ship losses, and one
nonlethal contact. This protects the no-combat contract; it does not dispose
the four Stage 31 contacts or validate a beta package. `git diff --check` passed.

Reference/contact analysis and read-only release/security review can run in
parallel. Integration, artifact generation and packaging must have one writer
and run in dependency order. A multi-seed Professional sweep remains deferred
until cadence and visibility acceptance is complete. Do not use publish:beta
as a preparation command: it publishes.

Independent beta audit: Nash, baseline cf0e7a66, read-only. It confirmed main
freshness and hosted-dev identity requirements, and the lack of actual current
beta-package validation. No specialist ran a build, promotion or publication.
