# Reference Baseline

This document defines how we turn original Galaga behavior into actionable work
for this project.

## Goal

Create a durable, repeatable baseline for:

- how original Galaga behaves
- how our game differs
- what issue or milestone that difference should map to
- how improvement will be measured

## Source Priority

1. Manual / cabinet-era rule documents
2. Original gameplay footage
3. Emulator captures when available
4. Secondary written references

## Working Process

For each fidelity topic:

1. Identify the source artifact
2. Capture the specific observed behavior
3. Write the current project behavior
4. Define the gap
5. Link the gap to:
   - a GitHub issue
   - a harness scenario or metric
   - a target release / roadmap milestone if applicable

## Current Baseline Topics

### Player Control Principles

- Source:
  - original cabinet feel as observed in gameplay footage
  - modern keyboard best practice for translating joystick-style intent into
    digital input
- Current rule:
  - keyboard movement should emulate joystick intent, not instantaneous digital
    stepping
- Current implementation target:
  - use a target-velocity model for manual keyboard control
  - apply acceleration on press and stronger deceleration on release
  - preserve neutral behavior when opposite directions are held together
  - tune for:
    - tap = fine correction
    - hold = lane travel
- Validation questions:
  - can a player line up under descending enemies with small corrections?
  - does the ship still cross the playfield quickly enough for evasive play?
  - does manual control feel smoother than the old full-speed-per-frame step?

### Stage 1 Dive Timing

- Source:
  - original gameplay video
  - `/Users/stevenwoods/Documents/Codex-Test1/reference-artifacts/analyses/galaga-stage-reference-video/README.md`
- Current metric:
  - `stage1-descent` harness scenario
- Current use:
  - compare first dive timing and lower-field crossing against original footage

### Classic Starfield / Visual Intensity

- Source:
  - `/Users/stevenwoods/Documents/Codex-Test1/reference-artifacts/analyses/galaga-stage-reference-video/README.md`
- Current use:
  - compare:
    - starfield density
    - star brightness
    - color mix
    - downward motion speed
    - sprite readability against the field
- Current rule note:
  - classic gameplay starfield should stay clearly visible during play and read
    as active motion, not as a barely-there ambient texture
- Active gap:
  - Aurora classic and aurora-themed backgrounds should continue to be checked
    against this reference as Bundle A evolves
- Timing-alignment note:
  - polish should continue to treat original Galaga timing as part of the same
    fidelity target as visual intensity
  - that includes:
    - starfield motion cadence
    - inter-stage gaps
    - formation arrival pacing
    - enemy-group movement timing
    - opening/game-start handoff timing

### Classic Audio / Phase Motifs

- Source:
  - `/Users/stevenwoods/Documents/Codex-Test1/reference-artifacts/analyses/galaga-audio-reference-video/README.md`
  - `/Users/stevenwoods/Documents/Codex-Test1/reference-artifacts/analyses/galaga-audio-reference-video-2/README.md`
  - `/Users/stevenwoods/Documents/Codex-Test1/reference-artifacts/analyses/galaga-audio-reference-video-3/README.md`
- Current use:
  - compare:
    - opening/title motif feel
    - stage/round announcement cues
    - capture/rescue cue identity
    - challenge perfect/result phrasing
    - last-ship / game-over descent and tension handling
    - high-score/result cue separation
    - fighter-capturing / captured-ship-destruction variants
    - challenging-stage announcement / result / perfect variants
    - coin / start / extra-fighter / enemy-family indexed cue variants
- Current rule note:
  - original Galaga should remain the strongest reference for gameplay-phase
    sound identity, while Aurora may still own shell/front-door flavor where the
    product now has application-specific surfaces
- Later trueness goal:
  - Aurora should gradually align its gameplay-state and cue mapping more
    closely with original Galaga, but that fidelity work should remain
    application-owned.
  - `Platinum` should provide the extension points needed to host richer
    game-specific state, phase, and cue models without absorbing that behavior
    into the platform itself.
  - This is expected to matter again for the next hosted game, so the reference
    archive should continue to be curated with reusable game-owned mappings in
    mind rather than platform-owned special cases.
- Active gap:
  - Aurora currently has improved phase routing and stronger motifs, but it is
    still not yet a full Galaga-faithful selectable gameplay sound theme
- Timing-alignment note:
  - audio fidelity work should be judged together with gameplay timing
  - a cue is not "true enough" if it exists but lands at the wrong moment
  - by default, timing and pacing decisions should come from measured reference
    artifacts first:
    - archived gameplay video
    - extracted clips
    - waveforms
    - contact sheets
    - generated timing-analysis reports
  - manual listening/viewing should be used as validation after the measured
    baseline is established, not as the primary source of truth
  - polish work should therefore compare Aurora against Galaga for:
    - game-start timing
    - inter-stage timing
    - challenge-stage setup timing
    - active-play cadence timing
    - results / perfect-clear timing
- Stage 1 opening reference:
  - `/Users/stevenwoods/Documents/Codex-Test1/reference-artifacts/analyses/galaga-stage-opening-timing/2026-04-12-main-a777fba/README.md`
  - preserve the full `4.0s` Galaga start phrase where feasible
  - use the interstitial / arrival signal after the full phrase
  - first visible alien arrivals should stay closer to the measured reference
    window than to a convenience-driven shortened opening
- Cue matrix:
  - `/Users/stevenwoods/Documents/Codex-Test1/reference-artifacts/analyses/galaga-audio-cue-matrix/README.md`
  - use this to map Aurora cue slots against the strongest current Galaga
    reference clips and identify missing game-owned slots before deeper audio
    fidelity work
- Durable timing library:
  - `/Users/stevenwoods/Documents/Codex-Test1/reference-artifacts/analyses/galaga-reference-timing-library/README.md`
  - `/Users/stevenwoods/Documents/Codex-Test1/reference-artifacts/analyses/galaga-reference-timing-library/event-families.json`
  - use this as the default starting point for event-family timing, pacing, and
    audiovisual sync work
  - this same pattern should later be reused for `Galaxian` and future packs

### Challenge Stage Fidelity

- Source:
  - manual-backed structure
  - original challenge-stage footage
  - `/Users/stevenwoods/Documents/Codex-Test1/reference-artifacts/analyses/first-challenge-stage/README.md`
  - `/Users/stevenwoods/Documents/Codex-Test1/reference-artifacts/analyses/challenge-stage-reference/README.md`
- Current metrics:
  - `stage3-challenge`
  - `stage6-regular`
  - `stage7-challenge`
  - challenge hit rate
  - average upper-band dwell time per target
- Current rule note:
  - challenge stages are currently treated as non-lethal bonus rounds, which
    matches our present reading of the reference material for `#33`
- Active gap:
  - visual and timing fidelity still not close enough to original Galaga

### Capture / Rescue / Dual Fighter

- Sources:
  - manual
  - gameplay footage
  - `/Users/stevenwoods/Documents/Codex-Test1/reference-artifacts/analyses/release-reference-pack/README.md`
- Current metrics:
  - `rescue-dual`
  - `capture-rescue-dual`
  - `carried-boss-diving-release`
  - `carried-boss-formation-hostile`
  - `second-capture-current`
  - `natural-capture-cycle`
  - `stage4-capture-pressure`
  - carried-fighter scoring scenarios
- Active gaps:
  - remaining rescue usefulness / edge-case fidelity
  - Stage 4-specific capture pressure still needs stronger measurement and tuning
  - manual-backed confidence is currently strongest for:
    - killing the boss while it is attacking recovers dual fighters
    - shooting the carried fighter itself destroys it for points
  - current implementation now follows that attacking-boss branch more directly:
    - diving boss kill releases the captured fighter into an automatic rejoin path
    - in-formation boss kill spawns an immediate hostile captured fighter branch
  - the exact hostile / in-formation branch still needs stronger primary-source confirmation against original gameplay footage or emulator capture

### Post-1.0 Scoring / Special Pattern Research

- Sources:
  - manual
  - original gameplay footage
  - future emulator captures
- Current state:
  - special attack squadron bonus logic exists, but we do not yet have enough
    evidence to claim original-accurate timing/composition for the bonus-yielding
    three-fighter attack clusters seen in regular play
- Planned follow-up:
  - capture stronger evidence after 1.0 and map exact appearance timing,
    composition, and scoring behavior before expanding that system further

Important near-term exception:

- for the scoped four-stage `1.0`, the game should still visibly demonstrate the
  classic boss-with-two-escorts special attack and show the resulting bonus in
  normal play, even if deeper late-game pattern research stays post-`1.0`

### Later-Stage Variety

- Sources:
  - walkthrough notes
  - later gameplay footage
- Current metrics:
  - `stage12-variety`
  - stage profile / family logging
- Current state:
  - first stage-band pass is in
  - deeper transform / family fidelity is still follow-up work

### Later-Stage Survivability

- Sources:
  - original gameplay footage
  - our harness diagnostics
  - `/Users/stevenwoods/Documents/Codex-Test1/reference-artifacts/analyses/stage4-fairness/README.md`
  - `/Users/stevenwoods/Documents/Codex-Test1/reference-artifacts/analyses/release-reference-pack/README.md`
- Current metrics:
  - `stage4-five-ships`
  - `stage4-survival`
- Active gap:
  - later-stage collision fairness and progression depth

### External Implementation References

- These are architecture/presentation references, not original-Galaga rules
  sources.
- Current external reference:
  - `/Users/stevenwoods/Documents/Codex-Test1/reference-artifacts/analyses/external-galaga5/README.md`
- Use case:
  - borrow ideas about structure or presentation when useful
  - do not treat them as fidelity evidence

### Future Galaxian Sibling Archive

- This project now also keeps a growing sibling-reference archive for future
  Platinum `Galaxian`-family work:
  - `/Users/stevenwoods/Documents/Codex-Test1/reference-artifacts/analyses/galaxian-mechanics/README.md`
- Naming rule:
  - `Galaxian`
    - the original reference lineage
  - `Galaxy Guardians`
    - the future game project that may draw from those references
- Current status:
  - planning-grade developer reference
  - not yet canonical arcade-rule evidence
- Use case:
  - collect likely scoring, dive, escort, and formation rules for the future
    sibling pack
  - clearly mark what still needs promotion to stronger source-backed evidence

## What To Add Next

High-value future baseline additions:

1. Emulator-derived captures and timing notes
2. Curated reference clips by system:
   - first challenge stage
   - first capture
   - first rescue
   - later-stage pressure
   - classic starfield / board readability
3. Issue-by-issue reference mapping so open fidelity issues point directly at evidence

Current focused release pack:

- `/Users/stevenwoods/Documents/Codex-Test1/reference-artifacts/analyses/release-reference-pack/README.md`

## Collaboration Rule

When a gameplay-fidelity issue is opened or worked, it should eventually point
back to at least one entry in this document or to a durable source under:

- `/Users/stevenwoods/Documents/Codex-Test1/reference-artifacts/`
