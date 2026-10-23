# Stage 2 Collision Diagnosis

October20,2026. Baseline bacb0c58 plus retained later-stage hazard keeper.
No additional runtime change retained. No publish, push or database mutation.

## Observed Failure

Rejected deadZone7 trial, seed51301: at8.783s Professional moves right while
detecting the left diver. At8.800s no lower_field_evade is logged; it pursues
the right diver. At8.817s it fires and collides: player178.72/335, enemy
248693119 at189.69/342.02. Existing early avoidance requires enemy.y<player.y,
so center crossing can release an enemy before its collision box clears.
Two diver priorities also alternate escape directions before that release.
This is a trace from a rejected trajectory, not proof of an identical encounter
in the retained deadZone5 policy. Complete bullet poses are not in this extract.

stage2-collision-extract.json persists the relevant events, raw path and SHA256.
Read-only specialist independently confirmed the release defect and warned that
reusing later-stage filtering would also change detection onset208->236 and lanes.

## Trials

Both trials used original deadZone5, unchanged aiming, enemies and gate thresholds.
Each ran Expert/Professional on51101,51201,51301 with the existing16-second gate.

| Variant | Pro51101 | Pro51201 | Pro51301 | Pro losses |
| --- | ---: | ---: | ---: | --- |
| Full later-stage filter in Stage2 |2930|2530|4240|0,0,0|
| Below-center overlap only |2930|3690|4240|0,0,0|
| Expert comparison |2930|4250|5080|1,0,0|

Both FAIL unchanged score gate. Full-filter trial also changed approach onset;
it does not isolate release. Overlap-only trial preserved existing approach
behavior and retained below-center bodies until box heights plus4px cleared.
It improves51201 from2820 but regresses51301 from5850. Neither was accepted.
All12 browser runs completed; raw primary sessions persist under
harness-artifacts/checks/professional-stage2-safety/ at2026-10-20T17-36-38 through
17-36-55(full filter) and17-37-20 through17-37-40(overlap only).

Actual-source synthetic overlap check detected the recorded-style below-center
body. During overlap trial79mode-parity cases passed; existing opening-clearance
fixture correctly failed its unchanged-opening assertion. No fixture was weakened.
Both trial source changes were removed, preserving the prior Stage4+ keeper.

## Next Decision

Stop independent parameter adjustments. Prepare a small recorded-state replay
for the opposing-diver encounter, with full enemy and bullet poses and chosen
decision branch. Compare left/hold/right against all imminent hazards, including
edge-clamped and mirrored cases; preserve early detection onset. Only then test
alignment plus safety as one bounded policy against the unchanged gate and new
seeds. Intended player benefit: shoot from stable positions without returning
into a passing enemy. This step improves diagnosis, not delivered gameplay.
Beta remains held for Stage2 gate, Professional consistency, live score
persistence and exact integration/package validation.
