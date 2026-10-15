# Actual Bullet Resolver Trace

October 11, 2026. Approach 2, isolated checkout at cf0e7a666067ede385865ba02e73d1454eb132d1.
No gameplay repair, lead checkout write, commit, push or publication.

## Result

Six independent stationary center shots, seed 9131, controlled 60Hz, normal Space
keydown/update/keyup. Three launch times: 11.2, 11.3, 11.4 seconds, both variants.
Exactly one projectile per trial; every projectile resolved or left the field.

Baseline: target 372665405 is selected in all three shots at the initial
shoot-time collision test, segment x140/top301/bottom319. Five alive enemies
precede it; their actual predicates are false. Its actual predicate is the
sixth call and true; original resolver decreases its hp and consumes the bullet.
This is an immediate spawn-segment interception, not a long upward flight.

Candidate: intended target launch centers are x255.435/255.932/256.439,
y308.675/303.590/298.454. Its body predicate is false on every real segment.
The 11.2 shot selects 753126167 after 19 resolver segments; 11.3 exits without
a hit after 38 segments; 11.4 selects 132766890 after 17 segments.
The two selected enemies occur after the intended target in array order.
The resolver actually checks and rejects the intended target before selecting
them. These are aiming-column misses, not a demonstrated array-order masking
of a valid intended-target intersection. No extrapolation after consumption is
needed for that bounded conclusion; no whole-board impossibility is claimed.

## Instrumentation And Provenance

trace-shot-interception.js inserts a diagnostic function inside copied bundles'
runtime closure. It wraps the real segmentHitsTarget and resolvePlayerBulletHit,
calling both originals unchanged. Each segment records alive enemy array order,
body/carried intersections, carry skip, intended pose, actual predicate calls,
original return value, and hp changes. Assertions compare first-match expectation
against original resolver result and actual predicate terminal hit/hp changes.
Full records and exact input/instrumented bundle identities are in report.json.

Candidate input hash: 98ee41bbc9f798a82efa0a67a0b2339d2f7e269f6701b2691e892c66b68dd6ba.
Baseline input was mechanically reconstructed by replacing exactly one full
candidate enemy source with baseline enemy source. It is not the historical
baseline bundle or a new build; copied build metadata remains candidate metadata.
Enemy hashes asserted: baseline1456799e1fadd17e9fc65ce387abd64811a67231ed1bdc866b914ac40f2d8815;
candidate9472948c0959952d1f79d2a3f6998f94081a29054f7b7a06ed3f4739f7301c88.
Exact retained source inclusion additionally verified for:
- combat: c01720fd25b08ef4e439107d2aca1a3a0915149ac675f203f61d245bf94d722f
- harness: ad6535ae97a302db467e99dae08274b329723aa2f460df5966a42bdf3bd8ad2b

Method hash: d48dd8761cd2b389ccb8be4106046d406c503c8ff777c2fcbc150769c8379736.
Report hash: f7b3d8c6e9c4177fb34bb69d3575b19eae2b03ca2b0e65ae7c75c0ec05da7f0b.
Final browser run exit0, git diff --check exit0. Initial configuration failure
was terminated (exit130); first instrument attempt failed private-scope access
(exit1). Neither produced accepted trace evidence. All subprocesses completed.

## Limits And Next Step

Three center shots, one seed, no early-window/reachable-column or full-route
acceptance. No candidate repair; its completion defect remains unresolved.
External requests were blocked after boot, not a claim of boot network isolation.
No account operations. The two own copied package roots are retained as evidence.
Use the candidate trajectory to screen an earlier/rightward reachable interval,
then verify a handful of real input shots there. Do not tune endpoints from
these misses or treat later hits on other IDs as replacement opportunity.
