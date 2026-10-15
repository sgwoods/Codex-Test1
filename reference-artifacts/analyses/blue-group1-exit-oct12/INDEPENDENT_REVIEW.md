# Independent Group1 Review

Reviewed 2026-10-12. Verdict: accept bounded Stage31 group1 benefit. User/lead accepted bounded integration after review. No release, perfect-route, or exact reference-fidelity acceptance.

## Final Guarded Identity

Baseline: cf0e7a666067ede385865ba02e73d1454eb132d1; frozen baseline bundle: d86e64702c5174e791409385c81901817af4e750d56a68e7a39c3eb311ff24b5.

Candidate root: /private/tmp/aurora-blue-group1-exit-oct12.
SHA-256 values independently rechecked against current bytes:

- src/js/06-enemy-behavior.js: 86e6734ad04f8147e68f3a08d56c2e1db054c7fca902aa93dce545937854a3b4
- dist/dev/index.html: d11dd413f07ddb0a34e9a8f5ef2c4b5677a81d6dfffe37ab413876d3c17f9ca8
- private-artifacts/blue-group1-exit/nofire.json: b075fcd27b7ad0c76b15f4a5587ce7eae5ce1f29a478025d346cdc76e5686041
- private-artifacts/blue-group1-exit/pilot-replay.json: f99f7786a4bbbdd420886e27e207938abca562ccb8a2fc4a034e85c0403dbebf
- private-artifacts/blue-group1-exit/lifecycle.json: 8552c6932e5a7c53d72eb01f7bfb3dc416749bac591bc3e3ef6140d38c7e008a

Final summary: /private/tmp/aurora-blue-group1-exit-oct12/reference-artifacts/analyses/blue-group1-exit-oct12/summary.json. Its report hashes match the files above. Nofire source/bundle, pilot candidate bundle, and lifecycle candidate bundle agree. Superseded unguarded reports were not accepted. Independently parsed saved replay data confirms candidate/baseline ordered gameplay events and gameplay projection equality.

## Bounded Findings

Source lines 652-666 restrict the change to generic Stage31 wave0 blue-purple-finale paths; reference/motion-spec paths are excluded. Positive finite-span checking protects the retained velocity estimate. Departure continuity uses a finite-difference tangent, not an exact analytic prior derivative. The y asymptote is 300 + 0.12 * (previous.dy - (300 - previous.y) / 1.2), approximately 288-292px for measured survivors, not exactly 300px. Existing removal rules remain unchanged.

Final packet records contacts 3->2, unchanged 22.083s clear, eight pre-exit trajectories and 32 unaffected targets preserved, and Stage3/35/39 controls. Saved-input pilot retains the same 37 kills, 80 shots, zero losses. Group1 footage supports qualitative sideward departure only, not these exact rates/heights.

## Player-Glyph Correction

The author's summary claim that Classic426 lacks the player glyph is false. Direct read-only PNG decoding verified each of all ten retained capture hashes against nofire.json. For each 1440x1800 PNG, RGB values at all 85 previously established player draw-rectangle sample coordinates matched the corresponding saved final glyph colors: 85/85 in both aurora-crown and classic-arcade at frames 390, 408, 426, 444, and 480. Lead subsequently confirmed Classic426's centered lower-field player visibly present using view_image.

Coordinate/color provenance: /private/tmp/aurora-green-render-review-oct12/private-artifacts/repo-mirror/reference-artifacts/analyses/player-capture-diagnosis-oct12/report.json, candidate records for each theme, captures[0].rects (x, y, final). Method: parse PNG chunks, concatenate/inflate IDAT, reverse scanline filters, compare decoded RGB at floor(x), floor(y) to final[0..2]. No browser rerun, bounds-only inference, or image mutation was used.

Limits: these samples prove sampled glyph presence, not an exhaustive alpha mask, all-frame visibility, or collision/render equivalence. Nonblank screenshots alone are not acceptance evidence. Two group5 contacts, baseline middle-phase removals, and universal shooting opportunity remain unresolved. Controlled one-seed replay is not human-reactability, perfect-route, natural-wallclock, or public-package proof.

Review operations were read-only and completed successfully. This document is the sole newly authorized write, confined to the independent isolated analysis; lead source/builds were untouched.
