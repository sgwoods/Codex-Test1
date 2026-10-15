# Challenge 8 preview review

Reviewed October 5, 2026. Baseline d686a350. Source SHA and native frame/PTS
identities are in manifest.json; source pixels remain in private storage.
Lead visually reviewed all five sheets. Times below are 0.2-second sample
brackets, not exact event times or individual target annotations.

| Observed arrival sequence | Previous sample without this arrival | First sample showing this arrival | Entry read |
|---|---:|---:|---|
| 1 | 242.0 | 242.2 | upper-field paired blue bodies |
| 2 | 245.8 | 246.0 | partial left-edge body, fuller train at246.2 |
| 3 | 249.2 | 249.4 | partial right-edge arrival |
| 4 | 252.0 | 252.2 | upper-field paired blue bodies |
| 5 | 255.8 | 256.0 | upper-field paired blue bodies |

Intact bodies remain in the fifth sequence at258.4; the258.6 sample shows
explosion/effect rather than intact bodies. Shooting censors the paths.
These five observed arrival episodes are provisional human annotations, not
verified eight-target wave identities or correspondence to Aurora groups.

## Concrete metadata defect

Existing Challenge8 object tracking starts at241 and caps the analyzed window
at16seconds (ending257). It excludes the observed late fifth-wave movement.
It also excludes field-edge pixels. It cannot support complete-wave or exit
acceptance even if its inferred cluster count is five.

Do not simply widen every compilation window: historical coarse windows overlap
and may admit adjacent stages. The next repair should use reviewed per-stage
event boundaries, explicit crop/window coverage and a native-frame ledger.
For this source, a provisional active observation interval242.0-258.8 includes
these episodes; it is not yet a verified per-target lifecycle interval.

## Player implications and next decision

1. Wave sequencing: reference arrivals are visually separated by roughly3-4s,
   while Aurora's configured waveDelay is0.86s. These use different definitions
   (first visible vs spawn schedule), so measure Aurora first-visible times before
   declaring a timing delta. Player benefit: clearer, learnable shooting sequences.
2. Complete exits remain unknown because this run shoots all targets. Locate a
   verified missed-target original run before matching no-fire exits. Player
   benefit: repair unexpected crossings without inventing original behavior.
3. Refine the five arrival brackets at native frame resolution; verify source
   edition and target/wave identities. No gameplay tuning or release acceptance.
