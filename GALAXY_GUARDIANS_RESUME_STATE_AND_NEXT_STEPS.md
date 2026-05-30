# Galaxy Guardians Resume State And Next Steps

Updated: May 29, 2026

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

### 5a. Platinum-frame fit is materially stronger now

The current source now also carries:

- game-aware pilot-card copy for `Galaxy Guardians` across signed-in, local,
  watch, and 2UP rivalry states
- a compact-cabinet browser proof that the preview still fits the shared shell
  rails while surfacing both the formation pulse and single-shot combat cue

The practical meaning is: Guardians now reads much less like a special-case
 preview inside Platinum, even though broader public-release readiness is still
 limited by the one-level slice and deeper fairness work.

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

### 9. Audio and starfield are now a sharper live-priority issue

The current artifact and harness layer does already carry both categories:

- Guardians audio cue, audio-character, and audio-lab checks remain green
- opening-slice render and motion artifacts already require a live moving
  starfield and visible top re-entry

The practical meaning is no longer “sound and motion feel missing.” The current
source now also makes launch audio explicit, strengthens the first-seconds cue
presence, and gives the moving starfield a brighter, more forceful live read.

The practical meaning now is: the opening is more believable, so the next best
quality work has shifted back to combat feedback, palette authority, and
platform fit.

### 10. The opening launch/audio/starfield/layout pass is now in source

The current source now also carries:

- explicit wait-launch audio confirmation plus a dedicated launch-audio guard
- a stronger opening `gameStart`, formation pulse, and idle/wait audio read
- a brighter `126`-star stage-one field with stronger drift, trails, and lead
  stars
- a clearer runtime headline stack and stronger `WAIT` / mission / score-table
  presentation on both the wait showcase and the preview modal

The practical meaning is: items `2`, `3`, and `4` from the previous priority
order are no longer just plan text. They are implemented, measured, and green
through the maintained Guardians spine.

## What The Last 5-10 Passes Actually Bought Us

### 1. The gameplay improvement is real, but it is mostly first-impression quality

Across the last cluster of Guardians passes, we materially improved:

- opening rack motion from a loose wobble to a broad shared sweep
- moving starfield density, drift, trails, and visible motion salience
- top re-entry continuity so threats read as a loop rather than a pop-in
- the opening `WAIT` / mission / score-table read
- launch audio clarity and first-seconds cue presence
- hit, explosion, and destruction readability
- opening palette ownership and swarm color-family variety
- pilot-card and shell framing so Guardians reads more like a true Platinum
  second game
- compact-cabinet preview proof so the browser-visible surface still fits the
  shared frame while showing both formation and combat identity

The important honest read is: this was a meaningful visible-quality lift, not
yet a score-moving breakthrough. The aggregate numbers are still:

- reference conformance: `7.6/10`
- playtest-weighted conformance: `6.9/10`
- public release readiness: `4.2/10`
- implementation gate coverage: `9.6/10`

So the last passes clearly made the game feel less unfinished, but they did
not yet solve later-band fairness or broaden the public slice enough to change
the readiness story.

### 2. The testing and experiment structure is much more mature than it was

Over the same passes, we expanded or hardened:

- promoted opening-slice source, frame, render, and motion contracts
- dedicated opening rack motion measurement
- explicit wait-launch audio verification
- combat-feedback frame-reference authority
- platform-frame parity contracts
- compact-cabinet browser-fit verification
- runtime-vs-reference movement comparison
- stronger reference-conformance and opening-baseline aggregate gates
- hosted `/dev` verification plus Pages self-heal for release-authority review

The practical meaning is: we are no longer guessing at the opening slice.
We now have a much better evidence loop for motion, audio presence, shell fit,
combat read, and public-facing review.

Three player-facing fixes are now part of that maintained loop too:

- Guardians replay/video capture now persists again, with a dedicated
  browser-backed replay-capture check instead of only manual observation.
- Dive threats are now explicitly bounded so they no longer disappear off the
  left/right edges before the intended bottom-exit/top-reentry cycle.
- The live board now emits a recurring rack pulse, so representative gameplay
  audio is less empty between isolated shot/hit/loss cues.

### 3. The right next phase is no longer generic polish

Because the best gameplay examples now give us strong evidence for audio,
timing, motion, graphics, and behavior, the best next phase is to promote more
of that gameplay authority directly into the measured runtime contracts.

The next gain should come from better behavior authority, not more surface-only
cleanup.

## What Is Still Obviously Missing

These are the most important remaining misses in the visible public slice.

### 1. Later-band fairness is now the clearest gameplay gap

The opening slice is materially stronger than it was before this pass, so the
next largest gameplay-quality miss is no longer “obvious missing shell work.”
It is the still-limited confidence around stage `3-5` pressure and stage `6-9`
survivability/clear consistency.

### 2. Audio is stronger and now more continuously present, but still needs a browser/listening pass

Launch audio, first-seconds cue presence, and the live opening feel are all
better now, and the recurring rack pulse makes the stage sound less empty
between action cues. The preview still needs one deliberate browser-side
listening review plus selective cue cleanup before it can claim stronger
public sound readiness.

### 3. Public-release honesty is still limited by the one-level slice

The visible first level now reads more convincingly, but the maintained
readiness score is still `4.2/10` because Guardians still presents only a
bounded one-level `mission_complete` slice instead of a broader publicly
reviewable game.

### 4. A second `WAIT` / mission / score-table pass is now conditional, not primary

The opening surface is much closer. Another frame-window refinement pass now
only makes sense if the next hosted side-by-side review still shows visible
cabinet drift after this stronger combat/palette/shell-fit baseline.

## Immediate Next Work Order

This is the best next sequence if we want the highest conformance return for
time and compute.

1. Promote stage `3-5` and `6-9` gameplay-video authority into measured
   pressure, fairness, and survivability contracts instead of continuing
   generic shell polish.
2. Use the best gameplay videos plus the new long-surface stage-band authority
   to keep richer behavior windows for dive timing, lower-field occupancy,
   enemy-shot density, clear timing, and top-reentry continuity inside one
   maintained review artifact.
3. Do a deliberate browser/listening pass and selective audio cue cleanup so
   the improved opening sound, recurring rack pulse, and restored replay
   capture can all be judged against actual gameplay footage instead of only
   internal cue checks.
4. Push public-readiness honesty past the current one-level `mission_complete`
   slice only after the stronger opening and deeper behavior contracts survive
   hosted review.
5. Do a second frame-window refinement pass on the `WAIT` / title / mission /
   score-table read only if the next hosted side-by-side review still shows
   obvious cabinet drift.

## Best Quality Work On This Machine Now

This machine should stay focused on the work that most directly improves review
quality, hosted readability, and beta honesty.

1. Use the new stage-band authority inside the long-surface artifact to tune
   later-band fairness and clear consistency for stage `3-5` and `6-9`.
2. Do one deliberate browser/listening pass plus targeted cue cleanup so the
   improved opening sound is judged by the same standard as the visuals.
3. Use hosted `/dev` as the real review lane after each meaningful pass instead
   of waiting to batch too many local-only improvements together.
4. Push public-release honesty beyond the current one-level slice only after
   the stronger opening and deeper behavior contracts survive hosted review.
5. Use a second `WAIT` / title / mission / score-table polish pass only if the
   next hosted side-by-side review still shows obvious cabinet drift.

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
