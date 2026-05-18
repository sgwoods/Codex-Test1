# White Paper Related Work Log

This log tracks external work worth preserving alongside the white paper.

It is deliberately narrower than a literature survey. The goal is to keep a
small, high-signal set of references that help explain why this project looks
the way it does.

## Working Rule

- Prefer focused, occasional searches over bulk accumulation.
- Prefer primary or close-to-primary sources when the topic is methodological.
- Record why the work matters here, not only that it exists.
- Update the main white paper only with the most relevant current items; keep
  the longer memory here.

## Current Seed Set

| Date added | Work | Relevance here | Link |
| --- | --- | --- | --- |
| `2026-05-16` | Anthropic, *Building effective agents* (`2024-12-19`) | Supports our preference for simple loops, visible evaluator structure, and avoiding ornamental agent complexity. | [Source](https://www.anthropic.com/engineering/building-effective-agents) |
| `2026-05-16` | Anthropic, *Writing effective tools for agents - with agents* (`2025-09-11`) | Closely matches our view that harnesses, scripts, and release tools are explicit contracts between model assistance and deterministic behavior. | [Source](https://www.anthropic.com/engineering/writing-tools-for-agents) |
| `2026-05-16` | Anthropic, *Demystifying evals for AI agents* (`2026-01-09`) | Reinforces our investment in evals, reruns, transcripts, graders, and narrow measurable questions. | [Source](https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents) |
| `2026-05-16` | Anthropic, *Trustworthy agents in practice* (`2026-04-09`) | Supports the idea that controls, guardrails, human review, and operator-visible release process are product concerns, not only policy concerns. | [Source](https://www.anthropic.com/engineering/building-trustworthy-agents) |
| `2026-05-17` | METR, *Measuring AI Ability to Complete Long Tasks* (`2025-03-19`) | Useful because it frames agent capability in terms of task duration and reliability, which helps explain why this project prefers small, reviewer-visible loops and local reruns over stronger autonomy claims. | [Source](https://metr.org/blog/2025-03-19-measuring-ai-ability-to-complete-long-tasks/) |
| `2026-05-17` | OpenAI, *PaperBench* (`2025-04-02`) | Useful because it shows how hard agentic work becomes more reviewable when decomposed into explicit rubrics and many gradable subtasks, which is close to how our own conformance categories make progress inspectable. | [Source](https://openai.com/index/paperbench/) |

## Refresh Triggers

- major white-paper revision
- major release-policy or conformance-process revision
- meaningful new methodological influence worth naming publicly
- significant change in the broader agent/evals/tooling conversation that bears
  directly on this project
