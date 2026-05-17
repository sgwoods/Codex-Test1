# Game Conformance Catalog

Updated: May 11, 2026

This is the maintained index for game-specific conformance evidence across
Platinum applications. It gives each game a durable catalog of:

- alien/enemy roles, names, activity, presence, and as-displayed conformance
- audio cues, target references, current evidence, and conformance posture
- stage-by-stage gameplay summaries and key conformance aspects
- testing personas used by platform and game harnesses

This catalog is a required high-priority artifact for every game that enters
the ingestion pipeline. It should be updated whenever new extracted reference
sprites, contact sheets, audio clips, stage windows, runtime evidence, or
scorer outputs are promoted.

## Scoring Interpretation

Catalog scores are `x/10` at the current evidence resolution.

| Confidence | Meaning |
| --- | --- |
| High | Direct extracted reference evidence exists and the scorer compares against it. |
| Medium | Runtime evidence and dedicated harness scores exist, but direct reference comparison is incomplete. |
| Low | The row is a documented design/evidence placeholder or proxy reading. |

A `10/10` in another scorecard does not mean a row below is perfect. It means
the specific scorer currently has no known measured gap.

## Required Ingestion Artifact Set

For each newly ingested game, create and maintain these artifacts before the
game is treated as a serious conformance target:

| Artifact | Required contents |
| --- | --- |
| Alien/enemy index | Name, role, visual ID, activity, stage presence, scoring behavior, target reference, conformance score, confidence, next gap. |
| Audio cue index | Cue ID, event meaning, gameplay purpose, reference clip or extracted waveform/spectrogram, current implementation, conformance score, confidence, next gap. |
| Stage index | Stage or wave number, enemy composition, entry formation, maneuvers, trajectories, difficulty, reward opportunity, reference evidence, conformance gaps. |
| Persona index | Beginner/novice, intermediate/advanced, expert, and professional behavior assumptions, seeds, scenarios, expected outcomes, and game-specific adaptations. |

The canonical storage pattern is:

- human overview: this file
- source/media inventory: `REFERENCE_MEDIA_INVENTORY.md`
- game-specific evidence: `reference-artifacts/analyses/<game-or-lineage>/`
- promoted metrics: `reference-artifacts/analyses/<metric-name>/latest.json`
- runtime harnesses: `tools/harness/`

## Aurora Galactica

Aurora is the active Galaga-style conformance target. It is an inspired game,
not a pixel-copy project, so the strongest rows are those grounded in direct
Galaga-family audio/timing/window evidence. Alien visual rows are currently
less mature than the movement and stage-variation rows.

### Alien And Enemy Index

| Display name | Runtime type / family | Activity and behavior | Presence | Target reference | Current conformance | Gap / next action |
| --- | --- | --- | --- | --- | --- | --- |
| Bee / Zako scout | `bee`, families `classic`, `scorpion`, `stingray`, `galboss` | Basic formation alien; dives, fires, supplies early pressure, appears in challenge groups. | All regular stages and challenge stages. | Galaga Zako/scout behavior and cue family; current anchors include `reference-artifacts/analyses/galaga-stage-reference-video/README.md`, `reference-artifacts/analyses/challenge-stage-reference/README.md`, and `src/assets/reference-audio/galaga3-zako.m4a`. | Behavior/stage role: 7.8/10 medium via alien-entry/challenge scorer. As-displayed visual likeness: low-confidence proxy only. | Add extracted Galaga alien sprite/contact-sheet crop targets and score Aurora displayed sprites against them. |
| Butterfly / escort alien | `but`, families `classic`, `scorpion`, `stingray`, `galboss` | Mid-value formation alien; dives more dangerously, escorts bosses in special attacks, participates in challenge set pieces. | All regular stages; high-value role in stages 4+. | Galaga butterfly/escort behavior; current anchors include boss/formation grammar and path-family reports under `reference-artifacts/analyses/formation-boss-grammar-conformance/` and `reference-artifacts/analyses/formation-boss-path-family-comparison/`. | Behavior/stage role: 7.8/10 medium; special-attack grammar contributes to 9.2/10 boss/formation score. Visual likeness pending. | Add per-role visual crop scoring and separate escort-path precision against Galaga reference windows. |
| Boss Galaga / command boss | `boss`, families `classic`, `stingray`, `galboss` | Two-hit boss; captures player ship, carries captured fighter, leads special attacks, awards high dive/squadron points. | All regular stages; capture/rescue and special-attack windows. | Galaga boss, tractor-beam, capture/rescue, and boss-hit/death timing. Audio anchors include `galaga3-tractor-beam.m4a`, `galaga3-fighter-captured.m4a`, `galaga2-fighter-rescued-double-ship.m4a`, `galaga3-boss-damage-flagship-fighter-shot.m4a`, and `galaga3-boss-death-sasori.m4a`. | Capture/rescue guardrails high; boss/formation grammar 9.2/10 medium; boss-hit audio now uses the curated first-damage subwindow and moved measured event risk from 4.62/10 to 0.96/10. First-hit damage now uses a compact spark/ring/cross flash rather than large destruction bursts. | Improve explosion/damage visual event authenticity, boss final-death distinctness, and direct boss path precision from extracted reference paths. |
| Challenge rogue / specialty alien | `rogue` | Challenge-stage novelty role used to create distinct set pieces and visible learning opportunities. | Challenge stages 7, 11, 15 in current evidence windows. | Galaga challenging-stage specialty waves and bonus-stage composition; current direct reference is challenge-stage timing/contact evidence. | Alien-entry/challenge variation scorer: 7.8/10. Challenge trajectory variation is still maxed at current broad scorer resolution, but arrival-versus-appearance is 6.8/10 and pattern novelty depth is 7.2/10. | Ground specialty alien introduction against actual Galaga challenge-stage contact sheets, then score first-visible arrival, entry side, target group, exit, and bonus-opportunity readability. |
| Captured fighter | carried player fighter state on boss | Converts player state into risk/reward: destroy too early for loss, rescue for dual fighter. | Capture/rescue stages after boss capture. | Galaga capture/rescue audio and event flow; see `reference-artifacts/analyses/correspondence/capture-rescue/`. | Capture/rescue flow is a current guardrail pass; visual feedback still needs richer explosion/impact semantics. | Add catalog row to visual event/effects index once explosion conformance scorer exists. |

### Audio Cue Index

| Cue family | Runtime cue | Gameplay meaning | Target reference | Current conformance | Gap / next action |
| --- | --- | --- | --- | --- | --- |
| Start and stage entry | `gameStart`, `formationArrival`, `stageTransition` | Begins run and anchors formation arrival timing. | `galaga2-game-start.m4a`, `galaga3-level-underscore.m4a`, `galaga-level-flag-v1.m4a`. | Stage timing strong; audio identity category is now 7.1/10. The latest local playtest showed `stageTransition` was too abbreviated, so the reference-backed phrase was widened to 3.35s while alignment guardrails stayed green. | Continue waveform/spectral comparison and fit full reference phrases where runtime windows allow. |
| Player and enemy fire | `playerShot`, `enemyShot` | Differentiates player action from enemy pressure. | `galaga3-boss-damage-flagship-fighter-shot.m4a`, cue comparisons in `aurora-audio-theme-comparison`, and candidate segment evidence under `reference-artifacts/analyses/aurora-audio-cue-candidates/`. | `playerShot` now uses the measured 0.08s-0.32s player-fire subwindow in the early classic and Galaga reference audio themes, moving its event-gap risk from 9.37/10 to 1.0/10. `enemyShot` keeps its distinct measured threat-fire window. | Continue rapid-fire listening and scorer checks so player and enemy fire stay distinct without masking hit feedback. |
| Enemy impact/destruction | `enemyHit`, `enemyBoom` | Immediate feedback that a missile impacted or destroyed a normal alien. | `galaga3-zako.m4a`; latest gap report in `reference-artifacts/analyses/aurora-audio-event-gap/latest.json`. | Audio gap remains high-value; current user note says explosions are not authentic enough. Latest acoustic event score is 6.73/10 with no semantic cue failures. | Add event-specific explosion/impact scorer covering missile impact, alien death, ship impact, temporary immunity, and boss damage. |
| Boss damage/destruction | `bossHit`, `bossBoom` | Shows multi-hit boss damage and final destruction clearly. | `galaga3-boss-damage-flagship-fighter-shot.m4a`, `galaga3-boss-death-sasori.m4a`. | `bossHit` now uses the measured 1.149s-1.439s damage subwindow, cutting its event-gap risk to 0.96/10 while preserving cue alignment. First-hit damage still needs a stronger audiovisual score, and final boss destruction remains separately measured. | Score first-hit flash, sound onset, hold/cadence, final explosion, and player comprehension. |
| Capture/rescue | `captureBeam`, `captureSuccess`, `captureRetreat`, `rescueJoin`, `capturedFighterDestroyed` | Explains the most important Galaga-style risk/reward loop. | Tractor beam, captured-fighter, capturing, rescued-double-ship, and captured-fighter-destroyed reference clips in `src/assets/reference-audio/`. | Flow guardrails pass; `rescueJoin` now uses the measured 2.399s-2.579s rescued-fighter excerpt after candidate-loop and full-theme precheck improved the cue gap by 2.41/10. | Improve event-rich logs and commentator/status hooks around capture and rescue, then revisit captureBeam tail separation. |
| Challenge results | `challengeTransition`, `challengeResults`, `challengePerfect` | Marks bonus-stage entry and result/reward feedback. | `galaga2-challenging-stage.m4a`, `galaga2-challenging-stage-results.m4a`, `galaga2-challenging-stage-perfect.m4a`. | Timing guardrails pass; `challengeTransition` now uses a 1.6s measured phrase, `challengeResults` uses 1.95s, and `challengePerfect` uses 2.15s. `challengePerfect` is the current highest measured audio gap, but onset-only candidates are rejected by the ceremony-duration gate. Challenge novelty and arrival authenticity remain a separate high-value gameplay gap. | Add score/result surface conformance and direct challenge-stage audio fit checks using full-phrase reward candidates. |
| High score / game over | `gameOver`, `highScoreFirst`, `highScoreOther` | End-of-run identity and arcade scoring ritual. | `galaga-last-ship-destroyed-ambience.m4a`, `galaga3-name-entry-1st.m4a`, `galaga3-name-entry-2nd-5th.m4a`. | The latest local playtest found a final-death audio cutout. Runtime now plays/logs `gameOver` before export, trims the silent lead-in, and delays recording stop so the final tail is preserved. | Include initials prompt and leaderboard behavior in release-lane persona testing, and keep final-death audio tail in the release capture checklist. |

### Stage Index

| Stage / band | Gameplay description | Key conformance aspects | Current evidence / metric |
| --- | --- | --- | --- |
| Stage 1 | Baseline rack entry, first dives, low pressure, player onboarding. | Formation arrival timing, first dive timing, safe early pressure, classic visual/audio framing. | `stage-1-baseline` evidence window; stage-1 geometry and shot trust are guardrail passes. |
| Stage 2 | Early regular-stage escalation with capture becoming possible but controlled. | Persona safety, boss window fairness, capture avoidance before unfair early collapse. | `persona-stage2-safety` and professional stage-2 harnesses. |
| Stage 3 / first challenge | First challenging stage and bonus-stage learning moment. | Non-lethal challenge behavior, scoreable windows, group readability, perfect-result feedback, and first-visible arrival rather than simple appearance. | Challenge timing guardrails pass; challenge variation scoring is stricter and still needs reference-labeled arrival/contact-sheet evidence. |
| Stage 4 | First major pressure step and capture/squadron importance. | Boss capture, special attacks, lane pressure, player loss windows, fairness. | Stage 4 pressure geometry, lane loss windows, and close-shot trust harnesses. |
| Stage 6 | Mid-run regular pressure anchor. | Higher attacker count, enemy bullets, clear rhythm, entry variation. | `mid-run-pressure` and `stage6-regular` windows. |
| Stage 7 challenge | Scorpion cross-sweep challenge set piece. | New trajectory family, challenge alien novelty, bonus opportunity clarity, and readable arrival side/path commitment. | `challenge-stage-scorpion-cross`; contributes to 7.8/10 alien-entry/challenge score. |
| Stage 8 | Mid-run entry variant. | Distinct regular entry path family and stage-band visual/motion identity. | `mid-run-entry-variant`; path-family specificity 8.5/10. |
| Stage 11 challenge | Stingray hook-arc challenge set piece. | Hooking trajectories, mixed alien composition, learning-stage novelty, and stage-specific entry grammar. | `challenge-stage-stingray-hook`; pattern novelty depth is now explicitly scored and remains below the major-gate target. |
| Stage 12 | Late-run cleanup and pressure/reward transition. | Higher pressure, squadron reward routes, survival/fairness balance. | `late-run-cleanup-or-failure`, level-arc probes, and stage-signature distance. |
| Stage 14 | Escort reward and advanced route planning. | Special-attack scoring, escort recovery route, advanced-persona outcome. | `late-run-escort-variant`, stage14 escort-reward sweeps. |
| Stage 15 challenge | Boss-led late-loop challenge set piece. | Boss-led entry style, late challenge novelty, high bonus readability. | `challenge-stage-boss-led-loop`; challenge window coverage now 4/4. |
| Stage 16+ band | Crown/late high-pressure identity. | Sustained difficulty, late-stage visual/audio identity, replayable mastery. | Current scorer covers bands, but direct Galaga late-stage path precision remains low-confidence. |

### Persona Index

| Human label | Current harness id | Role in testing | Expected behavior | Game-specific checks |
| --- | --- | --- | --- | --- |
| Beginner | `novice` | Low-skill onboarding and unfairness detector. | Moves less efficiently, misses more challenge opportunities, should still experience readable cause/effect. | Stage 1, Stage 2 safety, first challenge clarity. |
| Intermediate | `advanced` | Competent casual play. | Clears early waves more often, engages capture/rescue and challenge bonuses inconsistently. | Mid-run pressure, challenge hit rate, stage 4 fairness. |
| Expert | `expert` | Skilled player proxy. | Reaches deeper stage bands, uses better positioning, should reveal reward route viability. | Stage 12/14 reward routes, boss/squadron scoring. |
| Professional | `professional` | High-skill regression guard and release-confidence proxy. | Exploits strong routes, should not collapse from unfair timing or broken scoring. | Professional stage-2 checks, long-run progression ordering, late reward windows. |

The current canonical persona profile is
`tools/harness/reference-profiles/persona-progression-correspondence.json`.
Future docs may expose `beginner/intermediate/expert/professional` aliases in
the dashboard while keeping the historical `novice/advanced/expert/professional`
ids stable for harness compatibility.

Distribution evidence is now promoted as a first-class persona artifact:
`reference-artifacts/analyses/persona-performance-distribution/latest.json`.
The current Aurora application guide renders a 30-run-per-persona score/stage
chart and table from that artifact so one lucky or unlucky seed does not
overstate the health of the persona ladder.

## Galaxy Guardians

Galaxy Guardians is the Galaxian-style second-game preview and ingestion proof.
It has stronger extracted visual reference artifacts than Aurora's alien visual
catalog, but a much less mature playable/runtime conformance posture.

### Alien And Enemy Index

| Display name | Runtime role / visual ID | Activity and behavior | Presence | Target reference | Current conformance | Gap / next action |
| --- | --- | --- | --- | --- | --- | --- |
| Signal Flagship | `flagship`, `signal-flagship` | Top-row flagship, dives with escorts, awards higher points while diving. | Scout-wave preview; two slots. | Galaxian upper-rack alien crops in `reference-artifacts/analyses/galaxian-frame-reference/.../sprite-crops/rack-upper-aliens.jpg`; component target `reference-artifacts/analyses/galaxy-guardians-identity/sprite-component-targets-0.1/signal-flagship.png`. | Visual alien identity 6.8/10 broad score; component silhouette target similarity 1.0 but needs human/browser review. | Move from component proxy to direct sprite/crop scoring and frame-accurate flagship/escort path comparison. |
| Signal Escort | `escort`, `signal-escort` | Mid-row escort, joins flagship attacks, creates formation/dive scoring pressure. | Scout-wave preview; six slots. | Galaxian lower-field diver crops and component target `signal-escort.png`. | Same broad visual identity score; runtime escort behavior is preview-level. | Improve escort join timing, spacing, and scoring against Galaxian reference windows. |
| Signal Scout | `scout`, `signal-scout` | Lower-rack common alien, solo dives, primary shot target. | Scout-wave preview; thirty slots. | Galaxian rack and lower diver crops; component target `signal-scout.png`. | Same broad visual identity score; movement pace/lower-field pressure 6.2/10. | Tighten dive path, wrap/return cadence, and shot-density correspondence. |
| Player Interceptor | `player-interceptor` | Player ship and single-shot source. | Scout-wave preview. | Galaxian player-and-shot crops and component target `player-interceptor.png`. | Graphic alignment/player likeness included in broad 7.0/10 proxy. | Continue browser play review and exact single-shot cadence scoring. |

### Audio Cue Index

| Cue family | Runtime cue | Gameplay meaning | Target reference | Current conformance | Gap / next action |
| --- | --- | --- | --- | --- | --- |
| Formation pulse | `formationPulse` | Marks wave entry and rack establishment. | Galaxian frame-reference waveforms/spectrograms. | Audio reference comparison is proxy-level. | Add source-labeled cue windows and direct acoustic matching. |
| Player/enemy shots | `playerShot`, `enemyShot` | Single-shot player rhythm and enemy pressure. | `audio-labeled-cue-targets-0.1` waveform/spectrogram artifacts. | Local cue targets exist; release score still preview-grade. | Compare cue onset, envelope, and distinctness across local and reference windows. |
| Dive pressure | `scoutDive`, `flagshipDive`, `escortJoin`, `wrapReturn` | Teaches attack state and lower-field danger. | Galaxian reference windows: first dives, lower-field dive curves, flagship escort pressure. | Motion/audio integration still below serious release quality. | Align audio cue timing to dive start, escort join, and wrap-return events. |
| Hit/loss/game over | `scoutHit`, `escortHit`, `flagshipHit`, `playerLoss`, `gameOver` | Confirms score events, role value, and player failure. | Labeled cue target waveforms/spectrograms in `galaxy-guardians-identity`. | Preview-level; not public-ready. | Couple hit cues to score table and role-specific visual flashes. |

### Stage Index

| Stage / wave | Gameplay description | Key conformance aspects | Current evidence / metric |
| --- | --- | --- | --- |
| Wave 1 | Scout-wave preview with rack entry, single-shot player fire, scout dives. | Formation entry, single-shot constraint, readable role silhouettes. | `formation-entry-0.1`, `visual-readability-0.1`, runtime preview checks. |
| Wave 2 | Slightly higher pressure through stage-rank scaling. | Dive interval, enemy shot cadence, player safety. | `stage-rank-pressure-0.1`; still preview-grade. |
| Wave 3 | More frequent scout/flagship pressure. | Lower-field pressure and wrap/return cadence. | Movement pace score remains below release target. |
| Wave 4 | Sustained pressure and scoring differentiation. | Role-specific hit values and survival balance. | `threat-scoring-0.1`; scoring is local-preview only. |
| Wave 5+ | Current long-surface preview review band. | Progressive difficulty, later-band survivability, and bounded late-session pressure without Aurora mechanics leaking in. | `long-surface-conformance-0.1`; later-band precision is still incomplete. |

### Persona Index

Galaxy Guardians now has game-owned deterministic personas, but they are still
review tools rather than late-session authorities:

| Human label | Current intended role | Game-specific need |
| --- | --- | --- |
| Beginner | Finds whether single-shot play, scout dives, and first loss are understandable. | Keep wave-1/wave-2 survival and hit-rate baselines readable. |
| Intermediate | Tests whether the preview loop is fun and learnable. | Improve rack-finishing consistency. |
| Expert | Tests whether longer stage bands stay survivable enough to teach the next problems. | Improve stage-five-and-beyond clear consistency. |
| Professional | Tests whether the game can support mastery without unfair collapse. | Improve late-band fairness until the review harness becomes a real authoritative critic. |

### Galaxy Guardians First-Class Promotion Targets

The maintained Galaxy-specific promotion plan is:

- [GALAXY_GUARDIANS_FIRST_CLASS_CONFORMANCE_PLAN.md](GALAXY_GUARDIANS_FIRST_CLASS_CONFORMANCE_PLAN.md)
- [GALAXY_GUARDIANS_LONG_SURFACE_AND_PERSONA_PLAN.md](GALAXY_GUARDIANS_LONG_SURFACE_AND_PERSONA_PLAN.md)

Near-term first-class promotion targets:

- keep reference conformance at or above `7.7/10` while raising the
  playtest-weighted score from `6.9/10` to at least the `7.0/10` compelling
  preview floor
- move formation/rack timing and motion pressure from proxy-tuned
  `6.2/10` reads toward `7.2/10` by promoting sprite-recognized timing and
  browser-reviewed motion feel
- move visual identity from `6.8/10` reference and `6.7/10` playtest toward
  `7.2/10` through human-reviewed sprite targets and gameplay-scale review
- move audio character from `6.4/10` toward `7.0/10` through human-listened
  cue cleanup and cleaner isolated reference windows
- complete game-owned score/progression/result identity so the game validates
  Platinum changes as a second real application, not only as a preview shell

Standing aggregate parity gate:

- `npm run harness:check:galaxy-guardians-first-class-conformance`

## Platform Persona Contract

Platinum owns the persona harness substrate, not the game-specific truth behind
each persona.

The platform should provide:

- stable generic persona IDs and aliases
- controlled seeds and deterministic clock execution
- scenario registration and result comparison
- dashboard display of persona outcomes
- distribution tables and charts across repeated seeded runs
- cross-game resource/economics accounting for persona runs

Each game should provide:

- which scenarios matter for each persona
- what success, failure, score, stage depth, and confidence mean
- how the generic personas map to that game's controls, threats, and scoring
- which behaviors are allowed to differ from the reference game
- which persona outcomes block a release gate

## Maintenance Rule

When conformance work changes any alien role, audio cue, stage behavior, or
persona assumption, update this file in the same commit as the harness or game
change whenever practical. If the work is generated by long-cycle analysis, add
the generated artifact path and note whether the row is high, medium, or low
confidence.

The release path now treats catalog visibility as a gate, not a courtesy. Major
artifact families that influence conformance decisions must appear in generated
user-visible documentation or dashboard data before a lane publish check passes.
Use this catalog for game-owned rows; use the release dashboard or conformance
economics docs for release/resource rows.
