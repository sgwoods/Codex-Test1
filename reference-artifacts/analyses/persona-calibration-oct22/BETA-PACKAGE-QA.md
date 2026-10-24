# Provisional Beta Package QA

Prepared October23 ET (October24 UTC). Not approved or published.
Source fde7357713860fcb4fb90d8afeab293f741523dc, the hosted dev checkpoint.
Package: private-artifacts/beta-candidate-personas-oct23/beta.
Label: 1.4.2-beta.4+build.1214.sha.fde73577.beta.
This is a provisional build, not a newly numbered beta release.
Index SHA256: dec6df872eede6a311c121eb7be09223529a45d60b2750df40e47f8f948cf224.
Inventory SHA256: 337007a1d73317fbee7723952ceaf515794a93ed601042f189825a02878a97a6.

Canonical promotion and PDF tools ran in an isolated staging directory. No
changes to dist/beta, hosted lanes, or the frozen package served on8002.
599-file inventory verified after tests; zero tracked security observations;
private reference-audio hash/path exclusion passed.

Exact-package account boundary PASS: controls enabled, test-account identities
stripped, checked score RPC present. Password-recovery browser PASS with mocked
Supabase; no live email or account mutation. Package smoke PASS: rendered canvas,
startup, public cue activity (playerShot/gameStart), Aurora Public Mix settings,
music60% and effects40%. Temporary smoke server stopped after testing.
Smoke report/screenshot: private-artifacts/beta-candidate-personas-oct23/smoke/.
Recovery report: private-artifacts/password-recovery-oct17/browser/explicit/.

Remaining: assign next beta version/release notes before final freeze; rerun
checks on that final identity; final packaged replay/scoring coverage and live
account/audio acceptance as applicable; explicit publication approval. Prior
beta.4 live scores are evidence of service health, not new-package acceptance.
Expert limitation accepted. Empty leaderboard padding remains known UI debt.
