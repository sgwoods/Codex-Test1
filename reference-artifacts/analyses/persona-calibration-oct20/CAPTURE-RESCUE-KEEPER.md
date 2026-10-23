# Professional Capture/Rescue Keeper

October 20, 2026. Lead work period began 20:58:54 UTC and ended about
21:59 UTC; evidence packaging followed. No commit, push or publication.
HEAD bacb0c58, branch codex/local-review-music-status-oct16.
Integrated controller SHA256:
`a27c906faec56611e3295e3cc06edff59d869de70c8cf4c5cb6f6c709c0e6dfd`.

## Result

Accept the bounded Stage4+ Professional policy as a local incremental keeper.
Repeated captures exhausted ships in the earlier policy. Retreat fire also
destroyed captured fighters. The repair predicts two frames from observed
motion, includes eligible active beams, limits voluntary capture risk after an
initial opportunity, and waits for a carrying boss's attack before firing.
No enemy paths, scoring, lives, player bullet rules or challenge policy changed.

| 900-second protocol | Median | Minimum | >=150k | >=200k |
| --- | ---: | ---: | ---: | ---: |
| Old, seeds89001-10 | 301975 | 96450 | 6/10 | 6/10 |
| Repair, same seeds | 326720 | 189800 | 10/10 | 9/10 |
| Repair, fresh90001-10 | 280480 | 206160 | 10/10 | 10/10 |
| Old, seeds91001-10 | 106735 | 60180 | 3/10 | 3/10 |
| Integrated repair, same910xx | 240785 | 197300 | 10/10 | 9/10 |

All30 distinct repaired Professional runs survived the time budget. These are
censored scores, not completed careers or a population guarantee. Actual
simulation time is approximately899.3-899.6seconds. Opening destructions are
unchanged in matched comparisons: one on890xx, two on910xx. Fresh900xx has one.
Seed89003 first destruction moves from329.65s to887.617s, not zero losses.
That specific timing criterion was not recorded in the rescue acceptance file.

The integrated reset hardening reproduces all10 original matched scores exactly.
The original candidate hash is dd2031c2; comments and lifecycle resets produce
the integrated hash above. Both are archived. Intermediate beam-only, combined
motion/beam, and capture-budget trials remain private diagnostic evidence; they
failed the unchanged matched-median criterion and were not integrated alone.
The1800-second diagnostic is separate and is not mixed into this chart.

## Current Ladder

Fresh91001-91010, same integrated source, Stage1, three ships,900-second budget:

| UI persona | Median | Stage range | Target result |
| --- | ---: | --- | --- |
| Beginner | 7235 | 2-5 | Baseline tier; no new policy change |
| Intermediate | 21995 | 1-6 | Above Beginner at median; overlap remains |
| Expert | 81275 | 8-33 | 6/10 reach75k; consistency still limited |
| Professional | 240785 | 32-50 | 10/10 reach150k;9/10 reach200k |

## Validation

- Build passed. Localhost8000 serves this checkout's dist/dev, build1210,
  development1.4.1.5, bacb0c58.dirty, built21:17:55UTC.
- Mode parity79, clearance37, beam27, motion-cache8, rescue/lifecycle13 passed.
- Browser two-player ownership/Watch checks passed with fixture accounts.
- Existing repeatability check passed (Advanced only; not all-persona proof).
- Life ledgers reconcile all20 initial Professional runs and all40 ladder runs.
- Independent policy/lifecycle and measurement reviews found no blocking defect.
- Visible Codex-browser Watch launch shows WATCH PRO, moving play and scoring.
  It uses existing local start preferences, not the Stage1 distribution protocol.
- Stage2 throughput still FAILS: seed51201 Professional2820/33kills versus
  Expert4250/38kills, both zero deaths. No threshold was changed.
- no-mistakes pipeline unavailable: repository is not initialized. Focused
  checks and independent review are not claimed as a full pipeline pass.

## Limits And Next Work

The pilot waits for mode1 even though engine rescue awards also allow2/4/5.
This is conservative policy, not a game-rule change. In-flight shots can still
hit a captive. Static rescue fixtures do not prove every autonomous transition.
Watch/P2 share the controller, but human actuator equivalence is not proved.

Professional consistency has materially improved. Beta is not ready. Next:
resolve the narrow Stage2 throughput gate without losing these full-game gains;
complete live signed-in save/reload/separate-session checks for both games;
verify password recovery/login and final audio; review/checkpoint source; then
run existing release gates and seek explicit lane authorization.

## Evidence

Portable packets, controller snapshots and raw archive hashes: `capture-rescue/`.
Raw sessions and frozen HTML are losslessly preserved under ignored
`private-artifacts/persistent/persona-capture-rescue-oct20/`. Recovery hashes are
verified. Off-machine backup is not verified. Public packets omit account/build
configuration and absolute local session paths. Original intermediate trials
remain under `private-artifacts/aurora-ladder-oct20/`.
Versioned chart: `../persona-score-history/aurora-score-history.svg`.
Current comparison: `../persona-score-history/aurora-current-ladder.svg`.
