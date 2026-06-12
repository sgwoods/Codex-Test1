# Aurora Cadence Reference Comparison

Generated: 2026-06-12T19:50:43.243Z
Commit: b74b1910
Branch: codex/aurora-cadence-perfect-route-investigation

## Verdict

- Status: `reference-comparison-regression-risks-found`
- Concerns: `challenge-result-cadence-regression-suspected`, `professional-perfect-routeability-regression-risk`, `full-target-visibility-regression-risk`
- Release implication: Treat as cleanup/fidelity debt before another gameplay tuning or promotion cycle; do not publish beta/production on the assumption that the waits are benign.

## Cadence

- Current measured Challenge 1 clear-to-spawn: 15.15s
- Current configured Challenge 1 clear-to-spawn: 15.12s
- Preserved Galaga-aligned target: 4.401s
- Delta: 10.749s (3.442x target)
- Status: `challenge-result-cadence-regression-suspected`

This is not a generic performance wait. Current source config combines a
7.77s Challenge 1 result hold with a
7.35s next-stage transition window.

## Routeability

- Reference tracked challenge count: 8
- Reference all challenges have five groups: yes
- Reference target-track readiness: 8.6/10
- Current professional perfects: 0/8
- Current professional cleared rows: 2/8
- Status: `professional-perfect-routeability-regression-risk`

| Challenge | Stage | Cleared | Hits | Hit Rate | Target Rate | Perfect |
| ---: | ---: | --- | ---: | ---: | ---: | --- |
| 1 | 3 | no | n/a/n/a | 0 | 1 | no |
| 2 | 7 | yes | 33/40 | 0.825 | 0.95 | no |
| 3 | 11 | yes | 25/40 | 0.625 | 0.9 | no |
| 4 | 15 | no | n/a/n/a | 0 | 0.85 | no |
| 5 | 19 | no | n/a/n/a | 0 | 0.8 | no |
| 6 | 23 | no | n/a/n/a | 0 | 0.75 | no |
| 7 | 27 | no | n/a/n/a | 0 | 0.7 | no |
| 8 | 31 | no | n/a/n/a | 0 | 0.65 | no |

## Visibility

- Current risk stages: 7/8
- Missing full-sprite target proxies: 86
- Worst row: Challenge 7, Stage 27, 0.375 coverage
- Status: `full-target-visibility-regression-risk`

| Challenge | Stage | Layout | Full-Sprite Coverage | Missing Targets | P90 First Full Entry |
| ---: | ---: | --- | ---: | ---: | ---: |
| 1 | 3 | first-challenge-peel | 0.925 | 3 | 13.3 |
| 2 | 7 | scorpion-cross-sweep | 0.95 | 2 | 13.5 |
| 3 | 11 | stingray-crown-hook-hybrid | 1 | 0 | 12 |
| 4 | 15 | pink-serpentine-late | 0.525 | 19 | 13.2 |
| 5 | 19 | pink-green-cascade | 0.7 | 12 | 4.6 |
| 6 | 23 | green-ladder-split | 0.75 | 10 | 5.2 |
| 7 | 27 | yellow-diagonal-fan | 0.375 | 25 | 4.9 |
| 8 | 31 | blue-purple-finale | 0.625 | 15 | 4.4 |

## Next Steps

1. Refresh `npm run harness:check:challenge-stage-correspondence` against the current build so the 15.15s challenge-result path is reconciled with the preserved 4.401s target.
2. If the timing correspondence fails, reduce challenge-result ceremony timing using the smallest source timing change that preserves the canonical result/perfect cue without holding next-stage spawn for the full phrase plus an extra transition.
3. Add a multi-seed professional challenge routeability sweep after visibility is repaired; one deterministic row is risk evidence, not probability evidence.
4. Use Galaga object-track/contact-sheet vectors to repair target full-entry and late-stage speed/readability before subjective tuning.
