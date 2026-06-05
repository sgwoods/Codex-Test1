# Reference Media Inventory

This inventory lists the preserved gameplay footage, reference media, and derived
analysis packs that currently support Aurora, Galaxy Guardians, and future-game
ingestion work.

It exists so future work does not depend on memory or chat history when deciding what evidence is already available.

The primary hosted intake/status surface for this material now lives at
`ingestion-dashboard.html`, but this file remains the durable repo-owned ledger
for what is actually preserved and why it matters.

The public repo now keeps public-safe metadata for these sources, while copied
and derived media bytes should live in the companion private artifact store
described in `PRIVATE_ARTIFACT_STORAGE_POLICY.md`.

That companion private repo now exists at:

- `https://github.com/sgwoods/Codex-Test1-private-artifacts`

The first legacy public-media migration tranche is now also complete in the
working tree for the two most Guardians-critical source-derived lanes:

- `reference-artifacts/analyses/galaxian-frame-reference`
- `reference-artifacts/analyses/audio-conformance-lab`

The next completed private-lane migration tranche is now also in place for the
two largest Aurora audio-fitting families:

- `reference-artifacts/analyses/aurora-audio-cue-candidates`
- `reference-artifacts/analyses/aurora-audio-theme-comparison`

The follow-on private-lane migration waves are now also in place for the
broader Aurora/Galaga challenge/reference and direct-reference families,
including:

- challenge/reference motion lanes:
  - `reference-artifacts/analyses/galaga-path-reference-media`
  - `reference-artifacts/analyses/galaga-alien-frame-cadence-targets`
  - `reference-artifacts/analyses/galaga-challenge-video-reference`
  - `reference-artifacts/analyses/galaga-audio-reference-video-3`
- older direct-reference residue:
  - `reference-artifacts/analyses/galaga-audio-reference-video`
  - `reference-artifacts/analyses/galaga-audio-reference-video-2`
  - `reference-artifacts/analyses/galaga-reference-sprites`
  - `reference-artifacts/analyses/galaxian-reference`
  - `reference-artifacts/analyses/space-invaders-reference`
- smaller visual-reference crop/timing packs:
  - `reference-artifacts/analyses/galaga-alien-target-crops`
  - `reference-artifacts/analyses/stage7-reference-path-before-after`
  - `reference-artifacts/analyses/galaga-alien-cadence-validation`
  - `reference-artifacts/analyses/galaga-alien-visual-crop-previews`
  - `reference-artifacts/analyses/galaga-stage-opening-timing`

The next storage decision is now a mixed-conformance review, not another blind
bulk move. Repo-owned runtime evidence can stay public, while source-derived
comparison sheets in mixed lanes should move private as they are identified.

For the repeatable source-to-game-pack process, pair this inventory with:

- `CLASSIC_ARCADE_INGESTION_FRAMEWORK.md`
- `GAME_CONFORMANCE_CATALOG.md`

That framework defines the manifest, window, event-log, semantic-model, and
harness-planning chain that should govern `Galaxian` / `Galaxy Guardians` and
future Platinum game ingestion.

The game conformance catalog is the human-readable index that ties these media
sources to each game's alien/enemy rows, audio cue rows, stage summaries, and
persona testing expectations.

## Core Aurora / Galaga Reference Sources

| Source family | Local analysis anchor | What it contains | Best use |
| --- | --- | --- | --- |
| Galaga audio reference video | `reference-artifacts/analyses/galaga-audio-reference-video/README.md` | labeled sound-reference video, contact sheets, cue catalog | cue naming, phrase family review, audio identity comparison |
| Galaga audio reference video 2 | `reference-artifacts/analyses/galaga-audio-reference-video-2/README.md` | indexed gameplay and result sounds, extracted clip inventory | tractor beam, capture flow, ambience variants, results cues |
| Galaga audio reference video 3 | `reference-artifacts/analyses/galaga-audio-reference-video-3/README.md` | additional indexed cue video with clip map | challenge variants, ambience/convoy, attack and boss sound families |
| Galaga indexed micro-cue pack | `reference-artifacts/analyses/galaga-audio-reference-video-4/README.md` | compact labeled sound-pack video with isolated start, kill, flying, ambience, capture, rescue, extra-life, and death cues | corroborating smaller Galaga micro-cues that may help Aurora audio-family fitting without changing the main challenge-stage / explosion gap picture |
| Galaga KHInsider MP3 cue pack | `reference-artifacts/preserved-sources/galaga-khinsider-mp3-cues-2026-06-01/README.md` | preserved named MP3 pack for stage intro, capture/rescue, challenge-stage, result/perfect, 1-up, death/start-up, coin, and name-entry families | preferred named ceremony/capture/result cue source for Aurora audio fitting, especially where full canonical phrases matter more than compact micro-cue corroboration |
| Galaga Steam how-to-play guide | `reference-artifacts/preserved-sources/galaga-steam-how-to-play-guide-2026-06-01/README.md` | preserved Steam player guide PDF plus a small alien preview still with explicit dual-fighter, dodging, and challenge-stage practice prose | supporting Aurora player-strategy grounding and a minor still-image lead without being mistaken for timing, audio, or manual truth |
| Galaga PrimeTime Amusements getting-good guide | `reference-artifacts/preserved-sources/galaga-primetimeamusements-getting-good-2026-06-01/README.md` | preserved Galaga strategy PDF plus logo, title-screen, tractor-beam, and stage-01 stills with explicit score/survival/capture advice | supporting Aurora player-strategy grounding and screen-surface still collection without being mistaken for timing, audio, or manual truth |
| Galaga wikiHow play guide and screenshot bundle | `reference-artifacts/preserved-sources/galaga-wikihow-play-guide-2026-06-01/README.md` | preserved wikiHow article HTML snapshot plus 24 annotated screenshots covering anti-fire setup, capture/rescue, entrance-pattern explanations, opening-stage positioning, morph bonus, and result/bonus examples | strongest current annotated-still and policy-explanation lane for Aurora without being mistaken for manual, motion, timing, or audio truth |
| Galaga StrategyWiki gameplay/walkthrough and sprite bundle | `reference-artifacts/preserved-sources/galaga-strategywiki-gameplay-walkthrough-2026-06-01/README.md` and `reference-artifacts/analyses/galaga-strategywiki-gameplay-walkthrough/README.md` | preserved gameplay and walkthrough PDFs plus a 12-image gameplay-page sprite bundle covering fighter, capture, bee, butterfly, dragonfly, flagship, and transform families | strongest current repo-owned per-family Galaga sprite identity lane and a useful supporting walkthrough/policy reference without being mistaken for timing or audio truth |
| Galaga arcade-museum history/spec page | `reference-artifacts/preserved-sources/galaga-arcade-museum-2026-06-01/README.md` | preserved Museum of the Game PDF and HTML snapshot with release metadata, controls, mono sound, cabinet styles, and broad cabinet/control-panel/bezel/PCB/title image leads | strongest current cabinet/spec and image-lead lane for Aurora without being mistaken for measured gameplay timing or audio truth |
| Galaga stage reference video | `reference-artifacts/analyses/galaga-stage-reference-video/README.md` | stage-oriented preserved reference video and derived frame views | stage-opening cadence, formation arrival, convoy rhythm |
| Challenge stage reference pack | `reference-artifacts/analyses/challenge-stage-reference/README.md` | challenge-stage contact sheet and stable observations | non-attacking bonus-stage behavior, readability, results framing |
| Galaga isolated challenging-stages motion source | `reference-artifacts/preserved-sources/galaga-challenging-stages-isolated-2026-06-01/README.md` and `reference-artifacts/analyses/galaga-challenging-stages-isolated/README.md` | preserved 640x360 challenge-stage compilation showing the stages one at a time with full formations and route motion visible, plus first-pass contact sheets | preferred raw source for Aurora challenge-family subclip extraction and motion-window promotion when live-play clutter would make the patterns harder to read |
| Galaga perfect challenging-stages source | `reference-artifacts/preserved-sources/galaga-perfect-challenging-stages-2026-06-01/README.md` and `reference-artifacts/analyses/galaga-perfect-challenging-stages/README.md` | preserved earlier 320x240 perfect-play challenge-stage compilation with first-pass contact sheets | supplemental perfect-play corroboration lane for Aurora after the higher-quality perfect-play source was added |
| Galaga higher-quality perfect challenging-stages source | `reference-artifacts/preserved-sources/galaga-higher-quality-perfect-challenging-stages-2026-06-01/README.md` and `reference-artifacts/analyses/galaga-higher-quality-perfect-challenging-stages/README.md` | preserved stronger perfect-play challenge-stage compilation with first-pass contact sheets sampled across the full run | preferred repo-owned source for Aurora perfect-result presentation, ideal-flow cadence, and repeated flawless challenge-stage review |
| First challenge-stage baseline | `reference-artifacts/analyses/first-challenge-stage/README.md` | focused challenge-stage baseline from original capture | early challenge motion, group readability, scoreable windows |
| Release reference pack | `reference-artifacts/analyses/release-reference-pack/README.md` | curated windows for capture, transition, Stage 4, later pressure | release-shaping comparisons beyond stage 1 |
| Galaga manual / cabinet-era material | `reference-artifacts/manuals/galaga-1981-namco/README.md` | manual-backed rules and presentation anchors | source-of-truth rule checking before tuning or release claims |
| Galaga target artifact corpus | `reference-artifacts/analyses/galaga-target-artifact-coverage/latest.json` and `GALAGA_TARGET_ARTIFACT_COVERAGE.md` | online/local target inventory, ingestion status, challenge-window readiness, and next acquisition needs | deciding which reference artifacts are strong enough to guide implementation versus only useful as planning or supplemental context |
| Galaga design grounding notes | `reference-artifacts/ingestion/galaga-design-grounding/README.md` | derived official-source and player-guide assertions for identity, entry, challenge-stage learnability, capture/rescue, and transform progression | grounding player/designer meaning while keeping numeric movement scores tied to measured media |
| Galaga Free80sArcade history and strategy page | `reference-artifacts/preserved-sources/galaga-free80sarcade-history-guide-2026-06-01/README.md` | preserved browser-play history/strategy page with detailed capture, entrance-pattern, challenge-stage centering, transform progression, anti-fire exploit, and secret-technique prose | supporting design-grounding and player-strategy context for Aurora without being mistaken for primary timing or audio truth |
| Galaga screen-surface targets | `reference-artifacts/ingestion/galaga-screen-surface-targets/README.md` | derived target map for title, in-game, high-score, game-over, cabinet, and challenge-result surfaces | planning visual/UI conformance work before approved screenshot/contact-sheet targets exist |
| Galaga classic recovered source lane | `reference-artifacts/preserved-sources/galaga-classic-recovery-2026-05-17/README.md` | recovered source videos, Freesound pack, Galaxian wav, and stage-video proxy with hashes/manifests | current canonical source lane for the active Galaga/Galaxian reference media that older docs used to cite from stale machine paths |
| Galaxian no-voiceover early-session source | `reference-artifacts/preserved-sources/galaxians-arcade-no-voiceover-2026-06-01/README.md` | preserved 4:10 gameplay session from start screen to game over with direct game audio and no voiceover | precise early-session cue timing, start/loss/game-over audio windows, and short-form Guardians sound review |
| Galaxian 15-wave full-session source | `reference-artifacts/preserved-sources/galaxian-15wave-full-start-end-2026-06-01/README.md` | preserved 15-wave gameplay session that visibly covers score-advance/start presentation through later-wave pressure and final game over | promoting named stage-5+ audio/pacing windows, full-session continuity review, and end-state closure without reopening scattered shorter clips |
| Galaxian KHInsider FLAC cue pack | `reference-artifacts/preserved-sources/galaxian-khinsider-flac-cues-2026-06-01/README.md` | preserved named FLAC pack for credit, start, shoot, loss, extra-life, flying, hit-enemy, and hit-boss cues | preferred isolated core-cue source for Guardians audio fitting, reducing the older static-card reel to a residual-gap source rather than the primary core-cue path |
| Galaxians indexed sound reel | `reference-artifacts/preserved-sources/galaxians-sounds-indexed-2026-06-01/README.md` | preserved static-card sound reel with changing audio and waveform evidence of isolated cue blocks plus a longer sustained region | isolated Galaxians-family cue-family comparison for Guardians audio work, with the next step being timestamped cue mapping because readable per-cue visual labels are not yet available |
| Galaxian ambience background source | `reference-artifacts/preserved-sources/galaxian-ambience-background-2026-06-01/README.md` | preserved sustained Galaxian-family ambience/background bed with continuous waveform across the full run | source-side recurring-pressure / ambient-bed fitting for Guardians audio work, largely closing the generic ambience-source hunt while still leaving gameplay-context windows important |
| Galaxian gameplay/history prose package | `reference-artifacts/preserved-sources/galaxian-wikipedia-2026-06-01/README.md` | preserved Wikipedia article PDF plus first-page preview and confirmed outbound links | gameplay-history prose grounding and lead harvesting for flyer/image follow-up sources |
| Galaxian Absolute Knave history review | `reference-artifacts/preserved-sources/galaxian-absoluteknave-history-review-2026-06-01/README.md` | preserved long-form player-review/history page with explicit fairness, responsiveness, breakout-prediction, and late-wave pressure commentary | supporting interpretation of Guardians fairness and feel without being mistaken for direct timing or audio evidence |
| Galaxian arcade-museum history/spec page | `reference-artifacts/preserved-sources/galaxian-arcade-museum-2026-06-01/README.md` | preserved Museum of the Game PDF and HTML snapshot with release metadata, controls, mono sound, cabinet styles, RGB-color trivia, and broad marquee/cabinet/bezel/control-panel/PCB/flyer/manual image leads | strongest current cabinet/spec and visual-lead lane for Guardians without being mistaken for measured gameplay timing or audio truth |
| Galaxian structured still-image lead package | `reference-artifacts/preserved-sources/galaxian-namco-wiki-fandom-2026-06-01/README.md` | preserved Namco Wiki / Fandom PDF with direct flyer, cabinet, flagship, and alien-family image leads | turns the Galaxian still-image hunt into a concrete preservation queue instead of a vague request for better images |
| Galaxian StrategyWiki guide, gameplay, walkthrough, and sprite bundle | `reference-artifacts/preserved-sources/galaxian-strategywiki-guide-walkthrough-sprite-bundle-2026-06-01/README.md` and `reference-artifacts/analyses/galaxian-strategywiki-guide-walkthrough-sprite-bundle/README.md` | preserved StrategyWiki guide/gameplay/walkthrough PDFs plus a 6-image flyer and sprite bundle covering the Midway flyer, flagship, blue/purple/red alien families, and Galaxip | strongest current repo-owned Galaxian flyer and sprite-identity lane plus a useful supporting walkthrough reference without being mistaken for timing or audio truth |
| Galaxian primary operator manual package | `reference-artifacts/preserved-sources/galaxian-midway-operator-manual-2026-06-01/README.md` | preserved Midway parts and operating manual with arcade-era documentary authority | moves the artifact gap from “find an arcade manual” to “extract score/rules/setup pages from the manual now in repo” |
| Galaxian official gameplay-summary page | `reference-artifacts/preserved-sources/galaxian-galaga-web-history-2026-06-01/README.md` | preserved Bandai Namco Galaga Web history/gameplay summary page for Galaxian | corroborates control language, single-shot constraint, alien-family naming, and convoy/charger score bands with an official modern source |
| Galaga League official lineage page | `reference-artifacts/preserved-sources/galaga-league-history-2026-06-01/README.md` | preserved Bandai Namco page defining the Galaga League and tying the classic series together | supports official lineage, naming, and themed-universe framing without being mistaken for gameplay-conformance evidence |
| Reference audio clips | `src/assets/reference-audio/private-storage.json` | public pointer for the former app-bundled source-derived cue pack, now stored in the companion private repo under `private-artifacts/repo-mirror/src/assets/reference-audio/` | cue alignment, phrase comparison, and private reference-theme review without shipping copied cue bytes from the public repo |

## Derived Analysis Packs Already In The Repo

| Analysis pack | Local anchor | Main question it answers |
| --- | --- | --- |
| Galaga timing alignment | `reference-artifacts/analyses/galaga-timing-alignment` | what are the reusable timing baselines across original gameplay windows |
| Galaga reference timing library | `reference-artifacts/analyses/galaga-reference-timing-library/README.md` | what event-family targets should stage flow and cue spacing use |
| Galaga stage opening timing | `reference-artifacts/analyses/galaga-stage-opening-timing` | how should the opening sequence read in timing and visible contact windows |
| Galaga audio overlap | `reference-artifacts/analyses/galaga-audio-overlap` | how much overlap is acceptable between key cues and scene transitions |
| Galaga boss timing | `reference-artifacts/analyses/galaga-boss-timing` | how boss-hit and boss-death timing families should behave |
| Galaga audio cue matrix | `reference-artifacts/analyses/galaga-audio-cue-matrix/README.md` | how cue families map to original reference sounds |
| Aurora audio theme comparison | `reference-artifacts/analyses/aurora-audio-theme-comparison` | how closely Aurora cue identity tracks the preserved Galaga reference clips |
| Aurora level-expansion evidence cycle | `reference-artifacts/analyses/aurora-level-expansion-cycle/README.md` | what deterministic local Aurora gameplay windows show about stage baseline, challenge pressure, mid-run pressure, and late-run cleanup/failure patterns |
| Evidence cycle dashboard | `reference-artifacts/analyses/evidence-cycle-dashboard/README.md` | whether curated evidence windows have manifests, frames, events, traces, audio timelines, and harness targets |
| Stage 1 opening correspondence | `reference-artifacts/analyses/correspondence/stage1-opening-first-dive` | how closely Aurora opening timing matches the reference timing library |
| Stage 1 opening spacing | `reference-artifacts/analyses/correspondence/stage1-opening-spacing` | whether formation geometry and spacing remain on target |
| Challenge-stage correspondence | `reference-artifacts/analyses/correspondence/challenge-stage-timing` | whether challenge entry and result timing matches the target model |
| Galaga target artifact coverage | `reference-artifacts/analyses/galaga-target-artifact-coverage/latest.json` | which official/manual/video/player-guide/sprite/audio sources are ingested, partial, candidate, or missing |
| Capture-rescue correspondence | `reference-artifacts/analyses/correspondence/capture-rescue` | whether capture/rescue state flow still matches the intended baseline |
| Persona progression correspondence | `reference-artifacts/analyses/correspondence/persona-progression` | whether progression depth and persona ordering remain healthy |
| Player movement correspondence | `reference-artifacts/analyses/correspondence/player-movement` | whether movement still matches current joystick-translation principles |
| Quality conformance roll-up | `reference-artifacts/analyses/quality-conformance` | what the current weighted quality picture looks like across all major categories |
| Galaxian reference profile | `reference-artifacts/analyses/galaxian-reference/README.md` | source manifests, contact sheets, waveforms, promoted event log, no-voiceover early-session audio anchor, first scout-wave profile, and the context for Guardians evidence promotion |
| Guardians promoted evidence packet | `reference-artifacts/analyses/guardians-reference-window-promotion-2026-06-05/README.md` | public metadata packet for named early-session, stage-five-plus, motion, popup, ambience, manual-page, and still-image anchors plus a residual cue ledger and linked runtime correspondence captures |

## Emerging Intake Lines

| Lineage | Local anchor | Preserved material | Current role |
| --- | --- | --- | --- |
| Space Invaders / Windigo Invaders | `reference-artifacts/analyses/space-invaders-reference/README.md` | preserved intake lane for the next planned Platinum sibling game | currently used to drive source-gap identification, score/rules grounding, and the first game-owned instantiation plan before runtime work begins |
| Space Invaders classic sound pack | `reference-artifacts/preserved-sources/space-invaders-classicgaming-sounds-2026-06-01/README.md` | preserved named WAV pack for UFO, four march steps, shot, invader kill, and explosion | narrows the Windigo audio hunt to missing player-loss/start-credit truth and gameplay-context timing rather than generic sound acquisition |
| Space Invaders StrategyWiki guide, gameplay, walkthrough, and sprite bundle | `reference-artifacts/preserved-sources/space-invaders-strategywiki-guide-walkthrough-sprite-bundle-2026-06-01/README.md` and `reference-artifacts/analyses/space-invaders-strategywiki-guide-walkthrough-sprite-bundle/README.md` | preserved StrategyWiki guide/gameplay/walkthrough PDFs plus a 6-image flyer and sprite bundle covering the flyer, saucer, large/medium/small invader families, and cannon | strongest current repo-owned Space Invaders flyer and cannon/invader-family identity lane plus a useful supporting walkthrough reference without being mistaken for timing or live audio truth |
| Space Invaders Absolute Knave history review | `reference-artifacts/preserved-sources/space-invaders-absoluteknave-history-review-2026-06-01/README.md` | preserved long-form player-review/history page with explicit notes on dynamic march tension, one-shot pressure, column-chop strategy, and original button-control feel | supports Windigo gameplay-feel and control-model interpretation without being mistaken for timing or audio truth |
| Space Invaders arcade-museum history/spec page | `reference-artifacts/preserved-sources/space-invaders-arcade-museum-2026-06-01/README.md` | preserved Museum of the Game PDF and HTML snapshot with release metadata, black-and-white-with-overlay display truth, 2-way plus 1-fire control grounding, mono sound, cabinet styles, and broad marquee/cabinet/bezel/control-panel/PCB/title image leads | strongest current cabinet/spec and still-target discovery lane for Windigo without being mistaken for measured gameplay timing or live audio truth |

## Supporting Comparative Archives

| Archive | Local anchor | Role |
| --- | --- | --- |
| Stage 4 fairness findings | `reference-artifacts/analyses/stage4-fairness/README.md` | durable record of what did and did not help Stage 4 fairness |
| External `Galaga5` reference | `reference-artifacts/analyses/external-galaga5/README.md` | implementation-pattern comparison, not canonical fidelity evidence |
| Galaxian mechanics archive | `reference-artifacts/analyses/galaxian-mechanics/README.md` | early sibling-project archive for future `Galaxian`-derived work |
| Neo-Galaga historical representative archive | `reference-artifacts/preserved-sources/neo-galaga-history-2026-03-to-2026-04/README.md` | first preserved subset from the recovered March-April Neo-Galaga history for historical runtime provenance, release-story support, and future comparative analysis |
| Old-machine downloads intake lane | `reference-artifacts/ingestion/downloads-old-all-2026-05-17/README.md` | triaged intake record plus curated Neo-Galaga accession plan for historical exports and recoverable cited source media from the copied old-machine download drop |

## Current Gaps

These are the most important missing reference structures, not missing media files:

1. Player-movement trace windows derived directly from preserved gameplay footage.
2. Later-stage cadence trace families beyond the current Stage 1 and challenge emphasis.
3. Visual cadence traces linking board motion to cue and stage-flow targets.
4. Frame-level Galaxian timing bands that refine the first promoted event log
   into runtime-ready scout-wave timings.
5. Reference-side event logs that align preserved video timestamps with Aurora-like event families.
6. A durable labeled catalog of core ship/enemy/presentation image artifacts for comparison and documentation. The first maintained human index now lives in `GAME_CONFORMANCE_CATALOG.md`; the remaining gap is generating more direct extracted target crops for Aurora's Galaga-family alien rows.
7. Source manifests that record provenance, license notes, analysis status, and
   confidence before a discovered video becomes implementation evidence.
8. Semantic slice profiles that translate reference windows into game-pack rules
   and harness targets.
9. A formal promoted-evidence index that ties gameplay captures to quality
   conformance, player-profile training, and future Player 2 simulation needs.
10. Late Galaga challenging-stage precision labels. The user-supplied
    `challenge-all2.mp4` and `challenging.mp4` sources are now preserved through
    derived contact sheets and hashes in
    `reference-artifacts/analyses/galaga-challenge-video-reference/latest.json`,
    so Challenge Stages 4-8 are no longer empty media gaps. The remaining gap is
    five-group frame/object labels for each challenge window, especially the
    green-ladder, yellow-fan, and blue/purple finale stages.
11. Approved screen-surface screenshots or controlled frames for Galaga title,
    high-score, game-over, challenge-result, and cabinet/control-panel surfaces.

## Working Rule

When we add a new preserved video, manual, clip pack, or reference window, we should update this inventory and link it to at least one:

- committed reference profile
- committed harness
- committed roadmap or scorecard note
- committed evidence dashboard or source manifest

That keeps the evidence usable for future release decisions.
