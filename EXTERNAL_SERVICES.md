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
- Data API tables:
  - `public.scores`
  - `public.profiles`
- Data API access contract:
  - `SUPABASE_DATA_API_ACCESS.md`
  - `supabase/data-api-access-contract.sql`
- Release gate:
  - `npm run harness:check:supabase-data-api-contract`
- Main runtime code:
  - `src/js/05-supabase.js`
  - `src/js/11-leaderboard-service.js`
  - `src/js/12-auth-session.js`
- Build token source:
  - `tools/build/build-index.js`
- Important date:
  - Supabase public-schema Data API grants must be explicit for new projects
    beginning May 30, 2026 and for existing projects by October 30, 2026.

### Web3Forms

- Service:
  - `https://api.web3forms.com/submit`
- Used for:
  - in-game bug reports
  - in-game feature requests
- Main runtime code:
  - `src/js/00-boot.js`

### YouTube Playlist Embed

- Status:
  - optional, configured by `release-manifest.json` and overrideable with `ARCADE_MUSIC_PLAYLIST_ID` or `NEXT_PUBLIC_ARCADE_MUSIC_PLAYLIST_ID` at build time
- Used for:
  - opt-in Arcade Music playback from the right rail
- Boundary:
  - the playlist embed is shell ambience, not Aurora reference audio
  - the game mute control remains scoped to game audio
  - high-score video upload credentials are not part of this client-side feature
- Main runtime code:
  - `src/js/01-runtime-shell.js`
- Build token source:
  - `tools/build/build-index.js`

### High-Score Video Posting

- Status:
  - planned only; no production upload path is currently enabled
- Intended use:
  - signed-in, authorized top-10 players may eventually request high-score video
    posting to a shared channel
  - score pages may eventually link to approved hosted video/replay records
- Boundary:
  - upload must be server-owned
  - no client-side YouTube upload credential, OAuth client secret, refresh token,
    or service account material may ship in browser code
  - a browser top-10 prompt can encourage sign-in, but cannot itself authorize or
    upload
- Required gate before implementation:
  - `SECURITY_AUTH_REPLAY_STORAGE_LOCKDOWN.md`
  - `SUPABASE_DATA_API_ACCESS.md`
  - `npm run harness:check:security-auth-replay-storage`
  - `npm run harness:check:supabase-data-api-contract`

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
  - `README.md`
  - `RELEASE_POLICY.md`

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
  - `tools/build/sync-public-pages.js`
  - `tools/build/verify-public-sync.js`

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
- Security boundary:
  - replay video remains browser-local until a server-owned upload policy,
    storage model, and release gate exist

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
- YouTube playlist embed, only when Arcade Music is configured

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
