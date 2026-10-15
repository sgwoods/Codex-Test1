# Beta CSP Repair

October 12, 2026. HEAD cf0e7a666067ede385865ba02e73d1454eb132d1 with retained dirty
gameplay baseline. No gameplay changes, publication, commit or push in this step.

## Result

PASS bounded packaging fix. Added releases.html and project-overview-slides.html
to the existing beta rewrite sequence. Both receive the existing generated CSP,
referrer policy and lane metadata transformation. The security gate now checks
each top-level HTML file instead of accepting a policy found anywhere in the
package. Missing-page names are included in SEC-004 observations.

Executed fixture test: npm run security:check:meta (also directly executed with
node). Empty package and either missing policy on each affected page are detected.
The stronger gate reports both omissions against the retained old beta package;
the repaired package has none. Browser checks inspect actual document.head meta
elements in all 13 top-level HTML pages. Normal --flows smoke passes again with
zero script errors, missing local assets or private-audio requests.

Independent source review found no bounded blocker. Its initial test-pending
qualification is superseded by runtime.json and security.json in this packet.

## Identity And Evidence

The development input remains9c320d50301a46f93f8f27bcc2f28af412b88043ba00e411f4a329c8585ef4fa.
The game index remains e932228979b5f0faa8bb5a2135f4a2f565370e81427732b97dac3220d1ccf0d3.
Only the two repaired pages changed among599 package files. Whole-package sorted
inventory digest is ee45ae7978f438b667ee30a892d29668e0581641aa0c3fc7a947a39f081051d2.
The package inventory lists per-file hashes; game-index hash alone cannot identify
this repair. Fifty private-audio hashes have zero matching package-file hashes.
No transformed/embedded-media claim follows from whole-file comparison.

Primary packages/tools/raw evidence: private-artifacts/beta-csp-oct12.
Working isolated directory: /private/tmp/aurora-beta-csp-oct12.qhAy2D.
Generated version1.4.1-beta.1/build1226 is rehearsal metadata, not a release freeze.
Actual dirty source provenance remains as documented in the earlier rehearsal.

## Limits

Scope is the shipped top-level HTML, not every nested asset/document. The gate
uses the repository's existing generated-string conventions; browser DOM checks
provide separate parsed-head coverage. Meta presence is not an injection audit
or a replacement for host security headers. Public score writes stay disabled;
backend RLS, live sign-in, audible audio and soak remain separate release checks.
