# Codex Context Checkpoint

Generated: 2026-05-27T16:51:32.636Z
Label: stable-challenge-setpiece-capture-checkpoint

This is the durable recovery point for long Aurora / Platinum Codex sessions.
Use it before switching machines, before starting a multi-hour run, and whenever
the conversation has become long enough that automatic compaction could drop
important working context.

## Current Repo State

- Repo path: `/Users/sgwoods/Development/Codex/Codex-test1`
- Branch: `codex/challenge-target-authority-setpiece-upgrade`
- HEAD: `6280d4a64` Improve challenge identity gates and sprite conformance lane
- Dirty files excluding checkpoint self-output: `46`

## Active Plan

- Challenge set-piece/capture work is validated and ready to commit

## Recommended Next Steps

- Stage intended files, commit stable branch state, then push or provide handoff

## Notes

- Codex Desktop does not expose a repo command that forces internal chat compaction. The safe replacement is a manual checkpoint plus a deliberate fresh session from this file.
- This checkpoint intentionally filters its own generated files out of the dirty-status read so it can be committed as the recovery point.

## Git Status

```
M CHALLENGE_STAGE_CONFORMANCE_ANALYSIS.md
 M GALAGA_ALIEN_TARGET_CROPS.md
 M GALAGA_TARGET_EVIDENCE_AUDIT.md
 M MULTI_MACHINE_WORKFLOW.md
 M QUALITY_CONFORMANCE_MODEL.md
 M RESTART_FROM_HERE.md
 M package.json
 M reference-artifacts/analyses/application-artifact-conformance/latest.json
 M reference-artifacts/analyses/aurora-runtime-vs-galaga-target-crops/latest.json
 M reference-artifacts/analyses/challenge-stage-conformance/latest-diagrams/challenge-stage-01-object-track.svg
 M reference-artifacts/analyses/challenge-stage-conformance/latest-diagrams/challenge-stage-01-trajectory.svg
 M reference-artifacts/analyses/challenge-stage-conformance/latest-diagrams/challenge-stage-02-object-track.svg
 M reference-artifacts/analyses/challenge-stage-conformance/latest-diagrams/challenge-stage-02-trajectory.svg
 M reference-artifacts/analyses/challenge-stage-conformance/latest-diagrams/challenge-stage-03-object-track.svg
 M reference-artifacts/analyses/challenge-stage-conformance/latest-diagrams/challenge-stage-03-trajectory.svg
 M reference-artifacts/analyses/challenge-stage-conformance/latest-diagrams/challenge-stage-04-object-track.svg
 M reference-artifacts/analyses/challenge-stage-conformance/latest-diagrams/challenge-stage-04-trajectory.svg
 M reference-artifacts/analyses/challenge-stage-conformance/latest-diagrams/challenge-stage-05-object-track.svg
 M reference-artifacts/analyses/challenge-stage-conformance/latest-diagrams/challenge-stage-07-object-track.svg
 M reference-artifacts/analyses/challenge-stage-conformance/latest-diagrams/challenge-stage-08-object-track.svg
 M reference-artifacts/analyses/challenge-stage-conformance/latest.json
 M reference-artifacts/analyses/galaga-alien-target-crops/latest.json
 M reference-artifacts/analyses/galaga-target-evidence-audit/latest.json
 M src/js/02-replay-telemetry.js
 M src/js/13-aurora-game-pack.js
 M src/js/90-harness.js
 M tools/build/build-index.js
 M tools/harness/analyze-aurora-runtime-vs-galaga-target-crops.js
 M tools/harness/analyze-galaga-target-evidence-audit.js
 M tools/harness/check-aurora-runtime-vs-galaga-target-crops.js
 M tools/harness/check-challenge-motion-profile.js
 M tools/harness/check-galaga-alien-target-crops.js
 M tools/harness/check-galaga-target-evidence-audit.js
 M tools/harness/check-video-artifact.js
 M tools/harness/promote-galaga-alien-target-crops.js
 M tools/harness/video-artifact-util.js
?? CHALLENGE_SETPIECE_CONTRACTS.md
?? reference-artifacts/analyses/challenge-setpiece-contracts/
?? reference-artifacts/analyses/challenge-stage-conformance/2026-05-27-6280d4a64/
?? reference-artifacts/analyses/codex-context-checkpoint/
?? reference-artifacts/analyses/gameplay-segment-captures/
?? reference-artifacts/analyses/level-visual-conformance-index/review-pairs/
?? tools/dev/write-context-checkpoint.js
?? tools/harness/analyze-challenge-setpiece-contracts.js
?? tools/harness/capture-gameplay-segment.js
?? tools/harness/check-challenge-setpiece-contracts.js
```

## Diff Stat

```
CHALLENGE_STAGE_CONFORMANCE_ANALYSIS.md            |    99 +-
 GALAGA_ALIEN_TARGET_CROPS.md                       |    76 +-
 GALAGA_TARGET_EVIDENCE_AUDIT.md                    |    14 +-
 MULTI_MACHINE_WORKFLOW.md                          |    16 +
 QUALITY_CONFORMANCE_MODEL.md                       |    26 +
 RESTART_FROM_HERE.md                               |    16 +
 package.json                                       |     7 +-
 .../application-artifact-conformance/latest.json   |   139 +-
 .../latest.json                                    |   179 +-
 .../challenge-stage-01-object-track.svg            |     6 +-
 .../challenge-stage-01-trajectory.svg              |     2 +-
 .../challenge-stage-02-object-track.svg            |    28 +-
 .../challenge-stage-02-trajectory.svg              |    16 +-
 .../challenge-stage-03-object-track.svg            |    28 +-
 .../challenge-stage-03-trajectory.svg              |    12 +-
 .../challenge-stage-04-object-track.svg            |     2 +-
 .../challenge-stage-04-trajectory.svg              |     2 +-
 .../challenge-stage-05-object-track.svg            |     2 +-
 .../challenge-stage-07-object-track.svg            |     2 +-
 .../challenge-stage-08-object-track.svg            |     2 +-
 .../challenge-stage-conformance/latest.json        | 36036 ++++++-------------
 .../analyses/galaga-alien-target-crops/latest.json |   201 +-
 .../galaga-target-evidence-audit/latest.json       |   150 +-
 src/js/02-replay-telemetry.js                      |     3 +-
 src/js/13-aurora-game-pack.js                      |    20 +-
 src/js/90-harness.js                               |    61 +
 tools/build/build-index.js                         |   165 +-
 ...nalyze-aurora-runtime-vs-galaga-target-crops.js |    29 +-
 .../analyze-galaga-target-evidence-audit.js        |    34 +-
 .../check-aurora-runtime-vs-galaga-target-crops.js |    13 +
 tools/harness/check-challenge-motion-profile.js    |    36 +-
 tools/harness/check-galaga-alien-target-crops.js   |     8 +-
 .../harness/check-galaga-target-evidence-audit.js  |     9 +-
 tools/harness/check-video-artifact.js              |    29 +-
 tools/harness/promote-galaga-alien-target-crops.js |    86 +-
 tools/harness/video-artifact-util.js               |     4 +-
 36 files changed, 12025 insertions(+), 25533 deletions(-)
```

## Recent Log

```
6280d4a64 (HEAD -> codex/challenge-target-authority-setpiece-upgrade, origin/codex/macbook-challenge-stage-conformance-cycle, codex/macbook-challenge-stage-conformance-cycle) Improve challenge identity gates and sprite conformance lane
abc27c36c Add Stage 7 before-after challenge evidence
412ff2860 Promote Stage 7 reference-path challenge choreography
9001395d8 Add target-derived challenge trajectory controls
abb6ccaef Resweep challenge stage candidates under strict identity
a228db722 Tighten challenge stage sweep diagnostics
47f2c7e1d Expand Stage 19 challenge sweep evidence
a423c8beb Refresh conformance dashboard metadata
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
    "branch": "codex/challenge-target-authority-setpiece-upgrade",
    "dirty": true,
    "upstream": null,
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
      "label": "1.4.0.1+build.924.sha.9e779c05",
      "commit": "9e779c05",
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
- label: stable-challenge-setpiece-capture-checkpoint
- generated: 2026-05-27T16:51:32.636Z
- branch: codex/challenge-target-authority-setpiece-upgrade
- commit: 6280d4a64 Improve challenge identity gates and sprite conformance lane
- dirty files excluding checkpoint self-output: 46

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
