# Persona And Beta Checkpoint

October 20, 2026, America/Toronto. Lead baseline 02166971 plus local changes.
No deployment, remote account write, database mutation or source push.

## Step 1: Fresh Validation Passed

The prior Stage4-6 Professional clearance candidate passed fresh seeds85001-85010:
median56,060, every run reached Stage8+, no early destruction. Criteria frozen
before execution: median>=44,522.5, at least9/10reachStage6, no early destruction.
Input copied before execution; source/build/method hashes and outcomes are in
fresh-clearance.json. No tuning during the panel.

## Step 2: Improvements, Not Completed Calibration

Continuous collision-box clearance now applies to Expert and Professional in
normal stages4 onward. Challenges return before that filter. Professional's
normal-stage4+ effective policy uses Expert's movement, target and rescue
configuration with fireChance1. This is a full later-stage policy change, not
merely a firing-rate tweak. Opening and challenge Professional settings remain
unchanged. Harness, Watch and automated Aurora P2 select the same policy.
Human movement physics and Guardians P2 are not thereby established.

Diagnostic seeds72001-72010:
- Clearance extension with previous weights: Expert median153,550,
  Professional77,050; neither has early destruction on this panel.
- Whole-game Expert-derived Professional with reliable firing: median198,820,
  but two opening destruction losses. Rejected; snapshot/evidence retained.
- Later-normal-only version: median109,160, no early destruction. Retained for
  fresh validation, not selected as a completed skill-ladder solution.

Final frozen build, fresh seeds87001-87010, Stage1/three ships/900-second budget:

| Persona | Median score | Range | Median reached stage | Alive at limit |
| --- | ---: | --- | ---: | ---: |
| Beginner | 26,365 | 4,830-37,060 | 4 | 0/10 |
| Intermediate | 33,675 | 5,100-57,840 | 5 | 0/10 |
| Expert | 190,135 | 55,760-365,060 | 29.5 | 4/10 |
| Professional | 156,705 | 57,810-317,010 | 22 | 4/10 |

Eight Expert runs reach75k. Five Professional runs reach150k and four reach200k.
Professional is not reliably stronger than Expert, and the8/10Professional
150k criterion is NOT met. These are scores observed by gameover or the budget,
not eventual final-score distributions. Four survivors per upper tier have
about899.4seconds recorded simulation after900seconds of controlled wall time.
Fresh-panel early destructions: Expert2, Professional1. Separate paired
baseline replays are recorded in early-comparison.json and match all three
observed early losses exactly (time/stage/score/cause); do not claim universal
zero early losses. Beginner/Intermediate controller source is unchanged.

Keep the measured safety improvement locally; do not call the ladder complete.
Next work should inspect the first target/shot/movement divergence in paired
Expert/Professional runs, then test a specific controller correction. Do not
keep increasing weights or manufacture ordering by weakening Expert.

Guardians:80 diagnostic VM runs tested a universal safety/config simplification.
All weaker tiers improved, but ordering remained wrong and one Expert outcome
regressed. Rejected. A further20run comparison found Professional firing
settings on exact Expert safety reduced median14,720->13,685 and introduced
lower-tail regressions. Rejected. Existing accepted Expert source is preserved.
Fresh86001-86010remain unused. Guardians tiers are not calibrated; Wizard deferred.

## Step 3: Live Persistence Blocked

Submission success/failure behavior, signed-in result locking and the database
contract checks passed locally. These use fixtures/static contracts, not live
Supabase acceptance. The Codex tab atlocalhost8002was reported crashed; selecting
it was denied by browser policy. No alternate browser/credential workaround
was attempted. The user was asked to reload and sign in without sharing secrets.

Required live acceptance remains: normal completed run in each game, history
record, reload, separate ordinary signed-in session, same game-specific record,
and legacy Aurora retention. No fabricated test scores or cleanup deletes.

## Step 4: Reviewed Local Checkpoint, Not Main Promotion

Independent review classified the three earlier role-identifier findings as
not credential disclosures:
- supabase/add-platform-game-scores.sql:35 grants table privileges to a role.
- tools/harness/check-game-scores-migration.js:11 creates an isolated fixture role.
- tools/harness/check-supabase-data-api-contract.js:11 declares expected grants.

The scanner now recognizes only those three file/statement forms. Seventeen
executable tests exercise the actual scanner: appended tokens, changed role
identifiers and unreviewed paths still fail. Original October18 findings remain
in their committed packet. No security gate or priority threshold was disabled.
The refreshed packet reports zero automatic P0/P1; remaining P2 items concern
an inert harness HTML fixture and npm/release-script review.

Source review supports an incremental keeper, not beta approval. Thirty clearance
fixtures,79mode-parity/transition cases,11Guardians pursuit cases,17review
classification cases and score/auth/contract checks pass. An initial recorded
verification attempt stopped two browser checks at the macOS sandbox precondition;
the complete seven-command suite passed with the required browser permission.
The unchanged
professional-stage2-safety gate still fails seed51201: Professional2820 versus
Expert4250, both with zero ship losses. This failure remains a beta blocker.

The optional no-mistakes home command reports that this repository is not
initialized. Its full push/PR pipeline was not run or configured. Existing
repository release gates remain authoritative. No new publication authority.

This packet accompanies a local feature-branch checkpoint of reviewed work. Main integration
and release promotion must wait for the unresolved persona gate and live account
acceptance. A new exact beta package will be required; frozen beta.4 on8002does
not contain these persona changes. Production remains outside this packet.

## Evidence

Public JSON copies alongside this report preserve measured outcomes and hashes.
Primary local packets:
- private-artifacts/aurora-fresh-oct20/ includes the frozen initial candidate.
- private-artifacts/aurora-ladder-oct20/ includes all candidate snapshots,
  browser summaries/sessions, run.js, check-early.js and verification logs.
- private-artifacts/guardians-ladder-oct20/ includes rejected in-memory proposals,
  source snapshots, outcome/config comparisons and firing-comparison/.

Archived runner copies document how results were produced at those original
paths; they are not new installed harness entry points. No primary video
reference, game path, enemy rule, scoring rule or audio asset changed.
