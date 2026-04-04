# Content Plan

This document tracks curated non-mechanical content that should be platform-owned
or pack-owned without being buried directly in gameplay logic.

## Scope

This currently covers:

- front-door slash / splash presentation
- platform identity splash surfaces
- one-time notices and release explanations
- functionality reminders
- curated quote moments
- future game-picker copy and game descriptions
- short game-information pages for individual game projects

## Curated Quote System

We want to support approved AI dystopian quotes as part of the cabinet and front
door experience.

The source comes from the companion project interface documented here:

- [APPROVED_QUOTES_INTERFACE.md](https://github.com/sgwoods/sci-fi-ai-dystopian-project/blob/main/APPROVED_QUOTES_INTERFACE.md)

Canonical consumer rule:

- consume only the approved export
- do not read from:
  - `data/review/`
  - `data/candidates/`
  - `data/discovery/`

Approved export locations:

- local development source:
  - `/Users/stevenwoods/SciFi AI Dystopian Project/data/approved/ai-dystopia-quotes.approved.json`
- published public copy:
  - `/Users/stevenwoods/GitPages/public/data/ai-dystopia-quotes.approved.json`

Source project:

- `SciFi AI Dystopian Project`
- [https://github.com/sgwoods/sci-fi-ai-dystopian-project](https://github.com/sgwoods/sci-fi-ai-dystopian-project)

The runtime contract should assume quote ingestion happens from this separately
curated approved source file, not from hardcoded strings in Aurora itself.

## Design Rules

- quotes must come from an explicitly approved source file
- quotes should be treated as curated content, not random generation at runtime
- quotes should be contextual and occasional, not constant
- quotes should be dismissible or skippable when shown as overlays
- gameplay readability takes priority over quote display
- quote moments should reinforce world identity, stage identity, or front-door
  tone

## Integration Surfaces

The platform should eventually support these quote surfaces:

- splash / slash page opener
- attract mode or wait-mode ambient quote rotation
- stage transition or challenge intro stingers
- one-time post-refresh notice panel
- game-picker descriptive copy

The platform should also support these non-quote shell content surfaces:

- a Platinum identity splash opened from a dedicated shell button
- future-title preview splashes shown from the game picker
- dismissable `Coming Soon` title cards for non-playable packs

Near-term Platinum shell quote rules:

- do not mix approved AI dystopian quotes into the primary splash-title block
- instead, rotate one approved quote during wait mode before the high-score
  rotation resumes
- include citation details with the quote:
  - speaker or author
  - work title
  - year when available
- show one approved quote during pause with breathing room beneath the
  `Press P to resume` guidance
- add a lower-left dock `AI` button that opens a shell panel matching the
  other info panels
- the `AI` panel should support scrolling through approved quotes and include a
  link that opens the Sci-Fi AI Dystopian project page in a new tab

Near-term Platinum shell splash rules:

- the shell should expose a Platinum identity button with hover copy:
  - `Platinum Arcade Game Platform`
- clicking it should open a centered Platinum splash with dismiss `X`
- future non-playable game picks should open a dismissable splash instead of
  pretending to start gameplay
- the first named future-title preview should be:
  - `Galaxy Guardians`
- that preview should render under a visible `Coming Soon` banner

Quotes should not appear:

- during dense active combat
- over critical capture/rescue or scoring feedback
- in a way that blocks controls without clear dismissal

## Content Model

The approved JSON is a top-level object with this shape:

```json
{
  "collection": "ai-dystopia-quotes",
  "generated_at": "2026-04-03",
  "description": "Approved ingest set of dystopian AI quotes.",
  "source_board": "data/review/ai-dystopia-quotes.review-board.json",
  "records": []
}
```

Consumers should read from `records`.

Each record may include:

- `id`
- `quote`
- `quote_speaker`
- `speaker_is_ai`
- `work_title`
- `work_type`
- `work_year`
- `work_creators`
- `themes`
- `source`
- `metadata_source`
- `local_snapshot_path`
- `notes`
- `review`
- `source_work`

Consumer use in this platform should be:

- `id`
  - stable identifier
- `quote`
  - display text
- `quote_speaker`, `work_title`, `work_year`
  - attribution
- `themes`, `speaker_is_ai`
  - filtering and pack logic
- `source_work.summary`, `source_work.cover_image_url`
  - richer front-door or picker presentation
- `source.url`, `metadata_source.url`
  - drilldown and citation when needed

## Platform Ownership

The shared platform should own:

- quote ingestion
- quote eligibility filtering
- surface placement rules
- dismissal / cooldown behavior
- platform identity splash surfaces
- future-title preview shell surfaces

Each `gamePack` should own:

- which themes or tones fit the game
- which surfaces are allowed
- whether quotes are active during that game
- branded copy around those quotes
- preview copy and preview art for non-playable future titles
- its own short game-information page copy and supporting art

Naming rule for future game-information pages:

- `Aurora Galactica`
  - the Galaga-family shipped game on Platinum
- `Galaxy Guardians`
  - the future sibling project
- `Galaxian`
  - reference lineage and mechanics source, not the same thing as the future
    game title

## Aurora Notes

For Aurora specifically, quotes could work well in:

- the high-quality slash page before entering the game
- wait mode between demos
- occasional stage-transition stingers
- future one-time refresh notices

Aurora should bias toward:

- mythic / dystopian / cosmic tones
- short, high-impact lines
- low-frequency presentation

## Next Implementation Step

When we are ready to wire this for real, the clean path is:

1. add a content registry / loader for approved JSON
2. add a shell-level quote presentation surface
3. let the active `gamePack` opt in and filter themes
4. keep quote display entirely outside the core gameplay update loop

## Refresh Behavior

The approved export may grow or reorder over time. Consumers should treat:

- `records`
  - as the only approved ingest surface
- `id`
  - as the stable downstream reference key
