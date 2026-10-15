# Stage 31 wave separation proposal

Baseline30fe55d5; no gameplay edits or publication. `report.json` contains the
60Hz stationary/no-fire measurement, per-target pose-union dwell, wave visibility,
0.1s wave-count samples and an analytical, unexecuted proposal.
The method was strengthened afterward with assertions for stage/persona and
motion-spec precedence; the recorded methodHash describes the captured version.

## Observed player problem

Five waves simultaneously visible for3.017s; at least three for6.150s.
Individual wave visibility spans approximately7.32,6.85,7.05,3.87,7.10seconds.
All40targets fully enter. The shortest uninterrupted full-pose containment is
0.617s (wave index2, lane7, target353909248). This is a geometric observation,
not a shot opportunity or perceptual readability verdict. Persistent five-wave
overlap provides a concrete reason to test clearer sequences rather than
continue arbitrary endpoint/path adjustments.

## One bounded proposal

Exact Stage31 developer-only override:

```json
{"groupSpawnOffsets":[0,3.593,7.137,9.997,13.79]}
```

These replace effective current offsets[0,0.86,1.72,2.58,3.44]. Derivation:
current offset + (baseline wave0 first-body proxy + reference relative arrival
spacing - baseline group first-body proxy). Reference spacings[0,3.8,7.2,10,13.8]
come from midpoint estimates of0.2s preview brackets; identities remain provisional.
Preserve all path, local speed/phase, lane staggering, lead-in and type fields.
Do not edit a shared fromStage31 layout: it can affect later challenges.

Player benefit: easier-to-recognize arrival sequences and less competing visual
traffic. Tradeoff: late-group timing shifts by10.35s; if local paths translate
unchanged, the no-fire challenge duration may grow from about11.75 to22.10s.
This is not evidence that22.10s matches the original: shooting censors reference
paths. A spawn-only change will not repair existing green-path discontinuities.
Result-to-next-stage cadence must remain near4.433s with canonical audio present.

## Trial acceptance

- Harness-only, exact Stage31 scope; no permanent runtime edits initially.
- Arrival timings align with proposed relative spacings within60Hz quantization;
  record actual peak wave count and multi-wave overlap rather than assume reduction.
- Compare trajectories at matched local path time. No speed, path, phase, type,
  lead-in or per-target continuous full-entry regression;40/40 full-entry retained.
- No challenge enemy shots/attacks/ship loss. Record nonlethal contacts separately.
- Stage3 keeper behavior remains unchanged; retain canonical result audio/cadence.
- Inspect the candidate visually for clarity and excessive idle gaps.
- No multi-seed Professional sweep, release promotion or perfect-feasibility claim.

Independent read-only review confirmed offset precedence, local/global timing
distinction, exact-stage scoping and the need to compare local-time trajectories.
Baseline capture passes its entry/safety assertions. Trial remains unexecuted.
