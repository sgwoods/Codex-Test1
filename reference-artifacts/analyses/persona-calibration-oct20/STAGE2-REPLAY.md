# Stage 2 Exact Decision Replay

October20,2026. Baseline bacb0c58 plus retained local hazard keeper. Runtime
source and localhost build unchanged. Harness-only capture and analysis added.

## Acceptance And Result

Goal: reproduce the rejected deadZone7 collision and replay actual movement
decisions before another tuning attempt. The isolated control and instrumented
copies both finish at4540 points. Their player_shot, enemy_killed, enemy_damaged,
ship_lost, stage_clear and game_over event arrays are exactly equal. This checks
selected gameplay events, not all audio/render timestamps or wall-clock behavior.

31 pre-movement frames captured between8.3s and the8.817s loss include full
player/enemy/bullet objects, effective config, timestep and actual hitboxes.
Collision-phase states are captured separately after movement updates.
Offline actual-source controller replay matches31/31 preferred and final axes.
The actual body-collision function reproduces enemy248693119 hitting the player
at8.817s. Boot's real playLane expression is used, not the earlier fixture's
floor(x/28) approximation. Synthetic old fixtures are not exact replay evidence.

## New Finding

At8.750 and8.783 the winning branch is BULLET avoidance, despite the earlier
log naming a lower-field enemy. At8.767 it is body avoidance. At8.800 and8.817
it switches to target pursuit because the below-center enemy is no longer a
detected body threat. Thus the old log did not establish the winning branch;
the oscillation involves bullet/body priority as well as premature release.

At the final recorded collision phase, using actual body collision code:
- Left: playerX165.8133, no body contact.
- Hold: playerX172.2667, no body contact.
- Right (actual): playerX178.72, collision with248693119.

These are endpoint counterfactuals against the recorded world state, not full
alternate simulations. They do not establish bullet safety, a safe future path,
human control equivalence or acceptance of a new controller.

## Reproduction And Provenance

Capture: node tools/harness/capture-stage2-decision-replay.js NEW_PACKET_PATH
Check: node tools/harness/check-stage2-decision-replay.js PACKET_PATH
The capture command refuses an existing directory. It copies dist/dev and
reconstructs ONLY the rejected Stage2 deadZone7 config in private copies.
No live source, localhost, account or hosted lane is edited.

Primary packet:private-artifacts/stage2-decision-replay-oct20-v2/.
receipt.json stores baseline/controller/build/scenario/method hashes and session
paths. controller.js,combat.js,boot.js preserve the replay code. Each input build,
session, full decision trace and run log remains in the packet. v1 is retained
as an earlier decision-only capture, not collision-phase acceptance evidence.
stage2-replay-check.json persists the31decisions, trace SHA256, loss, alternatives
and limitations in the tracked analysis directory.

## Next Step

Add mirrored and edge-clamped cases and replay bullet collision at the correct
update phase. Then test one joint hazard/aiming decision using early detection
and full-body clearance. Require existing Stage2 gate and new-seed validation;
do not weaken score requirements or restore deadZone7 on localhost merely
because this diagnostic reconstruction explains its failure.

No new skill distribution was measured. The version-history chart remains
unchanged; these16-second reconstructed diagnostics must not be added as a
900-second policy version. Beta and live scoring acceptance remain held.
