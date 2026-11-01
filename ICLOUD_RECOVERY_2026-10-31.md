# Interim iCloud Recovery Archive

User authorized an iCloud Drive archive on October 31, 2026. Scope is the
156-file Expert body-veto evidence set, not all private project artifacts.

## Created And Verified Locally

- Destination: `~/Library/Mobile Documents/com~apple~CloudDocs/Aurora-Recovery/2026-10-31-expert-evidence/`.
- Files: `expert-evidence-2026-10-31.tar.enc`, `receipt.json`, `RESTORE.md`.
- Encrypted archive: 9,192,480 bytes.
- SHA256: `9eeb36ea860bc85995fa4ed3c38ad7f0eff0fa460b4d570fb96cefcf64d4a4d8`.
- Source manifest: `5cd7b1c61a87e748bc6650bb3fd905c362c0291d376c960e9327666dc6ceb1d6`.
- All 156 compressed and raw hashes verified; 138 JSON files parsed.
- Encryption/decryption round trip and extracted-file hashes verified.
- iCloud-folder copy checksum verified; no existing archives replaced.

Uses OpenSSL AES-256-CBC with PBKDF2-HMAC-SHA256, 200,000 iterations,
and a randomly generated 256-bit passphrase. Verify archive checksum against
an independently retained receipt before decryption. This is not authenticated
encryption and is not an immutable backup service.

Private method and receipt:
`private-artifacts/icloud-recovery-oct31/archive.js` and
`private-artifacts/icloud-recovery-oct31/package-v1/receipt.json`.
The restricted-permission recovery key is at
`private-artifacts/icloud-recovery-oct31/package-v1/RECOVERY-KEY.txt`.
The key was not printed, uploaded, or committed by the agent.
On October 31 the user reported preserving it in Apple Passwords under the
exact entry name **Codex-test-1 Backup Key** (Not Shared group). Search that
entry when recovery is needed; no secret value is recorded in these notes.
The user subsequently confirmed saving the entry and adding the archive notes.
Password-manager retrieval on another device has not been independently tested.

## Download Restore Verified November 1

Agent observed the archive on iCloud.com. User reports downloading it into
`~/Downloads/expert-evidence-2026-10-31.tar.enc`.
That downloaded file is exactly 9,192,480 bytes and matches the encrypted
SHA256 above. Decryption and tar checksum passed; a fresh extraction verified
the manifest and all 156 compressed/raw hashes, and parsed 138 JSON files.

Receipt: `private-artifacts/icloud-recovery-oct31/download-restore-nov01-5FNWLi/receipt.json`.
Method: `private-artifacts/icloud-recovery-oct31/verify-download.js`.
This completes the bounded evidence-archive restore check with user-reported
download provenance. It used the existing local key, not a fresh retrieval
from Apple Passwords. Full lost-machine/key recovery remains untested.
Other private evidence sets are not covered. No Supabase data or repository
was backed up. Original artifacts and the downloaded archive are preserved.
