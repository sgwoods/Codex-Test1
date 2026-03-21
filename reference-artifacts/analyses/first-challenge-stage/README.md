# First Challenge Stage Baseline

Primary sources:

- original gameplay footage:
  - `/Users/stevenwoods/Documents/Codex-Test1/reference-video/original-galaga-7min.mp4`
- generated local contact sheet:
  - `/Users/stevenwoods/Documents/Codex-Test1/reference-analysis/challenge-check/original-challenge-sheet.png`
- manual-backed structure:
  - `/Users/stevenwoods/Documents/Codex-Test1/reference-artifacts/manuals/galaga-1981-namco/README.md`

Role in the project:

- baseline for issue `#9`
- reference for the first challenge-stage motion, spacing, readability, and
  scoring-window feel

## What the original appears to do

These are observations from the extracted challenge-stage sheet and should be
treated as visual/timing guidance rather than emulator-perfect internals.

1. The stage opens with a clean `CHALLENGING STAGE` splash and a brief empty
   board before targets appear.
2. Targets enter in clearly separated mirrored groups rather than one broad,
   continuously noisy sweep.
3. The action stays in the upper half of the board for a meaningful stretch,
   which gives the player time to sit in lanes and fire upward.
4. Lateral movement is present, but the sweep width is compact enough that the
   targets still feel lane-readable.
5. The downward peel-off happens later than our more aggressive challenge
   variants, which is one reason the original feels more scoreable.
6. The groups feel visually discrete. You can read the `5 x 8` structure, even
   when not every enemy is on screen at once.

## Current project gap

Our challenge stage currently has the correct manual-backed structure:

- `40` enemies
- `5` groups of `8`
- group bonuses
- perfect bonus

But it still differs from the original in ways that matter to feel:

- the scoring window is still too fragile
- group readability is not strong enough
- the targets become "moving exercise targets" too easily instead of reading as
  deliberate mirrored patterns

## What to tune against

For future challenge-stage passes, compare changes against these targets:

1. Delay the lower-field exit so the scoreable upper-band phase lasts longer.
2. Keep lateral sweep width compact and readable.
3. Preserve visible mirrored grouping so the `5 x 8` structure can be read.
4. Avoid broad smoothing changes that improve appearance but reduce hit rate.

## Measurable targets to add next

The current harness mainly tells us hit rate. For better challenge fidelity, we
should add:

1. average time spent above the mid-field line
2. maximum lateral sweep width per group
3. per-group clear timing
4. number of targets still alive when the first group starts peeling downward

Those would make future challenge-stage passes much less guessy.
