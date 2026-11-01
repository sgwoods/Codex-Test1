# Guest Input Audit

Baseline: merged PR264, `b17c5d630cd815360ee4be29ce1c2618c74502f7`.
Owner: Codex lead; independent read-only source review by Euler.

## Outcome

Historical issue249 was not reproduced in four bounded browser cases:
1100px and 390px widths, each with fresh and reloaded guest sessions.
All 24 left/right keyboard checks passed using Arrow keys, A/D and Z/C.
Each used normal Enter launch, not harness start or explicit canvas focus.
Movement magnitudes were 44.78 to 54.40 game units; released keys were empty.
No gameplay repair or issue closure is justified by these results alone.

## Evidence

- Method: `private-artifacts/guest-input-oct31/probe.js`.
- Receipt: `private-artifacts/guest-input-oct31/run-v1/summary.json`.
- Four screenshots in that output directory.
- Method SHA256: `3ca9c4a98a52153172f1f77a0568e7216bbdc7f4785a208d3b14d51d8cb1242a`.
- Frozen clean build1257, source `cb70121e`; runtime source diff to baseline is empty.
- Bundle SHA256: `e75da83616ce4e6eddb97a79e446f5e8b413d7fc4114bd1e3387ffca0884f3fe`.
- Bundle inventory unchanged after the probe. No account token was stored.
- Network isolation was installed after the helper's initial boot and before
  the measured reload/gameplay; initial boot could perform public reads.
  External requests and WebSockets were blocked during measured gameplay.
  No credentials, score submission or account mutation was used.

## Limits And Decisions

This is a local Chrome real-time keyboard smoke check, not hosted-lane,
touchscreen, authentication-transition or full-career certification.
The helper supplies local seed/test preferences, although launch uses Enter.
Static review found no guest-specific movement gate. Existing editable-target,
overlay and focus-reset behavior warrants more targeted lifecycle coverage.
Keep issue249 open; do not claim the historical root cause is established.

Next: account-panel focus to launch, blur/re-entry and settings-close sustained
movement checks. Then measure issue247 audio against archived references.
Challenge settlement remains a product/reference decision, not an automatic
scoring change. Off-machine recovery still requires an approved destination.

PR264 is merged, not deployed. Localhost8000 remains build1251 from this
checkout's dist/dev, verified through build-info and process cwd. Production
and beta are unchanged. Documentation checks passed in this cycle.
