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
- Feedback delivery currently uses FormSubmit to forward to `default-dimiglyd88@inbox.modem.dev`
- If FormSubmit direct send fails, the game falls back to a prefilled `mailto:` draft

## Working Assumptions

- The game should continue to run as a lightweight localhost-friendly Chrome experience
- Fidelity to original Galaga remains a primary product goal
- We want better reproducibility for tuning, not just ad hoc visual comparisons
- GitHub issues should mirror the active roadmap closely enough that we can pick up work later without re-deriving context

## Known Problems

- We do not yet know whether the Modem inbox address can complete FormSubmit's one-time activation flow
- We do not yet have a structured gameplay capture system for comparing user inputs and rendered output against original Galaga footage
- Gameplay tuning is still based on manual observation rather than repeatable traces

## Workstreams

### 1. Feedback Delivery

- Verify whether FormSubmit can be activated against the Modem inbox address
- If activation is impossible, replace FormSubmit with a more reliable free flow
- Keep in-game feedback UX intact even if transport changes

### 2. Gameplay Capture And Comparison

- Add in-game session logging for keyboard actions and game-state snapshots
- Add export/download of recorded sessions
- Add replay or watch mode for recorded sessions
- Pair session logs with screen recordings for direct comparison to original Galaga footage

### 3. Fidelity Tuning

- Use captured traces plus original reference clips to tune:
  - formation spacing and screen composition
  - missile timing and density
  - dive timing and attack cadence
  - capture beam timing and geometry
  - player ship vertical placement

### 4. Automated Play / Testing

- Build a synthetic player that can operate headlessly
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

1. Resolve `#7` by confirming whether FormSubmit activation can be completed through Modem inbox
2. Implement `#6` structured gameplay logging
3. Implement `#5` replay mode using the same session log format
4. Use `#4` to tune early-stage fidelity with logs plus reference video
5. Design and evaluate a reliable artifact submission workflow for video + JSON run captures
