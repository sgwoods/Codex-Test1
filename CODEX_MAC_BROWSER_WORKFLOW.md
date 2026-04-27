# Codex Mac Browser Workflow

Use this workflow when developing Aurora or Platinum web/game surfaces from the
MacBook Codex app. The goal is to keep Codex browser inspection reliable without
disrupting normal user browser activity, while still preserving deterministic
Playwright harness coverage.

## Current Finding

The MacBook can run Aurora browser harnesses, but Chrome launch from a sandboxed
Codex command can fail even when the same Playwright launch works from local or
elevated execution. Treat that as a Codex execution-boundary issue, not as an
Aurora gameplay regression, after the browser doctor proves the split.

This matches the current Codex model: local commands spawned by Codex inherit the
active sandbox boundary, and macOS sandboxing uses the system Seatbelt
framework. Playwright can control either its managed Chromium builds or a
machine-installed Google Chrome, but the repo currently uses `playwright-core`
against the local Chrome binary for harness checks.

Reference material:

- OpenAI Codex sandboxing:
  https://developers.openai.com/codex/concepts/sandboxing
- OpenAI Codex app browser/computer-use announcement:
  https://openai.com/index/codex-for-almost-everything/
- Playwright browser channels and managed browser guidance:
  https://playwright.dev/docs/browsers

## Stable Two-Lane Rule

### Lane 1: Human-safe inspection

Use the Codex in-app browser for localhost inspection, screenshots, and UI
debugging. Do not use the user's visible Chrome windows for routine Codex
inspection.

Typical flow:

```bash
npm run local:resume
```

Then inspect:

```text
http://127.0.0.1:8000/dist/dev/index.html
```

or the service root:

```text
http://127.0.0.1:8000/
```

This keeps Codex visual work in its own browser surface and avoids stealing
focus from the user's active desktop browser.

### Lane 2: Deterministic harnesses

Use the repo Playwright harnesses for checks that need deterministic canvas,
audio, and event-state inspection.

Always start browser-harness debugging with:

```bash
npm run harness:doctor:browser
```

Interpretation:

- If the doctor passes inside Codex, run browser harnesses normally.
- If the doctor fails inside sandboxed Codex but passes from a normal Terminal
  or with local/elevated execution, classify it as
  `codex-sandbox-browser-launch`. Rerun only the browser harness command with
  local/elevated execution.
- If the doctor fails from a normal Terminal too, treat it as a real local
  browser installation problem. Update or reinstall Google Chrome, or set
  `AURORA_CHROME_PATH` to a working Chrome-compatible executable, then rerun
  `npm run machine:doctor`.

Example path override:

```bash
AURORA_CHROME_PATH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" npm run harness:doctor:browser
```

## Practical Session Defaults

- Use `npm run local:resume` before local browser inspection.
- Use the Codex in-app browser for visual review of localhost targets.
- Use `npm run harness:doctor:browser` before interpreting Chrome/Playwright
  failures.
- Keep browser harnesses headless unless a headed run is explicitly needed for
  debugging.
- Do not change gameplay logic based only on a sandbox-only Chrome crash.
- Record the sandbox classification in release or preview docs when it affects a
  proof run.

## Long-Term Options

The current policy is enough for Aurora development. If browser launch failures
become frequent or block automation, evaluate one of these follow-up changes:

- add a managed Playwright Chromium install path for Codex-only harness runs
- add a repo script that prints a structured browser-launch classification
- create a Codex permission profile for browser harness commands on this
  machine
- add CI coverage for the same browser harnesses outside the local Codex app

