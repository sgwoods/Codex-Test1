# White Paper Working Area

This directory holds the durable support files for the project white paper.

## Purpose

The white paper is meant to be both:

- a maintained promotional explanation of what Platinum, Aurora, Galaxy
  Guardians, ingestion, harnessing, conformance, and release discipline are
  trying to achieve
- a durable internal reminder of what the project is doing, why it is doing it,
  and how the method evolves over time

## Structure

- `../WHITE_PAPER.md`
  - current living draft
- `CITATION_LEDGER.md`
  - maintained list of outside ideas, source families, and project learnings
- `ILLUSTRATION_PLAN.md`
  - selected visuals, candidate deeper assets, and open illustration decisions
- `RELATED_WORK.md`
  - dated log of external/public work, why it matters here, and where it fits
- `REVIEWER_CHECKLIST.md`
  - release-minded checklist for HTML, PDF, narrative, and citation review
- `releases/<date>-v<version>/WHITE_PAPER.md`
  - exact snapshot of the white paper for a given release
- `releases/<date>-v<version>/WHITE_PAPER.pdf`
  - printable/exportable snapshot for that white-paper release when available
- `releases/<date>-v<version>/WHITE_PAPER_PDF_METADATA.json`
  - version/date/build metadata for the release PDF snapshot when available
- `releases/<date>-v<version>/RELEASE_NOTES.md`
  - short explanation of what changed in that white paper release

## Maintenance Rules

- Update `../WHITE_PAPER.md` directly while shaping the next narrative draft.
- Cut a new snapshot when the white paper changes in a strategically meaningful
  way.
- Prefer one snapshot per meaningful narrative release rather than one snapshot
  per tiny wording edit.
- When cutting a snapshot, preserve the Markdown, the generated PDF, and the
  PDF metadata together whenever the release PDF exists.
- Keep the citation ledger current whenever outside work, source material, or
  methodological influences materially shape the paper.
- Keep the illustration plan current whenever a new screenshot, chart, diagram,
  or hosted-detail surface becomes important to the white-paper story.
- Keep the related-work log current when a focused web refresh produces a
  source worth preserving for future readers.
- Treat HTML and PDF presentation review as part of release quality, not only as
  a late formatting pass.

## Maintained Release Surfaces

- `dist/<lane>/white-paper.html`
  - hosted readable white-paper surface for a release lane
- `dist/<lane>/white-paper.pdf`
  - printable/exportable white-paper surface for a release lane
- `dist/<lane>/white-paper-pdf.json`
  - version, date-updated, lane, and build metadata for the generated PDF

## Suggested Review Commands

- `npm run white-paper:review`
  - refresh the dev-lane PDF, reviewer packet, review gate, and presentation
    checks together
- `npm run white-paper:review:beta`
  - run the same white-paper review spine for the beta lane
- `npm run white-paper:review:production`
  - run the same white-paper review spine for the production lane

## Suggested White Paper Release Triggers

- major public release family change
- major conformance-program reframing
- significant Galaxy Guardians maturity change
- meaningful new evidence or economics story
- recovery of an important prior assessment or external citation

## Current Snapshot

The first seeded snapshot is:

- `releases/2026-05-16-v0.1.0/`

This establishes the initial narrative baseline, the release structure, and the
citation ledger.
