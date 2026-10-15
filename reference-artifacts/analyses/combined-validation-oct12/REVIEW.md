# Combined candidate bounded validation

Baseline: cf0e7a666067ede385865ba02e73d1454eb132d1. Real browser tests completed October 12, 2026 using existing cached Chromium, natural challenge launches and controlled 60 Hz advancement. No gameplay edits, rebuild, commit or publication.

## Identity

- Copied candidate bundle SHA256: 154d9621803bd1f176867b13764f752ce8b5ac321072d4cadbd2e2164acaf28a.
- Archived candidate enemy source SHA256: f909c43241f156452a050ea899c569b47c70d8ac1160fff6170c0e0c7b7ec259.
- Original baseline bundle SHA256: 58cc0c3436c8b4a30500eefb91850a80cb862f8e263a5715f96cee0470188f83.
- Original baseline enemy source SHA256: 1456799e1fadd17e9fc65ce387abd64811a67231ed1bdc866b914ac40f2d8815.
- Shot method SHA256: 28db70e8eeb867f377ee66070ef74b1b65524e3ca54f4217e37ab819a0f27f78.
- Entry-cull method SHA256: 7fa34a6ee59fd5e400b3b73f4ebb84980a2d830aeff43026f8fc4941e406eebf.

## Results

164 fresh one-shot trials, seed 9131, launch times 5.0 through 9.0 seconds in 0.1-second increments. Ordinary ArrowRight movement and one Space pulse; no assigned positions. Every trial verified exactly one single-ship bullet and recorded actual shipX/velocity and first-hit ID.

Both artifacts: right30 target 372665405 hit 13/41, other first hits 28/41; right40 target hit 20/41, other first hits 21/41; no misses. Right40 all 41 matched positions, first-hit IDs and kill times exactly. Right30 30/41 matched positions and outcomes exactly; two outcome differences at 5.6 and 8.5 seconds have different recorded shipX (256.73 versus 259.93), so exact preservation at those edge times is not claimed. Right40 target witnesses are 5.5-6.3 and 8.0-9.0 seconds, inclusive at 0.1-second spacing.

Four actual no-fire browser runs: baseline/candidate Stage31 and Stage3. All reached 40/40 full sprite-bounds entry, zero entry-phase removals, zero bullets/attackers and all removals marked miss. Stage31 both completed at 1325 frames (22.0833 seconds), with 24 exit and 16 middle-phase removals. Candidate seven upper removals were exit-phase and had full entry. Stage3 both completed at 1368 frames (22.8 seconds), all 40 removals exit-phase; complete per-target trajectories/removals matched exactly.

## Verdict and limits

PASS for bounded early-shot witness preservation, full-entry/entry-cull regression and actual Stage3 control only. Not overall keeper/release acceptance. One seed per stage, independent shot restarts, no all-target perfect-route proof. Full entry is rectangle-bounds evidence, not rendered-pixel or continuous-visibility acceptance. Stage31's unchanged 16 middle-phase removals prevent interpreting this as complete authored-path conformance. No audio or contact-safety acceptance was performed here. Tested copied artifact identity, not the testing checkout's gameplay source, is authoritative.

## Evidence

Public machine-readable summary: summary.json. Private raw reports and copied candidate artifact: ../../../../private-artifacts/repo-mirror/reference-artifacts/analyses/combined-validation-oct12/. Exact raw paths/hashes and build metadata are in summary.json. Reproducer: summarize.js; harnesses: tools/harness/measure-challenge-shot-witnesses.js and tools/harness/check-combined-entry-cull.js.
