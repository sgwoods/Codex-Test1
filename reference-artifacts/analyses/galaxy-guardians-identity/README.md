# Galaxy Guardians Identity Baseline

This folder stores persistent artifacts for the first `Galaxy Guardians` 0.1
visual and audio identity pass.

The artifacts here are intentionally source-controlled because the second-game
preview is now part of the Platinum release planning path. Runtime tuning,
visual glyph edits, and audio cue edits should cite durable files here rather
than living only in chat or in transient harness output.

Current artifacts:

- `audio-character-0.1.json` - first cue-shape and runtime-audio coverage
  contract for the Guardians signal theme.
- `audio-cue-targets-0.1.json` - stricter playtest-weighted cue target
  contract for dry square/noise shot, enemy-shot, dive, hit, and loss cues.
- `audio-isolated-cue-candidates-0.1.json` - CPU-only mixed-source cue
  candidate detector that finds short/high-energy Galaxian shot, hit, dive, and
  loss-like windows for the next manual labeling/export pass.
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
- `sprite-reference-extraction-0.1.json` - extracted crop color-family and
  proportion baseline for authored Guardians alien/player sprites.
- `threat-scoring-0.1.json` - first lower-field threat and application-owned
  scoring contract for enemy shots, player loss, and hit values.
- `visual-readability-0.1.json` - first gameplay-scale readability contract for
  role-specific sprites, palette channels, entry/formation/dive snapshots, and
  hit flashes.
