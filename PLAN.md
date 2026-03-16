# Neo Galaga Tribute Plan

## Current State

- Browser-based Galaga-inspired game implemented in a single file: `index.html`
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

## Working Assumptions

- The game should continue to run as a lightweight localhost-friendly Chrome experience
- Fidelity to original Galaga remains a primary product goal
- We now have a reproducible local tuning loop and should use it as the default evaluation path
- GitHub issues should mirror the active roadmap closely enough that we can pick up work later without re-deriving context

## Known Problems

- We do not yet know whether the Modem inbox address can complete FormSubmit's one-time activation flow
- Challenge-stage scoring has improved materially, but still needs visual/reference review against original Galaga
- Stage 4/5 pressure remains the main gameplay balance problem in the five-ship scenario
- Stage progression in the five-ship scenario is still too shallow for richer late-stage comparison
- Original reference videos remain helpful because the current automated harness measures outcomes, not visual fidelity on its own

## Latest Harness Signals

- Latest `quick` batch: `/Users/stevenwoods/Documents/Codex-Test1/harness-artifacts/batch-quick-2026-03-16T17-35-57-996Z`
- Audio capture is stable in the harness (`0` audio failures in the latest quick batch)
- Challenge scenario improved sharply to `24/40` hits (`60%` hit rate), which is materially closer to a readable Galaga-like challenge stage
- The stage-pressure scenario now survives the full window, but still spends too many ships and ends at Stage `4`
- The five-ship Stage `4` scenario now survives the full window in the latest tuning pass, but still loses ships too quickly and does not progress deeply enough
- New harness diagnostics now expose first-loss timing, loss clustering, and attacker pressure at death
- Current gameplay work should now focus primarily on later-stage survivability, spacing, and attack structure while preserving the improved challenge-stage behavior

## Workstreams

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

## Immediate Next Steps

1. Use `quick` harness batches as the default tuning loop
2. Preserve the improved challenge-stage pattern while refining visual fidelity against original footage
3. Reduce Stage 4/5 punishment in both the pressure and survival scenarios
4. Improve later-stage progression so Stage `4` scenarios reach deeper comparison territory
5. Add richer scenario coverage and better automated tuning metrics
6. Improve the late-stage visual presentation and high-score screen readability to match the stronger gameplay foundation
7. Return to artifact submission / Modem transport questions after gameplay tuning is in a stronger place
