# Stage 1 Opening Spacing Correspondence

This artifact compares the current stage-1 opening geometry against the shipped local baseline and the expected rack-layout constraints.

## Sources

- Profile: `tools/harness/reference-profiles/stage1-opening-spacing.json`
- Baseline root: `dist/production`
- Current root: `dist/dev`

## Summary

- Within geometry tolerances: yes
- Changed targets: 0
- Max target drift: 0
- Average target drift: 0

## Layout

- Baseline gx/gy: 17 / 14
- Current gx/gy: 17 / 14
- Baseline bounds: {"count":40,"minTx":63.5,"maxTx":216.5,"minTy":28,"maxTy":70}
- Current bounds: {"count":40,"minTx":63.5,"maxTx":216.5,"minTy":28,"maxTy":70}

## Read

- This is a correspondence report, not a hard claim that the current geometry is correct or incorrect in isolation.
- Use it to see whether the current candidate stayed close to the shipped local baseline while also respecting the expected rack layout constraints.
- Expand this same pattern later into more explicit historical formation references if we add stronger preserved Galaga spatial baselines.

