# Movement Reference Trace Plan

This plan starts the next movement-analysis cycle from preserved footage windows instead of more blind constant tuning.

## Why This Exists

Two movement-smoothing passes already showed that changing constants without stronger reference traces can:

- worsen movement conformance
- risk gameplay regressions
- burn time without improving release readiness

The next movement pass therefore starts with trace extraction.

## Trace Families To Extract

### 1. Tap Correction

Question:

- how far does the ship move in the original for a short directional tap, and how quickly does it settle?

Measures to extract:

- displacement after tap
- time to settle after release
- visible frame-step smoothness

### 2. Hold Travel

Question:

- how fast does the ship cover lane distance under a held input?

Measures to extract:

- displacement after sustained hold
- average travel rate
- time from hold start to first visibly stable cruise phase

### 3. Reversal

Question:

- how quickly can the ship reverse direction and cross back through center?

Measures to extract:

- reversal latency
- center-cross time
- overshoot behavior after reversal

### 4. Movement While Firing

Question:

- does firing interrupt or visually distort movement cadence compared with reference play?

Measures to extract:

- time from move state to shot event
- travel distance after shot
- whether firing visibly stalls the ship

### 5. Lane-Correction Rhythm

Question:

- how often do skilled runs use small corrections rather than long sweeps?

Measures to extract:

- correction frequency in selected early-stage windows
- average correction amplitude
- relationship between corrections and dive-response moments

## Best Existing Source Families

Start with these preserved sources:

1. `reference-artifacts/analyses/galaga-stage-reference-video`
   - best current anchor for stage-opening and visible ship motion timing
2. `reference-artifacts/analyses/release-reference-pack`
   - useful later-stage windows once stage-opening traces are established
3. original gameplay captures named in `release-reference-pack/README.md`
   - strongest known local video anchors for direct movement-window extraction

## First Extraction Targets

The first pass should stay small and target one stable opening context:

1. early stage-opening lane correction
2. short hold travel in a low-pressure opening window
3. one reversal immediately before or during a visible early dive response
4. one firing-while-moving window in the same opening family

This is enough to turn movement work from abstract principle into a trace-backed comparison loop.

## Outputs To Create

The movement trace pass should produce:

1. a committed trace profile
   - source windows, expected measures, tolerances
2. a generated trace-analysis directory
   - extracted frames or contact sheets
   - trace notes
   - machine-readable metrics if available
3. an updated movement-conformance check
   - once the trace family is stable enough to score against

## Release Use

Movement should not block the next `/beta` if the current line is otherwise strong and movement remains stable.

But before we claim movement as a release improvement, we should be able to point to:

- a preserved source window
- a trace profile
- a measured Aurora comparison

That is the minimum durable evidence bar for the next movement pass.
