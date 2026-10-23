# Conflict Repair And Gate Decision

Subsequent decision: the user approved the recommended separation. See
SAFETY-QUALIFICATION.md for the prospective protocol and current outcome.
The pending-decision wording below records the proposal before approval.

October 22, 2026. Baseline HEAD `bacb0c58`; retained controller `a27c906f`.
User authorized steps 1-4, then consideration of the alternative. This is not
authorization to change acceptance thresholds or publish.

## Current Disposition

Isolated candidate `0623392493c81d9670496eed71b3393947a7b2dc8e507ed70ec90fb842d2eb62`
repairs the recorded Stage 2 collision but fails the unchanged throughput gate.
No runtime integration, keeper declaration, commit, push, or publication.
Full-game and unused-seed acceptance remain unrun under the frozen stop rule.

## Steps 1 And 2

The encounter has two diving aliens and one distant bullet. A single selected
body can hide the other body entering the ship's lane. The initial conflict
detector considered only that selected body and failed the replay unchanged.
The refined detector considers every nearby diving body opposite the urgent
bullet and invokes observed-motion arbitration only during such a conflict.
Speed, aiming, target priorities, firing and enemy rules remain unchanged.

Independent review caught unintended Stage 2 capture-beam handling in the
intermediate version. The final candidate explicitly retains capture-budget
and beam handling on Stage 4+ only. It was rebuilt privately and retested.

| Recorded seed 93008, complete Stage 2 | Retained | Final candidate |
| --- | ---: | ---: |
| Score | 4810 | 5020 |
| Clear time | 27.917s | 23.050s |
| Kills | 39 | 40 |
| Destructions | 1 | 0 |
| Captures | 0 | 0 |

The candidate passes recorded, mirrored, left-edge and right-edge replay
fixtures. All four must pass. The baseline reproduces recorded actions and
positions exactly, and loses a ship in each transformed encounter. These are
fixed-hazard counterfactuals: alternate firing, kills and enemy responses are
not simulated. The real browser run independently confirms the recorded-seed
improvement, but not the synthetic variants or general safety.

350 executed scope cases pass: other stages/personas preserve action and
capture behavior, an empty world keeps the preferred action, and Stage 2 does
not invoke beam policy. These are synthetic scope checks, not Watch/P2 or
full-game integration acceptance.

The final candidate reproduces all three retained short-gate score/kill/loss
results. Seed 51201 still gives Professional 2820 points/33 kills versus
Expert 4250/38. This is an existing deficit, not a new candidate regression.
The gate is FAILED. No threshold was changed.

This cycle used 14 browser gameplay runs: seven on the intermediate candidate
and seven after the review correction. No 900-second score-history panel was
added, because no full-game acceptance run occurred.

## Step 3 And Alternative

Step 3 is blocked by the current gate. Do not spend unused full-game seeds
under a protocol that already says to reject this candidate.

Recommended product decision, NOT YET APPROVED:

Separate qualification of this safety repair from the requirement that
Professional beat Expert on every 16-second seed. Permit prospective
baseline-nonregression validation of the isolated safety repair:

1. Keep recorded safety fixtures, scope/lifecycle checks and mode parity as
   blocking checks. Require review of each newly introduced destruction.
2. Require no deterioration against the retained Professional on matched
   complete-stage and full-game panels. Report score, clear time, destructions,
   captures and captive destruction separately. Do not hide a new collision
   behind a higher aggregate score.
3. Preserve the existing matched full-game floors: seeds 89001-89010,
   900 seconds, median at least 326720, minimum at least 189800,
   all ten at 150k, at least nine at 200k, at most one early destruction.
4. Freeze candidate bytes and a prospective unused-seed manifest before
   validation. Use two disjoint ten-run panels for final consistency evidence.
   Require at least eight of ten Professional runs to reach 150k per panel;
   retain the 200k upside goal and report its attainment, not only a maximum.
   This is a proposed engineering screen, not population certification.
5. Keep the old Expert comparison visible as a failed diagnostic. Acceptance
   of a safety repair does not prove Professional superiority or automatically
   close persona calibration. Confirm the full skill ladder and its remaining
   gaps before a separate beta-readiness decision.

This proposal must be approved before replacing the current stop condition.
Do not relabel historical failures as passes or make a beta release from this
packet. The alternative is a scoped change-acceptance contract, not a blanket
waiver of gameplay quality.

## Step 4: Account And Release Checks

Read-only HTTP verification confirms both servers respond successfully:

- localhost8000 retained dev: SHA256 `26700ead3aa357ebab6eaf3a245e262fd8e2b17467d855867a7f4b91d58f99ba`;
  exact retained controller embedded. This is unchanged gameplay.
- localhost8002 frozen beta.4: SHA256 `3affec48a16d91bfe20d9eaa7de39bd16c805f7685b845797830cf1677447256`;
  recorded identity `1.4.2-beta.4+build.1209.sha.02166971.beta`.
  It does not contain the current persona work.

Human recovery/password login was accepted on beta.3. It is not acceptance of
the final combined package. Live score save, reload and separate-session
retrieval for both games still need completion. Existing mocked browser tests
do not establish live persistence. The user was asked to restore a permitted
signed-in browser session and confirm its build. No credentials, reset links,
email requests or database writes were used in this cycle.

After that session is available: play each game normally to game over, confirm
the score save, verify it after reload, check game separation, and verify both
results in a separate signed-in session. Final recovery uses human-controlled
credentials and explicit consent before any email/password change. Do not
bypass the previously denied browser path with another automation channel.

Only after gameplay/account acceptance: checkpoint reviewed work, satisfy
release freshness/security gates, obtain lane approval, verify hosted dev,
then freeze and validate the exact beta package. No release date is justified.

## Evidence

`conflict-arbitration/results.json` contains final fixture, scope, gate and
targeted completion results. `conflict-arbitration/provenance.json` indexes
81 archived files with verified gzip recovery. Primary raw runs and frozen
candidate/source/methods are under `private-artifacts/persistent/stage2-conflict-oct22/`.
Off-machine backup is not verified. Existing trace provenance remains in
`timebox/provenance.json`. No-mistakes status reports the repository is not
initialized; no full pipeline pass is claimed or initialization performed.
