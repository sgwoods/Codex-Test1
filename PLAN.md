# Neo Galaga Tribute Plan

## Current State

- Browser-based Galaga-inspired game built from readable source modules and served as `index.html`
- Hosted on GitHub Pages: `https://sgwoods.github.io/Codex-Test1/`
- Core gameplay implemented:
  - stage progression
  - capture / rescue / dual-fighter flow
  - challenge stages
  - fullscreen and ultra scale
  - in-game feedback form
- Local automation harness implemented:
  - session replay in Chrome
  - seeded scenario runs
  - batch execution
  - automatic artifact analysis and tuning reports
- Feedback delivery currently uses FormSubmit to forward to `default-dimiglyd88@inbox.modem.dev`
- If FormSubmit direct send fails, the game falls back to a prefilled `mailto:` draft
- High-score entry now supports Galaga-style three-letter initials with arcade-flavored cursor/input behavior

## Working Assumptions

- The game should continue to run as a lightweight localhost-friendly Chrome experience
- Fidelity to original Galaga remains a primary product goal
- We now have a reproducible local tuning loop and should use it as the default evaluation path
- GitHub issues should mirror the active roadmap closely enough that we can pick up work later without re-deriving context
- Official reference material such as manuals and curated clips should live under `/Users/stevenwoods/Documents/Codex-Test1/reference-artifacts/` so rules and visual comparisons are not stranded in Downloads
- Secondary sources such as walkthroughs should inform later-stage breadth and player-facing behavior, but should not override manuals or original gameplay footage on arcade-rule questions

## Known Problems

- We do not yet know whether the Modem inbox address can complete FormSubmit's one-time activation flow
- Challenge-stage scoring has improved materially, but manual-driven group bonuses and results presentation are still missing
- Stage 4 survival remains the main gameplay balance problem, and diagnostics show it is primarily collision-driven
- Stage progression in the five-ship scenario is still too shallow for richer late-stage comparison
- Later-stage enemy variety is still far below Galaga's broader stage-band content
- Original reference videos remain helpful because the current automated harness measures outcomes, not visual fidelity on its own

## Latest Harness Signals

- Latest `quick` batch: `/Users/stevenwoods/Documents/Codex-Test1/harness-artifacts/batch-quick-2026-03-18T20-22-44-404Z`
- Latest `fidelity` batch: `/Users/stevenwoods/Documents/Codex-Test1/harness-artifacts/batch-fidelity-2026-03-18T20-26-14-680Z`
- Audio capture is stable in the harness (`0` audio failures in the latest quick batch)
- Challenge scenario is currently strong at about `26/40` hits (`65%` hit rate in the latest quick batch)
- The Stage `4` five-ship scenario still survives the full scenario window, but the average progression is still shallow and losses skew toward collisions
- The Stage `4` survival scenario still reaches only Stage `4`, confirming later-stage progression remains limited even when survivability improves
- New harness diagnostics now expose first-loss timing, loss clustering, attacker pressure at death, and explicit death causes
- Fidelity harness now confirms:
  - Stage `1` descent baseline is about `1.20s`
  - rescue dual-shot spread is `28px`
  - the dedicated second-capture scenario is now blocked as intended
- Current gameplay work should now focus primarily on collision-driven later-stage survivability, later-stage enemy/content breadth, and visual fidelity against original Galaga footage

## Workstreams

### 0. Reference Baseline

- Use `/Users/stevenwoods/Documents/Codex-Test1/reference-artifacts/` as the durable home for manuals, curated clips, and analysis notes
- Pull concrete gameplay rules from the 1981 Namco manual before inventing behavior from memory
- Cross-check manual rules against original gameplay footage whenever the manual is ambiguous or incomplete
- Use walkthroughs only as secondary references for later-stage variety, progression patterns, and player-visible behavior in ports
- Favor measurable baseline facts such as:
  - challenge-stage cadence and bonus structure
  - capture / rescue constraints
  - stage-transition and results-screen flow
  - special attack squadron behavior from Stage `4` onward
  - later-stage enemy family / transform cadence

### 1. Feedback Delivery

- Verify whether FormSubmit can be activated against the Modem inbox address
- If activation is impossible, replace FormSubmit with a more reliable free flow
- Keep in-game feedback UX intact even if transport changes

### 2. Gameplay Capture And Comparison

- Add in-game session logging for keyboard actions and game-state snapshots
- Add export/download of recorded sessions
- Add replay or watch mode for recorded sessions
- Use harness-generated `.webm` + `.json` artifacts as the default tuning input
- Pair local harness results with original Galaga reference clips for direct fidelity comparison

### 3. Fidelity Tuning

- Use captured traces plus original reference clips to tune:
  - formation spacing and screen composition
  - missile timing and density
  - dive timing and attack cadence
  - capture beam timing and geometry
  - player ship vertical placement
  - sprite sharpness, collision fairness, and stage/challenge presentation cards

### 4. Automated Play / Testing

- Replay harness is now working with seeded scenarios and session replays
- Keep extending the harness toward stronger coverage and more useful scoring behavior
- Reuse the same log format for replay and automated regression testing

### 5. Run Artifact Submission

- Add a `Submit Run` flow that packages a gameplay video and matching JSON log together
- Use external storage for large artifacts instead of trying to send them through email
- Prefer GitHub issues as the durable tracking surface for submitted gameplay samples
- Evaluate Google Drive as low-cost public artifact storage, with explicit handling for permissions and link generation
- Keep manual fallback paths available when upload fails

## GitHub Issue Map

- `#3` Synthetic user agent for headless gameplay with session replay
- `#4` Tune Stage 1 fidelity against original Galaga reference footage
- `#5` Add replay / watch mode for recorded sessions
- `#6` Add gameplay session logging and export
- `#7` Verify FormSubmit activation against Modem inbox
- `#8` Design `Submit Run` flow using GitHub issues plus Google Drive artifact storage
- `#20` Model manual-accurate captured-fighter destruction scoring
- `#21` Add special three-ship attack squadron bonuses from the manual
- `#22` Implement manual-accurate challenge-stage bonus scoring
- `#23` Add Galaga-style results screen before initials entry

## Revised Plan

### Phase 1. Stabilize Later-Stage Gameplay

1. Keep using the harness as the default loop for Stage `4` and Stage `5`
2. Continue reducing collision-driven deaths in the Stage `4` survival scenario
3. Preserve the improved challenge-stage behavior and avoid broad difficulty sweeps that undo Stage `4` progress

### Phase 2. Raise Visual Fidelity

1. Compare our current board composition directly against the original reference sheets
2. Improve enemy silhouette/readability and tighten formation presentation
3. Refine explosions, starfield, and stage/challenge/game-over presentation until they feel more cabinet-authentic

### Phase 3. Deepen Arcade Systems

1. Revisit capture/rescue and dual-fighter behavior against original footage
2. Add manual-accurate post-game flow, challenge bonuses, and results presentation
3. Improve later-stage progression and enemy variety so automated scenarios reach deeper comparison territory
4. Add more scenario coverage for rescue, challenge, and late-board cleanup behavior
5. Incorporate manual-driven rules that are not yet modeled:
   - challenge-stage complete-group bonuses
   - special attack squadron bonuses from Stage `4` onward
   - results/statistics flow before initials entry

## Updated Priority Order

1. Fix later-stage survivability and progression, especially Stage `4` collision pressure and the shallow five-ship progression benchmark
2. Implement high-confidence manual-driven fidelity items:
   - challenge-stage group bonuses
   - results screen before initials entry
   - special three-ship attack squadron bonuses
3. Expand later-stage content variety using manual and walkthrough evidence, while keeping manual/video sources primary for rule accuracy
4. Revisit capture / rescue edge cases and captured-fighter scoring behavior once the baseline rules and later-stage pacing are steadier
5. Keep improving harness coverage so new fidelity work becomes measurable instead of purely visual

### Phase 4. Productize The Workflow

1. Keep improving harness summaries and tuning reports where they meaningfully reduce guesswork
2. Return to artifact submission / Modem transport questions after gameplay tuning is in a stronger place
3. Decide when the hosted version is good enough to treat as a wider-playtest build rather than an internal tuning build
