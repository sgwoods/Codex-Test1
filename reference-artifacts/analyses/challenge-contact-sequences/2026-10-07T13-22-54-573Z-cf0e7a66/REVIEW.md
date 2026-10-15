# Stage 31 Contact Review

October 7, 2026. Source cf0e7a66; seed 9131. See report.json for source,
bundle, method and image hashes. Eight sequences, 56 captures; both themes.
Current events are discovered, then independently replayed with asserted timing.
This is controlled-clock developer evidence, not a new hosted review.

| Target | First frame | Disposition |
| --- | --- | --- |
| 51406268 | 477 | Clear near-ship sprite overlap in crown frame 481; repair candidate. |
| 372665405 | 683 | Clear sprite overlap over the ship in crown frame 687; repair candidate. |
| 942182592 | 1290 | Edge contact; frame 1294 already separated. Not accepted from this alone. |
| 709114509 | 1302 | Lower-edge contact; frame 1306 already separated. Not accepted from this alone. |

Lead inspected these four post-contact crown captures. Diagnostics for all
events identify exit phase, applied lower-field bias 48, and no same-frame
zero-bias collision. Both themes reproduce the same IDs and contact frames.
That suggests shared geometry, not a theme-specific timing defect. It does
not prove that removing the bias is a safe repair: entry readability, dwell,
removal and target reachability can also change.

No gameplay source changed. Do not declare strict zero-contact acceptance or
original-fidelity failure from a box intersection alone. The first two sampled
visible overlaps remain a candidate blocker under the accepted visual contract.
Next: measure a bounded exit-only correction against persisted reference and
full-entry/dwell/cadence checks, or explicitly select a smaller release subset.
The successful-firing original footage does not establish missed-target exits.
