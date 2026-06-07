# Artifact Policy

This project has four distinct artifact locations. Treating them as separate on purpose avoids the recurring confusion between player exports, browser-local replay state, developer review archives, and curated evidence packs.

## Policy

### 1. In-Game Player Replay State

This is the browser-native replay feature used by a player who launches the game in-browser with no extra setup.

- Storage:
  - browser-local `IndexedDB`
- Contents:
  - recent replay metadata
  - recent replay video blobs used by the in-game `🎞` replay surface
- Scope:
  - local to that browser/profile on that device
  - not intended as the canonical developer artifact archive

This is the right default for `dev`, `beta`, and `production` player use because it requires no filesystem access and works inside normal browser constraints.

### Replay Storage Security Rule

Replay video remains browser-local `IndexedDB` by default. A local score row may
link to a local replay only when that replay exists in the current browser
profile. It is not a public cloud artifact, and it must not be treated as a
trusted hosted replay/video record.

Future high-score video or replay publishing requires a server-owned upload
policy before any runtime upload path is enabled. That policy must document
authorization, Supabase grants/RLS or storage rules, moderation/status fields,
and the score/user/build linkage before release.

Short rule: no hosted replay/video posting ships without a server-owned upload policy.

### 2. Exported Player Capture Files

This is the explicit user-facing export path for logs and downloaded recordings.

- Current filenames:
  - `neo-galaga-session-*.json`
  - `neo-galaga-video-*.webm`
- Destination:
  - the browser download location
  - typically the user’s downloads directory
  - on macOS that is usually:
    - `~/Downloads/`

This folder is an inbox, not the long-term developer archive.

If exported files need to survive a machine switch before import, the approved
shared inbox is:

- `~/Library/Mobile Documents/com~apple~CloudDocs/Projects/Codex-Test1 Artifact Library/00-temporary-throwaway/browser-export-inbox/`

This is the correct export destination for `dev`, `beta`, and `production` because the browser controls download placement. The game should not promise a repo-local path for player-triggered downloads.

Create that shared inbox explicitly with:

```bash
npm run artifacts:prepare:import-inbox
```

`npm run machine:bootstrap` now runs the same setup step automatically.

### 3. Canonical Developer Review Archive

This is the normalized artifact tree used by the harness, analyzer, and log viewer.

- Root:
  - `<workspace>/harness-artifacts/`
- Review-ready run folders should include:
  - `summary.json`
  - `neo-galaga-session-*.json`
  - `neo-galaga-video-*.review.webm` when available

This is the source of truth for:

- log viewer inspection
- synchronized event/video review
- harness analysis
- tuning reports
- durable review evidence inside the repo workspace

### 4. Promoted Reference / Gameplay Evidence Packs

This is the curated evidence layer used for durable quality and conformance
decisions.

- Root:
  - `<workspace>/reference-artifacts/analyses/`
- Examples:
  - `reference-artifacts/analyses/correspondence/`
  - `reference-artifacts/analyses/quality-conformance/`
  - `reference-artifacts/analyses/aurora-level-expansion-cycle/`
- Contents may include:
  - source manifests
  - reviewed event logs
  - semantic traces
  - still frames and contact sheets
  - audio-cue timelines or waveform notes
  - harness target notes
  - selected raw run folders only when the run itself is part of the evidence
    record

Promoted evidence packs are the right place for information that should support:

- release quality assessment
- reference conformance scoring
- level-by-level expansion planning
- improved player profile modeling
- future simulated play and Player 2 behavior
- future game ingestion workflows

Raw harness `runs/` directories under a promoted evidence pack are local capture
staging by default and are ignored unless deliberately retained. Keep a raw run
in git only when it is linked from a manifest, README, dashboard, or issue and
has a clear quality/conformance purpose.

Promoted conformance evidence must also be visible to readers. When an artifact
family becomes part of release reasoning, link it from a generated documentation
surface by updating the relevant maintained source: `GAME_CONFORMANCE_CATALOG.md`,
`REFERENCE_MEDIA_INVENTORY.md`, `RELEASE_CONFORMANCE_DASHBOARD.md`,
`CONFORMANCE_ECONOMICS.md`, or the guide manifests. The publish preflight checks
the generated lane docs and dashboard data for the currently required artifact
families, so evidence should not remain only in a local folder.

## Formal Workflow

### Dev

1. Prepare the shared import inbox if this machine has not done it yet:
   ```bash
   npm run artifacts:prepare:import-inbox
   ```
   `npm run machine:bootstrap` now performs this automatically.
2. Player-triggered exports download through the browser into the user’s downloads location.
3. If the run should become a durable review artifact, import it into:
   - `<workspace>/harness-artifacts/`
4. Use:
   ```bash
   npm run harness:import-latest
   ```
   That command now searches the default import inboxes in order:
   - `~/Downloads/`
   - `~/Library/Mobile Documents/com~apple~CloudDocs/Projects/Codex-Test1 Artifact Library/00-temporary-throwaway/browser-export-inbox/`
5. Review it in the viewer or analyzer from the imported run folder.
6. If the run should become release or conformance evidence, promote only the
   reviewed outputs into `reference-artifacts/analyses/` and link them from an
   inventory, dashboard, scorecard, generated guide section, or issue.
7. Run `npm run build` before release checks so the generated user-visible docs
   include the updated explanation.

### Evidence Cycles

Deterministic evidence cycles may write local raw runs while generating curated
outputs.

For Aurora level expansion:

```bash
npm run build
npm run harness:cycle:aurora-evidence-windows
npm run harness:build:evidence-cycle-dashboard
npm run harness:check:evidence-cycle-dashboard
```

The promoted artifact home is:

```text
reference-artifacts/analyses/aurora-level-expansion-cycle/
```

The dashboard home is:

```text
reference-artifacts/analyses/evidence-cycle-dashboard/
```

### Beta / Production

1. In-game replay uses browser-local replay storage.
2. Explicit exports still go to the browser download location.
3. If we want a run to enter developer review, we import that exported pair
   into `<workspace>/harness-artifacts/` on a dev machine.
4. If the pair will not be imported immediately, move it from the browser
   download location into the shared iCloud browser-export inbox rather than
   leaving it only in a personal Downloads folder.

There is no separate filesystem export location for `beta` or `production`.

- `dev`: replay lives in browser storage, exports go to browser downloads
- `beta`: replay lives in browser storage, exports go to browser downloads
- `production`: replay lives in browser storage, exports go to browser downloads

## Non-Goals

- `dist/dev/`, `dist/beta/`, and `dist/production/` are not runtime capture archives.
- `export.mov.png` is a build snapshot artifact, not a session/replay artifact.
- The game should not imply that exported logs/videos automatically land in `<workspace>/harness-artifacts/`.
- Raw local `runs/` folders are not automatically release evidence. They become
  evidence only after promotion, review, and linkage from an index or manifest.

## Source of Truth

Going forward, use this distinction:

- `IndexedDB` = native local replay feature for players
- browser download directory or shared browser-export inbox = exported log/video files waiting for import
- `<workspace>/harness-artifacts/` = canonical developer review archive after import/normalization
- `<workspace>/reference-artifacts/analyses/` = curated evidence packs for
  quality, conformance, player-profile, and future-game research

If documentation or UI text blurs those boundaries, treat it as a documentation bug and correct it.
