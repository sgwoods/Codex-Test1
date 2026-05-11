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
| Quality score audio category | `7.2/10` |
| Overall quality score | `9.1/10` |
| Semantic event score | `9.78/10` |
| Acoustic event score | `6.20/10` |
| Average worst segment risk | `3.80/10` |
| Cue-contract readiness | `9.09/10` |
| Contracted priority cue families | `8` cues |
| Highest current audio gap | `playerHit` tail |
| Candidate loop coverage | `8/8` contracted cues |

This means the process is now stronger than the current runtime audio. The
contracts are ready enough to guide the next work, while the implementation
still needs stronger composite-cue handling for ship loss, a calibrated
browser-capture scoring baseline, and a sharper `stagePulse` onset strategy.
The stricter composite scorer lowered the headline roll-up, which is a healthy
measurement correction rather than a runtime regression.

May 11 capture-stability and ship-loss trial pass:

- Harness improvement kept: browser-backed audio captures now include an
  explicit `80ms` recorder preroll, and candidate artifacts record capture
  attempt, byte length, capture duration, and preroll. This reduces the chance
  that short cue candidates are scored against `MediaRecorder` startup timing
  rather than the cue itself.
- Fresh `stagePulse` sweeps showed that previous low-risk synthetic candidates
  were partly measurement artifacts. Under stabilized capture, no
  `stagePulse` candidate cleared focused keeper gates; no runtime promotion was
  made.
- Impact/reward sweep found one focused `rescueJoin` keeper, but full-theme
  promotion precheck rejected it because the cue gap and worst segment risk
  worsened in context.
- Ship-loss sweep found a focused `playerHit` keeper
  (`promoted-active-window`) with risk improvement `5.06/10` and loss-composite
  score `8.82/10`. Promotion precheck allowed a runtime trial.
- Runtime `playerHit` trial was rejected and rolled back. The full-theme trial
  lowered the audio category score to `7.2/10` and did not solve the
  active-window body/tail segmentation issue.
- Persisted trial decision:
  `reference-artifacts/analyses/aurora-audio-runtime-trials/2026-05-11-44ac29aa-playerHit-rejected/report.json`

Read: `playerHit` is now the highest measured audio gap because the improved
capture path exposes that death onset/body/tail are not represented as separate
runtime-evaluable sub-events. The next valuable pass is not a shorter clip; it
is a contract-aware composite cue strategy for ship loss.

May 11 composite ship-loss scoring follow-up:

- Platform improvement kept: the runtime audio engine now supports measured
  layered cue definitions, and harness capture duration/preload logic can
  evaluate every reference clip used by a layered cue.
- Harness improvement kept: audio comparison manifests can declare an
  `analysisWindow` policy, so a composite cue can be scored over the scheduled
  onset/body/tail window rather than only the loudest active island.
- Reference correction kept: `ship-loss-compare` now scores against the
  curated death-event segment span instead of the entire source file.
- Focused candidate outcome: no `playerHit` keeper survived the updated
  whole-cue, segment, duration, band, centroid, and role-match gates.
  `segmented-loss-body-dip` was the best measured candidate, but it still
  missed the role/segment gate.
- Promotion precheck outcome: rejected. The candidate showed a possible
  full-theme cue-gap improvement, but no runtime trial is allowed until the
  focused gates clear.
- Current roll-up after refresh: overall quality `9.1/10`, audio `7.2/10`,
  semantic event score `9.78/10`, acoustic event score `6.20/10`, average worst
  segment risk `3.80/10`, highest gap `playerHit` tail at `6.19/10`.

Read: this pass improved the measuring system more than the runtime mix. It
turned "ship loss sounds wrong" into a narrower diagnosis: tail/body timbre and
browser-captured reference calibration still need work before a beta-worthy
audio promotion.

Full-grid `stagePulse` pass:

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

Targeted stability follow-up:

- Measured loop: `targeted stable low-brightness stagePulse generator pass`
- Cost: `26.041s` wall, `47.95s` CPU, `0.4 MB` artifact delta
- Measured best: `cadence-stable-two-step-pressure-pocket`
- Focused result: risk `4.41/10`, worst onset segment `6.91/10`, cadence
  pressure `2.03/10`, masking separation `1.8/10`
- Promotion precheck: rejected
- Read: simple low-gain/low-pass stabilization reduced musical pressure and
  still did not solve masking; the next family needs better envelope/phase or
  reference-subclip strategy, not merely quieter synthesis.

May 10 `stagePulse` and capture-beam follow-up:

- Broader `stagePulse` sweep cost: `562.365s` wall, `1062s` CPU,
  `22.6 MB` artifact delta
- Best isolated `stagePulse` read before runtime trial:
  `refclip-s540-d360-v105` with focused risk `2.23/10`, worst onset
  `2.48/10`, cadence pressure `6.99/10`, and masking separation `7.1/10`
- Promotion precheck result: rejected because focused keeper gates did not
  clear, even though the synthetic full-theme precheck showed large potential
  wins (`4.53/10` cue gap improvement and `4.77/10` worst-segment improvement)
- Runtime trial result: rolled back; once the trial was measured against the
  restored canonical target and built bundle, it did not clear focused keeper
  gates
- Harness improvement kept: reference-clip candidate captures now clear their
  own cooldown and active tail before measurement, so future candidate sweeps
  are less likely to mis-score a candidate because a prior reference clip was
  still active or throttled
- Capture-beam pass cost: `12.569s` wall, `20.17s` CPU, `1.1 MB` artifact
  delta
- Capture-beam measured best: `early-peak-siren`, risk `4.02/10`, worst
  segment `4.96/10`; rejected because it did not materially improve centroid
  or mid-band energy

Read: `stagePulse` is not a quick promotion. It needs a better pressure-bed
model or a better reference segmentation strategy. `captureBeam` is now the
next high-user-impact audio gap with a clear failure shape: the generator is
removing sub-bass but not adding enough mid-band identity or capture-event
clarity.

May 10 runtime recovery and inter-level phrase pass:

- Weighted-masking `stagePulse` follow-up tested stable-family and anchored-body
  candidates. The best measured candidate was
  `cadence-anchor-body-sub-support` with focused risk `3.84/10`, worst onset
  `5.55/10`, cadence pressure `3.8/10`, and masking separation `5.37/10`,
  but it failed repeat-stability gates. No runtime `stagePulse` promotion was
  made.
- Runtime user-experience fix kept: critical reference cues now record actual
  start/block history and final-loss/inter-level cues can bypass stale cooldown
  suppression when they are semantically required.
- Game-over now stops active stage/inter-level reference beds before playing the
  final loss ambience, reducing the risk that a transition phrase masks or
  suppresses the death/game-over read.
- Normal inter-level phrase coverage was widened: `stageTransition` moved from
  `2.8s` to `3.35s`. Challenge result phrases were also widened
  (`challengeResults` `1.55s -> 1.95s`, `challengePerfect` `1.7s -> 2.15s`)
  while cue-alignment still passes `9/9`.
- New guardrail: `npm run harness:check:audio-runtime-recovery` verifies that
  `stageTransition`, `playerHit`, `gameOver`, and the next `gameStart`
  actually start in the browser runtime, with no critical idle/mute/cooldown
  blocks.
- Measured outcome: overall quality remains `9.2/10`; audio now reads
  `7.1/10`; `stagePulse` remains the highest risk cue at `5.14/10`.

May 10 challenge-transition UX and stagePulse stability pass:

- Challenge-entry announcement coverage was widened without moving the cue start:
  `challengeTransition` moved from a `1.05s` excerpt to `1.6s`.
- The challenge-entry window was widened from `2.8s` to `3.35s`, increasing
  spawn-after-cue from `0.583s` to `1.133s` while preserving the measured
  challenge cue tail-past-spawn relationship at `0.467s`.
- Audio cue alignment still passes `9/9`; challenge-stage timing still passes
  `5/5`; the overall quality score remains `9.2/10`.
- The timing-library builder now derives challenge-entry targets from the
  current audio-overlap probe when available, so a measured UX target refresh is
  not blocked by missing old-machine video paths.
- The audio-alignment scorer now distinguishes target risk from intentional
  baseline drift: `worstCurrentRiskDelta` is `0` even though the production
  baseline drift is `0.55s`.
- StagePulse stability-first candidates and direct reference-window candidates
  were both rejected. The best reference-window attempt was
  `refclip-s660-d240-v86`, but it missed cadence pressure and repeat-stability
  gates. No runtime `stagePulse` promotion was made.
- Current rollup: audio remains `7.1/10`; acoustic event score is `6.07/10`;
  semantic event score is `9.78/10`; `stagePulse` remains the highest risk cue
  at `5.34/10`.

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

The next high-value audio pass should split into two measured tracks:

- `playerHit` tail/body composite modeling: create a tail-specific candidate
  family and a browser-capture calibration baseline so reference-backed cues
  are not penalized for capture/encoding differences rather than real game
  sound differences
- `stagePulse` pressure-bed modeling: a stronger low-brightness, low-variance
  generator that explicitly targets repeat stability, zero-crossing calm,
  cadence pressure, and action-cue masking before promotion precheck
- `challengeTransition` follow-up listening pass: the measured `1.6s` phrase is
  now runtime-safe, so the next check should be human/gameplay review rather
  than further widening
- `captureBeam` event clarity: candidates that add mid-band identity, clearer
  rise/hold/tail segmentation, and better player meaning during capture/rescue
  moments
- Both tracks must preserve masking guards against `playerShot`, `enemyHit`,
  `enemyBoom`, `bossHit`, and `bossBoom`
- Full-theme promotion precheck remains a hard gate before runtime changes
