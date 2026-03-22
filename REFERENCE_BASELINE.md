# Reference Baseline

This document defines how we turn original Galaga behavior into actionable work
for this project.

## Goal

Create a durable, repeatable baseline for:

- how original Galaga behaves
- how our game differs
- what issue or milestone that difference should map to
- how improvement will be measured

## Source Priority

1. Manual / cabinet-era rule documents
2. Original gameplay footage
3. Emulator captures when available
4. Secondary written references

## Working Process

For each fidelity topic:

1. Identify the source artifact
2. Capture the specific observed behavior
3. Write the current project behavior
4. Define the gap
5. Link the gap to:
   - a GitHub issue
   - a harness scenario or metric
   - a target release / roadmap milestone if applicable

## Current Baseline Topics

### Stage 1 Dive Timing

- Source:
  - original gameplay video
- Current metric:
  - `stage1-descent` harness scenario
- Current use:
  - compare first dive timing and lower-field crossing against original footage

### Challenge Stage Fidelity

- Source:
  - manual-backed structure
  - original challenge-stage footage
  - `/Users/stevenwoods/Documents/Codex-Test1/reference-artifacts/analyses/first-challenge-stage/README.md`
- Current metrics:
  - `stage3-challenge`
  - challenge hit rate
  - average upper-band dwell time per target
- Current rule note:
  - challenge stages are currently treated as non-lethal bonus rounds, which
    matches our present reading of the reference material for `#33`
- Active gap:
  - visual and timing fidelity still not close enough to original Galaga

### Capture / Rescue / Dual Fighter

- Sources:
  - manual
  - gameplay footage
- Current metrics:
  - `rescue-dual`
  - `capture-rescue-dual`
  - `carried-boss-diving-release`
  - `carried-boss-formation-hostile`
  - `second-capture-current`
  - `natural-capture-cycle`
  - `stage4-capture-pressure`
  - carried-fighter scoring scenarios
- Active gaps:
  - remaining rescue usefulness / edge-case fidelity
  - Stage 4-specific capture pressure still needs stronger measurement and tuning
  - manual-backed confidence is currently strongest for:
    - killing the boss while it is attacking recovers dual fighters
    - shooting the carried fighter itself destroys it for points
  - current implementation now follows that attacking-boss branch more directly:
    - diving boss kill releases the captured fighter into an automatic rejoin path
    - in-formation boss kill spawns an immediate hostile captured fighter branch
  - the exact hostile / in-formation branch still needs stronger primary-source confirmation against original gameplay footage or emulator capture

### Post-1.0 Scoring / Special Pattern Research

- Sources:
  - manual
  - original gameplay footage
  - future emulator captures
- Current state:
  - special attack squadron bonus logic exists, but we do not yet have enough
    evidence to claim original-accurate timing/composition for the bonus-yielding
    three-fighter attack clusters seen in regular play
- Planned follow-up:
  - capture stronger evidence after 1.0 and map exact appearance timing,
    composition, and scoring behavior before expanding that system further

Important near-term exception:

- for the scoped four-stage `1.0`, the game should still visibly demonstrate the
  classic boss-with-two-escorts special attack and show the resulting bonus in
  normal play, even if deeper late-game pattern research stays post-`1.0`

### Later-Stage Variety

- Sources:
  - walkthrough notes
  - later gameplay footage
- Current metrics:
  - `stage12-variety`
  - stage profile / family logging
- Current state:
  - first stage-band pass is in
  - deeper transform / family fidelity is still follow-up work

### Later-Stage Survivability

- Sources:
  - original gameplay footage
  - our harness diagnostics
  - `/Users/stevenwoods/Documents/Codex-Test1/reference-artifacts/analyses/stage4-fairness/README.md`
- Current metrics:
  - `stage4-five-ships`
  - `stage4-survival`
- Active gap:
  - later-stage collision fairness and progression depth

### External Implementation References

- These are architecture/presentation references, not original-Galaga rules
  sources.
- Current external reference:
  - `/Users/stevenwoods/Documents/Codex-Test1/reference-artifacts/analyses/external-galaga5/README.md`
- Use case:
  - borrow ideas about structure or presentation when useful
  - do not treat them as fidelity evidence

## What To Add Next

High-value future baseline additions:

1. Emulator-derived captures and timing notes
2. Curated reference clips by system:
   - first challenge stage
   - first capture
   - first rescue
   - later-stage pressure
3. Issue-by-issue reference mapping so open fidelity issues point directly at evidence

## Collaboration Rule

When a gameplay-fidelity issue is opened or worked, it should eventually point
back to at least one entry in this document or to a durable source under:

- `/Users/stevenwoods/Documents/Codex-Test1/reference-artifacts/`
