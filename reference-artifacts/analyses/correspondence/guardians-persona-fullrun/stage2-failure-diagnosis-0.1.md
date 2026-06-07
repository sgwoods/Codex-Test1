# Guardians Intermediate Full-Run Stage-2 Failure Diagnosis 0.1

Source run:
- `reference-artifacts/analyses/correspondence/guardians-persona-fullrun/guardians-full-run-persona-advanced-seed2285977134-2026-06-06T15-57-46-196Z-49717-ixfb1n`

Summary:
- persona: `Intermediate` (`advanced`)
- stage clear count: `1`
- stage advances: `1`
- final stage reached: `2`
- final score: `2920`
- final loss: `alien_scout_collision` at `237.1s`

What the new whole-run logging says:
- stage `2` records only `12` attacks and `13` bullets before the final loss
- the final loss is a collision, not a bullet death
- the stage-2 loss still occurs with recent bullet pressure, but not with bullets physically on screen at the moment of death
- all ship losses in the canonical run occur with the player ending in lane `1`

Interpretation:
- the default Intermediate reviewer is no longer failing because the opening is impossible
- the more specific current problem is recovery shape after the first clear
- the persona is surviving long enough to create a real early-stage-2 test, then collapsing into a left-lane collision pattern

Implication for the next gameplay pass:
1. keep the new stage-1 clear capability
2. target lane-1 overcommit and re-centering after the first clear
3. do not solve this with a broad attack/bullet reduction

Rejected first attempt:
- a simple stage-2 edge-guard experiment was tested and then reverted
- it kept the run multi-stage, but it reduced the run to `2710` points and `223.483s`
- it also changed the final stage-2 loss into an earlier `enemy_shot` death without improving total progression

What that means:
- the problem is not solved by a blunt “stay away from the edge” rule
- the next experiment should target how the Intermediate reviewer chooses or abandons targets during early stage-2 recovery, not just where it is allowed to stand

Success condition for the next step:
- canonical Intermediate whole-run still clears stage `1`
- stage `2` survivability improves without dropping stage-arc pressure into an obviously softened feel
