# First Star Swarm Adoption Cycle

October 28, 2026. Local engineering implementation, not a release.
Baseline `2e33ef4d4bad3465d67238e4c6825270e39ad913`; branch
`codex/adopt-test-contracts`. This follows the
[cross-project assessment](STAR_SWARM_ASSESSMENT_2026-10-28.md).

## Implemented In Impact Order

1. **Small test entry points.** `npm test`, `test:docs`, `test:sim` and
   `test:browser` now select focused existing checks through a documented
   [test map](TEST_MAP.md). The fast suite includes the seven release-contract
   fixture checks; it is not full release preflight.
2. **Executable documentation claims.** Twelve explicit claims bind commands,
   required files, game identities, registered game count and preview posture to
   maintained source. Negative fixtures reject stale, malformed, missing and
   escaping references. This cannot certify arbitrary prose or PDF readability.
3. **Isolated experiment inputs and outputs.** The browser wrapper copies an
   existing private bundle and scenario, records hashes, reserves a unique run
   directory, blocks off-origin requests and rechecks inputs/methods afterward.
   It never rebuilds localhost or writes canonical evidence. Failures, timeouts,
   signals and detected mutations cannot become passing receipts. POSIX
   supervision terminates the worker and observed descendants on timeout.
4. **Reproducible Expert diagnosis.** Replayed a retained weak run and measured
   the automated/human movement boundary without changing either controller.

The PR workflow now invokes the portable fast and simulation suites and retains
receipts, with read-only repository permissions and no deployment step. Hosted
CI has not run for this uncommitted cycle. Existing release gates remain in force.

## Evidence

Two independent read-only specialists assisted the lead: Archimedes checked
controller behavior and historical replay equality; Goodall reviewed the new
tools. The lead alone edited source. Review found unsafe scenario-persona path
input, incomplete child-process timeout cleanup, and omitted documentation
dependencies in fingerprints. Each received a fix and regression coverage.
Follow-up review caught late-spawn cleanup and a test incorrectly treating `ps`
inspection errors as termination. Process-group tracking, repeated discovery,
termination checks and explicit inspection-error assertions now cover those.
The last review finding, tick-counted shutdown deadlines, was fixed with
monotonic deadlines, bounded asynchronous inspection and independent escalation.
The slow-inspection regression passed; final independent re-review found no
remaining blocker in scope. No claim of OS containment or adversarial isolation.

The final checks are indexed in `ACTIVE_WORK.md`: 19 tooling regression tests,
12 executable claims, seven existing release-contract fixtures, 79 source-backed
controller cases, browser smoke and an intentionally failed real-browser timeout.
Tests exercise malformed
claims, copied-byte identity, mutation rejection, failed children, timeout
cleanup, overlapping roots, unsafe arguments and concurrent private outputs.
Concurrent-output fixtures do not establish multi-browser capacity or speedup.

Primary private evidence:

- `private-artifacts/adoption-cycle-2026-10-28/diagnose.js`: repeatable actual-source
  VM control probe and archived-session comparison.
- `private-artifacts/adoption-cycle-2026-10-28/diagnosis.json`: measured trajectories,
  source/method hashes, reproduction assertions and loss ledger.
- `private-artifacts/adoption-cycle-2026-10-28/runs/gameplay-2026-10-28T15-07-36-300Z-rQ3LZK/`:
  full historical reproduction, copied input/scenario, identity receipt and logs.
- `private-artifacts/adoption-cycle-2026-10-28/runs/gameplay-2026-10-28T15-33-15-373Z-dtcuLs/`:
  final ten-second browser smoke after the supervisor review fixes.
- `private-artifacts/adoption-cycle-2026-10-28/runs/gameplay-2026-10-28T15-32-41-649Z-9cM4TZ/`:
  deliberate 1,500ms real-browser timeout, `ok: false`, unchanged input/method
  hashes, and no additional inspection/cleanup error. This is negative evidence,
  not a passing gameplay run.

These paths are local ignored artifacts, not published references or proof of
off-machine backup. Run receipts identify the method bytes actually used.
The strengthened process tests initially failed in the restricted sandbox with
`ps EPERM`, correctly. The passing rerun used approved process-inspection access.
Do not count the earlier less-strict cleanup assertions as final acceptance.

## Expert Finding

Seed `91001`, Expert, Stage 1, three ships, Watch/game, 900-second cap reproduces
historical build `1210 / bacb0c58.dirty`, not the current public player bundle:

| Measurement | Result |
| --- | --- |
| Final score / stage | 46,960 / Stage 8 |
| Terminal state | Game over, 219.433 simulated seconds |
| Ordered non-audio events | 1,449 exactly equal |
| Sampled snapshots | 435 exactly equal after excluding only `counts.effects` |
| First collision loss | 146.900s, Stage 6, enemy `951043064` |
| Further losses | Capture 152.317s; collision 154.467s; final capture 219.433s |

The archived decompressed session hash is
`71aee3dfdac5a5ffae6608bcab762e0c7207c72480c34db8891f5a6556a813c7`.
The copied historical index hash is
`26700ead3aa357ebab6eaf3a245e262fd8e2b17467d855867a7f4b91d58f99ba`.
Full bundle inventories and scenario hashes are retained in the run receipt.

Snapshots are sampled and rounded, omitting full enemy/bullet poses and
controller internals. Audio cues and cosmetic effect counts differ. Accept this
as retained-run telemetry reproduction, not every-tick complete-state equality,
audio/visual conformance, a new persona panel or improved Expert performance.
The existing versioned distribution graphic is unchanged for that reason.

The actual-source empty-world control probe holds timestep at 1/60 second and
preserves human velocity and key age across frames. Starting from x=140:

| Fixed-input measurement | Automated Expert | Human input |
| --- | --- | --- |
| First rightward tick displacement | 6.16px | 0.827px |
| x after 10 right, 10 left, 12 neutral ticks | 140 | 152.194 |
| Left boundary, single fighter | 9 | 13 |
| Left boundary, dual fighter | 9 | 20 |

Automated control changes position directly; human control accelerates,
decelerates and has reversal/tap handling. Human maximum speed is higher than
Expert's multiplier, so neither actuator is uniformly superior. Watch, AI-owned
P2 and quiet test use the automated path; human P1 is a different path. Interactive
harness input can override automation. Policy parity is not human-physics parity.

This probe establishes differing responses, not the cause of the collision or
a safe human escape. No gameplay, persona, input clock or physics was changed.

## Next Bounded Packet

1. Review/integrate these local tools through the normal no-mistakes/PR/CI path;
   integration is not permission to deploy. Keep one heavy browser job at a time.
2. Instrument only 145.900-147.100s of the retained Expert run. Capture unrounded
   pre-decision, pre-bullet and collision-phase state, selected input, RNG,
   hazards and hitboxes. Require the same accepted telemetry projection before
   using the trace. A forward evolving-world rollout is required for escape claims.
3. Separate a policy defect from a proposed actuator migration. Freeze acceptance
   criteria before one candidate; do not change clock, physics and policy together.
   Use matched and reserved seeds plus Watch/P2 checks and update the distribution
   graphic only when there are genuinely new full-run measurements.

The user-visible goal remains more reliable Expert play without losing accepted
Professional behavior. A generic orchestration service, a new model/provider,
runtime rewrite and broad content-authoring system were deliberately not added.

## Release Position

Localhost `http://localhost:8000/` continues serving this checkout's `dist/dev`,
`1.4.2.1+build.1251.sha.2e33ef4d`. Production 1.4.2 and beta.5 were not touched.
No account/score writes, commit, push, PR, full release preflight or deployment
occurred in this cycle. Do not infer shipped improvements from tool-test results.

Next release path: reviewed integration, a meaningful player-quality batch for
authorized dev review, then an explicit beta decision and the existing packaged,
documentation, persona-safety and human acceptance gates. No beta date or new
version is assigned; the beta hold is unchanged.
