# Challenge 8 wave timing

Baseline b73ee491. No gameplay changes, push or publication.

## Repair

The tracker now uses242.0-258.8 only for Challenge8 on source
SHA2568d29ea711d09d243a2904bf9538981d97fe1fa323e4f920177688fa2b4c4c840.
The generator validates actual bytes before decoding. Missing Downloads paths
can fall back to the persisted copy of that same source, not another clip.
Other stages retain the16second default cap, explicitly marked when truncated.
Requested duration16.8s decodes to134samples at8fps (reported duration16.75s).
This includes the previously omitted final-wave observation; it does not establish
complete target lifetimes, exact identities or intact exits. Strict capabilities
remain false. Review provenance and requested/decoded timing remain distinct.

## Comparable observations

Original provisional arrival brackets from native-indexed previews:
`reference-wave-previews/2026-10-05T12-08-15-502Z-d686a350/REVIEW.md`.
Aurora accepted arrival capture:
`challenge-reference-comparison/2026-10-05T17-16-31-229Z-b73ee491/report.json`.
The earlier17:15capture is superseded: it omitted translation of sprite-local
bounds into playfield coordinates. Center timestamps were unaffected, but its
pose-union timestamps must not be used.

| Arrival | Original first-body bracket (source seconds) | Aurora first center | Aurora first two-pose union intersection |
| --- | --- | --- | --- |
| 1 | (242.0,242.2] | 1.017 | 0.983 |
| 2 | (245.8,246.0] | 2.233 | 2.050 |
| 3 | (249.2,249.4] | 2.800 | 2.767 |
| 4 | (252.0,252.2] | 3.733 | 3.567 |
| 5 | (255.8,256.0] | 4.467 | 4.433 |

First-to-fifth span: original13.6-14.0seconds versus Aurora3.45seconds, about75%
shorter. Aurora values agree in Professional and stationary/no-fire conditions.
All40target IDs were observed; each of five runtime waves contains eight.
The pose union is conservative, not exact current-frame pixel visibility.
Original rows are observed arrival episodes, not validated runtime wave mappings.
Source edition is not authenticated. This is strong evidence of a sequencing
variance candidate, not an exact conformance delta or permission to copy timings.

## Player-facing priorities

1. Wave separation proposal: measure per-wave overlap/dwell and propose one
   reference-derived spawn schedule before source editing. Player benefit:
   recognizable shooting sequences rather than several simultaneous trains.
   Acceptance should protect all40 full-entry targets, no-combat safety, Stage3
   keepers and canonical result audio/cadence. Do not combine with path tuning.
2. Exit evidence: locate an authenticated original missed-target sequence before
   shaping no-fire exits. Player benefit: predictable movement near the ship.
3. Perfect opportunity: investigate single-stage firing windows after sequencing
   and visibility repairs; one Professional28/40 run proves neither feasibility
   nor impossibility. No multi-seed professional sweep yet.

## Verification

Reviewed-window behavior tests pass: correct SHA/stage override, wrong SHA and
other stage retain the cap, invalid durations reject. Object-track regeneration
and descriptive check pass. Arrival checks confirm40IDs, eight per wave and
pose-union entry no later than center entry in both conditions. Independent review
identified hash binding, persisted fallback, default-cap wording and coordinate
semantics; these were addressed. Syntax/diff checks pass.
Downstream conformance scores generated before this revised window are historical
and must be regenerated before any new score comparison or release claim.
