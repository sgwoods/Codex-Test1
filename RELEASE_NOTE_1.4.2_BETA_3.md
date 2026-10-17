# Password Recovery Local Candidate

Date: October 17, 2026.
Local preparation: DEV 1.4.1.4 and beta 1.4.2-beta.3.
Neither lane has been published by this preparation.

Recovery now opens the new-password form before session initialization finishes.
Ordinary same-user auth events preserve recovery and typed input. Save validates
input, retains retry after errors, and clears secrets only after explicit success.
Cancel Reset and sign-out clear recovery; closing/reopening the panel preserves
it. Delayed profile/client results cannot restore a replaced session. Production
test-account exclusions remain enforced. Mobile recovery actions stay reachable.

The accepted music-status repair and prior gameplay work remain included.
No new gameplay, playlist or canonical audio change. Platform/game versions are
unchanged. Beta.3 is a separate local package; beta.1 and beta.2 are preserved,
not relabeled or overwritten. Canonical promotion retains this shared DEV-note
provenance rather than independently rendering beta-note HTML.

Exact-package checks and controlled fake-provider tests do not establish a real
password reset. Human emailed-link recovery, explicit new-password save, normal
password login and audible audio remain required. Current main, matching hosted
DEV review and final release gates remain required before separately authorized
beta publication. No production publication is authorized. Online score writes
remain guarded pending server validation.
