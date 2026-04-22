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
- use reference-audio analyses where direct runtime reports are not yet richer
- use surface integrity checks for shell, graphics, and panel stability

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
   - Focus:
     - per-persona guardrails
     - ordering of the persona ladder
     - whether higher-skill personas still show deeper / stronger runs

9. `Audio identity and cue alignment`
   - Evidence:
     - `reference-artifacts/analyses/aurora-audio-theme-comparison/*/metrics.json`
     - `reference-artifacts/analyses/galaga-audio-overlap/*/metrics.json`
   - Focus:
     - cue identity against reference-inspired target sound
     - stage / challenge timing windows for cue overlap and handoff

10. `UI, shell, and graphics integrity`
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

The roll-up score is the simple average of the ten category scores so that the
low-scoring gaps stay visible.

## Current Caveats

- `Player movement conformance` is currently phase-one evidence:
  - it is grounded in the documented control principles
  - it is not yet a full trace extraction from the preserved Galaga footage
- `Audio identity and cue alignment` is partly reference-analysis based and not
  yet a full runtime cue-by-cue correspondence family
- The model is meant to be expanded, not treated as finished

The main rule is simple:

- if the score moves, the evidence should say why
- if a category is weak, the next release plan should say whether we are fixing
  it now or deferring it intentionally
