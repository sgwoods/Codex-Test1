# Security/Auth/Replay Storage Lock-Down

This is the release-facing lock-down rule set for account, score, replay, and
future high-score video work. It exists because the next flashy platform
features touch trust boundaries: authenticated players, top-10 score posting,
local replay video, and possible future server storage.

## Current Rule

Top-10 video posting is authenticated and authorized only. A top-10 local run may
prompt the player to sign in, but posting eligibility requires a signed-in,
email-confirmed account in an auth-enabled lane. The browser may show the prompt
and local replay link; it must not upload to YouTube directly.

No YouTube upload token or OAuth client secret ships in browser code. Arcade
Music may embed a configured YouTube Music playlist through
`youtube-nocookie.com`, but that is ambience playback, not upload authority.

Replay video is browser-local IndexedDB by default. The current replay catalog is
a local player feature, not canonical cloud storage and not a public publishing
surface. Future hosted replay/video posting must use a server-owned upload
policy with a documented data model, RLS posture, and explicit release gate.

Production score trust remains separate from client-side display eligibility.
The current browser can display local score/replay links and can submit the
existing score payload through Supabase, but any future verified public video
claim needs server-owned authorization and storage rules before it can be called
trusted.

## Lane Rules

| Lane | Auth | Score Writes | Replay Storage | Video Posting |
| --- | --- | --- | --- | --- |
| `localhost` | configured test pilots when Supabase is configured; harness can bypass | local by default; harness may force writes | browser-local IndexedDB | disabled until server-owned flow exists |
| hosted `/dev` | configured test pilots only | configured test pilots only | browser-local IndexedDB | gated prompt only |
| hosted `/beta` | configured test pilots only | configured test pilots only | browser-local IndexedDB | gated prompt only |
| hosted `/production` | public accounts, test pilot disabled | production score policy | browser-local IndexedDB | disabled until server-owned flow exists |

## Required Gate

Run:

```bash
npm run harness:check:security-auth-replay-storage
```

Publish preflight runs this check. It verifies:

- browser source contains no Supabase service-role material
- browser source contains no OAuth client secret or YouTube upload endpoint
- top-10 video-posting eligibility requires signed-in confirmed auth
- non-production auth is limited to configured test pilots
- production disables configured test pilot accounts
- replay storage remains browser-local IndexedDB
- release docs expose the storage and auth boundaries

## Future Server-Owned Posting Gate

Before YouTube high-score posting or hosted replay/video storage can move past a
prototype:

- add the Supabase table/RPC/storage model to
  `supabase/data-api-access-contract.sql`
- document grants and RLS in `SUPABASE_DATA_API_ACCESS.md`
- keep upload credentials server-side only
- bind the posted video to score id, game key, build label, replay id, user id,
  and moderation/status fields
- add a harness that proves unsigned users and unconfirmed users cannot request
  posting
- add a release note and dashboard row showing the trust model and remaining
  risks
