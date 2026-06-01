# Aurora Capture Beam Audio Candidate Loop

Generated: `2026-05-08T20:26:28.983Z`
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
- Measured best: `low-mid-balanced-midcore`
- Reason: The lowest-risk candidate did not clear all capture-beam keeper gates, and no other candidate did either.
- Repetitions per candidate: 1

## Candidates

| Candidate | Risk /10 | Worst segment | Dominant penalty | Duration Gap | Centroid Gap | Band Shape | Sub delta | Mid delta | Attack pos | RMS Gap | Stability | Keeper read |
| --- | ---: | ---: | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| Low-mid balanced midcore | 4.86 | onset 3.98 | attack | 0.039s | 418.1 Hz | 0.2699 | 0.2698 | -0.1491 | 1 | 0.0229 | 1x, risk sd 0 | mid-band gain 0.0281 < 0.04; attack timing improvement -0.1 < 0.04 |
| Low-mid balanced midlift | 5.04 | onset 4.15 | subBass | 0.009s | 544.6 Hz | 0.2847 | 0.2847 | -0.1295 | 0.195 | 0.0441 | 1x, risk sd 0 | centroid improvement 45.3 Hz < 80 Hz; sub-bass reduction 0.0414 < 0.05 |
| Low-mid balanced early bright | 5.15 | onset 4.77 | attack | 0.059s | 309.7 Hz | 0.3204 | 0.3021 | -0.0969 | 0.657 | 0.0304 | 1x, risk sd 0 | sub-bass reduction 0.024 < 0.05 |
| Low-mid balanced high-pass lift | 5.48 | onset 4.18 | subBass | 0.081s | 416.8 Hz | 0.3257 | 0.3198 | -0.1504 | 0.865 | 0.0156 | 1x, risk sd 0 | sub-bass reduction 0.0063 < 0.05; mid-band gain 0.0268 < 0.04; attack timing improvement 0.035 < 0.04 |
| Low-mid balanced beam | 6.48 | onset 5.4 | subBass | 0.081s | 567.7 Hz | 0.355 | 0.355 | -0.1422 | 0.365 | 0.0454 | 1x, risk sd 0 | risk improvement 0.24 < 0.3; segment risk improvement -0.25 < 0.3; centroid improvement 22.2 Hz < 80 Hz; sub-bass reduction -0.0289 < 0.05; mid-band gain 0.035 < 0.04; band shape worsened by 0.0289 |
| Current Aurora baseline | 6.72 | onset 5.15 | subBass | 0.141s | 589.9 Hz | 0.3261 | 0.3261 | -0.1772 | 0.9 | 0.0535 | 1x, risk sd 0 | baseline |

## Next Step

Use the lowest-risk candidate and rejection reasons to seed a narrower second sweep before changing runtime audio.

## Public/Private Boundary

This public repo now keeps only the metadata for this accession.

Copied or derived source bytes for this artifact family have been moved into the
companion private artifact store.

- public pointer: `reference-artifacts/analyses/aurora-audio-cue-candidates/private-storage.json`
- private companion root: `private-artifacts/repo-mirror/reference-artifacts/analyses/aurora-audio-cue-candidates`
