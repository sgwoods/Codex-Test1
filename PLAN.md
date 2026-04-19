# Aurora Galactica Plan

## Current State

- `1.2.0 - Platinum Release 1` is live on hosted `/production`
- `Platinum` is now a real shipped host platform rather than an internal refactor story
- `Aurora Galactica` is the first shipped playable application on Platinum
- hosted lane model is now explicit:
  - local `localhost`
  - hosted `/dev`
  - hosted `/beta`
  - hosted `/production`
- the major missing discipline that slipped past the original `1.2.0` promotion was a full documentation pass and first-class hosted platform docs
- that is now being corrected and formalized as a real release gate

## Active Workstreams

### 1. Documentation Hardening

- make Platinum a first-class hosted documentation surface
- keep platform docs and application docs separate
- keep project, platform, player, and release docs aligned on every meaningful `x.y` release
- make missing docs a real publish-preflight failure instead of a soft reminder

### 2. `1.2.1` Aurora Trust Fixes

- `#143` dual-fighter surviving-ship rule
- `#140` challenge-stage bonus-stage numbering
- `#142` carried/captured-fighter game-over presentation

### 3. Platform Boundary Cleanup

- keep pack contract thinking explicit
- keep remaining Aurora-shaped compatibility residue visible
- avoid letting shell copy and application copy drift back into a blur

### 4. Second-Application Proof

- keep `Galaxy Guardians` preview-only until a minimal playable slice is real
- prove the platform with a narrow second-application gameplay slice rather than a rushed public launch

### 5. Audio Generation Tooling Exploration

- evaluate `AudioLDM 2` as an offline content-generation tool for themed sound-effect variation
- keep this explicitly outside `Platinum` runtime responsibilities
- test whether a small reference-guided workflow can produce useful Aurora-family variants from classic arcade cue roles
- first pilot targets should be higher-salience atmospheric/event cues rather than the smallest micro-effects
- if the workflow is simple enough and the results are good enough, treat it as a reusable tool for future hosted games as well

## Immediate Priorities

1. complete the documentation refresh and publish-path hardening
2. close the small Aurora trust-fix bundle for `1.2.1`
3. keep hosted `/dev`, hosted `/beta`, and hosted `/production` aligned with the source docs and release metadata
4. then deepen the second-application proof deliberately
5. prototype reference-guided audio-generation tooling only after the current Aurora cue-state review surface is trustworthy enough to judge results clearly

## Current Operating Plan

The principles are now translated into a concrete execution plan in:

- `/Users/steven/Documents/Codex-Test1/GO_FORWARD_EXECUTION_PLAN.md`

That document should be used as the working bridge between:

- development principles
- bug-fix discipline
- reference-artifact generation
- persona and progression evidence
- release-candidate assembly
