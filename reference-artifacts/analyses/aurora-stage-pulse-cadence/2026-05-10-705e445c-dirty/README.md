# Aurora Stage Pulse Cadence Pressure Analysis

Generated: 2026-05-10T18:37:38.225Z
Commit: 705e445c (dirty)

## Problem

Aurora stagePulse is the leading audio segment gap. As gameplay pressure, it should read as a low, calm formation cadence bed rather than a bright foreground tick.

## Current Read

- Cadence pressure score: `1.36/10`
- Weakest axis: `brightness-control`
- Highest event-gap cue: `stagePulse` risk `5.23/10`
- Latest candidate decision: `no-keeper`

| Axis | Score | Aurora | Reference | Meaning |
| --- | ---: | --- | --- | --- |
| Brightness control | 0 | `0.5974` | `0.2659` | A pressure cadence can be audible without pulling too much energy into mid/presence bands. |
| Zero-crossing calm | 0 | `2687.9` | `547.2` | Lower crossing density keeps the cadence from feeling scratchy or over-complex. |
| Low-band body | 0.09 | `0.1172` | `0.454` | Formation pressure should have enough low-frequency body to read as a marching bed, not only a bright tick. |
| Gain match | 0.22 | `0.2085` | `0.0813` | Formation cadence should create pressure without masking shot, hit, and capture feedback. |
| Envelope smoothness | 3.96 | `{"attack_peak_position":0.909,"burst_share":0.391}` | `{"attack_peak_position":1,"burst_share":0.222}` | The cadence should feel like pressure building, not a foreground impact event. |
| Duration pocket | 7.58 | `0.181` | `0.21` | The pulse needs to sit inside the repeat cadence without smearing into a continuous drone. |

## Strategy

Use the full browser-rendered audio-theme comparison as the source of truth, then summarize the stagePulse cue with gameplay-facing cadence axes: low-band body, brightness control, zero-crossing calm, gain match, duration pocket, and envelope smoothness.

## Next Step

Add a cadence-specific candidate generator that jointly optimizes low-band body, brightness control, zero-crossing calm, and gain. Promote only after both repeated focus gates and full audio-theme comparison improve.
