# Long-Term Aurora Release Roadmap

This is a first-shot release-family roadmap for Aurora Galactica and Platinum
after the `1.2.3` production refresh.

It groups the large open themes and issue families into coherent future release
bundles. The specific issue list will change, but the phasing is meant to keep
work from becoming a loose bag of good ideas.

## How To Read This

- A "release family" here means a meaningful public milestone, not necessarily
  a strict SemVer major version.
- Keep `1.x` focused on making Aurora excellent and preparing Platinum for a
  second game.
- Reserve `2.0` for the first genuinely multi-game Platinum milestone, where at
  least two applications are meaningfully playable or one second-game proof is
  strong enough to change the product promise.
- Hosted `/dev` can move for coherent bundles before a public beta.
- Hosted `/beta` and `/production` should move only through the release-authority
  workflow.

## Current Baseline

As of April 25, 2026:

- shipped production family:
  - `1.2.3+build.489.sha.f6ba6c2`
- hosted `/beta` and hosted `/production` are aligned
- hosted `/dev` is the older comparison lane
- `main` is the authoritative forward integration line

The current shipped line is strong enough that the next cycle should not be a
recovery release. It should be the first intentional polish-and-platform cycle
toward the next era.

## Release Family 1.3: Fidelity And Trust Reset

Working title:

- `1.3.0` "Fidelity and Trust"

Primary goal:

- make the next public Aurora step measurably better, not just newer

Bundle:

- restore green quality roll-up gates before claiming a new candidate
- fix or recalibrate audio phase checks that currently block the quality roll-up
- expand trace-backed player-movement evidence before further tuning
- polish audio identity beyond cue timing
- close high-confidence gameplay trust bugs around boss injury, capture/carry
  rendering, dual-fighter final-life behavior, and late-run freeze diagnostics
- refresh scorecard and release notes around the actual measured improvements

Representative issue families:

- audio/theme gate and cue identity work
- player movement reference-trace work
- gameplay trust bugs: `#147`, `#148`, `#143`, `#142`, `#146`
- capture/rescue and close-combat correctness: `#58`, `#73`, `#77`, `#78`,
  `#94`, `#55`
- self-play survivability measurements: `#18`, `#19`, `#62`

Exit standard:

- quality conformance roll-up is green or explicitly documented
- movement and audio claims are backed by committed reference artifacts
- the next `/dev` refresh is coherent enough for sustained review

## Release Family 1.4: Pilot-Facing Shell Polish

Working title:

- `1.4.0` "Message to Pilot"

Primary goal:

- make Aurora feel more like a living cabinet and less like a test surface

Bundle:

- repurpose the bottom information panel as a durable `Message to Pilot` surface
- separate Platinum-owned shell copy from Aurora-owned game copy
- unify popup, dock, overlay, score, manual, and wait-mode surfaces
- make settings, account, bug report, score, and help entry points feel
  consistent and contained inside the cabinet frame
- preserve release information as one message type rather than the whole panel

Representative issue families:

- `Message to Pilot`: `#150`
- startup/wait-mode copy ownership: `#144`
- overlay and popup containment: `#115`, `#116`, `#117`, `#105`
- scoreboard loading and score-view affordance: `#59`, `#60`, `#63`
- manual and information surfaces: `#104`
- visual polish and display options: `#52`, `#57`, `#65`, `#68`
- one-time hotfix/change notices: `#138`

Exit standard:

- shell copy has an ownership table
- message queue and rotation behavior are harnessed
- the main cabinet frame has fewer one-off panel behaviors

## Release Family 1.5: Arcade Rules And Stage Depth

Working title:

- `1.5.0` "Arcade Depth"

Primary goal:

- deepen the Galaga-like game loop after the core release line is stable

Bundle:

- treat challenge stages as bonus stages in presentation and progression
- add more authentic challenge-stage variation
- improve progressive stage difficulty and survivability
- mature capture retreat, rescue join, between-stage pause/music, and stage
  indicator behavior
- continue later-stage fairness work with better harness evidence

Representative issue families:

- challenge-stage identity and behavior: `#9`, `#100`, `#140`
- progressive difficulty and stage elaboration: `#101`, `#32`
- between-stage, capture, and rescue presentation: `#41`, `#42`, `#43`, `#44`
- self-play and later-stage fairness: `#18`, `#19`, `#62`, `#95`
- harness stage metrics correctness: `#35`, `#46`

Exit standard:

- Stage 1, Stage 2, challenge, and one later-stage path have stable
  correspondence reports
- challenge stages read as intentional bonus stages
- gameplay depth improves without sacrificing early-run trust

## Release Family 1.6: Replay, Evidence, And Artifact Operations

Working title:

- `1.6.0` "Flight Recorder"

Primary goal:

- make Aurora runs easier to inspect, replay, narrate, and use as evidence

Bundle:

- improve local replay/movie viewing
- support better export paths for session logs and optional videos
- add targeted auto-test scenarios that drive to meaningful states
- support a remote artifact catalog for log viewer workflows
- repair and harden video/audio artifact capture
- expand reference-video event logging and visual artifact extraction

Representative issue families:

- replay/watch mode and movie viewer: `#5`, `#110`, `#119`
- export and submit-run workflows: `#8`, `#90`, `#69`
- targeted evidence harnesses: `#89`, `#92`
- artifact catalog and video repair: `#97`, `#96`, `#13`
- commentary-ready telemetry: `#81`
- reference baseline and event logs: `#17`

Exit standard:

- a meaningful run can be exported, inspected, replayed, and linked from a
  score or issue
- reference and Aurora event logs are closer in shape
- artifact paths are portable across machines

## Release Family 1.7: Pilot Identity And Scorebook

Working title:

- `1.7.0` "Pilot Records"

Primary goal:

- turn player identity, scores, and run history into a durable product surface

Bundle:

- require or migrate toward permanent pilot IDs
- support account lifecycle and deletion
- track leaderboards by version, season, or release family
- expand pilot records into a scorebook with replay links
- clarify account-confirmation and Aurora-branded auth emails
- add better date/build filtering to high-score surfaces

Representative issue families:

- permanent pilot identity and deletion: `#127`
- version-aware scores: `#129`
- pilot scorebook and replay links: `#120`
- high-score metadata and filtering: `#75`
- auth branding: `#118`, `#128`
- recent plays and homepage run links: `#70`
- score reset clarity: `#123`

Exit standard:

- a player can understand which scores belong to which release context
- pilot records feel like a real cabinet history rather than a debug list
- auth and account flows carry Aurora branding clearly

## Release Family 1.8: Operations, Environments, And Admin Control

Working title:

- `1.8.0` "Control Centre"

Primary goal:

- make operating Aurora safer as a live public product

Bundle:

- separate non-production and production identity and score paths more cleanly
- strengthen preflight checks for promotion and public verification
- replace fragile feedback transport with a controlled backend option
- add a per-game admin artifact panel
- start a post-1.0 Control Centre surface for administrative operations
- continue separating source, generated artifacts, release hosts, and public
  sync responsibilities

Representative issue families:

- non-production Supabase separation: `#126`
- reset or strip test-oriented state before production: `#122`
- feedback transport: `#133`, `#53`, `#7`
- Control Centre and admin surfaces: `#124`, `#139`
- game-pack designer/admin tooling: `#141`
- source/generated release-pipeline split: `#98`
- daily/status reporting: `#54`, `#56`, `#34`

Exit standard:

- operational actions have clearer admin surfaces and safer lane boundaries
- release and public sync checks are harder to misuse
- generated artifacts are less confusing as source-control material

## Release Family 1.9: Platinum Pack Contract And Theme System

Working title:

- `1.9.0` "Platinum Pack Contract"

Primary goal:

- finish enough platform separation that the next release can honestly become
  multi-game

Bundle:

- formalize a pack contract for game identity, controls, stages, assets,
  storage, score policy, and shell copy
- migrate Aurora-shaped platform storage names toward neutral Platinum
  namespaces
- decouple brand/style assets into a swappable package
- support alternate visual themes without confusing them with distinct games
- keep `Galaxy Guardians` preview-only unless it has its own durable data model
- document same-control compliance as a platform rule

Representative issue families:

- shared arcade platform extraction: `#111`
- brand package and theme system: `#99`, `#30`, `#84`
- Windigo/Aurora theme work: `#26`, `#27`, `#28`, `#29`
- custom stages and visual themes: `#83`, `#84`
- game picker / shell preview responsibilities from `#144` and `#150`

Exit standard:

- Aurora is one pack hosted by Platinum, not the hidden shape of the whole
  platform
- second-game preview data no longer borrows Aurora gameplay collections in a
  way that could become accidental architecture
- same-control expectations are documented and testable

## Release Family 2.0: First Multi-Game Platinum Release

Working title:

- `2.0.0` "Platinum Arcade"

Primary goal:

- make Platinum a real multi-game arcade host

Bundle:

- add a second meaningful playable game slice
- likely candidate: a `Galaxian`-style sibling proof, because it shares enough
  mechanics to validate the platform without requiring a wholly different genre
- keep `Galaxy Guardians` as either a branded preview, a later pack, or a small
  playable proof only when its own mechanics are real
- add game-picker behavior only when there is something real to pick
- ensure both games comply with shared control and cabinet expectations
- grow reference-media ingestion for the second game before fidelity claims

Representative issue families:

- Platinum multi-game extraction: `#111`
- Galaxian mechanics archive and future ingestion planning
- game picker and pack metadata work from `#144`
- theme/brand package work from `#99`, `#30`, `#84`
- future game-pack designer foundations from `#141`

Exit standard:

- at least two Platinum applications can be launched through the shell
- the second application is playable enough to validate the pack contract
- controls, storage, scores, and shell copy do not leak Aurora assumptions

## Release Family 2.1: Personas And Simulated Opponents

Working title:

- `2.1.0` "Player Two"

Primary goal:

- turn persona work from harness personas into player-facing intelligence

Bundle:

- expand action/state annotation in run logs
- make self-play and simulated players more durable and measurable
- prepare persona-vs-player experiences
- explore Player 2 style opponent behavior
- connect reference event logs, player telemetry, and replay records
- keep "learn by playing" tied to simulation evidence, not just aspiration

Representative issue families:

- persona progression and self-play harnesses
- commentary-ready telemetry: `#81`
- auto-test and evidence harness expansion: `#89`, `#92`
- pilot records and replay links from `#120`
- long-term learn-by-playing simulation work

Exit standard:

- personas have richer run-state awareness
- simulated opponents or companions can be evaluated with repeatable logs
- player-facing persona behavior improves without weakening release trust

## Release Family 2.2: Creator And Arcade Network

Working title:

- `2.2.0` "Arcade Network"

Primary goal:

- move beyond a single cabinet toward a small arcade ecosystem

Bundle:

- game-pack designer control panel matures from admin aid into content tooling
- guided custom stage expansion becomes a controlled creator path
- shared authenticated pilot media and publishing become first-class
- public project/homepage surfaces show recent plays, replay links, and release
  context
- remote artifact catalogs support long-lived evidence and showcase material

Representative issue families:

- game-pack designer: `#141`
- custom stage expansion: `#83`
- pilot media and publishing: `#121`
- recent plays and homepage links: `#70`
- remote artifact catalog and submit-run workflows: `#97`, `#8`

Exit standard:

- Aurora/Platinum can support curated new content without hand-editing core code
- run evidence can become both debugging material and player-facing memory
- public surfaces reflect real activity, not static release copy

## First Decisions From This Roadmap

1. Do not jump straight to `2.0`; use `1.3` through `1.9` to earn it.
2. Make `1.3` a measurement-backed quality release, not a feature grab bag.
3. Put `Message to Pilot` in `1.4`, after the quality gates are healthy.
4. Keep deeper stage and challenge elaboration in `1.5`, after trust fixes.
5. Treat replay/artifact work as a release family, not background plumbing.
6. Treat pilot identity and score history as their own product milestone.
7. Finish Platinum pack boundaries before claiming multi-game status.
8. Reserve the first true major-version moment for a real second playable
   application under Platinum.

## Near-Term Branch Implications

Recommended next branches from `main`:

1. `codex/macbook-pro-audio-phase-gate`
2. `codex/macbook-pro-movement-traces`
3. `codex/macbook-pro-gameplay-trust`
4. `codex/macbook-pro-message-to-pilot`
5. `codex/macbook-pro-platinum-copy-boundary`

These branches do not need to map one-to-one to public releases. They are the
first small steps toward the release families above.
