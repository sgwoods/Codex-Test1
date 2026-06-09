# MacBook Guardians Gameplay Handoff Prompt

Updated: June 9, 2026

Use this file when continuing the Galaxy Guardians gameplay-release push on the
MacBook or another Codex machine after fetching from GitHub.

## Ingest Prompt

Paste this prompt into the other machine's Codex thread:

```text
cd /Users/steven/Projects-All/Codex-Test1

We are integrating the iMac Guardians gameplay handoff.

First, protect local work:
git status --short --branch
If there are local changes, do not overwrite them. Summarize them and ask before
stashing, rebasing, merging, or switching in a way that would disturb them.

Then fetch and switch to the handoff branch:
git fetch origin
git switch codex/imacm1-guardians-ingestion-conformance
git pull --ff-only

Context:
- Handoff gameplay commit is 908831ad: "Improve Guardians watch mode and routeability".
- This branch is codex/imacm1-guardians-ingestion-conformance.
- Guardians Watch mode is now first-class.
- Guardians Rival is disabled.
- The high-score ownership bug is addressed: Guardians game-over and high-score
  surfaces should say Guardians / Galaxy Guardians, not Aurora.
- Expert opening gameplay was improved with safe-lane routing.
- The prior weak seed 5175 now reaches about 179.85s, score 1910, with 0 losses.
- Current routeability score is 7.0/10.
- Competitive three-ship score is 7.8.
- Advanced is preserved at 7.9.
- Long-surface score is 7.0.
- Current weakest gameplay group is midrun-stage-five-stress at 6.6.

Run verification before editing:
npm run build
npm run harness:check:guardians-watch-mode
npm run harness:check:guardians-high-score-ownership
npm run harness:check:galaxy-guardians-expert-opening-failure
npm run harness:check:galaxy-guardians-routeability-review
npm run harness:check:galaxy-guardians-preview-release
npm run harness:check:galaxy-guardians-0-1-candidate

Next gameplay focus:
Continue the measured gameplay-improvement loop on midrun-stage-five-stress. Add
or extend diagnostics for stage-five pressure, test routeability candidates, and
only promote changes that improve the midrun weak group without regressing
Advanced, Expert opening seed 5175, Watch mode, high-score ownership, or the
Guardians 0.1 release gate.

Expected working style:
- Use measured harness results and reference artifacts before subjective tuning.
- Keep changes scoped to Guardians gameplay, persona routing, and supporting
  diagnostics unless a verifier exposes a platform issue.
- Preserve the existing artifact trail under reference-artifacts/analyses.
- Commit and push a new branch or continue this handoff branch only after the
  verification set is green.
```

## Local Verification Already Completed On iMac

Completed before this handoff artifact was written:

- `npm run build`
- `npm run harness:check:guardians-watch-mode`
- `npm run harness:check:guardians-high-score-ownership`
- `npm run harness:check:galaxy-guardians-expert-opening-failure`
- `npm run harness:check:galaxy-guardians-expert-gameplay-candidates`
- `npm run harness:check:galaxy-guardians-routeability-review`
- `npm run harness:check:galaxy-guardians-preview-release`
- `npm run harness:check:galaxy-guardians-0-1-candidate`
- `git diff --check`

## Notes For Replanning

Treat `midrun-stage-five-stress` as the next measured gameplay bottleneck. The
next pass should make the stage-five pressure problem visible with a targeted
diagnostic before promoting tuning changes.
