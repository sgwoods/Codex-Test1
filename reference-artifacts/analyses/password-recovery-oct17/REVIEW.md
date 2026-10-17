# Password Recovery Acceptance Blocker

Date: October 17, 2026. Diagnostic baseline: `c291b3ee`.
Local beta.2 source: `a809a3d5`, build1201, review localhost8002.

## Human Observation

The user clicked the Supabase reset-email link, returned to a signed-in game,
and received no prompt for a new password. Screenshot shows PILOT SGW.
This establishes the reported recovery-link access, not a saved new password,
normal password-login acceptance or an independently verified backend session.
No password, recovery URL, token or credentials were requested or recorded.

## Diagnosis

Supabase documents two steps: email recovery establishes an authenticated session;
the application must then prompt for and explicitly update the password.
Source: https://supabase.com/docs/reference/javascript/auth-resetpasswordforemail

Executing the complete current auth module against a fake Supabase boundary
reproduces two defects in its registered callback:

- PASSWORD_RECOVERY sets recoveryMode1 but leaves accountPanelOpen0, rather
  than invoking the existing enterRecoveryMode UI path.
- A subsequent SIGNED_IN clears recoveryMode0 without a completed password save.

Initialization registers the listener after getSession and profile work, which
also needs event-ordering investigation. These source-level reproductions do not
identify the exact live sequence behind the user's email-link observation.
The existing password-save function is present; no save was attempted here.

Primary evidence: private-artifacts/password-recovery-oct17 contains the user
screenshot, probe.js and report.json. The probe executes the real module with
fake session/event/profile boundaries and no real network or account mutation.
It is a defect reproduction, not a repaired regression test or end-to-end proof.

## Decision And Next Step

Hold beta acceptance. Do not treat the signed-in badge as password-reset success.
No runtime repair, package change, publication, sign-out or real password update
was performed. Both frozen candidates remain preserved.

Repair recovery initialization and UI lifecycle in a separate bounded change.
Test initial recovery, event-before-session ordering, later sign-in/token events,
form visibility, mismatch/invalid input, update failure, explicit successful save
and sign-out/cancel. Use a fake provider first; never mutate the user's password
as an automated test. Then validate a new candidate and repeat human recovery
and normal-password login checks before release.

Player benefit: a reset link leads to a clear, usable new-password form rather
than leaving the player signed in but uncertain whether the password changed.
