# Normalized Stage 31 scheduling trial

Baseline c49b75c6. Candidate offsets[0,3.593,7.137,9.997,13.79] were applied
only through the existing developer motion-profile hook. No gameplay source,
private audio asset, hosted lane or main integration changed.

## Results

| Metric | Baseline | Candidate |
| --- | --- | --- |
| Four/five-wave visible overlap | 4.767s | 0s |
| Three-or-more-wave visible overlap | 6.133s | 0.817s |
| Launch to clear (normalized setup) | 10.783s | 21.117s |
| Clear to next-stage spawn | 4.434s | 4.433s |
| Full-entry targets | 40/40 | 40/40 |
| Nonlethal contact events | 6 | 6 |

All13,778 positive-local-time samples match exactly in position and local time,
with100% coverage per target. Continuous full-entry dwell does not regress.
No enemy shots, attack starts or ship losses in the measured challenge window.
Two targets have different trace lengths at nonpositive local time; complete
lead-in/removal equivalence is not established. Stage3 repeat control matches
22,005positive-time samples, but is not an override-exclusion test.

The recorded seven measurement checks pass. Effective offsets are asserted
exactly; spawn-plan readback deltas differ by at most0.003s because the existing
API rounds spawnPlan to0.01s. Positive-time matching uses1ms keys, not frame
indices. A subsequent symmetric duplicate-key check was verified offline against
both persisted traces; neither baseline nor candidate contains duplicate keys.

## Visual read

Lead inspected baseline6s and candidate12s PNGs. Candidate has fewer simultaneous
trains and less central crowding, but overlaps within individual groups remain.
Samples do not establish continuous perceptual clarity or absence of idle gaps.
Duration nearly doubles; that tradeoff needs normal play inspection, not automatic
acceptance based on lower wave count. Relative reference identities remain provisional.

## Measurement repairs and limits

The first trial paired local samples by array index and falsely reported138.9px
motion differences. Correct pairing by local time yields zero difference.
The initial strict spawn-plan tolerance ignored the API's0.01s output precision;
it was replaced with the documented combined rounding bound, not a gameplay gate change.
Superseded intermediate captures are retained in ignored private storage.

Natural-start override attempts failed explicit checks: normal startup creates
a fresh adapter state and the suggested constructor is not browser-visible.
No passing natural override test is claimed. The current experiment normalizes
first-arrival delay and regenerates enemies after initial start; timings are not
directly interchangeable with the earlier natural launch. Result/transition cue
events remain present in the public-safe aurora-crown theme, not canonical private
Galaga audio; no audibility or perfect-result audio verification was performed.

## Verdict and next step

Retain as a promising normalized scheduling candidate, not a gameplay keeper.
Next: add/test a narrowly scoped developer harness launch override at the fresh
state creation boundary, then inspect ordinary Stage31 baseline/candidate play
with canonical audio checks. Player benefit: clearer shooting sequences without
unnecessary challenge padding. Preserve paths, Stage3 keepers and full-entry.
Do not deploy, promote, start a path-tuning cycle or run a multi-seed pilot sweep.
