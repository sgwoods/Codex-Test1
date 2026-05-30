# Codex Context Checkpoint

Generated: 2026-05-30T21:17:06.241Z
Label: challenge-timing-metric-correction

This is the durable recovery point for long Aurora / Platinum Codex sessions.
Use it before switching machines, before starting a multi-hour run, and whenever
the conversation has become long enough that automatic compaction could drop
important working context.

## Current Repo State

- Repo path: `/Users/sgwoods/Development/Codex/Codex-test1`
- Branch: `codex/macbook-fullscreen-timing-alignment-wip`
- HEAD: `9a9ede246` Measure challenge visible-motion timing
- Dirty files excluding checkpoint self-output: `57`

## Active Plan

- Correct challenge timing metrics against target object tracks; reject low-value Stage 7 spatial candidate; continue with shape-scored candidate loop

## Recommended Next Steps

- Commit measurement correction, then build a Stage 7 shape scorer before another gameplay promotion attempt

## Notes

- Codex Desktop does not expose a repo command that forces internal chat compaction. The safe replacement is a manual checkpoint plus a deliberate fresh session from this file.
- This checkpoint intentionally filters its own generated files out of the dirty-status read so it can be committed as the recovery point.

## Git Status

```
M CHALLENGE_STAGE_CONFORMANCE_ANALYSIS.md
 M LEVEL_VISUAL_TIMING_ALIGNMENT.md
 M reference-artifacts/analyses/challenge-stage-conformance/latest-diagrams/challenge-stage-01-object-track.svg
 M reference-artifacts/analyses/challenge-stage-conformance/latest-diagrams/challenge-stage-01-trajectory.svg
 M reference-artifacts/analyses/challenge-stage-conformance/latest-diagrams/challenge-stage-02-object-track.svg
 M reference-artifacts/analyses/challenge-stage-conformance/latest-diagrams/challenge-stage-03-object-track.svg
 M reference-artifacts/analyses/challenge-stage-conformance/latest-diagrams/challenge-stage-04-object-track.svg
 M reference-artifacts/analyses/challenge-stage-conformance/latest-diagrams/challenge-stage-05-object-track.svg
 M reference-artifacts/analyses/challenge-stage-conformance/latest-diagrams/challenge-stage-06-object-track.svg
 M reference-artifacts/analyses/challenge-stage-conformance/latest-diagrams/challenge-stage-06-trajectory.svg
 M reference-artifacts/analyses/challenge-stage-conformance/latest-diagrams/challenge-stage-07-object-track.svg
 M reference-artifacts/analyses/challenge-stage-conformance/latest-diagrams/challenge-stage-08-object-track.svg
 M reference-artifacts/analyses/challenge-stage-conformance/latest.json
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
 M reference-artifacts/analyses/stage7-reference-path-before-after/README.md
 M reference-artifacts/analyses/stage7-reference-path-before-after/latest-frames/after/after-01-006ds.png
 M reference-artifacts/analyses/stage7-reference-path-before-after/latest-frames/after/after-02-024ds.png
 M reference-artifacts/analyses/stage7-reference-path-before-after/latest-frames/after/after-03-042ds.png
 M reference-artifacts/analyses/stage7-reference-path-before-after/latest-frames/after/after-04-060ds.png
 M reference-artifacts/analyses/stage7-reference-path-before-after/latest-frames/after/after-05-078ds.png
 M reference-artifacts/analyses/stage7-reference-path-before-after/latest-frames/after/after-06-096ds.png
 M reference-artifacts/analyses/stage7-reference-path-before-after/latest-frames/after/after-07-114ds.png
 M reference-artifacts/analyses/stage7-reference-path-before-after/latest-frames/after/after-08-132ds.png
 M reference-artifacts/analyses/stage7-reference-path-before-after/latest-frames/after/after-09-150ds.png
 M reference-artifacts/analyses/stage7-reference-path-before-after/latest-frames/after/after-10-168ds.png
 M reference-artifacts/analyses/stage7-reference-path-before-after/latest-frames/before/before-01-006ds.png
 M reference-artifacts/analyses/stage7-reference-path-before-after/latest-frames/before/before-02-024ds.png
 M reference-artifacts/analyses/stage7-reference-path-before-after/latest-frames/before/before-03-042ds.png
 M reference-artifacts/analyses/stage7-reference-path-before-after/latest-frames/before/before-04-060ds.png
 M reference-artifacts/analyses/stage7-reference-path-before-after/latest-frames/before/before-05-078ds.png
 M reference-artifacts/analyses/stage7-reference-path-before-after/latest-frames/before/before-06-096ds.png
 M reference-artifacts/analyses/stage7-reference-path-before-after/latest-frames/before/before-07-114ds.png
 M reference-artifacts/analyses/stage7-reference-path-before-after/latest-frames/before/before-08-132ds.png
 M reference-artifacts/analyses/stage7-reference-path-before-after/latest-frames/before/before-09-150ds.png
 M reference-artifacts/analyses/stage7-reference-path-before-after/latest-frames/before/before-10-168ds.png
 M reference-artifacts/analyses/stage7-reference-path-before-after/latest-stage7-before-after.svg
 M reference-artifacts/analyses/stage7-reference-path-before-after/latest.json
 M tools/harness/analyze-level-visual-timing-alignment.js
 M tools/harness/check-level-visual-timing-alignment.js
?? reference-artifacts/analyses/challenge-stage-conformance/2026-05-30-9a9ede246/
?? reference-artifacts/analyses/level-visual-timing-alignment/2026-05-30-9a9ede246/
```

## Diff Stat

```
CHALLENGE_STAGE_CONFORMANCE_ANALYSIS.md            |    43 +-
 LEVEL_VISUAL_TIMING_ALIGNMENT.md                   |    24 +-
 .../challenge-stage-01-object-track.svg            |    26 +-
 .../challenge-stage-01-trajectory.svg              |    12 +-
 .../challenge-stage-02-object-track.svg            |    10 +-
 .../challenge-stage-03-object-track.svg            |     2 +-
 .../challenge-stage-04-object-track.svg            |     2 +-
 .../challenge-stage-05-object-track.svg            |     2 +-
 .../challenge-stage-06-object-track.svg            |     2 +-
 .../challenge-stage-06-trajectory.svg              |     2 +-
 .../challenge-stage-07-object-track.svg            |     4 +-
 .../challenge-stage-08-object-track.svg            |     2 +-
 .../challenge-stage-conformance/latest.json        | 18472 +++++++++----------
 ...llenge-01-target-vs-current-aligned-contact.jpg |   Bin 90108 -> 90158 bytes
 ...llenge-02-target-vs-current-aligned-contact.jpg |   Bin 114540 -> 114565 bytes
 ...llenge-03-target-vs-current-aligned-contact.jpg |   Bin 112527 -> 112523 bytes
 ...llenge-04-target-vs-current-aligned-contact.jpg |   Bin 105491 -> 105505 bytes
 .../latest-current-videos/challenge-01.webm        |   Bin 581783 -> 580908 bytes
 .../latest-current-videos/challenge-02.webm        |   Bin 551286 -> 554564 bytes
 .../latest-current-videos/challenge-03.webm        |   Bin 680898 -> 673338 bytes
 .../latest-current-videos/challenge-04.webm        |   Bin 615286 -> 602722 bytes
 .../challenge-01-target-vs-current-aligned.webm    |   Bin 974188 -> 977409 bytes
 .../challenge-02-target-vs-current-aligned.webm    |   Bin 1228339 -> 1225466 bytes
 .../challenge-03-target-vs-current-aligned.webm    |   Bin 1244908 -> 1243956 bytes
 .../challenge-04-target-vs-current-aligned.webm    |   Bin 1202442 -> 1200244 bytes
 .../latest-target-videos/challenge-01.webm         |   Bin 703934 -> 703934 bytes
 .../latest-target-videos/challenge-02.webm         |   Bin 927745 -> 927745 bytes
 .../latest-target-videos/challenge-03.webm         |   Bin 926144 -> 926144 bytes
 .../latest-target-videos/challenge-04.webm         |   Bin 883400 -> 883400 bytes
 .../level-visual-timing-alignment/latest.json      |    51 +-
 .../stage7-reference-path-before-after/README.md   |     6 +-
 .../latest-frames/after/after-01-006ds.png         |   Bin 81000 -> 81087 bytes
 .../latest-frames/after/after-02-024ds.png         |   Bin 80763 -> 80762 bytes
 .../latest-frames/after/after-03-042ds.png         |   Bin 72654 -> 72655 bytes
 .../latest-frames/after/after-04-060ds.png         |   Bin 72562 -> 72281 bytes
 .../latest-frames/after/after-05-078ds.png         |   Bin 71954 -> 72681 bytes
 .../latest-frames/after/after-06-096ds.png         |   Bin 72002 -> 72137 bytes
 .../latest-frames/after/after-07-114ds.png         |   Bin 71795 -> 72300 bytes
 .../latest-frames/after/after-08-132ds.png         |   Bin 71995 -> 72028 bytes
 .../latest-frames/after/after-09-150ds.png         |   Bin 80027 -> 79885 bytes
 .../latest-frames/after/after-10-168ds.png         |   Bin 80745 -> 79781 bytes
 .../latest-frames/before/before-01-006ds.png       |   Bin 86595 -> 84086 bytes
 .../latest-frames/before/before-02-024ds.png       |   Bin 91355 -> 87343 bytes
 .../latest-frames/before/before-03-042ds.png       |   Bin 84088 -> 80258 bytes
 .../latest-frames/before/before-04-060ds.png       |   Bin 84737 -> 81807 bytes
 .../latest-frames/before/before-05-078ds.png       |   Bin 78854 -> 77083 bytes
 .../latest-frames/before/before-06-096ds.png       |   Bin 73630 -> 76305 bytes
 .../latest-frames/before/before-07-114ds.png       |   Bin 80227 -> 80306 bytes
 .../latest-frames/before/before-08-132ds.png       |   Bin 80502 -> 79656 bytes
 .../latest-frames/before/before-09-150ds.png       |   Bin 74962 -> 79898 bytes
 .../latest-frames/before/before-10-168ds.png       |   Bin 87941 -> 79453 bytes
 .../latest-stage7-before-after.svg                 |    40 +-
 .../stage7-reference-path-before-after/latest.json |   153 +-
 .../analyze-level-visual-timing-alignment.js       |    67 +-
 .../harness/check-level-visual-timing-alignment.js |    14 +
 55 files changed, 9436 insertions(+), 9498 deletions(-)
```

## Recent Log

```
9a9ede246 (HEAD -> codex/macbook-fullscreen-timing-alignment-wip, origin/codex/macbook-fullscreen-timing-alignment-wip) Measure challenge visible-motion timing
fac514254 Refresh challenge ceremony checkpoint
b31ffb402 Widen challenge result ceremony timing
768a709b4 Refresh fullscreen timing checkpoint
5d355d8e6 Fix checkpoint self status parsing
04a9d7954 Stabilize challenge timing alignment artifacts
2023015f6 Refresh fullscreen timing checkpoint
77a7396fb Preserve fullscreen timing alignment WIP
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
- label: challenge-timing-metric-correction
- generated: 2026-05-30T21:17:06.241Z
- branch: codex/macbook-fullscreen-timing-alignment-wip
- commit: 9a9ede246 Measure challenge visible-motion timing
- dirty files excluding checkpoint self-output: 57

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
