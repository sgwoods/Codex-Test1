# Controlled Motion Clock And Browser Follow-Through

October30,2026. Goals G3.3/G4.2. Local repair, no deployment.

## Repair

`advanceGameplayClock` previously returned wall time unless a global harness
persona was set. Recording already honored explicit controlled-clock mode.
P2 deliberately leaves the global persona empty to keep P1 manual, so enemy
motion and recorded time disagreed. The one-line fix honors explicit clock
control independently of global autopilot. Ordinary manual, Watch and P2 play
with control off retain wall time. No policy, physics or skill thresholds changed.

Five actual-source clock tests now run in `npm run test:sim`, covering controlled
time without autopilot, release back to wall time, runtime persona labels without
global autopilot, both global aliases, and separate/reset runtime clocks. Existing
Aurora/Guardians controller-mode tests also pass.

## Browser Evidence

New private inputs derive from source16baa705/build1256 and the previous frozen
control/candidate bundles. Only the exact clock predicate is replaced, once per
arm. Original build metadata is retained, so these are explicitly **derived
experimental bundles**, not unchanged baseline or newly built release artifacts.
Provenance records original/patched hashes and full source hash.

| Check | Result |
| --- | --- |
| Original browser suite, both arms | 32/32 cases,16/16 quiet/held comparisons pass |
| Enhanced suite, both arms | 56/56 cases,20/20 grouped comparisons pass |
| Enhanced ordinary checks | Four personas x Watch/P2 x quiet/repeat/held x two arms |
| Tick comparisons | 48 checkpoints per ordinary case; repeated quiet and held trajectories agree |
| Late-stage synthetic probe | Eight Stage6 Expert cases; expected action in every case |
| Audio dependencies | All24 decode in each suite/arm |
| Teardown | All four suites report no teardown errors |

The tick projection contains player state, simulation/stage clocks, RNG, mechanical
counts and enemy poses. Existing APIs round coordinates; this is not bit-exact
full-state identity and does not include every bullet pose. Cosmetic effects are
excluded. External requests and writes are blocked, so blocked-resource console
messages are expected and retained; page errors fail every case.

The synthetic probe uses seed91001, regular internal Stage6, player(120,335),
nondiving enemy(132,335), and one1/60 update. Candidate Watch/P2, quiet/held,
records one intervention (`preferredAxis:1`, `axis:0`) and X120->120. Control
records no intervention and X120->126.16. Independent review confirmed all eight
receipts, expected actions, method/input inventories and screenshot hashes.

The fixture replaces the board and resets clocks/bullets. It is not the natural
146.9-second historical encounter, sustained safety, earned score, or full-mode
equivalence. Manual P1 return, movement/fire and score separation are covered in
the separate ordinary lifecycle cases, not a post-veto return within this fixture.
Snapshots/screenshots confirm a rendered browser surface, not real-time visual or
subjective audio fidelity. No live account/database requests were made.

## Evidence And Limits

[Public summary](clock-results.json) records hashes and counts. Private methods,
inputs and receipts are in `private-artifacts/p2-clock-oct30/`; failed earlier
clock-confounded cases remain in `private-artifacts/expert-current-oct30/`.
Two read-only specialists supplied lifecycle review and late-probe verification;
lead owned all edits. Browser jobs stayed sequential.
306 artifacts were compressed and round-trip hash-verified in
`private-artifacts/persistent/p2-clock-oct30/`. Remote recovery remains untested.
Fast release-contract/runner checks, documentation checks and the simulation
suite pass locally. Independent review accepts this narrow fix with the limits below.

No new full-game distribution was run: the23-panel/410-observation chart and
the prior100-run qualification remain unchanged and keep their exact identities.
The Expert candidate still exists only in private test inputs; source receives
only the controlled-clock repair. Localhost8000 remains build1251/2e33ef4d,
verified against build-info and serving process cwd, not the experimental copy.

Review found existing lifecycle limitations, retained as follow-up work:
- Explicit clock release is required when leaving an advanceFor-controlled
  session; ordinary gameplay restart alone does not release harness ownership.
- Harness initialSimT assignment precedes fresh start, which resets it.
- Saved P2 board simT is millisecond-rounded; restoration is not guaranteed
  identical to uninterrupted simulation.
- A regular-stage transition correction assumes1/60 although advanceFor permits
  other steps. These browser cases use1/60; alternate-step transition coverage
  and pause/resume need a separate bounded contract.

## Next Recommended Work

1. G4.2: add restart/pause, explicit release, and regular/challenge transition
   contract tests, including alternate steps and board-clock restoration.
2. G3.3: qualify a clean rebuilt package before integrating the private Expert
   candidate; retain human-control and natural late-stage limitations explicitly.
3. G1.3: benchmark one versus two isolated heavy workers only after deterministic
   transition coverage. G5 content refusal rules and G6 three-claim reference
   crosswalk remain independent work; neither is complete in this cycle.

No hosted dev, beta or production changes. This delivers more reliable testing,
not a new player-facing skill tier or a release-readiness declaration.
