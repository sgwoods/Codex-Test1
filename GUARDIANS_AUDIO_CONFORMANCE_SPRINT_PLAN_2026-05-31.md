# Guardians Audio Conformance Sprint Plan

Date: 2026-05-31

## Goal

Make `Galaxy Guardians` sound convincingly like a real Galaxians-family game in
live play, not just pass cue-shape checks.

## Current Sprint Status

The first generic platform tranche is now in place:

- gameplay captures persist aligned `sessionEvents` and `audioHistory`
- reusable scene-review analysis is live
- reusable live-mix analysis is live
- both analyses are game-registered through
  `tools/harness/audio-conformance-games.js`
- the scene-anchor layer now supports time-bounded resolution so future games
  can define scene ends relative to the scene start instead of to the first
  matching cue anywhere in the run

Latest generated artifacts:

- `reference-artifacts/analyses/galaxy-guardians-identity/audio-scene-review-0.1.json`
- `reference-artifacts/analyses/galaxy-guardians-identity/audio-live-mix-0.1.json`

Future-game intake should now follow the separate platform playbook:

- `PLATINUM_AUDIO_CONFORMANCE_FRAMEWORK.md`

This sprint is intentionally narrower and more serious than routine polish. The
target is a large felt user-quality jump in:

- opening board liveliness
- lower-field pressure sound
- hit / destruction reward
- loss / game-over tone
- overall “this sounds like the real kind of game” read

## Current Honest Read

The repo already has a lot of audio structure:

- cue-shape contract:
  `reference-artifacts/analyses/galaxy-guardians-identity/audio-character-0.1.json`
- waveform/spectrogram proxy comparison:
  `reference-artifacts/analyses/galaxy-guardians-identity/audio-reference-comparison-0.1.json`
- reusable cue lab:
  `reference-artifacts/analyses/audio-conformance-lab/galaxy-guardians-preview/audio-conformance-lab-0.1.json`
- promoted cue windows:
  `reference-artifacts/analyses/galaxy-guardians-identity/audio-labeled-cue-targets-0.1.json`
- runtime startup/unlock guard:
  `tools/harness/check-galaxy-guardians-wait-launch-audio.js`

But the current process still leaves a major user-facing gap:

- live gameplay still gets judged mostly through proxy cue metrics
- the reference comparison still uses mixed gameplay windows and says so
- the reusable lab still says the next promotion is human listening
- the playtest-weighted review still records “Sound is nothing like the
  original Galaxians.”

Current meaningful evidence:

- `audio-character` passes, but it mainly proves cue ownership and shape
- `audio-reference-comparison` scores `8.3/10`, but its weakest subread is
  `acousticProxyFit: 5.3`
- `audio-conformance-lab` scores `8.5/10`, but explicitly says the next step is
  human listening against promoted windows
- the latest fixed live capture now correctly resolves `guardians-signal`
  instead of the accidental `galaga-reference-assets` runtime path

## Diagnosis

The main problem is no longer “audio is broken.” It is that our acceptance loop
is still optimized for synthetic cue correctness more than for lived gameplay
sound.

### What is working

- pack-owned cue family exists and is distinct from Aurora
- live runtime now resolves the correct game-owned theme
- launch/unlock behavior is explicit
- repeatable persona capture exists and includes audio

### What is not working

1. We over-score isolated cue correctness.
The current checks are good for ownership and broad shape, but they do not
answer whether stage play sounds right over `20-30` seconds of real action.

2. We still rely on mixed-source gameplay windows.
The audio proxy analysis itself says this is not a final acoustic match.

3. We do not yet have a gameplay-soundscape contract.
There is no strong persisted artifact for:
- longest quiet gap
- recurring pressure cue density
- hit/loss prominence in play
- stage-one versus stage-five soundscape escalation

4. Human listening is still downstream.
The repo already says the next step should be human listening, but the process
still treats it as a follow-up instead of the main acceptance gate.

5. Too much audio tuning is cue-local.
The bigger user-quality problem is often event cadence and mix presence, not
just the recipe of one cue.

## Best Continuous Effort

The highest-value uninterrupted effort is not “retune everything a little.”

It is this:

1. Freeze the current fixed live path.
2. Build a true gameplay-soundscape review loop.
3. Curate better reference windows.
4. Refit only the most audible/high-leverage cue families and cadence points.
5. Accept or reject by headed listening plus fresh persona capture.

That is the shortest path to a major felt improvement.

## Sprint Strategy

### Phase 0. Lock The Baseline

Purpose:
- avoid wasting time on phantom drift during the sprint

Actions:
- keep the current safe-lane / persona / live-theme fix tranche intact
- capture baseline Guardians review runs for:
  - `advanced`
  - `expert`
  - `professional`
- use `--audio-theme auto` only for the sprint

Deliverables:
- a small baseline manifest pointing to the review captures
- one saved note summarizing what sounded wrong before retuning begins

Why this matters:
- audio work should compare against one stable gameplay baseline, not shifting
  runtime assumptions

### Phase 1. Replace Proxy-First Thinking With Scene-First Thinking

Purpose:
- move from cue-only judgment to gameplay-scene judgment

Actions:
- define a persisted Guardians audio scene set with windows such as:
  - launch / rack establish
  - first independent dive pressure
  - flagship + escort pressure
  - hit / score moment
  - player loss
  - game-over close
  - later-band stage-five pressure
- each scene should point to:
  - reference source/time window
  - runtime capture segment
  - target read in plain language

Recommended new artifact:
- `reference-artifacts/analyses/galaxy-guardians-identity/audio-scene-review-0.1.json`

Why this matters:
- users do not hear isolated cues; they hear scenes and transitions

### Phase 2. Curate Better Reference Audio Evidence

Purpose:
- reduce dependence on dirty mixed gameplay windows

Actions:
- review the existing reference videos, especially:
  - `matt-hawkins-arcade-intro`
  - `arcades-lounge-level-5`
  - `nenriki-15-wave-session`
  - `galaxians-ex12mins`
- identify the cleanest windows for:
  - player shot
  - enemy shot
  - scout dive
  - flagship dive / escort pressure
  - hit family
  - loss / failure
  - recurring ambient pressure
- preserve timestamps, metrics, and previews durably
- keep raw extracted reference audio as generated local review material if we do
  not want to commit copyrighted snippets

Why this matters:
- current proxy scoring is capped by noisy or mixed source windows

### Phase 3. Add A Live Gameplay Soundscape Harness

Purpose:
- measure the thing players actually experience

Actions:
- add a dedicated harness that analyzes real persona captures and reports:
  - longest quiet gap
  - cue-event density by `5s` slice
  - shot / dive / hit / loss presence counts
  - recurring rack-pulse interval read
  - overlap / crowding pressure
  - stage-one versus stage-five soundscape escalation

Recommended new artifact:
- `reference-artifacts/analyses/galaxy-guardians-identity/audio-live-mix-0.1.json`

Recommended new scripts:
- `npm run harness:analyze:galaxy-guardians-audio-live-mix`
- `npm run harness:check:galaxy-guardians-audio-live-mix`

Why this matters:
- this is the missing contract between cue correctness and actual gameplay

### Phase 4. Rebuild Only The Highest-Leverage Audio Families

Purpose:
- make a big audible change quickly instead of diffusing effort

Priority order:
1. recurring live pressure presence
2. player shot / enemy shot transient family
3. scout dive / flagship dive warning family
4. hit / score payoff family
5. player loss / game-over close

Important rule:
- do not retune low-impact cues before the scene and live-mix evidence exists

Why this matters:
- most of the felt gap is concentrated in a few repeated moments

### Phase 5. Headed Listening Becomes Mandatory

Purpose:
- promote player-truth to the main acceptance gate

Actions:
- for every serious pass:
  - generate fresh persona captures
  - review them in headed browser/media playback
  - compare against the promoted reference windows
  - record the verdict in a repo-owned listening note

Recommended new artifact:
- `reference-artifacts/analyses/galaxy-guardians-identity/audio-listening-review-0.1.md`

Why this matters:
- our own artifacts already say human listening is the next meaningful step

### Phase 6. Only Then Tighten Secondary Gameplay Timing For Audio Benefit

Purpose:
- allow gameplay changes only where they materially improve sound read

Allowed during the sprint:
- recurring pulse interval changes
- event spacing that improves audibility
- hit timing that improves reward
- stage-band cadence that fixes dead-air or over-crowding

Not allowed during the sprint:
- broad gameplay redesign unrelated to audio
- palette / HUD / watch-mode work
- `2UP` expansion

Why this matters:
- this keeps the sprint focused and prevents audio work from dissolving back
  into general polish

## Platform And Process Changes Worth Making

These are justified because they multiply the value of the audio effort.

1. Default Guardians review captures to `audioTheme=auto`.
This is already partially done and should stay mandatory.

2. Treat developer reference-audio mode as explicitly pinned, never implicit.
This protects live Guardians review from drifting back to the wrong theme path.

3. Add a first-class audio scene manifest and live-mix artifact.
This is the biggest missing measurement layer.

4. Make headed listening part of the standard Guardians acceptance loop.
The process should become:
review capture -> listen -> fix -> rerun harness -> refresh artifact

5. Keep raw reference audio extraction as generated review material if needed,
not as the main committed conformance proof.
The durable committed proof should be:
- timestamps
- waveform/spectrogram previews
- numeric metrics
- listening notes

## Best Use Of One Uninterrupted Audio Sprint

If we want the biggest single leap, the best uninterrupted effort is:

1. Baseline captures and listening notes.
2. Reference window cleanup.
3. Live-mix harness creation.
4. Retune the top `4-5` cue/cadence families only.
5. Repeat fresh persona captures.
6. Headed listening acceptance.
7. Refresh the playtest-weighted and first-class artifacts.

That is better than spending the same time on scattered cue edits.

## Expected Outcome

If this sprint is done well, the likely user-facing improvement is:

- the game immediately sounds more alive in the opening `10-20` seconds
- dives and pressure feel more intentional
- shots and hits sound drier and more arcade-like
- death / failure moments land harder
- the “this sounds nothing like Galaxians” complaint should weaken materially

It may not produce full final hardware-faithful audio in one pass, but it
should produce a large and obvious increase in felt authenticity.

## What To Do Next

When this sprint starts, do it in this exact order:

1. create the baseline capture/listening bundle
2. add the audio scene review artifact
3. add the live-mix harness
4. curate better reference windows
5. rebuild the highest-leverage cue families and cadence points
6. run fresh persona captures and headed listening review
7. refresh:
   - `audio-reference-comparison-0.1.json`
   - `audio-conformance-lab-0.1.json`
   - `playtest-conformance-review-0.1.json`
   - `first-class-conformance` verification
