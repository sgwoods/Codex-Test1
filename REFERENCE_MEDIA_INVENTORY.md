# Reference Media Inventory

This inventory lists the preserved gameplay footage, reference media, and derived analysis packs that currently support Aurora fidelity work.

It exists so future work does not depend on memory or chat history when deciding what evidence is already available.

For the repeatable source-to-game-pack process, pair this inventory with:

- `CLASSIC_ARCADE_INGESTION_FRAMEWORK.md`

That framework defines the manifest, window, event-log, semantic-model, and
harness-planning chain that should govern `Galaxian` / `Galaxy Guardians` and
future Platinum game ingestion.

## Core Aurora / Galaga Reference Sources

| Source family | Local analysis anchor | What it contains | Best use |
| --- | --- | --- | --- |
| Galaga audio reference video | `reference-artifacts/analyses/galaga-audio-reference-video/README.md` | labeled sound-reference video, contact sheets, cue catalog | cue naming, phrase family review, audio identity comparison |
| Galaga audio reference video 2 | `reference-artifacts/analyses/galaga-audio-reference-video-2/README.md` | indexed gameplay and result sounds, extracted clip inventory | tractor beam, capture flow, ambience variants, results cues |
| Galaga audio reference video 3 | `reference-artifacts/analyses/galaga-audio-reference-video-3/README.md` | additional indexed cue video with clip map | challenge variants, ambience/convoy, attack and boss sound families |
| Galaga stage reference video | `reference-artifacts/analyses/galaga-stage-reference-video/README.md` | stage-oriented preserved reference video and derived frame views | stage-opening cadence, formation arrival, convoy rhythm |
| Challenge stage reference pack | `reference-artifacts/analyses/challenge-stage-reference/README.md` | challenge-stage contact sheet and stable observations | non-attacking bonus-stage behavior, readability, results framing |
| First challenge-stage baseline | `reference-artifacts/analyses/first-challenge-stage/README.md` | focused challenge-stage baseline from original capture | early challenge motion, group readability, scoreable windows |
| Release reference pack | `reference-artifacts/analyses/release-reference-pack/README.md` | curated windows for capture, transition, Stage 4, later pressure | release-shaping comparisons beyond stage 1 |
| Galaga Gameplay Arcade - Snake Latino | `reference-artifacts/analyses/galaga-snake-latino-gameplay/README.md` | local 360p H.264 gameplay video catalog entry | future stage-opening, player-movement, shot-cadence, and later-pressure windows |
| Galaga manual / cabinet-era material | `reference-artifacts/manuals/galaga-1981-namco/README.md` | manual-backed rules and presentation anchors | source-of-truth rule checking before tuning or release claims |
| Reference audio clips | `src/assets/reference-audio/` | clipped reference cues mirrored into app assets | cue alignment, phrase comparison, reference-theme playback |

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
| Stage 1 opening correspondence | `reference-artifacts/analyses/correspondence/stage1-opening-first-dive` | how closely Aurora opening timing matches the reference timing library |
| Stage 1 opening spacing | `reference-artifacts/analyses/correspondence/stage1-opening-spacing` | whether formation geometry and spacing remain on target |
| Challenge-stage correspondence | `reference-artifacts/analyses/correspondence/challenge-stage-timing` | whether challenge entry and result timing matches the target model |
| Capture-rescue correspondence | `reference-artifacts/analyses/correspondence/capture-rescue` | whether capture/rescue state flow still matches the intended baseline |
| Persona progression correspondence | `reference-artifacts/analyses/correspondence/persona-progression` | whether progression depth and persona ordering remain healthy |
| Player movement correspondence | `reference-artifacts/analyses/correspondence/player-movement` | whether movement still matches current joystick-translation principles |
| Quality conformance roll-up | `reference-artifacts/analyses/quality-conformance` | what the current weighted quality picture looks like across all major categories |

## Supporting Comparative Archives

| Archive | Local anchor | Role |
| --- | --- | --- |
| Stage 4 fairness findings | `reference-artifacts/analyses/stage4-fairness/README.md` | durable record of what did and did not help Stage 4 fairness |
| External `Galaga5` reference | `reference-artifacts/analyses/external-galaga5/README.md` | implementation-pattern comparison, not canonical fidelity evidence |
| Galaxian mechanics archive | `reference-artifacts/analyses/galaxian-mechanics/README.md` | early sibling-project archive for future `Galaxian`-derived work |
| Galaxian reference ingestion seed | `reference-artifacts/analyses/galaxian-reference/README.md` | first source manifest, formation-entry window scaffold, Matt Hawkins arcade-intro scaffold, ARCADE'S LOUNGE Level 5 scaffold, Nenriki 15-wave session scaffold, event-log skeletons, and semantic scout-wave profiles for `Galaxy Guardians` |

## Current Gaps

These are the most important missing reference structures, not missing media files:

1. Player-movement trace windows derived directly from preserved gameplay footage.
2. Later-stage cadence trace families beyond the current Stage 1 and challenge emphasis.
3. Visual cadence traces linking board motion to cue and stage-flow targets.
4. A stronger Galaxian sibling timing library to match the current Aurora / Galaga baseline maturity.
5. Reference-side event logs that align preserved video timestamps with Aurora-like event families.
6. A durable labeled catalog of core ship/enemy/presentation image artifacts for comparison and documentation.
7. Source manifests that record provenance, license notes, analysis status, and
   confidence before a discovered video becomes implementation evidence.
8. Semantic slice profiles that translate reference windows into game-pack rules
   and harness targets.

## Working Rule

When we add a new preserved video, manual, clip pack, or reference window, we should update this inventory and link it to at least one:

- committed reference profile
- committed harness
- committed roadmap or scorecard note

That keeps the evidence usable for future release decisions.
