# Aurora Capture Beam Audio Candidate Loop

Generated: `2026-05-08T20:30:32.568Z`
Commit: `f52327e`

## Problem

Capture Beam is the highest whole-cue Aurora audio event-gap risk. The current runtime cue is too long, too low-heavy, and peaks too late, so the tractor-beam danger/rescue moment reads less urgently than Galaga.

## Strategy

Generate bounded synthetic beam candidates, capture each through the live browser audio engine, compare them against the measured Galaga tractor-beam window, and recommend promotion only when measured urgency improves without trading away stability. This favors shorter active duration, brighter centroid, lower sub-bass, stronger mid-band energy, earlier attack, and lower segment risk.

## Success Measure

A keeper must reduce overall capture-beam risk by at least 0.3, keep duration gap within 0.09s, improve segment risk when available, improve centroid by at least 80 Hz, materially reduce sub-bass, materially increase mid-band energy, move the attack earlier, avoid band-shape regression, and avoid RMS regression.

## Decision

- Status: `no-keeper`
- Keep candidate: no
- Best candidate: `n/a`
- Measured best: `midlift-midband-early`
- Reason: The lowest-risk candidate did not clear all capture-beam keeper gates, and no other candidate did either.
- Repetitions per candidate: 2

## Candidates

| Candidate | Risk /10 | Worst segment | Dominant penalty | Duration Gap | Centroid Gap | Band Shape | Sub delta | Mid delta | Attack pos | RMS Gap | Stability | Keeper read |
| --- | ---: | ---: | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| Midlift midband early beam | 4.28 | onset 4.74 | subBass | 0.021s | 347.3 Hz | 0.2811 | 0.2723 | -0.1258 | 0.1 | 0.0548 | 2x, risk sd 0.565 | segment risk improvement -0.41 < 0.3; sub-bass reduction 0.0278 < 0.05; attack timing improvement -0.011 < 0.04 |
| Current Aurora baseline | 5.1 | onset 4.33 | subBass | 0.021s | 525.6 Hz | 0.3019 | 0.3001 | -0.1672 | 0.089 | 0.0553 | 2x, risk sd 0 | baseline |

## Next Step

Use the lowest-risk candidate and rejection reasons to seed a narrower second sweep before changing runtime audio.

## Public/Private Boundary

This public repo now keeps only the metadata for this accession.

Copied or derived source bytes for this artifact family have been moved into the
companion private artifact store.

- public pointer: `reference-artifacts/analyses/aurora-audio-cue-candidates/private-storage.json`
- private companion root: `private-artifacts/repo-mirror/reference-artifacts/analyses/aurora-audio-cue-candidates`
