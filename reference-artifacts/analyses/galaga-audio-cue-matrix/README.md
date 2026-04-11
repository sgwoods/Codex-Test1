# Galaga Audio Cue Matrix

This document turns the current Galaga audio reference library into an
implementation-facing mapping against Aurora's current game-state and cue model.

## Goal

Create one place that answers:

- which Aurora state or cue slot should map to which Galaga reference clip
- which source clip is currently the strongest canonical reference
- where Aurora's current state model is broad enough
- where Aurora needs more game-owned cue granularity before a faithful
  Galaga-reference theme can exist

This matrix is intentionally **application-owned**. `Platinum` should only host
extension points for richer cue/state models; it should not absorb Galaga- or
Aurora-specific sound rules.

## Source Packs

Primary source packs currently curated in the repo:

1. `/Users/stevenwoods/Documents/Codex-Test1/reference-artifacts/analyses/galaga-audio-reference-video/README.md`
2. `/Users/stevenwoods/Documents/Codex-Test1/reference-artifacts/analyses/galaga-audio-reference-video-2/README.md`
3. `/Users/stevenwoods/Documents/Codex-Test1/reference-artifacts/analyses/galaga-audio-reference-video-3/README.md`

## Current Aurora Cue Slots

Aurora's current first-class cue slots are broadly organized around:

- shell and wait surfaces:
  - `uiTick`
  - `uiConfirm`
  - `attractEnter`
  - `attractPulse`
- gameplay and transitions:
  - `gameStart`
  - `stagePulse`
  - `stageTransition`
  - `challengeTransition`
  - `gameOver`
- combat:
  - `playerShot`
  - `enemyShot`
  - `enemyHit`
  - `bossHit`
  - `enemyBoom`
  - `bossBoom`
- capture / rescue:
  - `captureBeam`
  - `captureRetreat`
  - `rescueJoin`
- scoring and player state:
  - `extendAward`
  - `playerHit`

That state model is good enough at a phase level, but not yet detailed enough
for high-fidelity Galaga mapping.

## Canonical Mapping Matrix

| Aurora phase / slot | Best current Galaga reference | Preferred clip | Alternate clips | Confidence | Notes |
| --- | --- | --- | --- | --- | --- |
| `frontDoor.uiTick` | None, Aurora-owned shell cue | None | None | High | Keep Aurora-owned. This is not a Galaga gameplay state. |
| `frontDoor.uiConfirm` | None, Aurora-owned shell cue | None | None | High | Keep Aurora-owned. |
| `wait.attractEnter` | Closest to title/opening handoff, but not a direct Galaga state | `/Users/stevenwoods/Documents/Codex-Test1/reference-artifacts/analyses/galaga-audio-reference-video/clips/galaga-opening-theme.m4a` | `/Users/stevenwoods/Documents/Codex-Test1/reference-artifacts/analyses/galaga-audio-reference-video-3/clips/galaga3-start.m4a` | Low | Aurora wait mode is application-owned and should not be forced into a direct Galaga mapping. |
| `wait.attractPulse` | None, Aurora-owned wait cadence | None | None | High | Keep Aurora-owned. Galaga does not have this exact hosted wait surface. |
| `demo.attractEnter` | Opening/title handoff | `/Users/stevenwoods/Documents/Codex-Test1/reference-artifacts/analyses/galaga-audio-reference-video/clips/galaga-opening-theme.m4a` | `/Users/stevenwoods/Documents/Codex-Test1/reference-artifacts/analyses/galaga-audio-reference-video-3/clips/galaga3-start.m4a` | Medium | Demo entry should feel like a handoff from Aurora shell into classic play. |
| `demo.attractPulse` | Ambience / convoy cadence | `/Users/stevenwoods/Documents/Codex-Test1/reference-artifacts/analyses/galaga-audio-reference-video-3/clips/galaga3-ambience-convoy.m4a` | `/Users/stevenwoods/Documents/Codex-Test1/reference-artifacts/analyses/galaga-audio-reference-video-2/clips/galaga2-ambience-a.m4a`, `/Users/stevenwoods/Documents/Codex-Test1/reference-artifacts/analyses/galaga-audio-reference-video-2/clips/galaga2-ambience-b.m4a`, `/Users/stevenwoods/Documents/Codex-Test1/reference-artifacts/analyses/galaga-audio-reference-video-2/clips/galaga2-ambience-c.m4a` | High | Good target for a more mechanical Galaga gameplay cadence bed. |
| `stage.gameStart` | Start / stage-start announcement | `/Users/stevenwoods/Documents/Codex-Test1/reference-artifacts/analyses/galaga-audio-reference-video-3/clips/galaga3-start.m4a` | `/Users/stevenwoods/Documents/Codex-Test1/reference-artifacts/analyses/galaga-audio-reference-video-2/clips/galaga2-game-start.m4a`, `/Users/stevenwoods/Documents/Codex-Test1/reference-artifacts/analyses/galaga-audio-reference-video/clips/galaga-level-flag-v1.m4a`, `/Users/stevenwoods/Documents/Codex-Test1/reference-artifacts/analyses/galaga-audio-reference-video/clips/galaga-level-flag-v2.m4a` | Medium | Aurora likely needs to split `credit/start` from `stage flag / level announcement` if we want stronger fidelity. |
| `stage.stagePulse` | Formation / ambience / convoy | `/Users/stevenwoods/Documents/Codex-Test1/reference-artifacts/analyses/galaga-audio-reference-video-3/clips/galaga3-ambience-convoy.m4a` | `/Users/stevenwoods/Documents/Codex-Test1/reference-artifacts/analyses/galaga-audio-reference-video-2/clips/galaga2-ambience-a.m4a`, `/Users/stevenwoods/Documents/Codex-Test1/reference-artifacts/analyses/galaga-audio-reference-video/clips/galaga-sample-gameplay.m4a` | High | This is one of the clearest current mismatches: Aurora has only short pulses, Galaga has a more persistent mechanical cadence. |
| `stage.playerShot` | Fighter shot | `/Users/stevenwoods/Documents/Codex-Test1/reference-artifacts/analyses/galaga-audio-reference-video-3/clips/galaga3-boss-damage-flagship-fighter-shot.m4a` | `/Users/stevenwoods/Documents/Codex-Test1/reference-artifacts/analyses/galaga-audio-reference-video/clips/galaga-sample-gameplay.m4a` | Low | Current reference is mixed with boss damage. We have usable evidence, but not a perfectly isolated canonical shot clip yet. |
| `stage.enemyShot` | Enemy / attacker shot | `/Users/stevenwoods/Documents/Codex-Test1/reference-artifacts/analyses/galaga-audio-reference-video-3/clips/galaga3-attack-charger.m4a` | `/Users/stevenwoods/Documents/Codex-Test1/reference-artifacts/analyses/galaga-audio-reference-video/clips/galaga-sample-gameplay.m4a` | Low | This likely wants its own cleaner reference later, but we have enough to distinguish it from player shot. |
| `stage.enemyHit` | Small enemy destruction | `/Users/stevenwoods/Documents/Codex-Test1/reference-artifacts/analyses/galaga-audio-reference-video-3/clips/galaga3-zako.m4a` | `/Users/stevenwoods/Documents/Codex-Test1/reference-artifacts/analyses/galaga-audio-reference-video-3/clips/galaga3-goei-midori-tonbo-momiji-enterprise.m4a` | Medium | Aurora may need enemy-family-specific cue variants later. |
| `stage.bossHit` | Boss damage / flagship hit | `/Users/stevenwoods/Documents/Codex-Test1/reference-artifacts/analyses/galaga-audio-reference-video-3/clips/galaga3-boss-damage-flagship-fighter-shot.m4a` | None | Medium | This should probably become more specific than a generic heavy impact. |
| `stage.enemyBoom` | Small enemy death | `/Users/stevenwoods/Documents/Codex-Test1/reference-artifacts/analyses/galaga-audio-reference-video-3/clips/galaga3-zako.m4a` | `/Users/stevenwoods/Documents/Codex-Test1/reference-artifacts/analyses/galaga-audio-reference-video-3/clips/galaga3-goei-midori-tonbo-momiji-enterprise.m4a` | Medium | A future true Galaga pack likely wants per-family mappings. |
| `stage.bossBoom` | Boss death / Sasori | `/Users/stevenwoods/Documents/Codex-Test1/reference-artifacts/analyses/galaga-audio-reference-video-3/clips/galaga3-boss-death-sasori.m4a` | None | High | Good current target for a dedicated boss death slot. |
| `stage.captureBeam` | Tractor beam deploy | `/Users/stevenwoods/Documents/Codex-Test1/reference-artifacts/analyses/galaga-audio-reference-video-3/clips/galaga3-tractor-beam.m4a` | `/Users/stevenwoods/Documents/Codex-Test1/reference-artifacts/analyses/galaga-audio-reference-video-2/clips/galaga2-tractor-beam.m4a`, `/Users/stevenwoods/Documents/Codex-Test1/reference-artifacts/analyses/galaga-audio-reference-video/clips/galaga-tractor-beam.m4a` | High | One of the strongest mappings in the library. |
| `stage.captureRetreat` | Capturing / retreat resolution | `/Users/stevenwoods/Documents/Codex-Test1/reference-artifacts/analyses/galaga-audio-reference-video-3/clips/galaga3-capturing.m4a` | `/Users/stevenwoods/Documents/Codex-Test1/reference-artifacts/analyses/galaga-audio-reference-video-2/clips/galaga2-fighter-capturing-a.m4a`, `/Users/stevenwoods/Documents/Codex-Test1/reference-artifacts/analyses/galaga-audio-reference-video-2/clips/galaga2-fighter-capturing-b.m4a` | Medium | Aurora likely wants a more explicit `captureSuccess` slot separate from `captureRetreat`. |
| `stage.rescueJoin` | Fighter rescued / double ship | `/Users/stevenwoods/Documents/Codex-Test1/reference-artifacts/analyses/galaga-audio-reference-video-2/clips/galaga2-fighter-rescued-double-ship.m4a` | `/Users/stevenwoods/Documents/Codex-Test1/reference-artifacts/analyses/galaga-audio-reference-video/clips/galaga-ship-rescued.m4a` | High | Strong direct mapping. |
| `stage.extendAward` | Extra fighter | `/Users/stevenwoods/Documents/Codex-Test1/reference-artifacts/analyses/galaga-audio-reference-video-3/clips/galaga3-extra-fighter.m4a` | None | High | Good direct mapping for bonus ship award. |
| `stage.playerHit` | Death / ship lost | `/Users/stevenwoods/Documents/Codex-Test1/reference-artifacts/analyses/galaga-audio-reference-video-3/clips/galaga3-death.m4a` | `/Users/stevenwoods/Documents/Codex-Test1/reference-artifacts/analyses/galaga-audio-reference-video-2/clips/galaga2-ship-lost.m4a`, `/Users/stevenwoods/Documents/Codex-Test1/reference-artifacts/analyses/galaga-audio-reference-video/clips/galaga-last-ship-destroyed-ambience.m4a` | High | We should probably split ordinary ship loss from last-ship / end-state ambience. |
| `stage.stageTransition` | Level flag / round announcement | `/Users/stevenwoods/Documents/Codex-Test1/reference-artifacts/analyses/galaga-audio-reference-video/clips/galaga-level-flag-v1.m4a` | `/Users/stevenwoods/Documents/Codex-Test1/reference-artifacts/analyses/galaga-audio-reference-video/clips/galaga-level-flag-v2.m4a`, `/Users/stevenwoods/Documents/Codex-Test1/reference-artifacts/analyses/galaga-audio-reference-video-3/clips/galaga3-level-underscore.m4a` | Medium | Aurora may want two slots here: `stageClear` and `nextStageAnnouncement`. |
| `challenge.challengeTransition` | Challenging stage announcement | `/Users/stevenwoods/Documents/Codex-Test1/reference-artifacts/analyses/galaga-audio-reference-video-3/clips/galaga3-challenging-stage.m4a` | `/Users/stevenwoods/Documents/Codex-Test1/reference-artifacts/analyses/galaga-audio-reference-video-2/clips/galaga2-challenging-stage.m4a`, `/Users/stevenwoods/Documents/Codex-Test1/reference-artifacts/analyses/galaga-audio-reference-video-3/clips/galaga3-challenging-stage-0-39-hits.m4a` | High | Challenge-family cues are now well-covered by references. |
| `results.gameOver` | Last ship destroyed / game over descent | `/Users/stevenwoods/Documents/Codex-Test1/reference-artifacts/analyses/galaga-audio-reference-video/clips/galaga-last-ship-destroyed-ambience.m4a` | `/Users/stevenwoods/Documents/Codex-Test1/reference-artifacts/analyses/galaga-audio-reference-video-3/clips/galaga3-death.m4a` | Medium | Aurora currently compresses final-loss tension and results-state descent into one slot. |

## Missing Aurora Cue Slots

These are the biggest current gaps between Aurora's useful state model and the
reference library we now have.

### Strongly recommended next slots

1. `coinInserted`
- Reference:
  - `/Users/stevenwoods/Documents/Codex-Test1/reference-artifacts/analyses/galaga-audio-reference-video-3/clips/galaga3-coin-inserted.m4a`
- Why:
  - This is a distinct classic action and should not be folded into a generic UI confirm.

2. `captureSuccess`
- References:
  - `/Users/stevenwoods/Documents/Codex-Test1/reference-artifacts/analyses/galaga-audio-reference-video/clips/galaga-ship-captured.m4a`
  - `/Users/stevenwoods/Documents/Codex-Test1/reference-artifacts/analyses/galaga-audio-reference-video-3/clips/galaga3-fighter-captured.m4a`
- Why:
  - Different moment from beam deploy or retreat.

3. `capturedFighterDestroyed`
- References:
  - `/Users/stevenwoods/Documents/Codex-Test1/reference-artifacts/analyses/galaga-audio-reference-video-2/clips/galaga2-red-captured-ship-destroyed.m4a`
  - `/Users/stevenwoods/Documents/Codex-Test1/reference-artifacts/analyses/galaga-audio-reference-video-3/clips/galaga3-captured-fighter-destroyed.m4a`
- Why:
  - High-salience gameplay event with no first-class Aurora slot today.

4. `challengeResults`
- References:
  - `/Users/stevenwoods/Documents/Codex-Test1/reference-artifacts/analyses/galaga-audio-reference-video-2/clips/galaga2-challenging-stage-results.m4a`
  - `/Users/stevenwoods/Documents/Codex-Test1/reference-artifacts/analyses/galaga-audio-reference-video/clips/galaga-bonus-stage-results.m4a`
- Why:
  - Currently folded into generic results / transition thinking.

5. `challengePerfect`
- References:
  - `/Users/stevenwoods/Documents/Codex-Test1/reference-artifacts/analyses/galaga-audio-reference-video-2/clips/galaga2-challenging-stage-perfect.m4a`
  - `/Users/stevenwoods/Documents/Codex-Test1/reference-artifacts/analyses/galaga-audio-reference-video/clips/galaga-bonus-stage-perfect-score.m4a`
- Why:
  - Important celebratory moment that deserves its own cue and UI coupling.

6. `highScoreFirst`
- References:
  - `/Users/stevenwoods/Documents/Codex-Test1/reference-artifacts/analyses/galaga-audio-reference-video/clips/galaga-high-score-1st-place.m4a`
  - `/Users/stevenwoods/Documents/Codex-Test1/reference-artifacts/analyses/galaga-audio-reference-video-3/clips/galaga3-name-entry-1st.m4a`
- Why:
  - Distinct from general leaderboard placement.

7. `highScoreOther`
- References:
  - `/Users/stevenwoods/Documents/Codex-Test1/reference-artifacts/analyses/galaga-audio-reference-video/clips/galaga-high-score-2nd-5th-place.m4a`
  - `/Users/stevenwoods/Documents/Codex-Test1/reference-artifacts/analyses/galaga-audio-reference-video-3/clips/galaga3-name-entry-2nd-5th.m4a`
- Why:
  - Different emotional weight from first place.

### Good later candidates

- `enemyFamilyShot` or `enemyFamilyDeath` variants
  - references now include `Zako`, `Goei/Midori/Tonbo/Momiji/Enterprise`, and boss-specific variants
- `bossDamage`
  - separate from `bossHit` if we want stronger Galaga-specific flagship behavior
- `lastShipAmbience`
  - separate from generic `playerHit` and `gameOver`
- `challenge40Hits`
  - if challenge scoring/results are later made more faithful

## Practical Conclusions

1. Aurora's top-level phase model is broadly correct.
- We do not need to redesign the entire state machine before continuing.

2. Aurora's cue taxonomy is not yet detailed enough for a true Galaga pack.
- The biggest missing pieces are capture-state resolution, challenge results,
  name-entry/high-score separation, and credit/start distinctions.

3. The next correct move is not more ad hoc cue tweaking.
- The next move is to add the missing application-owned cue slots and then bind
  the strongest reference clips against them.

4. This work should remain insulated from `Platinum`.
- `Platinum` should host richer application audio models through extension
  points, not game-specific rules.

## Recommended Next Implementation Order

1. Add first-class Aurora slots for:
- `captureSuccess`
- `capturedFighterDestroyed`
- `challengeResults`
- `challengePerfect`
- `highScoreFirst`
- `highScoreOther`

2. Rebuild the highest-impact Galaga-reference mappings first:
- `stage.gameStart`
- `stage.stagePulse`
- `stage.captureBeam`
- `stage.rescueJoin`
- `stage.playerHit`
- `challenge.challengeTransition`

3. Then tighten the remaining low-confidence mappings:
- `playerShot`
- `enemyShot`
- `enemyHit`
- `bossHit`
- `stageTransition`
