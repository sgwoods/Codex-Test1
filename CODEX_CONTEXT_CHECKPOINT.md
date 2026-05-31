# Codex Context Checkpoint

Generated: 2026-05-31T12:20:16.481Z
Label: challenge-result-timing-sprite-motion-review

This is the durable recovery point for long Aurora / Platinum Codex sessions.
Use it before switching machines, before starting a multi-hour run, and whenever
the conversation has become long enough that automatic compaction could drop
important working context.

## Current Repo State

- Repo path: `/Users/sgwoods/Development/Codex/Codex-test1`
- Branch: `codex/macbook-fullscreen-timing-alignment-wip`
- HEAD: `2d144d5c1` Calibrate reference sprite proportions
- Dirty files excluding checkpoint self-output: `85`

## Active Plan

- Continue Aurora challenge timing, sprite motion, and conformance handoff safely

## Recommended Next Steps

- Commit verified runtime timing, sprite stability, stricter artifacts, and note remaining challenge-stage gaps

## Notes

- Codex Desktop does not expose a repo command that forces internal chat compaction. The safe replacement is a manual checkpoint plus a deliberate fresh session from this file.
- This checkpoint intentionally filters its own generated files out of the dirty-status read so it can be committed as the recovery point.

## Git Status

```
M AURORA_SPRITE_MOTION_CORRESPONDENCE.md
 M CHALLENGE_STAGE_CONFORMANCE_ANALYSIS.md
 M LEVEL_VISUAL_TIMING_ALIGNMENT.md
 M reference-artifacts/analyses/application-artifact-conformance/latest.json
 M reference-artifacts/analyses/aurora-audio-event-gap/latest.json
 M reference-artifacts/analyses/aurora-impact-explosion-conformance/latest-crops/boss-boom-life-01.png
 M reference-artifacts/analyses/aurora-impact-explosion-conformance/latest-crops/boss-boom-life-02.png
 M reference-artifacts/analyses/aurora-impact-explosion-conformance/latest-crops/boss-boom-life-03.png
 M reference-artifacts/analyses/aurora-impact-explosion-conformance/latest-crops/boss-boom-life-04.png
 M reference-artifacts/analyses/aurora-impact-explosion-conformance/latest-crops/boss-boom.png
 M reference-artifacts/analyses/aurora-impact-explosion-conformance/latest-crops/boss-first-hit-life-01.png
 M reference-artifacts/analyses/aurora-impact-explosion-conformance/latest-crops/boss-first-hit-life-02.png
 M reference-artifacts/analyses/aurora-impact-explosion-conformance/latest-crops/boss-first-hit-life-03.png
 M reference-artifacts/analyses/aurora-impact-explosion-conformance/latest-crops/boss-first-hit-life-04.png
 M reference-artifacts/analyses/aurora-impact-explosion-conformance/latest-crops/boss-first-hit.png
 M reference-artifacts/analyses/aurora-impact-explosion-conformance/latest-crops/enemy-boom-life-01.png
 M reference-artifacts/analyses/aurora-impact-explosion-conformance/latest-crops/enemy-boom-life-02.png
 M reference-artifacts/analyses/aurora-impact-explosion-conformance/latest-crops/enemy-boom-life-03.png
 M reference-artifacts/analyses/aurora-impact-explosion-conformance/latest-crops/enemy-boom-life-04.png
 M reference-artifacts/analyses/aurora-impact-explosion-conformance/latest-crops/enemy-boom.png
 M reference-artifacts/analyses/aurora-impact-explosion-conformance/latest-crops/enemy-hit-life-01.png
 M reference-artifacts/analyses/aurora-impact-explosion-conformance/latest-crops/enemy-hit-life-02.png
 M reference-artifacts/analyses/aurora-impact-explosion-conformance/latest-crops/enemy-hit-life-03.png
 M reference-artifacts/analyses/aurora-impact-explosion-conformance/latest-crops/enemy-hit-life-04.png
 M reference-artifacts/analyses/aurora-impact-explosion-conformance/latest-crops/enemy-hit.png
 M reference-artifacts/analyses/aurora-impact-explosion-conformance/latest.json
 M reference-artifacts/analyses/aurora-runtime-sprite-conformance/latest-crops/bee-line-cadence-01.png
 M reference-artifacts/analyses/aurora-runtime-sprite-conformance/latest-crops/bee-line-cadence-02.png
 M reference-artifacts/analyses/aurora-runtime-sprite-conformance/latest-crops/bee-line-cadence-03.png
 M reference-artifacts/analyses/aurora-runtime-sprite-conformance/latest-crops/bee-line-cadence-04.png
 M reference-artifacts/analyses/aurora-runtime-sprite-conformance/latest-crops/bee-line-flap-open.png
 M reference-artifacts/analyses/aurora-runtime-sprite-conformance/latest-crops/boss-line-cadence-01.png
 M reference-artifacts/analyses/aurora-runtime-sprite-conformance/latest-crops/boss-line-cadence-02.png
 M reference-artifacts/analyses/aurora-runtime-sprite-conformance/latest-crops/boss-line-cadence-03.png
 M reference-artifacts/analyses/aurora-runtime-sprite-conformance/latest-crops/boss-line-cadence-04.png
 M reference-artifacts/analyses/aurora-runtime-sprite-conformance/latest-crops/boss-line-flap-open.png
 M reference-artifacts/analyses/aurora-runtime-sprite-conformance/latest-crops/but-line-cadence-01.png
 M reference-artifacts/analyses/aurora-runtime-sprite-conformance/latest-crops/but-line-cadence-02.png
 M reference-artifacts/analyses/aurora-runtime-sprite-conformance/latest-crops/but-line-cadence-03.png
 M reference-artifacts/analyses/aurora-runtime-sprite-conformance/latest-crops/but-line-cadence-04.png
 M reference-artifacts/analyses/aurora-runtime-sprite-conformance/latest-crops/but-line-flap-open.png
 M reference-artifacts/analyses/aurora-runtime-sprite-conformance/latest.json
 M reference-artifacts/analyses/aurora-runtime-vs-galaga-target-crops/latest.json
 M reference-artifacts/analyses/aurora-sprite-motion-correspondence/latest.json
 M reference-artifacts/analyses/challenge-stage-candidate-sweep-index/latest.json
 M reference-artifacts/analyses/challenge-stage-candidate-sweep/latest.json
 M reference-artifacts/analyses/challenge-stage-conformance/latest-diagrams/challenge-stage-01-object-track.svg
 M reference-artifacts/analyses/challenge-stage-conformance/latest-diagrams/challenge-stage-02-object-track.svg
 M reference-artifacts/analyses/challenge-stage-conformance/latest-diagrams/challenge-stage-03-object-track.svg
 M reference-artifacts/analyses/challenge-stage-conformance/latest-diagrams/challenge-stage-04-object-track.svg
 M reference-artifacts/analyses/challenge-stage-conformance/latest-diagrams/challenge-stage-04-trajectory.svg
 M reference-artifacts/analyses/challenge-stage-conformance/latest-diagrams/challenge-stage-05-object-track.svg
 M reference-artifacts/analyses/challenge-stage-conformance/latest-diagrams/challenge-stage-06-object-track.svg
 M reference-artifacts/analyses/challenge-stage-conformance/latest-diagrams/challenge-stage-06-trajectory.svg
 M reference-artifacts/analyses/challenge-stage-conformance/latest-diagrams/challenge-stage-07-object-track.svg
 M reference-artifacts/analyses/challenge-stage-conformance/latest.json
 M reference-artifacts/analyses/formation-readability/latest.json
 M reference-artifacts/analyses/level-visual-timing-alignment/latest-contact-sheets/challenge-01-target-vs-current-aligned-contact.jpg
 M reference-artifacts/analyses/level-visual-timing-alignment/latest-contact-sheets/challenge-02-target-vs-current-aligned-contact.jpg
 M reference-artifacts/analyses/level-visual-timing-alignment/latest-contact-sheets/challenge-03-target-vs-current-aligned-contact.jpg
 M reference-artifacts/analyses/level-visual-timing-alignment/latest-contact-sheets/challenge-04-target-vs-current-aligned-contact.jpg
 M reference-artifacts/analyses/level-visual-timing-alignment/latest-current-videos/challenge-01.webm
 M reference-artifacts/analyses/level-visual-timing-alignment/latest-current-videos/challenge-02.webm
 M reference-artifacts/analyses/level-visual-timing-alignment/latest-current-videos/challenge-03.webm
 M reference-artifacts/analyses/level-visual-timing-alignment/latest-current-videos/challenge-04.webm
 M reference-artifacts/analyses/level-visual-timing-alignment/latest-paired-videos/challenge-01-target-vs-current-aligned.webm
 M reference-artifacts/analyses/level-visual-timing-alignment/latest-paired-videos/challenge-02-target-vs-current-aligned.webm
 M reference-artifacts/analyses/level-visual-timing-alignment/latest-paired-videos/challenge-03-target-vs-current-aligned.webm
 M reference-artifacts/analyses/level-visual-timing-alignment/latest-paired-videos/challenge-04-target-vs-current-aligned.webm
 M reference-artifacts/analyses/level-visual-timing-alignment/latest-target-videos/challenge-01.webm
 M reference-artifacts/analyses/level-visual-timing-alignment/latest-target-videos/challenge-02.webm
 M reference-artifacts/analyses/level-visual-timing-alignment/latest-target-videos/challenge-03.webm
 M reference-artifacts/analyses/level-visual-timing-alignment/latest-target-videos/challenge-04.webm
 M reference-artifacts/analyses/level-visual-timing-alignment/latest.json
 M src/js/08-score-awards.js
 M src/js/09-stage-flow.js
 M src/js/13-aurora-game-pack.js
 M src/js/13-game-pack-registry.js
 M src/js/21-render-board.js
 M src/js/90-harness.js
?? reference-artifacts/analyses/challenge-stage-candidate-sweep-index/2026-05-31T01-17-29-2d144d5c1/
?? reference-artifacts/analyses/challenge-stage-conformance/2026-05-30-2d144d5c1/
?? reference-artifacts/analyses/challenge-stage-conformance/2026-05-31-2d144d5c1/
?? reference-artifacts/analyses/correspondence/persona-progression/2026-05-31-2d144d5c1/
?? reference-artifacts/analyses/level-visual-timing-alignment/2026-05-31-2d144d5c1/
```

## Diff Stat

```
AURORA_SPRITE_MOTION_CORRESPONDENCE.md             |    14 +-
 CHALLENGE_STAGE_CONFORMANCE_ANALYSIS.md            |   102 +-
 LEVEL_VISUAL_TIMING_ALIGNMENT.md                   |    20 +-
 .../application-artifact-conformance/latest.json   |   982 +-
 .../analyses/aurora-audio-event-gap/latest.json    |    10 +-
 .../latest-crops/boss-boom-life-01.png             |   Bin 6742 -> 6572 bytes
 .../latest-crops/boss-boom-life-02.png             |   Bin 6690 -> 6671 bytes
 .../latest-crops/boss-boom-life-03.png             |   Bin 6787 -> 6643 bytes
 .../latest-crops/boss-boom-life-04.png             |   Bin 6744 -> 6761 bytes
 .../latest-crops/boss-boom.png                     |   Bin 6699 -> 6754 bytes
 .../latest-crops/boss-first-hit-life-01.png        |   Bin 8276 -> 8325 bytes
 .../latest-crops/boss-first-hit-life-02.png        |   Bin 8269 -> 8344 bytes
 .../latest-crops/boss-first-hit-life-03.png        |   Bin 8298 -> 8322 bytes
 .../latest-crops/boss-first-hit-life-04.png        |   Bin 8307 -> 8293 bytes
 .../latest-crops/boss-first-hit.png                |   Bin 8366 -> 8364 bytes
 .../latest-crops/enemy-boom-life-01.png            |   Bin 3604 -> 3713 bytes
 .../latest-crops/enemy-boom-life-02.png            |   Bin 3589 -> 3722 bytes
 .../latest-crops/enemy-boom-life-03.png            |   Bin 3583 -> 3712 bytes
 .../latest-crops/enemy-boom-life-04.png            |   Bin 3575 -> 3465 bytes
 .../latest-crops/enemy-boom.png                    |   Bin 3740 -> 3673 bytes
 .../latest-crops/enemy-hit-life-01.png             |   Bin 3403 -> 3157 bytes
 .../latest-crops/enemy-hit-life-02.png             |   Bin 3194 -> 3242 bytes
 .../latest-crops/enemy-hit-life-03.png             |   Bin 3106 -> 3397 bytes
 .../latest-crops/enemy-hit-life-04.png             |   Bin 3195 -> 3280 bytes
 .../latest-crops/enemy-hit.png                     |   Bin 3240 -> 3336 bytes
 .../latest.json                                    |   400 +-
 .../latest-crops/bee-line-cadence-01.png           |   Bin 334 -> 444 bytes
 .../latest-crops/bee-line-cadence-02.png           |   Bin 334 -> 444 bytes
 .../latest-crops/bee-line-cadence-03.png           |   Bin 334 -> 444 bytes
 .../latest-crops/bee-line-cadence-04.png           |   Bin 334 -> 444 bytes
 .../latest-crops/bee-line-flap-open.png            |   Bin 334 -> 444 bytes
 .../latest-crops/boss-line-cadence-01.png          |   Bin 489 -> 581 bytes
 .../latest-crops/boss-line-cadence-02.png          |   Bin 489 -> 581 bytes
 .../latest-crops/boss-line-cadence-03.png          |   Bin 489 -> 581 bytes
 .../latest-crops/boss-line-cadence-04.png          |   Bin 489 -> 581 bytes
 .../latest-crops/boss-line-flap-open.png           |   Bin 489 -> 581 bytes
 .../latest-crops/but-line-cadence-01.png           |   Bin 397 -> 385 bytes
 .../latest-crops/but-line-cadence-02.png           |   Bin 397 -> 385 bytes
 .../latest-crops/but-line-cadence-03.png           |   Bin 397 -> 385 bytes
 .../latest-crops/but-line-cadence-04.png           |   Bin 397 -> 385 bytes
 .../latest-crops/but-line-flap-open.png            |   Bin 397 -> 385 bytes
 .../aurora-runtime-sprite-conformance/latest.json  |   154 +-
 .../latest.json                                    |   812 +-
 .../latest.json                                    |   140 +-
 .../latest.json                                    |     8 +-
 .../challenge-stage-candidate-sweep/latest.json    |   266 +-
 .../challenge-stage-01-object-track.svg            |    12 +-
 .../challenge-stage-02-object-track.svg            |     2 +-
 .../challenge-stage-03-object-track.svg            |     8 +-
 .../challenge-stage-04-object-track.svg            |     2 +-
 .../challenge-stage-04-trajectory.svg              |     2 +-
 .../challenge-stage-05-object-track.svg            |     2 +-
 .../challenge-stage-06-object-track.svg            |     2 +-
 .../challenge-stage-06-trajectory.svg              |     2 +-
 .../challenge-stage-07-object-track.svg            |     2 +-
 .../challenge-stage-conformance/latest.json        | 16900 +++++++++----------
 .../analyses/formation-readability/latest.json     |   550 +-
 ...llenge-01-target-vs-current-aligned-contact.jpg |   Bin 90158 -> 89854 bytes
 ...llenge-02-target-vs-current-aligned-contact.jpg |   Bin 114565 -> 111673 bytes
 ...llenge-03-target-vs-current-aligned-contact.jpg |   Bin 112523 -> 109544 bytes
 ...llenge-04-target-vs-current-aligned-contact.jpg |   Bin 105505 -> 103183 bytes
 .../latest-current-videos/challenge-01.webm        |   Bin 580908 -> 345828 bytes
 .../latest-current-videos/challenge-02.webm        |   Bin 554564 -> 265454 bytes
 .../latest-current-videos/challenge-03.webm        |   Bin 673338 -> 269385 bytes
 .../latest-current-videos/challenge-04.webm        |   Bin 602722 -> 384133 bytes
 .../challenge-01-target-vs-current-aligned.webm    |   Bin 977409 -> 898820 bytes
 .../challenge-02-target-vs-current-aligned.webm    |   Bin 1225466 -> 1117646 bytes
 .../challenge-03-target-vs-current-aligned.webm    |   Bin 1243956 -> 1112147 bytes
 .../challenge-04-target-vs-current-aligned.webm    |   Bin 1200244 -> 1113214 bytes
 .../latest-target-videos/challenge-01.webm         |   Bin 703934 -> 703934 bytes
 .../latest-target-videos/challenge-02.webm         |   Bin 927745 -> 927745 bytes
 .../latest-target-videos/challenge-03.webm         |   Bin 926144 -> 926144 bytes
 .../latest-target-videos/challenge-04.webm         |   Bin 883400 -> 883400 bytes
 .../level-visual-timing-alignment/latest.json      |   250 +-
 src/js/08-score-awards.js                          |    10 +-
 src/js/09-stage-flow.js                            |     8 +-
 src/js/13-aurora-game-pack.js                      |     2 +
 src/js/13-game-pack-registry.js                    |    14 +
 src/js/21-render-board.js                          |   119 +-
 src/js/90-harness.js                               |     1 +
 80 files changed, 10361 insertions(+), 10435 deletions(-)
```

## Recent Log

```
2d144d5c1 (HEAD -> codex/macbook-fullscreen-timing-alignment-wip, origin/codex/macbook-fullscreen-timing-alignment-wip) Calibrate reference sprite proportions
4650b755f Fix arcade fullscreen playfield visibility
b14cb07d5 Refine Aurora player fighter visual fidelity
f22f00d51 Calibrate challenge sweeps against full analyzer rejections
46f19bc04 Gate Stage 7 challenge candidates with full analyzer review
56e319f29 Ground challenge timing in target motion tracks
9a9ede246 Measure challenge visible-motion timing
fac514254 Refresh challenge ceremony checkpoint
```

## Machine Status Snapshot

```json
{
  "ok": true,
  "mode": "status",
  "machine": {
    "machine_id": "macbook-pro",
    "machine_label": "MacBook-Pro",
    "hostname": "MacBook-Pro",
    "repo_path": "/Users/sgwoods/Development/Codex/Codex-test1",
    "profile_exists": true,
    "profile_path": "/Users/sgwoods/Development/Codex/Codex-test1/.machine-profile.json",
    "profile_preview": {
      "machine_id": "macbook-pro",
      "machine_label": "MacBook-Pro",
      "hostname": "MacBook-Pro",
      "repo_path": "/Users/sgwoods/Development/Codex/Codex-test1",
      "tool_versions": {
        "node": "v25.9.0",
        "npm": "11.12.1",
        "python3": "Python 3.9.6",
        "gh": "gh version 2.91.0 (2026-04-22)",
        "chrome": "Google Chrome 148.0.7778.179",
        "harness_browser": "playwright-managed-chromium"
      },
      "gh_auth": true,
      "last_successful_bootstrap_at": "2026-05-20T14:59:22.155Z"
    }
  },
  "repo": {
    "branch": "codex/macbook-fullscreen-timing-alignment-wip",
    "dirty": true,
    "upstream": "origin/codex/macbook-fullscreen-timing-alignment-wip",
    "ahead": 0,
    "behind": 0,
    "remote_ok": true
  },
  "release_authority": {
    "machine_id": "imacm1",
    "machine_label": "iMacM1",
    "claimed_by": "Steven Woods",
    "claimed_at": "2026-04-25T13:16:57Z",
    "notes": "Primary Aurora release-authority machine after the 1.2.3+build.532.sha.b959491 production refresh.",
    "current_machine_matches": false
  },
  "local_services": {
    "game": {
      "ok": true,
      "reachable": true,
      "root_ok": true,
      "url": "http://127.0.0.1:8000/",
      "listeners": [
        {
          "pid": 25405,
          "cwd": "/Users/sgwoods/Development/Codex/Codex-test1",
          "root_ok": true
        }
      ]
    },
    "viewer": {
      "ok": true,
      "reachable": true,
      "root_ok": true,
      "url": "http://127.0.0.1:4311/api/runs",
      "listeners": [
        {
          "pid": 25481,
          "cwd": "/Users/sgwoods/Development/Codex/Codex-test1",
          "root_ok": true
        }
      ]
    },
    "state_dir": "/Users/sgwoods/Development/Codex/Codex-test1/.local-services"
  },
  "live_lanes": {
    "dev": {
      "ok": true,
      "version": "1.4.0",
      "label": "1.4.0.1+build.932.sha.19db4fa4",
      "commit": "19db4fa4",
      "releaseChannel": "development"
    },
    "beta": {
      "ok": true,
      "version": "1.4.0-beta.1",
      "label": "1.4.0-beta.1+build.894.sha.1dc23d8a.beta",
      "commit": "1dc23d8a",
      "releaseChannel": "production beta"
    },
    "production": {
      "ok": true,
      "version": "1.4.0",
      "label": "1.4.0+build.894.sha.1dc23d8a",
      "commit": "1dc23d8a",
      "releaseChannel": "production"
    }
  },
  "publish_permitted": false,
  "next": [
    "git switch -c codex/macbook-pro-your-topic",
    "npm run release:show-authority",
    "npm run release:claim-authority -- --machine-id macbook-pro --label \"MacBook-Pro\""
  ]
}
```

## Exact Restart Prompt

```text
You are continuing Aurora Galactica / Platinum work from a durable Codex checkpoint.

Repo path:
/Users/sgwoods/Development/Codex/Codex-test1

Start by running:
git branch --show-current
git status --short
git log -5 --oneline --decorate
npm run machine:status

Read first:
- CODEX_CONTEXT_CHECKPOINT.md
- RESTART_FROM_HERE.md
- MULTI_MACHINE_WORKFLOW.md

Current checkpoint:
- label: challenge-result-timing-sprite-motion-review
- generated: 2026-05-31T12:20:16.481Z
- branch: codex/macbook-fullscreen-timing-alignment-wip
- commit: 2d144d5c1 Calibrate reference sprite proportions
- dirty files excluding checkpoint self-output: 85

Continue the active plan from the checkpoint. Preserve user work, do not publish beta/production unless this machine has release authority, and commit coherent progress before switching machines or long-running sessions.
```

## Compaction Prevention Protocol

1. At every phase boundary, run:

```bash
npm run codex:checkpoint -- --label <short-topic> --plan "<current goal>" --next "<next concrete step>"
```

2. Commit the checkpoint if it records meaningful state or handoff context.
3. Start a fresh Codex session with the restart prompt above when the chat is
   long, after a multi-hour cycle, or before switching machines.
4. Treat the fresh session as the practical way to force compaction safely:
   context is rebuilt from the repo instead of relying on a fragile chat tail.

JSON artifact: `reference-artifacts/analyses/codex-context-checkpoint/latest.json`
