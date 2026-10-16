# Local Review And Music Status

Date: October 16, 2026. Owner: Aurora Project Lead.
Branch: `codex/local-review-music-status-oct16`. Baseline: `24ef849c`.

## Player Outcome

Use http://localhost:8000/ for current development and
http://localhost:8001/ for the unchanged frozen beta. Active setup guides,
viewer advertisement and the public-package browser harness use localhost.
Servers bind numeric loopback; this is not a hosted hostname or playlist change.
The old port 8000 wildcard listener was replaced with a loopback-only listener
serving this checkout's dist/dev. Origin preferences/sign-in do not migrate
automatically between numeric IP and localhost or between ports.

Music status now recovers missed player callbacks with a one-second scoped
probe. Iframe presence alone reports unconfirmed playback, not playing/audible.
Pause/end status and resume preserve user mute. Stop/remount rejects old-player
callbacks and removes timers. Warmup still requires playlist membership and
confirmed PLAYING, and remains muted until the user enables it.
The existing resolve-frame mutual recursion was removed: it could overflow when
the cached frame was absent. No music source, canonical phrase, game timing or
enemy behavior changed.

## Evidence

- Baseline full-runtime fixture: five failing cases, including loading despite
  player PLAYING and false playing from iframe presence. One stale/remount case
  exposed the pre-existing frame resolver recursion.
- Final full-runtime fixture: seven passing cases. It runs the complete shell
  with an external-player/DOM/clock fixture, not a rewritten state implementation.
  It does not prove real provider availability or human audibility.
- Independent review identified paused/buffering metadata incorrectly completing
  warmup; fixed by requiring PLAYING plus membership. Re-review: no blocker.
- Local-host API defaults, environment overrides, real viewer advertisement,
  homepage and runs endpoint: pass. Server listener remains numeric loopback.
- Browser dock controls and music request/restoration: pass.
- Real online DEV probe: media 3.526945 -> 15.551164 seconds, readyState4,
  unpaused/unmuted, no provider message or page errors; all five samples show
  Mute Arcade Music and application playing. Screenshot visually inspected.
- Exact frozen beta browser runtime/flows at localhost: pass, both games,
  start/game-over/restart, settings, public guards and 13 HTML policies. External
  network is blocked in that test; it does not test online music or live login.
- Frozen and dist/beta inventory: all 599 files unchanged; source `8e93394b`,
  index SHA256 `72f465c5ca9e53cd9cf69ebf34c0cc5be665a129ef4c1fca8b416210c775d313`.
- Development build, changed JavaScript syntax and diff whitespace checks: pass.

Primary private artifacts (persisted, not copied into public builds):
`private-artifacts/music-origin-oct16/repaired-local-probe.js`,
`repaired-local.json`, `repaired-local.png`, and `status-validation/`.
Machine-readable method/source hashes accompany this packet in summary.json.
Prior same-package origin comparison: `../music-origin-oct16/REVIEW.md`.

## Release Boundary

No push, deployment or beta/production change. The existing frozen beta does
not contain the status repair. A beta with this repair needs a new candidate
and fresh release gates. Do not silently replace the frozen 1.4.2-beta.1 bytes.
Live sign-in and human beta listening remain unverified. The local media check
does not establish universal provider policy, all playlists or future reliability.

Next: inspect current localhost, then prepare a new bounded beta candidate.
Player benefit: trustworthy music controls and fewer failed local review starts;
no gameplay-quality gain or beta-ready verdict is claimed by this packet.
