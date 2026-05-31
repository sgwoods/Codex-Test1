# Level Visual Timing Alignment

Generated: 2026-05-30T18:32:58.862Z
Commit: fac514254
Branch: codex/macbook-fullscreen-timing-alignment-wip

## Summary

Requested challenges 1, 2, 3, 4; completed 1, 2, 3, 4; no capture failures. These videos put Galaga target footage on the left and Aurora current controlled-clock footage on the right from t=0, so pace and complexity drift can be reviewed without guessing which mid-stage moment was sampled.

Requested challenges: 1, 2, 3, 4.
Completed challenges: 1, 2, 3, 4.
Failed challenges: none.
Selection mode: explicit-challenge-list.

| Challenge | Label | Aligned Duration | Aurora First Visible | Last Visible | Last Enemy Present | Enemy-Presence Drift | Empty Result Hold | Aurora Challenge End | End Drift | Paired Clip |
| ---: | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| 1 | Challenging Stage 1 (Levels 3-4) | 31s | 0s | 14.7s | 14.7s | -16.3s | 11.7s | 26.4s | -4.6s | `reference-artifacts/analyses/level-visual-timing-alignment/latest-paired-videos/challenge-01-target-vs-current-aligned.webm` |
| 2 | Challenging Stage 2 (Levels 7-8) | 39s | 0s | 14.7s | 14.7s | -24.3s | 11.8s | 26.5s | -12.5s | `reference-artifacts/analyses/level-visual-timing-alignment/latest-paired-videos/challenge-02-target-vs-current-aligned.webm` |
| 3 | Challenging Stage 3 (Levels 11-12) | 38s | 0s | 13.4s | 13.4s | -24.6s | 11.8s | 25.2s | -12.8s | `reference-artifacts/analyses/level-visual-timing-alignment/latest-paired-videos/challenge-03-target-vs-current-aligned.webm` |
| 4 | Challenging Stage 4 (Levels 15-16) | 35s | 0s | 14s | 14s | -21s | 11.8s | 25.8s | -9.2s | `reference-artifacts/analyses/level-visual-timing-alignment/latest-paired-videos/challenge-04-target-vs-current-aligned.webm` |



## Challenging Stage 1 (Levels 3-4)

**Aligned clip:** `reference-artifacts/analyses/level-visual-timing-alignment/latest-paired-videos/challenge-01-target-vs-current-aligned.webm`

**Contact sheet:** `reference-artifacts/analyses/level-visual-timing-alignment/latest-contact-sheets/challenge-01-target-vs-current-aligned-contact.jpg`

**Read:** Aurora first visible active enemies appear around 0s after challenge start. Last visible challenge enemy is sampled around 14.7s; visible-motion drift versus target window is -16.3s. Last challenge enemy present is sampled around 14.7s; enemy-presence drift versus target window is -16.3s. Aurora exits challenge state around 26.4s, versus target window 31s; drift -4.6s. Result-ceremony/empty-challenge hold after the last challenge enemy is about 11.7s.

**Target source:** challenge-01-classic-column-lesson; starts at 5s for 31s.

**Known limit:** This aligns clips from stage start, but target object tracks and current object tracks are not yet time-warped. Human review should look for pace drift, group-count drift, visible arrival-vs-appearance drift, and whether the scoring window arrives at the same relative time.

## Challenging Stage 2 (Levels 7-8)

**Aligned clip:** `reference-artifacts/analyses/level-visual-timing-alignment/latest-paired-videos/challenge-02-target-vs-current-aligned.webm`

**Contact sheet:** `reference-artifacts/analyses/level-visual-timing-alignment/latest-contact-sheets/challenge-02-target-vs-current-aligned-contact.jpg`

**Read:** Aurora first visible active enemies appear around 0s after challenge start. Last visible challenge enemy is sampled around 14.7s; visible-motion drift versus target window is -24.3s. Last challenge enemy present is sampled around 14.7s; enemy-presence drift versus target window is -24.3s. Aurora exits challenge state around 26.5s, versus target window 39s; drift -12.5s. Result-ceremony/empty-challenge hold after the last challenge enemy is about 11.8s.

**Target source:** challenge-02-cross-and-column; starts at 36s for 39s.

**Known limit:** This aligns clips from stage start, but target object tracks and current object tracks are not yet time-warped. Human review should look for pace drift, group-count drift, visible arrival-vs-appearance drift, and whether the scoring window arrives at the same relative time.

## Challenging Stage 3 (Levels 11-12)

**Aligned clip:** `reference-artifacts/analyses/level-visual-timing-alignment/latest-paired-videos/challenge-03-target-vs-current-aligned.webm`

**Contact sheet:** `reference-artifacts/analyses/level-visual-timing-alignment/latest-contact-sheets/challenge-03-target-vs-current-aligned-contact.jpg`

**Read:** Aurora first visible active enemies appear around 0s after challenge start. Last visible challenge enemy is sampled around 13.4s; visible-motion drift versus target window is -24.6s. Last challenge enemy present is sampled around 13.4s; enemy-presence drift versus target window is -24.6s. Aurora exits challenge state around 25.2s, versus target window 38s; drift -12.8s. Result-ceremony/empty-challenge hold after the last challenge enemy is about 11.8s.

**Target source:** challenge-03-blue-hook-and-green-novelty; starts at 75s for 38s.

**Known limit:** This aligns clips from stage start, but target object tracks and current object tracks are not yet time-warped. Human review should look for pace drift, group-count drift, visible arrival-vs-appearance drift, and whether the scoring window arrives at the same relative time.

## Challenging Stage 4 (Levels 15-16)

**Aligned clip:** `reference-artifacts/analyses/level-visual-timing-alignment/latest-paired-videos/challenge-04-target-vs-current-aligned.webm`

**Contact sheet:** `reference-artifacts/analyses/level-visual-timing-alignment/latest-contact-sheets/challenge-04-target-vs-current-aligned-contact.jpg`

**Read:** Aurora first visible active enemies appear around 0s after challenge start. Last visible challenge enemy is sampled around 14s; visible-motion drift versus target window is -21s. Last challenge enemy present is sampled around 14s; enemy-presence drift versus target window is -21s. Aurora exits challenge state around 25.8s, versus target window 35s; drift -9.2s. Result-ceremony/empty-challenge hold after the last challenge enemy is about 11.8s.

**Target source:** challenge-04-pink-serpentine; starts at 113s for 35s.

**Known limit:** This aligns clips from stage start, but target object tracks and current object tracks are not yet time-warped. Human review should look for pace drift, group-count drift, visible arrival-vs-appearance drift, and whether the scoring window arrives at the same relative time.
