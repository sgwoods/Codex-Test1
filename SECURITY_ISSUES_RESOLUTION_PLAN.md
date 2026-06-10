# Security Issues Resolution Plan

Updated: 2026-06-10

This is the tracked security issue list for Aurora / Platinum release gates. The structured source of truth is `security-issues.json`; this document is the readable management plan.

## Release Gate Rule

- `/production` publish must stop when a tracked security issue is open and not explicitly acknowledged in `security-issues.json`, or when an issue marked resolved is still detected in the production artifact.
- `/beta` publish should show the same issues as reminders only.
- Acknowledgement is temporary release-manager acceptance, not resolution. Resolved issues should be fixed in code/assets/config and marked `resolved`.

## Current Issues

| ID | Severity | Status | Issue | Proposed Plan |
| --- | --- | --- | --- | --- |
| SEC-001 | High | Open | Production public artifact exposes reference audio assets. | Confirm asset rights, remove private reference audio from public production/beta artifacts, keep local/dev reference provisioning private, and gate public artifacts for reference-audio paths. |
| SEC-002 | High | Open | Production bundle exposes harness and debug mutation APIs. | Strip or hard-disable harness/debug APIs in production, keep them only in dev/test lanes, and scan production bundles for harness globals and force-write flags. |
| SEC-003 | High | Open | Leaderboard write integrity depends on client-trusted score submission. | Audit Supabase RLS, prevent client-controlled verification fields, constrain writes to owner rows, and move score acceptance toward validated server-side RPC/function flow. |
| SEC-004 | Medium | Open | Hosted production lacks explicit browser security headers. | Add host-level headers where possible, or a strict meta CSP as a partial stopgap; document GitHub Pages limits if remaining on GitHub Pages. |
| SEC-005 | Medium | Open | Production build metadata exposes test pilot emails and internal release context. | Remove non-production account data and internal promotion lineage from production build artifacts; keep only public-safe release metadata. |
| SEC-006 | Medium | Open | Production bundle mixes dev, beta, and production account/test logic. | Split lane-specific controls at build time, keep production runtime minimal, and scan production bundles for dev/test-only symbols. |

## Acknowledgement Template

Use this only when a production push must proceed before a fix lands:

```json
"productionAcknowledgement": {
  "acknowledged": true,
  "acknowledgedBy": "release-manager-name",
  "acknowledgedAt": "YYYY-MM-DD",
  "expiresAt": "YYYY-MM-DD",
  "rationale": "Why production can proceed despite the open issue."
}
```

Acknowledgements should be short-lived and revisited before the next production push.
