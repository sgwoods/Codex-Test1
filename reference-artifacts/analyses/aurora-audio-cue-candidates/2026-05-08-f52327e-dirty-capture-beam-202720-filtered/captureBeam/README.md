# Aurora Capture Beam Audio Candidate Loop

Generated: `2026-05-08T20:27:20.133Z`
Commit: `f52327e`

## Problem

Capture Beam is the highest whole-cue Aurora audio event-gap risk. The current runtime cue is too long, too low-heavy, and peaks too late, so the tractor-beam danger/rescue moment reads less urgently than Galaga.

## Strategy

Generate bounded synthetic beam candidates, capture each through the live browser audio engine, compare them against the measured Galaga tractor-beam window, and recommend promotion only when measured urgency improves without trading away stability. This favors shorter active duration, brighter centroid, lower sub-bass, stronger mid-band energy, earlier attack, and lower segment risk.

## Success Measure

A keeper must reduce overall capture-beam risk by at least 0.3, keep duration gap within 0.09s, improve segment risk when available, improve centroid by at least 80 Hz, materially reduce sub-bass, materially increase mid-band energy, move the attack earlier, avoid band-shape regression, and avoid RMS regression.

## Decision

- Status: `candidate-recommended`
- Keep candidate: yes
- Best candidate: `midlift-midband-early`
- Measured best: `midlift-midband-early`
- Reason: Selected candidate clears duration, risk, segment, centroid, sub-bass, mid-band, attack timing, band-shape, and RMS gates.
- Repetitions per candidate: 1

## Candidates

| Candidate | Risk /10 | Worst segment | Dominant penalty | Duration Gap | Centroid Gap | Band Shape | Sub delta | Mid delta | Attack pos | RMS Gap | Stability | Keeper read |
| --- | ---: | ---: | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| Midlift midband early beam | 4.8 | onset 4.1 | attack | 0.079s | 247.5 Hz | 0.2581 | 0.2478 | -0.1412 | 0.344 | 0.0301 | 1x, risk sd 0 | clears keeper gates |
| Midlift sub-trim pulse | 5.17 | onset 3.83 | subBass | 0.021s | 423.2 Hz | 0.3114 | 0.3077 | -0.1504 | 0.889 | 0.0273 | 1x, risk sd 0 | sub-bass reduction 0.0283 < 0.05; mid-band gain 0.0324 < 0.04; attack timing improvement -0.489 < 0.04 |
| Midlift bright high-pass beam | 5.19 | onset 4.27 | attack | 0.01s | 445.4 Hz | 0.2795 | 0.2794 | -0.1345 | 0.605 | 0.0461 | 1x, risk sd 0 | attack timing improvement -0.205 < 0.04 |
| Midlift reference ratio beam | 5.26 | onset 4.53 | subBass | 0.03s | 398.5 Hz | 0.3275 | 0.3185 | -0.1026 | 0.632 | 0.0306 | 1x, risk sd 0 | sub-bass reduction 0.0175 < 0.05; attack timing improvement -0.232 < 0.04 |
| Low-mid balanced midlift | 6.27 | onset 4.98 | subBass | 0.08s | 574.6 Hz | 0.3467 | 0.3466 | -0.1309 | 0.442 | 0.0455 | 1x, risk sd 0 | centroid improvement 64.9 Hz < 80 Hz; sub-bass reduction -0.0106 < 0.05; attack timing improvement -0.042 < 0.04 |
| Current Aurora baseline | 6.99 | onset 5.77 | subBass | 0.141s | 639.5 Hz | 0.3359 | 0.336 | -0.1828 | 0.4 | 0.0531 | 1x, risk sd 0 | baseline |

## Next Step

Promote the selected Capture Beam spec into the Aurora runtime themes, rerun the audio theme comparison/event-gap suite, and refresh conformance economics/dashboard artifacts.
