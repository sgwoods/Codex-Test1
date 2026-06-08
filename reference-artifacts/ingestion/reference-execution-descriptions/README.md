# Reference Execution Descriptions

Reference execution descriptions are game-owned, partially executable
descriptions of one source gameplay window. They sit between raw reference
artifacts and runtime tuning.

The goal is to reduce fuzzy tuning by naming:

- the source window and evidence files
- the ordered gameplay phases or groups
- semantic intent, such as `boss-led-loop`
- object-track execution evidence, such as primary target tracks and aggregate
  group vectors
- a canonical comparison path family that resolves older semantic labels
  against newer measured object-track and motion-spec evidence
- comparison axes that a runtime capture should report
- guardrails that block runtime promotion

## Schema 0.1

Required top-level fields:

| Field | Meaning |
| --- | --- |
| `schemaVersion` | Schema version. Current value: `1`. |
| `artifactType` | Must be `reference-execution-description`. |
| `gameKey` | Game that owns the interpretation. |
| `releaseFamily` | Release family advanced by the artifact. |
| `scope` | Stage/challenge/window identity. |
| `sourceReferenceWindow` | Source video, source window, timing, and evidence paths. |
| `sourceArtifacts` | Existing artifacts used to build the description. |
| `executionModel` | Ordered phase list, target count, safety guardrails, and runtime comparison protocol. |
| `groups` | Ordered group/phase descriptions. |
| `summary` | Confidence and precision-read summary. |
| `keeperRules` | Measurement/runtime/beta interpretation. |

Required group fields:

| Field | Meaning |
| --- | --- |
| `groupIndex` | One-based group order within the challenge. |
| `phaseId` | Stable group/phase identifier. |
| `role` | Human-readable gameplay role. |
| `semanticPathFamily` | Intended path family from game-owned challenge semantics. |
| `objectTrackExecutionFamily` | Path family implied by target-video object-track execution evidence. |
| `canonicalComparisonPathFamily` | Path family used by candidate/promotion gates. |
| `pathFamilyDecision` | Source, agreement, and reason for the canonical path-family choice. |
| `primaryTargetTrackId` | The selected target track used for direct runtime comparison. |
| `aggregateObjectTrackTarget` | Group-level object-track summary. |
| `primaryObjectTrackTarget` | Per-object primary track summary. |
| `primaryTrackRelativePoints` | Inspectable normalized point sequence for the primary track. |
| `candidateComparisonGate` | First promotion floors and guardrails for a runtime candidate. |
| `comparisonAxes` | Runtime axes that must be reported before promotion. |
| `precisionNotes` | Known ambiguity or conflict to keep visible. |

Runtime candidates may use the artifact only after an analyzer reports the
deviations and explicitly states whether the artifact is precise enough for a
candidate. Candidate readiness and runtime promotion readiness are separate:
the current runtime can have clear deviations while the artifact is still
precise enough to guide one candidate. A measurement keeper is useful, but it
is not beta justification by itself.

## Stage 7 Authority Note

For the Stage 7 / Challenge 2 pilot, `canonicalComparisonPathFamily` is
measured-reference comparison intent. It is not source-promotion authority by
itself while it conflicts with live promotion gates. The current authority
decision is generated at:

`reference-artifacts/analyses/reference-execution-authority/stage7-challenge2/latest-path-family-authority.json`

Until that decision changes, source-ready candidates must match the live
promotion gate/runtime order, and RED/setpiece measured intent should be used
as target-conformance debt and diagnostic guidance rather than permission to
change runtime source. The authority report must keep two reads separate:
promotion authority, which gates source candidates today, and target
conformance authority, which records the measured reference direction the game
may migrate toward after direct proof.
