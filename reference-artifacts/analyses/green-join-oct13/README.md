# Later Green Join Repair

October 13, 2026. COMPLETE: revision B accepted and integrated locally.
No commit, push or publication. Beta remains blocked by blue-path defects.

## Accepted Result

Source SHA256: 200861b97e05faa2f424f2d138d682da768853fdc5d98078f36566dada339a53.
Integrated localhost bundle: 7e79f0c6cb6fbd2d6cb83adb9490b84d0516596ce9689aa0206e09ebcfdd5405.
Build 1.4.1.1+build.1226.sha.cf0e7a66.dirty, October 13 11:46 EDT.
Lead verified HTTP bytes equal this checkout's dist/dev/index.html. The existing
Python listener serves this checkout. Reload an existing tab to get the new build.

| Check | Result |
| --- | --- |
| Largest observed later-green join | 203.248 -> 1.022 game pixels per frame |
| Peak transition step at 60Hz | 11.377px, below unchanged 12px budget |
| Normal-key kills at 31/35/39 | 37/33/37, identical shot/kill/loss events |
| No-fire natural clear, later stages | 12.133s, unchanged |
| Later last-visible-to-clear tail | 0.216s, unchanged |
| Clear-to-next-stage spawn | 4.433-4.434s, unchanged |
| Two-theme integrated gate | Ten cases pass |
| Controls and normal-arrow probes | Seven stages, twelve column pairs; unrelated paths exact |
| Full-view target count | 40/40 per tested stage |
| Existing motion-profile, build, syntax, diff checks | Pass |

The analytical bridge matches position and tangent at u=9.7 and recovers the
existing exit after 0.66 local-u (about 0.380s in these fixtures). It applies
before shared offsets and the accepted clearance envelope. The former sampling
cache is absent. Offscreen monotonic retirement waits until the bridge settles.
Supplemental actual-function VM checks cover 32 captured authored fixtures,
repeated clocks, boundary derivatives and sampled legacy-cull/no-return behavior.
These tests are bounded, not universal or interval-arithmetic proofs.

Lead inspected matching Crown boundary frames and Classic bridge frames.
The measured target stays near its previous lower-right position instead of
jumping to the upper field. This supports removal of the visible discontinuity;
static frames do not establish exact original speed or complete perceptual quality.
Independent final review approves the source and measured tradeoffs. All worker
checks completed, and the worker confirmed no test sessions remain running.

Explicit tradeoff: one green per later stage loses one 60Hz full-view sample,
another gains 0.250s, six are unchanged. Two lifetimes increase 0.083/0.300s,
partly offscreen. No added total clear time or empty wait. Accept this bounded
change for removal of the teleport with preserved real shots; do not claim
universal shot opportunity. Stage39 upper-band diagnostics change slightly, so
not every event is identical even though ordered shots/kills/losses are.

Next: the separate blue packet described in NEXT_BLUE_SCOPE.md, then source
freeze and release validation. Conditional planning allowance is approximately
10-20 active hours over 2-4 working days; see BETA_READINESS_OCT06.md. No release
date is promised and no background schedule or publication is authorized.

## Baseline And Objective

Lead HEAD cf0e7a666067ede385865ba02e73d1454eb132d1, with existing local changes.
Enemy source 5ec66e40d512d27fb22f4826ac4321328bd9d0979719b49dfea68ccb47713c89.
Baseline bundle b2177360513b52b1290ff902ebe55c6742a3590eaeb58d6553e4790382126096.
Full baseline package is retained in private-artifacts/green-join-oct13/baseline-artifact.

Player objective: later green targets must not jump at the middle/exit boundary.
Preserve accepted ship clearance, actual normal-key shots, full entry, natural
completion, Stage 3/27/31 controls and unrelated paths. Blue repair is separate.
This is a provisional Aurora continuity repair, not exact original-game geometry.
Original-reference support and limitations remain in middle-path-oct12/REFERENCE_CONSTRAINTS.md.

## Checks And First Decision

The following paragraphs retain the initial trial chronology. Revision B below
supersedes A; only the accepted result above describes current localhost.

The existing two-theme clearance gate now measures later-green join and exit
steps at 60Hz. Its 12-game-pixel/frame ceiling is an engineering teleport guard,
not a Galaga speed measurement. All eight initial green targets are accounted
for; a target without an observed join must have a wholly offscreen last pose.
At least one join must be observed. This does not prove every trajectory or seed.

baseline-gate.json fails all eight later-stage/theme cases on genuine jumps,
up to 203.248px/frame. Existing clearance and lifecycle checks still pass.
Stage 31 remains an unchanged control. Baseline canvas captures record target
571262010 at Stage 35, seed 9135, across the boundary in both themes.

Revision A (source f7823f4c929dc896d0e818e9d3deda2bd95add4cedc6c5416d38842853f23c9d,
bundle 8d5df9c06a0f70a48a835017743a45e3818cbaf9aa0078b68da93e9657d1467b)
preserves recorded 37/33/37 kills and reduces sampled join steps below one pixel.
It is NOT accepted: peak transition speed is 12.909px/frame, above the 12px
ceiling. Review also finds last-sample anchoring is not exact boundary continuity
and makes tangent handling depend on repeated clocks. See revision-a-gate.json
and revision-a-captures. These results are not final candidate evidence.

One review-driven correction is authorized: use the analytic middle endpoint
and tangent at u=9.7 before composed offsets; blend toward the existing exit,
then recover it exactly. Remove history-dependent cache. Duration 0.66 local-u
is derived from A's 0.6 interval and measured 12.909/12 ratio, with margin.
Do not loosen the gate or run a parameter sweep. Recheck shots and lifecycle.
Offscreen monotonic retirement is valid only after the bridge has completed;
legacy boundary culling must not hide an offscreen excursion that would return.

## Provenance

Capture method: private-artifacts/green-join-oct13/capture-join.js. Reports bind
the method, bundle, target ID, frames, poses, themes and PNG hashes. Captures use
ordinary controlled-clock no-fire gameplay, with no target-position assignment.
The target is at approximately (255.44,312.25) before the baseline jump and
(195.31,118.10) one frame later. Canvas snapshots are evidence of rendered poses,
not a complete playback-speed or per-pixel collision audit.

Lead owns integration and the reusable gate. Nash owns isolated implementation
and matched replay checks. Hypatia owns independent source/evidence review.

## Durable Evidence

- integrated-gate.json binds the final lead build and executable method hash.
- candidate-gate.json and candidate-captures bind isolated B bundle0833847752e7e021243e74664c6f7a9b29e5575878e6dc79fd7a05a038be543a, not the lead rebuild.
- baseline-gate.json and revision-a-gate.json are intentional negative controls.
- REVIEW.md and summary.json are worker evidence; GREEN_JOIN_B_FINAL_REVIEW.md
  records independent approval and explicit limits. Historical review conditions
  are resolved by the integrated gate and lead disposition above.
- Full A/B source, builds, raw reports, hash manifests and executed methods are
  retained in private-artifacts/green-join-oct13/revision-a and revision-b.
  Old temporary paths in reports identify execution locations, not sole storage.
- The public capture-join.js is an archival copy. Its executable relative-import
  location is private-artifacts/green-join-oct13/capture-join.js. Worker methods
  retain their original tools/harness execution context and ROOT-relative output
  paths; reconstruct in an isolated checkout rather than overwrite retained data.

Reproduce the integrated gate after building with:
`npm run harness:check:challenge-late-clearance -- --out=/tmp/green-join-gate.json`.
No perfect-feasibility, all-contact, exact-reference, audio or beta acceptance
claim follows from this packet. Guardians and Stage7 authoring were not changed.
