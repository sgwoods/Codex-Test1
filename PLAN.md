# Aurora Galactica Plan

## Current State

- Browser-based fixed-screen arcade shooter built from readable source modules and served as `index.html`
- Build identity is now part of the product:
  - prerelease SemVer in `package.json` for the pre-production engineering line
  - production and production-beta labels derived from that source version during Aurora release builds
  - generated `build-info.json`
  - in-game settings drawer shows the current build label and Eastern release timestamp
- Hosted on GitHub Pages: `https://sgwoods.github.io/Aurora-Galactica/`
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
- Public status export now follows the shared `public` repo contract:
  - this repo updates its own public project page
- this repo updates its canonical public status manifest in `data/projects/aurora-galactica.json`
- and keeps the legacy compatibility alias in `data/projects/codex-test1.json`
  - this repo no longer rewrites the shared public homepage directly

## Working Assumptions

- The game should continue to run as a lightweight localhost-friendly Chrome experience
- Fidelity to original Galaga remains a primary product goal
- We now have a reproducible local tuning loop and should use it as the default evaluation path
- GitHub issues should mirror the active roadmap closely enough that we can pick up work later without re-deriving context
- Release recommendations should follow an explicit policy and roadmap rather than ad hoc judgment
- Official reference material such as manuals and curated clips should live under `/Users/stevenwoods/Documents/Codex-Test1/reference-artifacts/` so rules and visual comparisons are not stranded in Downloads
- Secondary sources such as walkthroughs should inform later-stage breadth and player-facing behavior, but should not override manuals or original gameplay footage on arcade-rule questions

## Known Problems

- We do not yet know whether the Modem inbox address can complete FormSubmit's one-time activation flow
- Stage 4 remains the main gameplay balance problem for the four-stage `1.0` slice
- Stage 4 failures are now better localized:
  - early formation-shot fairness
  - later escort / diagonal collision fairness
- Imported self-play summaries still need capture-driven life-loss accounting and better post-hit pause reporting in the day-to-day workflow
- Modem feedback is surfacing two current product concerns that should stay visible:
  - hit/explosion/post-hit pause feel
  - whether a stage should allow more than one successful fighter capture
- The Stage 4+ special three-ship boss squadron behavior is only partially closed:
  - bonus logic exists
  - but we still need it to show up naturally in gameplay and read clearly as a
    visible arcade event before the four-stage release is considered complete
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
- Latest four-stage `1.0` refresh on `2026-03-21` shows:
  - Stage 1 opening: acceptable
  - Stage 2 opening: acceptable
  - Stage 3 challenge: stable around `23/40`
  - Stage 4 still needs work, especially around mixed early-shot / later-escort pressure

## Workstreams

### 0. Release Management

- Maintain prerelease SemVer in the pre-production source line while deriving cleaner public production and production-beta labels for Aurora release builds
- Stamp every build with:
  - version
  - build number
  - commit
  - branch / dirty state
  - Eastern build timestamp
- Use `/Users/stevenwoods/Documents/Codex-Test1/RELEASE_POLICY.md` for bump guidance
- Use `/Users/stevenwoods/Documents/Codex-Test1/PRODUCT_ROADMAP.md` to decide when a minor-version milestone has actually been reached

### 1. Reference Baseline

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

### 2. Feedback Delivery

- Verify whether FormSubmit can be activated against the Modem inbox address
- If activation is impossible, replace FormSubmit with a more reliable free flow
- Keep in-game feedback UX intact even if transport changes

### 3. Gameplay Capture And Comparison

- Add in-game session logging for keyboard actions and game-state snapshots
- Add export/download of recorded sessions
- Add replay or watch mode for recorded sessions
- Use harness-generated `.webm` + `.json` artifacts as the default tuning input
- Pair local harness results with original Galaga reference clips for direct fidelity comparison

### 4. Fidelity Tuning

- Use captured traces plus original reference clips to tune:
  - formation spacing and screen composition
  - missile timing and density
  - dive timing and attack cadence
  - capture beam timing and geometry
  - player ship vertical placement
  - sprite sharpness, collision fairness, and stage/challenge presentation cards

### 5. Automated Play / Testing

- Replay harness is now working with seeded scenarios and session replays
- Keep extending the harness toward stronger coverage and more useful scoring behavior
- Reuse the same log format for replay and automated regression testing

### 6. Run Artifact Submission

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

## Go-Forward Plan

This is now the operating plan for the project.

### Immediate Product Goal: 1.0 Four-Stage Slice

The project is now targeting a smaller `1.0` sub-goal first:

- a polished Stage `1` through Stage `4` experience
- one cleaned-up challenge stage
- one solid capture / rescue loop
- stable local and hosted play
- persistent high scores and clean end-of-run flow

Expansion beyond Stage `4`, new theme systems, and broader content breadth are
still valuable, but they are now explicitly post-`1.0` work unless they are
needed to support this smaller shipped slice.

### Launch Blocking List

This is the maintained release view for the scoped four-stage `1.0` launch.
Use it as the default triage order until launch unless a new regression clearly
overrides it.

| Bucket | Issue | Owner | Status | Evidence | Next Action | Plan Stage |
| --- | --- | --- | --- | --- | --- | --- |
| Must Fix | `#18` | Codex | Open | Stage `4` still collapses in harness and manual play. | Tune the Stage `4` finish and escort pressure. | Phase 1 |
| Must Fix | `#61` | Shared | Watching | Hosted Stage `3` -> `4` still has an intermittent bad-transition edge case. | Keep transition telemetry live and capture the next failing run. | Phase 1 |
| Must Fix | `#32` | Codex | Tuning | Stage `2` improved, but live spacing/fairness still needs confirmation. | Keep manual and persona checks on Stage `2` pressure. | Phase 1 |
| Must Fix | `#64` | Codex | Open | Challenge enemies firing still breaks bonus-stage fidelity. | Disable enemy fire during challenge stages. | Phase 1 |
| Must Fix | `#9` | Codex | Open | Stage `3` challenge still is not close enough to original Galaga. | Tighten challenge behavior against reference. | Phase 1 |
| Must Fix | `#40` | Codex | Open | Capture / rescue still reads unclearly in live play. | Polish rescue feedback and readability. | Phase 3 |
| Must Fix | `#74` | Codex | Open | The three-kill bonus group is still too spread out to read well. | Tighten bonus-squadron spacing. | Phase 2 |
| Must Fix | `#47` | Codex | Open | Special squadron spacing and presentation are still too loose. | Compact special-squadron layout and presentation. | Phase 2 |
| Must Fix | `#38` | Codex | Open | Ship-hit feedback still does not feel release-ready. | Improve explosion, pause, and hit feedback. | Phase 2 |
| Must Fix | `#76` | Shared | Open | Production and non-production still share the same live score/data path. | Choose environment split and route non-production writes away from production by default. | Phase 4 |
| Should Fix | `#58` | Codex | Open | Capture rules are much improved but still not fully original. | Finish the rescue-fidelity pass. | Phase 3 |
| Should Fix | `#73` | Codex | Open | Players still cannot shoot during the early tractor-beam capture window. | Add the shoot-to-save capture moment. | Phase 3 |
| Should Fix | `#4` | Shared | Watch | Stage `1` feels acceptable manually, with mixed harness urgency. | Revisit only if evidence worsens. | Phase 1 |
| Should Fix | `#62` | Shared | Watch | Self-play can still fail early in Stage `1`. | Keep the persona baseline in view while tuning. | Phase 1 |
| Should Fix | `#31` | Codex | Open | Minor public timestamp/date polish remains. | Clean the release date display. | Phase 3 |
| Can Slip | `#63` | Codex | Queued | Wait-mode score cycling is useful attract polish. | Do it in the attract-mode pass. | Phase 3 |
| Can Slip | `#49` / `#60` | Codex | Queued | The score panel still wants stronger cues and clearer invocation. | Polish score-view interaction after core gameplay work. | Phase 3 |
| Can Slip | `#48` | Codex | Partial | The frame exists; decorative fidelity can still wait. | Add cabinet-style frame art later. | Phase 2 |
| Can Slip | `#65` | Codex | Queued | Aurora / wintry theming is still later polish. | Apply thematic art after gameplay stabilizes. | Phase 2 |
| Can Slip | `#71` | Codex | Queued | Mute is useful, but not launch-blocking. | Add an audio toggle in the UI. | Phase 3 |

Items currently treated as post-`1.0` unless they become necessary for
external playtesting or operational stability:

- `#69` remote gameplay logs and optional video artifacts
- `#70` homepage recent plays / watch links
- `#17` broader reference baseline work
- `#19` later-run collision-chain regression outside the four-stage slice
- replay, submission, theme-system, and broader public-workflow enhancements

### Track A. Autonomous Original-Galaga Baseline

1. Build and maintain a durable reference baseline using:
   - manuals
   - curated gameplay footage
   - emulator captures when available
   - secondary written references only where they help fill later-stage context
2. Map fidelity questions back to:
   - durable source artifacts
   - open GitHub issues
   - harness scenarios and measurable targets
   - the first challenge-stage baseline note now lives at:
     - `/Users/stevenwoods/Documents/Codex-Test1/reference-artifacts/analyses/first-challenge-stage/README.md`
3. Prefer reference-backed iteration over blind tuning whenever a rule or behavior question exists

### Track B. Collaborator Readiness

1. Keep onboarding docs, architecture docs, and reference maps current
2. Use issue labels and PR structure so work can be divided cleanly across collaborators
3. Keep harness evidence and source maps good enough that a new collaborator can move without reconstructing project history

### Working Rule

After each material step:

1. restate the high-level plan
2. note how the last change moved the roadmap
3. recommend the next best step in that context

### Phase 1. Stabilize The 1.0 Play Slice

1. Treat Stage `4` as the end of the current `1.0` game loop
2. Keep using the harness as the default loop for:
   - Stage `1` opening fidelity
   - Stage `2` opening pressure
   - Stage `3` challenge-stage fidelity
   - Stage `4` survival / fairness
3. Continue reducing collision-driven Stage `4` failures without breaking the
   stronger Stage `1`-`3` experience
4. Preserve the improved challenge-stage behavior and avoid broad difficulty
   sweeps that undo Stage `4` progress
5. Use Modem/manual-play feedback to decide where the harness needs one more scenario instead of guessing

### Phase 2. Raise Visual Fidelity

1. Compare our current board composition directly against the original reference sheets
2. Improve enemy silhouette/readability and tighten formation presentation
3. Refine explosions, starfield, and stage/challenge/game-over presentation until they feel more cabinet-authentic

### Phase 3. Finish 1.0 Arcade Systems

1. Revisit capture/rescue and dual-fighter behavior against original footage
2. Keep high-score entry, results flow, and release/build identity polished
3. Ensure the hosted build, public pages, and release metadata feel reliable
4. Add only the scenario coverage needed to validate the four-stage slice

### Phase 4. Ship The 1.0 Slice

1. Run a final 4-stage polish pass with both harness and real play
2. Confirm deployment / public page sync / release notes are stable
3. Cut a deliberate `1.0` candidate for the four-stage slice
4. Move expansion work into the post-`1.0` roadmap
## Updated Priority Order

1. Finish Stage `4` fairness for the four-stage `1.0` slice
2. Fix capture-driven life-loss accounting in imported/self-play summaries
3. Evaluate ship-hit feel and post-hit pause from short manual runs, then add or adjust metrics if needed
4. Add repeat-capture-per-stage validation so capture-rule issues are measurable
5. Move into `1.0` finishing polish once Stage `4` is good enough

1. Fix Stage `4` survivability and fairness so the four-stage loop feels winnable
2. Finish challenge-stage fidelity for the Stage `3` experience without
   destabilizing hit rate or readability
3. Polish capture/rescue usefulness and clarity within the four-stage slice
4. Make sure special three-ship boss squadron attacks and bonus presentation are
   present in the live four-stage slice, not just harness coverage
5. Tighten game-over, results, initials, high-score persistence, and release
   identity so the product feels intentionally shippable
6. Keep improving harness coverage only where it reduces guesswork for the
   four-stage `1.0` slice

### Phase 5. Productize The Workflow

1. Keep improving harness summaries and tuning reports where they meaningfully reduce guesswork
2. Return to artifact submission / Modem transport questions after the four-stage gameplay slice is stable
3. Treat deeper stage expansion, theme/template work, and broader content
   breadth as post-`1.0` roadmap items
