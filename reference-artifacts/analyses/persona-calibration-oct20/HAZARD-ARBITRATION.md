# Professional Hazard Arbitration

October 20, 2026. Baseline bacb0c585f0ff516d2a3373cb16c563de5079ad3.
Branch codex/local-review-music-status-oct16. Local incremental keeper only.

## Findings And Change

Read-only specialist analysis found 18-29 direction reversals in the half-second
before sampled losses on seeds87002/87006/87009. Bullet priority overriding body
avoidance is a supported hypothesis, not an exact reconstructed bullet replay.
Professional normal stages4+ now check the proposed movement against all live
body positions and next-step descending bullet positions. If clearance is unsafe,
choose left, hold or right by maximum minimum normalized clearance. Staying wins
equal ties; equally better left/right choices select left. Other personas,
openings, challenges, enemy rules, scoring and firing settings are unchanged.
The shared controller serves harness, Watch and automated Aurora P2.

## Measurements

Ten matched diagnostic seeds87001-87010, Stage1, three ships, 900-second budget:
- Median156705 ->190630 (+21.6%); minimum57810 ->100830.
- Reaching150k:5/10 ->5/10. Reaching200k:4/10 ->5/10.
- One opening destruction remains. Individual seeds can regress despite aggregate gain.

Ten fresh seeds88001-88010, same method, no tuning during execution:
- Median186715; range57910-358820; five reach150k and five reach200k.
- Nine reach75k; zero opening destructions. Final reached stages9-50.
- Scores at the time limit are censored, not eventual final scores or completion.

The consistent150k target (8/10) FAILS. Retain a bounded safety improvement, not
completed calibration or beta acceptance. Fresh seeds have no matched baseline
panel; do not claim a paired improvement on those seeds. The runner's generic
criterion includes zero opening destruction; the diagnostic panel does not pass
that criterion. No newly frozen acceptance threshold was established before
the run. Retention is a provisional engineering decision, not a gate waiver.

Primary frozen inputs, candidate source, raw sessions and logs remain under
private-artifacts/aurora-ladder-oct20/hazard-arbitration/ and
private-artifacts/aurora-ladder-oct20/hazard-arbitration-fresh/.
hazard-arbitration.json persists per-seed results, source/build/method hashes,
raw result paths and checksums. Do not overwrite these packets.

## Rejected Opening Trial

Narrower Professional aiming (boss18/other13) was tested then fully restored.
The unchanged Stage2 short-window gate failed:51201 score2820 ->1980 versus
Expert4250;51301 score5850 ->4270 versus Expert5080. No Professional ship loss
in those three short runs. Raw runs are in harness-artifacts/checks/
professional-stage2-safety/ with October20 17:19-17:20 timestamps.
The current later-stage repair cannot resolve this Stage2 throughput gate.

## Validation And Limits

Build passed; syntax checks and git diff --check passed. All79 mode-parity cases
and36 clearance/conflict fixtures passed. Independent reviewer found no blocking
defect and confirmed scope/shared-controller placement. Remaining gaps: moving
enemy prediction, swept collision, edge-clamped conflicts, full-browser P2
coverage. Body12/bullet8 safety margins are engineering choices, not measured
reference geometry. Human acceleration equivalence remains unproved.

localhost8000 serves dist/dev from this checkout, verified byte-for-byte.
Build1.4.1.5+build.1210.sha.bacb0c58.dirty; SHA256
7fc466f5632e5c458a71f8eab237018a225bdd5ef1dad7b2698712a51e07220c.
Frozen beta8002 unchanged. No commit, push, database mutation or publication.

## Next Work

Inspect paired first divergences in Stage2 seed51201 to repair shot throughput
without weakening Expert or the gate. For later consistency, inspect fresh
seed88010 and the repeated Stage17-22 endings before another bounded change.
Live signed-in save/reload/separate-session retrieval for both games remains
unverified, pending user restoration of the browser after its policy denial.
Then clean integration, exact candidate gates and explicit release authorization.
