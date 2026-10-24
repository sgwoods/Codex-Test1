# Aurora Galactica 1.4.2-beta.5

Date: October 24, 2026. Lane: beta review. Production remains 1.4.1.
This note defines the candidate scope. Deployment is confirmed separately by
the hosted lane's build-info.json and the release verification receipt.

## Player Changes

- Signed-in human runs can save scores separately for Aurora and Guardians.
  Guests keep local scores. Watch and rival AI scores do not become human scores.
- New account-linked scores remain unverified. Sign-in is not proof of fair play.
- Password recovery has an explicit new-password form and retryable save action.
  The recovery URL must be allowed in the Supabase project configuration.
- Professional play uses the accepted capture/rescue and hazard policy. Tests,
  Watch and supported rival play use the same controller rules.
- New replay/profile records preserve displayed stage, completion time and score
  identity. Existing duplicate or older records are not rewritten.
- Accepted challenge changes shorten result waits, preserve canonical audio,
  improve readable exits and retain shooting opportunities. Later combat is bounded.
- Music status reports confirmed playback. Private reference audio stays local.

## Measured Personas

Ten seeded Aurora runs per tier, each limited to 900 seconds:

| Persona | Median score | Scope |
| --- | ---: | --- |
| Beginner | 7,235 | Measured panel, not a guaranteed range |
| Intermediate | 21,995 | Measured panel, not a guaranteed range |
| Expert | 81,275 | Six of ten reached 75,000 |
| Professional | 240,785 | Ten reached 150,000; nine reached 200,000 |

Time-limited runs are not final career scores. These measurements do not apply
to Guardians. Expert consistency is an accepted beta limitation. Wizard and
further calibration are separate work, not included in this release.
Evidence and charts: reference-artifacts/analyses/persona-score-history/README.md.
The rejected October 22 safety trial is not part of the runtime.

## Validation And Limits

Earlier beta.4 human acceptance saved Aurora 102410/Stage13 and Guardians
1320/Stage1, retained them after refresh and retrieved them in a separate browser.
Exact beta.5 packaging, security, recovery and smoke checks must pass before
publication. Automated recovery uses a mock service; it sends no email.
Final hosted acceptance remains necessary before production promotion.

Known limits: legacy history duplicates, sparse leaderboard placeholder rows,
no complete server-side gameplay validation, and incomplete Galaga conformance.
Stage 7 research remains paused. Guardians remains a playable preview.

## Release Discipline

Publish only from clean main matching origin/main on the authority Mac.
Publish and verify matching dev before beta. Freeze beta bytes after tests.
The release gate checks documentation source hashes, exact lane release-note
metadata and generated documents in addition to existing conformance checks.
Do not change database records or promote production as part of this release.

## Production Comparison

Verified production: 1.4.1+build.1164.sha.54398ff5, June 11, 2026.
Compared with that release, this beta offers account score persistence instead
of guarded public submission, stronger Professional play, recovery/history
repairs and the accepted October challenge-flow improvements.
These are sufficient reasons for beta review. They are not proof of production
readiness. Require exact-hosted account/recovery, audio and sustained-play
acceptance, production security/review gates and a separate release decision.
