# Gameplay Audio And Visual Catalog

Status: `baseline-catalog-v1`

This catalog is the shared baseline for game-specific alien families, visual
identity, sound cues, and reference anchors across Aurora Galactica and Galaxy
Guardians. It exists so Platinum can grow multiple fixed-screen arcade games
without letting one game's art, audio, or mechanics leak into another.

## Source Rules

- Treat runtime pack data in `src/js/13-aurora-game-pack.js` as the current
  implementation source.
- Treat reference artifacts under `reference-artifacts/analyses` as evidence
  inputs, not redistributable media.
- Do not copy original game sprites or sound effects directly unless rights are
  explicitly cleared.
- Prefer semantic accuracy first: family role, color/readability, movement
  behavior, cue timing, and scoring meaning.
- Preserve separate catalogs for each game even when the shared engine currently
  reuses drawing or audio code.

## Aurora Galactica

Runtime pack key: `aurora-galactica`

Current identity:

- Aurora is the production game and may use capture/rescue, dual fighter,
  challenge stages, escort patterns, and stage theme progression.
- Its visual identity is an Aurora/platinum cabinet with evolving stage-family
  bands.
- Its current audio identity includes synthetic Aurora themes and optional
  Galaga-reference-asset alignment for measured comparison.

### Aurora Enemy Families

| Family | Runtime types | First stage band | Role |
| --- | --- | --- | --- |
| `classic` | `bee`, `but`, `boss` | stages 1-3 | baseline opening rack, dives, boss attacks |
| `scorpion` | `bee`, `but`, boss stays `classic` | stages 4-7 | early progression variation and sharper movement feel |
| `stingray` | `bee`, `but`, `boss`; challenge `dragonfly` | stages 8-11 | mid-run movement family and challenge-stage variation |
| `galboss` | `bee`, `but`, `boss`; challenge `mosquito` later | stages 12+ | late-run boss/family pressure and advanced movement identity |
| `crown` | stage presentation archetype | stages 16+ | high-tier Aurora theme progression and boss archetype framing |

Aurora-specific mechanics that must stay out of Galaxy Guardians Preview 0.1:

- capture beam
- fighter captured
- carried fighter
- rescue pod / rescue join
- dual-fighter shot model
- challenge-stage enemy groups

### Aurora Sound Cue Families

| Cue family | Runtime cue names | Current use |
| --- | --- | --- |
| start / formation | `gameStart`, `formationArrival`, `stagePulse` | stage entry and formation rhythm |
| combat | `playerShot`, `enemyShot`, `enemyHit`, `bossHit`, `enemyBoom`, `bossBoom`, `playerHit` | shot, hit, explosion, and ship-loss feedback |
| capture/rescue | `captureBeam`, `captureSuccess`, `captureRetreat`, `rescueJoin`, `capturedFighterDestroyed` | Aurora-only capture and dual-fighter loop |
| challenge | `challengeTransition`, `challengeResults`, `challengePerfect` | bonus-stage entry and results feedback |
| progression/results | `stageTransition`, `extendAward`, `gameOver`, `highScoreFirst`, `highScoreOther` | stage flow, extra ship, results, and records |
| shell/UI | `attractEnter`, `attractPulse`, `uiTick`, `uiConfirm` | Platinum shell and wait-mode interaction |

## Galaxy Guardians

Runtime pack key: `galaxy-guardians-preview`

Current identity:

- Galaxy Guardians is the second-game preview pack.
- Preview 0.1 target is `Scout Wave`: a short, honest Galaxian-inspired
  fixed-screen slice.
- It must be visually and audibly distinct enough to read as a sibling game,
  while still using original generated assets and pack-owned semantics.

### Galaxy Guardians Reference Anchors

Primary local evidence:

- `reference-artifacts/analyses/galaxian-reference/GALAXY_GUARDIANS_FIRST_PLAYABLE_PREVIEW_SPEC.md`
- `reference-artifacts/analyses/galaxian-reference/FIRST_GALAXIAN_PREVIEW_EVIDENCE_MAP.md`
- `reference-artifacts/analyses/galaxian-reference/GALAXIAN_PROGRESSION_PRESSURE_CURVE.md`
- `reference-artifacts/analyses/galaxian-reference/manifest.json`
- `reference-artifacts/analyses/galaxian-reference/nenriki-15-wave-session/promoted-windows/reference-windows.json`

Most relevant promoted windows for Preview 0.1:

- `opening-active-wave`
- `early-progression-pressure`
- `arcades-level-5-active-reference`

Useful observed/reference semantics:

- player craft: Galaxip-like horizontal ship
- top-rank enemy: flagship / Galboss-like family
- escort enemy: red alien / escort-like family
- lower ranks: bottom-rank and mid-rank alien families
- attacks: one or more aliens leave formation, dive in curved paths, fire
  projectiles, and return or exit
- scoring: assaulting enemies can score differently than formation enemies;
  exact flagship/escort scoring is not part of Preview 0.1

### Galaxy Guardians Enemy Families

| Preview family | Runtime type | Reference role | Preview 0.1 requirement |
| --- | --- | --- | --- |
| `signal-drone` | `bee` | lower-rank active alien | must have readable non-Aurora coloring/shape and regular dive pressure |
| `red-escort` | `but` | red escort-like alien | must exist as a separate family in the rack; full escort scoring can wait |
| `flagship` | `boss` | top-rank Galboss-like enemy | must exist as a visible top-rank family; exact escort attack scoring can wait |
| `none` | challenge family | no challenge stages | must not spawn challenge-stage behavior in Preview 0.1 |

Preview 0.1 visual starting point:

- player craft should read as a compact Galaxip-style horizontal ship, not the
  Aurora dual-fighter silhouette
- `signal-drone` should use a cooler lower-rank alien shape/color
- `red-escort` should be red/orange and visually distinct from `signal-drone`
- `flagship` should sit in the top rank with a broader command silhouette
- shell accent should stay `signal-crimson`
- capture/rescue graphics must never render in Galaxy Guardians

### Galaxy Guardians Sound Cue Families

Preview 0.1 should begin with a distinct sound map even before final audio
identity is finished.

| Cue family | Runtime cue names | Preview 0.1 direction |
| --- | --- | --- |
| start / wave | `gameStart`, `formationArrival`, `stagePulse` | shorter, drier scout-wave entry; avoid Aurora challenge/capture flavor |
| combat | `playerShot`, `enemyShot`, `enemyHit`, `bossHit`, `enemyBoom`, `bossBoom`, `playerHit` | crisp one-shot fire, alien projectile, and compact explosion cues |
| dive pressure | `attackCharge` | use as a measured anchor for alien dive start/pressure |
| progression/results | `stageTransition`, `gameOver` | minimal preview flow only |
| shell/UI | `attractEnter`, `attractPulse`, `uiTick`, `uiConfirm` | can share Platinum shell handling, but should resolve through the selected pack |

Forbidden in Galaxy Guardians Preview 0.1:

- `captureBeam`
- `captureSuccess`
- `captureRetreat`
- `rescueJoin`
- `capturedFighterDestroyed`
- `challengeTransition`
- `challengeResults`
- `challengePerfect`

## Cross-Game Harness Expectations

Aurora gates should continue to prove capture/rescue, challenge stages, and
dual-fighter behavior.

Galaxy Guardians gates should prove:

- one-shot player fire
- pack-owned scoring and event aliases
- no capture/rescue leak
- no challenge-stage leak
- no dual-fighter leak
- distinct preview identity hooks for enemy families and audio cue families

Current Galaxy Guardians gate additions:

- `npm run harness:check:galaxy-guardians-no-capture-leak`

That harness specifically exercises a long scripted window and a forced stale
That harness specifically exercises a live pressure window and a forced stale
capture-state probe so a future regression cannot reintroduce Aurora
capture/rescue behavior through lower-level enemy state.
