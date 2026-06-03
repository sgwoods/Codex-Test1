# Platform/App Separation Architecture Review

Date: June 3, 2026

Scope:

- `PLATINUM_ARCHITECTURE_OVERVIEW.md`
- `ARCHITECTURE.md`
- `APPLICATIONS_ON_PLATINUM.md`
- `src/js/03-platform-services.js`
- `src/js/05-supabase.js`
- `src/js/11-leaderboard-service.js`
- game-pack and adapter registration surfaces

## Executive Read

The platform/application separation is directionally strong enough for hosted
`/beta` and for continued multi-game work, but it is not yet fully clean. The
main runtime architecture is clearly split around Platinum-owned shell,
services, release lanes, and application-owned game packs. The remaining seams
are concentrated in platform-owned score, replay, and fallback identity paths.

Recommendation:

- acceptable for hosted `/dev` and hosted `/beta`
- not a production blocker by itself
- still worth another cleanup cycle before a stronger `1.4.1` production story

## What Is Working Well

1. Platform shell ownership is explicit.
   - `00-boot`, `01-runtime-shell`, the renderer shell, auth/session, replay,
     leaderboard UI, build/publish tooling, and hosted-lane surfaces are all
     clearly Platinum-owned.

2. Game installation is pack-based.
   - Aurora and Galaxy Guardians are represented through game-pack and adapter
     registration rather than by forking the whole app shell.

3. Release identity is layered.
   - Bundle/platform/application version surfaces already exist and are visible
     in release docs and the runtime.

4. Boundary harnesses exist.
   - The repo already carries platform-boundary harnesses as first-class checks,
     which is the right discipline for a multi-game host.

## Findings

### `P2` Platform-owned score/replay code still carries Aurora defaults

The cleanest concrete seam issue is in Platinum-owned score and replay code:

- `src/js/05-supabase.js`
- `src/js/11-leaderboard-service.js`
- `src/js/03-platform-services.js`

Examples:

- `src/js/05-supabase.js`
  - legacy cache prefix still names `neoGalaga`
  - fallback game identity still defaults to `aurora-galactica`
  - replay-catalog fallback still checks `window.__auroraReplayCatalog`
- `src/js/11-leaderboard-service.js`
  - several fallback identity paths still default to `aurora-galactica`
- `src/js/03-platform-services.js`
  - some row normalization still falls back to `aurora-galactica`

Why this matters:

- these are Platinum-owned services, so fallback identity should be game-neutral
  or explicitly registry-driven
- the current behavior is survivable, but it weakens the architectural story
  when a second game is now a real public concept rather than a thought
  experiment

Recommended cleanup:

1. replace Aurora-named fallback defaults with a single platform-owned neutral
   fallback helper
2. route replay and leaderboard identity through the active pack/registry
3. keep legacy prefixes only as migration aliases, not as the visible default

### `P3` Historical naming still leaks into platform storage language

Legacy names like `neoGalaga` are still acceptable as migration compatibility
markers, but they should be isolated behind explicit legacy comments so they are
not mistaken for current architecture.

## Architecture Recommendation For Release

Current release read:

- good enough for `/dev`
- good enough for `/beta`
- not the primary blocker for `1.4.1`

Primary blocker remains gameplay quality:

- overall quality scorer now reads `8.7/10`
- weakest category remains challenge-stage set-piece conformance at `4.2/10`

So the architecture recommendation is:

- keep the new `/dev` before `/beta` guardrail
- preserve the current pack/adapter boundary
- schedule one focused follow-up pass on platform-owned score/replay identity
  cleanup after the current beta review cycle

## Best Next Architecture Steps

1. Introduce a single platform-owned neutral fallback game identity helper.
2. Remove Aurora-specific default strings from Platinum-owned score/replay
   service paths.
3. Isolate legacy cache keys behind explicit migration-only naming.
4. Re-run the platform-boundary harness set after that cleanup.
