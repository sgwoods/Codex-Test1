# Project-Wide Workstream Alignment - 2026-06-07

This is the current cross-thread alignment note after integrating the Aurora
challenge movement grammar work, the Galaxy Guardians ingestion/conformance
cleanup, and the hosted `/dev` publish from `main`.

Use this document when choosing the next work block. The goal is to keep
Aurora, Galaxy Guardians, Platinum, personas, ingestion, documentation, and
release gates moving as one program instead of as unrelated branches.

## Current Lane State

- authoritative engineering source: `main`
- current source head: `bb997d057`
- hosted `/dev`: `1.4.0.1+build.1063.sha.bb997d057`
- hosted `/beta`: `1.4.0-beta.1+build.1013.sha.3cb0d08b.beta`
- hosted `/production`: `1.4.0+build.894.sha.1dc23d8a`
- release authority: MacBook-Pro, release-authority contract current
- hosted dev now includes the integrated Aurora challenge grammar artifacts,
  Guardians cleanup artifacts, refreshed conformance economics, public project
  guide, white paper, slides, dashboards, release-schedule spine, and
  code-review packet

No beta or production publish happened during this consolidation.

The current release-family and GitHub-issue alignment is tracked in
[RELEASE_SCHEDULE_AND_ISSUE_SPINE_2026-06-07.md](RELEASE_SCHEDULE_AND_ISSUE_SPINE_2026-06-07.md).
Use that schedule to decide whether a work block belongs to `1.4.1`, `1.4.2`,
`1.5.0`, `1.6.0`, `1.7.0`, or `2.0.0`.

## Current Measured Reality

| Area | Current Read | Meaning |
| --- | ---: | --- |
| Overall conformance/economics roll-up | `8.7/10` | The broad project scoring surface is healthy, but broad scores mask severe sub-surface gaps. |
| Application artifact conformance | `7.46/10` | The rendered/game artifact layer is useful but not yet high-fidelity. |
| Weakest artifact row | `impact-explosion-visual-feedback` | Hit, damage, explosion, and player-understanding feedback should stay near the top of the Aurora UX queue. |
| Aurora challenge set-piece current score | `4.3/10` | The challenge stages remain safe but not yet Galaga-like, learnable, or spectacular enough. |
| Aurora challenge target-video object fit | `3.6/10` | We have contracts, but runtime motion still does not match target movement closely enough. |
| Aurora challenge specialty authority | `3.2/10` | Challenge-only alien/bonus identity is still weak. |
| Aurora challenge grammar readiness | `25/25` reference-backed first-five group contracts, `8.6/10` control readiness | Ingestion and analysis are now strong enough to guide runtime work. |
| Aurora challenge motion primitives | `10` primitives, `4` high priority, release readiness `planning-only` | Runtime promotion is still blocked by visual-presence and scoreable-route constraints. |
| Guardians long-surface/persona review | `7.0/10` | Guardians now has a real internal deeper-surface review, but stage-five-plus survivability and clear consistency remain weak. |
| Guardians public readiness | still preview/disabled public capability | Guardians is not ready to be described as a fully mature public game. |
| Resource ledger | `904` runs, `58,277s` wall, `58,392s` CPU | Conformance economics are now substantial enough to guide investment choices. |

## Priority Workstreams

| Priority | Workstream | Current Status | Next Obvious Step | Hoped-For Outcome |
| ---: | --- | --- | --- | --- |
| 1 | Aurora challenge-stage gameplay | The first-five challenge grammar is reference-backed, but runtime stages still score around `4.3/10`. | Build a runtime-safe reference-spline path family with phase/order, visual-presence, spacing, and scoreable-window constraints. | Move early challenge stages from awful/safe to visibly authored, learnable, and at least acceptable. |
| 2 | Aurora hit/explosion/audio-event feedback | Application artifact scoring identifies impact/explosion feedback as the weakest row; audio is stronger procedurally than acoustically. | Treat missile impact, boss damage, enemy death, player loss, and capture/rescue feedback as one time-based event sequence instead of isolated graphics or sound cues. | Players immediately understand what happened and why; future games inherit reusable event-feedback scoring. |
| 3 | Galaxy Guardians v1 playable slice | Guardians has strong ingestion and review artifacts, but the hosted public slice remains preview-framed and not full game-state v1. | Tighten the opening `WAIT`, score-table, rack cadence, missile-ready, hit/explosion, result, score, and replay surfaces; keep public capability disabled until the slice is honest. | A minimal one-level Guardians v1 that validates Platinum with a second real game, not just a documentation preview. |
| 4 | Shared personas, Watch, and Rival modes | Aurora has richer persona/watch experience than Guardians; Guardians has whole-run persona evidence but not full platform parity. | Define a game-generic persona adapter contract: start state, playable scope, score ownership, run summary, event logs, Watch scope, Rival opponent, and safety boundaries. | Every game can be played in the background by personas, watched by users, and measured by harnesses using the same platform pattern. |
| 5 | Ingestion-to-runtime grammar | Aurora challenge grammar and Guardians source ingestion are now real evidence systems, but runtime generation is still bespoke. | Promote movement/path/event grammars into game-owned data packages with reusable analyzers and candidate loops. | New games can move from artifact ingestion to measurable runtime candidates faster and with less subjective tuning. |
| 6 | Platinum platform boundaries | Aurora runtime state isolation and pack boundaries are stronger; Guardians remains a skeleton at the adapter boundary. | Keep runtime state, replay/video capture, persona execution, music/SFX, fullscreen/cabinet presentation, score surfaces, and auth/storage rules platform-owned where possible. | Aurora improvements become reusable capabilities for Guardians and later games instead of one-off code. |
| 7 | Release, docs, and review gates | Hosted dev now enforces docs freshness, code review packet freshness, white paper PDF, slides, and dashboard assets. | Keep the project-wide alignment note and roadmap links updated after each major hosted dev/beta push. | Work is easier to resume, branch integration is less risky, and public docs explain the real state rather than the last remembered plan. |
| 8 | Third-game preparation | Windigo/Space Invaders/Galaxian-style planning exists, but the program should not overextend before two games are stable. | Keep third-game work ingestion-first: source inventory, target extraction, persona assumptions, and first playable slice definition only. | The third game benefits from the mature Aurora/Guardians pipeline instead of forcing premature platform generalization. |

## Near-Term Execution Order

1. Keep `main` and hosted `/dev` clean after the current publish.
2. Start a focused Aurora challenge-stage runtime branch from current `main`.
3. Implement the first reference-spline movement candidate with explicit
   visual-presence, phase/order, spacing, and scoreable-route gates.
4. Add a before/after stage video and contact-sheet comparison for that
   candidate so humans can judge whether it actually looks better.
5. In parallel only where low collision risk, define the shared persona/Watch
   adapter contract needed by both Aurora and Guardians.
6. Apply that contract to Guardians as the next v1 enabling step: Watch,
   whole-run persona review, score ownership, and run summary should be
   game-owned but platform-driven.
7. Tighten Guardians opening slice using the existing source-backed artifacts:
   `WAIT`, score table, rack cadence, combat feedback, top re-entry, and
   result state.
8. Refresh dashboards, conformance economics, and project docs after each
   meaningful runtime candidate, not only after successful promotions.
9. Keep beta discussion blocked until hosted `/dev` contains at least one real
   user-facing gameplay or platform-quality lift beyond documentation and
   evidence consolidation.
10. Preserve third-game work as ingestion and planning until Aurora challenge
    quality and Guardians v1 both have better runtime proof.

## Strategic Guardrails

- Do not treat high overall conformance scores as permission to ignore the
  worst rows. The current user-visible weakness is challenge-stage spectacle,
  event feedback clarity, and Guardians game completeness.
- Do not ask the model for direct gameplay tuning before improving the
  algorithmic assessment. The next useful Codex/model work should design
  analyzers, constraints, and candidate loops that local CPU/browser runs can
  execute repeatedly.
- Do not let Guardians borrow Aurora identities. Reuse Platinum infrastructure
  and harness strategies, but keep Guardians game-owned scoring, visuals,
  audio, stage arc, and release truth.
- Do not move beta for docs alone. Documentation and dashboards can justify a
  hosted `/dev` review, but beta needs an honest player-facing improvement or
  a clearly documented safety/release fix.
- Do not let third-game enthusiasm weaken the first two games. The third-game
  path should validate the ingestion framework, not interrupt the Aurora and
  Guardians quality push.

## Required Cross-Thread Checks

Run the smallest relevant set per branch, but these are the standing checks for
the current integrated work family:

```sh
npm run build
npm run review:code:check
npm run publish:check:dev
npm run harness:check:portable-paths
npm run harness:check:challenge-movement-grammar
npm run harness:check:challenge-motion-primitives
npm run harness:check:challenge-motion-spec
npm run harness:check:galaxy-guardians-0-1-candidate
npm run harness:check:galaxy-guardians-long-surface-conformance
npm run harness:check:guardians-adapter-skeleton
npm run harness:check:pack-registry-boundaries
```

Use `npm run harness:measure` for long-cycle candidate sweeps so future
planning can compare score movement against local CPU/browser and
GPU-equivalent model/API effort.
