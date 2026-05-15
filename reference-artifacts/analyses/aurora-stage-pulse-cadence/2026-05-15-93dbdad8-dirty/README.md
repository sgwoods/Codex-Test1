# Aurora Stage Pulse Cadence Pressure Analysis

Generated: 2026-05-15T16:29:55.833Z
Commit: 93dbdad8 (dirty)

## Problem

Aurora stagePulse is the leading audio segment gap. As gameplay pressure, it should read as a low, calm formation cadence bed rather than a bright foreground tick.

## Current Read

- Cadence pressure score: `2.68/10`
- Weakest axis: `brightness-control`
- Highest event-gap cue: `challengePerfect` risk `7.7/10`
- Latest candidate decision: `no-keeper`

| Axis | Score | Aurora | Reference | Meaning |
| --- | ---: | --- | --- | --- |
| Brightness control | 0.83 | `0.5226` | `0.2659` | A pressure cadence can be audible without pulling too much energy into mid/presence bands. |
| Low-band body | 0.98 | `0.1474` | `0.454` | Formation pressure should have enough low-frequency body to read as a marching bed, not only a bright tick. |
| Zero-crossing calm | 1.97 | `1911.5` | `547.2` | Lower crossing density keeps the cadence from feeling scratchy or over-complex. |
| Envelope smoothness | 3.14 | `{"attack_peak_position":0.75,"burst_share":0.414}` | `{"attack_peak_position":1,"burst_share":0.222}` | The cadence should feel like pressure building, not a foreground impact event. |
| Gain match | 3.81 | `0.1618` | `0.0813` | Formation cadence should create pressure without masking shot, hit, and capture feedback. |
| Duration pocket | 8.33 | `0.23` | `0.21` | The pulse needs to sit inside the repeat cadence without smearing into a continuous drone. |

## Strategy

Use the full browser-rendered audio-theme comparison as the source of truth, then summarize the stagePulse cue with gameplay-facing cadence axes: low-band body, brightness control, zero-crossing calm, gain match, duration pocket, and envelope smoothness.

## Next Step

Add a cadence-specific candidate generator that jointly optimizes low-band body, brightness control, zero-crossing calm, and gain. Promote only after both repeated focus gates and full audio-theme comparison improve.

