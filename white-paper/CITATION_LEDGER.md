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
| Anthropic, "Building effective agents" (2024-12-19) | external methodological reference | Reinforces the idea that agentic systems should prefer simple, composable loops and explicit evaluator structures instead of ornamental complexity. | Simpler loops become more legible when the evaluator, harness, and release artifacts are visible to reviewers. | `WHITE_PAPER.md`, `white-paper/RELATED_WORK.md`, `PROJECT_STATE_AND_CONFORMANCE_PROGRAM.md` | `linked` |
| Anthropic, "Writing effective tools for agents - with agents" (2025-09-11) | external methodological reference | Supports our view that tools are explicit contracts and that agent quality depends heavily on the quality, shape, and reviewability of those tools. | Better tools and better tool descriptions are a form of product quality, not only implementation detail. | `WHITE_PAPER.md`, `white-paper/RELATED_WORK.md`, `TESTING_AND_RELEASE_GATES.md` | `linked` |
| Anthropic, "Demystifying evals for AI agents" (2026-01-09) | external evaluation reference | Supports our investment in repeated trials, transcripts, graders, and explicit evaluation design for agent-assisted work. | Evals become more useful when they are cheap to rerun, narrow in scope, and part of the everyday engineering loop. | `WHITE_PAPER.md`, `white-paper/RELATED_WORK.md`, `CONFORMANCE_ECONOMICS.md` | `linked` |
| Anthropic, "Trustworthy agents in practice" (2026-04-09) | external governance / operations reference | Aligns with our insistence that guardrails, human review, release notes, and reviewer-visible controls are part of the product and release surface. | Trustworthiness is easier to discuss honestly when it is backed by durable checks and visible operational policy. | `WHITE_PAPER.md`, `white-paper/RELATED_WORK.md`, `RELEASE_POLICY.md`, `CODE_REVIEW_MODEL.md` | `linked` |
| METR, "Measuring AI Ability to Complete Long Tasks" (2025-03-19) | external capability/evaluation reference | Helps explain why the project prefers narrow, rerunnable loops and modest autonomy claims rather than treating all agentic work as equally reliable. | Measuring agent capability by task duration is a useful complement to benchmark-style scores and fits our local-rerun doctrine. | `WHITE_PAPER.md`, `white-paper/RELATED_WORK.md`, `CONFORMANCE_ECONOMICS.md` | `linked` |
| OpenAI, "PaperBench" (2025-04-02) | external evaluation/reference-design influence | Supports our instinct to decompose complex AI-assisted work into explicit rubrics, gradable subtasks, and reviewer-visible evidence. | Hard agentic work becomes easier to discuss honestly when the grading structure is explicit instead of implied. | `WHITE_PAPER.md`, `white-paper/RELATED_WORK.md`, `CODE_REVIEW_MODEL.md` | `linked` |
| Galaga gameplay footage, manuals, clips, and extracted artifacts | reference corpus | Grounds Aurora timing, audio, stage cadence, visual comparison, and correspondence work in preserved material. | Manual impressions are useful, but clipped windows, event logs, and aligned audio/visual artifacts make fidelity work reviewable and reusable. | `reference-artifacts/`, `VIDEO_ALIGNMENT_PROGRAM.md`, `CORRESPONDENCE_FRAMEWORK.md` | `linked` |
| Galaxian gameplay footage and sibling-game source package | reference corpus | Grounds Galaxy Guardians in its own source lineage so the game can become a true sibling application rather than a relabeled Aurora variant. | Ingestion is most valuable when it arrives before design hardens. Second-game credibility depends on game-owned evidence, not borrowed first-game behavior. | `CLASSIC_ARCADE_INGESTION_FRAMEWORK.md`, `APPLICATIONS_ON_PLATINUM.md`, `CONFORMANCE_METRICS_OVERVIEW.md` | `linked` |
| Recovered old-machine source media and representative Neo-Galaga archive | provenance / evidence discipline | Makes source recovery, historical runs, and cited reference media part of the repo-owned evidence program rather than depending on remembered old download paths. | Provenance is stronger when recovered sources have preserved-source lanes, manifests, hashes, and active-doc links instead of only intake notes. | `reference-artifacts/preserved-sources/`, `reference-artifacts/ingestion/downloads-old-all-2026-05-17/`, `WHITE_PAPER.md` | `linked` |
| Review packet and review-learning ledger model | operational discipline | Makes AI-assisted and fast-moving changes reviewable through durable packets, issue categories, and production dispositions. | Review value compounds when repeated findings become harnesses, release checks, or documented non-goals instead of disappearing into chat. | `CODE_REVIEW_MODEL.md`, `REVIEW_LEARNING_LEDGER.md` | `linked` |
| Local-first compute doctrine for conformance work | operating doctrine | Pushes repeated measurement into local CPU/browser harnesses while reserving model work for strategy, synthesis, evaluator design, and selected analysis. | The project becomes cheaper and more trustworthy when model assistance leaves behind committed local logic and measurable artifacts. | `CONFORMANCE_ECONOMICS.md`, `PROJECT_STATE_AND_CONFORMANCE_PROGRAM.md` | `linked` |

## Open Citation Debt

- Recover the earlier standalone Karpathy-related assessment and replace the
  current conceptual placeholder with a precise internal or external citation.
- Decide which outside frameworks deserve public-facing mention in the white
  paper versus remaining internal working influences.
- Keep a dated related-work refresh cadence so public references are added on
  purpose rather than only when remembered opportunistically.
