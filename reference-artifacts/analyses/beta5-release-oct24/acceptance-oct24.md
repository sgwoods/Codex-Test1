# Production Preparation And Live Account Acceptance

Date: October24,2026. Lead observed the hosted beta through Codex browser tab12.
Identity: 1.4.2-beta.5/build1218/ea779a76. No tokens or credentials captured.

## Live Results

Subsequent October24 user report: password reset completed successfully.
Recovery accepted on that human evidence; no independent observation of the
new password or credential handling. User authorized production steps1-4,
including publication conditional on final gates.

- Human signed in. SWD identity observed and persisted after reload.
- Aurora ordinary-input run ended at80/Stage1. Profile showed that latest run.
- After reload, My Scores with after-date2026-10-24 showed live2680/Stage1,
  beta5/build1218. This is the user's earlier run, not the lead's80-point run.
- Source query limits remote results to top10 before UI date filtering. The
  low80 score is not individually proven saved by this view. Do not mislabel
  the retrieval as proof of that particular write.
- Guardians ordinary-input run ended at160/Stage1. After reload, reselecting
  Guardians and opening My Scores showed "My scores live", SWD160/Stage1,
  beta5/build1218/October24. This verifies this new live save and retrieval.
- Aurora2680 was absent from displayed Guardians rows. These are separate views.
- Historical request, now superseded by the human confirmation above: User was asked to
  verify the emailed link stays on beta, presents a new-password form, and a
  subsequent sign-in with that password succeeds. Automated fixture tests are
  not substituted for that result.

## Engineering Results

Production documentation now regenerates from current source using the existing
renderers. Gameplay remains copied from accepted beta. Runtime and documentation
source identities are separate. Production notes now record approval for publication,
not a claim that production is already deployed.
The old PDF is invalidated, requiring the release pipeline's fresh PDF render.
Approval inventory is checked again by promotion and publication preflight.

Command: npm run harness:check:production-promotion-contract
All four component checks passed: approval inventory, source documentation
contract, generation with differing source identities, actual promotion fixture.
The fixture uses temporary copied beta files and substitutes machine/Git guards
only there; it is not production approval or authority-gate evidence. It proves
gameplay source preservation after allowed metadata changes, unchanged beta
contents and rejection of tampering before production output removal.

Independent read-only review identified stale runtime-commit note links.
All four link renderers were corrected. Distinct runtime/documentation identity
assertions now reject wrong links in both release pages and the project page.
Reviewer confirmed the finding resolved. No production publication occurred.

Remaining: clean source checkpoint, actual production PDF/render/package gates,
authorized publication and hosted verification. Recovery and release approval
are complete on the human evidence recorded above. The frozen accepted beta
is unchanged. Local8002 still serves the older beta4 and is not acceptance proof
for this release.
