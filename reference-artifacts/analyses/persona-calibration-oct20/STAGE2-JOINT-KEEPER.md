# Stage 2 Joint Policy: Provisional Keeper

October20,2026. Baseline bacb0c58 plus retained hazard policy74b38aec.
Candidate controller SHA25663b79bab4c8ca1f3dee04903dad90686fe5ad305faf6de4050a3994f871c3a0e.
Local only, no commit/push/publication or account mutation.

Professional normal Stage2 only: deadZone5->7 and enable the existing joint
hazard resolver. No enemy/weapon/score/life changes. Stage1, challenges, other
personas and later-stage policies are unchanged. Same controller serves test,
Watch and automated Aurora P2. This does not prove human acceleration parity.

## Acceptance Evidence

Unchanged professional-stage2-safety gate PASSES all three seeds:

| Seed | Expert | Professional | Professional losses |
| --- | ---: | ---: | ---: |
|51101|2930|4080|0|
|51201|4250|4570|0|
|51301|5080|5570|0|

Raw six browser runs persist under harness-artifacts/checks/
professional-stage2-safety/ with2026-10-20T19-50-15 through19-50-32 timestamps.
No threshold or scenario changed. Candidate is not better on every metric:
51301 score is below the prior retained5850, but now exceeds Expert5080.

Correct-phase replay v3 captures before bullet update and at body collision.
Actual bullet collision then body collision functions test the alternatives.
Control/instrumented selected event equality and31exact decisions pass.
The candidate itself chooses left in the recorded frame, right in its mirror,
hold at the translated left boundary and left at the translated right boundary.
All four selected endpoints have no bullet/body loss. Independent review found
no blocking runtime issue; its missing candidate-invocation test was added.
Mirrored/edge worlds are synthetic. These are one-frame endpoint tests, not
alternate complete simulations, moving-body prediction or swept collision proof.

79mode-parity checks,37clearance fixtures, build, syntax and diff checks pass.
Transition fixture explicitly checks the newStage2 deadband and unchangedStage1;
the score/safety acceptance gate itself is untouched.

## Fresh Full-Game Panel

Ten previously unused seeds89001-89010; Stage1, three ships,900-second budget:
median214465, range63500-346030;6/10reach150k,5/10reach200k,9/10reach75k.
One early destruction remains. The8/10at150k target is NOT met.
Different seeds from prior panels: this is not a matched causal improvement.
Scores stopped at time limit are censored. Generic runner criteria include
zero opening destruction; that clause fails. Retain provisionally for the
unchanged Stage2 gate and targeted safety evidence, not broad calibration approval.
stage2-joint-fresh.json preserves rows, outcome/source/build/method hashes and
raw packet checksum. Primary packet:private-artifacts/aurora-ladder-oct20/
stage2-joint-fresh/. No edits during that panel.

## Next

Run matched full-game before/after seeds before finalizing this keeper. Inspect
the one early destruction and lower-tail endings; do not equate median gain
on different seeds with a validated overall improvement. Keep live per-game
score persistence and final integration/package checks separate. Beta remains
held. Score history now includes provisional A4, with untested tiers left blank.
# Superseded: Candidate Rejected

October 20 matched full-game comparison rejected this provisional keeper.
Runtime was restored to controller74b38aec. See BETA-STATUS.md and
stage2-matched-baseline.json. The original short-gate evidence below remains
historical evidence, not current acceptance.
