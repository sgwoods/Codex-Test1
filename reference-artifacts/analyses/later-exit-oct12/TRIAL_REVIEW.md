# Later Exit Trial: Rejected

One candidate, October12. Baseline HEAD cf0e7a66 dirty, source06
1b442dfae869fe3f8a7cc39edaaa2d05860b3a7cdf33c5e796ebae13167ce532.
Candidate source226b49fc631960f9f8fc6f35821bb93c5aee421659071590c2ecb3e0e9697638;
bundle d57a44f591667ccc85dd27ecd6a0164c61f8da7da1e42a94bf7a17be4f148e85.
Baseline bundle9c320d50301a46f93f8f27bcc2f28af412b88043ba00e411f4a329c8585ef4fa.

Candidate: selected generic blue/green paths at stage>=35 only, post-u9.7.
Cache composed middle poses; preserve incoming finite-difference tangent with
0.08-local-time exponential blend toward nearest-side100 and upward100.
These are experimental Aurora rates, not reference-conformance measurements.
Reference/motion-spec evaluation order, Stage3/31 and all preexit coordinates
remain unchanged. Anchors inspected first: green reaches y329 at both edges;
blue survivor anchors range roughly y158..294 across35/39. No ID-specific logic.

## Measured Results

Real cached Chromium1243, human harness launch, seeded controlled60Hz.
Stage35 contacts3->0;39 7->0;63 5->0;127 2->0 at stationary center.
Each has40 fully visible targets, natural clear/next-stage progression,
zero enemy bullets/attackers and three lives. Cadence unchanged4.433s
(Stage39 rounded telemetry4.434s both). Scoped maximum join steps:
35 3.937px;39 3.749px;63 4.328px;127 4.265px.
Stage3/31 full sampled trajectories exactly match baseline; this is a control,
not acceptance of inherited control-stage contacts.

Normal-key baseline controller run once per35/39; identical input trace replayed
against candidate, with frozen performance clock17/17/16ms and60Hz game steps.
No assigned positions or production persona. Both audits pass movement, bullet
cap/cooldown, shot counters and kill provenance. Stage35 loses709952769
(baseline kill7.517s),33->32. Stage39 loses674838603(7.367s) and401784013(8.383s),
37->35 at matched horizon. All three candidate targets are hp0/miss1;
these are actual lost witnesses, not pending kills beyond the report horizon.
Stage39 candidate clear has not occurred by baseline trace end, so no shooting
completion claim is made there. No gained kills. Reject rather than waive losses.

Maximum total full-view reduction is1.417s at35,1.367 at39,1.317 at63,
1.150 at127. Total visibility is not reachable firing opportunity.
Two green targets per later stage retain0.133s sampled postexit player-row
exposure, in addition to0.183s inherited preexit exposure. Swept sprite-bound
estimate separately records segment unions; this is not all-position safety.
Normal-arrow side probes still produce35left2/right1 and39left2/right1,
all first contacts in middle. Actual columns differ slightly by wall-clock
key timing (35left53.10 vs52.17 elsewhere), so not exact replay equivalence.
Stage31left3/right1 remains untouched. No global zero-contact or beta-pass claim.

## Disposition And Artifacts

REJECT. Gameplay source restored byte-for-byte to1b442dfa baseline.
Rejected dist remains clearly archived as candidate-artifact. dist/dev restored
from retained baseline-artifact, index SHA2569c320d50301a46f93f8f27bcc2f28af412b88043ba00e411f4a329c8585ef4fa.
Stage39 shooting clear=null means the replay ends with the baseline trace;
it is not evidence of a lifecycle failure. Separate no-fire lifecycle completed.
No lead edits, integration, commit, push or deployment.

candidate.patch, candidate-source.js, baseline-source.js, both artifacts,
report.json, summary.json, candidate-columns.json, swept-row-estimate.json
preserve provenance and raw evidence. Executed methods archived alongside.
Syntax checks and git diff --check pass. No visual captures/audio acceptance,
perfect feasibility, all-seed coverage or canonical exit fidelity claimed.
Next decision belongs to lead: bounded pattern-reuse/content alternative or
a separately authorized opportunity-aware repair; no second tuning candidate.
