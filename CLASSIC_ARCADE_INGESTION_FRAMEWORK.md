# Classic Arcade Ingestion Framework

This document defines the repeatable process for turning real classic arcade
gameplay footage into Platinum game-pack knowledge.

`Galaxy Guardians` and its `Galaxian` reference lineage should be the first
small end-to-end example, but the framework is intentionally broader than that.
The goal is to make every future sibling game easier to study, model, build,
test, and explain.

## Purpose

We do not want future games to come from loose memory or surface imitation.

We want a pipeline that can:

- locate candidate reference footage and supporting materials
- ingest them into traceable manifests
- extract video, audio, timing, and visual artifacts
- build a semantic model of the original game
- turn that model into a Platinum pack plan
- generate harness and correspondence targets from the evidence
- preserve enough provenance that future work can be reviewed and trusted

The first proof does not need to cover a whole game.

It should cover one small slice completely enough that the same pattern can be
reused for other games.

The same pattern should also feed Aurora's own level-by-level expansion. New
challenge stages, later-level entry variation, alien families, and pressure
bands should come from promoted evidence windows and harness traces before
subjective tuning.

## First Target

The first target is a small `Galaxy Guardians` scout-wave preview derived from
`Galaxian`-style reference analysis.

Scope for the first complete example:

- source discovery and citation manifest
- one or more short gameplay windows
- formation-entry and early dive event log
- player movement and firing observations
- flagship / escort / enemy-family notes
- visual contact sheet
- audio or cabinet-sound notes if the footage supports them
- semantic slice profile
- minimal Platinum pack requirements
- harness plan for the first playable scout-wave slice

This should become the template for later windows and later games.

## Pipeline Stages

### 1. Source Discovery

Find candidate sources before tuning anything.

Candidate source types:

- public gameplay videos
- longplay videos
- cabinet capture videos
- manual scans
- rules summaries
- score tables
- sprite sheets or cabinet-era visual references
- audio references with clear license or provenance
- emulator recordings created specifically for analysis

Each candidate source should be entered into a source manifest before it is
treated as evidence.

Minimum manifest fields:

- `source_id`
- `game_lineage`
- `title`
- `url_or_local_anchor`
- `creator_or_archive`
- `capture_type`
- `duration`
- `video_quality`
- `audio_quality`
- `license_or_usage_note`
- `analysis_status`
- `confidence`
- `notes`

Important rule:

- source discovery may inspire direction, but implementation decisions should
  wait until a source has at least a minimal manifest entry and a clipped window
  with notes.

### 2. Source Ingestion

Ingestion turns a source into durable local artifacts.

Target outputs:

- downloaded or locally referenced media when allowed
- normalized clip windows
- frame contact sheets
- audio waveform / spectrogram if audio matters
- first-pass source notes
- media checksums where practical
- local README for the source family

Suggested anchor layout:

- `reference-artifacts/analyses/<game-lineage>/<source-id>/README.md`
- `reference-artifacts/analyses/<game-lineage>/<source-id>/manifest.json`
- `reference-artifacts/analyses/<game-lineage>/<source-id>/clips/`
- `reference-artifacts/analyses/<game-lineage>/<source-id>/frames/`
- `reference-artifacts/analyses/<game-lineage>/<source-id>/audio/`
- `reference-artifacts/analyses/<game-lineage>/<source-id>/events/`

For `Galaxy Guardians`, use a `galaxian-reference` lineage folder unless a more
specific source family is warranted.

### 3. Window Selection

Do not try to understand the whole game at once.

Pick windows that answer specific questions.

First window families for `Galaxian`:

- attract or game-start framing
- formation entry
- first settled formation
- first dives
- flagship / escort movement
- player shot cadence
- player loss and restart
- stage transition or wave completion

Each window should have:

- a stable clip id
- start and end timestamps
- why the window matters
- visible entities
- analysis questions
- confidence notes

For long-session work, promote coarse windows into exact review windows before
implementation. A promoted review window should have contact sheets, stills,
waveform when audio matters, a trace summary, and a written reason why it maps
to opening, challenge, mid-run, late-run, cleanup, or failure-state semantics.

### 4. Event Logging

Convert selected windows into reference-side event logs.

The goal is not perfect reconstruction. The goal is a stable comparison format
that can line up with Platinum harness logs.

Event fields:

- `event_id`
- `event_family`
- `time_s`
- `duration_s`
- `entity_family`
- `entity_id`
- `position_hint`
- `motion_hint`
- `audio_hint`
- `confidence`
- `source_note`

Initial `Galaxian` event families:

- `credit_or_start`
- `formation_entry_start`
- `formation_entry_settle`
- `formation_rack_complete`
- `alien_dive_start`
- `alien_dive_cross_midfield`
- `alien_dive_exit_or_return`
- `flagship_dive_start`
- `escort_join`
- `player_move_start`
- `player_move_stop`
- `player_shot`
- `player_hit`
- `enemy_hit`
- `wave_clear`
- `score_award`

Event families should become reusable vocabulary for future game packs.

### 5. Semantic Model

Once events exist, summarize the game slice as a semantic model.

The model should describe what the game means, not just what pixels moved.

Minimum model sections:

- player contract
- shot and cooldown rules
- enemy families
- formation rules
- dive rules
- flagship / escort rules
- scoring rules
- stage or wave flow
- difficulty modifiers
- audiovisual identity
- control feel
- intended player pressure
- Platinum extension points needed

This model is where the project learns the game.

### 6. Correspondence Targets

Translate the semantic model into measurable targets.

Target types:

- timing targets
- sequence targets
- spatial targets
- outcome targets
- visual targets
- audio targets
- progression targets

For the first `Galaxy Guardians` scout-wave slice, the likely first targets are:

- formation entry completes within a documented timing band
- first dive starts after a reference-backed delay
- only the expected alien families appear in the slice
- player shot cadence follows the reference-like single-shot pressure model
- flagship / escort behavior is represented as a separate rule family
- launch and fallback stay inside the Platinum pack contract

### 7. Pack Construction

Only after evidence and semantics exist should the playable slice begin.

The pack should be built from:

- a source manifest
- a window catalog
- reference event logs
- semantic slice profile
- explicit Platinum extension list
- harness target list

Avoid forcing new games into Aurora-shaped structures when the evidence says the
rules differ.

Platinum should absorb reusable host needs. The game pack should own
game-specific rules.

### 8. Harness Generation

Every playable slice should leave behind harness coverage.

Harnesses should verify:

- pack boot and preview behavior
- source-derived timing targets
- event ordering
- player control contract
- scoring and life rules
- launch fallback if still preview-only
- application-owned rules remain outside the platform shell

Longer term, the ingestion pipeline should be able to generate harness stubs
from the semantic profile.

### 9. Review Loop

The automated pipeline should not replace human review.

It should make review sharper.

Review should ask:

- does the source evidence support the rule we implemented
- do the event logs describe the clip honestly
- did the playable slice preserve the player pressure seen in reference
- did we document any intentional variation
- did we strengthen the reusable ingestion framework

## Confidence Levels

Use confidence levels consistently.

Suggested scale:

- `high`
  - directly visible or audible in a clear source window
- `medium`
  - inferred from multiple visible events or supported by a secondary source
- `low`
  - plausible design note that still needs stronger evidence
- `unknown`
  - tracked gap, not yet usable for implementation

Implementation work should prefer `high` and `medium` evidence. `low` evidence
can guide prototypes, but it should not become a release claim without review.

## Automation Goals

The initial automation should be modest but real.

Near-term tools should support:

- creating a source manifest from a URL or local media path
- extracting a clip window
- generating a contact sheet
- extracting audio analysis artifacts
- creating an editable event-log skeleton
- validating event-log schema
- producing a slice-profile summary
- comparing a Platinum harness log to a reference event log

Current seed automation:

- `npm run harness:check:classic-arcade-ingestion`
  - validates the `galaxian-reference` manifest, selected window scaffold,
    reference event log, artifact folders, and semantic profile anchors

Future tools should support:

- optical board-state detection
- sprite / entity crop clustering
- movement-path extraction
- shot and collision event inference
- audio cue onset detection
- semi-automated semantic model generation
- harness-stub generation from slice profiles
- cross-game lineage comparison

## First Implementation Milestones

### Milestone 1: Galaxian Source Manifest

Create the first `galaxian-reference` source manifest with at least one usable
gameplay video or local capture.

Deliverables:

- source manifest
- README with provenance and usage notes
- candidate window list

### Milestone 2: First Window Pack

Extract one formation-entry / first-dive window.

Deliverables:

- clip anchor
- contact sheet
- first-pass event log
- confidence notes

### Milestone 3: Semantic Scout-Wave Profile

Convert the first window into a small semantic profile.

Deliverables:

- player contract notes
- alien family notes
- formation and dive notes
- scoring and shot-cadence notes
- Platinum extension list

### Milestone 4: Harness Plan

Write harness targets before building the playable slice.

Deliverables:

- timing correspondence target
- sequence target
- player-control target
- pack-boundary target

### Milestone 5: Playable Slice

Build the smallest real `Galaxy Guardians` scout-wave slice on Platinum.

Deliverables:

- playable dev-only slice
- application-owned rule code
- harness coverage
- docs linking implementation choices back to evidence

## Durable Principle

Every second-game implementation decision should be traceable back through:

1. source
2. window
3. event log
4. semantic model
5. correspondence target
6. harness or review artifact

That chain is the product.

The resulting game matters, but the reusable way of learning and building games
matters just as much.
