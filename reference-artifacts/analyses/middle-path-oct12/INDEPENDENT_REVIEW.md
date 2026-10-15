# Revision B and reusable gate review

Read-only independent review, 2026-10-12; no builds/browser execution/lead edits.

Source independently hashed5ec66e40d512d27fb22f4826ac4321328bd9d0979719b49dfea68ccb47713c89; index a97edcea99f40fe2db38e8b4f3b4b5f7857b64551bb6f02204b482c19d9ff3cc. Current isolated shots.json/runtime.json match both. summary.json remains revision A (8258cb/578de76); do not cite it as final B evidence.

## Source

No identified source blocker for bounded lifecycle testing. Formula300/14 unchanged. Retirement scopes generic stage>=35 green/yellow,u>=9.7,dive9,no hit/carry. Signed slope matches generic exit formula (common positive /3.35 factor omitted harmlessly for sign). Route curve and lane-bias oscillation excluded; spacing must saturate. Constant route/deconflict offsets are already saturated at this phase. Stage31 returning continuation excluded.

Rounded center plus enemyDims.w/2+1 is conservative relative to retained two-theme bounds (-11.4..11.4 versus dimensions32..38). These bounds exclude hit/carry, as does retirement. This is sampled sprite-bound evidence, not exhaustive pixel masks or future-theme guarantee. Revision changes invisible lifetime, not motion parameters. Offscreen shot opportunity can change; require actual shot-witness regression checks separately.

Current B shots: independently deep-equal input traces and ordered events excluding the three asynchronous arcade-music status types; zero lost/gained/changed IDs31/35/39. Runtime clear31 remains21.417;35/39/63/127 clear12.133 (A12.833). Clear-to-spawn~4.434. These results do not alone attest final process completion or reusable gate PASS.

## Gate

Lead tools/harness/check-challenge-late-clearance.js method SHA cf02eb64822bc588f8e4f2a0f8933a0beb3ec1e323e98509cafda25f708e45a0. package script maps directly to it. Ten fixed seed/theme cases,40 initial/at-least-once-full targets,16 scoped families, geometry/contact assertions, natural progression, <=.4 empty tail and4.401+/-.1 cadence are bounded useful checks. Baseline-gate.json currently reports all10 red specifically for scoped row exposure, not lifecycle.

Two small actionable assertion gaps:

1. No-fire claim is not asserted: maxBullets reads enemyBullets only; playerBullets/player_shot are never checked. Add explicit zero player shots/bullets, so accidental automatic firing cannot shorten empty tail or remove unsafe targets and pass.
2. Theme field is the requested string only; resolved graphics theme is not recorded/asserted. A sanitized/fallback theme could produce two nominal theme rows for one actual renderer. Assert resolved graphicsTheme from harness graphics diagnostics.

Limits: fullEntries means at least one full sample, not continuous entry. Bounds captured initially use two flap poses, exclude rotation/hit/carry and are not raster alpha proof; relevant no-fire challenge dive9 makes unrotated estimate appropriate. Empty tail is viewport-intersection proxy across all enemies, not actual pixel visibility or per-target offscreen retirement proof. This gate does not compare baseline trajectories/shot events, Stage3, all seeds, moving controls, dual ships, or perfect feasibility. Keep separate B replay/source/control checks. Zero geometry is this narrow candidate's selected clearance criterion, not a new universal rule rejecting every nonlethal overlap.

## Disposition

Revision B eligible for bounded acceptance review; original A empty tail unaccepted. Require final B empty-tail/two-theme gate result, the two assertion gaps above addressed or explicitly checked in accompanying evidence, and correct B summary/provenance before acceptance. Longer visible low-field dwell remains provisional noncanonical pacing; green joins/blue contacts remain open.

## Final bounded disposition

Latest summary is now explicitly B and its runtime/shot report hashes independently match actual files. exit-bounds.json now binds a97edcea, contains8 theme/stage rows of16 targets, and has zero extent violations: all measured left/right extents are enclosed by dimensions.w/2+1. Rounded retirement comparisons are strict and outward; no source blocker identified.

Lead candidate-gate.json binds a97edcea and reviewed method cf02eb64; all10 rows have empty errors and pass=true. minDrawGap2.6, minBodyGap>=9.6,40 full-entry proxies,16 scoped targets; later emptyTail.216 and31.234; cadence4.433-.434. Later clear12.133 vs baseline11.733-11.767 remains changed absolute pacing; last-visible11.917 accounts for roughly.38-.43s additional visible opportunity, not an additional empty wait. This is a bounds-based last-visible proxy, not alpha-pixel timing proof.

Approve B as a strictly bounded provisional clearance/lifecycle keeper, subject to the pending final shot rerun retaining the already independently confirmed B witness equality. The two reusable-gate assertion gaps remain hardening recommendations: this PASS does not independently prove resolved-theme identity or absence of player firing. Separate normal-human/no-fire runtime and actual rendered frames support current packet; do not turn that into broader future-test coverage. No beta readiness, all-contact closure, canonical pacing, all-seed or perfect-feasibility approval. Green joins/blue contacts remain open. Revision A's.916s tail remains rejected, not retroactively accepted.

Stale visibility-tail.json in current directory still describes A; use B summary.revisionComparison and lead B gate instead. Preserve A provenance and label that file rather than using it as B evidence.
