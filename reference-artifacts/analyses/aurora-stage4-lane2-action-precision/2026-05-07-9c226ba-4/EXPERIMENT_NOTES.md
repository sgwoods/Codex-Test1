# Stage 4 Lane-2 Scheduling Probe Notes

## Current Problem

The source-exact lane-2 input window still does not make the archived column-5 butterfly dive. The source enemy is present and formation-ready, but normal selection does not choose it in the sampled source-loss window.

## Probe Ladder

- Source-exact input variants: `0/14` produced source-column dive/lower-field frames.
- Cooldown-only probes: the earliest window can start the target dive, but the path remains high and never reaches the lower field by the source loss window.
- Cooldown plus rate/gap probe: reaches the lower field, but geometry remains weak (`46.37` best contact score).
- Priority-selection probes: source-column lower-field path appears; the best current benchmark is `source-exact-priority-13p85` with contact score `4.53` at `15.266s`.

## Interpretation

The next runtime experiment should be a bounded selector-priority strategy, not a plain cooldown change. This should be implemented as a candidate with strict Stage 4/window/target guards and measured first with this analyzer before spending the full realtime loss-window gate.

## Effort vs Value

The corrected probe ladder cost about `38.743s` wall / `65.76s` CPU in the economics ledger and avoided another likely low-value full replay gate. The value was diagnostic: it separated cooldown, selection probability, and priority selection as distinct causes.
