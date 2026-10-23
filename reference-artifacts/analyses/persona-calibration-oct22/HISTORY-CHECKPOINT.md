# History Repair Checkpoint

Baseline bacb0c585f0ff516d2a3373cb16c563de5079ad3. October 23, 2026.

Scope: new replay metadata retains internal stage, adds display stage, completion
time and local score identity. Freeze metadata per recorder before audio-tail
delay and Aurora turn transition. Carry fields through IndexedDB catalog and
profile merging. No legacy data rewrite or live database modification.

Validation: metadata VM, isolated browser IndexedDB/profile test, pilot-record
replay selection, public fake-service scoring contract and diff checks passed.
Independent earlier review found no remaining narrow blocker after recorder
snapshot fix. Full asynchronous recorder lifecycle stress remains a test gap.
Identity-less remote rows still use a score/stage/time heuristic; old replay
duplicates are not repaired. Persona changes in player-flow are excluded from
this checkpoint; only the outcome metadata freeze hook is included.

Live beta.4 acceptance: human Chrome screenshots show Guardians SWD1320/Stage1
at game over and in My scores live after refresh. Lead subsequently used Codex
browser UI to retrieve the same live record, then switched to Aurora My Scores:
102410/Stage13 present and1320 absent from displayed records. Both games' live
account checks are complete for build1209 SHA02166971, not a future package.

Empty Build legacy rows: src/js/04-leaderboard-ui.js renderLeaderboardPanel
loops ten times and creates placeholder objects for missing rows. Thus the
observed rows are presentation padding, not evidence of database pollution.
Follow-up: render only actual rows, with a focused sparse-leaderboard regression.
No production database cleanup is required by this observation.

Expert disposition remains pending human decision: ten900s runs, median81275,
range46960-198120,6/10 at least75000. Recommend accepting this documented beta
limitation and continuing calibration separately; do not claim reliable75k or
silently waive the hold. Professional median240785,10/10 at least150000 in the
same historical panel. These are existing measurements, not new runs.

Next: product decision, sparse leaderboard follow-up, checkpoint remaining
accepted persona packet, release gates, authorized dev review, exact beta
package QA and explicit publication approval. No push or publication here.
