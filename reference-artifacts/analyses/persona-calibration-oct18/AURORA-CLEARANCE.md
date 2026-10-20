# Aurora Clearance Diagnostic

October 19, 2026. Baseline 02166971 plus existing local persona repairs.
Status: provisional source candidate, not a release-ready keeper.

## Change And Result

Professional normal Stages 4-6 use continuous horizontal threat clearance and
retain avoidance until the diving collision box passes the player's collision
box plus four pixels. Other personas, challenges, enemy rules, shooting and
speed are unchanged. This does not assert rendered-sprite clearance.

Predeclared incremental diagnostic criteria: median score at least 44,522.5
(10% above 40,475), at least nine runs reaching Stage 6, no early destruction
losses. This does not mean zero early capture-related life decrements.

Ten actual browser Watch runs used matched diagnostic seeds 72001-72010,
Stage 1, three ships, 900-second limit and the existing scenario/runner.

| Seed | Stage reached | Score |
| --- | ---: | ---: |
| 72001 | 8 | 49,860 |
| 72002 | 9 | 56,990 |
| 72003 | 8 | 54,130 |
| 72004 | 9 | 57,980 |
| 72005 | 28 | 199,440 |
| 72006 | 8 | 51,940 |
| 72007 | 9 | 58,900 |
| 72008 | 8 | 57,080 |
| 72009 | 8 | 50,760 |
| 72010 | 10 | 59,210 |

All ended in game over. Median 57,035 versus baseline 40,475: +40.9%.
Diagnostic criteria pass. Only one run exceeds 150,000 and none exceeds
200,000. The user's consistent Professional competence target is not met.

## Checks And Limits

Build, syntax and diff checks pass. Existing 66 mode-parity cases pass.
Six isolated threat-filter assertions pass: adjacent lane, center-below body,
cleared threat, challenge exclusion, Expert exclusion and Stage 7 exclusion.
These are not full movement-conflict or human-actuator equivalence tests.

Independent review confirms bounded scope, but notes horizontal threshold
release can still oscillate and bullet-first evasion can conflict with bodies.
Do not broaden thresholds without a measured fixture. Fresh seeds have not
been run. Earlier skill distributions for other personas are unchanged.

## Provenance And Next Step

Primary packet: private-artifacts/aurora-clearance-oct19/ contains run.js,
candidate.js, results.json, fixtures.js, build-verification.json and individual
browser session directories. The source is embedded verbatim in the tested
development HTML; source and served bytes were checked during measurement.

Source SHA256: 5fbc6d6f81f6718ca2a6311acd77b47fea159cee369df3a4d7dc9430402afdf9.
DEV index SHA256: 5bc64747aa9a31ef941872945b6e6e9d88f8b674451aa465a3b575c9fdb80297.
localhost:8000 matches this development index. Frozen beta on port 8002 is
unchanged. No commit, push, account write or publication was performed.

Next: fresh-seed validation before acceptance, plus movement-level fixtures
for competing hazards and lateral release. Then calibrate the shared safety
foundation and skill ladder. Wizard remains deferred. Beta remains held for
persona acceptance, live signed-in per-game persistence, review findings,
clean integration, exact-package checks and authorized lane publication.
