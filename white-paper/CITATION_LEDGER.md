# White Paper Citation Ledger

This ledger tracks source families, methodological influences, and outside ideas
that materially shape the project story.

The goal is not only to cite things. The goal is to record:

- what influenced the work
- how that influence showed up in the repo
- what the team learned from it
- what citation or linkage debt still remains

## Status Key

- `linked`: the reference is represented clearly enough in the repo today
- `partial`: the idea is present, but the exact earlier note, external source,
  or final public citation still needs to be recovered or tightened
- `queued`: important enough to track now, but not yet integrated well enough
  to claim as a polished citation

## Current Entries

| Reference | Kind | How we use it | What we learned | Current repo anchor | Status |
| --- | --- | --- | --- | --- | --- |
| Karpathy-style evaluator loop and earlier project assessment | conceptual / methodological | Shapes the idea that we should inspect concrete examples, improve evaluators, make small candidate changes, rerun, and study failures instead of tuning only by opinion. | Better evaluators can be as important as better runtime code. A stricter scorer can lower a score while making the project more truthful. | `PROJECT_STATE_AND_CONFORMANCE_PROGRAM.md`, `CONFORMANCE_ECONOMICS.md`, `RELEASE_NOTE_1.3.0.1_HOSTED_DEV_REVIEW.md` | `partial` |
| Galaga gameplay footage, manuals, clips, and extracted artifacts | reference corpus | Grounds Aurora timing, audio, stage cadence, visual comparison, and correspondence work in preserved material. | Manual impressions are useful, but clipped windows, event logs, and aligned audio/visual artifacts make fidelity work reviewable and reusable. | `reference-artifacts/`, `VIDEO_ALIGNMENT_PROGRAM.md`, `CORRESPONDENCE_FRAMEWORK.md` | `linked` |
| Galaxian gameplay footage and sibling-game source package | reference corpus | Grounds Galaxy Guardians in its own source lineage so the game can become a true sibling application rather than a relabeled Aurora variant. | Ingestion is most valuable when it arrives before design hardens. Second-game credibility depends on game-owned evidence, not borrowed first-game behavior. | `CLASSIC_ARCADE_INGESTION_FRAMEWORK.md`, `APPLICATIONS_ON_PLATINUM.md`, `CONFORMANCE_METRICS_OVERVIEW.md` | `linked` |
| Review packet and review-learning ledger model | operational discipline | Makes AI-assisted and fast-moving changes reviewable through durable packets, issue categories, and production dispositions. | Review value compounds when repeated findings become harnesses, release checks, or documented non-goals instead of disappearing into chat. | `CODE_REVIEW_MODEL.md`, `REVIEW_LEARNING_LEDGER.md` | `linked` |
| Local-first compute doctrine for conformance work | operating doctrine | Pushes repeated measurement into local CPU/browser harnesses while reserving model work for strategy, synthesis, evaluator design, and selected analysis. | The project becomes cheaper and more trustworthy when model assistance leaves behind committed local logic and measurable artifacts. | `CONFORMANCE_ECONOMICS.md`, `PROJECT_STATE_AND_CONFORMANCE_PROGRAM.md` | `linked` |

## Open Citation Debt

- Recover the earlier standalone Karpathy-related assessment and replace the
  current conceptual placeholder with a precise internal or external citation.
- Decide which outside frameworks deserve public-facing mention in the white
  paper versus remaining internal working influences.
- Add a compact bibliography format once the white paper is ready for wider
  circulation beyond the repo.
