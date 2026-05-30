# Arcade Music Lab

Small local webapp for isolating YouTube playback behavior from the Platinum cabinet.

## Start

```bash
npm run audio:lab
```

Then open:

```text
http://localhost:8310/
```

## What It Tests

- Current product playlist IDs
- A known-good control video
- A known-good direct-array control source
- Different playback strategies:
  - playlist via `playerVars`
  - playlist via `cuePlaylist(listType/list)`
  - direct video ID
  - direct array of video IDs
- Different host modes:
  - visible player
  - off-screen `1px`
  - off-screen `240px`

## Current Known Result

As of `2026-05-30` on this machine:

- The lab plays the control video `M7lc1UVf-VE` successfully from an off-screen host.
- The requested default playlist `PLeDzKA-Cr6s-8b_YaTTleSX-h3X2QdQCo` fails immediately with YouTube embed error `150`.
- The first tested tracks from the original Aurora and Guardians playlists also currently fail with embed error `150`.
- The exact off-screen/`1px` workaround still does not make that playlist playable here.

That means the local player path itself can work, but the requested playlist content is currently not usable as an embedded cabinet soundtrack in this environment.
