# External Services

This document is the current source of truth for external services used by
Aurora Galactica, what they are used for, and what is local-only instead.

## Runtime Services

### Supabase

- Service:
  - `https://iddyodcknmxupavnuuwg.supabase.co`
- Used for:
  - pilot account sign-up and sign-in
  - authenticated pilot profile data
  - shared leaderboard data
  - validated score views
  - player-specific score views such as `mine`
- Main runtime code:
  - `/Users/stevenwoods/Documents/Codex-Test1/src/js/05-supabase.js`
- Build token source:
  - `/Users/stevenwoods/Documents/Codex-Test1/tools/build/build-index.js`

### Web3Forms

- Service:
  - `https://api.web3forms.com/submit`
- Used for:
  - in-game bug reports
  - in-game feature requests
- Main runtime code:
  - `/Users/stevenwoods/Documents/Codex-Test1/src/js/00-boot.js`

## Hosting And Delivery

### GitHub Pages

- Production:
  - `https://sgwoods.github.io/Aurora-Galactica/`
- Beta:
  - `https://sgwoods.github.io/Aurora-Galactica/beta/`
- Also hosts:
  - player guide
  - project guide
  - release dashboard
- Used for:
  - public delivery of the playable game and public documentation surfaces
- Main policy docs:
  - `/Users/stevenwoods/Documents/Codex-Test1/README.md`
  - `/Users/stevenwoods/Documents/Codex-Test1/RELEASE_POLICY.md`

## Development And Release Tooling

### GitHub

- Repositories:
  - `https://github.com/sgwoods/Codex-Test1`
  - `https://github.com/sgwoods/Aurora-Galactica`
- Used for:
  - source control
  - issue tracking
  - release publishing
  - public artifact hosting workflow
- Also used by:
  - the local log viewer issue-creation flow through `gh`

### GitHub API

- Used by:
  - public sync verification
  - public project-page sync tooling
- Main scripts:
  - `/Users/stevenwoods/Documents/Codex-Test1/tools/build/sync-public-pages.js`
  - `/Users/stevenwoods/Documents/Codex-Test1/tools/build/verify-public-sync.js`

## Local-Only Or Browser-Native Systems

These are not external services.

### Browser Storage

- Used for:
  - local high scores
  - local settings
  - local replay catalog
- Backed by:
  - `localStorage`
  - `IndexedDB`

### Browser Recording

- Used for:
  - native local replay capture
- Backed by:
  - `MediaRecorder`

### Local Dev Services

- Local game server:
  - `http://localhost:8000`
- Local log viewer:
  - `http://127.0.0.1:4311/`
- Used for:
  - development
  - artifact review
  - harness/video debugging
- These are not production dependencies.

## Practical Summary

### Player-Facing External Runtime Dependencies

- Supabase
- Web3Forms

### Hosting Dependencies

- GitHub Pages

### Developer And Release Dependencies

- GitHub
- GitHub API

### Not External

- replay storage
- replay capture
- local dev server
- local log viewer
