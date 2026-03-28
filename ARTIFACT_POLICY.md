# Artifact Policy

This project has three distinct artifact locations. Treating them as separate on purpose avoids the recurring confusion between player exports, browser-local replay state, and the developer review archive.

## Policy

### 1. In-Game Player Replay State

This is the browser-native replay feature used by a player who launches the game in-browser with no extra setup.

- Storage:
  - browser-local `IndexedDB`
- Contents:
  - recent replay metadata
  - recent replay video blobs used by the in-game `🎞` replay surface
- Scope:
  - local to that browser/profile on that device
  - not intended as the canonical developer artifact archive

This is the right default for `dev`, `beta`, and `production` player use because it requires no filesystem access and works inside normal browser constraints.

### 2. Exported Player Capture Files

This is the explicit user-facing export path for logs and downloaded recordings.

- Current filenames:
  - `neo-galaga-session-*.json`
  - `neo-galaga-video-*.webm`
- Destination:
  - the browser download location
  - typically the user’s downloads directory
  - on macOS that is usually:
    - `~/Downloads/`

This is the correct export destination for `dev`, `beta`, and `production` because the browser controls download placement. The game should not promise a repo-local path for player-triggered downloads.

### 3. Canonical Developer Review Archive

This is the normalized artifact tree used by the harness, analyzer, and log viewer.

- Root:
  - `<workspace>/harness-artifacts/`
- Review-ready run folders should include:
  - `summary.json`
  - `neo-galaga-session-*.json`
  - `neo-galaga-video-*.review.webm` when available

This is the source of truth for:

- log viewer inspection
- synchronized event/video review
- harness analysis
- tuning reports
- durable review evidence inside the repo workspace

## Formal Workflow

### Dev

1. Player-triggered exports download through the browser into the user’s downloads location.
2. If the run should become a durable review artifact, import it into:
   - `<workspace>/harness-artifacts/`
3. Use:
   ```bash
   npm run harness:import-latest
   ```
4. Review it in the viewer or analyzer from the imported run folder.

### Beta / Production

1. In-game replay uses browser-local replay storage.
2. Explicit exports still go to the browser download location.
3. If we want a run to enter developer review, we import that downloaded pair into `<workspace>/harness-artifacts/` on a dev machine.

There is no separate filesystem export location for `beta` or `production`.

- `dev`: replay lives in browser storage, exports go to browser downloads
- `beta`: replay lives in browser storage, exports go to browser downloads
- `production`: replay lives in browser storage, exports go to browser downloads

## Non-Goals

- `dist/dev/`, `dist/beta/`, and `dist/production/` are not runtime capture archives.
- `export.mov.png` is a build snapshot artifact, not a session/replay artifact.
- The game should not imply that exported logs/videos automatically land in `<workspace>/harness-artifacts/`.

## Source of Truth

Going forward, use this distinction:

- `IndexedDB` = native local replay feature for players
- browser download directory = exported log/video files
- `<workspace>/harness-artifacts/` = canonical developer review archive after import/normalization

If documentation or UI text blurs those boundaries, treat it as a documentation bug and correct it.
