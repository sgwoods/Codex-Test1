# Clock Lifecycle And Fresh-Build Qualification

October30,2026. G4.2 and G3.3 local follow-through; no deployment.

## Changes

- Harness initialSimT now applies after fresh gameplay initialization, which
  previously overwrote the requested value. Active-run assignment is preserved.
- Controlled outgoing-regular stage transitions subtract the actual update dt,
  not a fixed1/60 second. Default1/60 behavior is preserved. The guard still
  examines the outgoing stage; outgoing challenges retain their advancing clock.
- Eight actual-source clock tests run in test:sim, including the previous clock
  selection repair, initialization, transition correction and P2 clock round-trip.

Clock release remains explicit. Restarting through the controlled harness keeps
controlled ownership when requested; setControlledClock(false) returns updates
to RAF. P2 snapshots still round time to milliseconds:10.123456 saves/restores as
10.123 and2.987654 as2.988. This quantization is tested, not removed or represented
as exact continuation. No persona, enemy, weapon or skill threshold changes.

## Evidence

| Check | Outcome |
| --- | --- |
| Clock regression tests | 8/8 pass |
| Derived input browser suite | 19 cases and8 quiet/held comparisons pass |
| Fresh isolated build browser suite | 19 cases and8 quiet/held comparisons pass |
| Audio decoding | All24 files decode in each suite |
| Pause/resume | At each step size:12.75 stays unchanged while paused, then reaches13 |
| Restart/release | Restart resets to0; explicit release permits RAF progression |
| Regular/challenge transitions | Pass at1/120,1/60 and1/30; new stageClock is0 |

Regular outgoing commit frames preserve pre-frame simT; challenge outgoing commit
frames advance by dt. These are motion-clock rules, not a rollback of all timers
or cross-timestep gameplay equality. Both browser receipts pass immutable input
inventories and report no page errors or teardown failures. Expected blocked
external-resource console errors remain retained. Live accounts/writes are blocked.

Fresh build: isolated clone `/private/tmp/aurora-lifecycle-oct30`, baseline
`16baa705365d275903f7395ba0f08ed368f54f41`, with only current00-boot.js,
10-gameplay.js and90-harness.js copied into source. The ordinary build pipeline
completed, including diagram rendering, without changing the inspection checkout.
This is a fresh build correctly labelled **dirty**, not a clean committed package.
Private canonical assets were supplied separately; no assets were published.
The original sandboxed build attempt failed on browser-rendering permissions;
the approved outside-sandbox build succeeded without changing build logic.

Private packet: `private-artifacts/p2-clock-oct30/`. Exact source hashes,
build identity and retained bundle inventory are in rebuild-provenance.json;
lifecycle-provenance.json binds the earlier derived input. lifecycle.js is the
method; lifecycle-v1 and rebuilt-lifecycle-v1 retain summaries, individual cases,
audio receipts and screenshots. Earlier evidence generations are untouched.
Independent review found no blocking source issue and verified derived-input
hashes and lifecycle outcomes. Fresh-build results were checked by the lead.

## Boundaries And Next Work

These synthetic transition fixtures do not prove natural challenge-result audio
pacing, full-state replay fidelity or player feel. Rounded board restoration is
characterized only; no full-precision serialization migration occurred. No new
score distribution was run, and the private Expert veto is not integrated.

Next: review/integrate this coherent local testing/evidence packet, then rerun
qualification from its exact committed source. After that, G1.3 can compare one
versus two isolated workers. G5 content refusal rules and G6 reference crosswalk
remain separate adoption work, not reasons to begin another beta.
