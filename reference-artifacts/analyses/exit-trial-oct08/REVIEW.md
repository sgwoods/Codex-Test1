# Stage 31 Exit Trial

October 8, 2026. Baseline cf0e7a666067ede385865ba02e73d1454eb132d1.
Verdict: rejected. No exit source change integrated into the lead checkout.

## Diagnosis

All four known stationary no-fire contacts occur in the exit phase and include
the full 48px lower-field bias. Three are blue-purple-finale; one is green-ladder.

| Target | Group | Family | Contact seconds | Path u | Pre-bias y | Actual y |
| --- | --- | --- | --- | --- | --- | --- |
| 51406268 | 1 | blue-purple-finale | 7.967 | 12.264 | 276.331 | 324.331 |
| 372665405 | 2 | green-ladder-split | 11.400 | 11.535 | 276.350 | 324.350 |
| 942182592 | 5 | blue-purple-finale | 21.517 | 11.896 | 277.831 | 325.831 |
| 709114509 | 5 | blue-purple-finale | 21.717 | 12.015 | 294.868 | 342.868 |

Same-frame bias subtraction is not a simulated safe replacement. Group2-only
repair cannot close the other three contacts. Earlier source suggestions that
focused only on green-ladder were incomplete.

## Trial And Result

Isolated candidate retained the complete pre-u9.7 path and used a Hermite
upward/outward departure anchored to the last pre-exit pose and velocity.
It retained the existing 3.35 path-unit duration. Endpoints were experimental,
not measured canonical coordinates. Raw source patch is persisted here.

Same-source, same-method baseline and candidate browser runs used controlled
60Hz stationary/no-fire launches, seed9100+stage, stages31/35/39.

- Stage31 contacts4 to0; all40 targets attain full view in both runs.
- Stage31 clear22.083 to21.950 seconds.
- Nine targets lose longest continuous full-view duration, maximum0.9667s.
- Green target372665405 loses1.9667 to1.2833 seconds.
- Zero enemy shots and attackers in both Stage31 runs.
- Stage35/39 data unchanged; contacts remain3/7, respectively.
- Largest Stage31 frame displacement219.391 to103.324px. Remaining103.324px
  displacement is at entry-to-middle boundary, not repaired by the exit splice.

These visibility losses are not measured missed firing opportunities. No-fire
measurements do not establish interception feasibility or perfect scoring.
Nonetheless the candidate fails the conservative window-preservation guard.
Lead restored the experimental worktree source to baseline; git diff is empty.
Its generated candidate artifact is retained for evidence only, not inspection
as accepted source. Localhost was not replaced by this trial.

Hypatia independently verified hashes/method/initial state, contact reduction,
nine visibility losses, unchanged35/39 and exact pre-u9.7 coordinates. Rejection
supported. Reviewer did not rerun browser tests.

## Persisted Evidence

Raw reports (132MB combined) are persisted in the private mirror under
private-artifacts/repo-mirror/reference-artifacts/analyses/exit-trial-oct08/:

- baseline.json: acf550a285ae5dadee887652833b45edbdb63a9c4b1102dda8a6cd32e604cf88
- rejected-candidate.json: 2710b6c478d0a4ce9f5e64f4f7068b7e710d23af1b666c87bf7cd9ef1a7e0f6b
- Public rejected-candidate.patch: 526eb6decd8e2be1e00db11bfa8cb936067d1e729a690fe506fe62727a67bd91

Reports include source/bundle/method hashes and per-target full trajectories.
Both experimental worktrees have baseline HEAD; source hashes distinguish
the candidate. Do not identify candidate bytes by SHA alone.

## Strategy

Do not repeat multi-family endpoint guesses. Narrow to one offending target
and family with a reference-backed corridor. Preserve its baseline continuous
view window and evaluate matched real one-shot witnesses. Treat the earlier
entry-to-middle discontinuity as a separate measured problem. If the corridor
cannot satisfy the constraints, revise the repair contract before more tuning.
Beta remains blocked. Later-stage scaling can progress independently.
