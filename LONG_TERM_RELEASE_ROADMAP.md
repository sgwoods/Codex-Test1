# Long-Term Aurora Release Roadmap

This is the working release-family roadmap for Aurora Galactica and Platinum
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
- Treat level-by-level Aurora expansion as a major product pillar, not as
  background polish.
- Treat shared game-video publishing as a product and evidence capability, not
  just a debugging convenience.
- Bring a second-game Platinum sneak peek forward early enough to pressure-test
  the platform layer before the full multi-game milestone.

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

## Major Roadmap Adjustment

The first roadmap pass correctly identified fidelity, trust, replay, pilot
identity, and Platinum boundaries as major streams. The next refinement is about
weighting:

- Aurora needs a real level-by-level expansion pass earlier than originally
  placed.
- Challenging stages should become much more interesting, with new alien types,
  movement families, challenge patterns, and presentation states.
- Later levels should vary entry styles, attack pacing, movement texture, and
  challenge pressure in ways that can be compared against original Galaga
  behavior.
- Published gameplay videos should become a shared reference layer for users,
  issues, score records, and release decisions.
- A preliminary second-game sneak peek should arrive before the full Platinum
  `2.0` milestone so the platform boundary is tested by real product pressure.

This means `1.4` becomes the first major arcade-depth release family, and
`1.5` becomes the shared-video evidence and replay-publishing release family.
The `Message to Pilot` work remains important, but moves after those two
foundation-setting product capabilities.

The concrete execution plan for the first level-expansion cycle is:

- [LEVEL_BY_LEVEL_EXPANSION_PLAN.md](LEVEL_BY_LEVEL_EXPANSION_PLAN.md)

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
- create the first level-by-level expansion blueprint before implementation
  gets broad
- identify which original Galaga stage families, challenge stages, alien types,
  and movement patterns Aurora should model first
- refresh scorecard and release notes around the actual measured improvements

Representative issue families:

- audio/theme gate and cue identity work
- player movement reference-trace work
- gameplay trust bugs: `#147`, `#148`, `#143`, `#142`, `#146`
- capture/rescue and close-combat correctness: `#58`, `#73`, `#77`, `#78`,
  `#94`, `#55`
- self-play survivability measurements: `#18`, `#19`, `#62`
- level-depth planning against reference evidence: `#4`, `#9`, `#17`, `#100`,
  `#101`, `#140`

Exit standard:

- quality conformance roll-up is green or explicitly documented
- movement and audio claims are backed by committed reference artifacts
- a first level-by-level expansion plan is committed
- the next `/dev` refresh is coherent enough for sustained review

## Release Family 1.4: Level-By-Level Arcade Expansion

Working title:

- `1.4.0` "Arcade Depth"

Primary goal:

- make Aurora's game progression richer and more comparable to original Galaga
  across stages, not only in the Stage 1 opening

Bundle:

- build a stage-family map for Aurora progression
- make challenging stages more interesting and less uniform
- add new challenge-stage alien types, movement patterns, and scoring pressure
- introduce later-level entry variation and movement texture
- vary formation arrival, convoy pulse, escort behavior, dive commitment, and
  regrouping patterns where reference evidence supports it
- mature capture retreat, rescue join, between-stage pause/music, and stage
  indicator behavior
- improve progressive difficulty and survivability without making self-play
  collapse too early
- add harnesses and reference artifacts for at least one expanded challenge
  stage and one later-level movement/entry family

Representative issue families:

- challenge-stage identity and behavior: `#9`, `#100`, `#140`
- progressive difficulty and stage elaboration: `#101`, `#32`
- stage and opening fidelity: `#4`, `#17`
- between-stage, capture, and rescue presentation: `#41`, `#42`, `#43`, `#44`
- self-play and later-stage fairness: `#18`, `#19`, `#62`, `#95`
- harness stage metrics correctness: `#35`, `#46`

Exit standard:

- Stage 1, Stage 2, at least one challenge stage, and one later-stage path have
  stable correspondence reports
- challenge stages read as intentional bonus stages with distinct content
- at least one new alien/movement/challenge family is visible in normal play
- gameplay depth improves without sacrificing early-run trust

## Release Family 1.5: Shared Videos And Flight Recorder

Working title:

- `1.5.0` "Flight Recorder"

Primary goal:

- make Aurora gameplay videos easy to publish, share, inspect, and use as
  reference evidence between users

Bundle:

- improve local replay/movie viewing
- publish selected run videos to a shareable repository or catalog
- connect video artifacts to issue reports, score records, and release notes
- support better export paths for session logs and optional videos
- add targeted auto-test scenarios that drive to meaningful states
- support a remote artifact catalog for log viewer workflows
- repair and harden video/audio artifact capture
- expand reference-video event logging and visual artifact extraction
- make published videos useful to both players and developers, not only to the
  local harness

Representative issue families:

- replay/watch mode and movie viewer: `#5`, `#110`, `#119`
- export and submit-run workflows: `#8`, `#90`, `#69`
- targeted evidence harnesses: `#89`, `#92`
- artifact catalog and video repair: `#97`, `#96`, `#13`
- commentary-ready telemetry: `#81`
- reference baseline and event logs: `#17`
- recent plays and public run links: `#70`

Exit standard:

- a meaningful run can be exported, inspected, replayed, published, and linked
  from a score or issue
- selected gameplay videos are available through a shared catalog or repository
- reference and Aurora event logs are closer in shape
- artifact paths are portable across machines

## Release Family 1.6: Pilot-Facing Shell Polish

Working title:

- `1.6.0` "Message to Pilot"

Primary goal:

- make Aurora feel more like a living cabinet and less like a test surface

Bundle:

- repurpose the bottom information panel as a durable `Message to Pilot` surface
- separate Platinum-owned shell copy from Aurora-owned game copy
- unify popup, dock, overlay, score, manual, and wait-mode surfaces
- make settings, account, bug report, score, and help entry points feel
  consistent and contained inside the cabinet frame
- preserve release information as one message type rather than the whole panel
- use published-run and scorebook signals as future message sources once those
  systems exist

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

## Release Family 1.7: Pilot Identity And Scorebook

Working title:

- `1.7.0` "Pilot Records"

Primary goal:

- turn player identity, scores, videos, and run history into a durable product
  surface

Bundle:

- require or migrate toward permanent pilot IDs
- support account lifecycle and deletion
- track leaderboards by version, season, or release family
- expand pilot records into a scorebook with replay and video links
- clarify account-confirmation and Aurora-branded auth emails
- add better date/build filtering to high-score surfaces
- connect shared gameplay videos to pilot records where privacy and storage
  policy allow it

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
- run videos can become part of a pilot history when appropriate

## Release Family 1.8: Platinum Sneak Peek

Working title:

- `1.8.0` "Second Cabinet Preview"

Primary goal:

- expose a preliminary second-game experience early enough to strengthen the
  Platinum layer before the full multi-game release

Bundle:

- add a dev-preview or limited public sneak peek for a second Platinum game
- likely candidate: a `Galaxian`-style sibling proof, because it shares enough
  mechanics to validate the platform without requiring a wholly different genre
- keep the preview honest: playable slice, explicit preview labeling, and no
  overclaiming
- define what belongs to Platinum versus the game pack when a second app is
  present
- pressure-test pack metadata, controls, shell copy, storage, score policy, and
  visual theme loading
- keep `Galaxy Guardians` preview-only unless it has its own durable data model
  and real mechanics

Current preview planning anchor:

- [GALAXY_GUARDIANS_PREVIEW_RELEASE_PLAN.md](GALAXY_GUARDIANS_PREVIEW_RELEASE_PLAN.md)

First preview target:

- `Galaxy Guardians Preview 0.1: Scout Wave`

This preview can arrive before the full `1.8` release family if it is clearly
preview-labeled and released through the normal authority workflow. Its purpose
is to pressure-test Platinum with a real second-game slice while Aurora arcade
depth continues in parallel.

Representative issue families:

- Platinum multi-game extraction: `#111`
- Galaxian mechanics archive and future ingestion planning
- game picker and pack metadata work from `#144`
- theme/brand package work from `#99`, `#30`, `#84`
- future game-pack designer foundations from `#141`

Exit standard:

- the second-game preview can launch through Platinum without breaking Aurora
- the preview reveals real platform seams that need fixing before `2.0`
- the preview is honest about what is playable and what is placeholder

## Release Family 1.9: Operations And Pack Contract

Working title:

- `1.9.0` "Platinum Readiness"

Primary goal:

- finish enough operational and platform separation that the next release can
  honestly become multi-game

Bundle:

- formalize a pack contract for game identity, controls, stages, assets,
  storage, score policy, shell copy, videos, and admin artifacts
- migrate Aurora-shaped platform storage names toward neutral Platinum
  namespaces
- decouple brand/style assets into a swappable package
- support alternate visual themes without confusing them with distinct games
- separate non-production and production identity and score paths more cleanly
- strengthen preflight checks for promotion and public verification
- replace fragile feedback transport with a controlled backend option
- add a per-game admin artifact panel
- start a post-1.0 Control Centre surface for administrative operations
- continue separating source, generated artifacts, release hosts, and public
  sync responsibilities

Representative issue families:

- shared arcade platform extraction: `#111`
- brand package and theme system: `#99`, `#30`, `#84`
- Windigo/Aurora theme work: `#26`, `#27`, `#28`, `#29`
- custom stages and visual themes: `#83`, `#84`
- non-production Supabase separation: `#126`
- reset or strip test-oriented state before production: `#122`
- feedback transport: `#133`, `#53`, `#7`
- Control Centre and admin surfaces: `#124`, `#139`
- game-pack designer/admin tooling: `#141`
- source/generated release-pipeline split: `#98`
- daily/status reporting: `#54`, `#56`, `#34`

Exit standard:

- Aurora is one pack hosted by Platinum, not the hidden shape of the whole
  platform
- operational actions have clearer admin surfaces and safer lane boundaries
- release and public sync checks are harder to misuse
- same-control expectations are documented and testable
- the second-game preview has produced concrete pack-contract requirements for
  `2.0`

## Release Family 2.0: First Multi-Game Platinum Release

Working title:

- `2.0.0` "Platinum Arcade"

Primary goal:

- make Platinum a real multi-game arcade host

Bundle:

- promote the second-game preview into a meaningful playable game slice
- add game-picker behavior only when there is something real to pick
- ensure both games comply with shared control and cabinet expectations
- keep storage, scores, shell copy, videos, and release metadata separated by
  game pack
- grow reference-media ingestion for the second game before fidelity claims
- make the public product promise about Platinum, not only Aurora

Representative issue families:

- Platinum multi-game extraction: `#111`
- Galaxian mechanics archive and future ingestion planning
- game picker and pack metadata work from `#144`
- theme/brand package work from `#99`, `#30`, `#84`
- future game-pack designer foundations from `#141`

Exit standard:

- at least two Platinum applications can be launched through the shell
- the second application is playable enough to validate the pack contract
- controls, storage, scores, videos, and shell copy do not leak Aurora
  assumptions

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
- connect reference event logs, player telemetry, published videos, and replay
  records
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
2. Make `1.3` a measurement-backed quality release and level-expansion planning
   pass, not a feature grab bag.
3. Promote level-by-level arcade depth to `1.4`, because Aurora needs richer
   stage progression, challenge stages, alien types, and movement variety.
4. Promote shared gameplay-video publishing to `1.5`, because shared evidence
   and player-facing run memory are important product capabilities.
5. Move `Message to Pilot` after the arcade-depth and video foundations so it
   can eventually surface richer live events.
6. Treat pilot identity and score history as their own product milestone.
7. Bring a second-game sneak peek forward before `2.0` so Platinum gets real
   pressure from more than one app.
8. Finish Platinum pack boundaries before claiming full multi-game status.
9. Reserve the first true major-version moment for a real second playable
   application under Platinum.

## Near-Term Branch Implications

Recommended next branches from `main`:

1. `codex/macbook-pro-audio-phase-gate`
2. `codex/macbook-pro-level-expansion-plan`
3. `codex/macbook-pro-movement-traces`
4. `codex/macbook-pro-gameplay-trust`
5. `codex/macbook-pro-shared-video-catalog`
6. `codex/macbook-pro-second-game-preview`
7. `codex/macbook-pro-message-to-pilot`
8. `codex/macbook-pro-platinum-copy-boundary`

These branches do not need to map one-to-one to public releases. They are the
first small steps toward the release families above.
