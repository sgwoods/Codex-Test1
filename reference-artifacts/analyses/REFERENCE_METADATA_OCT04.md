# Reference metadata repair

Baseline: c996b804f1558006df2f5441d06671ec2d3268db. Local only; no gameplay edits or publication.

## Findings

The object tracker excludes normalized Y outside 0.105-0.875, measures component
centroids rather than full sprites, samples at 8fps without native PTS, and
requests five temporal clusters rather than identifying five waves. Successful
shots censor trajectories. Its confidence/readiness values are uncalibrated
heuristics, not conformance probabilities.

Primary perfect-play source SHA-256:
`8d29ea711d09d243a2904bf9538981d97fe1fa323e4f920177688fa2b4c4c840`.
Persisted private source:
`private-artifacts/repo-mirror/reference-artifacts/analyses/challenge-visibility-oct03/challenge-all2.mp4`.
Titles alone do not authenticate game edition. The secondary perfect compilation
and Downloads/challenging.mp4 are hash-identical aliases, not independent runs.
No verified original Challenge 8 missed-target run has been identified.

The previously recorded native bottom packet contains 120 verified frame hashes:
`challenge-bottom-reference/2026-10-03T21-29-49-651Z-721ac9a0/manifest.json`.
It covers PTS 245.500000-247.466667 and 249.000000-250.966667, not complete lifetimes.

## Implemented

- Generator hashes actual source bytes and checks declared hashes when present.
- Each regenerated challenge declares coverage, timing, censoring and capabilities.
- Legacy metadata is explicitly unqualified, not silently accepted.
- Explicit full-entry/full-path/wave-identity checks refuse these tracklets.
- Stage-conformance generation propagates qualifications into stage rows/summary
  and removes the instruction to treat heuristic scores as release-facing truth.
- Existing scores, numeric thresholds, runtime safety checks and release gates remain unchanged.

## Verification and limits

Contract behavior tests pass: descriptive acceptance, six unsupported-claim
rejections, unknown claim rejection and missing-provenance rejection.
Eight-challenge regeneration and descriptive checker pass.
Stage-conformance browser-backed reports, controls and both execution descriptions
have now been regenerated. Additional authoring/sweep output generation propagates
qualifications but those two reports were not rerun. No Stage 7 gameplay work resumed.
Existing historical reports remain historical.
The contract is a declaration, not proof that an annotation is correct; source
hash syntax alone is not a source-availability check. Generation verifies bytes.

## Next work

Fresh Aurora capture:
`challenge-reference-comparison/2026-10-04T21-45-36-528Z-c996b804/report.json`.
37 full-canvas samples per condition, seed9131, Stage31, classic-arcade graphics.
Professional scored28/40, clear10.333s and next-stage spawn14.767s.
No-fire scored0/40, clear11.750s and spawn16.183s, with four nonlethal contacts.
Both preserve three lives. Cadence is approximately4.433s, not renewed15s delay.
Single-pilot performance is not proof of impossible perfection. No-fire exits are
not comparable to shot-censored perfect-play exits without matched evidence.
Session-wide event logging fixes a capture limitation found during this work;
the earlier21:44 capture is superseded for event-based conclusions.

1. Native-PTS event boundaries and explicit wave/target identities, with ambiguity
   and shot-censoring labels. Player benefit: tune the correct route, not a fragment.
2. Comparable Aurora Professional single-ship capture plus a separate no-fire
   diagnostic. Player benefit: isolate actual readability/timing differences.
3. Propagate qualifications through trajectory controls, candidate sweep and
   reference/authoring descriptions. Stage 7 remains paused.
4. Regenerate consumer reports and rank a small set of observed variances before
   changing gameplay. No perfect-route or full-exit acceptance is established here.
