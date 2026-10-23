# Retained Controller: Stage 13 Escape Window

October 20, 2026. Baseline HEAD bacb0c58, dirty controller SHA256
74b38aec094da21b4ce586812ad2d7b36b9d346f62fa2fd24d89cabbf3da2e0b.
No runtime change, commit, push, or release in this step.

## Completed

Replayed Professional seed89003 from Stage1 with three ships and a900-second
budget. Control and instrumented browser runs both end at Stage18,96450points,
465.433seconds. Selected gameplay event arrays match exactly (shots, kills,
damage, ship losses, stage clears and game over). All22 captured controller
decisions replay exactly with the frozen source and collision boxes.

The first destruction occurs at329.65seconds in Stage13,score71320,against
escort751477004. At that frame all three legal movement endpoints collide.
Actual bullet-update and body-collision code reproduce this result. Mirrored
collision outcomes and translated edge clamping also pass.

Offline reachability against the recorded hazard sequence finds the latest
start with an escape at329.633333seconds,one frame(16.67ms)before impact.
Two successive rightward moves reachX154.84 without a collision through the
impact frame. The recorded pilot instead holds atX142.52. This is evidence
that the repair must act earlier than the final collision frame, not evidence
that changing the last-frame tie-break will work.

## Limitations

The alternate route freezes recorded enemy and bullet paths. It does not
simulate altered shots, kills, targeting, future encounters or safety after
the recorded impact. It is not proof of human movement equivalence. No new
controller has been accepted. The short Stage2 gate remains unresolved.

The first sandbox capture stopped before browser launch. A separately approved
local browser run produced the v2 packet; no live accounts were accessed.

## Persistent Evidence

retained-low-tail/ contains the receipt,22-decision replay report, joint
collision report, escape-window report, compressed primary trace and frozen
controller/combat/boot source. manifest.json records original paths, lengths
and SHA256 identities. Raw full sessions remain under
private-artifacts/retained-low-tail-oct20-v2/.

Capture: node tools/harness/capture-stage2-decision-replay.js NEW_DIRECTORY --retained-low-tail
Checks: check-stage2-decision-replay.js, check-stage2-joint-collision.js and
check-retained-escape-window.js with the packet directory argument.
Historical Stage2 replay31decisions and joint-collision checks still pass.

## Next Controller Step

Implement one isolated observed-motion lookahead candidate for Professional
normal stages4+ only. Use prior observed positions, not hidden future state.
Test moving-body, bullet/body, mirrored, boundary and discontinuous-motion
fixtures. Require the recorded encounter to survive in a full simulation, then
matched full-game nonregression and reserved fresh seeds. Preserve Stage2 and
challenge behavior. This does not waive the separate Stage2 throughput issue.

## Parallel Account Review

Existing public-game-score browser checks replace authentication/database with
fixtures. The live-lane input check only fills synthetic credentials. Neither
proves live persistence. No inspected existing tool safely completes the whole
live procedure using a human-authenticated session without modification.

After resolving the existing browser-policy denial through the supported user
flow, use the intended frozen candidate and record its identity. Sign in and
complete a normal human game for each title, including initials confirmation.
Record game,score,stage,time,build and visible save result. Confirm history after
reload and in a separate signed-in session. Do not fabricate scores or capture
passwords,tokens,reset links or session storage. This check does not alone prove
all-user isolation, password recovery or human audio acceptance.

## Beta

Still held. This step improves diagnostic precision, not game capability.
Remaining sequence: controller acceptance and skill ladder; live score and
recovery acceptance; combined-source review/checkpoint; gated authorized/dev;
exact beta freeze and package checks; explicit beta approval and hosted check.
Localhost8000 remains byte-identical to the retained development build.
