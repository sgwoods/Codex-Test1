# Clean Local Candidate Acceptance

Date: October 14, 2026, America/New_York. Owner: Aurora Project Lead.
Verdict: local-source-freeze-pass. NOT beta-ready; no hosted release approval.

Source range: cf0e7a666067ede385865ba02e73d1454eb132d1 to
5d76dc73c8bbc4f43651fc1b96afc50b84eaca18 on codex/oct03-local-integration.
The checkpoint preserves 497 changed/new files, including prior accepted source,
supporting tools, historical trials and reference evidence. Rejected patches are
historical artifacts, not active candidate code.

## Exact Candidate

- Label: 1.4.1.1+build.1227.sha.5d76dc73; releaseChannel development; dirty false.
- Built October 14, 2026, 10:27 PM EDT using npm run build from the clean commit.
- Index SHA256: 6074264c0a85f8d037da7db95ee04108bcd1a76254705a916e4642a95045d04b.
- Enemy SHA256: 1f5df7a14c1b8819c6f73e885182d719e5e35b37fac82b545233db88e05dac31.
- Renderer SHA256: 0dc985230420bb1281a22992ca9cd78b8516196f81b19a6c1d71e7a761c036cc.
- Localhost HTTP index matched checkout dist/dev byte-for-byte. Existing Python
  PID 88856 has this repository as cwd and --directory dist/dev on port 8000.
- Full frozen build: private-artifacts/candidate-freeze-oct14/build.

The follow-up commit adds documentation/reports only. Do not relabel this artifact
with that later HEAD. Source/runtime freeze is the exact commit above. No beta
version or release-manifest change was made.

## Fresh Checks

- npm run build: pass, clean development build.
- harness:check:challenge-blue-exits: 34 cases pass; blue.json binds index hash.
- harness:check:challenge-late-clearance: ten cases pass; clearance.json binds hash.
- harness:check:challenge-recorded-shots: pass, stages 31/35/39 retain 37/33/37
  killed IDs and 80/48/50 shots. Zero lost/gained IDs or ship losses. Natural clear
  and next-stage spawn pass. Stage 35 retains the nine reviewed hit-time changes;
  the other two ordered event traces remain exact. Full replay: private-artifacts/
  candidate-freeze-oct14/shots.json.
- harness:check:challenge-motion-profile: pass on rebuilt candidate; complete
  output private-artifacts/candidate-freeze-oct14/motion.log.
- security:check:meta positive/negative fixtures, bounded late-combat VM fixtures
  (180 early comparisons), feasibility audit/options and non-template changed
  JavaScript syntax: pass. Boot placeholders require generated-build validation,
  not direct node --check of the template source.
- Cached whitespace: source/tools/docs/reports pass. Archived .patch context
  indentation warnings are preserved rather than rewriting historical evidence.

The first browser invocation was refused by the macOS filesystem sandbox before
browser execution; its local server was stopped. Repeated with approved scoped
escalation, the browser checks above completed successfully. No gameplay failure
or permission bypass is implied.

## Independent Reviews

Nash (01a10295-5ef0-7c01-b290-f0915f296150) reviewed actual gameplay source and
evidence read-only against cf0e7a66. No blocking correctness finding in the scoped
checkpoint; source/renderer/build hashes match accepted evidence. Did not rerun
tests independently. Fixed seeds, themes and sampled columns do not prove every
route, canonical fidelity or perfect feasibility.

Hypatia (01a1028d-2024-7d23-8645-c2f5fff55f0f) approved the bounded release/tooling
checkpoint read-only. Keep existing versions and rebuild clean rather than
relabeling dirty bytes. Did not independently rerun lead checks. Residual:
check-challenge-blue-exits.js:100 and check-challenge-late-clearance.js:96 use
numeric budget comparisons without explicit finite-value guards. This is a
nonblocking test robustness gap, not a demonstrated gameplay defect. The lead
separately asserted finite maxExitStep/observed joinStep and finite lifecycle
metrics in these fresh reports: 896 target measurements pass, including 286
documented wholly-offscreen missing joins. Queue explicit guards for future
test hardening; do not claim the gate alone rejects every malformed report.

## Release Boundary And Next Step

Three historical raw contact reports are about 68-69 MB each. Their original
bytes are preserved in this local checkpoint. Review repository-size and privacy
handling before remote delivery; no push has been attempted. Private artifacts
remain local and are not included in this commit's tracked source.

no-mistakes axi reports this repository is not initialized. No initialization,
pipeline/CI pass, PR or automatic push is claimed. Existing lane-specific gates
remain required. No main integration, dev/beta/production publish or Guardians
source changes occurred. Stage 7 authoring remains paused.

Player result: the tested smoother exits, ship separation and known shooting
opportunities are now reproducible from a committed source. This checkpoint adds
no new gameplay tuning. Existing visibility-window and pacing tradeoffs remain
as documented in blue-path-oct13. Next: review remote-delivery boundaries, then
matching authorized dev gates/review. Exact beta packaging/security/runtime,
sustained play, live login, audible audio and final approval remain open.
