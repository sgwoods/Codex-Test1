# Aurora Galactica Game Designer View

This document is the first working inventory for the future
`Game Designer` phase of `Aurora Galactica`.

It is intentionally game-owned, not platform-owned.

- `Platinum`
  - owns the shell, hosting runtime, shared services, and generic panel
    framework
- `Aurora Galactica`
  - owns the stage identity, enemies, bosses, challenge-stage ideas, on-screen
    text, audio identity, and content definitions that make this game itself

The point of this view is to help us evolve Aurora with less risky code change
by clearly identifying what should eventually become editable, data-defined, or
designer-driven.

## Purpose

The `Game Designer` phase should give us a structured way to:

- expand and vary stages without destabilizing Platinum
- make challenge stages more interesting and more distinct from each other
- define bosses as real characters with personality and role
- evolve enemy families, movement, visual identity, text, and audio together
- track what is already data-driven and what is still trapped in code

## Design Areas

These are the major Aurora-owned design surfaces we should treat as first-class.

### 1. Stage Designer

The stage designer should eventually control:

- stage number or stage band
- normal-stage versus challenge-stage role
- stage theme id
- background mode
- frame/chrome theme
- formation layout
- entry timing and cadence
- attack pressure goals
- stage intro and transition text
- challenge-stage structure
- reward/bonus expectations
- target player feeling
  - calm
  - rising pressure
  - aggressive
  - spectacle
  - boss showcase

### 2. Challenge Stage Designer

Challenge stages should become explicit authored experiences rather than one
generic variation.

Each challenge stage should eventually define:

- challenge theme
- visual identity
- movement vocabulary
- enemy family mix
- spawn order
- lane pattern
- target pacing
- target hit expectation
- perfect bonus rules
- special boss or featured enemy personality
- title/subtitle copy

The long-term goal is for each challenge stage to feel like a themed bonus
opportunity with its own signature behavior.

### 3. Alien Designer

Alien design should eventually be separated into reusable families and variants.

Each alien family should define:

- family id
- visual references
- sprite/icon set
- size and hitbox expectations
- idle/formation pose
- dive style
- steering style
- attack style
- sound/event identity
- stage eligibility
- challenge-stage eligibility

### 4. Boss Designer

Aurora should eventually treat bosses and partner/boss variants as authored
characters rather than just tougher enemy objects.

Each boss definition should eventually include:

- boss id
- title/name
- archetype
- personality
- stage or challenge usage
- escort relationship
- movement verbs
  - commanding
  - stalking
  - lunging
  - circling
  - sweeping
  - splitting
- attack profile
- capture/rescue role, if any
- iconography and sprite references
- audio identity
- on-screen title or callout text

## Current Aurora Stage Identity

Aurora already has some real stage-theme structure in the pack data.

Current stage-theme progression in code:

- `quiet-skies`
  - from stage `1`
  - frame accent: `classic-blue`
  - background: `starfield`
  - boss archetype: `command-core`
- `scorpion-dawn`
  - from stage `4`
  - frame accent: `amber-blue`
  - background: `aurora-hint`
  - boss archetype: `super-boss-scorpion`
- `stingray-surge`
  - from stage `8`
  - frame accent: `teal-gold`
  - background: `aurora-borealis`
  - boss archetype: `partner-wing-stingray`
- `galboss-veil`
  - from stage `12`
  - frame accent: `violet-gold`
  - background: `aurora-borealis`
  - boss archetype: `council-boss`
- `crown-aurora`
  - from stage `16`
  - frame accent: `aurora-crown`
  - background: `aurora-borealis`
  - boss archetype: `super-partner-pair`

This is a strong start, but it is still more like theme metadata than full
designer-owned stage authoring.

## Current Aurora Enemy / Family Identity

Aurora currently has these family-level identities in play:

- `classic`
- `scorpion`
- `stingray`
- `galboss`
- challenge-family variants:
  - `dragonfly`
  - `mosquito`

These are promising seeds for a future alien designer, but we still need to
evolve them into richer authored families with clearer:

- movement identity
- challenge-stage role
- boss/partner relationship
- sound identity
- visual approval status

## Current Aurora Challenge-State Gaps

Right now challenge stages still have important design gaps:

- they are not yet treated as bonus stages outside the numbered stage flow
- they do not yet have distinct authored themes per challenge occurrence
- they do not yet have named/special featured boss identities
- their movement and presentation are still closer to a tuned pattern than a
  curated authored showcase

That means a major designer-phase goal is:

- make each challenge stage a themed bonus experience
- give it a clear featured identity
- and eventually attach a special boss or signature enemy concept to it

## Suggested Designer Data Buckets

These are the content buckets we should eventually define outside code for
Aurora.

### Stage Themes

Each theme should eventually capture:

- id
- name
- frame/chrome style
- background style
- copy tone
- audio profile
- eligible enemy families
- eligible boss archetypes
- challenge-stage variants

### Challenge Stage Definitions

Each challenge stage should eventually capture:

- id
- display title
- featured theme
- featured boss or signature enemy
- movement concept
- enemy roster
- spawn schedule
- score targets
- perfect criteria
- fail/partial commentary copy

### Boss Definitions

Each boss entry should eventually capture:

- id
- title
- role
- personality
- motion profile
- attack profile
- escort rules
- challenge-stage usage
- visual asset refs
- sound refs
- stage-band usage

### Screen Text Surfaces

Aurora-specific text that should eventually be game-defined:

- front-door copy
- start prompts
- stage-transition copy
- challenge-stage copy
- boss callouts
- pause-panel copy
- quote-adjacent thematic copy
- future game-information page copy

### Audio Surfaces

Aurora-specific audio design should eventually be defined against:

- one-shot events
- sequenced events
- state layers
- stage-theme cues
- challenge-stage cues
- boss cues
- reward / extend cues

See:

- `/Users/steven/Documents/Codex-Test1/AUDIO_PLAN.md`

## What Is Already Data-Driven

Aurora already has meaningful data-driven structure in:

- stage theme progression
- frame accents
- formation layouts
- challenge cadence
- challenge layout
- scoring tables
- capability flags

This lives mainly in:

- `/Users/steven/Documents/Codex-Test1/src/js/13-aurora-game-pack.js`

## What Is Still Too Code-Bound

Aurora still needs more design information moved out of code for the future
designer phase:

- richer challenge-stage authored variations
- boss personality and movement definitions
- enemy-family design notes and approval state
- on-screen narrative/stage copy beyond the current pack metadata
- explicit per-stage audio identity
- visual asset catalogs and usage maps

## Immediate Designer-Phase Next Steps

Before we build the actual `Game Designer` control surface, the next practical
Aurora steps are:

1. define a first `stage theme catalog` for Aurora
2. define a first `challenge stage catalog`
3. define a first `boss archetype catalog`
4. map existing Aurora assets, copy, and movement behaviors into those buckets
5. decide which fields should become editable first

Recommended first editable surfaces:

1. stage theme metadata
2. challenge-stage titles and theme identity
3. boss archetype descriptors
4. enemy family notes and visual references
5. stage and challenge movement description text

## Relationship To The Future Game Designer Panel

This document should become the source planning artifact for the future
Aurora-specific designer surface.

That future panel should likely be split into:

- `Stage Designer`
- `Challenge Stage Designer`
- `Alien Designer`
- `Boss Designer`
- `Text / Copy Designer`
- `Audio / Theme Designer`
- `Asset / Icon Designer`

The panel should help us make narrow, game-owned changes and additions without
requiring risky platform edits.

## Related Tracking

- per-game admin/artifact panel:
  - `#139`
- game-pack designer control panel for assets, stages, and enemy design:
  - `#141`
