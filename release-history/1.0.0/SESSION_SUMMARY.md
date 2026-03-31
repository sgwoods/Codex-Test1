# Release 1.0.0

## Scope

- release line: `1.0.0`
- phase: `launch`
- focus: ship the polished four-stage arcade slice as the official public baseline

## Major Outcomes

- promoted Aurora Galactica from prerelease development into the formal `1.0.0` launch line
- completed and documented the beta -> approve -> production promotion path
- reset the production leaderboard baseline so official public scoring starts from zero
- stabilized the pilot profile, replay viewer, popup surfaces, and launch shell for public use
- closed the major launch blocker cluster and narrowed post-launch work into a clear `1.x` track

## Major Product / Gameplay Changes Since The Previous Release

- fuller pilot profile card with sign-in, password reset, and flight history
- in-frame overlay surfaces for pilot, help, replay, scores, feedback, and settings
- replay launch improvements from both the replay library and pilot flight records
- stronger capture and rescue clarity, including rescued-fighter return through stage clear
- corrected ship-loss remaining-ships messaging
- tightened special squadron spacing and improved overall launch-shell coherence

## Release / Operations Changes

- production promotion now requires an explicitly approved beta candidate
- live lane verification is part of the publish path
- public build metadata no longer exposes non-production test-pilot identity
- the production leaderboard reset is now a documented release operation in source:
  - `/Users/stevenwoods/Documents/Codex-Test1/tools/build/reset-production-leaderboard.js`

## Post-Launch Follow-Up Track

The following work is intentionally moving into `1.x`:

- version-aware leaderboard tracking
- cleaner non-production Supabase separation
- stronger permanent pilot identity and account deletion model
- richer branded account emails
- control-centre and admin tooling
- shared authenticated pilot media and publishing
- HUD/operator refinements such as the bottom-right stage indicator

## Transcript Status

- this file is a structured release journal, not a guaranteed verbatim transcript
- if a raw chat export is later captured from Codex, it should be added as:
  - `/Users/stevenwoods/Documents/Codex-Test1/release-history/1.0.0/CHAT_TRANSCRIPT.md`
