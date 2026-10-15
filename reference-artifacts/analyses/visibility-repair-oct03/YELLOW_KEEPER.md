# Yellow Entry Geometric Keeper With Known Issues

October 3, 2026. Local branch codex/oct03-local-integration, baseline 85010e73.
Decision: retain bounded geometry repair, NOT global safety or release acceptance.
Primary provenance and measured-reference limitations: REFERENCE_FINDINGS.md.

## Source Change

Only generic yellow-diagonal-fan entry, middle and exit formulas in
src/js/06-enemy-behavior.js change. Entry finishes at existing interior laneX;
its initial slot offset tapers to zero. Middle begins at the same XY and retains
its horizontal/vertical slopes. Exit begins at the exact middle endpoint and
retains exit slopes. No timing field, clock multiplier, removal guard, authored
Stage 3/7 path, family layout, audio or Guardians source changes.

Position continuity is not velocity continuity. Entry velocity changes because
its endpoint changes; middle/exit local slopes and path-clock rates are preserved.
The endpoint choice is a geometric repair, not an exact reference reconstruction.

## Matched Geometry Comparison

Baseline: ../challenge-full-entry/2026-10-03T19-21-50-638Z-85010e73/report.json
Candidate: ../challenge-full-entry/2026-10-03T19-46-42-724Z-85010e73/report.json
Method hashes match; only enemy-behavior source hash differs. First six challenge
results, including every persisted target sample, are identical.

| Stage | Missing Full Entry Before / After | Minimum Continuous Seconds Before / After |
| --- | --- | --- |
| 27 | 5 / 0 | 0 / 0.650 |
| 31 | 0 / 0 | 0.217 / 0.633 |
| 35 | 0 / 0 | 0.217 / 0.733 |
| 39 | 0 / 0 | 0.217 / 0.733 |

All ten candidate challenges have 40/40 full entry. Sixteen screenshots cover
Stage 27/31 at 1440x1000 and 390x844, requested simulated advances 1/2/3.2/5s.
Captures were visually inspected at representative desktop/mobile checkpoints;
canvas visibility/nonblank checks passed without capture-phase exceptions.
This weak smoke does not establish enemy identity, occlusion or readability.
Some sprite overlap remains visible; no exact crowding-conformance claim.

## Normal Launch And Safety

Regression command: node tools/harness/check-yellow-challenge-entry.js
It explicitly rebuilds dirty source, uses normal development challenge launches,
preserves original spawn delays, then advances at 60Hz without player input.

Fresh baseline, explicitly rebuilt after temporarily restoring only this cycle's
own source edits: ../yellow-challenge-entry/2026-10-03T19-51-36-179Z-85010e73/report.json
First candidate: ../yellow-challenge-entry/2026-10-03T19-50-23-386Z-85010e73/report.json
Final candidate with classified verdicts and unconditional rebuild:
../yellow-challenge-entry/2026-10-03T19-53-12-151Z-85010e73/report.json
The first pair uses the same test method. Final test adds verdict reporting and
explicit rebuild but leaves the simulation/geometry sampling loop unchanged.
Complete spawn-delay vectors and forbidden event payloads/times exactly match
between baseline and final candidate across all four stages.

Normal launch confirms all 40 targets fully enter at each affected stage.
Maximum observed yellow entry-boundary step falls from 293.756px at Stage 27
and 279.182px at Stage 31/35/39 to 2.666px and 2.030px respectively.
Every yellow entry join is observed; no exit join survives on screen in these
runs. Exit position continuity is algebraically reviewed, not runtime-proven.

No enemy bullets, attack starts, player shots or ship losses occur. Yellow paths
have no recorded contacts. Stage 27 is globally contact-free. Stage 31/35/39
retain exactly 4/3/7 baseline nonlethal stationary-player contacts, all on unchanged
blue-purple-finale or green-ladder-split paths. The strict check deliberately
exits nonzero on this global contact debt. No safety gate is waived.

## Supporting Validation

- Challenge-stage correspondence: 5/5; 4.433s versus 4.401s, zero baseline drift.
  ../correspondence/challenge-stage-timing/2026-10-03-85010e73/.
- Actual Web Audio completion: both full four-second perfect/results sources
  finish with no explicit stops. ../challenge-result-audio-continuity/2026-10-03-85010e73/.
- Challenge motion-profile check passed; Stage 3/7/11 profile/reference checks.
- Stage 3 group 1/2/3/5 keeper artifact checks passed; group 4 preservation flags
  passed. These are artifact checks, not fresh perceptual/pixel equivalence.
- Enemy source and new regression syntax checks, diff whitespace check passed.
- Fresh natural Challenge 1 outcome-distribution check passed: novice seed 3101,
  advanced 3201, expert 3301 each 40/40, zero challenge ship losses, normal
  next-stage visibility and 4.433-4.434s clear-to-spawn. Novice loses one ship
  outside the challenge. Raw session JSON: yellow-keeper-outcomes/.
- Independent source/test review supports local geometric keeper with known issues.
  Review does not authorize publication or prove exact Galaga fidelity.

## Next Work

Diagnose the unchanged late-stage contact paths in a separate measured packet,
starting with Stage 31's four mapped contacts. The reused layout has a 48px
lower-field bias and descending blue-purple-finale/green-ladder-split exits;
bias causality is not established. Measure path time/phase, raw Y, added bias,
collision rectangle and rendered overlap against labeled primary bottom-field
frames before tuning. Primary tracks censor the bottom 12.5% of their ROI;
Challenges 9/10 lack distinct archived reference windows. Nonlethal grammar and
zero-contact geometry must retain separate verdicts. Preserve this yellow keeper
and Stage 3/7 boundaries. Check train
crowding and readable shot windows against labeled primary frames. Only after
visibility/readability and safety acceptance run the prepared professional sweep.
No hosted /dev, beta, production, push, main integration or release gate run.
Original video remains locally persisted in the ignored private archive, not
an off-machine backup. Single-seed evidence is not perfect-route feasibility.
