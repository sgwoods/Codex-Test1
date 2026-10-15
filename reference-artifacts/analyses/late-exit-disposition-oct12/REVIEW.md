# Late Exit And Opportunity Disposition

October 12, 2026. Review only; no gameplay edit or publication.
Current HEAD cf0e7a666067ede385865ba02e73d1454eb132d1 with dirty accepted local
source06 SHA2561b442dfae869fe3f8a7cc39edaaa2d05860b3a7cdf33c5e796ebae13167ce532.
Served and inspected bundle9c320d50301a46f93f8f27bcc2f28af412b88043ba00e411f4a329c8585ef4fa.

## Decision

Keep Stage35/39 overlap and discontinuous exits as beta gameplay blockers under
the adopted smooth-exit policy. Do not waive these merely because no life is
lost. Stage31 remains accepted provisionally: zero contacts in both themes.
This step supplies evidence and disposition, not a new gameplay improvement.

Fresh capture command: node tools/harness/capture-challenge-contact-sequences.js
--stages=31,35,39. The tool now accepts selected challenge stages and records
completed zero-contact runs. Current report is linked by summary.json; it binds
source, bundle, method and image hashes. Twenty event-replayed sequences contain
140 canvas PNGs, seven frames per sequence, in Classic and Crown themes.

| Stage | Contacts per theme | Affected groups (one-based) |
| --- | --- | --- |
|31|0|None in this stationary run|
|35|3|1 blue, 2 green, 5 blue|
|39|7|1 blue, 2 green, 3 blue twice, 5 blue three times|

The lead inspected Crown frames at contact+2 for all ten IDs (two IDs share the
same frame). Stage35 shows obvious sprite/ship overlap in all three sequences.
Stage39 includes multiple obvious overlaps and crowded ship-row departures;
247206774 is a glancing lower-left pass in the inspected frame. These are visual
observations, not exhaustive alpha-mask intersection classifications per target.
summary.json identifies the exact frames, IDs and separate collision samples.

All ten contacts occur in exit-phase continuous crossings. Separately, the
earlier middle-to-exit boundary has blue jumps84.62-120.58px and green219.39px
between adjacent60Hz sampled positions. These are different defects and must
not be described as teleporting at the moment of contact. Fresh telemetry still
shows40/40 full entry, completion, zero enemy bullets/attackers and three lives
retained. These checks establish the no-combat contract, not visual acceptance.

## Stage31 Opportunity Trade-Off

- Group1: three surviving targets lose0.483/1.383/0.733s total full-view time.
- Group5: eight targets lose0.183-1.117s total full-view time.
- Green target372665405: prior paired measurement of longest continuous full
  view is1.967->0.883s. Early right40 one-shot witnesses remain20/41.
- Current integrated replay retains37/40 kills,80shots,zero losses, identical
  recorded gameplay events/projection, and both repaired Group5 early kills.

Total visibility, continuous visibility and reachable firing windows are not
interchangeable. The shortened totals include removal of defective departure
travel. The preserved shots justify retaining provisional local repairs; they
do not prove that every lost late shot was redundant or that40/40 is feasible.
Nor does a37/40 heuristic prove an impossible stage. No new impossible target was
demonstrated in this review. Do not reopen broad pilot optimization as a beta
gate. Preserve a targeted late-window shot check in the next repair acceptance.
Primary paired evidence is in blue-group1-exit-oct12, blue-group5-exit-oct12,
green-paced-exit-oct12 and its subsequent provisional acceptance in ACTIVE_WORK.
Older rejected/conditional green reports retain their historical verdicts;
their measurements must not silently become exact reference-fidelity approval.

## Next Bounded Packet

Recommend ONE exit-continuity candidate for the demonstrated later blue/green
paths, preserving all pre-exit motion, normal controls, real stage numbering,
audio and global clock. Use Stage35/39 as failing cases and Stage3/31 as controls;
then check representative later reuse at63/127. Require smooth joins, no ship-row
crossing, full entries, normal completion/cadence and real shooting witnesses.
Reject a candidate that only hides contacts, deletes visible targets or worsens
usable firing opportunities without explicit disposition. No rate/endpoint sweep.

The adopted alternative is bounded pattern reuse after30. It can reduce research,
but selecting Stage31's layout alone will NOT reuse its S.stage===31 exit guards.
Schedule and path behavior must be carried together while retaining actual stage
identity. Stage39 Group3 also has no directly accepted Stage31 repair counterpart.
Treat broader reuse as an explicit content choice if the bounded exit candidate
fails, not a silent numeric guard expansion. Exact all-lane original fidelity and
perfect-pilot optimization stay outside this beta's critical path.
