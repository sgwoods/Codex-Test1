# Guardians Persona Full-Run Baseline

This folder tracks the canonical whole-run persona-review lane for `Galaxy Guardians`.

Current canonical surfaces:
- `latest.json`
- `latest.md`
- `guardians-full-run-persona-intermediate-latest.json`
- `guardians-full-run-persona-intermediate-latest.md`
- `guardians-full-run-persona-advanced-latest.json`
- `guardians-full-run-persona-advanced-latest.md`

The underlying generated session/video artifacts are intentionally kept out of
the public repo. The committed files in this folder are metadata summaries for
the current canonical baseline.

The default full-run reviewer uses the `advanced` harness key, which is the repo's **Intermediate** persona label.

## Current Intermediate Baseline

Latest canonical review run:
- persona: `Intermediate` (`advanced`)
- stage reached: `2`
- final score: `2920`
- sim time before game over: `237.167s`
- ship losses: `3`
- stage clears: `1`
- stage advances: `1`
- dominant loss cause: `alien_scout_collision` (`2`), with the middle loss still `enemy_shot`
- video-bearing review artifact: present

The important change from the earlier baselines is that the default whole-run reviewer is now truly multi-stage and meaningfully watchable:
- earlier baseline: died on stage `1` at `36.35s`
- first improved baseline: died on stage `1` at `72.15s`
- second improved baseline: died on stage `1` at `89.683s`
- current baseline: clears stage `1`, advances into stage `2`, and dies at `237.167s`

So the current branch has crossed two important thresholds for the default persona:
1. the canonical Intermediate full-run can now clear stage `1`
2. the canonical whole-run lane is no longer a hidden one-stage mission and now reaches stage `2`

Two important process learnings from this step:
1. full-run harness comparisons must be run against a fresh build. An earlier comparison looked like a no-op until the rebuilt bundle picked up the persona change, after which the Intermediate baseline jumped to the stronger `2110 / 89.683s` result.
2. whole-run launch config must be checked all the way through to runtime state. The stage-cap unlock only happened once the harness explicitly mirrored `maxPlayableStage` into the runtime overrides; before that, the canonical lane was still silently capped to stage `1`.

## Comparison Personas

Quick comparison runs in `/private/tmp/guardians-fullrun-comparison` show:

- `Expert`
 - stage reached: `1`
  - score: `2110`
  - duration: `89.65s`
  - losses: `2 enemy_shot`, `1 alien_scout_collision`
  - no stage clear

- `Professional`
  - stage reached: `1`
  - score: `3170`
  - duration: `176.717s`
  - losses: `2 alien_scout_collision`
  - stage clear: `1`
  - mission complete: yes

## Main Takeaways

1. The whole-run persona-play lane is now operational for both machine review and human review.
2. The opening is not fundamentally impossible, because the professional persona clears stage `1` in the current build.
3. The biggest remaining gap has shifted from “can the default reviewer clear stage `1`?” to “can the default reviewer survive stage `2` and later-stage pressure reliably?”
4. The next-best gameplay work should now use the canonical whole-run lane to target stage-2 survival first, then move back toward the known `midrun-stage-five-stress` bottleneck once the default run is consistently multi-stage.

## Current Stage-2 Failure Read

The new whole-run baseline is useful because it shows a much narrower problem than the old stage-1-only failures.

- The default Intermediate run now reaches stage `2` with `1` stage clear, but still dies before stabilizing there.
- Stage `2` only accumulates `12` attacks and `13` bullets before the final loss, so the failure is not “too much raw pressure too early.”
- The final death is still a collision, not a bullet hit.
- All recorded ship losses in the canonical run happen with the player ending in lane `1`, which points to a recurring left-edge recovery problem rather than a generalized aim or shot-density problem.

That means the next runtime pass should be narrow:
- improve post-clear recovery and lane re-centering in early stage `2`
- reduce left-edge overcommit during scout follow-through
- avoid broad pressure reductions that would make the stage clear but less source-faithful
