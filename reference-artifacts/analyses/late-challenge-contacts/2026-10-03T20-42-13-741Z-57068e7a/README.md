# Late Challenge Contact Diagnosis

October 3, 2026. Baseline 57068e7a. Diagnosis keeper only; no gameplay repair.
Run: node tools/harness/diagnose-late-challenge-contacts.js.
Normal developer challenge launch, stationary human/no-fire, 60Hz, one seed
per Stage 31/35/39 (9231/9235/9239). Runtime report includes method/bundle/source
hashes. Enemy behavior and collision source match the accepted baseline exactly.

## Measured Result

| Stage | Contact Events | Rectangle-Overlap Samples | Same-Frame Zero-Bias Overlap Samples Elsewhere |
| --- | --- | --- | --- |
| 31 | 4 | 16 | 2 |
| 35 | 3 | 20 | 2 |
| 39 | 7 | 36 | 3 |

All actual overlap samples are during generic exit motion, path times about
11.535-12.527s, with the full 48px lower-field bias. Subtracting 48px clears each
actual overlap sample but predicts overlaps at other retained samples, involving
2/2/3 distinct IDs. Those are not alternate-run contact counts.
Contacts/events exactly match the previous yellow-candidate packet. No enemy
bullets, attack starts or losses occur; targets finish each tested stage.

Stage 31 events: 51406268 at 7.967s (blue-purple-finale wave0/lane4),
372665405 at 8.667s (green-ladder-split wave1/lane7), 942182592 at 11.167s
(blue-purple-finale wave4/lane5), 709114509 at 11.367s (same path wave4/lane7).
No yellow-diagonal-fan event occurs. All contacts remain nonlethal.

The repeated green event and final blue exits are the first diagnosis targets.
The 48px bias is a contributor, not a proven single-knob cure. Do not delete it
or cut off visible targets just to pass a zero-contact count.

## Primary Reference

Persisted source:
private-artifacts/repo-mirror/reference-artifacts/analyses/challenge-visibility-oct03/challenge-all2.mp4.
SHA256: 8d29ea711d09d243a2904bf9538981d97fe1fa323e4f920177688fa2b4c4c840.
Manifest: reference-artifacts/analyses/galaga-challenge-video-reference/latest.json.
Original Challenge 8 window begins at source 241s. No distinct Challenge 9/10
window establishes Stage 35/39 choreography in this archive.

primary-challenge8-contact-sheet.jpg: source 241-257s, ffmpeg fps=1,
scale=384:288, tile=4x4. Native frame PNGs use requested seeks 246.166667,
249.833333 and 250.333333s; decoded frame selection is approximate to native
30fps timing, not an asserted exact decoded PTS ledger.

Independent visual/color-component review observes intact trains low left around
246.167s and low right around 249.833s, horizontally separated from the player.
At 246.167s, thresholded alien-colored components span source x103-141/y302-321,
player-colored pixels x216-225/y330-340. At 249.833s, intact train components
x304-371/y292-320, player-colored pixels x250-259/y332-340. These are component
bounds, not complete sprites/collision rectangles. Effects/shots must be labeled
separately; a narrow component near the firing column is not a proven alien.
The inspected frames do not prove either universal zero contact or original
alien-body contact. Active shooting can censor a body's full trajectory.

Next primary labeling intervals: native frames around 245.5-247.5s and 249-251s.
Retain full frames and bottom crops, decoded PTS, player/body identity confidence,
shots/explosions, separation and actual pixel overlap. Align wave-event anchors,
not original seconds directly to runtime contact times. Existing tracks discard
the bottom 12.5% of ROI and cannot answer this question.

## Limits And Decision

Instrumentation does not assign enemy/player state, advance time, call RNG or
log events. The drawn-bounds helper temporarily intercepts rendering operations
on copied enemy objects; approximate pose unions are not pixel-overlap proofs.
preBiasY means final Y minus this bias, not raw Y before every route modifier.
Body overlap is rectangle geometry; player collision eligibility is separate.
Phase thresholds describe these generic late paths, not arbitrary evaluators.
Sampling is restricted by original biased y300-375 and horizontal distance60;
zero-bias overlaps outside that sampling window are omitted.

Fresh strict regression check after instrumentation:
../../yellow-challenge-entry/2026-10-03T20-45-44-291Z-57068e7a/report.json
Geometric and yellow-specific checks pass; global-contact assertion still FAILS.
Independent source/data review found no diagnostic blocker. No gate disabled,
no parameter tuning, no professional sweep and no publish.
Resolve the reference-backed contact contract before proposing a repair or gate
revision. Source is a local engineering candidate, not a release-approved RC.
