# Codex Context Checkpoint

Generated: 2026-06-01T15:11:21.285Z
Label: challenge-stage-candidate-calibration-sync-needed

This is the durable recovery point for long Aurora / Platinum Codex sessions.
Use it before switching machines, before starting a multi-hour run, and whenever
the conversation has become long enough that automatic compaction could drop
important working context.

## Current Repo State

- Repo path: `/Users/sgwoods/Development/Codex/Codex-test1`
- Branch: `codex/macbook-challenge-stage-gameplay-spectacle`
- HEAD: `5a3f3ce57` Add human-perfect guard to challenge sweeps
- Dirty files excluding checkpoint self-output: `27`

## Active Plan

- Preserve Stage 2-3 candidate sweep calibration, then integrate with new ingestion dashboard and Guardians artifact work from origin/main

## Recommended Next Steps

- Rebase or create a fresh integration branch from origin/main; port only reusable sweep rejection memory, target contracts, and before-after evidence into the new grammar architecture

## Notes

- Codex Desktop does not expose a repo command that forces internal chat compaction. The safe replacement is a manual checkpoint plus a deliberate fresh session from this file.
- This checkpoint intentionally filters its own generated files out of the dirty-status read so it can be committed as the recovery point.

## Git Status

```
M CHALLENGE_STAGE_CONFORMANCE_ANALYSIS.md
 M CHALLENGE_STAGE_HUMAN_PLAYABILITY_REVIEW.md
 M CHALLENGE_STAGE_ROUTEABILITY_REVIEW.md
 M package.json
 M reference-artifacts/analyses/aurora-challenge-movement-grammar-map/latest.json
 M reference-artifacts/analyses/challenge-stage-candidate-full-analyzer-review/latest.json
 M reference-artifacts/analyses/challenge-stage-candidate-sweep-index/latest.json
 M reference-artifacts/analyses/challenge-stage-candidate-sweep/latest.json
 M reference-artifacts/analyses/challenge-stage-conformance/latest-diagrams/challenge-stage-01-object-track.svg
 M reference-artifacts/analyses/challenge-stage-conformance/latest-diagrams/challenge-stage-01-trajectory.svg
 M reference-artifacts/analyses/challenge-stage-conformance/latest-diagrams/challenge-stage-02-object-track.svg
 M reference-artifacts/analyses/challenge-stage-conformance/latest-diagrams/challenge-stage-03-object-track.svg
 M reference-artifacts/analyses/challenge-stage-conformance/latest-diagrams/challenge-stage-05-object-track.svg
 M reference-artifacts/analyses/challenge-stage-conformance/latest-diagrams/challenge-stage-06-object-track.svg
 M reference-artifacts/analyses/challenge-stage-conformance/latest-diagrams/challenge-stage-07-object-track.svg
 M reference-artifacts/analyses/challenge-stage-conformance/latest-diagrams/challenge-stage-08-object-track.svg
 M reference-artifacts/analyses/challenge-stage-conformance/latest.json
 M reference-artifacts/analyses/challenge-stage-human-playability/latest.json
 M reference-artifacts/analyses/challenge-stage-routeability/latest.json
 M reference-artifacts/ingestion/challenge-stage-target-contracts/aurora-challenge-contracts-0.1.json
 M tools/harness/sweep-stage11-challenge-candidates.js
?? reference-artifacts/analyses/aurora-challenge-movement-grammar-map/2026-06-01T14-38-20-5a3f3ce57/
?? reference-artifacts/analyses/challenge-candidate-before-after/
?? reference-artifacts/analyses/challenge-stage-candidate-full-analyzer-review/2026-06-01T15-06-40-5a3f3ce57/
?? reference-artifacts/analyses/challenge-stage-candidate-sweep-index/2026-06-01T15-08-43-5a3f3ce57/
?? reference-artifacts/analyses/challenge-stage-conformance/2026-06-01-5a3f3ce57/
?? tools/harness/analyze-challenge-candidate-before-after.js
```

## Diff Stat

```
CHALLENGE_STAGE_CONFORMANCE_ANALYSIS.md            |    14 +-
 CHALLENGE_STAGE_HUMAN_PLAYABILITY_REVIEW.md        |     8 +-
 CHALLENGE_STAGE_ROUTEABILITY_REVIEW.md             |     4 +-
 package.json                                       |     1 +
 .../latest.json                                    |   325 +-
 .../latest.json                                    |    62 +-
 .../latest.json                                    |    30 +-
 .../challenge-stage-candidate-sweep/latest.json    | 38437 +++++++++----------
 .../challenge-stage-01-object-track.svg            |     2 +-
 .../challenge-stage-01-trajectory.svg              |     2 +-
 .../challenge-stage-02-object-track.svg            |     2 +-
 .../challenge-stage-03-object-track.svg            |    10 +-
 .../challenge-stage-05-object-track.svg            |     2 +-
 .../challenge-stage-06-object-track.svg            |    10 +-
 .../challenge-stage-07-object-track.svg            |     2 +-
 .../challenge-stage-08-object-track.svg            |     8 +-
 .../challenge-stage-conformance/latest.json        | 33738 ++++++++--------
 .../challenge-stage-human-playability/latest.json  |    20 +-
 .../challenge-stage-routeability/latest.json       |  3904 +-
 .../aurora-challenge-contracts-0.1.json            |   173 +-
 .../harness/sweep-stage11-challenge-candidates.js  |    70 +-
 21 files changed, 36746 insertions(+), 40078 deletions(-)
```

## Recent Log

```
5a3f3ce57 (HEAD -> codex/macbook-challenge-stage-gameplay-spectacle) Add human-perfect guard to challenge sweeps
d2d7906a0 Repair challenge object-track fit
b7231d3b4 Add challenge routeability guardrails
6650d54b5 (origin/codex/macbook-challenge-stage-gameplay-spectacle) Harden challenge tour transitions
a2076fe56 Add challenge tour playability review
5ed39193c Measure challenge perfect route potential
38d93e45e Promote challenge motion evidence and interval labels
bd1233c7c Add motion atlas conformance visualization
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
    "branch": "codex/macbook-challenge-stage-gameplay-spectacle",
    "dirty": true,
    "upstream": "origin/codex/macbook-challenge-stage-gameplay-spectacle",
    "ahead": 3,
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
      "label": "1.4.0.1+build.975.sha.9bb463aa",
      "commit": "9bb463aa",
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
- label: challenge-stage-candidate-calibration-sync-needed
- generated: 2026-06-01T15:11:21.285Z
- branch: codex/macbook-challenge-stage-gameplay-spectacle
- commit: 5a3f3ce57 Add human-perfect guard to challenge sweeps
- dirty files excluding checkpoint self-output: 27

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
