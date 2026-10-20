# Beta.4 Local Review

Date: 2026-10-18. Status: incomplete acceptance; do not publish.

## Follow-up Result

Two subsequent exact frozen-package browser runs passed both-game natural
game-over RPC submission and fresh-browser-context profile retrieval. No page
errors occurred. The diagnostic run retained the original inputs; Guardians
advanced normally and eventually ended. Its records were Aurora 880 and
Guardians 280. This does not reproduce a persistence failure and shows that
the original timeout was not a reliable game-over prerequisite.

The revised harness records read-only progress and continues ordinary
left/right movement without firing after the initial ten seconds. The second
run also passed. It changes neither game state directly nor frozen package
bytes. The fixture provider is shared across fresh browser contexts; it is not
the live Supabase service. No deterministic or all-seed completion claim.

Primary evidence under private-artifacts/beta-candidate-scores-oct18-r2:
- browser-diagnosis/report.json and progress.json: original-input rerun.
- browser-traversal/report.json and progress.json: revised-input rerun.

All five preserved candidate inventories validated. Harness syntax and diff
checks passed. No deployment or real account mutation was performed.

## Remaining Beta Gates

1. Live signed-in completion, saved record, reload and separate-session retrieval
   for Aurora and Guardians. Confirm game separation and legacy score retention.
2. Resolve the three service_role review findings through a reviewed correction
   or supported classification; refresh the code-review evidence without bypass.
3. Integrate accepted changes on current clean main under release authority.
4. Publish matching DEV only when authorized; verify identity and hosted smoke.
5. Final beta security, auth/storage, conformance/documentation freshness,
   package identity and inventory checks. Stage the accepted freeze through the
   supported process: current dist/beta still contains the older beta.1.
   If source changes require a new candidate, preserve and revalidate it.
6. Obtain beta publication approval; publish beta only, then verify hosted build,
   smoke and file hashes. Production is outside this work.

Next player-facing outcome: scores for each game survive a fresh sign-in against
the real service. Automated fake-provider success does not close that gate.

## Earlier Attempt

- Source: 02166971875b19b7f0c41c035efab30868c179a0.
- Build: 1.4.2-beta.4+build.1209.sha.02166971.beta.
- URL: http://localhost:8002/.
- Frozen root: private-artifacts/beta-candidate-scores-oct18-r2/beta.
- Index SHA256: 3affec48a16d91bfe20d9eaa7de39bd16c805f7685b845797830cf1677447256.
- Serving receipt: private-artifacts/beta-candidate-scores-oct18-r2/serving-receipt.json.

Exact package runtime, public account boundary, and fake-provider password
recovery checks passed. Canonical preparation and PDF generation passed.
The corrected candidate includes account history refresh when the panel opens.
The first beta.4 preparation is preserved separately and is not served.

The final check-public-game-score-browser.js run exited 1. Aurora natural
game-over submission passed. Guardians did not reach the observed game-over
condition in 240 accelerated browser seconds. The later fresh-context account
retrieval assertions were not executed. This is an unresolved test outcome,
not proof of a Guardians persistence defect or a complete persistence pass.
This test used a fake provider and blocked external traffic. No live account
or score was mutated by the test.

Human SQL evidence reports 42 Aurora rows retained and zero initial Guardians
rows. It does not prove live client writes, RLS behavior or cross-session reads.

Release remains held for test diagnosis, live signed-in save/retrieval for both
games, code-review finding classification, and the existing release gates.
The review packet 2026-10-18-4a97b320 flags three service_role identifier uses.
No finding was suppressed and no release gate was bypassed.

Next: inspect Guardians launch/progression/game-over evidence in the bounded
test. Resolve the measurement or runtime defect found, then repeat the exact
package check. Player benefit: a completed run is retained under the correct
game and can be retrieved after signing in again.
