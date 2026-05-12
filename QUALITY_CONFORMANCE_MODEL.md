# Quality Conformance Model

This model gives Aurora a persistent, repeatable quality score instead of
relying only on narrative judgment. It is not intended to replace manual review.
It is intended to:

- expose the biggest current gaps against reference evidence
- show whether a candidate is materially stronger or weaker than expected
- help decide what belongs in the next `/dev`, `/beta`, and `/production` path

The score is deliberately evidence-first:

- use correspondence reports when they exist
- use targeted harnesses for regression-sensitive behavior
- use level-arc analysis for stage-family shape, encounter variety, pressure
  over time, and long-run non-repetition
- use reference-audio analyses where direct runtime reports are not yet richer
- use surface integrity checks for shell, graphics, and panel stability

## Ingestion As A Conformance Input

Ingestion is the front half of the conformance system.

For new-game and major-fidelity work, metrics should be promoted from
game-owned ingestion evidence:

- source manifests and provenance notes
- clipped reference windows
- contact sheets, motion traces, waveforms, and spectrograms
- reference-side event logs
- semantic slice profiles
- confidence and uncertainty notes
- generated correspondence targets

The model may help plan algorithms, label evidence, and propose scorers, but
the score should move because a rerunnable artifact says it moved.

For new games, the first playable candidate should cite an ingestion package
before it becomes a release claim. Platinum may present the resulting scorecard
and dashboard, but the game owns the reference truth, metric definitions, and
runtime correspondence evidence.

## Current Categories

Each category scores from `1` to `10`.

1. `Player movement conformance`
   - Evidence:
     - `tools/harness/check-player-movement-conformance.js`
   - Focus:
     - tap correction
     - hold travel
     - reversal
     - movement while firing
     - jerkiness / frame-step smoothness

2. `Shot and hit responsiveness`
   - Evidence:
     - `tools/harness/check-close-shot-hit.js`
     - movement-plus-fire timing from the movement conformance report
   - Focus:
     - trust in the visible shot
     - whether moving fire still emits promptly

3. `Stage-1 opening timing fidelity`
   - Evidence:
     - `reference-artifacts/analyses/correspondence/stage1-opening-first-dive/*/report.json`
   - Focus:
     - first pulse
     - first attack
     - first lower-field crossing

4. `Stage-1 opening geometry fidelity`
   - Evidence:
     - `reference-artifacts/analyses/correspondence/stage1-opening-spacing/*/report.json`
   - Focus:
     - rack spacing
     - layout drift
     - target position stability

5. `Dive fairness and safety`
   - Evidence:
     - `tools/harness/check-persona-stage2-safety.js`
   - Focus:
     - avoidable early collision regressions
     - dive windows remaining survivable for the intended persona ladder

6. `Capture and rescue rule fidelity`
   - Evidence:
     - `reference-artifacts/analyses/correspondence/capture-rescue/*/report.json`
   - Focus:
     - early shot escape
     - late capture
     - escape recovery

7. `Challenge-stage timing fidelity`
   - Evidence:
     - `reference-artifacts/analyses/correspondence/challenge-stage-timing/*/report.json`
   - Focus:
     - challenge entry
     - results timing
     - perfect transition timing

8. `Progression and persona depth`
   - Evidence:
     - `reference-artifacts/analyses/correspondence/persona-progression/*/report.json`
     - `reference-artifacts/analyses/persona-performance-distribution/latest.json`
   - Focus:
     - per-persona guardrails
     - ordering of the persona ladder
     - whether higher-skill personas still show deeper / stronger runs
     - score, stage, time-alive, loss, and challenge-hit distributions over repeated seeded runs

9. `Boss entry and formation grammar`
   - Evidence:
     - `tools/harness/analyze-formation-boss-grammar-conformance.js`
     - `tools/harness/reference-profiles/formation-boss-grammar-conformance.json`
     - `reference-artifacts/analyses/formation-boss-grammar-conformance/*/report.json`
   - Focus:
     - boss entry timing by stage band
     - boss and escort composition
     - set-formation settle evidence
     - challenge-stage pattern identity
     - stage-to-stage formation variation
     - path-shape and formation-slot precision as explicit measurement debt

10. `Level arc and encounter shape`
   - Evidence:
     - `reference-artifacts/analyses/level-arc-conformance/*/report.json`
     - `reference-artifacts/analyses/stage-signature-distance/*/report.json`
     - `reference-artifacts/analyses/formation-boss-grammar-conformance/*/report.json`
     - `reference-artifacts/analyses/aurora-level-expansion-cycle`
   - Focus:
     - stage distinctiveness over time
     - challenge-stage identity and bonus-opportunity learning
     - movement grammar expansion
     - boss entry and formation grammar
     - boss and reward opportunity design
     - pressure curves across early, middle, later, and challenge windows
     - long-run non-repetition

11. `Audio identity and cue alignment`
   - Evidence:
     - `reference-artifacts/contracts/audio/aurora-audio-cue-contracts.json`
     - `reference-artifacts/analyses/aurora-audio-cue-contracts/*/report.json`
     - `reference-artifacts/analyses/aurora-audio-conformance-lab-v2/*/report.json`
     - `reference-artifacts/analyses/aurora-audio-theme-comparison/*/metrics.json`
     - `reference-artifacts/analyses/aurora-audio-event-gap/*/report.json`
     - `reference-artifacts/analyses/aurora-audio-promotion-precheck/*/report.json`
     - `reference-artifacts/analyses/galaga-audio-overlap/*/metrics.json`
   - Focus:
     - cue contract fit: semantic meaning, timing slot, acoustic identity,
       runtime context, and theme latitude
     - cue identity against reference-inspired target sound
     - active cue-window similarity against labeled Galaga reference clips
     - reference-window precision, so broad clips do not silently masquerade as
       isolated cue matches
     - promotion safety from focused candidate loop to full-theme precheck to
       live runtime recapture
     - stage / challenge timing windows for cue overlap and handoff

12. `UI, shell, and graphics integrity`
    - Evidence:
      - `tools/harness/check-dev-candidate-surface-suite.js`
    - Focus:
      - front door
      - panels
      - dock actions
      - graphics options
      - attract / leaderboard / score surfaces
      - audio shell surfaces

## Interpretation

- `9-10`: strong / release-worthy in that category
- `7-8.9`: solid, but still worth tuning
- `5-6.9`: functional with visible or measurable gaps
- `3-4.9`: meaningfully behind the intended standard
- `1-2.9`: clearly weak and likely release-shaping

The roll-up score is the simple average of the twelve category scores so that the
low-scoring gaps stay visible.

A `10/10` means "maxed at current scorer resolution", not perfect imitation.
If ingestion improves the reference evidence or the scorer becomes more precise,
that same behavior may be rescored with a more demanding metric.

## Current Caveats

- `Player movement conformance` is currently phase-one evidence:
  - it is grounded in the documented control principles
  - it is not yet a full trace extraction from the preserved Galaga footage
- `Audio identity and cue alignment` now has a formal cue-contract layer. The
  current process is stronger and has now promoted one calibrated layered
  `playerHit` runtime lift. Semantic audio is high, but acoustic event fit,
  residual ship-loss tail shape, and `stagePulse` pressure-bed onset remain the
  measured weak points. A candidate is not release-promotable until it survives
  focused scoring, full-theme precheck, live recapture, alignment, semantic,
  and quality gates.
- `Level arc and encounter shape` now includes first-pass stage-signature
  distance scoring, but it still needs broader mid-run and late-run evidence
  windows before the repetition penalty should be treated as complete
- `Boss entry and formation grammar` is now a first-class scored family. Its
  timing, composition, and challenge-identity reads are useful now, while true
  path-shape and rack-slot conformance remains intentionally low-confidence
  until frame-level boss/escort/challenge path extraction is promoted.
- The model is meant to be expanded, not treated as finished

The main rule is simple:

- if the score moves, the evidence should say why
- if a category is weak, the next release plan should say whether we are fixing
  it now or deferring it intentionally
