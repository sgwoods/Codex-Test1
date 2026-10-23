# Retained Pilot and Beta Review

## October 23 Acceptance Update

Superseding decision: user accepted the documented Expert limitation for beta.
Both games' frozen beta.4 live-account checks are complete, including Guardians
1320/Stage1 after reload and in the separate Codex browser; Aurora102410/Stage13
remains separate in its displayed My Scores records. History repair commits:
882e4230 and11aa31b1. Remaining: retained persona checkpoint, release gates,
authorized dev review, exact candidate package tests and beta approval.

Aurora separate-browser account retrieval PASS by user-supplied Chrome evidence:
`aurora-chrome-my-scores-oct23.png`, My Scores selected and My scores live,
SWD 102410 / Stage13 / beta.4. Original attachment identifier:
eac37c66-7061-4c72-be2d-c790a576f28e. This closes the earlier Aurora live-account
hold below, not the Guardians hold or future exact-package validation.

Rerun this cycle: replay metadata VM, browser replay metadata/IndexedDB/profile,
public scoring fake-service contract, persona mode parity,13 rescue-policy cases,
and diff whitespace check PASS. No new skill distribution was run.

Recommended Expert disposition: keep the measured limitation explicit (6/10
at least75k; median81275), and ask the product owner whether it is acceptable
for beta. Do not declare that hold waived or promise consistent75k results.
No source checkpoint, hosted publication or live Guardians score was made.

October 22, 2026. HEAD bacb0c58 with existing local changes. Retained controller
a27c906f. No gameplay edits, integration, commit, push or publication in this step.

## 1. Divergence Review Complete

Frozen candidate remains rejected. Seed89007 first differs in recorded
nonpresentation events at61.333s, Stage2. Retained moves right to88.37;
candidate moves left to75.47 around butterfly907879216. The same early death
already occurred at56.767s. Audio events differ earlier, so presentation events
are excluded explicitly rather than called gameplay changes.

Retained obtains a Stage5 rescue at147.017s. Candidate Stage10 capture turns
hostile at300.783s, then a Stage14 rescue completes at397.617s. This identifies
lost/delayed dual-fighter opportunity, not a controlled causal explanation of
the entire35070-point loss. Shared RNG and changed progression prevent that
claim. Do not start a parameter sweep from this association.

Machine-readable extract: safety-qualification/divergence-89007.json.
Raw sessions remain in the recovery-verified safety qualification archive.

## 2. Retained Ladder Assessment Complete

Existing full-ladder panel A6c, ten seeds per persona,900seconds:

| Persona | Median | Range | Assessment |
| --- | ---: | --- | --- |
| Beginner | 7235 | 5770-37650 | Low tier; substantial overlap with Intermediate |
| Intermediate | 21995 | 2560-43220 | Higher median, weak lower tail |
| Expert | 81275 | 46960-198120 | Six of ten >=75k; not reliably at intended target |
| Professional | 240785 | 197300-356660 | Ten of ten >=150k; nine >=200k |

These are existing measurements, not a new40-run experiment. Current source
retains the accepted pilot. Freshly rerun79mode-parity and13rescue-policy cases
pass. They establish fixture-level agreement, not full browser or population
equivalence. Guardians Expert has a separate score scale and incomplete broader
ladder evidence. Guardians P2 remains unsupported. Wizard is not beta scope.

## 3. Beta Checks Can Proceed, Release Cannot

Both development and public score-persistence contract harnesses pass again.
They use a fake service. Live persistence remains unverified.

Next actions, in order:
1. Confirm a privately signed-in supported browser session on localhost8002.
2. Verify normal signed-in score save/reload/separate-session retrieval for both
   games, correct ownership and game separation. Do not create synthetic live
   leaderboard records or expose credentials.
3. Review/checkpoint retained source and evidence; resolve Expert consistency
   disposition explicitly. Do not silently waive a product hold.
4. Run release review/preflight and inspect freshness artifacts.
5. With explicit lane authority, review hosted/dev; then freeze the exact beta
   package and repeat auth, scoring, audio/settings and packaged smoke checks.
6. Publish beta only with explicit authorization and passing release gates.

Port8002 is frozen beta.4, not the latest persona build. Tests there are useful
account diagnostics but cannot approve a future package. Port8000 remains the
retained local development inspection surface.

Player benefits: preserve strong Professional play; make Expert skill credible;
ensure each game's scores survive login and reload. No new gameplay gain in
this assessment. No beta date is supported before live and package checks.
