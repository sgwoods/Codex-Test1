# Native Bottom-Field Reference

Baseline: 721ac9a006da1bee102f7c51ef2dfdea6d5d8b14.
Primary video and SHA-256 are recorded in manifest.json. Extraction uses decoded
native PTS selection, not FPS resampling. There are 60 frames per two-second
window, 120 total; all PNG hashes were independently verified.

Inclusive visible-envelope labels below have approximately two-pixel boundary
uncertainty and are not engine collision rectangles. Coordinates refer to native
PNG pixels, not contact-sheet tiles.

| Frame | Native PTS | Source frame | Player envelope | Intact alien envelope | Horizontal gap |
| --- | --- | --- | --- | --- | --- |
| lower-left/frame-00021.png | 246.166667 | 7385 | 211,321 to 230,340 | 115,302 to 131,321 | 80px |
| lower-right/frame-00026.png | 249.833333 | 7495 | 244,321 to 263,340 | 280,282 to 299,301 | 17px |
| lower-right/frame-00041.png | 250.333333 | 7510 | 244,321 to 263,340 | 284,283 to 303,301 | 21px |

Independent specialist identified recognizable intact bodies with high confidence
in these samples. The leading firing-column region in the last frame is obscured
by an explosion; object identity there remains unresolved. Compression, effects
and active shooting limit whole-trajectory inference.

These samples show visible separation during active shooting. They establish
neither original-game body overlap nor universal stationary/no-fire clearance.
There is no grounded mapping from these trains to Aurora numbered wave/contact
times. Keep the current zero-contact gate unchanged pending the human's explicit
acceptance decision and further reference evidence.

Capture tool: tools/harness/capture-challenge-bottom-reference.js.
Contact sheets sample every fifth native frame; use full frames for judgments.
The primary video remains in private local storage; off-machine backup is not
established by this packet.
