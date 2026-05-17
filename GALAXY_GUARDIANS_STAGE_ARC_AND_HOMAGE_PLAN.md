# Galaxy Guardians Stage Arc And Homage Plan

Updated: May 16, 2026

## Purpose

This document describes `Galaxy Guardians` as a game arc rather than only as a
bag of harnesses.

It exists to answer four practical questions:

1. what the game should feel like from attract mode through loss or completion
2. how that feel should change by stage band as pressure rises
3. what conformance work should be sequenced first to make the game deeper in a
   source-grounded way
4. what later homage variants may change without destroying the original
   Galaxian-family flavor

This is a companion to:

- [GALAXY_GUARDIANS_FIRST_CLASS_CONFORMANCE_PLAN.md](GALAXY_GUARDIANS_FIRST_CLASS_CONFORMANCE_PLAN.md)
- [GALAXY_GUARDIANS_LONG_SURFACE_AND_PERSONA_PLAN.md](GALAXY_GUARDIANS_LONG_SURFACE_AND_PERSONA_PLAN.md)
- [CLASSIC_ARCADE_INGESTION_FRAMEWORK.md](CLASSIC_ARCADE_INGESTION_FRAMEWORK.md)

## Current Truth Boundary

Two things are true at once:

1. hosted `dev` and `beta` still expose a one-level visible public slice that
   currently ends with `mission_complete`
2. the source repo already contains a deeper repeated-rack runtime and
   stage-band conformance layer used for internal review, tuning, and future
   productization

So this plan distinguishes between:

- the current public-playable visible arc
- the deeper internal stage-band arc we are tuning toward
- the eventual homage-variant grammar that should sit on top of the validated
  base game rather than replace it

## Canonical Source Anchors

The current stage-arc and homage work should stay grounded in the committed
Galaxian reference bundle:

- `matt-hawkins-arcade-intro`
- `arcades-lounge-level-5`
- `nenriki-15-wave-session`

These sources are already declared in:

- [reference-artifacts/analyses/galaxian-reference/README.md](reference-artifacts/analyses/galaxian-reference/README.md)
- [reference-artifacts/analyses/galaxian-reference/source-manifest.json](reference-artifacts/analyses/galaxian-reference/source-manifest.json)

Use them differently:

- `matt-hawkins-arcade-intro` for attract, `WAIT`, score-advance table, reserve
  ships, flags, and the beginning of the first playable rack
- `arcades-lounge-level-5` for a denser still-readable midgame pressure window
- `nenriki-15-wave-session` for moving starfield motion, longer-session rack
  cadence, escort pressure, and bottom-exit/top-reentry behavior

## Game Arc

### 1. Attract And Invitation

This is not a story cutscene. It is an arcade invitation.

The cabinet should communicate:

- high score and score advance table matter
- alien families are readable before play begins
- the game is about formation pressure, dives, and single-shot discipline
- the audiovisual identity is crisp, sparse, and readable rather than lush

Current biggest needs:

- stronger `WAIT` / headline treatment
- tighter score-advance table layout and phrasing
- better reserve-ship, flag, and HUD fidelity
- moving starfield and cabinet motion that already feels alive before play

### 2. Rack Establish

The first seconds of live play should establish the whole contract:

- the formation enters and settles into a marching rack
- the player gets one precise shot at a time
- the board is readable before real pressure begins
- the player ship looks armed and vulnerable

This is where conformance trust is won or lost fastest.

If the rack drifts lazily, the starfield is static, the ship lacks a ready cue,
or the start surface reads as generic, the game feels off before the first dive.

### 3. Opening Pressure

After settle, the game should teach the basic Galaxian-family risk loop:

- scouts dive alone first
- the player learns the cost of a missed shot
- the lower field becomes dangerous without immediate chaos
- death hurts, but does not erase the board and destroy learning

The opening should feel fair, tight, and legible.

### 4. Command Pressure

Once the player understands the rack, flagship-and-escort moments should become
the emotional center of the game:

- the board is no longer just a shooting gallery
- escorts and flagship dives become high-value/high-risk events
- enemy shots arrive often enough to force route discipline
- wrap and return behavior makes the lower field feel continuous

This is the moment where the game stops being "simple" and starts feeling
distinctly Galaxian-family.

### 5. Sustained Session Pressure

A deeper run should not become a different game.

It should feel like the same grammar becoming denser:

- march cadence grows faster and more insistent
- dive timing compresses
- shot density rises
- stage presentation shifts enough to imply a real run, not a decorative skin
- expert and professional personas can survive longer by reading patterns, not
  by exploiting non-arcade mechanics

### 6. Bounded Late Loop

The original family does not need a modern story ending to feel complete.

For conformance and future release work, the late loop should be treated as:

- a real high-pressure arcade state
- bounded and reviewable for harness purposes
- suitable for persona stress and fairness tuning
- still recognizably the same game, not a difficulty gimmick

The goal here is not infinite-system invention. The goal is authoritative
pressure at the edge of the established grammar.

### 7. End States

There are three different "ends" we should keep separate:

1. `current public slice end`
   Stage 1 clears and the current hosted preview completes the mission.
2. `full-game arcade end`
   The primary canonical ending is player loss after a sustained run, with high
   score, stage reached, and run identity preserved.
3. `variant or review cap end`
   A later homage or bounded review build may intentionally cap a session, but
   only if that cap feels like an arcade rule and not a story imposed from
   outside the original flavor.

## Stage-Band Model

The current repo already has a stage-band review grammar. This table makes it
readable as a game arc instead of only as internal tuning language.

| Band | Stages | Player feeling | Primary conformance focus | Good future variant levers |
| --- | --- | --- | --- | --- |
| Attract and ready | pre-play | Invitation, clarity, score literacy, cabinet identity | `WAIT`, score table, HUD, reserve ships, stage flags, starfield, player-ready cue | copy, palette family, cabinet framing, attract audio phrasing |
| Opening establish | `1-2` | Fairness, readability, first-loss learnability | rack entry, march cadence, early dives, explosion states, first enemy shots | slight palette variations, alternate but equivalent intro copy |
| Early escalation | `3-5` | Tension rising without chaos | scout-to-flagship pressure handoff, enemy shot cadence, wrap/reentry fidelity | dive-path styling, escort emphasis, stage-theme transitions |
| Sustained pressure | `6-9` | Real session underway; mastery matters | later-band fairness, clear potential, expert/professional persona separation | stronger stage theme shifts, controlled audio color changes |
| Bounded late loop | `10+` | High-pressure arcade survival | clamp tuning, fairness under density, score identity, loss/result credibility | bounded pressure presets, special late-loop presentation accents |

## Progression Of Work

We should advance the game in layers that improve both the live playable slice
and the deeper conformance model.

### Track 1. Opening-slice baseline

Best return against time and compute.

Scope:

- `WAIT` / score-advance table / headline surfaces
- moving starfield
- rack march cadence
- explosion states
- missile-ready ship state
- reserve ships
- stage flags
- bottom-exit/top-reentry visibility

Primary artifacts:

- attract/readiness crops
- contact sheets from `matt-hawkins-arcade-intro`
- long-session motion windows from `nenriki-15-wave-session`
- opening-slice render surface and attract-score surface artifacts already in
  `reference-artifacts/analyses/galaxy-guardians-identity/`

Primary metric additions:

- explicit opening-stage presentation and HUD fidelity
- explicit rack-march and starfield-motion fidelity

### Track 2. Pressure grammar and motion

This is where the game becomes deeper rather than merely prettier.

Scope:

- scout dive spacing
- flagship and escort pressure
- enemy shot cadence
- lower-field fairness
- top reentry timing and visibility
- life-reset pacing without full-board reset

Primary artifacts:

- runtime/reference traces
- promoted event windows
- longer-session motion captures
- stage-band timing summaries

Primary metric additions:

- stage-band pressure fidelity
- lower-field fairness and clear potential
- late-band persona divergence quality

### Track 3. Score, loss, completion, and platform-frame parity

This is the highest-value structural layer after motion.

Scope:

- game-owned high scores and pilot records
- signed-in framing that feels as first-class as Aurora
- replay/video capture surfaces
- bug report and feedback transport
- music / SFX / mute / volume parity
- game-over and run-summary credibility

Primary metric additions:

- platform-frame parity
- run-summary and result-state fidelity
- two-game support parity between Aurora and Guardians

### Track 4. Deeper repeated-rack authority

This is where the internal stage-band model becomes product-ready.

Scope:

- stage `3-5` and `6-9` evidence promotion
- stronger theme progression and pressure progression evidence
- late-loop clamp tuning
- expert and professional persona authority

Primary artifacts:

- stage-band captured traces
- persona distribution outputs
- later-session score and survivability summaries

Primary metric additions:

- stage-band coverage completeness
- persona authority score
- deeper-run public-readiness score once the product actually exposes it

### Track 5. Homage variant framework

Variants should come after the base game is credible, not before.

The base game must first establish:

- recognizable Galaxian-family opening slice
- credible repeated-rack pressure grammar
- game-owned score/result identity
- first-class platform support inside Platinum

Only then should we invest in homage branches or selectable variants.

## Homage Variant Grammar

### Invariants To Preserve

Any true homage variant should preserve these:

- single-shot player discipline
- formation-rack establish before serious pressure
- march-like left-right cadence rather than floaty drift
- scout dives followed by flagship-and-escort command pressure
- visible bottom-exit and top reentry behavior
- score-advance literacy, reserve ships, flags, and high-score cabinet framing
- sparse, bright, cabinet-like audiovisual phrasing rather than cinematic wash
- a run that is fundamentally about survival, score, and pressure escalation

If a variant drops these, it may still be a fine game, but it is no longer a
Guardians/Galaxian-family homage in the sense we want.

### Safe Variant Levers

These are good later levers for novelty without losing flavor:

- faction naming and art direction within the same role grammar
- palette families by stage band
- cabinet-frame and marquee treatment
- alternate but equivalent attract/mission language
- slightly different dive curves and escort emphases
- audio timbre and phrase shaping around the same cue windows
- bounded alternate pressure presets for expert review modes
- optional capped-session variants if they still read as arcade rule sets

### Unsafe Drift

These are likely to destroy the original flavor if introduced casually:

- Aurora carry-over such as capture/rescue, dual fighters, or challenge-stage
  structures becoming the defining grammar
- rapid-fire or multi-shot player rules
- cinematic story cutscenes replacing score-table and rack-centered identity
- soft, floaty motion replacing march cadence
- decorative backgrounds replacing the live starfield and cabinet clarity
- wrap behavior that teleports or hides instead of visibly continuing the threat

## Metric Strategy

We do not need a wholesale rewrite of the conformance model.

We do need to sharpen it in three ways:

1. add an explicit `opening-stage presentation and HUD fidelity` metric family
   for Guardians
2. add an explicit `platform-frame parity` metric family so Aurora and
   Guardians can be compared as first-class Platinum citizens, not just as
   isolated games
3. add a `stage-arc coverage` view so Guardians is judged by attract, opening,
   escalation, sustained pressure, and end-state quality rather than by a flat
   overall score alone

That means:

- keep the current overall reference and playtest scores
- keep the current long-surface/persona layer
- add stage-arc readability on top rather than replacing the existing scores

## Immediate Next Work

1. finish the opening-slice baseline so the public visible level looks clearly
   Galaxian-family before we talk too much about later depth
2. promote stage-band motion and pressure artifacts for stages `3-5` and `6-9`
3. add a platform-frame parity scorecard row that compares Aurora and Guardians
   directly
4. only after those steps, start designing homage variants from the preserved
   invariant grammar instead of improvising novel mechanics too early

## Current Top 10 Improvement Queue

This is the current ordered queue for `Galaxy Guardians`, balancing visible
player value, conformance lift, and cost/compute discipline.

1. promote the opening-slice artifact pack for `WAIT`, score table, reserve
   ships, flags, and player-ready/readiness cues from the committed intro
   sources
2. tighten rack march cadence and opening left-right swarm motion against the
   measured opening windows
3. tune moving starfield motion and opening palette progression against the
   long-session reference instead of decorative instinct
4. make bottom-exit / top-reentry behavior visibly continuous and timing-faithful
   across the current public slice
5. improve explosion, hit, and destruction-state readability so combat feedback
   feels more arcade-authentic at live scale
6. promote stage `3-5` pressure traces and tune the scout-to-flagship/escort
   handoff into a clearer command-pressure arc
7. promote stage `6-9` traces and raise sustained-pressure fairness plus clear
   potential for expert/professional personas
8. make Guardians first-class in the Platinum frame for sign-in, scores, pilot
   card, replay/video capture, bug reports, and Arcade Music/SFX surfaces
9. strengthen game-over, mission-complete, high-score, and run-summary
   credibility so the game reads as a real run and not only a preview slice
10. only after the above, define homage variants from preserved invariant
   grammar rather than using novelty as a substitute for base-game authority

## Relationship To The Current Runtime

This plan matches the current runtime and pack truth:

- stage theme progression already exists for stages `1`, `3`, `6`, and `10+`
- stage-rank pressure already exists as a bounded escalating runtime model
- the public playable slice still clamps `maxPlayableStage` to `1`
- the internal harness model already supports deeper repeated-rack review

So the next job is not inventing a new game model from scratch.

It is making the current model readable, source-grounded, and progressively
productized.
