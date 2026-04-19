# Aurora Correspondence Framework

This document describes how to estimate correspondence between:

- original reference games such as `Galaga`
- future reference games such as `Galaxian`
- shipped Aurora baselines
- current Aurora candidates

Use it when the question is not just "does this feel right?" but:

- how can we measure whether it corresponds to reference behavior
- how can we compare a candidate against a shipped baseline
- how can we produce durable artifacts instead of relying on memory

## Purpose

The goal is to move beyond simple manual comparison.

Manual play and judgment still matter, especially for feel, pacing, and
presentation.

But whenever possible, correspondence should be supported by:

- deterministic scenarios
- event logs
- timing metrics
- structured comparison reports
- durable reference artifacts

That makes fidelity work repeatable and reviewable.

## Comparison Layers

Correspondence should be estimated in layers.

### 1. Timing Correspondence

Compare the timing of important event families against reference material.

Examples:

- game-start phrase duration
- first visible formation arrival
- first dive start
- lower-field crossing
- stage-clear handoff
- challenge-stage setup and result timing
- cue onset timing

Outputs:

- event delta in seconds
- average and worst-case timing drift
- pass/fail against a tolerance band

### 2. Sequence Correspondence

Compare the order and structure of events, not just their timestamps.

Examples:

- attack-start order
- escort composition
- capture/rescue transition order
- challenge-stage event structure

Outputs:

- expected sequence
- observed sequence
- missing events
- extra events
- out-of-order events

### 3. Outcome Correspondence

Compare whether the same setup produces the same family of result.

Examples:

- close-range descending enemy dies on visible shot
- capture-window shot breaks capture when it should
- rescue path rejoins correctly
- late-stage survivability remains within expected bounds

Outputs:

- success/failure counts
- expected outcome vs observed outcome
- regression notes relative to a shipped baseline

### 4. Spatial Correspondence

Compare positions, spacing, lane behavior, hit windows, and motion envelopes.

Examples:

- formation rack geometry
- stage-opening spacing
- lane occupancy
- hitbox alignment
- dive crossing positions

Outputs:

- coordinate deltas
- lane deltas
- spacing metrics
- envelope overlap summaries

### 5. Visual Correspondence

Compare selected rendered moments against reference captures.

Examples:

- stage opening frames
- starfield density and brightness
- sprite readability
- challenge-stage presentation

Outputs:

- contact sheets
- fixed-time or fixed-event snapshots
- brightness / density summaries
- simple contrast or occupancy metrics

### 6. Audio Correspondence

Compare cue timing, cue-family mapping, and overlap behavior.

Examples:

- game-start phrase timing
- shot cue onset
- stage-transition cue timing
- challenge perfect/result phrasing

Outputs:

- cue onset delta
- cue-slot coverage
- overlap budget comparison
- missing or mistimed cue families

### 7. Persona And Progression Correspondence

Compare how the game behaves for different player personas and across later
stages.

Examples:

- novice survivability
- intermediate progression depth
- advanced late-run survivability
- challenge hit-rate progression
- loss clustering and score flow

Outputs:

- stage reach distributions
- score distributions
- loss-cause distributions
- challenge outcome summaries
- progression-curve notes

## Preferred Workflow

For each fidelity or gameplay topic:

1. identify the reference source
2. identify the Aurora baseline to compare against
3. define the event family or scenario to measure
4. run a deterministic or repeatable harness scenario when possible
5. generate comparison artifacts
6. summarize drift and tolerance
7. decide whether the difference is:
   - intended variation
   - acceptable drift
   - a likely regression

## Comparison Targets

We should support at least these comparison modes:

### Reference vs Candidate

Use when asking:

- how close is Aurora to original `Galaga`
- how close is the future second game to original `Galaxian`

### Stable Baseline vs Candidate

Use when asking:

- did the current candidate regress from the shipped line
- did later work drift away from a previously trusted implementation

### Forward Line vs Recovered Work

Use when asking:

- how does recovered local work differ from current `main`
- what should be integrated into a controlled candidate

## Tolerance Philosophy

Not every category should be equally strict.

Recommended default:

- rules and outcomes:
  - strict
- event ordering:
  - strict
- timing:
  - moderate but explicit tolerance bands
- visuals and audio:
  - metric-guided plus manual review
- persona and progression:
  - distribution-based, not exact-equality based

If a category is intentionally allowed to vary, document:

- why variation is acceptable
- how far variation may go
- how we know it still feels true enough

## Artifact Types

Preferred durable outputs:

- machine-readable reference profiles
- scenario logs
- event-family timing reports
- markdown summaries
- JSON summaries
- contact sheets
- captured clips
- cue matrices
- waveforms
- run-analysis reports

These artifacts should live in reference-analysis or harness-artifact trees in a
way that later work can reuse.

## What To Build Next

The next useful step is not to automate everything at once.

It is to build one complete end-to-end example.

Recommended first candidate:

- `stage1 opening / first dive timing`

For that example, we should define:

1. a reference profile
2. a deterministic scenario
3. a baseline comparison target
4. a candidate comparison target
5. a comparison report format

After that, expand to:

- capture / rescue
- challenge stages
- audio cue timing
- persona / progression evidence
- later `Galaxian` reference families

## Relation To Project Principles

This framework supports the broader development philosophy:

- bug fixes should leave behind harness or artifact evidence
- fidelity work should begin with measured references where possible
- platform and application changes should be assessed without blurring the seam
- tribute quality should be explainable, not only felt

Manual comparison still matters.

The goal is simply to make it the final validation step rather than the only
one.
