# White Paper Reviewer Checklist

This checklist is meant to make the reviewer mentality explicit.

The white paper is part of the release surface. It should be reviewed with the
same seriousness as other user-visible documentation and release artifacts.

## Core Stance

- Read as a reviewer, not as the author.
- Prefer tighter and clearer over longer and more complete.
- Challenge repetition, overclaiming, weak evidence links, and vague diagrams.
- Treat HTML presentation, PDF presentation, and narrative quality as one
  release concern.

## Narrative Review

- Is the thesis clear in the first page?
- Does each section earn its length?
- Are repeated ideas tightened rather than restated?
- Are claims linked to evidence, docs, or clearly named future work?
- Does the paper stay readable for a broad technical or builder audience?

## HTML Review

- Does the hosted page read well on desktop and mobile?
- Does the hero lead the page clearly before the supporting surfaces?
- Is the overview deck linked next to the white paper from both the
  white-paper page and the public project page?
- Are diagrams, tables, and screenshots legible without awkward empty runs?
- Do callouts render intentionally instead of leaking raw Markdown markers?
- Are deeper-detail links obvious without overwhelming the page?

## Slide Overview Review

- Does the overview deck tell the project story without requiring repo context?
- Does it reflect the current white-paper version and updated date?
- Are current conformance, ingestion, economics, review, and go-forward claims
  consistent with the white paper and dashboard artifacts?
- Are the source-artifact links useful for a reader who wants to drill down?

## PDF Review

- Does the PDF show the white-paper version and updated date clearly?
- Are page breaks reasonable around diagrams, images, tables, and callouts?
- Are any sections visually repetitive or too sparse when printed?
- Is the print styling readable and professional rather than a dark-theme dump?
- Do diagrams and screenshots stay large enough to be useful?

## Release Review

- Run `npm run white-paper:review` for the active dev draft.
- Run `npm run white-paper:review:beta` or
  `npm run white-paper:review:production` before publishing those lanes.
- Treat the review command as responsible for refreshing the code-review packet
  and passing the review gate, not only for rendering a PDF.
- Confirm the review pass also checks preserved-source integrity so active docs
  and timing/audio reference work do not drift back to stale machine paths.
- Commit the refreshed review packet before the clean-tree publish step.
- Confirm the generated PDF metadata matches the white-paper version/date.
- Confirm the generated slide metadata matches the white-paper version/date.
- Verify the live lane carries `white-paper.html`, `white-paper.pdf`,
  `project-overview-slides.html`, and `project-overview-slides.json` after
  publish.

## Related Work Review

- If outside work materially shaped the draft, is it logged?
- If a web refresh was done, are the selected items high-signal and relevant?
- Is the related-work section in the main paper still concise?
- Does the deeper log explain relevance instead of just listing links?
