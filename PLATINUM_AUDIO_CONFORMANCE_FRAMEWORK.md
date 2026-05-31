# Platinum Audio Conformance Framework

Date: 2026-05-31

## Purpose

This framework makes audio-conformance work reusable across Platinum games.
`Galaxy Guardians` is the first serious consumer of this path, but the target
is explicit: when a third game is ingested, the repo should already know how to
measure audio against game events, stage timing, and lived gameplay scenes
without inventing a new process from scratch.

## Core Rule

Do not treat audio as a bag of isolated cues.

Every Platinum game should be reviewed at four levels:

1. cue ownership and synthetic shape
2. event timing and runtime coverage
3. gameplay-scene sound read
4. full live gameplay mix over real capture runs

The first two levels protect correctness.
The last two levels protect player experience.

## Platform Pieces

### 1. Pack-owned cue/theme contract

Each game must own:

- a distinct `audioTheme`
- a distinct cue family
- distinct runtime cue ids
- a clear mapping from gameplay events to audio events

This prevents cross-game contamination and makes later review interpretable.

### 2. Capture-aligned event history

Gameplay capture reports must persist:

- `sessionEvents`
- `audioHistory`
- capture-aligned cue timestamps via `recAt`

This is what allows scene and live-mix analyzers to reason about what the
player actually heard at each moment in a recorded run.

### 3. Game registry

Every game should register audio review config in:

- `tools/harness/audio-conformance-games.js`

That registry is the single durable place for:

- cue-family config
- scene-review artifact/report paths
- live-mix artifact/report paths
- capture labels
- threshold values
- game-specific cue families such as pressure/reward/critical cues

### 4. Scene review

Scene review answers:
"What did this moment sound like?"

Required artifact shape:

- runtime capture label
- runtime start/end anchors
- promoted reference source/window
- plain-language target read
- waveform/spectrogram previews
- cue-event summary inside the window

Generic implementation:

- `tools/harness/analyze-platinum-audio-scene-review.js`
- `tools/harness/check-platinum-audio-scene-review.js`
- `tools/harness/lib/platinum-audio-scene-live-mix.js`

### 5. Live gameplay mix

Live mix answers:
"Does real play stay alive, pressured, and legible over time?"

Required metrics:

- longest quiet gap
- cue events per `10s`
- pressure cue share
- pulse count and interval
- active slice share
- opening-to-midrun escalation
- per-slice cue density

Generic implementation:

- `tools/harness/analyze-platinum-audio-live-mix.js`
- `tools/harness/check-platinum-audio-live-mix.js`
- `tools/harness/lib/platinum-audio-scene-live-mix.js`

### 6. Headed listening

No audio pass is complete from harnesses alone.

Every serious promotion should include:

- fresh persona captures
- scene-by-scene review
- full run listening in headed playback
- a repo-owned listening note

## Intake Order For A New Game

When a future third game is added, use this order.

### Phase A. Archive and reference first

1. preserve canonical source videos/audio evidence
2. identify clean reference windows for:
   - launch/start
   - regular pressure
   - large warning moment
   - hit/reward
   - player loss
   - game over or stage clear
3. promote timestamps, previews, and notes into repo artifacts

### Phase B. Own the game audio

1. define the game’s `audioTheme`
2. define cue ids and runtime ownership
3. establish cue-shape and cue-target contracts
4. verify forbidden cross-game cue contamination

### Phase C. Capture real play

Minimum required capture presets:

1. opening controlled review run
2. midrun pressure review run
3. failure/loss review run

Recommended personas:

- `advanced`
- `expert`
- `professional`

If the game does not yet support good persona play, add deterministic review
presets before doing heavy audio tuning.

### Phase D. Register the game

Add the game to `tools/harness/audio-conformance-games.js` with:

- artifact/report paths
- capture labels
- scene definitions
- live-mix thresholds
- pressure/reward/critical cue families

### Phase E. Run the two reusable review layers

Required outputs:

- `audio-scene-review-0.1.json`
- `audio-live-mix-0.1.json`

Only after these exist should deeper audio retuning start.

### Phase F. Retune by leverage, not by completeness

Recommended tuning order:

1. recurring pressure presence
2. player shot / enemy shot family
3. dive warning family
4. hit / reward family
5. loss / close family

This is the fastest path to a felt player-quality improvement.

### Phase G. Promote into the maintained gate set

Once stable, add the new scene/live-mix checks into that game’s maintained
conformance family so they are not treated as optional experiments.

## Anchor Rules

Scene anchors should be able to express:

- absolute seconds
- first/second/etc matching event
- bounded end anchors that must occur at or after scene start
- fallback seconds when the exact event is missing

This matters because real gameplay contains repeated cues. A scene end must not
accidentally snap to an earlier pulse or shot that happened before the scene.

## Recommended Acceptance Pattern

For each serious audio pass:

1. `npm run build`
2. generate fresh opening and midrun captures
3. run scene review
4. run live-mix analysis
5. compare to promoted reference windows
6. do headed listening
7. only then decide whether to refresh higher-level conformance docs

## Current Guardians Role

`Galaxy Guardians` is the first active game using this framework end to end.
That makes it both a target for direct improvement and the proving ground for a
future third-game audio intake.

Current Guardians-specific plan remains here:

- `GUARDIANS_AUDIO_CONFORMANCE_SPRINT_PLAN_2026-05-31.md`
