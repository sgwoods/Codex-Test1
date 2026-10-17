# Password Recovery Repair

Date: October 17, 2026. Baseline: `ce9f0b74`.
Owner: Aurora Project Lead. Branch: `codex/local-review-music-status-oct16`.
Objective: the email recovery session must lead to a usable new-password form;
being signed in alone must not be treated as a saved password.

## Change

Capture URL recovery intent before SDK cleanup, subscribe before initial session
lookup, and enter the existing form when recovery is accepted. Consume the URL
hint once, and require an authenticated allowed user; the hint alone grants no
session. Synchronous auth callbacks do not await provider work under its lock.
Queued refresh work rejects obsolete clients/events. Same-user auth events do
not dismiss recovery or erase typed fields or the save-success notice.

Save explicitly validates input and calls updateUser once. Returned/rejected
errors release busy state and retain recovery for retry. Success clears recovery
and secret fields before profile refresh, so a profile failure cannot make a
saved password appear unfinished. Cancel clears fields without updating the
provider. Sign-out/account replacement clears recovery; panel close merely hides
it. Production test-account exclusion remains enforced before showing the form.

Independent review identified stale profile responses. The actual profile helper
now snapshots client/user identity and rejects stale results before seeding or
assigning. Already-issued requests cannot be undone by a later sign-out.

On narrow screens only, the recovery panel header scrolls with its content so
it cannot cover Save/Cancel. Normal account and leaderboard headers are unchanged.
No gameplay, music, deployment wrapper or frozen package change.

## Verification

- Actual auth/UI/profile-module fixture:12 cases pass; same checks against
  baseline fail11 cases. Provider/DOM boundaries are substituted, not auth logic.
- Real built DEV and isolated public-transformation browser checks pass:
  early recovery before getSession resolves, form visibility, auth persistence,
  close/reopen, invalid input with zero updates, returned/rejected save errors,
  explicit successful save, secret clearing, cancel and sign-out.
- Each browser fixture makes exactly3 synthetic update calls (two deliberate
  failures, one success), one synthetic sign-out and zero unexpected queries.
  External HTTP/WebSockets blocked; no real credentials, email token, password
  update, email request or account sign-out.
- Desktop1440x1100 and mobile390x844 screenshots inspected. Mobile pointer
  hit-tests verify unobstructed Save/Cancel after scrolling.
- Existing account-panel-to-game regression passes, including playfield focus
  and movement. Signed-in game-over identity, mocked score-submit success/failure
  and data-API contract checks also pass. Development build, executable-module
  syntax and diff checks pass.
  The Supabase source template has build placeholders; browser parsing validates
  its compiled output rather than node --check on the raw template.
- Two specialist reviews support bounded source/fixture acceptance. The profile
  identity and production-quarantine findings were fixed before acceptance.
- Repository code-review gate passes with zeroP0/P1 and two advisoryP2 tags;
  no full release preflight, source push or publication gate pass is claimed.
- Both599-file freezes and primary dist/beta remain unchanged.

Browser reports bind the exact tested HTML hash and test-method hash. Summary
records source hashes; test builds are working changes above the baseline, not
an accepted source-clean beta. Primary private evidence:
private-artifacts/password-recovery-oct17/{baseline.log,repaired.log,browser/}.
The isolated public-fixture-final/ uses unchanged canonical promotion tools but
dirty development input: it is a packaging regression fixture, NOT a release
candidate, freeze, approval or replacement for beta.2.

## Remaining Boundary

The repair is served on development localhost8000. Frozen beta.1 at8001 and
beta.2 at8002 retain their original bytes and do not contain it. No push or
publication. SDK/provider emailed-link parsing, cross-browser redirects, reload
mid-recovery, actual password policy and live password login are not established
by a fake provider. Human recovery/login acceptance remains required.

Next: prepare a separately versioned updated beta candidate, validate exact bytes
and repeat real email recovery and normal password login with the human. Reconcile
current main and matching authorized hosted DEV review, then run all final gates
before separately approved beta publication. No production publication.

Player benefit: a reset link opens the right form, failures offer a usable retry,
and success is clearly distinguished from simply having a signed-in session.

References checked October17:
https://supabase.com/docs/reference/javascript/auth-resetpasswordforemail
https://supabase.com/docs/reference/javascript/auth-onauthstatechange
