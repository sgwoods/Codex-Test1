# Architecture

This document is the short technical map for how the project is organized and
how work should flow through it.

Related planning artifact:

- audio planning and source manifest:
  - `/Users/stevenwoods/Documents/Codex-Test1/AUDIO_PLAN.md`
- curated splash/quote/content planning:
  - `/Users/stevenwoods/Documents/Codex-Test1/CONTENT_PLAN.md`

## Runtime Layout

### Source Files

- HTML shell:
  - `/Users/stevenwoods/Documents/Codex-Test1/src/index.template.html`
- Styles:
  - `/Users/stevenwoods/Documents/Codex-Test1/src/styles.css`
- Boot / metadata / audio / storage / session logging:
  - `/Users/stevenwoods/Documents/Codex-Test1/src/js/00-boot.js`
- Shared runtime input / build-stamp / shell helpers:
  - `/Users/stevenwoods/Documents/Codex-Test1/src/js/01-runtime-shell.js`
- Shared replay / session telemetry / recording helpers:
  - `/Users/stevenwoods/Documents/Codex-Test1/src/js/02-replay-telemetry.js`
- Shared platform service policy / identity / transport helpers:
  - `/Users/stevenwoods/Documents/Codex-Test1/src/js/03-platform-services.js`
- Shared leaderboard / account UI / panel-state helpers:
  - `/Users/stevenwoods/Documents/Codex-Test1/src/js/04-leaderboard-ui.js`
- Aurora-specific player lifecycle, harness control, and manual movement helpers:
  - `/Users/stevenwoods/Documents/Codex-Test1/src/js/05-player-flow.js`
- Aurora-specific player combat, bullet resolution, and rescue-return helpers:
  - `/Users/stevenwoods/Documents/Codex-Test1/src/js/05-player-combat.js`
- Aurora-specific enemy dive / challenge motion / attack helpers:
  - `/Users/stevenwoods/Documents/Codex-Test1/src/js/06-enemy-behavior.js`
- Aurora-specific capture / rescue / carried-fighter helpers:
  - `/Users/stevenwoods/Documents/Codex-Test1/src/js/07-capture-rescue.js`
- Aurora-specific scoring / rescue-award / challenge-bonus helpers:
  - `/Users/stevenwoods/Documents/Codex-Test1/src/js/08-score-awards.js`
- Aurora-specific stage setup / formation / transition helpers:
  - `/Users/stevenwoods/Documents/Codex-Test1/src/js/09-stage-flow.js`
- Shared remote leaderboard fetch / cache / score-submit helpers:
  - `/Users/stevenwoods/Documents/Codex-Test1/src/js/11-leaderboard-service.js`
- Shared account auth / session / Supabase init helpers:
  - `/Users/stevenwoods/Documents/Codex-Test1/src/js/12-auth-session.js`
- Aurora game-pack metadata / capabilities / stage themes / scoring tables:
  - `/Users/stevenwoods/Documents/Codex-Test1/src/js/13-aurora-game-pack.js`
- Shared enemy/entity model helpers for pack-owned core and optional fields:
  - `/Users/stevenwoods/Documents/Codex-Test1/src/js/14-entity-model.js`
- Gameplay / scoring / capture / enemy logic:
  - `/Users/stevenwoods/Documents/Codex-Test1/src/js/10-gameplay.js`
- Shared cabinet render shell / HUD layout / board-message helpers:
  - `/Users/stevenwoods/Documents/Codex-Test1/src/js/19-render-shell.js`
- Aurora render orchestration / scene composition:
  - `/Users/stevenwoods/Documents/Codex-Test1/src/js/20-render.js`
- Aurora-specific board rendering / sprites / entity draw routines:
  - `/Users/stevenwoods/Documents/Codex-Test1/src/js/21-render-board.js`
- Harness hooks:
  - `/Users/stevenwoods/Documents/Codex-Test1/src/js/90-harness.js`

### Generated Output

- Local dev build:
  - `/Users/stevenwoods/Documents/Codex-Test1/dist/dev/index.html`
- Local dev build metadata:
  - `/Users/stevenwoods/Documents/Codex-Test1/dist/dev/build-info.json`
- Stable production artifact:
  - `/Users/stevenwoods/Documents/Codex-Test1/dist/production/index.html`
- Stable production build metadata:
  - `/Users/stevenwoods/Documents/Codex-Test1/dist/production/build-info.json`
- Promoted beta snapshot:
  - `/Users/stevenwoods/Documents/Codex-Test1/dist/beta/`

## Build / Deploy Flow

### Local Build

- Build script:
  - `/Users/stevenwoods/Documents/Codex-Test1/tools/build/build-index.js`
- Generates:
  - `/Users/stevenwoods/Documents/Codex-Test1/dist/dev/index.html`
  - `/Users/stevenwoods/Documents/Codex-Test1/dist/dev/build-info.json`
- Production promotion:
  - `/Users/stevenwoods/Documents/Codex-Test1/tools/build/promote-production.js`
- Produces:
  - `/Users/stevenwoods/Documents/Codex-Test1/dist/production/index.html`
  - `/Users/stevenwoods/Documents/Codex-Test1/dist/production/build-info.json`
- Local ready-state helper:
  - `/Users/stevenwoods/Documents/Codex-Test1/tools/dev/local-resume.js`
  - starts the local `dist/dev` game server and the log viewer together for machine handoff/debugging

### Pages Deploy

- Workflow:
  - `/Users/stevenwoods/Documents/Codex-Test1/.github/workflows/pages.yml`
- CI rebuilds the dev repo’s generated outputs, but the publicly shared Aurora production and beta lanes are published from the separate `Aurora-Galactica` repo.
- In practice:
  - `Codex-Test1` produces generated artifacts in `dist/`
  - `Aurora-Galactica` is the public artifact host for:
    - `/`
    - `/beta/`
  - lane publishing is now scripted through:
    - `/Users/stevenwoods/Documents/Codex-Test1/tools/build/publish-lane.js`
  - publish readiness is checked through:
    - `/Users/stevenwoods/Documents/Codex-Test1/tools/build/check-publish-ready.js`

### Public Project Pages Sync

- Sync script:
  - `/Users/stevenwoods/Documents/Codex-Test1/tools/build/sync-public-pages.js`
- Workflow:
  - `/Users/stevenwoods/Documents/Codex-Test1/.github/workflows/sync-public-pages.yml`
- This syncs project/status surfaces to `sgwoods/public`.
- It does not publish the playable game.

## Testing / Evidence Flow

### Harness

- Run gameplay:
  - `/Users/stevenwoods/Documents/Codex-Test1/tools/harness/run-gameplay.js`
- Analyze a run:
  - `/Users/stevenwoods/Documents/Codex-Test1/tools/harness/analyze-run.js`
- Batch runner:
  - `/Users/stevenwoods/Documents/Codex-Test1/tools/harness/run-batch.js`
- Batch prioritization:
  - `/Users/stevenwoods/Documents/Codex-Test1/tools/harness/tuning-report.js`
- Scenarios:
  - `/Users/stevenwoods/Documents/Codex-Test1/tools/harness/scenarios/`

### Log Viewer

- Local review server:
  - `/Users/stevenwoods/Documents/Codex-Test1/tools/log-viewer/server.js`
- Viewer UI:
  - `/Users/stevenwoods/Documents/Codex-Test1/tools/log-viewer/index.html`
  - `/Users/stevenwoods/Documents/Codex-Test1/tools/log-viewer/app.js`
  - `/Users/stevenwoods/Documents/Codex-Test1/tools/log-viewer/styles.css`
- The viewer reads the same recursive artifact tree under:
  - `/Users/stevenwoods/Documents/Codex-Test1/harness-artifacts/`
- Review-ready runs should include:
  - `summary.json`
  - `neo-galaga-session-*.json`
  - `neo-galaga-video-*.review.webm` when available
- The viewer uses `summary.json` as the run index and then resolves the neighboring session/video files from the summary metadata.

### Real Play

- Player-generated `.json` and `.webm` are browser download artifacts first
  - they typically land in the user’s downloads location
- Player-native in-game replay state is browser-local storage, not the harness archive
- Player-generated `.json` and `.webm` can then be imported and analyzed
- The same analysis pipeline should be used whenever possible so live play and harness results stay comparable
- The log viewer can inspect those imported runs as long as they are copied into the expected `harness-artifacts/` folder structure and have a `summary.json` beside them.
- Formal policy:
  - `/Users/stevenwoods/Documents/Codex-Test1/ARTIFACT_POLICY.md`

## Reference Flow

### Durable Sources

- Reference root:
  - `/Users/stevenwoods/Documents/Codex-Test1/reference-artifacts/`
- Manual:
  - `/Users/stevenwoods/Documents/Codex-Test1/reference-artifacts/manuals/galaga-1981-namco/`
- Walkthrough notes:
  - `/Users/stevenwoods/Documents/Codex-Test1/reference-artifacts/walkthroughs/trueachievements-galaga/`

### Decision Priority

1. Original/manual-backed rule evidence
2. Original gameplay footage
3. Secondary walkthrough/progression references
4. Tuning inference from our own harness and live play

## System Boundaries

### Stable Rule Areas

These should change carefully and usually only with reference evidence:

- challenge stage structure
- capture / rescue rules
- carried fighter scoring
- special attack squadron bonuses
- results / high-score flow

### Tunable Areas

These are expected to change often:

- dive timing
- collision fairness
- challenge readability
- later-stage band variety
- visuals and presentation

## Collaboration Model

The project is moving toward two parallel tracks:

1. Reference-baseline / fidelity work
2. Harness / gameplay tuning / shipping quality

That split should let collaborators work with less conflict and clearer ownership.

## Early Post-1.0 Platform Direction

Shortly after `1.0`, this codebase should start moving toward a shared arcade
platform rather than remaining a one-off Aurora-only runtime.

Tracked umbrella:

- `#111` shared arcade platform extraction for Galaga-family cabinet shooters

The intended stable/shared layer is:

- cabinet shell / HUD / control rail surfaces
- replay, logging, and artifact model
- harness runner and event vocabulary
- build / publish / local handoff flow
- left-right cabinet input primitives

The intended configurable/game-pack layer is:

- formations
- enemy families
- scoring tables
- stage cadence
- attack scripts
- optional mechanics such as capture/rescue or challenge stages

The goal is to reduce churn in mature infrastructure while letting future games
such as Galaxian, Aurora variants, or similar fixed-screen cabinet shooters
reuse the stable platform with smaller game-specific packs.

## First Platform Contract

The next phase should stop extracting only by file size and start extracting
toward a real platform contract. The first contract should stay small and
practical.

### runtimeState

Owns the cross-game runtime state that should not depend on Aurora rules:

- lane, build, and release metadata
- frame clock and scene lifecycle
- pause / wait / attract / active / results states
- normalized input state
- replay / telemetry session state
- panel and overlay visibility state
- durable local storage handles and cached settings

### shellState

Owns the cabinet shell and presentation surfaces that should be reusable across
close sibling games:

- board layout and viewport metrics
- HUD slots and score banner placement
- build stamp and refresh-reminder state
- popup and modal placement
- wait-mode and board-message surfaces
- cabinet control rail state

### serviceAdapters

Defines the small set of platform-owned service boundaries. These should be
consumed as interfaces, even if the current implementation is still thin.

- `authService`
  - sign in
  - sign out
  - sign up
  - reset password
  - load session
- `scoreService`
  - submit score
  - fetch leaderboard
  - fetch pilot records
- `replayService`
  - save local run
  - list runs
  - load run
  - export artifacts
- `feedbackService`
  - submit report
  - preserve diagnostics
  - expose fallback behavior cleanly

### gamePack

Defines the game-owned behavior and content that the runtime loads.

- metadata
  - `gameKey`
  - `title`
  - `versionLine`
- rules/config
  - formations
  - enemy families
  - scoring tables
  - stage flow
  - attack scripts
- mechanics capabilities
  - capture/rescue
  - challenge stages
  - escort/squad bonuses
  - dual-fighter support
- rendering hooks
  - board entity draw
  - theme assets
  - game-specific HUD additions
- lifecycle hooks
  - new game setup
  - per-frame gameplay update
  - stage transition handling
  - results/stat mapping

The key rule is:

- the runtime should host a `gamePack`
- the `gamePack` should not need to own the whole application shell

### Shared Enemy / Entity Contract

The first reusable runtime contract for enemy entities should now be treated as
two layers:

- core shared fields
  - `id`
  - `t` enemy type
  - `fam` family/archetype
  - `band` stage-band label
  - `r` / `c` logical grid position
  - `hp` / `max`
  - `x` / `y`
  - `tx` / `ty`
  - `form`
  - `dive`
  - `vx` / `vy`
  - `cool`
  - `spawn`
  - `targetX` / `targetY`
  - `shot`
  - `en`
  - `miss`
  - `low`
  - `hitT`
- optional capability-owned fields
  - escort pattern fields
    - `lead`
    - `off`
    - `esc`
    - `squadId`
  - capture/rescue fields
    - `carry`
    - `beam`
    - `beamT`
  - challenge-stage fields
    - `ch`
    - `wave`
    - `side`
    - `slot`
    - `group`
    - `sweep`
    - `upperBandY`

The runtime should increasingly consume these through shared helpers rather than
direct Aurora-only assumptions. That is the purpose of:

- `/Users/stevenwoods/Documents/Codex-Test1/src/js/14-entity-model.js`

The important platform rule is:

- a sibling pack should be able to omit capture, escort, or challenge fields
  entirely when its capabilities do not use them
- runtime systems should ask for those capabilities through helpers instead of
  assuming every enemy has every mechanic

### First Platform Run Milestone

We should try to boot Aurora as a clearly hosted platform game once these
conditions are true:

- the runtime and render layers consume pack-owned enemy/entity helpers rather
  than raw Aurora-only assumptions in the major mechanic surfaces
- stage flow, scoring, challenge cadence, and presentation are all sourced from
  the Aurora pack
- service wiring is already split behind platform service seams
- `00-boot.js` can load a single selected `gamePack` instead of assuming Aurora
  implicitly

That means the first serious "Aurora running on the platform" attempt should
happen after the current contract work extends through:

1. capture / rescue helpers
2. score / challenge award helpers
3. one thin runtime boot path that selects and installs the Aurora pack

At that point we should make Aurora launch through the pack-selected runtime,
even if it is still the only available game. That gives us the baseline proof
before we try a `Galaxian`-like sibling.

Current status:

- the installed pack registry and selection path now exist
- the active installed pack now drives core helper paths for:
  - challenge cadence
  - stage presentation
  - formation/challenge layout
  - frame accent theme
  - enemy scoring

That means Aurora is now partially running through the platform path already.
The next clean proof point is to let the shell/front-door flow explicitly boot
the active installed pack rather than treating Aurora as an implicit default.

## Reference Mechanics Lens

Future platform work needs to be informed by the real gameplay differences
between close sibling games, not just by visual similarity.

### Aurora / Galaga-Family Shape

Aurora currently proves this family well:

- enemies begin in a staged formation
- enemies break formation into scripted dives
- the player moves freely along the bottom lane
- rescue/capture and dual-fighter play are optional advanced mechanics
- challenge waves and special squad bonuses are part of progression

This is the right baseline for the current runtime extraction work.

### Galaxian-Like Shape

Galaxian is the nearest sibling we should plan around first:

- staged formation play still matters
- independent enemy dives still matter
- flagship/escort relationships still matter
- scoring and attack timing differ, but the overall combat grammar is close
- there is no need to force capture/rescue if the game does not use it

This makes `Galaxian` a good second proof because it should reuse the runtime
while forcing us to keep optional mechanics truly optional.

### Space Invaders-Like Shape

Space Invaders is still a useful reference, but it should not define the first
platform contract:

- enemies behave as a marching grid rather than as independent divers
- pressure comes from synchronized descent and projectile tempo
- shields/barricades are core playfield mechanics
- the player-combat rhythm is simpler and more constrained
- capture/rescue, escort patterns, and return-to-formation flow do not apply

This means `Space Invaders` should be treated as:

- a design reference for broad fixed-screen shooter comparison
- not the first target for a shared `gamePack` contract

### Representative Mechanics Set

For platform-shaping purposes, the most useful reference games are:

- direct family targets
  - `Galaxian`
  - `Galaga`
  - `Gaplus` / `Galaga 3`
  - `Galaga '88`
- nearby comparison games
  - `Phoenix`
  - `Pleiads`
  - `Moon Cresta`
  - `Terra Cresta`
- contrast cases
  - `Space Invaders`
  - `Gorf`

The goal is not to support all of these at once. The goal is to understand
which mechanics are central to the first platform contract and which mechanics
belong in later branches or capability families.

### Mechanics Matrix

Use this matrix as the design lens when deciding what belongs in the first
shared runtime.

- `Galaxian`
  - formation rack:
    - yes
  - independent dive attacks:
    - yes
  - escort / flagship relationships:
    - yes
  - capture / rescue:
    - no
  - dual-fighter play:
    - no
  - challenge stages:
    - no
  - shield / barricade play:
    - no
  - platform fit:
    - first sibling target

- `Galaga`
  - formation rack:
    - yes
  - independent dive attacks:
    - yes
  - escort / flagship relationships:
    - yes
  - capture / rescue:
    - yes
  - dual-fighter play:
    - yes
  - challenge stages:
    - yes
  - shield / barricade play:
    - no
  - platform fit:
    - core proof family

- `Gaplus` / `Galaga 3`
  - formation rack:
    - yes
  - independent dive attacks:
    - yes
  - escort / flagship relationships:
    - reduced / more varied
  - capture / rescue:
    - no in the Galaga sense
  - dual-fighter play:
    - altered upgrade/assist mechanics instead
  - challenge stages:
    - yes
  - shield / barricade play:
    - no
  - platform fit:
    - family stretch target once core contract is stable

- `Galaga '88`
  - formation rack:
    - yes
  - independent dive attacks:
    - yes
  - escort / flagship relationships:
    - yes, with richer progression
  - capture / rescue:
    - yes
  - dual-fighter play:
    - yes
  - challenge stages:
    - yes
  - shield / barricade play:
    - no
  - platform fit:
    - advanced family target after baseline proof

- `Phoenix`
  - formation rack:
    - partial / staged waves rather than pure Galaxian rack behavior
  - independent dive attacks:
    - some, but not the same family grammar
  - escort / flagship relationships:
    - limited
  - capture / rescue:
    - no
  - dual-fighter play:
    - no
  - challenge stages:
    - no
  - shield / barricade play:
    - no
  - platform fit:
    - nearby comparison only

- `Moon Cresta` / `Terra Cresta`
  - formation rack:
    - mixed
  - independent dive attacks:
    - yes
  - escort / flagship relationships:
    - not central
  - capture / rescue:
    - no
  - dual-fighter play:
    - no, but ship-combination / transform mechanics matter
  - challenge stages:
    - limited or different in shape
  - shield / barricade play:
    - no
  - platform fit:
    - useful contrast for upgrade/combine mechanics, not first target

- `Space Invaders`
  - formation rack:
    - no, marching grid instead
  - independent dive attacks:
    - no
  - escort / flagship relationships:
    - no
  - capture / rescue:
    - no
  - dual-fighter play:
    - no
  - challenge stages:
    - no
  - shield / barricade play:
    - yes
  - platform fit:
    - separate fixed-screen branch later, not first contract

### Platform Implications

This points to a practical first-platform boundary:

- first-class in the initial shared contract
  - formation-rack staging
  - independent dive attacks
  - escort / squad behavior
  - stage-band progression
  - optional challenge stages
- optional capability modules
  - capture / rescue
  - dual-fighter mode
  - upgrade / combine mechanics
- explicitly out of first-scope contract
  - marching-grid invasion logic
  - shield / barricade systems
  - broader multi-genre shooter assumptions

That keeps the first platform honest:

- broad enough for `Aurora`, `Galaxian`, and the closer Galaga-family lineage
- narrow enough that `Space Invaders` does not distort the core contract too
  early

### Stage Identity And Branded Progression

The platform should not assume stages are only gameplay-number increments with
flat cosmetic swaps. At least for Aurora-family games, stage identity should be
able to affect the feel of play.

That means the first `gamePack` contract should leave room for:

- branded stage themes
  - distinct iconography
  - background treatments
  - frame and shell accents
- branded challenge-stage presentation
  - themed challenge intros
  - challenge-specific formation and attack styling
- character-driven boss variants
  - named or recognizable boss archetypes
  - boss-specific visuals
  - boss-specific behavior patterns
- progression-linked presentation shifts
  - more complex formations later in a run
  - richer or more aggressive challenge stages later in a run
  - staged escalation in background and shell identity

Aurora-specific examples we should plan for now:

- moving `aurora borealis` background treatment
- stage/frame branding that evolves during progression
- challenge waves that become visually and mechanically richer
- `Super Bosses` or `Partners` with character-provided iconology and distinct
  attack behavior

The rule here is:

- stage presentation is not only skin
- stage presentation can be part of the gameplay contract

So the future `gamePack` needs to support both:

- mechanics definitions
- progression-aware presentation definitions

### Audio Identity And Event Vocabulary

The platform should treat sound as part of the game contract, not as a late
polish pass. For this family of games, audio is tightly connected to:

- game-state transitions
- attack pressure
- challenge-stage identity
- boss/archetype presence
- score and rescue feedback

The shared runtime should therefore own an event vocabulary for audio, while
the actual palette and styling should belong to the `gamePack`.

Shared audio events should include at least:

- credit / start
- formation march / ambient cadence
- player shot
- enemy shot
- enemy hit
- boss hit
- boss destroyed
- ship lost
- capture beam start
- fighter captured
- capture broken
- fighter released
- rescue join
- stage transition
- challenge intro
- challenge clear
- bonus / special squad bonus
- extra life
- game over
- UI tick / confirm / error

The design rules should be:

- each game pack defines its own audio palette and event mapping
- sounds should be clearly inspired by original arcade lineage
- sounds should generally not be direct copies of the originals
- stage bands, challenge phases, boss archetypes, and branded worlds should be
  allowed to alter the sound palette during a run

That means the future `gamePack` should own:

- an `audioProfile`
  - synth or sample family
  - event-to-sound mapping
  - stage-band or theme variants
  - boss/archetype variants
  - UI palette
- optional `audioThemes`
  - intro theme
  - challenge theme
  - stage progression themes
  - branded world or chapter treatments

For Aurora specifically, this leaves room for:

- an `aurora borealis` stage audio identity
- distinct `Super Boss` / `Partner` sonic signatures
- richer challenge-stage transitions as the run escalates

For sibling games, this should remain pack-owned:

- `Galaga` / Aurora-like packs can emphasize rescue, challenge, and escort cues
- `Galaxian`-like packs can emphasize spare, early-arcade attack and loss cues
- later games can vary by world, chapter, or boss family without changing the
  shared runtime vocabulary

Reference inspiration sources for this family include:

- [Galaga Soundboard](https://www.101soundboards.com/boards/28843-galaga-soundboard)
- [Galaxian - Video Game Music](https://www.101soundboards.com/boards/643652-galaxian-video-game-music)
- [Freesound - Galaxian Arcade Game.wav by portwain](https://freesound.org/s/261173/)

These are useful as event and mood references, not as a mandate to replicate
the exact sounds verbatim.

For future sibling-pack work, the `Galaxian Arcade Game.wav` reference is
particularly useful because it captures early-arcade pacing and cabinet feel in
a way that can inform:

- sparse attack-pressure cues
- early-arcade loss and hit cadence
- ambient attract or shell presence
- UI and menu-era texture for a `Galaxian`-like front door

The current published Freesound entry for that file is `CC0`, which makes it a
good long-term reference and prototyping source for future `Galaxian`-family
audio design.

### Front Door And Game Selection

The platform should also assume that the game does not always boot directly
into a single title. Over time we want a better first-impression surface and a
way to select between multiple playable experiences.

That means the shared shell should eventually support:

- a high-quality slash / launch page before entering a run
- a game picker surface once multiple game packs exist
- a shell-level button that can reopen that picker from inside the cabinet
- room for one-time notices, feature reminders, and release explanations

For now, Aurora remains the only primary game entry. But the platform should
avoid hard-coding a forever single-game front door.

### Curated Quote Content

The front door, attract surfaces, and future notice system should also be able
to host curated approved quote content without hard-coding those lines into the
game runtime.

That means the platform should eventually support:

- quote/content ingestion from an approved external JSON source
- surface-aware filtering:
  - splash page
  - wait mode
  - stage transition
  - notice panel
  - game picker
- pack-aware filtering so each game can opt into the right tone and theme
- dismissal/cooldown behavior so quotes stay occasional and intentional

This content should live alongside the future splash/game-picker system, not as
combat-time UI clutter.

Canonical quote/content ingest rule:

- consume only the approved export documented by:
  - [APPROVED_QUOTES_INTERFACE.md](https://github.com/sgwoods/sci-fi-ai-dystopian-project/blob/main/APPROVED_QUOTES_INTERFACE.md)
- do not ingest from editorial workflow folders such as:
  - `data/review/`
  - `data/candidates/`
  - `data/discovery/`

## First Game-Pack Shape

The first concrete `gamePack` should be Aurora itself, expressed in a way that
could later host a Galaxian-like sibling without pretending both games are the
same.

### Aurora Game-Pack Responsibilities

- provide formation and stage-band definitions
- provide enemy family and attack-script definitions
- provide scoring tables and award hooks
- provide optional mechanics:
  - capture/rescue
  - dual-fighter join flow
  - challenge stage rules
- provide progression-aware stage presentation definitions:
  - stage themes
  - background motion treatments
  - frame/shell accent variants
  - boss iconography sets
- provide Aurora-specific board rendering hooks

### First Shared Capability Flags

The first contract should use capability flags instead of assuming every game
implements every mechanic.

- `usesFormationRack`
- `usesIndependentDiveAttacks`
- `usesEscortPatterns`
- `usesChallengeStages`
- `usesCaptureRescue`
- `usesDualFighterMode`
- `usesStaticShields`
- `usesStageThemeProgression`
- `usesBossArchetypeVariants`

This should let us express:

- Aurora:
  - formation rack, dives, escorts, challenge stages, capture/rescue, dual
    fighter, evolving stage themes, boss variants
- Galaxian-like:
  - formation rack, dives, escorts
- Space Invaders-like:
  - no independent dives, no escort patterns, yes static shields

### What The Next Refactor Should Prove

Before we claim platform readiness, the code should prove that:

- stage flow can be supplied from a `gamePack`
- scoring tables can be supplied from a `gamePack`
- optional mechanics are enabled through capabilities, not hardwired runtime
  assumptions
- the shell and services do not need Aurora-specific knowledge to boot the
  game

## First Non-Aurora Pack Target

The first serious sibling target should be a minimal `Galaxian`-like pack.
This is close enough to stress the contract honestly, but different enough to
show where Aurora assumptions still leak through.

### Minimal Galaxian-Like Pack Expectations

A first non-Aurora pack should be able to define:

- metadata
  - `gameKey`
  - `title`
  - `versionLine`
- stage cadence
  - regular formation stages only
  - no required challenge stage cadence
- formations
  - formation-rack layout
  - entry order
  - stage-to-stage spacing changes
- enemy families
  - baseline attacker family
  - stronger mid-tier family
  - flagship / boss family
- attack behavior
  - independent dive attacks
  - flagship-led escort attacks
  - no capture beam requirement
- scoring tables
  - formation kill values
  - dive kill values
  - flagship escort bonus values
- presentation
  - its own marquee/title treatment
  - its own board sprite families
  - optional stage-theme progression without Aurora-specific branding

### Minimal Galaxian-Like Capability Profile

The first sibling pack should look roughly like this:

- `usesFormationRack`
  - yes
- `usesIndependentDiveAttacks`
  - yes
- `usesEscortPatterns`
  - yes
- `usesChallengeStages`
  - no
- `usesCaptureRescue`
  - no
- `usesDualFighterMode`
  - no
- `usesStageThemeProgression`
  - optional
- `usesBossArchetypeVariants`
  - optional
- `usesStaticShields`
  - no

That makes it a clean test of the family core without the richer Aurora/Galaga
mechanics.

### Current Aurora Assumptions A Galaxian-Like Pack Would Still Trip Over

These are the most important remaining leaks in the current runtime:

- enemy data shape still assumes Aurora/Galaga-era fields such as:
  - `carry`
  - `beam`
  - `beamT`
  - rescue-return state
- gameplay flow still has challenge-stage assumptions woven into update and
  transition logic
- player lifecycle still carries capture/rescue-specific state in the core
  player model
- scoring helpers still assume Galaga-family special cases such as:
  - captured-fighter destruction
  - rescue join awards
  - challenge-perfect awards
- renderer still understands Aurora family names and Aurora-specific palette
  identity directly
- stage presentation currently supports pack-owned themes, but the shell still
  assumes Aurora is the only loaded title

### What A Galaxian Proof Should Force Us To Clean Up

Before we can honestly claim a second pack is viable, the code should prove
all of these:

- capture/rescue can be completely disabled without leaving dead runtime state
- challenge-stage cadence can be absent without special-case workarounds
- enemy family naming can be supplied by the pack without Aurora-specific
  palette assumptions
- stage transitions and banners can be supplied by the pack without assuming
  Aurora copy
- scoring can be loaded from the pack without carrying unused Aurora award
  branches
- board rendering can consume pack-owned presentation metadata instead of only
  Aurora identity

### Immediate Refactor Priority After This

The next contract-first priorities should therefore be:

- separate the enemy/entity runtime model into:
  - core shared fields
  - optional capability-owned fields
- separate stage/challenge transition orchestration from challenge-specific
  rules
- move more scoring branches behind capability gates
- make board rendering choose palettes and sprite families through pack-owned
  presentation data rather than hardcoded Aurora family names

If we can do those four things, a minimal `Galaxian`-like pack becomes a real
engineering target instead of only an architectural idea.

## Platform Extraction Order

The platform path should be incremental. Aurora remains the proof project while
we extract stable seams out of the current one-off runtime.

### Release-Line Mapping

Use the extraction phases as release guidance, not just architecture guidance.

- `1.1.x`
  - stabilize Aurora into explicit layers
  - extract shared monorepo modules without redesigning gameplay
- `1.2.x`
  - generalize shared services and add the first operator/control-centre
    surfaces
- later `1.x`
  - prove reuse with one close sibling game
  - add optional shared media/publishing on top of stable identity and service
    seams

### Phase 1: Stabilize Aurora Into Explicit Layers

Do this before creating generalized packages.

Separate the current runtime mentally and structurally into:

- shared runtime core
  - loop
  - timing
  - input primitives
  - scene/state transitions
  - deterministic event vocabulary
- shared shell
  - cabinet frame
  - HUD slots
  - popup/layout system
  - build/update surfaces
- shared play services
  - score submission boundary
  - identity boundary
  - feedback boundary
  - replay persistence boundary
- Aurora game pack
  - formations
  - enemy families
  - scoring tables
  - stage cadence
  - capture/rescue rules
  - challenge rules
  - sprites/theme

### Phase 2: Extract Shared Modules Inside The Monorepo

Keep one repo and extract modules only after Aurora already runs cleanly across
the layer seams above.

Target internal package/module boundaries:

- `packages/arcade-runtime`
- `packages/arcade-shell`
- `packages/arcade-replay`
- `packages/arcade-services`
- `games/aurora`

Important rule:

- first extraction should be mostly relocation plus interface cleanup
- do not redesign behavior during the extraction itself

### Phase 3: Make Aurora Rules Data-Driven Enough To Reuse

Once Aurora is stable on the extracted runtime, move Aurora-specific rules
toward a `gamePack` or `gameDef` contract.

Expected configurable areas:

- formation definitions
- enemy-family definitions
- attack scripts
- scoring tables
- stage progression bands
- optional mechanic flags
  - capture/rescue
  - challenge stages
  - special squadrons
  - dual-fighter mode

Important rule:

- do not force every future game to implement every optional mechanic

### Phase 4: Generalize Shared Services

Only after runtime seams stabilize:

- make identity game-agnostic
- make scores keyed by:
  - `gameKey`
  - `version`
  - `playerId`
  - `runId`
- keep replay metadata independent of Aurora-specific assumptions
- move feedback toward a platform-owned API rather than a game-specific form

Expected first shared-service targets:

- pilot identity
- scoreboard and run records
- feedback intake
- environment-aware backend boundaries

### Phase 5: Add Operator / Control Centre

The first shared operational surface should come after the runtime and service
seams are real.

First control-centre scope:

- score moderation
- player account admin
- replay/video publish status
- release/lane status

### Phase 6: Prove Reuse With A Second Game

The first proof is not “many games.” The first proof is:

- Aurora cleanly running on the shared runtime

The second proof should be:

- one close sibling fixed-screen shooter game pack

Recommended first sibling:

- Galaxian-like before Space Invaders

That keeps the runtime honest without forcing broad abstraction too early.

## What Not To Generalize Too Early

Avoid premature platform work in these areas:

- generic physics engine
- broad multi-genre engine abstractions
- repo splitting
- full admin platform before service seams are stable
- multiplayer/live-service assumptions

The rule is simple:

- extract only the seams that Aurora already proves are real

## Platform Defaults

Until the platform work is more mature, keep these defaults:

- one monorepo
- one primary proof game:
  - Aurora
- static-first client hosting
- managed services where they reduce operational burden
- reusable runtime and service seams proven by Aurora before they are made
  generic
