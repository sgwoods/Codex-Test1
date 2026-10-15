# Stage31 blue contact diagnosis

Read-only October 12 cycle. HEAD baseline cf0e7a666067ede385865ba02e73d1454eb132d1 is not the candidate identity: lead source is dirty, with provisional paced green departure and combat ceiling.

## Provenance

Lead root: <workspace>.
Current report: reference-artifacts/analyses/late-challenge-contacts/2026-10-12T16-35-15-815Z-cf0e7a66/report.json.
Report SHA256: 43ed95a669ffa34a015ebbb470b1ba95e3e2d581cbf76695203f555c2f293b99.
Bundle SHA256: d86e64702c5174e791409385c81901817af4e750d56a68e7a39c3eb311ff24b5.
Method SHA256: 58592f60d04a0e883851c3c4aa3f05df2512a6d50bde78185da72cd7bdd636e9.
Enemy source SHA256: f5cfea660e80d062a70f2d410a5723eaf6dc76d0743582bccd331b3a4f325dcb; current lead file independently hashes identically.
Harness source SHA256: ad6535ae97a302db467e99dae08274b329723aa2f460df5966a42bdf3bd8ad2b.
Player combat source SHA256: c01720fd25b08ef4e439107d2aca1a3a0915149ac675f203f61d245bf94d722f.
No browser execution, gameplay edits, build, integration or release performed in this diagnosis.

## Findings

All three are blue-purple-finale, stationary human no-fire seed9131. Groups below are one-based; wave/lane are diagnostic zero-based indices, not dynamic screen lanes.

| Target | Group/wave/lane | First contact t/u | Previous to contact displacement | Middle-exit jump |
| --- | --- | --- | --- | --- |
| 51406268 | 1/0/4 | 7.967 / 12.264 | (-2.07,+2.24) px | 82.917px at6.517s |
| 942182592 | 5/4/5 | 21.517 / 11.896333 | (-4.61,+2.17) px | 119.152px at20.283s |
| 709114509 | 5/4/7 | 21.717 / 12.015 | (-4.56,+2.19) px | 148.870px at20.417s |

Actual first-contact centers: (139.77,324.33), (128.91,325.83), (151.77,342.87), against player (140,335). All are full-view, exit-phase samples with applied bias48. Same-frame zero-bias overlap is false for each; subtraction is a diagnostic counterfactual, not a simulated safe replacement. Contact is continuous descent/crossing, NOT a contact-frame teleport. The preceding exit joins do teleport upward/right: respectively (+39.47,-72.92), (+42.85,-111.18), (+40.66,-143.21) px. Removing only the join discontinuity does not establish contact safety.

Source: src/js/06-enemy-behavior.js middle blue branch543-545, exit q558 and blue branch627-629; route/spacing/deconflict642-644; lower-field bias645-648. Exit q is unbounded (u-9.7)/3.35; its positive downward term is subsequently augmented by the saturated bias. Green-only splice651-662 cannot affect these contacts. Cull673 is not a safe-contact repair.

Smallest shared candidate boundary: exact Stage31 generic blue-purple-finale EXIT at u>=9.7, including ownership of final post-offset/bias pose. Preserve every pre-u9.7 coordinate and timing; do not change shared bias globally, hitboxes, contact policy, clock, spawn schedule or other families/stages. A family-scoped edit also touches group3, so groups1/3/5 all require preservation checks. Do not target particular IDs or lanes merely to eliminate this stationary witness.

## Shooting witnesses to preserve

Same-bundle approved normal-key pilot report:
/private/tmp/aurora-feasibility-pilot-oct12/private-artifacts/feasibility-pilot/2026-10-12T16-47-25-469Z/report.json.
Tool SHA256 bc520d6708f68b049ed424971c384dce042b91e0ab108e7c9f1fc99c24c3dd6b.
Actual enemy_killed events: 51406268 at2.683s, 709114509 at15.900s, 942182592 at16.033s. Matched no-fire traces place them in ENTRY at u3.0076,1.661333,2.136 respectively. These are full-route normal-key kill witnesses, not isolated one-shot attribution. Recorded-input fresh replay matches ordered events and recorded projection; this is not independent controller determinism or perfect feasibility. Total37 unique kills/80shots, three misses, zero losses, max two bullets. Preserve replay input trace and these kills, plus unaffected targets; do not claim the three missed targets unreachable.

## Disposition and next experiment

Current Stage31 no-fire contact acceptance FAILS (three nonlethal contacts), while green repair success and entry shooting remain distinct evidence. Original exit-trial-oct08/REVIEW rejected a broad Hermite repair despite contacts4->0 because nine full-view windows shortened. Do not repeat its endpoint guesses. STAGE31_SURVIVOR_SCREENING_OCT07.md supports provisional group2 upper-right and group3 upward-left survivors, not proven group1/5 exits. It does not authorize copying green direction or the group2 final-visible half-second bracket to blue.

Smallest next executable experiment is measurement-only: replay the same frozen seed9131 no-fire launch and the saved approved input trace; capture final post-offset pose/velocity across u9.7 and full-view/shot opportunities for every blue target in groups1/3/5, paired with a hash-bound original group1 or5 survivor-exit window. Resolve that reference correspondence before selecting ONE Stage31-blue exit continuation. A later experimental continuation must preserve pre-u9.7 exactly, join continuously, remove the three contacts, retain full entry and the above kill witnesses, and pass unchanged Stage3 plus other-family controls. No endpoint/rate is justified by the currently reviewed group2/3 footage; until group1/5 evidence exists, a safety-only proposal needs explicitly experimental acceptance rather than a canonical claim.
