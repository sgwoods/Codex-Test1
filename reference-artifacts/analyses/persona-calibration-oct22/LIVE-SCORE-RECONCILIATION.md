# Live Score Reconciliation

## Implementation Update

Follow-up verification October23:
- Independent review found recorder metadata could be overwritten after restart.
  Snapshot now belongs to the specific recorder; Aurora freezes after outcome
  construction before P2 switching. Stop/onstop do not read a later run's state.
- Focused VM lifecycle checks pass. Reviewer reports no new narrow blocker.
- New check-replay-profile-browser.js executes development harness fixture through
  actual metadata, IndexedDB catalog, profile merge and rendered STG13; PASS.
- Existing check-pilot-records-panel.js passes exact replay selection/autoplay.
- Public scoring fixture, build and diff check pass. DEV8000 matches rebuilt file.
- Fresh beta tab retrieves live Aurora102410/13. This shares browser credentials
  and storage; it does not establish separate-login acceptance.
- Guardians selected and normal run started through UI; repeated Space inputs
  did not yield a completed nonzero run. No synthetic submission was attempted.
  Temporary tab closed; original signed-in tab preserved. Live save UNVERIFIED.
- Legacy duplicates and identity-less remote matching remain unresolved. Full
  asynchronous recorder timer-order stress remains additional coverage needed.

October23: provisional new-record fix in02-replay-telemetry.js,
shared/replay-store.js and05-supabase.js. Replay retains internal stage and adds
displayStage, completedAt and scoreEntryId. Profile consumes explicit fields;
known different local entry identities do not collapse. Remote rows retain the
existing score/stage/time heuristic because the backend has no shared run ID.
This is not a guarantee against all equal-score remote collisions.

check-replay-profile-metadata.js exercises actual source functions for17->13,
unchanged Guardians numbering, local identity, game and time separation.
Focused test, public scoring-contract test, build and diff check pass.
localhost8000HTTP200 matches rebuilt dist. Frozen8002 is unchanged.

Limitations: no automatic repair of ambiguous historical records, no new-record
browser acceptance yet, no independent review yet. Do not call the full history
defect closed. No database writes, commit, push or publish.

October 23, 2026. Beta1.4.2-beta.4 build1209 SHA02166971.

Human confirmed102410 points. Browser My Scores live showed102410/Stage13
after reload. This establishes the observed Aurora save/read-after-reload
result, not separate-session or Guardians acceptance.

Human screenshot shows a second102410/Stage17 local replay row, six minutes
older than the remote row. Source inspection identifies two incompatible
representations:

- currentReplayMeta in02-replay-telemetry.js stores S.stage (internal) and
  REC.createdAt (start time).
- buildGameOverState in00-boot.js records displayStageNumber. Internal17
  minus four preceding challenges is displayed13.
- pilotLocalReplayRows in05-supabase.js copies raw replay stage/start time.
- mergePilotProfileRows requires identical score and stage and timestamps
  within120seconds. Both conditions can fail for this one flight.

This explains the observed duplicate representation without evidence that the
remote score is corrupt. No database records were changed. Screenshot source:
/var/folders/z8/hqkwn1q543zgs63rhbqlpsbr0000gn/T/codex-clipboard-f2edbc2b-12f9-4d00-989b-d0e99277992f.png

Next repair: retain internal replay stage for telemetry, add explicit displayed
stage and completion time for profile presentation, and link score/replay by
stable run identity where available. Handle legacy native replays conservatively;
do not merge arbitrary equal scores or change Guardians stage numbering.
Test a long Stage17/display13 run, distinct equal-score runs, game separation,
and replay attachment. Do not rewrite saved remote data or the frozen beta.

Remaining live gates: separate authenticated session retrieval and Guardians
normal save/reload. Final candidate still needs exact-package acceptance.
