# Per-Game Persistence

October18 update: human reports the phase2 migration completed. Supabase SQL
Editor result shows scores/Aurora42 and game_scores/Guardians0 after COMMIT.
Live application acceptance remains pending; this confirms aggregate counts,
not full content equality or successful browser submission. Original screenshot
retained privately in private-artifacts/game-scores-oct17/live-phase2-result.png.

October 17, 2026. Baseline e9f72dfe plus earlier local schema-query repair.
Human phase1 migration screenshot confirms42 retained Aurora scores. Phase2
is prepared in supabase/add-platform-game-scores.sql, not applied live.

Compatibility: legacy scores stays Aurora-only. New game_scores isolates other
games from older unfiltered clients. The shared platform service routes by game,
filters before top10 ranking and isolates account/game caches and best scores.
Late responses after game, account or client changes cannot replace current data.

Public packaging uses authenticated submit_platform_score RPC. It derives owner
from auth.uid(), validates structural inputs and sets verification false. New
direct client inserts are also restricted to structurally valid unverified data.
This is not replay verification, anti-cheat, rate limiting or leaderboard fraud
prevention. Historical verification data is unchanged. Beta/production source
allows signed-in submission; guests stay local, development retains test policy.

Evidence: private-artifacts/game-scores-oct17/validation.json contains executable
test output and source/method hashes. Eight query cases, fresh-context fake-service
persistence for both games, public packaging transforms, account/game cache
isolation, stale responses, best scores, recovery and access-contract checks PASS.
PGlite PostgreSQL execution verifies both migrations,42 full fixture rows retained,
legacy isolation, RPC owner/unverified behavior and rejection of direct forged
verification/malformed initials/cross-user writes and deletes. No live-account
test or real backend policy verification is claimed. Browser Aurora submission
and Guardians game-over ownership checks also pass. No frozen beta was changed.

Next apply phase2 using the user's authenticated SQL Editor. Expected aggregate
result: scores/Aurora42 (or additional legitimate scores), game_scores/Guardians0.
Then build a new public candidate, test real saves and retrieval in both games
across sessions, refresh release/security evidence and review matching DEV.
Nothing published. Public beta remains blocked until live acceptance and gates.
