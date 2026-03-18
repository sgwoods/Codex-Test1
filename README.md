# Neo Galaga Tribute

Galaga-inspired browser shooter with keyboard controls, capture-and-rescue mechanics, multi-stage progression, and arcade-style tuning.

## Live

After GitHub Pages deploys, play at:

- `https://sgwoods.github.io/Codex-Test1/`

## Screenshot

![Gameplay Screenshot](./export.mov.png)

## Run Locally (macOS / Chrome)

1. Open Terminal in this folder:
   ```bash
   cd /Users/stevenwoods/Documents/Codex-Test1
   ```
2. Start a local server:
   ```bash
   python3 -m http.server 8000
   ```
3. Open:
   - `http://localhost:8000`

## Controls

- `Left/Right` or `A/D`: Move
- `Space`: Fire (arcade-style shot cap)
- `P`: Pause
- `F`: Fullscreen
- `U`: Ultra scale toggle
- `Enter`: Start / Restart
- `F1` or `?`: Open in-game feedback form
- `Export Log` button: Download the current gameplay session as JSON

## What Is Implemented

- Fixed arcade playfield with integer scaling and fullscreen letterboxing
- Stage progression with challenge stages
- Stage 1 scripted opening timing for consistency
- Boss capture beam, ship capture, rescue, and dual-fighter fire mode
- Enemy dive behavior and tuned missile pacing/spread
- Pixel-art sprite rendering and starfield
- Synthesized arcade-style SFX
- Local high score persistence via browser storage

## Development

- Editable source files live in:
  - `src/index.template.html`
  - `src/styles.css`
  - `src/js/00-boot.js`
  - `src/js/10-gameplay.js`
  - `src/js/20-render.js`
  - `src/js/90-harness.js`
- Served artifact:
  - `index.html`
- Build the served file from source with:
  ```bash
  npm run build
  ```
- Build script:
  - `tools/build/build-index.js`
- Auto deploy workflow: `.github/workflows/pages.yml`
- Durable reference material:
  - `/Users/stevenwoods/Documents/Codex-Test1/reference-artifacts/`

## Session Logging

- The game records keyboard events, major lifecycle events, and periodic gameplay snapshots
- Exported logs are downloaded as JSON from the in-game `Export Log` button
- Each export includes build metadata, browser/user agent, viewport info, input events, and game-state snapshots

## Gameplay Harness

- A local replay harness can run the game in Chrome, replay a saved session JSON, and write fresh `.webm` and `.json` artifacts into `harness-artifacts/`
- It uses your installed `/Applications/Google Chrome.app`
- Harness execution and artifact generation are local-only on your Mac; it does not use cloud compute
- Run it with a previously exported session:
  ```bash
  npm run harness -- --session /absolute/path/to/neo-galaga-session.json
  ```
- Or run one of the built-in scenarios:
  ```bash
  npm run harness -- --scenario stage3-challenge
  npm run harness -- --scenario stage4-five-ships
  npm run harness -- --scenario stage4-survival
  npm run harness -- --scenario stage1-descent
  npm run harness -- --scenario rescue-dual
  npm run harness -- --scenario second-capture-current
  ```
- Or run a seeded batch:
  ```bash
  npm run harness:batch -- --profile quick
  npm run harness:batch -- --profile fidelity
  npm run harness:batch -- --profile default
  npm run harness:batch -- --profile deep
  ```
- Output is written to a timestamped folder under:
  - `/Users/stevenwoods/Documents/Codex-Test1/harness-artifacts/`
- The harness writes a `summary.json` beside the generated artifacts, including:
  - seed used for the run
  - stage clears / challenge clears / ship losses
  - per-loss context such as recent attack starts, recent enemy bullets, nearby snapshot counts, and explicit death causes
  - capture/rescue markers such as capture start, fighter captured, and fighter rescued
  - dual-fire metrics such as average spread in the rescue scenario
  - descent-speed metrics such as time from attack start to lower-field crossing
  - whether the generated `.webm` contains audio
- Batch mode also writes:
  - `batch-report.json` with aggregate challenge hits, ship losses, total duration, and audio failures
  - `tuning-report.json` with prioritized findings to guide the next gameplay pass
  - later-stage diagnostics such as first-loss timing, loss clustering, attacker pressure at death, and bullet-vs-collision loss mix
  - the tuning report now considers both ship losses and how much of the stage-pressure scenario survived, so it can distinguish "died early" from "survived the full window but spent too many ships"
- Typical batch timings on this machine:
  - `quick`: about `1.5-2 minutes`
  - `default`: about `3-4 minutes`
  - `deep`: about `5-7 minutes`
- You can re-run the analyzer on an existing run folder:
  ```bash
  npm run harness:analyze -- --run /absolute/path/to/harness-artifacts/run-folder
  ```
- You can also regenerate the tuning summary for an existing batch:
  ```bash
  npm run harness:tune -- --batch /absolute/path/to/harness-artifacts/batch-folder
  ```
- You can import the latest self-play capture pair from your Downloads folder into `harness-artifacts/` and analyze it in one step:
  ```bash
  npm run harness:import-latest
  ```
- You can also check for a new self-play run without duplicating already imported files:
  ```bash
  npm run harness:check-latest
  ```
- Optional import flags:
  ```bash
  npm run harness:import-latest -- --session-id ngt-1773602145011-2
  npm run harness:import-latest -- --source /absolute/path/to/folder
  ```
- `harness:check-latest` keeps a small local state file in `harness-artifacts/` so scheduled scans can safely skip runs that were already imported
- Current tuning targets from the latest quick batch:
  - challenge-stage scoring is materially improved, but later-stage visual fidelity still needs work
  - Stage 4 pressure is now much healthier in the five-ship scenario
  - Stage 4 survival is still collision-driven and remains the main gameplay tuning target
  - deeper multi-stage progression is still needed for richer late-stage comparison

## Modem Feedback Integration

The game includes a floating `Feedback` button (top-right).

- Both `Feature Request` and `Bug Report` submissions post to FormSubmit, which forwards them to `default-dimiglyd88@inbox.modem.dev`
- If FormSubmit cannot send directly, the game falls back to opening a prefilled `mailto:` draft
- The submission body includes the report plus game metadata (build, timestamp, stage, score, lives, and user agent)

One-time setup:

- FormSubmit is free and does not require an account
- The first submission to a destination email triggers a confirmation email from FormSubmit that must be clicked once for that exact inbox address
