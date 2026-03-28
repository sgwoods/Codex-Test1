# Aurora Galactica Plan

## Current State

- Browser-based fixed-screen arcade shooter built from readable source modules and served from `dist/production/index.html`
- Build identity is now part of the product:
  - prerelease SemVer in `package.json` for the pre-production engineering line
  - production and production-beta labels derived from that source version during Aurora release builds
  - generated `dist/production/build-info.json`
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

### 7. Commentary-Ready Replay Telemetry

- Expand gameplay logging so a replay can be described beat-by-beat rather than just reconstructed mechanically
- Preserve stable timestamps and semantic event context so later tools can align commentary to replay or video
- Capture enough run-state detail to support future narrated replays, notable-play summaries, and richer post-game analysis

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
- `#81` Add commentary-ready gameplay telemetry for narrated replays

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

Current beta-review cluster:

- `#40` capture / rescue feedback
- `#73` shoot during beam-up
- `#77` capture escape drop-back recovery
- `#80` wait-mode carried fighter dock direction
- `#88` captured fighter disappears at top
- `#74` bonus spacing
- `#47` special squadron spacing
- `#45` boss damaged-text linger
- `#38` ship-loss feedback
- `#76` production vs non-production data separation design
- `#113` enforce production promotion only from approved beta

Current coding priority once those beta checks are confirmed:

1. `#76` production vs non-production data separation design
2. `#113` enforce production promotion only from approved beta
3. `#85` final release-readiness pass
4. `#74` / `#47` / `#38` / `#45` remaining visual polish with live confidence
5. `#40` / `#73` / `#77` / `#80` / `#88` remaining capture/rescue live confidence

Recent additions since the last review:

- `#95` is now the standing process reminder that persona ladders must be rechecked after meaningful difficulty changes.
- `#96` is a release-support watch item, not a fresh gameplay blocker:
  artifact-quality checks and repair landed, but recorder trust now needs to stay explicitly green.
- `#98` largely reflects cleanup that has already landed:
  generated artifacts moved under `dist/` and publish scripts now use scripted lane promotion.
- `#97` and `#99` are useful platform directions, but they should not displace the four-stage `1.0` slice.
- `#111` is now the explicit early post-`1.0` platform-refactor umbrella:
  ship `1.0` first, then extract a shared arcade platform so Aurora variants,
  Galaxian, and similar cabinet shooters can reuse the mature shell/replay/
  harness/build layer with less churn.
- `#110` has now crossed from concept into a shipped first cut:
  native in-game replay exists, so the remaining work is polish and follow-up
  behavior rather than whether replay should exist at all.
- `#112` is a fresh replay-exit regression:
  returning to wait mode after replay can restart idle audio unexpectedly, so
  replay exit needs to preserve a quiet wait state before the next production
  refresh.
- `#113` now tracks a release-process rule we want to harden before launch:
  production should only be promoted from an explicitly approved beta
  candidate, not directly from arbitrary dev output.
- Fresh Modem feedback on `2026-03-28` mostly reinforced the current shell/control-surface direction rather than changing the launch strategy:
  - `#105` is effectively a direct refinement of `#86` and is now treated as part of the same active shell pass
  - `#103` extends the shell pass by replacing the hand-toggle model with simultaneous support plus an input/help surface
  - `#107` reinforces the already-open `#79` control-feel concern rather than creating a meaningfully different launch bucket
  - `#104` is a stronger post-`v1` version of the Players Guide surface unless a lightweight manual viewer lands almost for free
  - `#106` is visible presentation polish and is worth keeping near the launch queue after the shell pass
- User direction for this review:
  - treat Stage `2` / `4` fairness tuning as a likely `1.1` experimental pass unless a fresh regression makes them launch-critical again
  - move broader challenge-stage variation/fidelity work out of the launch path
  - keep tooling/platform features post-`1.0`
  - spend remaining prelaunch energy on visible polish, trust, and stable graphical structure
  - keep recent icon, settings, HUD, and control-surface issues inside `v1`

| Bucket | Issue | Owner | Status | Evidence | Next Action | Plan Stage |
| --- | --- | --- | --- | --- | --- | --- |
| Must Fix Now | `#61` | Shared | Watching | Hosted Stage `3` -> `4` can still hit the empty-playfield edge case, which directly undermines public trust. | Keep transition telemetry live and treat the next reproducible bad run as launch-blocking. | Phase 1 |
| Must Fix Now | `#76` | Shared | Implemented on dev | Non-production lanes now use a production-score read-only mirror with local-only score saves by default; this still needs hosted confirmation and issue closure. | Refresh beta, confirm the read-only lane messaging and blocked submit path, then close if it holds. | Phase 4 |
| Must Fix Now | `#113` | Shared | Open | We now have a reliable deploy path, but production can still be promoted directly from the current dev line instead of only from an approved beta candidate. | Enforce dev -> beta -> production as the only supported release chain and fail production preflight unless the exact approved beta candidate is being promoted. | Phase 4 |
| Must Fix Now | `#85` | Shared | Open | Final release-readiness pass still needs security review, code/docs consistency, and a short players guide. | Schedule the final release-readiness cycle once the visual polish cluster is down to a short list. | Phase 4 |
| Must Fix Now | `#86` | Codex | Open | The production shell still needs the players-guide / account / scores / feedback-reporting / persistent-settings layout to feel intentionally shipped. | Finish the production-shell pass, move the remaining player actions into the icon/control surface, and confirm settings pause/resume cleanly during active play. | Phase 4 |
| Must Fix Now | `#103` / `#105` | Codex | Open | Fresh March 28 Modem feedback confirms the shell still wants bug-report promotion, tooltip-first icons, and simultaneous left/right-handed support without a mode toggle. | Finish the icon rail around tooltip-first controls, promote bug reporting into the rail, and replace the handed toggle with always-on combined controls plus a control index surface. | Phase 3 |
| Must Fix Now | `#91` | Codex | Open | The score header still wants stronger arcade alignment with the playfield top edge. | Lock the top HUD to the gameboard width and edge in the shell polish pass. | Phase 2 |
| Must Fix Now | `#48` | Codex | Open | The browser presentation still benefits from a clearer playfield frame / bezel so the arcade boundary reads immediately. | Finish a stable playfield frame treatment and keep it aligned with the HUD shell. | Phase 2 |
| Must Fix Now | `#44` | Codex | Open | A bottom-right stage indicator is part of the cabinet-like HUD language and belongs in the same visual shell pass as the top HUD/frame work. | Add the stage indicator as part of the HUD polish pass rather than as a separate later feature. | Phase 2 |
| Must Fix Now | `#82` | Codex | Automated check + shipped | The wait-mode score overlay now has a passing regression check and is live on beta/production with the centered overlay layout. | Keep the new wait-overlay check green and close after final manual confidence. | Phase 2 |
| Must Fix Now | `#49` / `#60` | Codex | Open | Score-view controls now belong to the player-facing shell, but their state changes/loading cues still feel too subtle. | Make score-view switches open or animate an explicit scoreboard/loading surface as part of the shell polish pass. | Phase 3 |
| Must Fix Now | `#74` | Codex | Open | Latest manual beta pass still says the three-ship bonus/special squadron is too spread out. | Tighten the three-ship attack geometry again and keep the squadron spacing check green. | Phase 2 |
| Must Fix Now | `#47` | Codex | Open | Latest manual beta pass still says the special squadron reads too loose visually. | Tighten lateral/vertical squadron coherence and recheck it in beta. | Phase 2 |
| Must Fix Now | `#38` | Codex | Beta review | Ship-loss feedback is better, but it is still one of the most visible “finished/not finished” signals in live play. | Verify and polish explosion, pause, and recovery feel. | Phase 2 |
| Must Fix Now | `#45` | Codex | Automated check + manual confirm | Automated first-hit visual regression now proves the boss flash appears and settles without a lingering oversized artifact. | Confirm boss first-hit feedback still looks clean in beta and close it if it does. | Phase 2 |
| Must Fix Now | `#112` | Codex | Automated check + shipped | Replay exit now has a passing regression check and the quiet-wait fix is live on beta/production. | Keep the replay-exit audio check green and close after one last manual confidence pass. | Phase 3 |
| Must Fix Now | `#40` | Codex | Partial automation + beta review | Automated checks now lock down the key capture/rescue banner wording and sequencing, but readability in motion still needs live confirmation. | Verify the updated beta capture feedback in manual play and close if it feels clear. | Phase 3 |
| Must Fix Now | `#80` | Codex | Beta review + automation | Carry-state automation now proves drag-up stays `below` and docked/wait-mode carried states render `above`, but the exact swap timing still needs live eyes. | Verify the fighter flips from below to above only at the correct top-dock moment in beta. | Phase 3 |
| Must Fix Now | `#88` | Codex | Low-risk beta confirm | Latest manual pass says the rest of the capture/carry cluster looks okay, and carry-visual automation now guards against the fighter disappearing at the top carried state. | Keep one more live confirmation while we close the remaining capture items. | Phase 3 |
| Should Fix Before Launch | `#78` | Codex | Automated check + manual confirm | Automated regression now proves challenge collisions kill the player while challenge fire stays off. | Keep the check green and confirm the live post-hit flow still reads correctly in beta. | Phase 1 |
| Should Fix Before Launch | `#77` | Codex | Automated check + low-risk manual confirm | Automated recovery check now proves beam-escape recovery returns the ship to the bottom row and allows post-escape firing. | Confirm the drop-back animation/control return still looks clean in beta. | Phase 3 |
| Should Fix | `#58` | Codex | Open | Capture rules are much improved but still not fully original. | Finish the rescue-fidelity pass. | Phase 3 |
| Should Fix | `#73` | Codex | Automated check + beta review | Automated shot-window checks now prove early beam-up shots work and late shots are correctly blocked. | Verify the feel/fairness of the shoot-to-save window in beta. | Phase 3 |
| Should Fix Before Launch | `#79` / `#107` | Codex | Beta review | The velocity-based control model is now in place, but fine single-tap alignment and overall feel still need final live confidence. | Keep the current movement baseline, do one more hosted beta pass, and only retune if fresh evidence says targeting still overshoots. | Phase 1 |
| Should Fix Before Launch | `#106` | Codex | Automated check + shipped | Between-level and in-game status messaging now uses a shared centered board-message path with a passing regression check, and the current implementation is live on beta/production. | Keep the board-message check green and close after one last visual confidence pass. | Phase 2 |
| Should Fix Before Launch | `#108` | Codex | Automated check + shipped | New-game spawn reset now has a passing restart regression check and matches the expected bottom-center start position. | Close after one last hosted confidence pass if no contradictory report appears. | Phase 1 |
| Should Fix Before Launch | `#109` | Codex | Resolved in behavior / close after docs confirm | Browser `Fn` is not reliable on the web, and the shipped left-hand mapping is now documented and implemented as `Ctrl` left / `Command` right. | Confirm the player guide/controls overlay wording is right in beta, then close as a clarified web-platform constraint. | Phase 3 |
| Should Fix | `#31` | Codex | Open | Minor public timestamp/date polish remains. | Clean the release date display. | Phase 3 |
| Should Fix Before Launch | `#71` | Codex | Queued | Audio control belongs in the shipped settings/control surface if it lands cleanly in the same shell work. | Pull mute into the `v1` settings pass rather than leaving it as indefinite polish. | Phase 3 |
| Should Fix Before Launch | `#95` | Shared | Process | We now use persona distributions to judge balance, so the ladder can drift silently after gameplay changes. | Re-run the persona ladder only if a prelaunch polish pass materially changes difficulty or control feel. | Phase 1 |
| Should Fix Before Launch | `#96` | Shared | Watch | Recorder repair, artifact quality checks, and salvage scripts landed; `64` historical videos are still unrecoverable but new runs are now checkable. | Keep `npm run harness:check:video-artifact` green and file immediately if new artifacts regress. | Phase 4 |
| Should Fix Before Launch | `#98` | Shared | Implemented / close | Dist-based release outputs, publish preflights, and scripted beta/production publishing are now in place. | Let the new flow soak briefly, then close the issue once no further migration fallout appears. | Phase 4 |
| Should Fix Before Launch | `#110` | Codex | First cut shipped / polish | Native in-game replay is now live and much cleaner, but it still wants final polish around playback presentation, state transitions, and follow-up behavior. | Keep replay as a shipped `v1` surface and finish only the highest-value polish/regression fixes. | Phase 3 |
| Can Slip | `#63` | Codex | Queued | Wait-mode score cycling is useful attract polish. | Do it in the attract-mode pass. | Phase 3 |
| Can Slip | `#104` | Codex | Queued | A richer in-game manual viewer is useful, but the current launch need is satisfied by a strong Players Guide entry point; search/PDF/embedded browsing can slip if needed. | Keep the guide icon for `v1`; revisit the full manual viewer if it falls out naturally from the shell work. | Phase 4 |
| Can Slip | `#49` / `#60` | Codex | Queued | The score panel still wants stronger cues and clearer invocation. | Polish score-view interaction after core gameplay work. | Phase 3 |
| Can Slip | `#65` | Codex | Queued | Aurora / wintry theming is still later polish. | Apply thematic art after gameplay stabilizes. | Phase 2 |
| Post-1.0 | `#18` | Shared | Deferred to 1.1 tuning | Stage `4` fairness tuning is important, but current manual play says the slice is healthy enough to launch without holding `1.0` for more experimental balancing. | Reopen as a focused `1.1` survivability/fairness pass after launch. | Post-1.0 |
| Post-1.0 | `#32` | Shared | Deferred to 1.1 tuning | Stage `2` tuning now looks more like iterative refinement than a blocker for the current slice. | Revisit in the same `1.1` experimental balancing pass as Stage `4`. | Post-1.0 |
| Post-1.0 | `#9` | Shared | Deferred with challenge variation work | Remaining challenge-stage fidelity/variation work is broader than the current launch need. | Group with broader challenge/reference expansion after `1.0`. | Post-1.0 |
| Post-1.0 | `#17` | Shared | Open | Stronger Galaga baseline work remains valuable, but it is no longer on the critical path to shipping the current slice. | Continue incrementally, but do not let it block launch. | Post-1.0 |
| Post-1.0 | `#19` / `#62` | Shared | Watch | Later-run and self-play balance regressions remain useful signals, but not launch-critical if manual play remains healthy. | Keep measuring them without promoting them over visible polish. | Post-1.0 |
| Post-1.0 | `#89` / `#90` / `#92` / `#97` | Shared | Open | Tooling, artifact workflow, and broader harness/platform improvements are useful leverage, but they are not required to ship the four-stage slice. | Keep them in the post-`1.0` tooling/platform lane. | Post-1.0 |
| Post-1.0 | `#99` / `#84` / `#83` / `#30` / `#26`-`#29` | Shared | Open | Theme/package/custom-stage work is strategically important, but it is platform expansion, not launch work. | Keep capturing seams now; do the full abstraction after launch. | Post-1.0 |

Items currently treated as post-`1.0` unless they become necessary for
external playtesting or operational stability:

- `#69` remote gameplay logs and optional video artifacts
- `#70` homepage recent plays / watch links
- `#17` broader reference baseline work
- `#18` / `#32` experimental Stage `2` / `4` tuning for `1.1`
- `#9` broader challenge-stage fidelity / variation work
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
4. Use the remaining prelaunch time to make the shell feel intentionally shipped:
   - top HUD alignment
   - playfield frame/bezel clarity
   - right-panel / settings / players-guide presentation
   - wait-mode visual stability
5. Pull forward only the narrow structural work that supports those polish passes:
   - centralize HUD/frame/chrome values
   - keep renderer-owned style tokens separate from gameplay logic where the seam is real
   - avoid a full theme/brand-package abstraction before launch

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
