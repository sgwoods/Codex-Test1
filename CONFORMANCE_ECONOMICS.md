# Conformance Economics And Resource Usage

This is the project section for tracking how Aurora / Platinum conformance improves relative to the resources spent to get there. It is intentionally local-first: we want the MacBook CPU/browser harnesses to carry as much measurement and iteration as possible, while Codex/OpenAI model work is used for strategy, harness design, code generation, interpretation, and selected higher-value analysis.

Generated: `2026-05-09T11:50:49.395Z`
Latest artifact: `reference-artifacts/analyses/conformance-economics/2026-05-09-3dd22262/report.json`

## Current Local-Vs-Cloud Read

| Read | Current value | Interpretation |
| --- | --- | --- |
| Overall quality | 9.1/10 | Current release-quality conformance roll-up. |
| Level arc | 8.4/10 | Current long-play/gameplay-shape roll-up. |
| Measured runs | 190 | Commands or manual entries logged in the economics ledger. |
| Local CPU tracked wall | 99.8 min | Main measured engine for harness execution, report generation, waveform/spectral work, and scoring. |
| Browser-backed local wall | 96.4 min | Subset of local work that exercised Chromium/gameplay runtime. |
| GPU-equivalent tracked wall | 0.8 min | Declared Codex/model/API/GPU usage. This is currently small and under-instrumented. |
| GPU-equivalent share | 0.8% | Approximate declared cloud/model share of tracked wall time. |
| Artifact growth | 378.7 MB | Evidence volume and review/storage-cost proxy. |

The important read today: measured conformance advancement is overwhelmingly local CPU/browser driven. Codex and OpenAI model work are essential for reasoning, implementation, and synthesis, but the repository ledger currently records only a small fraction of that cloud-side work. We should keep pushing computation into reusable local harnesses whenever possible and explicitly log Codex/model/API assistance as `gpu-equivalent` when it materially drives a work cycle.

## Resource Spend

| Resource class | Measured runs | Wall time | CPU time | Share of tracked wall |
| --- | --- | --- | --- | --- |
| cpu | 189 | 99.8 min | 168.4 min | 100% |
| browser | 123 | 96.4 min | 164.5 min | 96.6% |
| gpu-equivalent | 7 | 0.8 min | 1.2 min | 0.8% |
| codex | 6 | 0.7 min | 1.2 min | 0.7% |
| gpu | 1 | 0.1 min | 0.1 min | 0.1% |
| model-api | 1 | 0 min | 0 min | 0% |

## Spend By Conformance Axis

| Axis | Measured runs | Wall time | CPU time |
| --- | --- | --- | --- |
| audio | 95 | 76.7 min | 135 min |
| conformance-economics | 90 | 21.4 min | 30.7 min |
| player-hit | 13 | 16.3 min | 29.3 min |
| audio-event-gap | 24 | 16.2 min | 29.4 min |
| audio-theme-comparison | 14 | 16.1 min | 29.3 min |
| audio-focus-candidate | 5 | 16.1 min | 29.1 min |
| conformance-loop | 65 | 15.2 min | 25.3 min |
| capture-retreat | 8 | 13.6 min | 24.5 min |
| rescue-join | 8 | 13.6 min | 24.5 min |
| capture-lifecycle | 8 | 13.6 min | 24.5 min |
| stage4-pressure | 28 | 12.8 min | 18.5 min |
| audio-reference-segmentation | 16 | 11.1 min | 19.4 min |

## Cost Per Score Movement

| Axis | Runs | Wall min | Positive score gain | Wall min / +1 score | Attribution |
| --- | --- | --- | --- | --- | --- |
| formation-boss-grammar | 2 | 0.133 | 1.5 | 0.09 | tracked-spend-and-score-movement |
| stage4-pressure | 28 | 12.824 | 10 | 1.28 | tracked-spend-and-score-movement |
| level-arc | 61 | 6.929 | 2.6 | 2.67 | tracked-spend-and-score-movement |
| audio | 95 | 76.745 | 4 | 19.19 | tracked-spend-and-score-movement |
| movement | 0 | 0 | 6.8 | n/a | historical-score-movement-without-tracked-spend |
| stage1-timing | 0 | 0 | 6.4 | n/a | historical-score-movement-without-tracked-spend |
| challenge-timing | 0 | 0 | 5.7 | n/a | historical-score-movement-without-tracked-spend |
| long-run-non-repetition | 0 | 0 | 2.5 | n/a | historical-score-movement-without-tracked-spend |
| overall-quality | 0 | 0 | 2.4 | n/a | historical-score-movement-without-tracked-spend |
| movement-grammar-expansion | 0 | 0 | 2.1 | n/a | historical-score-movement-without-tracked-spend |
| stage-distinctiveness | 0 | 0 | 1.9 | n/a | historical-score-movement-without-tracked-spend |
| pressure-curve-over-time | 0 | 0 | 1.3 | n/a | historical-score-movement-without-tracked-spend |

## Charts

![Conformance score trends](reference-artifacts/analyses/conformance-economics/2026-05-09-3dd22262/score-trends.svg)

![Largest score deltas](reference-artifacts/analyses/conformance-economics/2026-05-09-3dd22262/largest-score-deltas.svg)

![Compute minutes by resource](reference-artifacts/analyses/conformance-economics/2026-05-09-3dd22262/compute-minutes-by-resource.svg)

![Cost per positive score point](reference-artifacts/analyses/conformance-economics/2026-05-09-3dd22262/cost-per-positive-score-point.svg)

## Codex / OpenAI Accounting

- Latest Codex quota snapshot: 2026-05-08T17:14:03.471Z
- General 5h left: 92%
- General weekly left: 86%
- Model 5h left: 100%
- Model weekly left: 100%

| Cloud/model measure | Current logged value |
| --- | --- |
| Codex resource runs | 6 |
| Model/API resource runs | 1 |
| GPU-equivalent resource runs | 7 |
| Declared model calls | 0 |
| Declared input tokens | 0 |
| Declared output tokens | 0 |
| Declared model minutes | 0 |

Current limitation: Codex conversation usage is not automatically visible to the repo. The project can track manual snapshots and declared model/API usage, but it cannot infer all cloud GPU use from a chat session unless we log it. Treat missing Codex/model entries as accounting debt, not proof that no model compute was used.

## Local-First Doctrine

- Prefer repeatable local CPU/browser harnesses for long-cycle assessment, sweeps, scoring, and regression checks.
- Use Codex/OpenAI model work to design better measurements, write harness logic, interpret failures, summarize tradeoffs, and choose high-value next investments.
- Convert model insight into persisted local logic whenever possible: new scorers, event extractors, dashboards, candidate loops, and artifact reports.
- Track model/API/Codex help as `gpu-equivalent` when it materially changes the plan, creates a harness, reviews evidence, or performs nontrivial analysis.
- Separate gameplay-facing gains from measurement-facing gains. A better scorer may not move the game score immediately, but it can reduce the cost of every future decision.

## How To Measure Future Work

Wrap meaningful local commands with the economics ledger:

```sh
npm run harness:measure -- \
  --axis audio \
  --resource cpu \
  --resource browser \
  --notes "audio cue segmentation sweep" \
  -- npm run harness:analyze:aurora-audio-event-gap
```

Log Codex/model/API-only work without storing prompts, secrets, or private transcript content:

```sh
npm run harness:measure -- \
  --manual \
  --axis audio \
  --resource codex \
  --resource model-api \
  --model-provider openai \
  --model gpt-5.3-codex \
  --model-minutes 30 \
  --notes "model-assisted cue-window review and harness design"
```

If the Codex app usage screen is consulted, record only quota percentages and reset dates:

```sh
npm run harness:measure -- \
  --manual \
  --axis conformance-planning \
  --resource codex \
  --codex-usage-5h-left-percent 92 \
  --codex-usage-week-left-percent 86 \
  --codex-model-5h-left-percent 100 \
  --codex-model-week-left-percent 100 \
  --usage-reset "2026-05-08 15:52" \
  --weekly-reset "2026-05-11" \
  --notes "quota snapshot before long conformance planning cycle"
```

## Release Documentation Rule

Before a serious `/dev`, `/beta`, or `/production` candidate, refresh:

```sh
npm run harness:analyze:conformance-economics
npm run harness:build:release-conformance-dashboard
npm run harness:build:dev-conformance-dashboard
```

The release record should include conformance score movement, local CPU/browser spend, GPU/model/API spend where declared, artifact volume, confidence/resolution, and the highest-value next resource investment.