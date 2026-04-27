# Evidence Cycle Dashboard

Status: `cross-game-evidence-cycle-v1`

Generated: `2026-04-27T11:56:25.025Z`

Branch: `codex/macbook-pro-gg-preview-aligned`

This dashboard is the inspectable local surface for the shared Aurora / Galaxy Guardians / future Platinum ingestion loop.

## Local Inspection

Run:

```sh
npm run build
npm run harness:build:evidence-cycle-dashboard
npm run harness:check:evidence-cycle-dashboard
python3 -m http.server 8000 --bind 127.0.0.1
```

Open:

- http://127.0.0.1:8000/dist/dev/evidence-dashboard.html
- http://127.0.0.1:8000/dist/dev/index.html

## Current Counts

- Aurora planned windows: 4
- Aurora waveform windows: 2
- Galaxian promoted windows: 6
- Galaxy Guardians semantic events: 9

## Generated Files

- `reference-artifacts/analyses/evidence-cycle-dashboard/evidence-cycle-dashboard.json`
- `dist/dev/evidence-dashboard.json`
- `dist/dev/evidence-dashboard.html`
