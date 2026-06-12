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
- `audio-labeled-cue-targets-0.1.json` - promoted cue-window artifact with
  stable source timestamps plus waveform/spectrogram previews for eight
  runtime cue families. It does not export raw reference audio.
- `../audio-conformance-lab/galaxy-guardians-preview/audio-conformance-lab-0.1.json`
  - reusable Platinum audio lab output comparing deterministic runtime cue
  synthesis to promoted reference cue windows, with waveform/spectrogram PNG
  previews and cue-level recommendations.
- `audio-reference-comparison-0.1.json` - waveform/spectrogram and PCM proxy
  comparison between the Galaxian reference windows and Guardians cue shapes.
- `audio-scene-review-0.1.json` - reusable gameplay-scene audio review layer
  that anchors lived sound windows such as rack establish, first dive pressure,
  hit payoff, player loss, and midrun pressure to durable capture labels.
- `audio-live-mix-0.1.json` - reusable captured-gameplay soundscape layer that
  measures quiet gaps, cue density, pulse cadence, pressure share, and
  opening-to-midrun escalation from real persona review captures.
- `attract-score-surface-0.1.json` - first visible wait-mode and preview-modal
  surface contract for Guardians mission language and score-table presentation.
- `combat-feedback-frame-reference-0.1.json` - promoted frame-window authority
  for player-shot, lower-field hit, and level-clear destruction readability
  using the committed Arcade's Lounge level-5 windows.
- `opening-slice-frame-reference-0.1.json` - Guardians-owned promoted
  frame-window authority for the opening mission text, score-advance table,
  and wrap-return pressure using the extracted Matt Hawkins and Nenriki
  reference windows.
- `opening-slice-motion-targets-0.1.json` - measured starfield and top-reentry
  contract that keeps the visible opening board motion tied to the promoted
  Nenriki wrap-return window and the runtime-reference movement artifact.
- `candidate-0.1.json` - aggregate 0.1 candidate gate tying the identity,
  movement, threat, visual, audio, runtime-event, and public-boundary
  requirements together.
- `tools/harness/check-galaxy-guardians-first-class-conformance.js` -
  aggregate first-class-conformance process gate that verifies the core Galaxy
  artifacts, docs, and harness-family parity stay in sync.
- `formation-entry-0.1.json` - first runtime entry/settle contract for the
  promoted Galaxian `formation_entry_start`, `formation_entry_settle`, and
  `formation_rack_complete` events.
- `frame-motion-conformance-0.1.json` - first CPU-only frame-proxy analysis
  over Galaxian rack, dive, flagship, and wrap reference windows.
- `game-spec-language-0.1.json` - Guardians-specific game specification
  language that ties stage bands, role families, movement primitives, scoring
  and result rules, audio/visual hooks, and promotion gates into a single
  adjustment contract before future runtime tuning.
- `identity-baseline-0.1.json` - first application-owned sprite, palette, audio,
  and timing contract for the development-only playable preview.
- `movement-pacing-0.1.json` - first runtime movement and pressure pacing
  contract for solo dives, flagship/escort dives, and wrap/return pressure.
- `motion-grammar-candidates-0.1.json` - shared motion-grammar candidate queue
  that maps Guardians movement opportunities to reusable primitives, axes,
  routeability gates, and next measurements before runtime promotion; the
  companion Markdown file is the reviewable planning queue.
- `object-track-conformance-0.1.json` - CPU-only connected-component and
  lower-field tracklet proxy over the Galaxian frame windows, used to set the
  next runtime-vs-reference tuning bands without changing constants by feel.
- `playtest-conformance-review-0.1.json` - playtest-weighted score layer that
  records the current audio, motion, and graphics gaps separately from
  evidence-coverage scoring so beta-facing preview decisions stay honest.
- `platform-frame-parity-0.1.json` - shared-Platinum support contract for
  Guardians sign-in, score failure/reporting copy, replay/video-prep framing,
  and arcade-music ownership.
- `long-surface-conformance-0.1.json` - longer-surface and persona review layer
  that scores stage-band pressure, stage-presentation progression, deterministic
  review personas, and the current midrun survivability gap.
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
- `routeability-before-after-0.1.json` - analysis-only stage-five candidate
  comparison showing baseline routeability `4.5/10` and the current best
  measured relief candidate at `5.8/10`; includes an SVG chart and does not
  change runtime constants. Use the Markdown and SVG companions for human
  review before any runtime promotion decision.
- `routeability-review-0.1.json` - player-routeability review that keeps
  movement pressure, persona survival, collision losses, and stage-five stress
  visible as a gate before future movement promotion.
- `score-progression-0.1.json` - first score-advance table, mission-language,
  wave-clear, and one-level mission-complete contract for the playable preview.
- `stage-rank-pressure-0.1.json` - bounded multi-stage pressure contract that
  preserves the measured stage-one timing while making stages three, five,
  seven, nine, and eleven measurably faster and denser for dives, shots, drift,
  and wrap pressure.
- `stage-five-galaxian-closeness-0.1.json` - stage-five planning gate that
  keeps routeability, alien ship movement pace, enemy missile pace, player
  missile pace, and single-shot cadence in one promotion signal before deeper
  gameplay candidates are promoted.
- `stage-five-lower-field-readability-spec-delta-0.1.json` - first formal
  game-spec delta for the next stage-five lower-field readability candidate;
  it preserves missile pace, single-shot cadence, and routeability floors while
  requiring a measured candidate harness before any runtime change.
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
