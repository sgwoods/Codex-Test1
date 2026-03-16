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
- Challenge-stage scoring is still too low in automated runs
- Stage 4/5 pressure remains too punishing in the five-ship scenario
- Stage progression in the five-ship scenario is still too shallow for richer late-stage comparison
- Original reference videos remain helpful because the current automated harness measures outcomes, not visual fidelity on its own

## Latest Harness Signals

- Latest `quick` batch: `/Users/stevenwoods/Documents/Codex-Test1/harness-artifacts/batch-quick-2026-03-16T17-10-40-903Z`
- Audio capture is now stable in the harness (`0` audio failures in the latest quick batch)
- Challenge scenario improved to `11/40` hits (`27.5%` hit rate), but that is still below a comfortable scoring window
- The stage-pressure scenario now survives the full window more reliably, but still spends too many ships and ends at Stage `4`
- The tuning report now needs to weigh survival duration alongside ship losses so we do not confuse "survived but paid heavily" with "died early"
- Current gameplay work should keep focusing on challenge readability and Stage 4/5 pressure smoothing before expanding scope

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
2. Improve challenge-stage scoring windows and readability
3. Reduce Stage 4/5 punishment in the five-ship scenario
4. Re-run the updated gameplay tuning against `quick` batches until the metrics move materially
5. Add richer scenario coverage and better automated tuning metrics
6. Return to artifact submission / Modem transport questions after gameplay tuning is in a stronger place
