# Two-Step Lookahead Trial: Rejected

October20,2026. HEADbacb0c58; retained controller74b38aec unchanged.
Candidate executed only in private frozen builds; localhost never replaced.

## Frozen Acceptance And Results

Professional normalStage4+ only. Estimate body velocities from previous observed
positions, reject long gaps/stage changes/displacements over32px, evaluate two
successive constant-axis movement endpoints. No enemy, weapon, score, life,
Stage2 or challenge changes. Prioritized one candidate, not a parameter sweep.

Acceptance was saved before the ten browser runs: matched median>=301975,
minimum>=96450,150k attainment>=6/10,early destructions<=1, and seed89003 first
destruction after329.65s. Candidate median289075 fails (-4.27%); reject.

| Metric | Retained | Candidate |
| --- | ---: | ---: |
| Median | 301975 | 289075 |
| Minimum | 96450 | 102170 |
| Reach150k | 6/10 | 6/10 |
| Reach200k | 6/10 | 6/10 |
| Early destructions | 1 | 1 |
| Recorded destructions | 10 | 3 |
| Recorded captures | 25 | 33 |

Seeds89001-89010,Stage1,three ships,900seconds. These are reused diagnostic
seeds, not fresh validation. Event totals span different survival durations and
are not normalized hazard rates. Time-limited scores are censored lower bounds.

Target seed89003 improves96450/Stage18 to350930/Stage50 with no destruction
events, surviving the time limit. But89002 falls302280->102170 and89004 falls
330110->106950. Both, plus89010, end after five captures and zero destructions.
This is direct evidence that destruction-only analysis misses a major source
of exhausted lives. It does not prove the cache risks below caused these losses.

## Checks And Review

Eight synthetic fixtures pass: moving/mirrored body, Stage2/challenge exclusions,
stage/time-gap/large-displacement/backward-time reset. Recorded-path diagnostic
changes direction toward the observed escape before impact; it does not itself
simulate the alternate future. Full browser runs supply the outcome evidence.

Independent review identified two untested cache contracts: duplicate calls at
the same timestamp discard velocity, and small movement-mode transitions can
be treated as continuous motion. Two-endpoint checks are not swept safety and
constant-axis linear forecasts are approximate. No accepted runtime edit.

## Evidence

lookahead-trial/results.json contains per-run identity,outcome,life events and
raw session hashes. acceptance.json preserves prior criteria; fixtures.json
preserves test results; candidate-function.js preserves the rejected helper;
life-accounting.json compares both panels. Full frozen input/controller/raw
sessions remain at private-artifacts/aurora-ladder-oct20/lookahead-matched/.
Score-history A5 records this rejection rather than hiding it. Nine panels now
contain180observed runs. No fresh panel was spent after failed acceptance.

## Next Action And Beta

Inspect the first capture in89002, compare retained/candidate actions, and replay
the beam acquisition and escape window. Track capture, destruction, rescue and
extra-life events separately. Do not disable canonical capture gameplay or give
the pilot extra lives. Player goal: avoid repeated captures that end a good run.

Before any next candidate, test duplicate-tick and movement-transition cache
behavior. Then test one coherent collision/capture decision policy, with matched
whole-game acceptance and later fresh validation. No independent second tuning
cycle started here. Professional consistency, the separate Stage2 score gate,
full persona ladder, live account acceptance and final package gates stay open.
No commit,push,publish or live account access. Localhost remains retained source.
