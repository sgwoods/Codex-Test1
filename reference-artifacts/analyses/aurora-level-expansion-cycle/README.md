# Aurora Level Expansion Evidence Cycle

Status: `deterministic-harness-evidence-captured`

This directory is the artifact home for Aurora's first level-by-level expansion
evidence cycle. It now contains the first deterministic local harness capture
for all four planned windows.

## Planned Windows

1. `stage-1-baseline`
2. `challenge-stage-candidate`
3. `mid-run-pressure`
4. `late-run-cleanup-or-failure`

## Captured Outputs

Each promoted window now contains:

- source manifest
- contact sheet
- still frames
- audio-cue timeline, plus a waveform capture note when browser video audio was
  unavailable
- movement / pressure trace
- reviewed observed-event log
- stage-slice note
- harness target list

## Command Shape

The reusable Aurora evidence entry point is:

```sh
npm run build
npm run harness:cycle:aurora-evidence-windows
npm run harness:build:evidence-cycle-dashboard
npm run harness:check:evidence-cycle-dashboard
```

The classic-arcade reference cycle remains the right path for external source
video ingestion. The Aurora-specific command captures local runtime evidence
directly from the harness.

## Local Chrome Note

On the MacBook cycle from 2026-04-27, Playwright/Chrome repeatedly aborted
inside the sandbox with `SIGABRT` and `kill EPERM`. Running the deterministic
Aurora evidence cycle outside the sandbox succeeded. Browser MediaRecorder
video captures still lacked reliable audio streams, so each window preserves
runtime audio-cue timing instead of claiming waveform parity.

User-provided crash log anchor:

- https://docs.google.com/document/d/1fQUfU4lzruooT2Ljpf6gj8f94fBuExGPvc0KEXBxw6k/edit?usp=sharing
