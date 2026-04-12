# Galaga Stage 1 Opening Timing

This artifact records the measured baseline we are using for Aurora's stage-1
opening handoff in Galaga reference mode.

## Goal

- preserve the full canonical opening phrase where feasible
- place the arrival signal after the full phrase
- delay the first visible enemy arrivals to the measured reference window
- make timing decisions from evidence before manual tuning

## Sources

- Stage 1 gameplay video:
  - `/Users/stevenwoods/Downloads/90 stage 1 player galaga example.mp4`
- Game-start clip:
  - `/Users/stevenwoods/Documents/Codex-Test1/src/assets/reference-audio/galaga2-game-start.m4a`
- Arrival / underscore clip:
  - `/Users/stevenwoods/Documents/Codex-Test1/src/assets/reference-audio/galaga3-level-underscore.m4a`

## Generated reference views

- Contact sheet:
  - `/Users/stevenwoods/Documents/Codex-Test1/reference-artifacts/analyses/galaga-stage-opening-timing/2026-04-12-main-a777fba/opening-contact.png`
- Tight contact sheet:
  - `/Users/stevenwoods/Documents/Codex-Test1/reference-artifacts/analyses/galaga-stage-opening-timing/2026-04-12-main-a777fba/opening-contact-tight.png`
- Opening waveform:
  - `/Users/stevenwoods/Documents/Codex-Test1/reference-artifacts/analyses/galaga-stage-opening-timing/2026-04-12-main-a777fba/opening-waveform.png`
- Game-start waveform:
  - `/Users/stevenwoods/Documents/Codex-Test1/reference-artifacts/analyses/galaga-stage-opening-timing/2026-04-12-main-a777fba/game-start-waveform.png`
- Level-underscore waveform:
  - `/Users/stevenwoods/Documents/Codex-Test1/reference-artifacts/analyses/galaga-stage-opening-timing/2026-04-12-main-a777fba/level-underscore-waveform.png`

## Measured durations

- `galaga2-game-start.m4a`: `4.000s`
- `galaga3-level-underscore.m4a`: `8.000s`

## Observations

- The tight contact sheet covers a `4s-7s` opening window from the reference
  gameplay capture.
- First visible enemy arrivals appear around `5.25s-5.5s` into that measured
  opening window.
- That supports this runtime policy:
  - preserve the full `4.0s` start phrase
  - then play the arrival / underscore signal
  - then begin the first visible enemy arrivals roughly `1.25s` later

## Current Aurora target

- Game-start phrase onset: immediate on start input in Galaga reference mode
- Full phrase preserved: `4.0s`
- Formation-arrival signal: about `4.18s` after start input
- First visible enemy arrivals: about `5.35s` after start input
- First convoy pulse: after the first-arrival window, around `6.15s`

## Why this matters

- The start phrase should not be shortened just to fit Aurora's previous timing
  window.
- If Aurora needs a longer opening to stay closer to Galaga, the game window
  should expand first and only fall back to excerpting if the measured
  experience proves that necessary.
