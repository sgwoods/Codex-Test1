# Stage 2 Deadband Trial: Rejected

October 20, 2026. Baseline bacb0c58 plus retained later-stage hazard arbitration.
No publish, push or database change. Source trial fully removed after failure.

## Evidence

Archived October20 15:35 seed51201 baseline pair: Expert54 shots/38 kills/4250;
Professional45 shots/33 kills/2820, neither loses a ship. Professional records
240 not_aligned,45 bullet_cap and zero fire_roll_miss decisions.
At0.017s Expert fires atX140; Professional moves to133.55 and fires at a target
at134.06. The5.94px displacement is inside Expert's7px deadband but outside
Professional's5px deadband. Expert target identity was not logged: shared target
selection is a hypothesis. A synthetic shared-pose VM check reproduced the
axis difference using actual harnessMoveAxis:5px gives-1;7px gives0.
Read-only specialist independently confirmed the trace and proposed this trial.

## Trial And Acceptance

Only Professional normal Stage2 effective deadZone changed5->7. No speed, aim,
target priorities, weapons, enemies or test thresholds changed. Acceptance was
the existing three-seed professional-stage2-safety gate, unchanged.

| Seed | Expert score | Trial Professional score | Trial losses / collisions |
| --- | ---: | ---: | --- |
|51101|2930|5470|0 / 0|
|51201|4250|4570|0 / 0|
|51301|5080|4540|1 / 1|

Gate FAIL: extra collision death relative to Expert on51301. Rejected despite
improvement on51201. Existing policy-transition fixture also correctly detected
changed Stage2 config (78/79 pass); no test expectation was weakened.
Trial source SHA256 adf7a14d95bc1ad1262ac2937d889d389a56bc35ddf7c754aede59cfe8460141.
Raw six browser runs persist in harness-artifacts/checks/professional-stage2-safety/
with timestamps2026-10-20T17-32-27 through17-32-43. Baseline pair persists there
at2026-10-20T15-35-11(expert51201) and15-35-24(professional51201).

## Decision

No new gameplay improvement retained this step. The prior later-stage hazard
keeper remains. Beta gates are not closed. Do not continue blind deadband or aim
parameter sweeps. Next inspect the51301 collision frame and competing escape
directions, then test a hazard-aware alignment rule with mirrored and edge
fixtures. Desired benefit: keep useful firing alignment without losing a ship
when a diving enemy approaches. Live scoring and final package gates remain.
