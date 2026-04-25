# Audio Plan

This document tracks the practical sound-design plan for Aurora and future
Galaga-family game packs.

## Principles

- The runtime owns the shared audio event vocabulary.
- Each `gamePack` owns its audio palette and event mapping.
- Sounds should be inspired by the arcade originals, not copied one-to-one as a
  rule.
- We prefer clearly licensed references and prototypes.
- `CC0` and `CC BY 4.0` are the safest near-term candidates.
- `CC BY-NC 4.0` assets should stay out of the default shipping set unless we
  make an explicit licensing decision.

## Shared Event Vocabulary

The platform should be able to map game-pack audio to these events:

- `boot`
- `credit`
- `start`
- `formation_march`
- `player_shot`
- `enemy_shot`
- `enemy_hit`
- `boss_hit`
- `enemy_destroyed`
- `ship_lost`
- `capture_beam`
- `fighter_captured`
- `capture_broken`
- `fighter_released`
- `fighter_destroyed`
- `rescue_join`
- `stage_transition`
- `challenge_intro`
- `challenge_clear`
- `special_bonus`
- `extra_life`
- `game_over`
- `ui_tick`
- `ui_confirm`
- `ui_error`

## Playback Model

To support Galaga-family and Galaxian-family sound design cleanly, the runtime
should eventually treat audio as three related categories:

- one-shot events
  - player shot
  - enemy hit
  - boss hit
  - explosion
  - extra life
  - UI confirm/error
- sequenced events
  - stage start
  - challenge intro
  - rescue join
  - perfect-bonus fanfare
- state layers
  - wait-mode/front-door ambience
  - formation pressure bed
  - captured-fighter tension layer
  - challenge-stage layer

This matters because the original family does not only use isolated sound
effects. It also changes sound behavior based on:

- game state
- enemy pressure
- stage progression
- special mechanic phases such as capture and rescue

We should also leave room for parameterized event playback where the cue may
depend on runtime context, for example:

- dive cue by enemy family or path type
- pressure/ambient layer by remaining-enemy count
- boss-hit cue by archetype and damage phase
- capture beam by phase:
  - deploy
  - active
  - capture
  - release

The goal is to keep the event vocabulary stable while letting each `gamePack`
own how those events sound and how richly they are layered.

## Aurora Reference Sources

Primary family references:

- [Galaga Soundboard](https://www.101soundboards.com/boards/28843-galaga-soundboard)
- [Galaxian - Video Game Music](https://www.101soundboards.com/boards/643652-galaxian-video-game-music)
- [Freesound pack: Galaga Remake Music and Sound Effects](https://freesound.org/people/SgtPepperArc360/packs/19330/)
- [Freesound: Galaxian Arcade Game.wav by portwain](https://freesound.org/s/261173/)

## Candidate Reference Manifest

| Event / Use | File | Source role | License | Ship-safe now | Notes |
|---|---|---|---|---|---|
| `boot` | `/Users/stevenwoods/Downloads/19330__sgtpepperarc360__galaga-remake-music-and-sound-effects/341911__sgtpepperarc360__00-game-load.wav` | direct prototype | CC BY 4.0 | yes, with attribution | good cabinet/startup identity reference |
| `credit` | `/Users/stevenwoods/Downloads/19330__sgtpepperarc360__galaga-remake-music-and-sound-effects/341910__sgtpepperarc360__01-coin-credit.wav` | direct prototype | CC BY 4.0 | yes, with attribution | useful for coin/credit or menu-enter equivalents |
| `start` | `/Users/stevenwoods/Downloads/19330__sgtpepperarc360__galaga-remake-music-and-sound-effects/341370__sgtpepperarc360__galaga-song-here-we-go-opening-theme.wav` | direct prototype | CC BY 4.0 | yes, with attribution | opening/start-flow reference |
| `formation_march` / ambient | `/Users/stevenwoods/Downloads/19330__sgtpepperarc360__galaga-remake-music-and-sound-effects/333257__sgtpepperarc360__03-floating-in-mid-air.wav` | mood reference | CC0 | yes | useful for sustained stage identity and floaty pressure |
| `enemy_dive` / pressure cue | `/Users/stevenwoods/Downloads/19330__sgtpepperarc360__galaga-remake-music-and-sound-effects/338862__sgtpepperarc360__galaga-dive-2-new.wav` | direct prototype | CC0 | yes | good attack cue reference |
| `capture_beam` | `/Users/stevenwoods/Downloads/19330__sgtpepperarc360__galaga-remake-music-and-sound-effects/338863__sgtpepperarc360__galaga-mid-boss-tractor-beam-new.wav` | direct prototype | CC BY 4.0 | yes, with attribution | strong capture-beam identity reference |
| `fighter_captured` | `/Users/stevenwoods/Downloads/19330__sgtpepperarc360__galaga-remake-music-and-sound-effects/338864__sgtpepperarc360__09-fighter-captured.wav` | direct prototype | CC0 | yes | useful for capture completion |
| `fighter_released` | `/Users/stevenwoods/Downloads/19330__sgtpepperarc360__galaga-remake-music-and-sound-effects/338866__sgtpepperarc360__10-fighter-freed.wav` | direct prototype | CC0 | yes | useful for rescue release |
| `fighter_destroyed` | `/Users/stevenwoods/Downloads/19330__sgtpepperarc360__galaga-remake-music-and-sound-effects/338867__sgtpepperarc360__14-fighter-destroyed.wav` | direct prototype | CC0 | yes | useful for destroyed-carried-fighter state |
| `extra_life` / reward | `/Users/stevenwoods/Downloads/19330__sgtpepperarc360__galaga-remake-music-and-sound-effects/341909__sgtpepperarc360__05-extend.wav` | direct prototype | CC BY 4.0 | yes, with attribution | maps well to extend/bonus |
| `enemy_destroyed` / explosion | `/Users/stevenwoods/Downloads/19330__sgtpepperarc360__galaga-remake-music-and-sound-effects/341930__sgtpepperarc360__16-explosion.wav` | direct prototype | CC BY 4.0 | yes, with attribution | good explosion reference |
| stage/theme mood | `/Users/stevenwoods/Downloads/19330__sgtpepperarc360__galaga-remake-music-and-sound-effects/341484__sgtpepperarc360__galaga-song-02-spreading.wav` | mood reference | CC0 | yes | candidate for stage-band texture |
| stage/theme mood | `/Users/stevenwoods/Downloads/19330__sgtpepperarc360__galaga-remake-music-and-sound-effects/341799__sgtpepperarc360__galaga-song-16-weightless.wav` | mood reference | CC0 | yes | candidate for Aurora/quiet-skies band |
| stage/theme mood | `/Users/stevenwoods/Downloads/19330__sgtpepperarc360__galaga-remake-music-and-sound-effects/341818__sgtpepperarc360__updated-version-galaga-song-16-weightless.wav` | mood reference | CC BY-NC 4.0 | no by default | keep as inspiration-only until licensing decision |
| stage/theme mood | `/Users/stevenwoods/Downloads/19330__sgtpepperarc360__galaga-remake-music-and-sound-effects/344742__sgtpepperarc360__galaga-song-04-the-view-from-above.wav` | mood reference | CC0 | yes | candidate for high-altitude / aurora stage feel |
| `Galaxian` cabinet/reference texture | `/Users/stevenwoods/Downloads/261173__portwain__galaxian-arcade-game.wav` | sibling-family reference | CC0 | yes | useful for sparse early-arcade pacing and cabinet feel |

## Recommended Near-Term Audio Strategy

1. Keep the current synthesized `sfx` implementation as the shipping baseline.
2. Use the reference manifest above to define Aurora `audioProfile` mappings.
3. Introduce sample-backed replacements gradually for the highest-value events:
   - `boot`
   - `credit`
   - `capture_beam`
   - `fighter_captured`
   - `fighter_released`
   - `fighter_destroyed`
   - `enemy_destroyed`
   - `extra_life`
4. Keep stage-band and branded-world themes pack-owned rather than hardcoded in
   the runtime.
5. When a `Galaxian`-like sibling pack is introduced, define a separate
   `audioProfile` rather than sharing Aurora’s full palette.

## Next Implementation Milestone

When we start wiring real sample-backed audio, the first clean platform move
should be:

- add `audioProfile` to `/Users/steven/Documents/Codex-Test1/src/js/13-aurora-game-pack.js`
- keep the runtime event vocabulary stable
- let the runtime choose between:
  - synthesized fallback sounds
  - pack-owned sample-backed sounds

That gives us a safe migration path without forcing every game to use samples
immediately.
