# Galaga Audio Reference Video

Source artifact:

- `/Users/stevenwoods/Downloads/Galaga Sounds with labelling in video.mp4`

Technical profile:

- container: `mp4`
- duration: `4m 39.8s`
- video: `640x360` at `30fps`
- audio: `AAC stereo`

Cataloged review surfaces:

- `/Users/stevenwoods/Documents/Codex-Test1/reference-artifacts/analyses/galaga-audio-reference-video/contact-01.png`
- `/Users/stevenwoods/Documents/Codex-Test1/reference-artifacts/analyses/galaga-audio-reference-video/contact-02.png`
- `/Users/stevenwoods/Documents/Codex-Test1/reference-artifacts/analyses/galaga-audio-reference-video/contact-03.png`
- `/Users/stevenwoods/Documents/Codex-Test1/reference-artifacts/analyses/galaga-audio-reference-video/contact-04.png`

## What this artifact is good for

- identifying the original Galaga sound/motif set by labeled gameplay use case
- comparing:
  - cue shape
  - phrase length
  - tone hierarchy
  - how often a cue behaves like music versus a pure effect
- helping split:
  - classic gameplay-reference sounds
  - Aurora-owned shell/front-door sounds

## Confidence and limits

This video is strong as a labeled review artifact, but it is still a secondary
reference package rather than a cabinet manual.

Use it confidently for:

- cue naming
- rough phase coverage
- motif comparison
- deciding which sounds should feel like short musical phrases

Use it carefully for:

- exact cabinet timing
- exact envelope / synthesis fidelity
- any claim that a cue appears in only one exact situation

## Labeled sound catalog observed in the video

The following labels are visible in the extracted contact sheets. Times are
approximate ranges based on the contact-sheet sampling pass and should be treated
as catalog guidance rather than frame-accurate cue timing.

| Approx. time | Label in video | Suggested use-case meaning |
| --- | --- | --- |
| `00:00-00:04` | `INSERT COIN` | attract / coin-up / title-loop context |
| `00:05-00:09` | `OPENING THEME` | opening/title theme |
| `00:10-00:14` | `LEVEL FLAG V1` | stage / round start announcement variant |
| `00:15-00:19` | `TRACTOR BEAM` | boss capture beam |
| `00:20-00:24` | `SHIP CAPTURED` | capture-success state change |
| `00:25-00:29` | `SHIP RESCUED` | rescue / dual-fighter rejoin success |
| `00:30-00:39` | `BONUS STAGE PERFECT SCORE` | perfect-bonus / challenge clear reward |
| `00:40-00:49` | `LEVEL FLAG V2` | alternate stage / round start announcement |
| `00:50-00:59` | `SAMPLE GAME PLAY` | baseline gameplay loop / combat mix |
| `01:00-01:09` | `BONUS STAGE RESULTS` | post-challenge tally/results |
| `01:10-01:24` | `LAST SHIP DESTROYED BACKGROUND AMBIENCE` | final-life / last-ship tension ambience |
| `01:30-01:44` | `HIGH SCORE 1ST PLACE` | top-rank high-score entry/result |
| `01:45-01:59` | `HIGH SCORE 2ND-5TH PLACE` | lower-rank high-score entry/result |

The video then shifts into commentary-style prompts rather than new labeled game
sounds, including:

- `COMMENTS SECTION TIME`
- `WHAT'S YOUR HIGH SCORE?`
- `FAV GAME SOUND/MUSIC?`
- `BEST HIT/MISS RATIO?`

Those later prompts are not treated as additional sound references.

## Theme-family note

This artifact is best treated as one candidate audio theme family:

- `galaga-original-reference`

That family should be used mainly for:

- gameplay-phase cues
- stage announcements
- challenge-stage/results cues
- capture/rescue cues
- score/high-score related cues

It is **not** a full replacement for Aurora-owned shell identity, because the
current Platinum/Aurora front door and wait surfaces need their own application
voice. In practice this suggests:

- shell/front door/wait:
  - Aurora-owned theme
- gameplay/challenge/results:
  - switchable between Aurora mix and Galaga-reference mix

## Extracted clip inventory

All 13 labeled Galaga sound/music contexts cataloged above are now available as
standalone extracted clip files in:

- `/Users/stevenwoods/Documents/Codex-Test1/reference-artifacts/analyses/galaga-audio-reference-video/clips/`

Mirrored app-asset copies are also available in:

- `/Users/stevenwoods/Documents/Codex-Test1/src/assets/reference-audio/`

Current extracted clip set:

- `galaga-insert-coin.m4a`
- `galaga-opening-theme.m4a`
- `galaga-level-flag-v1.m4a`
- `galaga-tractor-beam.m4a`
- `galaga-ship-captured.m4a`
- `galaga-ship-rescued.m4a`
- `galaga-bonus-stage-perfect-score.m4a`
- `galaga-level-flag-v2.m4a`
- `galaga-sample-gameplay.m4a`
- `galaga-bonus-stage-results.m4a`
- `galaga-last-ship-destroyed-ambience.m4a`
- `galaga-high-score-1st-place.m4a`
- `galaga-high-score-2nd-5th-place.m4a`

## Current project use

Use this artifact when reviewing or tuning:

- `/Users/stevenwoods/Documents/Codex-Test1/src/js/13-aurora-game-pack.js`
- `/Users/stevenwoods/Documents/Codex-Test1/application-guide.json`
- `/Users/stevenwoods/Documents/Codex-Test1/src/application-guide.template.html`

especially for:

- `gameStart`
- `stageTransition`
- `challengeTransition`
- `captureBeam`
- `rescueJoin`
- `gameOver`
- high-score/result surfaces
