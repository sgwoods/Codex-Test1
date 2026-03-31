# Aurora Galactica Development Status Update

Current state:

- `1.0.0` is now live in production
- the beta -> approve -> production release path is proven in real release use
- the production leaderboard baseline is clean for official post-launch scoring

Recently completed:

- non-production and production lane behavior clarified and hardened
- production promotion now requires an approved beta candidate
- pilot profile, replay viewer, and in-frame popup surfaces were stabilized
- ship-loss messaging bug fixed and regression-covered
- launch blocker plan and release-readiness review refreshed
- public build metadata no longer exposes non-production test-pilot identity
  fields
- the production leaderboard reset for the true `1.0` baseline was completed

Immediate post-launch focus:

- begin the structured `1.x` refinement track without reopening `1.0` scope
- keep the live production scoreboard and pilot flows stable
- move planned identity, admin, and media improvements into their tracked `1.x`
  issues

What is intentionally moving to `1.x`:

- version-aware leaderboard tracking:
  - `#129`
- cleaner non-production Supabase split:
  - `#126`
- stronger pilot identity/account model:
  - `#127`
- richer account email branding:
  - `#128`
- control-centre/admin tooling:
  - `#124`
- shared authenticated pilot media and publishing:
  - `#121`
- broader HUD/operator refinements such as the bottom-right stage indicator:
  - `#44`

Release lanes right now:

- beta:
  - `1.0.0-beta.1+build.276.sha.a59c5ad.beta`
- production:
  - `1.0.0+build.276.sha.a59c5ad`

Guiding principle:

- keep `1.0` focused on the shipped four-stage arcade slice
- move broader admin/platform/media refinements into `1.x` without muddying
  the launch decision
