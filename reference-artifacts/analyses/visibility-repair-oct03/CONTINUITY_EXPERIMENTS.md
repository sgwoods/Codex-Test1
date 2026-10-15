# Continuity Experiments And Value Review

Baseline a8be5a50. Two candidates tested locally; neither accepted. Gameplay
source restored byte-for-byte. No push, publication or professional sweep.

## Measured Results

| Metric | Baseline | Candidate 1 | Candidate 2 |
| --- | --- | --- | --- |
| Stage 31/35/39 contacts, natural no-fire launch | 4/3/7 | 3/2/2 | 2/0/1 |
| Retained nonzero-clock displacements above 40px | 46/47/52 | 0/0/0 | 0/0/0 |
| Full entry, normalized all-ten audit | 40/40 each | 40/40 each | 40/40 each |
| Stage 15 minimum continuous full view | 0.767s | 0.433s | 0.583s |
| Stage 23 minimum continuous full view | 2.033s | 0.917s | 1.183s |
| Stage 39 minimum continuous full view | 0.733s | 0.683s | 0.683s |

Candidate 1 keeps entry and translates entire middle and exit phases to their
preceding exact endpoints. Within-phase derivatives unchanged, but absolute
positions, removal timing and dwell change.

Candidate 2 blends the entry correction out linearly across the middle phase,
preserving the old middle endpoint, then anchors exit to that endpoint. Middle
derivative changes by -offset/6.55 per path-clock unit, not real-time seconds.
Independent review found no endpoint math bugs in either candidate.

Both remove the measured resets but reduce view windows and retain contacts.
Reject both rather than label continuity alone release-ready. Full entry is not
an unobstructed shot window. The 40px threshold detects large jumps, not a
reference-derived speed limit. One seed per stage; stationary human/no-fire.

## Evidence

Baseline normalized audit:
reference-artifacts/analyses/challenge-full-entry/2026-10-03T23-53-38-429Z-a8be5a50/.

Candidate 1 normalized audit:
reference-artifacts/analyses/challenge-full-entry/2026-10-03T23-55-02-610Z-a8be5a50/.
Natural trajectories:
reference-artifacts/analyses/late-challenge-contacts/2026-10-03T23-54-42-318Z-a8be5a50/report.json.gz.

Candidate 2 normalized audit:
reference-artifacts/analyses/challenge-full-entry/2026-10-03T23-56-23-474Z-a8be5a50/.
Natural trajectories and rejected patch:
reference-artifacts/analyses/late-challenge-contacts/2026-10-03T23-56-08-468Z-a8be5a50/.
Baseline natural trajectories are in the 2026-10-03T22-41-54-517Z-5b4c7854 packet;
gameplay source matches this baseline. Reports retain bundle/source/method hashes.
Candidate 1 raw trajectories persist but its exact patch was not archived; its
measured results are evidence, not a reusable source keeper.

## Value Versus Effort

No hours/cost ledger exists; do not invent numeric ROI or an overall quality score.

| Recent work | Delivered value | Confidence / remaining work |
| --- | --- | --- |
| Cadence and canonical audio continuity | Handoff 15.150 to 4.433s: 10.717s less wait, about 71% reduction | High for measured Challenge 1; later/public transitions need coverage |
| Yellow entry/removal repair | All-ten single-seed full entry; jumps about 279-294px to 2-2.7px | High geometric value; hittability/readability not proven |
| Guardians group capacity | 3/4 active dives reduced to intended 2 at Stages 5/6 | High invariant confidence; preview, not Guardians v1 |
| Private asset recovery/exclusion | 50 verified files recovered; no private bytes in temporary public package | High risk reduction; runtime package checks/off-machine backup remain |
| Persisted references and automated inspection | Native frame identity, immutable comparison and repeatable checks | Enables decisions; avoid expanding diagnostics without a bounded repair |
| This continuity experiment | Rejected two trade-offs before release | Useful risk avoidance, zero new shipped gameplay improvement |

The first correctness/safety changes were strong returns. Further broad generic
path tuning now shows diminishing returns: continuity, dwell and clearance are
coupled. Narrow the next experiment to one family/exit window, with explicit
dwell, displacement and zero-contact criteria, before further source changes.

## Release Recommendation

Prepare a correctness and release-hardening patch, not a fidelity milestone:
accepted cadence/audio, yellow/removal geometry, Guardians launcher/cap and
private asset exclusion. Rejected continuity candidates must not be included.
No version assigned; reconcile planned 1.4.2 scope first.

Hosted dev is the next review lane only after explicit authorization and existing
gates. Beta/production remain blocked under the retained zero-contact contract.
Do not bypass it by calling contacts pre-existing. Resolve gameplay readiness,
actual packaged runtime checks and candidate-wide production-relative review.
Keep exact fidelity, broad persona distribution, Guardians v1 and platform
redesign outside this patch; professional feasibility follows readability.
