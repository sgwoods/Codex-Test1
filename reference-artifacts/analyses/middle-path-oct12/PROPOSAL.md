# Single Clearance Candidate

Lead-approved trial, October 12, 2026. No acceptance or deployment implied.

Only selected generic green-ladder-split and yellow-diagonal-fan paths at
Stage 31 and later, after entry, are in scope. Transform the final composed y
after existing offsets and Stage 31 continuation:

```js
y = y <= 300 ? y : 300 + 14 * (1 - Math.exp(-(y - 300) / 14));
```

The map is identity through 300, has matching first derivative at 300, and
approaches 314 without a hard clamp. Recorded unrotated sprite bottom offset
is 7, giving a conservative 2.6-unit gap to the proposed player band at 323.6.
The actual rendered ship top in these captures is 328.42. These are engineering
clearance limits, not measurements of canonical Galaga path coordinates.
Rotation and sampled/body-bound limitations require explicit disposition.

Keep the Stage 31 continuation cache raw; transform only once after evaluating
it. Preserve x, local time, entry, spawn schedule, normal input and shot rules.
Keep Stage 3, blue paths, unrelated families and reference evaluators unchanged.
This does not repair the existing later green/blue exit join discontinuities.

Acceptance requires actual replay of saved Stage 31 and Stage 35/39 normal-key
witnesses, full entry, unaffected-path controls, middle/exit clearance checks,
natural completion and relative result cadence, plus representative 63/127.
Report dwell and removal changes: unchanged removal code does not guarantee
unchanged removal behavior when y no longer reaches the bottom threshold.
One candidate only. Preserve and reject on demonstrated shot loss or another
material regression; do not vary parameters in a sweep.

## Lifecycle Correction During Validation

The first envelope revision preserves all tested shot IDs/events, but extends
the measured last-visible-to-clear tail from about 0.24s to 0.916s at later
stages. Its unchanged clear-to-spawn delay is not a complete pacing pass.
The lead authorized a narrow lifecycle correction, not a motion-parameter
sweep: retain the 300/14 envelope and visible trajectories, but retire a
scoped later-stage target once its conservative body is wholly offscreen and
departing outward after u=9.7. Verify the bound covers both themes and rounding.
Do not apply this retirement to Stage 31's separate turning continuation.

Archive revision A and test corrected revision B independently. Preserve
normal-key shots, entry and unrelated controls; measure actual last-visible
time, clear and next spawn separately. Any changed opportunity to hit already
offscreen targets must be disclosed. No revision is accepted merely because
the original tail cause is understood.
