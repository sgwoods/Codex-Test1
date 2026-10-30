# Expert Safety Candidate

October 29, 2026. Historical qualification passed; **not integrated or shipped**.
Lead baseline:0977fef4 after PR258. Independent reviewer:Ampere.

## Measured Result

| Panel, ten seeds per arm | Control | Candidate |
| --- | --- | --- |
| Matched91001-91010 median |81,275|102,020|
| Matched >=75k |6/10|7/10|
| Matched destructions |32|29|
| Reserved93001-93010 median |97,780|97,780|
| Reserved >=75k |8/10|8/10|
| Reserved destructions |34|29|

Both frozen gates pass: no lower median or75k attainment, no higher destruction
count, and no new per-seed Stage1-2 loss. Reserved early losses remain2, not zero.
Three candidate runs reached the900-second harness update budget; all20 controls
ended in game over. Censored scores are lower bounds, not final career scores.
One reserved seed regresses:93007 falls146,380 ->117,210. No universal gain is
claimed, and matched7/10 attainment leaves the Expert weak tail unresolved.
Reserved outcomes are two improved, seven unchanged and one regressed.
Destruction totals exclude captures and span unequal survival durations; they
are the frozen acceptance measure, not exposure-adjusted safety rates.

![Matched and reserved Expert score distributions](../persona-score-history/aurora-expert-veto-comparison.png)

## Scope And Evidence

The helper only changes Expert normal stages4+: reject a proposed endpoint
overlapping a live body in the current vertical collision band; choose a clear
hold/away endpoint after checking bodies and current/next bullet positions.
It does not change firing, movement speed, clocks, hitboxes, lives, scoring or
Professional capture behavior. Unchanged firing code does not imply unchanged
firing/RNG history after the first different movement.

The original failing seed improves46,960/Stage8 ->131,920/Stage24. Its first
active-ship destruction moves146.900 ->403.917s, but capture starts depleting
reserves at200.667s. These are distinct measures.

All40 session/trace/scenario/bundle/runner receipts were verified. All ten
matched controls reproduce the historical non-audio events and mechanical
snapshots; snapshot effects counts are excluded. Prefixes before the first
intervention match. These are not every-tick full-state or audio proofs.
Independent reviewer Ampere recomputed all40 raw rows and checked the associated
hashes, ten archived-control comparisons and twenty pair-prefix comparisons.
No blocking evidence discrepancy was found. The audited verified-results.json
SHA256 is `ab274f6e92f2a101f5d7bc222512e0d1382857174cde0ba9923f178b730091dd`.

45 resolver fixtures and70 actual-geometry/collider/Professional-continuity
checks passed. Private copies of current source passed80 mode-routing cases
per arm, including the explicit opposing-bullet/body action through harness,
Watch and P2. VM parity is not live-browser parity or full-game nonregression
for the other personas. Current source/runtime files remain unchanged.

Data:[expert-body-veto.json](expert-body-veto.json), including input and method
hashes, all individual runs, censoring and limitations. Raw sessions, traces,
inputs, receipts and methods are preserved under
`private-artifacts/persistent/expert-body-veto-oct29/` (156 compressed artifacts
plus manifest). Working packet:`private-artifacts/expert-body-veto-2026-10-29/`.
Local persistence is verified; off-machine recovery has not been tested.

Two analysis failures are retained: empty-control-trace export required a
symmetric observer marker; budget completion was initially confused with the
gameplay clock. For91005,31 transition corrections explain900-31/60=899.483s.
The corrected classifier checks the pinned deterministic900-second runner,
active pre-stop state and recorded harness_stop. No policy, seed, budget or
numeric acceptance floor changed; no successful run was discarded.

## Next Gate

1. Qualify this unchanged candidate on an isolated current build, with all four
   personas and the same source/controller shared by testing, Watch and P2.
2. Check actual browser Watch/P2 lifecycle/input ownership and score exclusions;
   investigate the remaining weak Expert routes without tuning to a single seed.
3. Integrate only after review and regressions pass. Accumulate a meaningful
   player-facing batch for an explicitly authorized dev release.
4. Revisit beta only after human dev inspection, fresh release/docs/security
   gates and an explicit beta decision. Production1.4.2 remains untouched.
