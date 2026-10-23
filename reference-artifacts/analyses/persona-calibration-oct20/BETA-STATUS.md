# Beta Status: October 20, 2026

## Latest Decision

October22 matched safety qualification FAILED: candidate median316660 is below
retained326720. No destruction reduction; no integration or fresh tests.
Retained pilot unchanged. Safety repair, persona calibration and live-account/
exact-package checks remain separate. See SAFETY-QUALIFICATION.md in the Oct22
packet. No beta approval or publication.

October22 user approved separate safety-repair qualification. See
../persona-calibration-oct22/SAFETY-QUALIFICATION.md. The old short comparison
stays failed/calibration evidence, not a blocker to running the approved
baseline-nonregression experiment. Safety acceptance, persona calibration and
final-package release readiness are distinct; none implies automatic beta approval.

October22 later follow-up: candidate06233924 repairs the recorded collision
and passes four collision variants/350scope checks, but shortgate remainsfailed.
No integration or full-game acceptance. See
../persona-calibration-oct22/CONFLICT-REPAIR-DECISION.md for the pending proposal
to separate safety-repair nonregression from cross-persona calibration.
Do not change the stop condition without approval. Live account checks remain
pending; recovery was previously human-accepted on beta.3, not the final package.

October22 timebox follow-up supersedes the next-action summary below:
see ../persona-calibration-oct22/TIMEBOX-REVIEW.md. Two isolated repairs rejected;
officialStage2 gate remainsfailed. Fresh completeStage2 panel finds10/10clears
for both tiers but one Professional collision and slower median clearance.
New35-frame exact replay narrows repair to competing body/bullet avoidance.
Accepted runtimea27c906f and earlier full-game gains remain unchanged.
No gameplay keeper or beta gate closed. No commit,push,publish.

October22 follow-up: isolated Stage2 repair rejected; retaineda27c906f unchanged.
Complete-stage evidence narrows the remaining51201 defect to730points/3.833s,
not a survival failure. See ../persona-calibration-oct22/STAGE2-ASSESSMENT.md.
The standalone throughput criterion remains an adopted product hold, not a
test invoked by publication scripts. No gate or requirement was waived.

CAPTURE-RESCUE-KEEPER.md supersedes the historical controller disposition below.
Integrated controller a27c906f is a local keeper:30 distinct Professional runs
all reach150k;28 reach200k. All survive the900-second budget. Matched median
301975->326720; a second matched set106735->240785. Full fresh four-tier ladder
and focused mode/lifecycle checks pass. Expert median81275 but only6/10reach75k.
Stage2 throughput remains failed and live account acceptance remains pending.
No commit,push,publish or beta approval. Next preserve gains while resolving
the narrow Stage2 gate, then account acceptance and exact-package release checks.

## Historical Assessment

Latest: LOOKAHEAD-TRIAL.md rejects the isolated two-step motion candidate.
Matched median falls4.27% despite fewer destructions. Capture-related exhaustion
of lives is now a demonstrated weakness to include in the next bounded repair.
Retained controller74b38aec unchanged. No beta gate closed by this trial.

Follow-up: RETAINED-LOW-TAIL.md now reproduces a retained-source Stage13 loss
with22 exact decisions and equal instrumented/control gameplay events. All
final-frame actions collide; a recorded-hazard route exists one frame earlier.
This narrows the next repair to earlier motion prediction. It does not close
a gameplay acceptance gate. Account audit confirms live testing is still needed.

## Decision

Reject the Stage2 joint-policy candidate. Restore controller SHA256
74b38aec094da21b4ce586812ad2d7b36b9d346f62fa2fd24d89cabbf3da2e0b.
Retain the earlier Stage4+ hazard arbitration. No release is authorized by this
assessment. HEAD remains bacb0c58; the retained work is not yet checkpointed.

## Matched Evidence

Stage1, three ships, 900 seconds, Professional Watch, seeds89001-89010.
Baseline packet: stage2-matched-baseline.json; candidate: stage2-joint-fresh.json.
Packets record controller/build/method identities and raw evidence provenance.
The runner was extended to accept frozen input/source paths for the baseline;
method hashes therefore differ. The same gameplay protocol was used. This is
a diagnostic ten-seed comparison, not a population estimate or all-seed proof.

| Metric | Retained baseline | Rejected candidate |
| --- | ---: | ---: |
| Median score | 301975 | 214465 |
| Minimum score | 96450 | 63500 |
| Reach150k | 6/10 | 6/10 |
| Reach200k | 6/10 | 5/10 |
| Early destructions | 1 | 1 |

Candidate scores decrease on six seeds and increase on four. Median falls
29.0%. Surviving time-limited scores are lower bounds, not final career scores.
Passing three short Stage2 probes did not predict whole-game improvement.
The restored controller still fails the existing Stage2 score-throughput gate;
that requirement has not been weakened. Professional8/10at150k remains unmet.

After restoration: build PASS, mode parity79 PASS, clearance37 PASS.
These are source/VM checks, not full browser mode coverage or proof that the
automated movement model is identical to human acceleration physics.

## Path To Beta

Independent early-loss review of rejected candidate seed89010 found a Stage2
collision at44.483s with escort474485942. In the preceding0.25s,14 evade
decisions produced13 direction reversals, followed by two holds. Player remained
atX159.36/Y335 while the escort moved from162.54/322.90 to162.48/328.45.
This supports a moving-body lookahead limitation: the resolver freezes body
positions while predicting bullet endpoints. Complete final hazard scores were
not recorded, so this does not prove which alternative trajectory was safe.
Do not treat this rejected-policy observation as a reproduced baseline defect.


1. Diagnose a low-tail encounter on retained source, not the rejected candidate.
   Capture full movement, body and bullet state at the actual collision phase.
   Player benefit: fewer avoidable deaths without weakening enemies.
2. Test one bounded controller repair with fixed acceptance criteria. Keep the
   existing gates. Use matched full-game results before reserved fresh seeds.
   Player benefit: a Professional pilot that is reliably strong, not merely
   capable of occasional high scores. Stop parameter sweeps without evidence.
3. Validate the complete skill ladder and mode parity on one frozen source.
   Current partial Professional runs do not revalidate all other personas.
   Player benefit: predictable difficulty in Watch and supported rival modes.
4. In parallel, complete real signed-in score save, reload and separate-session
   retrieval for both games, with ownership and game separation checks. Existing
   database migrations and mock-provider tests do not prove this end to end.
   Use only the permitted browser path; do not bypass a denied browser action.
   Player benefit: scores survive sessions and remain attached to the right game.
5. Confirm real password recovery followed by password login, and audio/settings
   acceptance on the final candidate. Earlier human acceptance is not acceptance
   of changed bytes. Player benefit: reliable account access and sound.
6. Review and checkpoint the combined source and persistent evidence. Run focused
   regressions, npm run review:code and npm run release:preflight:dev. Inspect any
   generated freshness changes before committing. Do not bypass a dirty gate.
7. After explicit lane authorization, publish and verify hosted/dev. Check source
   identity and public-safe behavior. No hosted verification occurred in this step.
8. Freeze the exact beta package. Run packaged runtime, authentication, scoring,
   security/privacy, asset inventory and sustained-play checks, then record human
   acceptance and known issues. The prior beta lacks the current persona work.
9. Run npm run publish:check:beta. Only after explicit publication approval use
   publish:beta:frozen with the tested candidate path. Ordinary publish:beta
   rebuilds and is not proof that tested frozen bytes were delivered.
10. Verify the hosted beta identity and smoke results; stop before production.

## Scope And Process

Professional consistency is an adopted product hold, not automatically a
hardcoded release script. Any scope change needs a product decision, not a
convenient test waiver. Wizard, Guardians P2 and universal world-record mastery
are not prerequisites for this beta. Stage7 remains paused.

One lead edits runtime. Read-only account/release review can proceed in parallel.
The release audit completed independently; it identified the account checks,
final evidence freshness and exact-package verification above. No deploy ran.
The early-loss review is separate from candidate disposition: one-step endpoint
safety does not guarantee a safe multi-frame route.

Timing: no defensible beta date until controller acceptance and live account
checks pass. Release preparation is a bounded checklist; the controller repair
is the uncertain part. Report progress by closed gates, not trial count.
