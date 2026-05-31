# Level Visual Timing Alignment

Generated: 2026-05-31T16:00:13.867Z
Commit: bd1233c7c
Branch: codex/macbook-challenge-stage-gameplay-spectacle

## Summary

Requested challenges 1, 2, 3, 4; completed 1, 2, 3, 4; no capture failures. These videos put Galaga target footage on the left and Aurora current controlled-clock footage on the right from t=0, so pace and complexity drift can be reviewed without guessing which mid-stage moment was sampled.

Requested challenges: 1, 2, 3, 4.
Completed challenges: 1, 2, 3, 4.
Failed challenges: none.
Selection mode: explicit-challenge-list.

| Challenge | Label | Window Duration | Target Last Visible | Aurora Last Visible | Visible Drift | Target Result Hold | Aurora Result Hold | Result Hold Drift | Aurora Challenge End | End Drift | Paired Clip |
| ---: | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| 1 | Challenging Stage 2-3 | 31s | 15.88s | 30.9s | 15.02s | 15.12s | -30.9s | -46.02s | n/as | -31s | `reference-artifacts/analyses/level-visual-timing-alignment/latest-paired-videos/challenge-01-target-vs-current-aligned.webm` |
| 2 | Challenging Stage 6-7 | 39s | 15.88s | 16.4s | 0.52s | 23.12s | -16.4s | -39.52s | n/as | -39s | `reference-artifacts/analyses/level-visual-timing-alignment/latest-paired-videos/challenge-02-target-vs-current-aligned.webm` |
| 3 | Challenging Stage 10-11 | 38s | 15.88s | 15.5s | -0.38s | 22.12s | 22.3s | 0.18s | 37.8s | -0.2s | `reference-artifacts/analyses/level-visual-timing-alignment/latest-paired-videos/challenge-03-target-vs-current-aligned.webm` |
| 4 | Challenging Stage 14-15 | 35s | 15.88s | 16.3s | 0.42s | 19.12s | -16.3s | -35.42s | n/as | -35s | `reference-artifacts/analyses/level-visual-timing-alignment/latest-paired-videos/challenge-04-target-vs-current-aligned.webm` |



## Challenging Stage 2-3

**Aligned clip:** `reference-artifacts/analyses/level-visual-timing-alignment/latest-paired-videos/challenge-01-target-vs-current-aligned.webm`

**Contact sheet:** `reference-artifacts/analyses/level-visual-timing-alignment/latest-contact-sheets/challenge-01-target-vs-current-aligned-contact.jpg`

**Read:** Aurora first visible active enemies appear around 0s after challenge start. Last visible challenge enemy is sampled around 30.9s; target visible-motion drift is 15.02s, while full-window drift is -0.1s. Last challenge enemy present is sampled around 30.9s; enemy-presence drift versus target window is -0.1s. Aurora exits challenge state around nulls, versus target window 31s; drift -31s. Result-ceremony/empty-challenge hold after the last challenge enemy is about -30.9s; target-result-hold drift is -46.02s.

**Target source:** challenge-01-classic-column-lesson; starts at 5s for 31s.

**Known limit:** This aligns clips from stage start, but target object tracks and current object tracks are not yet time-warped. Human review should look for pace drift, group-count drift, visible arrival-vs-appearance drift, and whether the scoring window arrives at the same relative time.

## Challenging Stage 6-7

**Aligned clip:** `reference-artifacts/analyses/level-visual-timing-alignment/latest-paired-videos/challenge-02-target-vs-current-aligned.webm`

**Contact sheet:** `reference-artifacts/analyses/level-visual-timing-alignment/latest-contact-sheets/challenge-02-target-vs-current-aligned-contact.jpg`

**Read:** Aurora first visible active enemies appear around 0s after challenge start. Last visible challenge enemy is sampled around 16.4s; target visible-motion drift is 0.52s, while full-window drift is -22.6s. Last challenge enemy present is sampled around 16.4s; enemy-presence drift versus target window is -22.6s. Aurora exits challenge state around nulls, versus target window 39s; drift -39s. Result-ceremony/empty-challenge hold after the last challenge enemy is about -16.4s; target-result-hold drift is -39.52s.

**Target source:** challenge-02-cross-and-column; starts at 36s for 39s.

**Known limit:** This aligns clips from stage start, but target object tracks and current object tracks are not yet time-warped. Human review should look for pace drift, group-count drift, visible arrival-vs-appearance drift, and whether the scoring window arrives at the same relative time.

## Challenging Stage 10-11

**Aligned clip:** `reference-artifacts/analyses/level-visual-timing-alignment/latest-paired-videos/challenge-03-target-vs-current-aligned.webm`

**Contact sheet:** `reference-artifacts/analyses/level-visual-timing-alignment/latest-contact-sheets/challenge-03-target-vs-current-aligned-contact.jpg`

**Read:** Aurora first visible active enemies appear around 0s after challenge start. Last visible challenge enemy is sampled around 15.5s; target visible-motion drift is -0.38s, while full-window drift is -22.5s. Last challenge enemy present is sampled around 15.5s; enemy-presence drift versus target window is -22.5s. Aurora exits challenge state around 37.8s, versus target window 38s; drift -0.2s. Result-ceremony/empty-challenge hold after the last challenge enemy is about 22.3s; target-result-hold drift is 0.18s.

**Target source:** challenge-03-blue-hook-and-green-novelty; starts at 75s for 38s.

**Known limit:** This aligns clips from stage start, but target object tracks and current object tracks are not yet time-warped. Human review should look for pace drift, group-count drift, visible arrival-vs-appearance drift, and whether the scoring window arrives at the same relative time.

## Challenging Stage 14-15

**Aligned clip:** `reference-artifacts/analyses/level-visual-timing-alignment/latest-paired-videos/challenge-04-target-vs-current-aligned.webm`

**Contact sheet:** `reference-artifacts/analyses/level-visual-timing-alignment/latest-contact-sheets/challenge-04-target-vs-current-aligned-contact.jpg`

**Read:** Aurora first visible active enemies appear around 0s after challenge start. Last visible challenge enemy is sampled around 16.3s; target visible-motion drift is 0.42s, while full-window drift is -18.7s. Last challenge enemy present is sampled around 16.3s; enemy-presence drift versus target window is -18.7s. Aurora exits challenge state around nulls, versus target window 35s; drift -35s. Result-ceremony/empty-challenge hold after the last challenge enemy is about -16.3s; target-result-hold drift is -35.42s.

**Target source:** challenge-04-pink-serpentine; starts at 113s for 35s.

**Known limit:** This aligns clips from stage start, but target object tracks and current object tracks are not yet time-warped. Human review should look for pace drift, group-count drift, visible arrival-vs-appearance drift, and whether the scoring window arrives at the same relative time.
