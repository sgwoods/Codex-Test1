# Release History

This folder keeps a durable record of what changed at each release line.

## Goals

- preserve the reasoning behind each release
- make it easy to understand what changed between milestones
- leave a clear place for a raw chat transcript when one is exported from the Codex app

## Structure

- one folder per release number
- each release folder should contain:
  - `SESSION_SUMMARY.md`
  - `CHAT_TRANSCRIPT.md` if a raw transcript export is available

## Policy

- every meaningful release should get a new folder
- the session summary is required
- the raw transcript is optional, but preferred when available
- subsequent releases should capture only the incremental work since the last release entry

## Current Limitation

Codex can reliably create a structured release journal from the work completed in a session, but it should not claim to have recreated a perfect verbatim transcript unless the raw chat export is explicitly added.
