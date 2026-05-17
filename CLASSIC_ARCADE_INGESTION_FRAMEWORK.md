# Classic Arcade Ingestion Framework

This document defines the repeatable process for turning external classic
arcade artifacts into game-owned conformance knowledge and Platinum-compatible
pack plans.

`Galaxy Guardians` and its `Galaxian` reference lineage should be the first
small end-to-end example, but the framework is intentionally broader than that.
The goal is to make every future sibling game easier to study, model, build,
test, and explain.

## Formal Role In The Conformance Project

Ingestion is a first-class subsystem of the conformance project.

It is not only a documentation aid, a research notebook, or a manual design
phase. Its job is to make the first playable phases of a new game come from
measured external evidence instead of user-invented design.

The ingestion framework should evolve alongside the games and Platinum itself.
Each meaningful ingestion cycle should improve at least one of:

- source coverage and provenance
- clipped-window precision
- annotation density and confidence
- semantic event vocabulary
- metric and scorer resolution
- runtime correspondence targets
- harness reproducibility
- candidate pack generation
- compute/time value tracking
- reusable Platinum contract needs

The operating principle is:

- external artifacts teach the game
- ingestion turns artifacts into structured evidence
- conformance metrics turn evidence into measurable goals
- game packs implement the game-owned rules
- Platinum provides the reusable host, tooling, dashboards, and contracts

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

## Required Game Catalog Output

Every game that enters primary ingestion must receive a maintained catalog entry
in [GAME_CONFORMANCE_CATALOG.md](GAME_CONFORMANCE_CATALOG.md). This is now a
high-priority ingestion output, not a later release-writing task.

Every game must also maintain a target-artifact coverage artifact before major
implementation claims are made. For Aurora's Galaga target, the current example
is:

- source: `reference-artifacts/ingestion/galaga-target-artifact-corpus/target-artifacts-0.1.json`
- analysis: `reference-artifacts/analyses/galaga-target-artifact-coverage/latest.json`
- readable report: `GALAGA_TARGET_ARTIFACT_COVERAGE.md`

This artifact answers: which online/manual/gameplay/sprite/audio sources are
illustrative, which are actually ingested, which are only planning references,
and which missing sources most limit conformance scoring.

The catalog must include:

- an alien/enemy index with displayed names, roles, activity, stage presence,
  target references, conformance scores, confidence, and next gaps
- an audio cue index with runtime cue IDs, event meanings, extracted reference
  clips or waveform/spectrogram anchors, conformance scores, confidence, and
  next gaps
- an audio cue contract file for priority cues, covering semantic meaning,
  timing slot, acoustic identity, runtime context, and theme latitude before
  candidate promotion
- a stage-by-stage or wave-by-wave summary describing enemy composition, entry
  formations, maneuvers, trajectories, difficulty, reward opportunities, and
  current evidence
- a persona section that explains beginner/novice, intermediate/advanced,
  expert, and professional testing assumptions for both platform-level and
  game-owned harnesses
- a playtest-weighted review layer when the game is playable enough that
  evidence coverage and perceived authenticity can diverge meaningfully

If direct extracted target evidence exists, link it from the catalog row. If the
metric is still a proxy or heuristic, label the confidence accordingly. This is
important because a low-confidence `10/10` harness pass is a signal to build a
better scorer, not a claim of perfect conformance.

## Primary-Phase Constraint: Evidence Before Design

Primary ingestion phases should avoid arbitrary game design.

Users and models may choose investigation goals, prioritize source windows, and
review tradeoffs, but the first playable candidate should not be shaped mainly
by memory, preference, or an existing Platinum game. It should be shaped by:

- source manifests
- clipped reference windows
- extracted frame, motion, audio, and timing artifacts
- reference-side event logs
- semantic slice profiles
- explicit uncertainty notes
- measurable correspondence targets

If the evidence is weak, the right output is usually an evidence gap or a
prototype clearly labeled as low confidence, not a release claim.

## Platinum Boundary

Platinum should evolve to support ingestion without absorbing game-specific
truth.

Platinum may own reusable capabilities such as:

- pack schemas and compatibility contracts
- host runtime surfaces
- input and session contracts
- reference/evidence dashboard presentation
- harness substrate and browser automation helpers
- release-lane packaging for summarized conformance evidence
- shared evidence viewers if they are intentionally promoted later

The game pack should own:

- rules and scoring truth
- enemy, stage, motion, audio, and visual semantics
- source manifests and reference windows
- event vocabularies when they are game-specific
- metric definitions and confidence claims
- runtime correspondence reports
- candidate implementation plans

When ingestion exposes a reusable host need, it should become an explicit
Platinum extension point. It should not become a sideways dependency on Aurora,
Galaxy Guardians, or another game.

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
- first-class application review plan covering score/progression/result flow,
  browser review, and playtest-weighted review

This should become the template for later windows and later games.

The maintained first-class application review path for this example is now:

- [GALAXY_GUARDIANS_FIRST_CLASS_CONFORMANCE_PLAN.md](GALAXY_GUARDIANS_FIRST_CLASS_CONFORMANCE_PLAN.md)
- `npm run harness:check:galaxy-guardians-first-class-conformance`

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
- `reference-artifacts/contracts/audio/<game-id>-audio-cue-contracts.json`
- `GAME_CONFORMANCE_CATALOG.md` rows updated with the promoted alien, audio,
  stage, and persona evidence

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

In a mature flow, this stage should become increasingly generative:

- ingestion artifacts identify candidate game objects, events, timings, and
  outcomes
- metric gaps rank which game systems need implementation first
- harness targets are produced before subjective tuning
- the model may help assemble candidate algorithms, but the scorer and evidence
  determine whether they survive

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

## Ingestion Maturity Metrics

A game is not equally ingestible just because it has some source clips.

Track maturity explicitly so we know whether a game is ready for a shell
preview, a playable slice, a release gate, or more reference work.

Suggested metrics:

| Metric | What It Measures | Why It Matters |
| --- | --- | --- |
| Source coverage | Number, duration, quality, and diversity of usable sources | Prevents one noisy clip from becoming the game definition |
| Provenance confidence | Citation quality, local anchors, usage notes, and checksums | Makes later review and release claims defensible |
| Window coverage | Start, attract, entry, combat, scoring, loss, stage, and special-mode windows | Ensures the model sees the whole game shape over time |
| Annotation density | Events per second/window and confidence distribution | Shows whether clips are understood or merely archived |
| Semantic event coverage | Mapped event families for motion, collision, score, audio, and UI feedback | Connects raw artifacts to playable behavior |
| Metric promotion | Number of evidence-backed metrics with scorers and tolerances | Moves conformance from prose to measurable gates |
| Runtime correspondence | Harness logs compared directly to reference-side event logs | Proves the candidate behaves like the learned game |
| Candidate-generation readiness | Whether pack plans, rules, assets, and harness stubs can be derived from evidence | Measures progress toward low-design new-game creation |
| Harness reproducibility | Stable seeds, deterministic windows, and rerunnable reports | Lets long-cycle compute improve the same target repeatedly |
| Compute-value efficiency | Score/confidence gained per wall time, CPU, GPU, model/API call, and artifact volume | Helps choose the next highest-value investment |
| Platform-extension pressure | Reusable needs discovered that belong in Platinum rather than the game | Keeps the host improving without merging game identities |

Dashboard summaries may expose these metrics, but raw source media and
unreviewed annotations remain engineering-owned unless we explicitly promote an
evidence browser.

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

Future tools should support:

- optical board-state detection
- sprite / entity crop clustering
- movement-path extraction
- shot and collision event inference
- audio cue onset detection
- audio cue contract generation and contract-readiness scoring
- full-theme promotion prechecks before runtime cue promotion
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
