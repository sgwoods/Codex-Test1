# Aurora Galactica Development Status Update

Current state:

- the four-stage `1.0` slice is now ready for the formal `1.0.0` launch push
- the beta -> approve -> production release path is proven
- the production leaderboard baseline has been reset cleanly

Recently completed:

- non-production and production lane behavior clarified and hardened
- production promotion now requires an approved beta candidate
- pilot profile, replay viewer, and in-frame popup surfaces were stabilized
- ship-loss messaging bug fixed and regression-covered
- launch blocker plan and release-readiness review refreshed
- public build metadata no longer exposes non-production test-pilot identity
  fields
- the production leaderboard reset for the true `1.0` baseline was completed

What remains before the true `1.0` launch:

- publish the official `1.0.0` beta candidate
- approve that beta candidate
- promote the approved `1.0.0` build to production

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
  - next target: `1.0.0-beta.1`
- production:
  - current live: `0.5.0+build.273.sha.d168628`

Guiding principle:

- keep `1.0` focused on the shipped four-stage arcade slice
- move broader admin/platform/media refinements into `1.x` without muddying
  the launch decision
