# Long-Cycle Keeper Process

Updated: June 8, 2026

This process turns reference analysis into small, reviewable runtime changes.
Use it for game polish and fidelity work involving timing, motion, audio,
pacing, transitions, sprites, visual readability, or opening-slice presentation.

The loop is:

reference window -> extracted artifact -> stable evaluator -> small candidate
sweep -> runtime keeper -> before/after video/contact sheet -> score/economics
update -> next gap

## When Measurement Comes First

Run measured reference analysis before subjective tuning when work touches:

- challenge-stage movement, timing, spacing, bonus opportunity, or transitions
- audio cues, event feedback, overlap, tails, or phrase timing
- sprite shape, scale, pose, animation phase, crop fidelity, or board
  readability
- Guardians opening-slice visuals, rack timing, scoring surfaces, result state,
  or public-readiness claims
- anything proposed as a beta-quality improvement

Subjective play review still matters, but it should review a measured candidate
rather than invent tuning from memory.

## Loop Definitions

| Step | Required output | Keeper question |
| --- | --- | --- |
| Reference window | Named source, time range, event label, and confidence note. | Are we comparing against a real source window rather than a remembered feel? |
| Extracted artifact | Clip, contact sheet, waveform, spectrogram, object track, frame crop, event log, or trace. | Can another worker inspect the same evidence? |
| Stable evaluator | Script, harness, or scored report with known confidence and blind spots. | Can we rerun the question without changing the question each time? |
| Small candidate sweep | Limited candidate set with declared knobs and `npm run harness:measure` logging when meaningful. | Did we test focused hypotheses instead of broad retuning? |
| Runtime keeper | The single accepted change, or an explicit rejection. | Did strict evidence and play-facing review both justify keeping it? |
| Before/after review | Video snippet, contact sheet, screenshot pair, waveform, or score table comparing baseline to candidate. | Can a human see or hear the claimed improvement? |
| Score/economics update | Relevant score row, guardrail checks, artifact path, and resource spend. | Did the project learn the cost and impact of the cycle? |
| Next gap | One specific next target, not a broad aspiration. | Does the next worker know where to start? |

## Candidate Versus Keeper

A candidate is a focused hypothesis. It may be a runtime constant set, a data
contract, an audio cue shape, an evaluator threshold, a sprite target, or a
small harness extension. A candidate should name:

- the target reference window or artifact
- the expected player-facing improvement
- the strict metric it should move
- the guardrails it must preserve
- the smallest commands needed to measure it

A keeper is a candidate that survives promotion review. It needs:

- a strict or focused metric win, or a clearly documented measurement-system
  win that makes future runtime work simpler
- no relevant guardrail regression
- before/after evidence that shows the player-visible effect, when the change
  is runtime-facing
- score/economics logging for meaningful sweeps or model-assisted review
- docs updated with what improved, what did not, and the next gap

Measurement keepers are allowed: a new evaluator, artifact extractor, or
process guard can be worth committing even when it does not improve gameplay
yet. But a measurement keeper is not a beta reason by itself.

## Workstream Evidence Requirements

| Workstream | Minimum evidence before runtime keeper | Guardrails |
| --- | --- | --- |
| Aurora challenge-stage runtime quality | Reference challenge window or promoted object-track/contact-sheet evidence; contract group or path-family intent; focused motion/profile or conformance score; before/after stage video or contact sheet for visible changes; scoreable-route and spacing read. | `harness:check:challenge-motion-profile`, strict challenge-stage conformance check when relevant, no enemy shots/losses during challenge, no bunching/spacing regression, sprite/render guard if visuals change. |
| Audio and event feedback | Source cue/window label; waveform or spectrogram comparison; semantic event mapping; runtime capture; candidate precheck or audio-conformance-lab read; repeated/stability confirmation for volatile cues. | Cue alignment remains green, no broader audio-theme regression, no promotion from isolated onset/body wins when phrase/tail/live segmentation fails. |
| Visual, sprite, and gameplay readability | Promoted target crop/contact sheet or source frame; runtime crop/screenshot; direct sprite or artifact conformance read; board-scale/readability evidence if formations or sprite sizes change. | Runtime sprite conformance, render-mode guard, formation/readability checks, shell/popup checks if the change touches hosted surfaces. |
| Galaxy Guardians opening slice | Source frame/window for WAIT, score table, rack entry, combat feedback, or result state; runtime screenshot/video; opening-slice baseline or first-class conformance artifact; game-owned scoring/result evidence. | `harness:check:galaxy-guardians-first-class-conformance`, pack/boundary checks, no Aurora mechanic leakage, public capability stays honestly preview-framed until v1 evidence is real. |

## Economics Logging

Use `npm run harness:measure` for meaningful long-cycle local work, candidate
sweeps, model-assisted review, or evidence generation:

```sh
npm run harness:measure -- \
  --axis challenge-stage \
  --resource cpu \
  --resource browser \
  --notes "Stage 7 object-track candidate sweep" \
  -- npm run harness:analyze:challenge-stage-conformance
```

For model/Codex-only work that materially changes the plan or evaluator:

```sh
npm run harness:measure -- \
  --manual \
  --axis conformance-planning \
  --resource codex \
  --resource model-api \
  --model-provider openai \
  --model gpt-5-codex \
  --model-minutes 30 \
  --notes "model-assisted review of object-track mismatch and keeper criteria"
```

Do not regenerate huge artifact sets only to make documentation look current.
Refresh large generated docs before release claims, after meaningful runtime
keepers, or when a stale score is blocking a decision.

## Measurement Wins Versus Player-Facing Wins

Keep these separate in summaries and release notes:

- Measurement win: better extractor, stricter scorer, clearer dashboard,
  artifact contract, or lower future search cost.
- Player-facing win: a user can see, hear, play, or trust something better in
  local/hosted gameplay.
- Release win: a player-facing or safety/platform improvement has enough
  evidence, docs, and gates to move a lane.

Broad score movement is not enough if the strict weak row stays weak. A release
summary should always name:

- the broad score, if refreshed
- the strict row that motivated the work
- the weakest remaining strict row
- whether the change was measurement-only or player-facing

## Beta Blocking Rules

Block beta movement when:

- the bundle is docs/evidence-only and contains no player-facing lift, safety
  fix, or release-critical platform hardening
- the only positive result is a broad score while the strict target row is flat
  or worse
- no before/after review artifact exists for a claimed visual/audio/motion lift
- resource economics were skipped for a meaningful long-cycle sweep
- a candidate improved a focused metric but failed a relevant guardrail
- release authority or user intent is not explicit

Hosted `/dev` can carry coherent docs/evidence/runtime bundles, including
negative results. Hosted `/beta` should require a stronger claim.

## Cycle Close Checklist

At the end of each work phase, record:

1. reference/artifact source used
2. candidate(s) tried
3. keeper or rejection decision
4. strict score or focused evidence movement
5. guardrails run
6. before/after artifact path when player-facing
7. economics/resource note when meaningful
8. next specific gap

The final answer for a worker should say where the work sits in this loop and
what the next loop should target.
