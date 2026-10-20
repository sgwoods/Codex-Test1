# Persona Consistency Repair

2026-10-18. Baseline02166971; local modifications, no publication.
Status: mode consistency implemented; skill calibration incomplete; beta held.

## Retained Changes

- Aurora Professional receives the established Expert lower-field avoidance.
- Aurora P2 uses the same policy as harness/Watch, without hidden variance.
- Watch and automated P2 own inputs; incidental human input cannot alter them.
- Guardians Watch owns input; launch clears stale Aurora P2 state.
- Guardians still declares P2 unsupported. No new two-player mode is claimed.
- New check-persona-mode-parity executes actual controllers and runtime inputs.

## Evidence

Primary artifacts: private-artifacts/persona-calibration-oct18/.
ladder/matrix.json: twelve Aurora runs, four personas, seeds51101/51201/51301.
watch-parity/comparison.json: all four personas match harness final stage/score
and all loss timestamps on seed51101 in a controlled browser clock.
mode-parity-final.json:66/66 executable VM cases, source/method hashes included.
Actual P2 browser regression passes all four personas, turn switching and score
ownership. No live account mutation. Automated scores remain ineligible.

| Persona | Aurora stages reached | Aurora scores |
| --- | --- | --- |
| Beginner | 2,5,2 | 4620,32040,9380 |
| Intermediate | 5,2,8 | 35950,5270,49110 |
| Expert | 6,5,5 | 41930,32160,33190 |
| Professional | 9,5,8 | 54860,38320,51540 |

Professional early losses:0,0,0. Stage3 hit counts:40/40 in all three runs.
The reproduced seed51301 improved fromStage2/8260 toStage8/51540.
Three seeds are a bounded regression panel, not a calibrated human population.
Mode equality requires equal state/seed/time/input; different P2 board history
does not imply identical full-run scores. The developer harness retains its
explicit manual-override behavior; parity evidence uses unattended input.
Aurora controller still uses automated movement, not human acceleration, so
these results are not proof of human feasibility.

## Rejected Experiments

Guardians baseline: guardians-ladder/matrix.json, twelve browser runs.
Professional reaches2,2,1; Expert survives until900s inStage1 without clearing.
Intermediate mean score is below Beginner on this small panel.
guardians-target-candidate/: target filtering worsened Professional; rejected.
guardians-safe-lane-vm.json: risk-free pursuit fallback reduced safety; rejected.
guardians-deadband-vm.json and guardians-declared-policy-vm.json: progression
improvements trade off survival and do not establish a sound skill ladder.
All those controller experiments were restored; only mode ownership is retained.
The VM runner is preserved as guardians-matrix.js. Its target-candidate results
matched browser outcomes before it was used for subsequent bounded comparisons.

## Unclosed Gates

Existing check-professional-stage2-safety FAILS its per-seed short-window score
assertion: seed51201 Professional2820 versus Expert4250 at16s; both lose no ships.
Other pairs:2930/2930 and5850/5080 (Professional/Expert). Professional total11600
versus Expert12260 (94.6%). No existing gate was changed or bypassed.
Natural-start full runs improve, but the short-window tradeoff needs explicit
disposition or repair. Proposed future criteria must be frozen before held-out
evaluation, not selected to retroactively pass this candidate.

Guardians calibration requires preceding-decision traces for shooting stalls,
edge movement and threat priorities. Do not weaken enemy physics or grant lives.
One initial Guardians Watch UI assertion failed transiently; unchanged rerun
passed and its output is retained in guardians-watch-result.log. No presentation
fix is claimed. Final regression results are recorded separately in this packet.

Next: resolve the short-window acceptance contract and Guardians controller
behavior on held-out seeds. Then prepare a new reviewed beta candidate. Frozen
beta.4 atlocalhost8002 remains unchanged; new local source is atlocalhost8000.

## Final Regression Results

Build, syntax, diff checks and66-case mode parity pass. Guardians Watch passes.
Challenge Tour initially failed because only the last800 events were inspected;
per-frame pilot diagnostics displaced the early clear event. The bounded test
now reads its complete session, with all gameplay assertions unchanged. It passes:
Stage3 toStage7, one challenge clear, zero losses. No gameplay repair was needed.
Real-time Professional Watch advances3.209 to5.217 seconds and scores400;
screenshot professional-watch.png was inspected. This is a short rendering check,
not full real-time skill calibration. Five frozen candidate inventories verify.
Independent review found no actionable blocker in the retained gameplay diff,
but did not approve the skill-calibration or failed-score-gate disposition.
Browser cabinet-transition check passes after returning to the front door:
Aurora automated P2 -> Guardians manual launch leaves P2 disabled and Watch off.
Receipt: p2-guardians-transition.json. An initial probe attempted selection during
an active run and was rejected; that was not the supported cabinet transition.
