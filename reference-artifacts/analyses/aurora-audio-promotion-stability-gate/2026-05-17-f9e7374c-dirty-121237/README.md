# Aurora Audio Promotion Stability Gate

Generated: `2026-05-17T12:12:37.405Z`

## Why This Exists

Focused audio candidate loops are not trustworthy enough by themselves because full-theme audio event-gap reads have measurable capture and segmentation variance. This gate requires a candidate precheck to beat the cue-specific measured noise floor before runtime audio can be tried.

## Decision Summary

- Cues evaluated: 3
- Runtime trials allowed: 3
- Stability rejections: 0
- Most important next step: Run a guarded live runtime trial for challengePerfect; promote only if live audio comparison, event-gap rollup, cue alignment, and quality scoring still hold or improve.

| Cue | Status | Current Risk | Stability | Candidate Delta | Gate Read |
| --- | --- | ---: | --- | --- | --- |
| `challengePerfect` | `stability-gate-runtime-trial-allowed` | 7.03 | range 1.96, threshold 1.8 | cue 6.04, segment 2.92 | Cue gap win 6.04/10 clears 1.8/10 stability threshold. |
| `gameOver` | `stability-gate-runtime-trial-allowed` | 2.45 | range 0.23, threshold 0.2 | cue 1.41, segment 1.9 | Cue gap win 1.41/10 clears 0.2/10 stability threshold. |
| `challengeTransition` | `stability-gate-runtime-trial-allowed` | 3.75 | range 1.07, threshold 0.8 | cue 2.01, segment 1.67 | Cue gap win 2.01/10 clears 0.8/10 stability threshold. |

## Cue Details

### challengePerfect

- Warning: Cue is volatile across repeated full-theme reads (1.96/10 range); single-run wins must clear the noise floor.
- Win: Cue gap win 6.04/10 clears 1.8/10 stability threshold.
- Win: Worst-segment win 2.92/10 clears 1.3/10 stability threshold.
- Next: Run a guarded live runtime trial for challengePerfect; promote only if live audio comparison, event-gap rollup, cue alignment, and quality scoring still hold or improve.

### gameOver

- Win: Cue gap win 1.41/10 clears 0.2/10 stability threshold.
- Win: Worst-segment win 1.9/10 clears 0.15/10 stability threshold.
- Next: Run a guarded live runtime trial for gameOver; promote only if live audio comparison, event-gap rollup, cue alignment, and quality scoring still hold or improve.

### challengeTransition

- Warning: Cue is volatile across repeated full-theme reads (1.07/10 range); single-run wins must clear the noise floor.
- Win: Cue gap win 2.01/10 clears 0.8/10 stability threshold.
- Win: Worst-segment win 1.67/10 clears 0.18/10 stability threshold.
- Next: Run a guarded live runtime trial for challengeTransition; promote only if live audio comparison, event-gap rollup, cue alignment, and quality scoring still hold or improve.
