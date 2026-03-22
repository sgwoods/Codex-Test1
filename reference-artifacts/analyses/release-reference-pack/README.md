# Release Reference Pack

This pack gathers the highest-value reference material for the current release
push into one place so we can tune against durable evidence instead of
re-discovering the same comparisons ad hoc.

It is intentionally focused on the systems that are still blocking or shaping
release quality:

1. capture / rescue / hostile recovered-fighter branches
2. Stage 3 -> Stage 4 transition rhythm and visibility
3. Stage 4 special-attack composition and early pressure
4. cabinet-style framing / HUD presentation

## Source priorities

Use these in order:

1. manual / cabinet-era material
2. original gameplay capture
3. emulator-backed or curated gameplay references
4. secondary written guides

## Primary local anchors

### Manual

- `/Users/stevenwoods/Documents/Codex-Test1/reference-artifacts/manuals/galaga-1981-namco/README.md`
- `/Users/stevenwoods/Documents/Codex-Test1/reference-artifacts/manuals/galaga-1981-namco/Galaga_-_1981_-_Namco.pdf`

Important manual-backed rules already reflected here:

- first challenging stage comes after Stage 2
- special three-enemy attack squadrons appear from Stage 4 onward
- captured fighter stays tied to the command ship that captured it
- shooting the carried fighter itself destroys it for points

### Original gameplay capture already in the repo

- `/Users/stevenwoods/Documents/Codex-Test1/reference-video/original-galaga-7min.mp4`
- `/Users/stevenwoods/Documents/Codex-Test1/reference-video/original-galaga-30min.mp4`

Existing useful derived analysis:

- `/Users/stevenwoods/Documents/Codex-Test1/reference-analysis/30min-overview/contact-sheet.png`
- `/Users/stevenwoods/Documents/Codex-Test1/reference-analysis/30min-overview/first-four-minutes.png`
- `/Users/stevenwoods/Documents/Codex-Test1/reference-analysis/challenge-check/original-challenge-sheet.png`

## New local comparison windows

### Capture / challenge-result / pre-Stage-4 window

- `/Users/stevenwoods/Documents/Codex-Test1/reference-artifacts/analyses/release-reference-pack/capture-window/contact-sheet.png`

What it is useful for:

- challenge-stage result presentation
- amount of empty-board breathing room before the next normal stage
- lower-field readability around late-stage transition moments

What it does not settle alone:

- exact hostile recovered-fighter branch timing

### Challenge -> Stage 4 transition window

- `/Users/stevenwoods/Documents/Codex-Test1/reference-artifacts/analyses/release-reference-pack/transition-window/contact-sheet.png`

What this sheet shows clearly:

1. `NUMBER OF HITS` challenge-result screen
2. a visible `STAGE 4` splash / transition beat
3. a short empty-board pause before the normal formation becomes active
4. Stage 4 opening composition appearing quickly once the stage begins

Why this matters:

- it gives us a concrete comparison target for issue `#61`
- if our game shows Stage 4 HUD state but leaves the board visually empty too
  long, this sheet is the right first comparison

### Early Stage 4 / special-attack window

- `/Users/stevenwoods/Documents/Codex-Test1/reference-artifacts/analyses/release-reference-pack/stage4-window/contact-sheet.png`

What this sheet shows clearly:

1. a tractor-beam / capture setup during Stage 4-era play
2. boss-led attacks with escorts still reading as a compact arcade moment
3. on-screen bonus feedback such as `400` during special attacks

Why this matters:

- it helps with Stage 4 composition and early pressure
- it is a useful visual target for issue `#47`
- it also helps distinguish "compact special attack moment" from "three
  enemies loosely spread across the board"

### Later-pressure comparison window

- `/Users/stevenwoods/Documents/Codex-Test1/reference-artifacts/analyses/release-reference-pack/later-pressure-window/contact-sheet.png`

What this sheet shows clearly:

1. later-stage boards can look busy without becoming unreadable
2. attack traffic still tends to preserve lane identity and recognizable enemy
   groupings
3. bonus and score feedback can appear amid pressure without dissolving into
   noise

Why this matters:

- it is a good reality check when later-stage pressure starts feeling random
  instead of intense
- it gives us a visual anchor for "dense but still arcade-readable" when we
  return to Stage 4 and later survivability tuning

## Focused external references

These are supporting references, not replacements for the manual or the local
gameplay captures above.

### Capture / rescue / hostile branch

1. StrategyWiki gameplay summary:
   - https://strategywiki.org/wiki/Galaga/Getting_Started
   - Useful because it states:
     - rescue happens from a diving Boss Galaga, not one in formation
     - boss ships are two-hit enemies
     - escort count affects boss diving score

2. StrategyWiki walkthrough:
   - https://strategywiki.org/Galaga/Walkthrough
   - Useful because it describes the capture sequence in player-facing detail:
     - `FIGHTER CAPTURED` message
     - foreboding retreat music
     - if you kill the capturing boss while it is in formation, the captured
       fighter later swoops down and eventually rejoins the next entrance
       cycle rather than immediately docking
     - if you rescue from a diving boss, you should hit the boss body and not
       your own fighter

3. Wikipedia summary:
   - https://en.wikipedia.org/wiki/Galaga
   - Useful because it cleanly states the branch split:
     - diving boss kill rescues and rejoins as dual fighter
     - in-formation boss kill turns the fighter against the player and it
       returns later as part of formation
   - Treat as supporting confirmation, not the only authority.

### Stage indicators / score logic / special-attack scoring

1. StrategyWiki gameplay page:
   - https://strategywiki.org/wiki/Galaga/Getting_Started
   - Useful because it captures several release-relevant details in one place:
     - boss diving scores `400 / 800 / 1600`
     - stage indicators live in the bottom-right
     - challenge-stage cadence and scoring notes

### Frame / bezel / cabinet treatment

1. Cabinet bezel reference:
   - https://www.arcadeartshop.com/product/galaga-perspex-bezel/
   - Useful because it gives us a durable example of the upright bezel shape
     and reinforces that the original game was visually framed, not a loose
     black rectangle in an infinite browser background

2. Internal style prompt:
   - the user-provided bezel screenshot used during this workstream should be
     treated as an immediate art-direction prompt for `#48`

## How to use this pack

### For issue `#58`

Use:

- manual README
- StrategyWiki walkthrough
- local Stage 4 windows

Focus on:

- direct rescue from diving boss
- hostile / delayed-return branch when killed in formation
- readability of the carried fighter versus the boss body

### For issue `#61`

Use:

- `/Users/stevenwoods/Documents/Codex-Test1/reference-artifacts/analyses/release-reference-pack/transition-window/contact-sheet.png`
- `/Users/stevenwoods/Documents/Codex-Test1/reference-analysis/30min-overview/first-four-minutes.png`

Focus on:

- how long the board is allowed to sit visually empty after Stage 3 result
- whether Stage 4 formation becomes visible immediately after the transition
  beat

### For issue `#47`

Use:

- `/Users/stevenwoods/Documents/Codex-Test1/reference-artifacts/analyses/release-reference-pack/stage4-window/contact-sheet.png`
- StrategyWiki gameplay scoring page

Focus on:

- compactness of boss-plus-two-escort attacks
- whether the bonus reads as one recognizable arcade event

### For issue `#48`

Use:

- bezel reference link above
- user-provided cabinet/frame screenshot

Focus on:

- clearly bounded playfield
- decorative frame art that feels like an arcade surround rather than generic
  web chrome

### For later-stage fairness and variety work

Use:

- `/Users/stevenwoods/Documents/Codex-Test1/reference-artifacts/analyses/release-reference-pack/later-pressure-window/contact-sheet.png`
- `/Users/stevenwoods/Documents/Codex-Test1/reference-artifacts/analyses/stage4-fairness/README.md`

Focus on:

- preserving readable lanes under pressure
- keeping enemy motion recognizable even when density rises
- avoiding the "empty until unfair" feel on transitions or late-stage openings

## What is still missing

The remaining weak area in this pack is a stronger dedicated capture-branch
visual sequence from original gameplay showing:

1. boss destroys / releases captured fighter while diving
2. in-formation branch where the recovered fighter later turns hostile or
   returns on the next entrance sequence

If we capture one more focused local sheet from the longer original gameplay
video for that exact branch, this pack will cover most of the current release
questions well enough for day-to-day tuning.
