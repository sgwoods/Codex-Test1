# Platinum Audio Conformance Lab

The Platinum audio conformance lab is the shared workflow for improving game
audio from measured reference evidence instead of subjective tuning alone.
`Galaxy Guardians` is the first registered consumer, but the harness is designed
so Aurora and future game packs can use the same pattern.

## Principle

Game packs own their cue recipes and semantic cue catalogs. Platinum owns the
repeatable analysis path:

- register the game pack and audio theme in `tools/harness/audio-conformance-games.js`
- load promoted reference cue windows and runtime cue recipes
- synthesize the runtime cues in a deterministic CPU-only renderer
- compare runtime cues against promoted reference windows
- export JSON metrics plus waveform/spectrogram PNG previews
- keep raw copyrighted reference audio out of source control

Common audio analysis belongs in Platinum harness utilities, not inside a
single game. Game-specific inputs are configuration and artifacts.

## Current Guardians Baseline

The first Guardians lab artifact is:

`reference-artifacts/analyses/audio-conformance-lab/galaxy-guardians-preview/audio-conformance-lab-0.1.json`

Readable report:

`reference-artifacts/analyses/audio-conformance-lab/galaxy-guardians-preview/audio-conformance-lab-0.1.md`

Current result:

| Metric | Score |
|---|---:|
| Runtime cue lab score | `8.3/10` |
| Guardians reference conformance | `7.7/10` |
| Guardians playtest-weighted conformance | `6.9/10` |
| Compelling preview target | `7.0/10` |

The lab score is intentionally not the public audio score. It says the current
runtime cue recipes are much closer to the promoted reference-window shapes. The
playtest score remains below the compelling-preview target until human listening
confirms the cue windows and live mix.

## Commands

```sh
npm run harness:analyze:galaxy-guardians-audio-conformance-lab
npm run harness:check:galaxy-guardians-audio-conformance-lab
npm run harness:analyze:aurora-audio-cue-contracts
npm run harness:analyze:aurora-audio-conformance-lab-v2
npm run harness:analyze:aurora-audio-promotion-precheck -- --cue=stagePulse
```

Generic form:

```sh
npm run harness:analyze:platinum-audio-conformance-lab -- --game galaxy-guardians-preview
npm run harness:check:platinum-audio-conformance-lab -- --game galaxy-guardians-preview
```

## Add Another Game

1. Add a game registration in `tools/harness/audio-conformance-games.js`.
2. Point it at the pack source, pack global, audio theme, candidate cue names,
   and reference artifacts.
3. Promote source cue windows into a labeled cue artifact.
4. Run the generic analyzer and checker.
5. Update that game's candidate/conformance docs with the lab artifact.

## Next Audio Work

The next Guardians pass should be a human listening review of the generated
runtime/reference cue preview pairs. Mark each reference window as clean or
dirty, replace dirty windows, then retune the runtime mix and event density in
live browser play.

## Current Aurora Audio Read

Aurora now uses a cue-contract layer in addition to waveform/spectral analysis.
The contract layer keeps each cue tied to five obligations:

- semantic meaning: what the player should understand
- timing slot: trigger, cooldown, stop behavior, overlap, and tail budget
- acoustic identity: duration, onset/body/tail, centroid, band shape, and
  envelope
- runtime context: whether the cue survives real gameplay mix pressure
- theme latitude: what can vary in Aurora or later theme packs without breaking
  arcade readability

This matters because the latest `rescueJoin` pass proved that isolated cue
similarity is not enough. A candidate can look useful in a focused sweep and
still fail the live theme once recaptured. Runtime promotion now requires both
contract readiness and live validation.

Current artifact:

`reference-artifacts/analyses/aurora-audio-cue-contracts/latest.json`

Current lab artifact:

`reference-artifacts/analyses/aurora-audio-conformance-lab-v2/latest.json`

Current result:

| Metric | Value |
|---|---:|
| Quality score audio category | `6.8/10` |
| Overall quality score | `9.2/10` |
| Semantic event score | `9.78/10` |
| Acoustic event score | `5.6/10` |
| Average worst segment risk | `4.4/10` |
| Cue-contract readiness | `9.09/10` |
| Contracted priority cue families | `8` cues |
| Highest current audio gap | `stagePulse` onset |
| Candidate loop coverage | `8/8` contracted cues |

This means the process is now stronger than the current runtime audio. The
contracts are ready enough to guide the next work, while the implementation
still needs a sharper `stagePulse` onset strategy and composite-cue handling for
ship loss.

Latest `stagePulse` pass:

- Measured loop: `contract-aware stagePulse masking candidate loop`
- Cost: `373.244s` wall, `703.97s` CPU, `13.7 MB` artifact delta
- Measured best: `soft-attack-low-march`
- Focused result: risk `3.62/10`, worst onset segment `5.3/10`, cadence
  pressure `4.59/10`, masking separation `3.88/10`
- Promotion precheck: rejected
- Why rejected: the candidate improved local risk and would improve full-theme
  cue gap by `0.72/10`, but it failed masking separation and repeat-stability
  gates

That is a useful near miss, not a runtime change. It tells us the next generator
must reduce transient brightness and measurement variance while keeping the
low-band pressure body.

## Cue Contract Promotion Rule

Runtime audio cannot be promoted from a focused candidate loop alone.

A candidate must pass:

1. cue contract fit: player meaning, timing slot, acoustic shape, runtime
   context, and theme latitude
2. focused candidate gates: segment risk, duration, centroid, band shape,
   stability, and role match
3. full-theme promotion precheck
4. live runtime recapture
5. cue alignment, semantic score, acoustic event score, and overall quality
   guardrails

Rejected candidates are preserved as useful evidence. They explain whether the
next pass needs better reference segmentation, a new generator strategy, or a
runtime/mix model rather than another subjective tweak.

## Theme Latitude

The lab now distinguishes three audio lanes:

| Lane | Use | Constraint |
| --- | --- | --- |
| `referenceConformant` | closest Galaga-like mode and release-gate evidence | keep event meaning, timing slot, and acoustic segment shape close to reference |
| `genreConformant` | arcade-faithful Aurora defaults | allow synthesis and pitch/color changes while preserving fixed-screen arcade readability |
| `auroraVariant` | future theme packs and richer presentation | allow musical identity only when hit/kill/loss/reward/pressure remain unmistakable |

The important idea is that variation is allowed, but it must be measured against
declared cue obligations. A theme can be different without becoming ambiguous.

## Next Aurora Audio Work

The next high-value pass is a stronger `stagePulse` pressure-bed generator:

- reduce transient brightness headroom against `playerShot`, `enemyHit`,
  `enemyBoom`, `bossHit`, and `bossBoom`
- reduce repeat variance across risk, centroid, zero crossing, band shape, and
  RMS
- keep cadence pressure above the current near miss
- keep full-theme promotion precheck as a hard gate before runtime changes
- if this still fails, pivot to impact/explosion cues for higher user-perceived
  feedback return while preserving the stagePulse evidence
