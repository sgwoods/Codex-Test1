# Leaderboard Schema Repair

Baseline: e9f72dfe. Date: October 17, 2026.

Primary reference: human Supabase screenshots in the lead chat. The log reports
42703, column scores.game_key does not exist. Schema Visualizer lists id,
initials, score, stage, build, achieved_at, user_id and is_verified, without
game_key/game_title. This establishes the observed mismatch, not the cause of
every historical database error. No live database mutation was performed.

The runtime now selects the existing columns directly. It retains sorting,
limit, verification, ownership and test-account filters. Legacy remote records
remain Aurora-owned; Guardians remote-write restrictions are unchanged.
Future mixed-game storage requires a separate migration and read/write contract.

Validation:
- npm run harness:check:leaderboard-schema: six cases PASS.
- node tools/harness/check-leaderboard-schema.js --baseline: expected FAIL;
  old code makes two requests instead of one against the observed schema.
- npm run harness:check:password-recovery: 12 cases PASS.
- npm run harness:check:supabase-data-api-contract: PASS (static contract only).
- npm run harness:check:remote-score-submit: browser mock success/failure PASS.
- npm run build and git diff --check: PASS.

DEV localhost8000 build1206/e9f72dfe dirty matches dist/dev bytes. Frozen beta.3
on8002 is unchanged and does not include this repair. No live backend query or
error-rate reduction is claimed. Existing hosted/old open clients keep the old
probe until updated. Human reports beta.3 live recovery/password login passed
after allowing localhost8002 in Supabase. No release publication performed.

Next: checkpoint repair, prepare a distinct candidate, verify its public runtime
and complete matching hosted DEV and beta release gates. Track live schema
compatibility explicitly; simulated/static checks alone cannot establish it.
