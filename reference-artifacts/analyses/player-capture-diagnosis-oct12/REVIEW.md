# Player capture diagnosis and correction

Baseline cf0e7a666067ede385865ba02e73d1454eb132d1; own isolated /private/tmp/aurora-green-render-review-oct12. Lead ACTIVE_WORK/AGENT_WORKFLOW read. No gameplay edits, builds, lead writes, commit or publication.

## Conclusion

Withdraw the earlier missing-player observation. Actual retained original PNGs at frames540/660/780 in both themes contain the player: all85 traced glyph-center pixel samples match final glyph RGB exactly. The paced candidate's same six retained PNGs also match85/85. This is specific glyph-pixel evidence, not a nonblank count. No runtime visibility defect, intended blink, or candidate regression was found. The discrepancy is between prior visual interpretation/presentation and retained PNG pixels; the exact preview/display cause is not diagnosed. Do not describe an established GPU or render-clock bug.

## Evidence and clock boundary

Copied baseline bundle SHA25658cc0c3436c8b4a30500eefb91850a80cb862f8e263a5715f96cee0470188f83 versus copied candidate154d9621803bd1f176867b13764f752ce8b5ac321072d4cadbd2e2164acaf28a. Four natural Stage31 contexts: both artifacts x Crown/Classic, seed9131, human stationary/no-fire, controlled60Hz. At9/13 seconds, diagnostic-only CanvasRenderingContext2D.fillRect wrapper records calls whose stack contains drawPlayerBody, unchanged arguments/return values, transforms, alpha, composite and resulting pixel centers. Each redraw executes85 rectangle calls; all85 samples are colored after drawing. With immediate readback enabled, all85 calls also produce colored pixels immediately. Trace only instruments drawing, never assigns gameplay positions/state.

Source21-render-board.js:989-990 draws unless spawn/pending guard or invulnerability blink; recorded absent and visible old report frames all have inv0, spawn0, pendingfalse, capturedfalse. Blink uses Math.floor(p.inv*14)%2, a simulation countdown, not performance.now. drawFighterSprite(:476-480) calls synchronous drawTargetSpriteRows(:321-341), so no sprite image-loading race applies. drawPlayerBody(:617-641) computes bounds after drawing: debug bounds alone are insufficient pixel evidence.

90-harness.js:252-266 advanceFor advances simulation then calls draw synchronously, including seconds0. Controlled RAF loop at:2342-2345 schedules the next frame and returns without update/draw. performance.now drives backdrop/postfx animation independently, not the observed player blink. A RAF wait does not guarantee a redraw under controlled clock.

Initial original-color comparison matched84/85 because later overlapping ship rectangles paint the remaining location red[255,51,71], replacing its earlier white fill. Comparing final traced colors, rather than each rectangle's original fill, gives85/85 in all12 checked PNGs. Sampling glyph centers is not a full alpha-mask/edge or all-frame proof, but decisively contradicts whole-player absence in the alleged failed frames.

## Persistence and reusable recommendation

Private root: /private/tmp/aurora-green-render-review-oct12/private-artifacts/repo-mirror/reference-artifacts/analyses/player-capture-diagnosis-oct12/. report.json has baseline/candidate hashes, method hash,16 draw traces and diagnostic PNGs; retained-pixels.json has exact original/ paced PNG hashes, coordinate/color samples and pixel-parser method hash. Scripts tools/harness/diagnose-player-capture.js and check-retained-player-pixels.js remain isolated diagnostics. Original captures unchanged. Original capture method archived in private green-render-review-oct12/capture-method-original.js, verified hash0929e11c75745f084a148f5d16b051f41807953d5ec38329b553e46f4995f739.

Recommended small capture improvement: separate advancement and capture calls; call advanceFor(0) explicitly for a controlled-clock redraw, capture player state and draw transform together, assert a final glyph-color pattern in a small player ROI, then save the full PNG with hash. Decode saved PNG pixels as well when preview and diagnostics disagree. Preserve any mismatching bytes and report failure; never silently retry into acceptance. No sleep/RAF or broad renderer refactor is justified by this result.

All successful browser subprocesses exited0. An initial invocation without supplied browser environment failed launch and was terminated exit130 to close its server; no test evidence came from it. Correct-env diagnosis, retained-PNG checks and paced capture completed normally. Input/copied bundle hashes unchanged. Limits: one seed, stationary player, selected frames, diagnostic readback changes canvas scheduling; no full-route/contact/audio/release acceptance.
