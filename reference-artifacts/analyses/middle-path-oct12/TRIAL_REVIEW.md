# Middle Envelope B: Scoped Gates Pass, Independent Review Pending

One approved candidate, no parameter sweep. Source06 SHA256
5ec66e40d512d27fb22f4826ac4321328bd9d0979719b49dfea68ccb47713c89;
bundlea97edcea99f40fe2db38e8b4f3b4b5f7857b64551bb6f02204b482c19d9ff3cc.
Baseline source1b442dfae869fe3f8a7cc39edaaa2d05860b3a7cdf33c5e796ebae13167ce532,
bundle9c320d50301a46f93f8f27bcc2f28af412b88043ba00e411f4a329c8585ef4fa.
See METHOD.md for exact formula, scope and execution. Current isolated source
and dist/dev retain candidate for independent review. No lead integration.

## Normal-Key Witnesses

Saved31/35/39 input traces replayed on both exact artifacts, no new controller.
Kills37/33/37 and shots80/48/50 preserved. All ordered shot/kill/loss events
match in each pair; no lost/gained/changed kill events. Movement, cooldown,
bullet cap and shot provenance audits pass; no losses. Clear times unchanged
19.533/9.217/9.283s for these firing replays. Not perfect feasibility proof.

| Stage | Target | Baseline and candidate kill time |
| --- | --- | --- |
|31|372665405|6.333s|
|31|725696614|13.917s|
|35|709952769|7.517s|
|39|674838603|7.367s|
|39|401784013|8.383s|

## Nofire And Columns

Natural clear/next-stage progression passes3/27/31/35/39/63/127. No enemy
bullets/attackers or life losses. Every stage has40 targets reaching full view;
all40 enter fully during entry phase at27/31/35/39/63/127. Stage3 has37 during
entry phase and40 eventually, identically in baseline and candidate: do not
upgrade the unchanged control into a40-entry-phase claim.
Stage3/27 and unaffected families have exact full sampled traces. Scoped x/time
match at common local-time/sim-time keys; y<=300 identity region preserved.

Center contacts baseline->candidate:31 0->0,35 3->2,39 7->6,63 5->4,127 2->1.
Remaining later contacts are blue. Stage3 six inherited contacts unchanged.
Scoped green/yellow sampled drawn-bottom maximum321px; collision-body bottom
maximum319.4px (31 318.86px). No scoped vertical player-band samples remain.
Draw bound uses the existing two-flap-pose union, not arbitrary-rotation or
alpha-mask proof. Challenge entities have dive9; renderer rotation applies to
dive1/4 only. Safety is scoped to this challenge state, not every possible pose.

Frozen performance clock normal-arrow probes reach actual x42.12/85/195/266.95
for requested60/100/180/250. Baseline/candidate actual columns match. All scoped
green/yellow contacts removed. Remaining candidate contacts by those columns:
31:1/1/0/0;35:4/2/1/0;39:3/0/1/0, all blue. Center is measured separately.
These columns do not prove every moving trajectory safe or close beta contacts.

## Trade-Offs And Open Defects

Stage31 nofire clear21.417s unchanged. Later35/39/63/127 clear becomes12.133s
from11.750/11.733/11.767/11.750s: delays0.383/0.400/0.366/0.383s.
Clear-relative next-stage cadence remains4.433-4.434s, delta<=1ms rounded.
Scoped lifetime increases up to0.283s at31 and3.067s later; total full-view
increases up to0.117s at31 and2.617s later, with no measured total reduction.
This is not a claim that continuous dwell or every reachable shot is preserved.
Revision A was blocked: last visible later target11.917s, clear12.833s,
empty tail0.916s versus baseline0.233-0.250s. A remains separately archived.
User authorized one narrow wholly-offscreen lifecycle correction, not a motion
parameter change. B clear12.133s leaves0.216s empty tail; last visible11.917s
is unchanged. Stage31 tail0.234s unchanged. Final revision-comparison.json binds
both raw reports: all4168visible samples per later stage are exact A/B;
250removed samples per stage are wholly offscreen. No exit reversals observed.
Both-theme128entity bound audit: maximum sprite extent11.4px fits minimum
dimension half16px; B adds1px margin to dimensions. Unsupported oscillatory,
unsettled-spacing, rotated, carrying or hit-effect cases retain original rules.
Shot and all runtime/column tests reran on B. Candidate retained for independent
review, not integrated or accepted as a complete beta repair.

Later-green joins still jump161.645-203.248px. This candidate only fixes scoped
row clearance; it does not smooth green joins or repair blue paths. No canonical
reference fidelity, universal zero contacts,40/40 feasibility or beta pass.
No audio/browser-public package claim. Syntax and diff checks pass.

Raw evidence, artifacts, patch and executed methods are in isolated
private-artifacts/middle-envelope-oct12: shots.json, runtime.json, summary.json,
candidate-source.js, candidate.patch, lifecycle-only.patch, candidate-artifact,
exit-bounds.json, revision-comparison.json and archived tools. Revision A source,
bundle and all raw reports retained in sibling middle-envelope-oct12-revision-A.
Public summary binds source/bundle/method/dependency/report hashes and per-ID
metrics. Initial runtime-test key collision corrected before successful run:
local times can repeat, so pairing now uses local time AND sim time. No gameplay
candidate change occurred. Source retained for lead/reviewer decision only.
