# Stage31 combined candidate rendered/source review

October 12 correction: the later player-capture-diagnosis-oct12 packet verifies
85/85 player-glyph samples in the questioned saved PNGs. The preview-based
missing-player observation below was incorrect; no player-render defect was
demonstrated. Preserve the original observation as audit history, not an open
gameplay blocker.

Verdict: CONDITIONAL for bounded green exit lifecycle only; NOT ACCEPTED as reference-conformant departure pacing or overall Stage31 keeper. Slow upper transit is an explicit visual/pacing issue requiring lead disposition, not a screenshot-nonblank pass.

## Identity and method

- Review checkout: /private/tmp/aurora-green-render-review-oct12, detached baseline cf0e7a666067ede385865ba02e73d1454eb132d1.
- Input: /private/tmp/aurora-upper-exit-lifecycle-oct11/dist/dev, copied unchanged to private packet package/. No build performed.
- Bundle SHA256: 154d9621803bd1f176867b13764f752ce8b5ac321072d4cadbd2e2164acaf28a.
- Enemy source SHA256: f909c43241f156452a050ea899c569b47c70d8ac1160fff6170c0e0c7b7ec259; exact complete source text verified embedded in bundle.
- Capture method: tools/harness/capture-green-render-review.js, SHA256 0929e11c75745f084a148f5d16b051f41807953d5ec38329b553e46f4995f739.
- Served build: 1.4.1.1+build.1226.sha.cf0e7a66.dirty, development; build timestamp October 11 2026. Dirty candidate source, not clean baseline gameplay.
- Final capture run completed exit 0. Single seed 9131, stationary human/no-fire natural Stage31 challenge launch, controlled 60 Hz. Two independent theme contexts: aurora-crown/classic-arcade. Native full canvas PNGs at 6, 9, 11, 11.2, 11.4, 13, 16, 18, 20, 22.1 seconds. Short browser yield plus zero-time redraw at captures; no player/target state assignments.
- report.json contains build metadata, frame hashes, contact events, snapshots and removals. Private root: /private/tmp/aurora-green-render-review-oct12/private-artifacts/repo-mirror/reference-artifacts/analyses/green-render-review-oct12/. It contains 20 PNGs, two per-frame samples JSONs, copied package and candidate-enemy.js. Candidate input and copied bundle hashes unchanged after execution.

## Rendered departure and reference limitation

Direct visual inspection included Crown frame660 (11 seconds) and frame960 (16 seconds): full player and reserves visible, aliens rendered, uncropped board. These show the upper group still present while subsequent groups traverse the board. The measured seven top departures finish at 16.217 through 17.717 seconds, approximately 6.07 through 7.37 seconds after each target first reaches u>=9.7. One other green target, 775953348, exits horizontally left at 10.317 seconds; this is not an all-target upward-right exit.

Source 06-enemy-behavior.js:657-660 asymptotically drives x at +3 and y at -30 per path-time unit after a 0.35-unit velocity easing. It therefore gives a predominantly vertical lingering departure, not a short upper-right sweep. This is a concrete pacing/direction concern. Do not label it reference-conformant solely because upper culling and shot opportunities pass.

Original persisted reference: lead reference-artifacts/analyses/STAGE31_SURVIVOR_SCREENING_OCT07.md:26-34 and private challenge-visibility-oct03/galaga-stage31-group2-exit-01..04.png. Directly inspected -03: two intact survivors near upper right. Four settled samples span 1235.075725 to 1236.575716; last two have unchanged score186400 and no visible survivors in -04, supporting surviving departure within the final half-second. This does NOT identify all lanes, complete uncensored departure duration, or exact phase mapping. Thus the evidence rejects an exact-fidelity claim, but cannot supply an exact replacement duration. No new video or route sweep is justified here.

## Source safety and residuals

- Top gate (candidate 06-enemy-behavior.js:671-673) requires Stage31, green-ladder-split, u>=9.7 and a saved exit pose, then Math.round(e.y)+enemyDims(e).h<0. Renderer 21-render-board.js:531 uses the same rounded translation. Rotation at :532 applies only dive1/4; these challenge targets are dive9. enemyDims at :422-426 uses full nominal height26..30, rather than half height, making this a conservative nominal-box top exclusion for this path. It is not a measured arbitrary-theme alpha-pixel envelope or proof for future rotated/art-expanded sprites.
- Largest green per-frame coordinate jump remains 101.7836 units at frame395 (6.583 seconds), target261787956, u3.130->3.159. This preexit discontinuity is unresolved. Rounded harness coordinates are diagnostic, not rendered swept-motion proof.
- Largest sampled step wholly after exit threshold is 1.0107 units; this statistic excludes a step crossing u9.7 and is not a full continuity proof.
- Both themes record three nonlethal contacts at 7.967, 21.517 and 21.717 seconds (IDs51406268,942182592,709114509), lives remain3. No blanket contact/sprite-overlap acceptance follows.
- Capture limitation: some key PNGs omit player/reserve glyphs despite valid snapshot/debug bounds (e.g. Crown frame540 and Classic frame780). Other inspected frames show them fully. Cause is unclassified; neither a candidate regression nor a capture-only fault is established. Colored-pixel >100 checks reject blank canvas only, not missing ship, overlap or visual conformance. Therefore the complete requested rendered-player-at-every-key-time criterion is not accepted.

## Independent companion evidence and decision boundary

Read /private/tmp/aurora-stage31-exit-trial-oct08/reference-artifacts/analyses/combined-validation-oct12/REVIEW.md. Same candidate hashes: 164 bounded baseline/candidate one-shot trials preserve aggregate target witnesses13/41 right30 and20/41 right40, with recorded movement variation qualification; full entry40/40 and zero entry culls, Stage31 completion22.0833 seconds; Stage3 trajectories/removals exact. These are Nash's executed checks, not rerun here. Stage31's 16 middle-phase removals exist in both artifacts and are not introduced by this top-exit repair; they still prohibit complete authored-path acceptance.

Smallest next action: lead explicitly decides whether the measured slow vertical departure is an intentional bounded lifecycle compromise. If intended acceptance includes original departure pacing/direction, this candidate is pending/rejected on that criterion; use the retained short reference segment for a bounded timing decision, not another endpoint-only tuning sweep. Render capture uncertainty remains separate. No need to repeat Nash's entry or early-shot tests solely for this review. No gameplay edit, build, commit, publish, shared localhost change or IAB interaction occurred. All browser subprocesses completed.
