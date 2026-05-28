# Galaxy Guardians Resume State And Next Steps

Updated: May 26, 2026

## Purpose

This note is the quick human-readable restart point for the current `Galaxy
Guardians` conformance program.

It exists so we do not have to reconstruct the current status from multiple
longer planning documents before resuming work.

Use this together with:

- [GALAXY_GUARDIANS_OPENING_SLICE_BASELINE.md](GALAXY_GUARDIANS_OPENING_SLICE_BASELINE.md)
- [GALAXY_GUARDIANS_STAGE_ARC_AND_HOMAGE_PLAN.md](GALAXY_GUARDIANS_STAGE_ARC_AND_HOMAGE_PLAN.md)
- [GALAXY_GUARDIANS_FIRST_CLASS_CONFORMANCE_PLAN.md](GALAXY_GUARDIANS_FIRST_CLASS_CONFORMANCE_PLAN.md)
- [GALAXY_GUARDIANS_LONG_SURFACE_AND_PERSONA_PLAN.md](GALAXY_GUARDIANS_LONG_SURFACE_AND_PERSONA_PLAN.md)
- [GALAXY_GUARDIANS_OTHER_MACHINE_BETA_INTEGRATION_PLAN.md](GALAXY_GUARDIANS_OTHER_MACHINE_BETA_INTEGRATION_PLAN.md)

## Current Checked State

### Source state

- Authoritative source `main` now includes the opening-slice baseline work and
  the measured opening-rack motion pass.
- The opening rack is no longer treated only as a generic movement artifact.
  It now has its own committed source-backed contract in
  `opening-rack-motion-0.1.json`.

### Hosted dev state

- Hosted `/dev` is now live and verified on
  `1.4.0.1+build.924.sha.9e779c05`.
- The release-authority verifier now also has a Pages workflow self-heal path,
  so a correct hosted repo push is less likely to stall behind a missed GitHub
  Pages deploy trigger.
- Treat this note and the repo artifacts as the durable current state for the
  Guardians conformance program, with hosted `/dev` now close enough to use as
  a real review lane instead of only a best-effort mirror.

### What the public game truth still is

- Hosted `dev` still exposes a one-level visible public slice.
- That slice still ends in `mission_complete`.
- It is more believable now than it was before the opening baseline and rack
  pass, but it is still not yet a fully convincing Galaxian-family cabinet in
  the first seconds of play.

## What Just Landed

### 1. Opening-slice documentation is now easier to reopen

The hosted docs already carry:

- the Guardians stage assessment
- the opening-slice baseline
- the top-10 improvement queue
- the full stage-arc plan

This note adds a shorter “resume here” layer on top of those.

### 2. The rack now moves like a shared sweep

The biggest gameplay-facing change from this pass is that the opening rack now
uses a broad stepped shared sweep instead of a small per-alien wobble.

That matters because the source-family read is a marching rack, not a drifting
screen saver.

### 3. The motion pass is now grounded

The opening rack now has a dedicated measured contract:

- source anchor: `matt-hawkins-arcade-intro/opening-rack-entry`
- median rack-track x-span target: about `0.298`
- runtime achieved x-span: about `0.307`
- direction changes: `3`
- cohesion spread: `0px`

The practical meaning is: the runtime is now broad and unified enough to read
much more like a real opening sweep.

### 4. Starfield and top-reentry motion are stronger now

The current source now also carries:

- a denser `104`-star opening field with directional drift instead of the older
  lighter scatter
- a stronger render contract that requires visible star travel between samples
- a top-reentry path that now begins at `y <= -20` and settles back in more
  gradually instead of reading like a shallow snap-back

The practical meaning is: the opening board feels more alive, and wrap return
is easier to read as a continuous threat loop.

### 5. The opening mission, score table, hit feedback, and palettes are tighter

The current source now also carries:

- a tighter `WAIT` / preview mission layout that preserves the canonical
  `MISSION: DESTROY ALIENS` phrase
- a compact `CONVOY` / `CHARGER` score-table layout on both the wait showcase
  and the preview modal
- sprite-like pixel-burst hit and destruction feedback instead of only the
  earlier line-burst flashes
- theme-owned preview palettes so the opening swarm no longer depends on one
  mostly static green-heavy family

The practical meaning is: the first visible slice now reads more like a real
cabinet adaptation and less like a placeholder preview shell.

### 6. Promoted frame windows now back the opening read

The current source now also carries a dedicated Guardians-owned frame-reference
artifact for the opening:

- `opening-slice-frame-reference-0.1.json`

That artifact promotes concrete extracted windows for:

- Matt Hawkins attract mission text
- Matt Hawkins score advance table
- Nenriki wrap-return pressure

The practical meaning is: `WAIT`, score-table, and top-reentry work now cite
real promoted frame windows instead of only broader source manifests and plan
text.

### 7. The other-machine merge path is now explicitly captured

The repo now also carries a dedicated integration note for taking the current
opening authority work, merging in the other machine's Galaxy tranche, and
turning the combined result into the next coherent `/dev` then `/beta` review
bundle:

- `GALAXY_GUARDIANS_OTHER_MACHINE_BETA_INTEGRATION_PLAN.md`

### 8. The current measured program is stable enough to focus on visible quality

The maintained Guardians spine is still passing:

- opening-slice source baseline
- opening-slice frame-reference authority
- opening-slice baseline gate
- first-class conformance aggregate gate

The current aggregate read remains:

- reference conformance: `7.6/10`
- playtest-weighted conformance: `6.9/10`
- public release readiness: `4.2/10`
- implementation gate coverage: `9.6/10`

The practical meaning is: the main remaining work is no longer “do we have a
serious conformance program?” The main remaining work is “does the visible game
slice feel authoritative enough to justify a stronger hosted review story?”

## What Is Still Obviously Missing

These are the most important remaining misses in the visible public slice.

### 1. `WAIT` and score-table layout still need tighter runtime matching

The promoted frame windows now give these surfaces real opening authority, but
the live runtime is still a tighter Guardians-owned adaptation rather than a
closer four-row cabinet-matched score-table read.

### 2. Starfield motion and top-reentry now have their own measured contract

The runtime now has visibly better motion in both areas, and those surfaces now
have their own durable measured target contract tied to the promoted Nenriki
wrap-return window and the runtime-reference movement artifact.

### 3. Explosion and hit states now have frame authority but still need tighter live matching

Combat now reads better than before, and hit/destruction states now cite
promoted Arcade's Lounge windows. The next step is tighter live matching, not
inventing authority from scratch.

### 4. Palette progression and swarm color authority are still partial

The opening palette family is closer than before, but it still needs a more
deliberate stage-owned color read instead of a mostly runtime-tuned
approximation.

### 5. Platform-frame parity is still incomplete

Guardians still needs to sit in Platinum as naturally as Aurora across:

- sign-in
- scores
- pilot card
- replay and video capture
- bug reports
- music and sound controls

## Immediate Next Work Order

This is the best next sequence if we want the highest conformance return for
time and compute.

1. Tighten the runtime `WAIT`, headline, mission, and score-table layout
   against the now-promoted opening frame windows.
2. Tighten the live explosion, hit, and destruction-state matching against the
   promoted combat-reference windows.
3. Tighten opening palette progression and swarm color-family authority beyond
   the first improved slice.
4. Add real Aurora-versus-Guardians platform-frame parity scoring and finish the
   shared frame work.
5. After the visible opening slice is credible, continue into stage `3-5`
   pressure traces and stage `6-9` survivability/fairness.

## Best Quality Work On This Machine Now

This machine should stay focused on the work that most directly improves review
quality, hosted readability, and beta honesty.

1. Tighten the runtime `WAIT`, headline, mission, and score-table layout
   against the promoted Matt Hawkins frame windows.
2. Tighten live explosion, hit, and destruction-state matching so combat
   readability fully earns the new frame-backed authority.
3. Tighten opening palette progression and swarm color-family authority so the
   first seconds of play read as intentional rather than broadly “Galaxian-ish.”
4. Finish Platinum-frame parity for Guardians across sign-in, scores, pilot
   card, replay/video capture, bug reports, and music/sound controls.
5. Use hosted `/dev` as the real review lane after each meaningful pass instead
   of waiting to batch too many local-only improvements together.

## Recommended Machine Split

If the other machine continues moving in parallel, the cleanest split is:

- this machine: release authority, hosted lane verification, Guardians
  opening-slice quality, platform-frame fit, and beta-readiness review
- other machine: deeper Aurora challenge-stage design, late-stage conformance
  experimentation, and any heavier exploratory runtime work that does not need
  to block hosted review discipline here

That split keeps this machine anchored to high-confidence visible quality work
while the other machine keeps advancing the riskier deeper conformance goals.

## What We Should Not Re-Litigate First

The following points are already settled enough to move on:

- the current visible public truth is still one level
- the deeper repeated-rack/stage-band model belongs to internal conformance and
  future public growth, not to exaggerated current public claims
- artifact-first conformance remains the rule; human review is fallback, not the
  main strategy
- the rack-motion pass was worth doing and should be treated as landed progress,
  not reopened as an open design question

## Resume Advice

If resuming after a pause, reopen work in this order:

1. this note
2. the hosted opening baseline
3. the hosted top-10 queue
4. the hosted stage assessment
5. only then the longer first-class and long-surface plan docs

That order gives the fastest path back to the real current state without having
to reread the whole repo strategy stack first.
