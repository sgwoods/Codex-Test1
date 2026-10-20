# Stage 3 Extension And Skill Ladder

October 19, 2026 (America/Toronto). Local development only. Baseline02166971
plus retained uncommitted repairs. No release publication or source push.

## Guardians Extension: Retained

Expert's predictive planner was disabled afterStage2. The sole gameplay change
in this step enables its existing safeLane path for Expert at every stage.
Other personas, enemy rules, scoring and lives are unchanged. Later-rank
reactive dive thresholds no longer drive Expert movement because the planner
returns the decision first. Its actual-runtime speed, observed-motion risk and
ordinary input constraints remain unchanged.

Criteria declared before testing:at least7/10reachStage4,median score>=6260,
and no increase in early-stage gameovers. All runs startStage1withthree ships,
normal game rules,maxPlayableStage99,and a900second limit.

| Expert panel | Stage4+ | Median score | Stage1 gameovers | Alive at time limit |
| --- | ---: | ---: | ---: | ---: |
| Opening-only keeper83001-83010 | 0/10 | 6,260 | 0/10 | 0/10 |
| Extension83001-83010 diagnostic | 10/10 | 14,720 | 0/10 | 8/10 |
| Extension84001-84010 fresh | 9/10 | 13,785 | 0/10 | 9/10 |

Fresh reached stages:6,7,6,6,5,6,3,6,6,6. The Stage3run ends in gameover;
all nine others remain alive at900seconds. These outcomes are censored, not
maximum-stage ceilings or completed games. The opening-only panel is a paired
baseline only for83001-83010; no paired old-controller84001panel was run.
Actual-browser seed84001matchesVM Stage6/13610/900s with no gameover.

Verification:11executable pursuit fixtures including stages3/5/9/31 pass;
66mode-parity cases pass; build, runtime-slice, Stage5runtime-policy, syntax
and diff checks pass. An initial combined regression command stopped at the
macOS browser sandbox precondition; the affected browser checks passed when
rerun with the required permission. Independent review found no blocker in
the scoped extension, with the reactive-threshold caveat above.

## Aurora Preparation: Complete, No Source Repair Yet

Read-only independent analysis inspected the first10Professional collision
losses in seed order72001-72003,chronological within each session. The saved
build contains the current Aurora controller hash21fe6dfc9bf61be13c76c9c4110802dafa6e1c86c689cedd62f2454d0bae6677.

| Seed | Loss time | Stage | Collider ID |
| --- | ---: | ---: | ---: |
| 72001 | 88.283 | 4 | 714934340 |
| 72001 | 136.817 | 6 | 481989194 |
| 72001 | 141.000 | 6 | 553075754 |
| 72002 | 84.867 | 4 | 349114366 |
| 72002 | 92.033 | 4 | 298546415 |
| 72002 | 102.167 | 4 | 642587678 |
| 72002 | 114.900 | 5 | 772938383 |
| 72003 | 82.317 | 4 | 58177964 |
| 72003 | 114.667 | 5 | 183225259 |
| 72003 | 142.100 | 6 | 487047606 |

All10previously logged evasion against the eventual collider, still targeted
it at impact, and moved toward its recorded position on the final movement
step. None carried a fighter. Each showed16-29direction reversals in the prior
half-second. Eight were on cooldown; two fired on the impact frame.

The later-stage emergency filter requires the same quantized lane and an enemy
center above player.y. Seven final pre-movement lane pairs differ; five impacts
have the enemy center at or below playerY335. These rules can release avoidance
before body clearance and permit immediate pursuit back toward the collider.
Example72001/88.283 alternates playerx103.21and109.67across lanes3/4; an evade
at88.267is followed by a return step and collision. Example72001/141.000hits
a diver atY344.34after evasion stops.

Next bounded Aurora candidate:Professional normalStages4-6body-clearance
arbitration, stable across lane boundaries and ship-row crossing, with a check
for competing hazards. Preserve pursuit when clear. Do not change firing,
speed, target ranking, captures, challenges or enemy behavior together with it.
Required executable fixtures:lane-boundary return, center-below/body-overlap,
cooldown return, cleared threat resumes pursuit, and competing shot/body escape.
Fixtures are specified here, not yet implemented. Telemetry does not record all
branch choices/full enemy poses, so bullet-priority interference remains possible.
There is no counterfactual claim that every sampled loss will be prevented.

## Skill Ladder: Diagnostic Experiment

An isolated VM override gave Professional the same planner without changing
its target ranking, firing policy or the live source. Matched83001-83010results:

| Professional | Median score | Stages reached | Alive at900s |
| --- | ---: | --- | ---: |
| Current policy | 2,165 | 1,1,1,1,2,1,1,1,1,1 | 0/10 |
| Predictive experiment | 13,655 | 6,5,6,6,7,7,6,6,5,6 | 10/10 |

This substantially improves survival/progression, but the matched Expert
median14720still exceeds Professional13655. This experiment is not retained
as a calibrated Professional tier. No fresh Professional panel or Professional
browser equivalence check was run. Lower-tail, scoring throughput and survival
must be considered together; a higher label must not just select larger weights.

Next skill-ladder work:establish a shared competent safety foundation, then
measure how target interception and shot-slot decisions distinguish Expert
and Professional. Separately address Intermediate's hiddenStage1hybrid.
Keep per-game targets distinct. Aurora's accepted75k-100kExpert and150k+
Professional with200k+upside remain unmet. Wizard remains deferred.

## Evidence And Inspection

Primary:private-artifacts/persona-diagnosis-oct18/.
stage3-diagnostic.json,stage3-heldout.json contain Expert outcomes;
stage3-browser/contains browser session/summary;ladder-probe.js and
professional-ladder-probe.json preserve the isolated Professional experiment.
pre-stage3-extension.js preserves the previous adapter. evaluate.js generated
the Expert rows; its legacy printed opening-stage gate is not the extension
gate. stage3-ladder-receipt.json beside this report explicitly evaluates the
new frozen criteria and includes source/method hashes.

Aurora source sessions remain under private-artifacts/persona-distribution-oct18/
aurora-professional-72001,72002,and72003. Original source/measurement provenance
is inDISTRIBUTION.md andprovenance.json. Independent findings are recorded above.

Localhost8000is byte-equal to rebuilt dist/dev/index.html, SHA256
7b4da3224a821ca9d7a408d82f46e0a7422d408115d124cc1f9884dca0e4488a.
Localhost8002frozen beta is unchanged. Beta remains held pending persona
calibration and existing release gates; this work does not waive them.
