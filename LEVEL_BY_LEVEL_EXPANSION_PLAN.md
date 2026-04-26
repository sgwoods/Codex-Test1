# Aurora Level-By-Level Expansion Plan

This document turns the roadmap decision around Aurora arcade depth into the
next concrete execution plan.

It exists because level-by-level game detail is now a first-class product goal,
not a later polish idea. Aurora should grow enough stage variety, challenge
content, alien behavior, movement texture, and shared gameplay evidence to stand
beside the original Galaga reference with more confidence.

## Decision

The next product direction is:

- keep `1.3` as the measurement-backed quality reset
- use `1.3` to produce the first committed level-expansion blueprint
- make `1.4` the first major level-by-level arcade-depth release
- make `1.5` the shared gameplay-video and flight-recorder release
- bring a second-game Platinum sneak peek forward after those foundations, so
  Platinum gets real multi-game pressure before `2.0`

This means the immediate work is not just "tune the current loop." It is:

1. restore trustworthy gates
2. map the original reference complexity we want to model
3. choose the first small but visible stage/challenge expansion slice
4. create the video/evidence path that lets users and developers compare runs
5. use the second-game preview to keep Platinum honest

## Why This Is Important

Aurora has a strong shipped baseline, but the game still needs more depth across
the run.

The most important gaps are:

- challenge stages are not yet interesting enough
- challenge stages need distinct alien types, movements, scoring pressure, and
  presentation states
- later stages need more varied entry styles, attack pacing, movement texture,
  escort behavior, and pressure curves
- self-play and manual play need enough survivability evidence to show that
  added depth does not simply create unfair collapses
- gameplay videos need to become shareable reference material, not just local
  debug artifacts
- Platinum needs an earlier second-game preview so platform seams are tested by
  something real

## Immediate Next Branches

### 1. `codex/macbook-pro-audio-phase-gate`

Purpose:

- restore or recalibrate the currently failing audio phase harness so the
  quality roll-up can be trusted again

Why first:

- future level-expansion work should land against a working measurement system
- if quality score gates are noisy, we will not know whether later changes
  improved or damaged the line

Expected outputs:

- passing or intentionally revised `harness:check:audio-theme-phases`
- passing or clearly documented `harness:score:quality-conformance`
- notes in the scorecard if the quality model changed

### 2. `codex/macbook-pro-level-expansion-plan`

Purpose:

- create the first detailed Aurora stage-family map and expansion target list

Expected outputs:

- stage-family map for early, middle, later, and challenge stages
- first target challenge-stage expansion slice
- first target later-level entry/movement slice
- list of alien families and movement behaviors to model first
- mapping to reference footage/manual evidence and harness needs

This should not be a giant implementation branch. It should produce the
blueprint that makes the implementation branch small enough to review.

Use the same promoted-window method now being built for the Galaxian preview.
Before adding new Aurora stage content, collect an opening baseline, a
challenge-stage candidate, a mid-run pressure window, and a late-run cleanup or
failure window. The bridge document is:

- [CLASSIC_ARCADE_ANALYSIS_TO_AURORA_EXPANSION_BRIDGE.md](CLASSIC_ARCADE_ANALYSIS_TO_AURORA_EXPANSION_BRIDGE.md)

### 3. `codex/macbook-pro-challenge-stage-depth`

Purpose:

- implement the first visible challenge-stage expansion slice

Candidate scope:

- one new challenge-stage alien family or visual variant
- one new movement pattern
- clearer bonus-stage presentation
- a scoring or timing rule that makes the stage feel less uniform
- harness coverage for the new pattern and outcome

Exit standard:

- the challenge stage feels more like a distinctive bonus-stage moment
- the added content is measurable and does not break existing challenge
  correspondence

### 4. `codex/macbook-pro-later-level-entry-variation`

Purpose:

- add one later-level entry or movement variation family

Candidate scope:

- alternate formation entry timing
- different dive setup cadence
- escort or regrouping variation
- later-level pressure curve tuned against self-play and reference evidence

Exit standard:

- at least one later-level window has visible behavioral variety
- self-play does not collapse from unfair pressure
- harness output can describe what changed

### 5. `codex/macbook-pro-shared-video-catalog`

Purpose:

- make gameplay videos publishable and referenceable between users

Expected outputs:

- decision on storage target:
  - GitHub release/artifact repository
  - public catalog metadata committed in Codex-Test1
  - external storage with committed manifest
- stable metadata schema for run videos
- link path from score records, issues, and release notes to videos
- minimal viewer/catalog path for recent or curated runs

Exit standard:

- a selected gameplay run can be exported, cataloged, shared, and cited from an
  issue or doc

### 6. `codex/macbook-pro-second-game-preview`

Purpose:

- create a preliminary second-game Platinum preview to pressure-test the
  platform layer before full `2.0`

Candidate direction:

- start with a `Galaxian`-style sibling proof because it is close enough to
  Galaga-family mechanics to validate Platinum without requiring a totally new
  genre

Exit standard:

- the second-game preview launches through Platinum
- preview status is explicit
- storage, controls, shell copy, and pack metadata do not silently reuse Aurora
  assumptions

## First Level-Expansion Blueprint

The `level-expansion-plan` branch should answer these questions before broad
implementation begins.

### Stage Family Map

Define the first Aurora stage families:

- Stage 1: reference opening, learning baseline, early dive trust
- Stage 2: first pressure increase, survivability check
- Stage 3 or first challenge: bonus-stage transition and challenge identity
- Middle stages: wider entry and escort variation
- Later stages: higher attack pressure without unfair collision collapse
- Long-run stages: runtime stability and score-history trust

### Challenge Stage Model

Define at least three challenge-stage content layers:

- visual identity:
  - alien family or variant
  - formation shape
  - readable entry pattern
- movement identity:
  - sweep, arc, loop, stagger, or wave pattern
  - scoring windows
  - player movement demands
- result identity:
  - hit count clarity
  - perfect/near-perfect feedback
  - transition timing back to normal play

### Later-Level Variation Model

Define the first later-level behavior families:

- entry variation:
  - alternate formation arrival timing
  - staggered convoy entry
  - mirrored or offset entry groups
- attack variation:
  - dive timing and commitment changes
  - escort pair behavior
  - boss pressure windows
- movement texture:
  - lateral sweeps
  - regrouping after failed dives
  - pressure that changes by stage family

### Evidence Requirements

Every implemented expansion slice should have at least one evidence anchor:

- reference video window
- manual-backed behavior note
- Aurora harness output
- generated video or contact-sheet artifact
- scorecard or roadmap note describing the intended impact

For larger behavior-family changes, prefer the stronger evidence set:

- promoted window catalog
- contact sheets and still frames
- movement / pressure trace summary
- semantic event log
- first playable or stage-slice spec
- harness target list

## Shared Gameplay Video Direction

The video publishing work should support two audiences:

- players who want to share or revisit notable runs
- developers who need comparable evidence for issues and release decisions

The first version should stay small:

- selected run videos only
- generated metadata manifest
- links from docs or issues
- stable local export path
- no large privacy or account promise until pilot identity work catches up

Later versions can connect videos to:

- pilot scorebook
- recent plays on public pages
- issue repros
- release scorecards
- reference comparison windows
- commentary-ready run narration

## Platinum Sneak Peek Direction

The second-game preview should happen before the full `2.0` multi-game release,
but it should be honest.

It should be:

- visibly labeled as preview/dev-preview
- small enough to build without derailing Aurora
- real enough to expose platform assumptions
- close enough to Galaga-family mechanics to reuse useful infrastructure
- separate enough that storage, copy, controls, and game-pack metadata must
  become cleaner

The preview is not about shipping a full second game immediately. It is about
making Platinum stronger by giving it a real second client.

## Near-Term Recommendation

Do next:

1. branch: `codex/macbook-pro-audio-phase-gate`
2. fix or recalibrate the audio phase gate
3. rerun quality conformance
4. branch: `codex/macbook-pro-level-expansion-plan`
5. produce the first detailed stage-family and challenge-stage blueprint

That gives Aurora a clean runway:

- gates are trustworthy
- level-depth work is planned with evidence
- first implementation slice can be small
- video publishing and second-game preview are already placed in the product
  sequence

## Release Use

This plan should be used when shaping:

- `1.3.0` quality reset and level-expansion blueprint
- `1.4.0` level-by-level arcade-depth implementation
- `1.5.0` shared-video and flight-recorder work
- `1.8.0` second-game Platinum sneak peek

It should be updated whenever:

- a stage-family map is committed
- a new reference video window is added
- a challenge-stage expansion slice lands
- the shared video storage decision is made
- the second-game preview target changes
