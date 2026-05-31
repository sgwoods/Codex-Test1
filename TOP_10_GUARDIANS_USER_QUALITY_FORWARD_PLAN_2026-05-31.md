# Top 10 Guardians User-Quality Forward Plan

Date: 2026-05-31

## Scope

This plan is intentionally `Galaxy Guardians`-first.

The other machine/session is advancing Aurora generally and Aurora challenge
stages in particular. This machine should optimize for the strongest
player-facing forward movement in Guardians while still allowing broader
platform/process changes when they make Guardians better faster.

## Current Guardians Read

Current measured Guardians picture:

- Reference conformance: `7.6/10`
- Playtest-weighted conformance: `6.9/10`
- Public release readiness: `4.2/10`
- Implementation gate coverage: `9.6/10`
- Long-surface score: `7.0/10`
- Long-surface stage-band authority: `6.6/10`
- Midrun survivability and clear potential: `5.8/10`
- Audio character: `6.4/10`
- Motion pace / lower-field pressure: `6.3/10`
- Visual identity: `6.8/10`

The most important interpretation change is this:

Guardians is no longer mainly blocked by missing scaffolding or missing
evidence. It is now blocked by whether the actual playable preview feels
compelling enough in live review.

## What Matters Most Now

The current Guardians artifact set says the weakest player-facing gaps are:

1. stage-five-and-beyond survivability and clear consistency
2. audio character during real play
3. motion pace and lower-field fairness
4. visual identity and board-read strength
5. preview-to-platform fit as a believable second game, not just a shell demo

## Top 10 Issues

### 1. Midrun survivability is still the biggest felt weakness

Current evidence:
- Long-surface `midrun-survivability-and-clear-potential` is `5.8/10`.
- The artifact explicitly calls out stage-five-and-beyond dive collisions and sustained shot pressure as the weakest part of the longer-run feel.

Recommended plan:
- Build a dedicated Guardians fairness lab around stage five and the next later
  stress bands instead of tuning general gameplay.
- Use deterministic personas and exact replay windows to isolate:
  - lower-field dive collisions
  - player escape windows
  - shot density
  - recovery spacing after life loss
- Tune only one fairness variable family at a time.

Platform/process change:
- Add a “fairness replay lane” for Guardians so survivability tuning stops being
  mixed into general playtesting.

Expected user-facing outcome:
- The game becomes harder in a way that feels learnable instead of cheap.

### 2. Audio still does not make Guardians feel like a convincing Galaxian-family game

Current evidence:
- Playtest-weighted `audio-character` is `6.4/10`.
- The playtest artifact still records the original user read: “Sound is nothing like the original Galaxians.”

Recommended plan:
- Do a real browser-side listening pass and make it a hard acceptance step.
- Rebuild the Guardians cue set around a smaller number of stronger owned cues:
  shot, hit, alien loss, player loss, rack pulse, stage advance, and wait/start.
- Prefer fewer clearer cues over a larger set of technically measurable but
  weak-feeling ones.
- Use the existing audio lab only as a narrowing tool, not as the final judge.

Platform/process change:
- Guardians audio acceptance should require headed listening review before cue promotion.

Expected user-facing outcome:
- The game sounds alive, dry, sharp, and family-correct instead of merely wired.

### 3. Motion pace still feels off even though the contracts exist

Current evidence:
- `formation-rack-timing` is `6.2/10`.
- `movement-pressure` is `6.2/10`.
- The playtest artifact still preserves the finding that “Pace feels off and slow in various ways.”

Recommended plan:
- Run a dedicated pace pass that couples:
  - formation entry duration
  - rack settle time
  - first-dive timing
  - wrap cadence
  - escort/flagship joins
- Tune against runtime traces and reference tracklets together, not one timing
  metric at a time.

Platform/process change:
- Add a compact “pace board” preview that can replay the first 20-30 seconds repeatedly without a full run.

Expected user-facing outcome:
- The board feels crisp and purposeful instead of slightly slow or soft.

### 4. Lower-field pressure is present, but fairness and readability are still too muddy

Current evidence:
- Motion-pressure review specifically points to lower-field collision fairness.
- Long-surface review says later-band stress is exposed, but not yet convincingly converted into clears.

Recommended plan:
- Separate “pressure” from “collision chaos.”
- Rebalance lower-field routes so the player can read one threat, then the next,
  instead of absorbing stacked unavoidable overlaps.
- Use collision heatmaps or simple overlap maps from replay windows if needed.

Platform/process change:
- Build a small diagnostic overlay mode for local-only fairness review that shows
  collision clusters and escape-lane density.

Expected user-facing outcome:
- Busy sections feel intense but readable instead of crowded and frustrating.

### 5. Visual identity is closer, but still not compelling enough

Current evidence:
- Playtest-weighted `visual-identity` is `6.8/10`.
- The playtest artifact still preserves: “Graphics still feel pretty far from the original.”

Recommended plan:
- Focus on the three most visible visual truths first:
  - alien family separation
  - palette authority
  - board scale / density
- Re-review live sprites and board scale in the actual runtime, not only crop artifacts.
- If any roles still feel too dense or too generic, simplify and re-shape rather
  than layering more detail.

Platform/process change:
- Add a side-by-side live runtime versus promoted crop sheet review page for Guardians.

Expected user-facing outcome:
- Players immediately read the game as a stronger Galaxian-family homage.

### 6. The opening board still needs to sell the game faster

Current evidence:
- Both the playtest and opening-slice docs still call out WAIT / title /
  score-table / board read as an active concern.
- The preview is close, but not yet immediately compelling.

Recommended plan:
- Treat the first 15 seconds as a separate conversion surface.
- Tighten the WAIT/title/mission/score-table/HUD layout against the best source windows.
- Remove any remaining layered or decorative behavior that weakens readability.

Platform/process change:
- Keep a dedicated “opening slice acceptance” checklist that must pass before
  deeper tuning work claims a visible quality win.

Expected user-facing outcome:
- The game looks believable before the player even evaluates deeper mechanics.

### 7. Later-band clear potential is too low for stronger personas

Current evidence:
- Long-surface `persona-review-utility` is `6.6/10`.
- The artifact says professional/expert personas still need more reliable later-band clear potential.

Recommended plan:
- Promote one strong persona as the main tuning baseline for deeper play.
- Use the other personas diagnostically instead of trying to satisfy all of them equally.
- Tune later-band recovery and conversion so stronger players can carry stress into clears.

Platform/process change:
- Shift persona use from “many reviewers” to “one authority baseline plus supporting diagnostics.”

Expected user-facing outcome:
- Better players feel that success comes from learning and execution, not luck.

### 8. Guardians still needs stronger first-class platform fit

Current evidence:
- The artifact set already treats platform-frame parity and shared shell support as important.
- Recent work caught real platform drift around score lanes, replay clickability, music behavior, and duplicated HUD rendering.

Recommended plan:
- Take a focused platform pass on:
  - score isolation
  - replay start and replay browse
  - capture/export
  - bug-report identity
  - music and settings behavior
- Prefer game-aware platform behavior instead of one-off Guardians exceptions.

Platform/process change:
- Make Guardians the standing second-game smoke test for platform changes, not just a preview consumer.

Expected user-facing outcome:
- The game feels like a real second Platinum game, not a prototype inside Aurora’s shell.

### 9. The current quality loop still starts too late in the player experience

Current evidence:
- The artifacts are strong, but the biggest remaining gaps are now felt in live play.
- Recent work repeatedly discovered “in source but not really in app” drift only after direct review.

Recommended plan:
- Change the default Guardians loop to:
  1. headed localhost review with audio
  2. discrepancy capture
  3. focused runtime/content fix
  4. harness/doc refresh
  5. hosted `/dev` review
- Keep a short discrepancy ledger for “measured but not truly convincing” findings.

Platform/process change:
- Player-truth review becomes the first gate for Guardians, not the last.

Expected user-facing outcome:
- More of the work moves visible quality instead of only improving our confidence language.

### 10. Too much Guardians feel still lives in code paths instead of editable content contracts

Current evidence:
- Timing, score lanes, HUD surfaces, replay behavior, music state, pulse, and stage-band behavior have all recently depended on code-path debugging before quality could move confidently.

Recommended plan:
- Move more Guardians-critical behavior into explicit content assets:
  - pace contracts
  - stage-band pressure contracts
  - audio phrase/cue contracts
  - board-surface layout contracts
  - palette contracts
- Add small preview utilities for those contracts so quality can be reviewed
  before a full game run.

Platform/process change:
- Shift Guardians from “behavior hidden in runtime logic” toward “quality exposed as editable content contracts.”

Expected user-facing outcome:
- Faster iteration, fewer regressions, and larger visible gains per pass.

## Recommended Attack Order

If the goal is the biggest Guardians player-quality movement from this machine,
the best order is:

1. Midrun survivability and fairness lab
2. Audio character reset with headed listening review
3. Pace and motion-pressure pass
4. Lower-field readability/fairness cleanup
5. Visual identity and palette authority pass
6. Opening-board conversion pass
7. Later-band persona-baseline tuning
8. First-class platform fit pass
9. Player-truth-first loop change
10. Contract-first content/platform refactor

## What Changes From The Older Guardians Plan

The biggest changes are:

- We stop treating the opening slice as the only main blocker.
- We put stage-five-and-beyond survivability at the top because it is the
  weakest felt long-surface score.
- We treat audio as a real acceptance problem again, not a mostly-solved plumbing task.
- We treat Guardians as a first-class platform consumer and smoke test.
- We move from artifact-first iteration to player-truth-first iteration.
