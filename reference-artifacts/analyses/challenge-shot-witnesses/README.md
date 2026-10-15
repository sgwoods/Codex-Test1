# Runtime Shot Witness Packet

October4,2026. Baseline97513dcd/build1211, unchanged gameplay. Actual Space-key
shots in Stage31, seed9131, full40-target board and interception logic retained.
Every trial verifies a fresh0score/0clock/40-target launch, one single-ship bullet,
resolved bullet before timeout and a valid initial target ID for every kill.
No player/enemy positions assigned. Input updates at60Hz.

Accepted measurement runs:
- 2026-10-04T16-49-31-696Z-97513dcd:61 center-column trials.
- 2026-10-04T16-50-36-672Z-97513dcd:61 after20ticks normal left input.
- 2026-10-04T16-50-58-134Z-97513dcd:61 after20ticks normal right input.

Green target lanes1/3/4/5/6/7 have center witnesses. Left input adds lanes0/2.
Together all8 green targets have actual single-shot witnesses. Example lane7
shots nominally8.5/8.6/8.7s; actual shot event time is the next simulation tick.
Do not infer continuous windows between0.1s samples or combine independent
successes into a perfect route. Earlier kills alter interception. Only one stage,
one seed and three sampled firing columns; not all40-target feasibility.

Input precision/tap handling uses wall-clock time despite controlled simulation.
Compare actual recorded shot X and events, not movement-option name alone.
Launches are human-controlled developer harness launches, not public UI flows.
Reports retain measured build/bundle/method identities; initial16-48-13 run
predates strict projectile/kill-identity assertions and is exploratory only.
Failed preliminary runs wrote no accepted reports; corrected harness restart
semantics are enforced before every trial. Independent source review passed
after adding explicit single-bullet, kill identity and timing limitations.

## Player Benefit And Next Work

This measurement protects real chances to hit the green group during a repair;
it does not itself improve gameplay. Next compare continuous-exit candidates
against these witnesses and per-target visibility, then validate successful
movement/fire sequences together. Intended improvement: smooth, readable aliens
without removing legitimate shots or visibly crossing through the player's ship.
Do not accept weaker play merely to remove the teleport.

Second bounded check this cycle: harness:check:game-over-submit-restart passes
on build1211. It mocks score-submit failure and verifies restart clears pending
submission; not live auth/backend or complete packaged restart acceptance.
Player benefit is protection against a failed score post disrupting another run.
No gameplay change, professional sweep, push or publication.
