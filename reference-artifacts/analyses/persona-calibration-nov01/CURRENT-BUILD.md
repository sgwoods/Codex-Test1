# November 1 Current-Build Persona Qualification

Verified November 1, 2026 from the completed100-row panel. All five frozen
nonregression gates pass. Baseline `b17c5d63`; clean input build1257 / source
`cb70121e9c5f29c483eec54f17b44e115a87c55f` has identical runtime JavaScript.
Both arms are derived and retain original build metadata. This evidence does
not establish runtime integration or authorize a release.

Subsequent local integration and fresh-build evidence are recorded separately in
the [November1 player-quality report](../../../PLAYER_QUALITY_2026-11-01.md).

| Panel | Control median | Candidate median | Control / candidate at75k | Destructions | Censored control / candidate |
| --- | ---: | ---: | --- | --- | --- |
| Expert matched |81,275 |102,020 |6/10 ->7/10 |32 ->29 |0 /2 |
| Expert reserved |97,780 |97,780 |8/10 ->8/10 |34 ->29 |0 /1 |
| Beginner matched |7,235 |7,235 |0/10 ->0/10 |31 ->31 |0 /0 |
| Intermediate matched |21,995 |21,995 |0/10 ->0/10 |34 ->34 |0 /0 |
| Professional matched |240,785 |240,785 |10/10 ->10/10 |8 ->8 |10 /10 |

Matched seeds91001-91010 cover all four personas; reserved seeds93001-93010
cover Expert only. Each arm has10 observations per panel. Stage1, three ships,
Watch game scope, no challenge,900-second update budget. Frozen gates require
no decrease in median or75k attainment, no increase in destruction total, and
no new early losses per matched seed. The reserved seed93007 score regresses;
panel-level nonregression is not per-seed dominance.

All30 other-persona pairs preserve non-audio events and mechanical snapshots,
excluding visual effect counts. Expert event prefixes agree before the first
policy intervention; the frozen first-pair loss/score/stage floors pass.
All100 receipt/session/trace/stdout hashes were rechecked, terminal outcomes
were reclassified, and all24 source audio hashes were verified before export.
See the [export method and commands](EXPORT.md) and
[sanitized observations and provenance hashes](current-build.json).

The history appends A10a-d, preserving the earlier23 panels/410 observations,
for27 panels/510 observations. No extended natural Watch/Rival repeats count
toward these totals. The23 new time-limit observations are right-censored,
shown as triangles: observed scores are lower bounds, not final career scores.

This panel uses the existing automated actuator contract, not human inertia.
It does not prove human feasibility, live Watch/Rival mode parity, every-tick
equivalence, independent audio decoding, or reference audio fidelity. Runner
cleanup attestations cover observed descendants, not physical containment.
Dependency hashes bind the qualification snapshot; the exporter does not
execute or independently requalify the runner dependencies.
