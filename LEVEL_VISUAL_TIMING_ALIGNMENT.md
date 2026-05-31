# Level Visual Timing Alignment

Generated: 2026-05-31T01:24:46.556Z
Commit: 2d144d5c1
Branch: codex/macbook-fullscreen-timing-alignment-wip

## Summary

Requested challenges 1, 2, 3, 4; completed 1, 2, 3, 4; no capture failures. These videos put Galaga target footage on the left and Aurora current controlled-clock footage on the right from t=0, so pace and complexity drift can be reviewed without guessing which mid-stage moment was sampled.

Requested challenges: 1, 2, 3, 4.
Completed challenges: 1, 2, 3, 4.
Failed challenges: none.
Selection mode: explicit-challenge-list.

| Challenge | Label | Window Duration | Target Last Visible | Aurora Last Visible | Visible Drift | Target Result Hold | Aurora Result Hold | Result Hold Drift | Aurora Challenge End | End Drift | Paired Clip |
| ---: | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| 1 | Challenging Stage 1 (Levels 3-4) | 31s | 15.88s | 14.7s | -1.18s | 15.12s | 15.2s | 0.08s | 29.9s | -1.1s | `reference-artifacts/analyses/level-visual-timing-alignment/latest-paired-videos/challenge-01-target-vs-current-aligned.webm` |
| 2 | Challenging Stage 2 (Levels 7-8) | 39s | 15.88s | 14.7s | -1.18s | 23.12s | 23.3s | 0.18s | 38s | -1s | `reference-artifacts/analyses/level-visual-timing-alignment/latest-paired-videos/challenge-02-target-vs-current-aligned.webm` |
| 3 | Challenging Stage 3 (Levels 11-12) | 38s | 15.88s | 13.4s | -2.48s | 22.12s | 22.3s | 0.18s | 35.7s | -2.3s | `reference-artifacts/analyses/level-visual-timing-alignment/latest-paired-videos/challenge-03-target-vs-current-aligned.webm` |
| 4 | Challenging Stage 4 (Levels 15-16) | 35s | 15.88s | 14s | -1.88s | 19.12s | 19.3s | 0.18s | 33.3s | -1.7s | `reference-artifacts/analyses/level-visual-timing-alignment/latest-paired-videos/challenge-04-target-vs-current-aligned.webm` |



## Challenging Stage 1 (Levels 3-4)

**Aligned clip:** `reference-artifacts/analyses/level-visual-timing-alignment/latest-paired-videos/challenge-01-target-vs-current-aligned.webm`

**Contact sheet:** `reference-artifacts/analyses/level-visual-timing-alignment/latest-contact-sheets/challenge-01-target-vs-current-aligned-contact.jpg`

**Read:** Aurora first visible active enemies appear around 0s after challenge start. Last visible challenge enemy is sampled around 14.7s; target visible-motion drift is -1.18s, while full-window drift is -16.3s. Last challenge enemy present is sampled around 14.7s; enemy-presence drift versus target window is -16.3s. Aurora exits challenge state around 29.9s, versus target window 31s; drift -1.1s. Result-ceremony/empty-challenge hold after the last challenge enemy is about 15.2s; target-result-hold drift is 0.08s.

**Target source:** challenge-01-classic-column-lesson; starts at 5s for 31s.

**Known limit:** This aligns clips from stage start, but target object tracks and current object tracks are not yet time-warped. Human review should look for pace drift, group-count drift, visible arrival-vs-appearance drift, and whether the scoring window arrives at the same relative time.

## Challenging Stage 2 (Levels 7-8)

**Aligned clip:** `reference-artifacts/analyses/level-visual-timing-alignment/latest-paired-videos/challenge-02-target-vs-current-aligned.webm`

**Contact sheet:** `reference-artifacts/analyses/level-visual-timing-alignment/latest-contact-sheets/challenge-02-target-vs-current-aligned-contact.jpg`

**Read:** Aurora first visible active enemies appear around 0s after challenge start. Last visible challenge enemy is sampled around 14.7s; target visible-motion drift is -1.18s, while full-window drift is -24.3s. Last challenge enemy present is sampled around 14.7s; enemy-presence drift versus target window is -24.3s. Aurora exits challenge state around 38s, versus target window 39s; drift -1s. Result-ceremony/empty-challenge hold after the last challenge enemy is about 23.3s; target-result-hold drift is 0.18s.

**Target source:** challenge-02-cross-and-column; starts at 36s for 39s.

**Known limit:** This aligns clips from stage start, but target object tracks and current object tracks are not yet time-warped. Human review should look for pace drift, group-count drift, visible arrival-vs-appearance drift, and whether the scoring window arrives at the same relative time.

## Challenging Stage 3 (Levels 11-12)

**Aligned clip:** `reference-artifacts/analyses/level-visual-timing-alignment/latest-paired-videos/challenge-03-target-vs-current-aligned.webm`

**Contact sheet:** `reference-artifacts/analyses/level-visual-timing-alignment/latest-contact-sheets/challenge-03-target-vs-current-aligned-contact.jpg`

**Read:** Aurora first visible active enemies appear around 0s after challenge start. Last visible challenge enemy is sampled around 13.4s; target visible-motion drift is -2.48s, while full-window drift is -24.6s. Last challenge enemy present is sampled around 13.4s; enemy-presence drift versus target window is -24.6s. Aurora exits challenge state around 35.7s, versus target window 38s; drift -2.3s. Result-ceremony/empty-challenge hold after the last challenge enemy is about 22.3s; target-result-hold drift is 0.18s.

**Target source:** challenge-03-blue-hook-and-green-novelty; starts at 75s for 38s.

**Known limit:** This aligns clips from stage start, but target object tracks and current object tracks are not yet time-warped. Human review should look for pace drift, group-count drift, visible arrival-vs-appearance drift, and whether the scoring window arrives at the same relative time.

## Challenging Stage 4 (Levels 15-16)

**Aligned clip:** `reference-artifacts/analyses/level-visual-timing-alignment/latest-paired-videos/challenge-04-target-vs-current-aligned.webm`

**Contact sheet:** `reference-artifacts/analyses/level-visual-timing-alignment/latest-contact-sheets/challenge-04-target-vs-current-aligned-contact.jpg`

**Read:** Aurora first visible active enemies appear around 0s after challenge start. Last visible challenge enemy is sampled around 14s; target visible-motion drift is -1.88s, while full-window drift is -21s. Last challenge enemy present is sampled around 14s; enemy-presence drift versus target window is -21s. Aurora exits challenge state around 33.3s, versus target window 35s; drift -1.7s. Result-ceremony/empty-challenge hold after the last challenge enemy is about 19.3s; target-result-hold drift is 0.18s.

**Target source:** challenge-04-pink-serpentine; starts at 113s for 35s.

**Known limit:** This aligns clips from stage start, but target object tracks and current object tracks are not yet time-warped. Human review should look for pace drift, group-count drift, visible arrival-vs-appearance drift, and whether the scoring window arrives at the same relative time.
