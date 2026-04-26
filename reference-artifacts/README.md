# Reference Artifacts

This directory stores durable reference material used to tune the game toward original Galaga behavior and presentation.

## Structure

- `manuals/`: scanned manuals, operator guides, and extracted notes
- `clips/`: curated video clips or timing notes for direct comparison
- `images/`: screenshots or contact sheets used for composition and sprite comparison
- `analyses/release-reference-pack/`: current release-focused comparison pack
  spanning capture branches, stage transitions, Stage 4 composition, and frame
  treatment
- `analyses/challenge-stage-reference/`: reusable challenge-stage video notes
  covering non-firing bonus behavior, moving starfield, reserve-ships drawer,
  and perfect-result presentation
- `analyses/galaxian-mechanics/`: early sibling-pack mechanics archive for
  future Platinum Galaxian-family work

## Media Tooling

Reference-video extraction uses `ffmpeg` and `ffprobe`.

The normal machine setup flow installs these through Homebrew on macOS:

```bash
npm run machine:bootstrap
```

Use them for clipped windows, still frames, contact sheets, and waveform images.
If the local `ffmpeg` build does not include an overlay filter such as
`drawtext`, record contact-sheet tile cadence and subwindow timing in adjacent
metadata instead of adding another image-annotation dependency.

## Storage Policy

- Source documents that are reasonably sized and useful long-term can be committed here.
- Large generated derivatives such as page renders, contact sheets, and temporary analysis output should stay local unless they become broadly useful.
- When adding a new artifact, include a short README nearby explaining why it matters.
