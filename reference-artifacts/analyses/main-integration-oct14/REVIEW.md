# Local Main Integration Acceptance

Date: October 14, 2026, America/New_York; raw UTC run names use October 15.
Verdict: local-main-integration-pass. Beta is NOT READY.
Authorization: step 2 review and local integration only; no push or publication.

## Source And Scope

Fresh origin/main: 181d8e296a9c0324c59b0ff8a8712c35a379e7a3.
Integrated source: 14607bed5bdb961e9ee8a7695836bc3e7b3a5da9.
Local main was clean and advanced with git merge --ff-only from the sanitized
delivery branch. Preservation history was not an integration parent. No conflicts,
resets, force updates, source tuning, version assignment or authority change.
The follow-up commit records only documentation/evidence, not gameplay edits.

The complete operational range contains 13 changed source files, earlier accepted
platform/Guardians changes and release/test tooling. Nash reviewed gameplay,
adapter/trial isolation, Guardians leader/escort capacity and launcher behavior,
combat-stage ceiling, cadence/audio and renderer bounds. Hypatia reviewed release
tooling, private-audio boundaries, security-meta coverage, wrapper behavior and
documentation/preservation constraints. Both approve bounded local integration;
no new blocking source issue found. This is not universal fidelity or release
certification. The existing continuity finite-value hardening item is nonblocking.

## Exact Tested Integrated Build

- Label: 1.4.1.1+build.1191.sha.14607bed; development; dirty false at build.
- Index SHA256: 7876635a86d75ae280a715b2fb6222300fa9b4be2a602e5cab787b14f0935b13.
- Localhost HTTP bytes match this checkout's dist/dev. Existing port8000 server
  remains on the primary checkout, now main, not the temporary delivery worktree.
- Entire build: private-artifacts/main-integration-oct14/build.
- A lower commit-count build number follows the sanitized linear history. It is
  not older gameplay; version plus source SHA and artifact hash identify it.

Fresh blue.json and clearance.json bind this hash and pass 34 and ten cases.
Saved real-input replays retain 37/33/37 killed targets, 80/48/50 shots, no lost or
gained target IDs, no ship losses and natural next-stage progression. Stage35 has
the nine previously accepted hit-time changes; the other ordered traces remain
exact. Tests retain their existing fixed-seed/theme/column/60Hz limitations.
They do not prove all routes, exact Galaga geometry or perfect feasibility.

Other checks on clean integrated main:

- Gameplay-adapter boundaries: pass.
- Guardians high-score ownership: pass, no Aurora score cross-contamination.
- Development schedule-trial valid/ordinary/invalid/Stage3/direct cases: pass.
  Temporary nondevelopment-channel fixture rejects the trial. This is not a
  packaged-beta check or full ordinary UI restart acceptance.
- Bounded late-combat VM checks: pass; not a fresh full combat-runtime sweep.
- Result audio continuity: both challengePerfect and challengeResults play the
  full four-second source without explicit stop across forced Stage3->4 handoff.
  First invocation failed during networkidle navigation before audio measurement;
  a single unchanged retry passed. This is controlled private-reference technical
  continuity, not natural outcome/audio mixing/public-package audibility approval.

Pre-integration delivery-worktree checks also pass: pack registry, renderer
boundaries, both-pack boot, Guardians Stage5 runtime policy, runtime slice and
review launcher, including development-only controls and persona selection.
The preliminary delivery artifact was marked dirty solely by two ignored-folder
setup symlinks. Those were replaced by actual ignored directories containing
dependency/fixture links; no source or ignore-rule change was made. Those checks
are supporting candidate-code evidence, not mislabeled final-main artifact checks.

One attempted npm alias for schedule-trial-launch did not exist; the existing
script was executed directly and passed. No package-script addition was needed.
The initial sandbox fetch/merge attempts failed due to environment permissions;
scoped escalated retries succeeded. No guard was weakened. All sessions finished.

## Evidence And Private Archive

summary.json contains public-safe measured results. The raw main shooting replay,
audio report with original build metadata, preliminary/final command logs and
exact build remain privately retained under private-artifacts/main-integration-
oct14. New account-bearing raw metadata was not added to the public evidence.
Both this directory and the sanitized-delivery private archive root are owner-only.

Private archive original/zip checks and recovery remain verified locally. Time
Machine inspection could not establish a usable backup; this is not proof that
none exists. No off-machine copy/recovery has been verified. Approval to copy the
archive into the existing private iCloud library is pending; no transfer occurred.
An off-machine private copy, hash inventory and one recovery are required before
relying on the sanitized branch as the durable replacement at first source push.
Keep the preservation branch and original private archive intact meanwhile.

## Remaining Steps

3. Prepare/review local freshness and release evidence. Resolve private backup and
   obtain explicit sanitized-source push approval. Push main, fetch and verify
   local main equals origin/main, then run the final clean dev preflight. Existing
   publish readiness checks require that equality. If freshness creates another
   evidence commit, repeat the authorized push/equality cycle; stop and classify
   repeated sequencing churn instead of bypassing gates.
4. Separately authorized DEV ONLY publication, hosted identity/lane verification
   and public-safe hosted smoke. Player outcome: reviewed gameplay survives hosting.
5. Assign/freeze exact beta version and package inventory. Outcome: one test build.
6. Exact-package security/runtime and scoped gameplay checks. Outcome: packaging
   retains fair paths, shooting opportunities, cadence and public boundaries.
7. Bounded sustained play plus live login/reset/settings and audible audio checks.
   Outcome: dependable sessions, settings and sound; report account limitations.
8. Final candidate review and explicit beta publication approval; publish/verify
   beta through its gates. Production remains a later separate decision.

No dev preflight success, remote readiness, full no-mistakes/CI pipeline, hosted
review, beta acceptance or publication is claimed here. Step2 preserves accepted
gameplay on a reviewed local release source; it adds no new gameplay tuning.
