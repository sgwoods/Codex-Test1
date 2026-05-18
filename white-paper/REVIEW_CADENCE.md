# White Paper Review Cadence

This note turns the reviewer mentality into a small recurring operating rhythm
instead of leaving it as a good intention.

## Default Cadence

### On every meaningful white-paper or preserved-source change

- run `npm run white-paper:review`
- treat the result as a release-surface check, not just a PDF render

### Before `/beta` or `/production` publication

- run `npm run white-paper:review:beta` or
  `npm run white-paper:review:production`
- verify the lane carries both `white-paper.html` and `white-paper.pdf`

### During active fast-moving project periods

- do at least one focused review pass per week on:
  - white-paper clarity
  - HTML/PDF presentation
  - preserved-source integrity
  - stale path drift
  - related-work freshness

### On major narrative or methodology shifts

- consider cutting a new white-paper snapshot under `white-paper/releases/`
- refresh the citation ledger and related-work log in the same pass

## What The Review Pass Should Catch

- repeated or softened claims that can be tightened
- diagrams, tables, or screenshots that create awkward whitespace
- PDF page breaks that weaken readability
- stale machine-specific source paths in active evidence docs
- preserved-source drift that would make analysis less rerunnable
- related-work references that have gone stale or no longer feel central

## Current Review Spine

- `npm run white-paper:review`
  - refresh the dev-lane PDF
  - refresh the code-review packet
  - pass the code-review gate
  - verify the preserved-source integrity check
  - verify the hosted white-paper presentation check
