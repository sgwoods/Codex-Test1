# Aurora Galactica Plan

## Current State

- hosted `/dev` remains on:
  - `1.2.3+build.470.sha.e4732eb`
- hosted `/beta` is now current with the shipped forward candidate:
  - `1.2.3-beta.1+build.489.sha.f6ba6c2.beta`
- hosted `/production` is now current with the refreshed shipped line:
  - `1.2.3+build.489.sha.f6ba6c2`
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

### 1. Post-Production Stabilization And Next `/dev` Refresh

- keep the refreshed `1.2.3` production line and matching beta line stable
- keep documentation, analysis artifacts, and release evidence current
- decide when the next meaningful polish bundle is strong enough to refresh
  hosted `/dev`

### 2. Documentation Hardening

- make Platinum a first-class hosted documentation surface
- keep platform docs and application docs separate
- keep project, platform, player, and release docs aligned on every meaningful `x.y` release
- make missing docs a real publish-preflight failure instead of a soft reminder

### 3. `1.2.1` Aurora Trust Fixes

- `#143` dual-fighter surviving-ship rule
- `#140` challenge-stage bonus-stage numbering
- `#142` carried/captured-fighter game-over presentation

### 4. Platform Boundary Cleanup

- keep pack contract thinking explicit
- keep remaining Aurora-shaped compatibility residue visible
- avoid letting shell copy and application copy drift back into a blur

### 5. Second-Application Proof

- keep `Galaxy Guardians` preview-only until a minimal playable slice is real
- prove the platform with a narrow second-application gameplay slice rather than a rushed public launch

### 6. Audio Generation Tooling Exploration

- evaluate `AudioLDM 2` as an offline content-generation tool for themed sound-effect variation
- keep this explicitly outside `Platinum` runtime responsibilities
- test whether a small reference-guided workflow can produce useful Aurora-family variants from classic arcade cue roles
- first pilot targets should be higher-salience atmospheric/event cues rather than the smallest micro-effects
- if the workflow is simple enough and the results are good enough, treat it as a reusable tool for future hosted games as well

## Immediate Priorities

1. treat `main` as the authoritative post-production integration line
2. verify the public project page finishes propagating the shipped production
   posture
3. begin the next polish cycle from `main`
4. prioritize movement fidelity, audio identity polish, and Platinum/application
   boundary cleanup
5. deepen the second-application proof deliberately after the refreshed
   production line is stabilized

## Release Direction

- the next serious Aurora candidate should come from the current hosted `/dev`
  line, not from promoting the older hosted `/beta` line in place
- hosted `/beta` and hosted `/production` are still the same shipped code line,
  so promoting the current beta would not meaningfully advance production
- the next meaningful public milestone should likely be a `MINOR` release in
  the `1.3.0` family after the current fidelity cycle improves timing and audio

## Beta Planning

- the current hosted `/beta` now matches the refreshed production-quality line
- the next beta after this one should belong to the next minor-cycle candidate
  family, not to the just-shipped `1.2.3` refresh
- the next beta should most likely come from a `1.3.0` polish cycle after:
  - movement fidelity improves against the real Galaga reference
  - audio identity polish moves beyond cue timing
  - Platinum/application seams are documented and tightened further

See also:

- `/Users/steven/Documents/Codex-Test1/BETA_CANDIDATE_PLAN.md`
- `/Users/steven/Documents/Codex-Test1/BETA_TO_PRODUCTION_PLAN.md`

## Current Operating Plan

The principles are now translated into a concrete execution plan in:

- `/Users/steven/Documents/Codex-Test1/GO_FORWARD_EXECUTION_PLAN.md`

That document should be used as the working bridge between:

- development principles
- bug-fix discipline
- reference-artifact generation
- persona and progression evidence
- release-candidate assembly
