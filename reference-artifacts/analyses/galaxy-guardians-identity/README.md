# Galaxy Guardians Identity Baseline

This folder stores persistent artifacts for the first `Galaxy Guardians` 0.1
visual and audio identity pass.

The artifacts here are intentionally source-controlled because the second-game
preview is now part of the Platinum release planning path. Runtime tuning,
visual glyph edits, and audio cue edits should cite durable files here rather
than living only in chat or in transient harness output.

## Latest Measured Rerun

May 5, 2026 MacBook branch-local rerun:

- restored standalone Guardians pack loading for CPU-only conformance harnesses
  after layered application release metadata was added to the browser runtime
- reran the Platinum audio conformance lab at `8.3/10`; `enemyShot` remains the
  weakest measured cue and `flagshipHit` remains strongest
- reran runtime-vs-reference movement at `8.0/10`; current runtime tracklets
  are shorter than the promoted reference median, so pacing changes should wait
  for browser-reviewed feel evidence beside the trace metrics
- reran frame-motion, object-track, sprite extraction, sprite grid/component,
  visual-readability, and attract/score checks
- refreshed `sprite-reference-extraction-0.1.json` so current runtime sprite
  filled-pixel and fill-ratio metrics match the authored component-derived
  sprites
- refreshed sprite grid/component target artifacts; component similarity now
  records `0.924` average with `player-interceptor` weakest, preserving the
  need for human review of player-only crops
- restored the scout sprite eye/accent channel so all authored runtime sprites
  preserve at least four visible token channels in the extraction and
  readability gates

Current artifacts:

- `audio-character-0.1.json` - first cue-shape and runtime-audio coverage
  contract for the Guardians signal theme.
- `audio-cue-targets-0.1.json` - stricter playtest-weighted cue target
  contract for dry square/noise shot, enemy-shot, dive, hit, and loss cues.
- `audio-isolated-cue-candidates-0.1.json` - CPU-only mixed-source cue
  candidate detector that finds short/high-energy Galaxian shot, hit, dive, and
  loss-like windows for the next manual labeling/export pass.
- `audio-labeled-cue-targets-0.1.json` - promoted cue-window artifact with
  stable source timestamps plus waveform/spectrogram previews for eight
  runtime cue families. It does not export raw reference audio.
- `../audio-conformance-lab/galaxy-guardians-preview/audio-conformance-lab-0.1.json`
  - reusable Platinum audio lab output comparing deterministic runtime cue
  synthesis to promoted reference cue windows, with waveform/spectrogram PNG
  previews and cue-level recommendations.
- `audio-reference-comparison-0.1.json` - waveform/spectrogram and PCM proxy
  comparison between the Galaxian reference windows and Guardians cue shapes.
- `attract-score-surface-0.1.json` - first visible wait-mode and preview-modal
  surface contract for Guardians mission language and score-table presentation.
- `candidate-0.1.json` - aggregate 0.1 candidate gate tying the identity,
  movement, threat, visual, audio, runtime-event, and public-boundary
  requirements together.
- `formation-entry-0.1.json` - first runtime entry/settle contract for the
  promoted Galaxian `formation_entry_start`, `formation_entry_settle`, and
  `formation_rack_complete` events.
- `frame-motion-conformance-0.1.json` - first CPU-only frame-proxy analysis
  over Galaxian rack, dive, flagship, and wrap reference windows.
- `identity-baseline-0.1.json` - first application-owned sprite, palette, audio,
  and timing contract for the development-only playable preview.
- `movement-pacing-0.1.json` - first runtime movement and pressure pacing
  contract for solo dives, flagship/escort dives, and wrap/return pressure.
- `object-track-conformance-0.1.json` - CPU-only connected-component and
  lower-field tracklet proxy over the Galaxian frame windows, used to set the
  next runtime-vs-reference tuning bands without changing constants by feel.
- `playtest-conformance-review-0.1.json` - playtest-weighted score layer that
  records the current audio, motion, and graphics gaps separately from
  evidence-coverage scoring so beta-facing preview decisions stay honest.
- `quick-peek-source-fidelity-0.2.json` - playtest-driven quick-peek
  recalibration that moves timing, pacing, rack footprint, backdrop, and sprites
  closer to the Galaxian reference sheets while preserving the need for future
  frame extraction.
- `reference-conformance-0.1.json` - first scored Guardians reference
  conformance metric set tying the Galaxian source profile, promoted event log,
  preview gates, and platform-boundary evidence into a weighted development
  score.
- `runtime-reference-movement-0.1.json` - runtime-vs-reference movement
  comparison that tuned the dev-preview dive speed, lateral span, and wrap
  pressure from the object-track proxy.
- `score-progression-0.1.json` - first score-advance table, mission-language,
  wave-clear, and stage-advance contract for the dev-only playable preview.
- `stage-rank-pressure-0.1.json` - bounded multi-stage pressure contract that
  preserves the measured stage-one timing while making stages three and five
  measurably faster and denser for dives, shots, drift, and wrap pressure.
- `sprite-grid-targets-0.1.json` - broad downsampled crop-grid target scaffold
  for flagship, escort, scout, and player silhouettes. These grids are not final
  exact sprites; they guide the next tighter component-crop pass.
- `sprite-component-targets-0.1.json` - promoted component-crop target scaffold
  with PNG crop previews for flagship, escort, scout, and player silhouettes,
  used to tune the pack-owned runtime sprite rows.
- `sprite-reference-extraction-0.1.json` - extracted crop color-family and
  proportion baseline for authored Guardians alien/player sprites.
- `threat-scoring-0.1.json` - first lower-field threat and application-owned
  scoring contract for enemy shots, player loss, and hit values.
- `visual-readability-0.1.json` - first gameplay-scale readability contract for
  role-specific sprites, palette channels, entry/formation/dive snapshots, and
  hit flashes.
