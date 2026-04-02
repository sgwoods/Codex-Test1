# Aurora Galactica 1.0 Release Readiness Review

This document is the explicit final-release review artifact for `#85`.

It is meant to answer one question clearly:

- are we ready to ship the scoped four-stage `1.0` slice with acceptable
  product trust, documentation, and operational safety?

## Status

Current status:

- implemented on the dev line
- not the active coding priority while higher-risk gameplay and presentation
  blockers remain open
- intended to be rechecked one last time immediately before final `1.0`
  production sign-off

## Scope Covered

This review tracks the release-readiness scope promised in `#85`:

- security review of the codebase and deployment posture
- code and documentation consistency for the shipped `1.0` slice
- public-facing naming and release-language consistency
- presence of a concise player-facing guide in the shipped experience

## Security Review

### Current external/runtime surfaces

The shipped game currently relies on:

- Supabase for pilot auth and shared score data
- FormSubmit to send bug reports / feature requests
- a Modem inbox destination behind that feedback path
- GitHub Pages for beta and production hosting

The canonical inventory lives in:

- `/Users/stevenwoods/Documents/Codex-Test1/EXTERNAL_SERVICES.md`

### Resolved or mitigated

- Production and non-production score writes are no longer mixed by default:
  - beta/dev use a read-only production-score mirror with local score save
    behavior unless an explicitly configured non-production test pilot is
    signed in
- Production promotion is now gated on an explicitly approved beta candidate:
  - `npm run publish:beta`
  - review beta
  - `npm run approve:beta`
  - `npm run publish:production`
- Public Pages deploy verification now checks the live lane label/build info
  after publishing
- Player replay remains browser-local by default, which avoids introducing a
  new remote media surface into the `1.0` launch path
- Public build metadata no longer exposes non-production test-pilot identity
  fields such as test email or user id

### Accepted risks for 1.0

- The current hosted product still depends on third-party auth/feedback
  services rather than a fully self-owned operational stack
- Beta/dev test-pilot support is still a launch-era compromise, not the final
  long-term account/admin model
- A hosted admin/control centre does not yet exist

## Documentation And Public Surface Review

### Current shipped player-facing documentation

- Player guide source:
  - `/Users/stevenwoods/Documents/Codex-Test1/player-guide.json`
- Generated local player guide:
  - `/Users/stevenwoods/Documents/Codex-Test1/dist/dev/player-guide.html`
- Public production player guide:
  - `https://sgwoods.github.io/Aurora-Galactica/player-guide.html`

The in-game guide icon is already wired to the player-facing guide rather than
the developer/project guide.

### Current developer/project documentation

Primary maintained docs:

- `/Users/stevenwoods/Documents/Codex-Test1/README.md`
- `/Users/stevenwoods/Documents/Codex-Test1/PLAN.md`
- `/Users/stevenwoods/Documents/Codex-Test1/PRODUCT_ROADMAP.md`
- `/Users/stevenwoods/Documents/Codex-Test1/RELEASE_POLICY.md`
- `/Users/stevenwoods/Documents/Codex-Test1/ARCHITECTURE.md`
- `/Users/stevenwoods/Documents/Codex-Test1/EXTERNAL_SERVICES.md`
- `/Users/stevenwoods/Documents/Codex-Test1/ARTIFACT_POLICY.md`

### Consistency status

Consistent today:

- product name: `Aurora Galactica`
- lane naming: `development`, `production beta`, `production`
- player guide is distinct from project/developer documentation
- release path is documented as:
  - dev -> beta -> approve -> production

Still worth a final check before production sign-off:

- all public pages use consistent version and lane language
- player-facing text avoids leaking development/testing phrasing
- auth/reset email branding is still generic third-party mail and is tracked
  separately for future polish

## Player Guide Readiness

The player guide requirement for `#85` is already satisfied in substance:

- a concise player-facing guide exists
- it is generated in the normal build
- it is linked from the shipped in-game experience

The remaining work here is not creation, but final wording polish if we choose
to do one short prelaunch pass.

## Operational Readiness

### Release chain

The supported release chain is now:

1. build dev output
2. publish beta
3. review beta
4. approve beta
5. publish production from that approved beta artifact

Key commands:

```bash
npm run publish:beta
npm run approve:beta
npm run publish:production
```

### Current hotfix candidate evidence

For the shipped score-submit and refresh-reminder hotfix line on `f77ca58`,
the following evidence was in place before production promotion:

- build passes on the current source line:
  - `npm run build`
- focused regression passes for the repaired score-submit path:
  - `/Users/stevenwoods/Documents/Codex-Test1/tools/harness/check-remote-score-submit.js`
  - evidence captured by the check:
    - immediate remote submit at game over for a locked signed-in pilot
    - payload includes expected score and stage
    - successful submit marks `remoteSubmitted = 1`
    - failed submit writes a persistent local diagnostics entry
    - failed submit preserves a bug-report-ready diagnostics payload
- adjacent production account feedback regression still passes:
  - `/Users/stevenwoods/Documents/Codex-Test1/tools/harness/check-production-account-feedback.js`
- beta review path succeeded for the refresh reminder:
  - hosted beta review link showed the reminder state
  - `Refresh Now` was confirmed visible and clickable
  - the one-shot beta hint cleared after refresh so the reminder disappeared on
    the next load
- beta publish succeeded for the approved candidate:
  - `1.0.0-beta.1+build.284.sha.f77ca58.beta`
- production publish succeeded from the approved beta artifact:
  - `1.0.0+build.284.sha.f77ca58`

That means the hotfix was promoted through the normal path with both automated
and manual evidence, not rushed directly into production.

### Current `1.0.1` hotfix evidence

For the production `1.0.1` hotfix on `14398e9`, the following evidence was in
place before production promotion:

- build passes on the current source line:
  - `npm run build`
- focused input-mapping regression passes:
  - `/Users/stevenwoods/Documents/Codex-Test1/tools/harness/check-input-mapping.js`
  - evidence captured by the check:
    - `A` and `Z` both move left
    - `D` and `C` both move right
    - arrow keys still work
    - blur clears active movement and zeroes horizontal drift
- focused feedback client regression passes:
  - `/Users/stevenwoods/Documents/Codex-Test1/tools/harness/check-feedback-submit-path.js`
  - evidence captured by the check:
    - direct send remains the intended primary path
    - failure path still opens a mail fallback
    - diagnostics persist in the local system log
- adjacent score-submit regression still passes:
  - `/Users/stevenwoods/Documents/Codex-Test1/tools/harness/check-remote-score-submit.js`
- adjacent production account feedback regression still passes:
  - `/Users/stevenwoods/Documents/Codex-Test1/tools/harness/check-production-account-feedback.js`
- hosted beta review confirmed:
  - left/right controls no longer latch the ship after focus loss
  - browser feedback submission succeeded using the new Web3Forms path
  - feedback success confirmation remained visible long enough to read
- beta publish succeeded for the approved candidate:
  - `1.0.1-beta.1+build.288.sha.14398e9.beta`
- production publish succeeded from the approved beta artifact:
  - `1.0.1+build.288.sha.14398e9`

That means `1.0.1` followed the documented hotfix process with a small scoped
change set, focused regressions, hosted beta confirmation, approved beta
promotion, and live production verification.

### Current `1.0.2` hotfix evidence

For the production `1.0.2` hotfix on `831a2c6`, the following evidence was in
place before production promotion:

- build passes on the current source line:
  - `npm run build`
- mandatory hotfix smoke suite passes:
  - `npm run harness:check:hotfix-smoke`
  - evidence captured by the suite:
    - playable left and right movement distance for `ArrowLeft`, `A`, `Z`, `ArrowRight`, `D`, and `C`
    - no repeated input-reset events during active movement
    - popup surfaces still open and fit correctly
    - direct feedback success and fallback diagnostics still behave correctly
    - remote score submit still succeeds on the happy path and degrades cleanly on failure
- hosted beta input probe passes:
  - `npm run harness:check:live-input:beta`
  - evidence captured by the probe:
    - live beta movement mapping matches the intended control layout
    - hosted beta movement distance is strong enough to be playable
    - hosted beta movement is not interrupted by repeated input resets
- beta preflight now verifies expected test-pilot emails are embedded when non-production auth is intended
- hosted beta review confirmed:
  - left and right movement works normally for both-hand mappings
  - the beta artifact contains the intended test-pilot lane configuration
- beta publish succeeded for the approved candidate:
  - `1.0.2-beta.1+build.290.sha.831a2c6.beta`
- production publish succeeded from the approved beta artifact:
  - `1.0.2+build.290.sha.831a2c6`

That means `1.0.2` closed the live movement regression with both stronger local
gates and a hosted-lane verification step before production promotion.

### Launch-significant operational checks

Before final `1.0` sign-off, confirm:

- beta is the reviewed candidate we intend to ship
- the approved-beta gate is working in a real production rehearsal
- non-production score/account behavior still matches the intended lane policy
- live public version labels match the expected promoted build
- the pre-`1.0` production leaderboard reset for `#130` has been inspected,
  executed, and verified against the live shared score view

## Recommendation

`#85` should remain in the launch list until the remaining higher-priority
gameplay/presentation blockers are reduced to a short final pass.

At that point, this review should be reopened for one deliberate final sweep,
not treated as an always-open vague blocker.

Practical interpretation:

- implemented on dev as a concrete review/checklist artifact
- final sign-off still pending
- should be revisited immediately before the last production launch decision
