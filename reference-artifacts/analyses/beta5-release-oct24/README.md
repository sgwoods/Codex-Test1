# Beta 5 Publication And Production Checklist

Recorded October 24, 2026 by the Codex lead.

## Completed

- User approved inclusion of 24ef849c. Integrated source is ea779a76aa761a3c34d679bd519e978bddee8cf8 on main and origin/main.
- Dev: 1.4.1.6+build.1218.sha.ea779a76, hosting commit 1671c88.
- Beta: 1.4.2-beta.5+build.1218.sha.ea779a76.beta, hosting commit 54fe9e8. Only beta paths changed in that hosting commit.
- Frozen publication command completed with exit 0. Pages deployment 40108472310 was requested after stale content was detected.
- Hosted build identity, 13 public assets, browser smoke and all 600 inventory files passed verification.
- Inventory SHA256: 45a3107b2181ebd82e075dd73e8f21100a698ab83267a3b10efcd9c24f046d18.
- Production fetched after verification: 1.4.1+build.1164.sha.54398ff5, built June 11, 2026. It is unchanged.

## Evidence And Limits

The adjacent inventory.json and freeze-receipt.json were copied from
private-artifacts/beta5-oct24-qa/freeze. The freeze receipt is an immutable
pre-publication record; its published:false field is not the current status.
The adjacent latest-beta.json and latest-beta.png were copied from
harness-artifacts/hosted-lane-smoke after successful publication verification.
The publisher separately hashed all 600 hosted files against the frozen inventory.

Exact-package account boundary, mocked recovery, and both-game browser scoring
passed before publication. The scoring fixture used ordinary inputs and a fake
provider. It is not proof of a live Supabase submission. Hosted smoke observed
playerShot/gameStart audio cues, not subjective listening acceptance.
Earlier beta4 live account evidence is retained but does not certify beta5.
The additional no-mistakes review failed to authenticate with Claude; it did
not pass. Existing repository release gates and independent review were used.
Expert inconsistency remains the user-accepted beta limitation. No further
persona tuning was included in this publication cycle.

## Production Process

October 24 user follow-up: "the play is fine" on beta5. Gameplay review is
accepted. Account recovery, both-game live score save/reload and explicit
listening acceptance were not separately reported in that statement.
Live dev and beta metadata were re-fetched: source ea779a76, build1218 and
2026-10-24T15:41:12.341Z match. Dev's fourth segment is an increment counter
from production1.4.1; beta is named for target1.4.2. This is naming ambiguity,
not a source regression. Future labels should expose target release and source.

Read-only promotion audit: approve-beta.js writes build metadata and timestamp,
without an inventory digest. promote-production.js checks label and commit,
copies assets and rewrites selected HTML. It does not refresh the new source
documentation manifest. Repair and test these two contracts before approval;
do not stamp refreshed hashes over stale rendered content. No promotion was run.

1. Accept this exact hosted beta: sign-in/recovery, completed human score save
   and retrieval after reload for each game, listening, and sustained play.
   Player benefit: accounts, scores and sound work on the public release.
2. Prepare 1.4.2 production notes and update the readiness decision. Preserve
   accepted limitations and compare against production 54398ff5.
   Player benefit: changes and limitations are clear before upgrading.
3. Validate production documentation promotion. The beta source fingerprint
   must not silently become stale when production notes change. Regenerate
   appropriate production provenance with tests; do not bypass the contract.
   Bind approval to the accepted frozen beta identity and inventory.
4. Run production packaging, security, account-boundary, documentation/PDF,
   review and smoke gates on the actual production candidate. Do not invoke
   promotion merely to inspect it: promotion replaces dist/production.
5. Obtain the production release decision. Publish through the existing gate,
   then verify hosted identity, assets, scores and rollback information.

Recommendation: retain beta5 for review now. It is a production candidate,
not yet production-ready. Do not claim live deployment in documentation before
deployment occurs. No production files were published in this cycle.
