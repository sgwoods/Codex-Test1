# CSP Coverage Fix Independent Review

2026-10-12. Read ACTIVE_WORK.md/AGENT_WORKFLOW.md. Baseline cf0e7a66, lead dirty; reviewed only the current diff in tools/build/promote-beta.js and tools/build/check-security-release-gate.js. No lead edits, builds, gate execution, browser, or publication. Other existing gameplay/tool changes are outside this review.

## Verdict

Approve bounded source change for isolated package regression validation; actual regenerated package acceptance remains pending. No actionable blocker found in this diff.

Reviewed SHA-256:
- promote-beta.js: b2a647134f65ea2ee66cf7c3cb3d1fddfcb23afa5fe8f24eef28fb06ac447d21
- check-security-release-gate.js: 653aea5a91c71ced9081353af50f068f30e42ae0889e776684ffa72dca0c773b

Promotion lines178-179 add releases.html and project-overview-slides.html to the established rewriteBetaText path. That path rewrites lane identity, strips public-disallowed surfaces and calls addPublicSecurityMeta for HTML. Neither target is special-cased around existing sanitization. Existing addPublicSecurityMeta inserts before subsequent head content for the currently generated <head> shape. Future variants or existing CSP-without-referrer would still require attention; this diff does not generalize the injector.

Gate lines144-155 now selects every top-level HTML entry and requires CSP and referrer literals independently in each. It fails closed for zero HTML files, produces explicit missing-file arrays and removes the earlier cross-page/any-page success condition. Observation details/evidence are updated consistently. Nested assets HTML is deliberately outside root-only coverage; describe the result as all top-level HTML, not all package HTML.

## Required Bounded Regression Evidence

1. On the preserved prior beta e9322289 package, the new coverage check should identify releases.html and project-overview-slides.html as missing policies. Avoid writing reports into that immutable package.
2. On the newly promoted isolated beta, record exact identity and confirm checkedHtmlFiles contains both pages and all other root HTML; missingCspFiles/missingReferrerFiles empty. Verify each policy is an actual head meta element, not only matching document text, and appears before executable content.
3. A disposable negative regression removing only CSP from one root page must fail SEC-004; independently removing referrer from a different page must also fail and name it. Keeping other pages intact must not mask either omission. No root HTML should fail closed.
4. Lead syntax/diff checks and existing public artifact/static boundary checks remain necessary because the two added rewrite calls also execute standard public stripping. Reconfirm dev identity unchanged by isolated promotion; no rebuild of shared localhost is needed.

No tests were executed by this reviewer. Static source review supports the planned regression behavior, not a claim those tests passed.

## Actual Fixture And Browser Diff Follow-Up

Reviewed new tools/build/check-security-meta-coverage.js (SHA-256 3b3d3364ec6ac2c6774b654f9eac7cd9bebd6f56bec82470b74c82b0eb954b68) and current tools/harness/check-public-package-runtime.js CSP additions (SHA-256 43aedcbc307d01abcd44982727bb62be8a57a8bf993c7b2fc1a62c1fe9fa7587). No blocker found; bounded source approval includes these additions. Lead reports fixture passed; reviewer did not execute it. Actual rebuilt/promoted package evidence remains pending.

Fixture creates its own mkdtemp root, imports observeIssues without CLI execution (require.main guard verified), tests zero-page failure, and for each repaired page tests missing CSP and independently missing referrer while other pages retain both policies. It asserts named missing-file lists, eventual pass and three checked pages; finally removes only its owned temporary root. This directly catches the former any-page false pass.

Browser diff uses a separate disposable context with service workers blocked, external-origin requests aborted, WebSockets closed and nested context cleanup. For each root HTML it requires HTTP200 and actual document.head meta CSP/referrer values, checks default-src 'self' and exact referrer policy, records securityPages and fails on zero pages. This supplies the actual-element check missing from static literal scans without a broader parser refactor. It does not validate all directives, element order before script execution, HTTP headers, nested HTML or absence of page errors in this policy-only context; ordinary game-context monitors remain separate. These are limits, not a newly found blocker for the targeted missing-meta repair.

Earlier schedule-trial rejection additions visible in the full working-tree harness diff predate this CSP assignment and are not new changes accepted by this follow-up. Fresh package result should bind method hash and securityPages to the regenerated beta identity. No gameplay/package edits or broader tests were performed by this reviewer.

## Residual Limits

The checker uses literal string inclusion, not HTML parsing or CSP validation; comments/body snippets could falsely satisfy it and an empty/misplaced policy is not rejected. This pre-existing style is adequate for a bounded generated-artifact missing-policy regression only when combined with actual meta-element inspection. Policy strength is unchanged: unsafe-inline/broad media/image https allowances remain. HTTP frame-ancestors/HSTS/nosniff/Permissions-Policy and backend RLS are not established by local meta coverage. Prior security audit and exact50-audio exclusion apply to prior beta identity only; fresh package checks must bind to the new one.
