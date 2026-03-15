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

- Main game file: `index.html`
- Auto deploy workflow: `.github/workflows/pages.yml`

## Session Logging

- The game records keyboard events, major lifecycle events, and periodic gameplay snapshots
- Exported logs are downloaded as JSON from the in-game `Export Log` button
- Each export includes build metadata, browser/user agent, viewport info, input events, and game-state snapshots

## Modem Feedback Integration

The game includes a floating `Feedback` button (top-right).

- Both `Feature Request` and `Bug Report` submissions post to FormSubmit, which forwards them to `default-dimiglyd88@inbox.modem.dev`
- If FormSubmit cannot send directly, the game falls back to opening a prefilled `mailto:` draft
- The submission body includes the report plus game metadata (build, timestamp, stage, score, lives, and user agent)

One-time setup:

- FormSubmit is free and does not require an account
- The first submission to a destination email triggers a confirmation email from FormSubmit that must be clicked once for that exact inbox address
