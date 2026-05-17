# Aurora Audio Promotion Stability Gate

Generated: `2026-05-17T12:57:33.115Z`

## Why This Exists

Focused audio candidate loops are not trustworthy enough by themselves because full-theme audio event-gap reads have measurable capture and segmentation variance. This gate requires a candidate precheck to beat the cue-specific measured noise floor before runtime audio can be tried.

## Decision Summary

- Cues evaluated: 3
- Runtime trials allowed: 0
- Stability rejections: 3
- Global promotion block: yes (19 volatile cues; share 0.905)
- Most important next step: Do not promote challengePerfect. Preserve the candidate/precheck evidence and either stabilize measurement or generate a candidate whose full-theme win exceeds the current stability threshold.

| Cue | Status | Current Risk | Stability | Candidate Delta | Gate Read |
| --- | --- | ---: | --- | --- | --- |
| `challengePerfect` | `stability-gate-reject` | 7.7 | range 2.49, threshold 1.88 | cue 6.71, segment 3.48 | Global audio scoring is unstable (19/21 cues volatile; most volatile captureBeam 3.89/10), so runtime promotion is blocked until scorer/capture stability improves. |
| `gameOver` | `stability-gate-reject` | 3.79 | range 1.34, threshold 1.16 | cue 2.75, segment 1.16 | Global audio scoring is unstable (19/21 cues volatile; most volatile captureBeam 3.89/10), so runtime promotion is blocked until scorer/capture stability improves. |
| `challengeTransition` | `stability-gate-reject` | 4.11 | range 1.12, threshold 0.86 | cue 2.37, segment 0.85 | Global audio scoring is unstable (19/21 cues volatile; most volatile captureBeam 3.89/10), so runtime promotion is blocked until scorer/capture stability improves. |

## Cue Details

### challengePerfect

- Blocker: Global audio scoring is unstable (19/21 cues volatile; most volatile captureBeam 3.89/10), so runtime promotion is blocked until scorer/capture stability improves.
- Warning: Cue is volatile across repeated full-theme reads (2.49/10 range); single-run wins must clear the noise floor.
- Win: Cue gap win 6.71/10 clears 1.88/10 stability threshold.
- Win: Worst-segment win 3.48/10 clears 1.41/10 stability threshold.
- Next: Do not promote challengePerfect. Preserve the candidate/precheck evidence and either stabilize measurement or generate a candidate whose full-theme win exceeds the current stability threshold.

### gameOver

- Blocker: Global audio scoring is unstable (19/21 cues volatile; most volatile captureBeam 3.89/10), so runtime promotion is blocked until scorer/capture stability improves.
- Warning: Cue is volatile across repeated full-theme reads (1.34/10 range); single-run wins must clear the noise floor.
- Win: Cue gap win 2.75/10 clears 1.16/10 stability threshold.
- Win: Worst-segment win 1.16/10 clears 0.45/10 stability threshold.
- Next: Do not promote gameOver. Preserve the candidate/precheck evidence and either stabilize measurement or generate a candidate whose full-theme win exceeds the current stability threshold.

### challengeTransition

- Blocker: Global audio scoring is unstable (19/21 cues volatile; most volatile captureBeam 3.89/10), so runtime promotion is blocked until scorer/capture stability improves.
- Warning: Cue is volatile across repeated full-theme reads (1.12/10 range); single-run wins must clear the noise floor.
- Win: Cue gap win 2.37/10 clears 0.86/10 stability threshold.
- Win: Worst-segment win 0.85/10 clears 0.65/10 stability threshold.
- Next: Do not promote challengeTransition. Preserve the candidate/precheck evidence and either stabilize measurement or generate a candidate whose full-theme win exceeds the current stability threshold.

