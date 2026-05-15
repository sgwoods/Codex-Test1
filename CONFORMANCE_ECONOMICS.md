# Conformance Economics And Resource Usage

This is the project section for tracking how Aurora / Platinum conformance improves relative to the resources spent to get there. It is intentionally local-first: we want the MacBook CPU/browser harnesses to carry as much measurement and iteration as possible, while Codex/OpenAI model work is used for strategy, harness design, code generation, interpretation, and selected higher-value analysis.

Generated: `2026-05-15T17:48:52.457Z`
Latest artifact: `reference-artifacts/analyses/conformance-economics/2026-05-15-d43b188a/report.json`

## Current Local-Vs-Cloud Read

| Read | Current value | Interpretation |
| --- | --- | --- |
| Overall quality | 9.1/10 | Current release-quality conformance roll-up. |
| Level arc | 8.8/10 | Current long-play/gameplay-shape roll-up. |
| Measured runs | 568 | Commands or manual entries logged in the economics ledger. |
| Local CPU tracked wall | 369.6 min | Main measured engine for harness execution, report generation, waveform/spectral work, and scoring. |
| Browser-backed local wall | 240 min | Subset of local work that exercised Chromium/gameplay runtime. |
| GPU-equivalent tracked wall | 25.8 min | Declared Codex/model/API/GPU usage. This is currently small and under-instrumented. |
| GPU-equivalent share | 6.5% | Approximate declared cloud/model share of tracked wall time. |
| Artifact growth | 941.1 MB | Evidence volume and review/storage-cost proxy. |

The important read today: measured conformance advancement is overwhelmingly local CPU/browser driven. Codex and OpenAI model work are essential for reasoning, implementation, and synthesis, but the repository ledger currently records only a small fraction of that cloud-side work. We should keep pushing computation into reusable local harnesses whenever possible and explicitly log Codex/model/API assistance as `gpu-equivalent` when it materially drives a work cycle.

## Resource Spend

| Resource class | Measured runs | Wall time | CPU time | Share of tracked wall |
| --- | --- | --- | --- | --- |
| cpu | 566 | 369.6 min | 654 min | 93.7% |
| browser | 213 | 240 min | 423.8 min | 60.8% |
| gpu-equivalent | 8 | 25.8 min | 1.2 min | 6.5% |
| codex | 7 | 25.7 min | 1.2 min | 6.5% |
| model-api | 2 | 25 min | 0 min | 6.3% |
| gpu | 1 | 0.1 min | 0.1 min | 0% |

## Compute Application And Impact

These tables answer the practical question behind the economics work: when we spend local CPU/browser time or GPU-equivalent model time, what kind of conformance value are we buying?

### GPU-Equivalent Use By Purpose

| GPU-equivalent purpose | Runs | Wall time | Share | Meaning |
| --- | --- | --- | --- | --- |
| Dashboard, docs, and release planning | 1 | 25 min | 97% | Moves decision quality: what to invest in next, how to explain releases, and how to keep dev/beta/prod evidence aligned. |
| Audio conformance and cue feedback | 5 | 0.7 min | 2.8% | Moves the moment-to-moment arcade feel: impact clarity, ambience identity, reward/loss feedback, and player understanding. |
| Visual and video reference analysis | 1 | 0.1 min | 0.2% | Moves graphical identity, reference inspection, contact-sheet review, sprite/surface comparison, and readability. |

### Local CPU/Browser Use By Purpose

| Local CPU/browser purpose | Runs | Wall time | Share | Meaning |
| --- | --- | --- | --- | --- |
| Audio conformance and cue feedback | 397 | 336.3 min | 91% | Moves the moment-to-moment arcade feel: impact clarity, ambience identity, reward/loss feedback, and player understanding. |
| Gameplay behavior and level complexity | 156 | 25.1 min | 6.8% | Moves player-facing pressure, stage shape, alien entry novelty, challenge-stage learning value, and long-play texture. |
| Harness, ingestion, and assessment logic | 7 | 8.1 min | 2.2% | Moves reusable automation: scorers, artifact extraction, candidate loops, measurement confidence, and future game ingestion. |
| Visual and video reference analysis | 1 | 0.1 min | 0% | Moves graphical identity, reference inspection, contact-sheet review, sprite/surface comparison, and readability. |
| Dashboard, docs, and release planning | 5 | 0 min | 0% | Moves decision quality: what to invest in next, how to explain releases, and how to keep dev/beta/prod evidence aligned. |

### Positive Score Movement By Project Area

| Project part | Positive score movement | Share | Player/designer meaning |
| --- | --- | --- | --- |
| Gameplay complexity and stage arc | +46.8 | 73.7% | Player-perceived variety, pressure, alien choreography, challenge-stage novelty, and long-play learning curve. |
| Core mechanics and control feel | +8.1 | 12.8% | Player-perceived fairness, responsiveness, collision quality, and trust in combat outcomes. |
| Audio feedback and event clarity | +5.9 | 9.3% | Player-perceived clarity from sounds that explain danger, reward, loss, and arcade identity. |
| Overall release-quality rollup | +2.7 | 4.3% | Composite release score movement that reflects several subsystems at once. |

## Spend By Conformance Axis

| Axis | Measured runs | Wall time | CPU time |
| --- | --- | --- | --- |
| audio | 292 | 227.2 min | 411.1 min |
| audio-focus-candidate | 27 | 66 min | 121.8 min |
| conformance-economics | 98 | 46.4 min | 30.7 min |
| audio-theme-comparison | 25 | 30.4 min | 56.2 min |
| player-hit | 20 | 29.5 min | 53.8 min |
| dashboard | 12 | 25.1 min | 0.1 min |
| audio-impact-reward | 1 | 23.4 min | 41.5 min |
| stage-pulse | 16 | 21.8 min | 40.6 min |
| rescue-join | 11 | 18.2 min | 33.2 min |
| audio-event-gap | 36 | 16.2 min | 29.5 min |
| unspecified | 5 | 15.6 min | 38 min |
| quality-score | 14 | 15.3 min | 17.7 min |

## Cost Per Score Movement

| Axis | Runs | Wall min | Positive score gain | Wall min / +1 score | Attribution |
| --- | --- | --- | --- | --- | --- |
| formation-boss-grammar | 3 | 0.136 | 2.5 | 0.05 | tracked-spend-and-score-movement |
| overall-quality | 2 | 2.178 | 2.7 | 0.81 | tracked-spend-and-score-movement |
| stage4-pressure | 28 | 12.824 | 10 | 1.28 | tracked-spend-and-score-movement |
| level-arc | 95 | 8.738 | 3.6 | 2.43 | tracked-spend-and-score-movement |
| audio | 292 | 227.245 | 5.9 | 38.52 | tracked-spend-and-score-movement |
| movement | 0 | 0 | 8.1 | n/a | historical-score-movement-without-tracked-spend |
| stage1-timing | 0 | 0 | 6.4 | n/a | historical-score-movement-without-tracked-spend |
| challenge-timing | 0 | 0 | 5.7 | n/a | historical-score-movement-without-tracked-spend |
| stage-signature-distance | 0 | 0 | 4.3 | n/a | historical-score-movement-without-tracked-spend |
| movement-grammar-expansion | 0 | 0 | 3.4 | n/a | historical-score-movement-without-tracked-spend |
| stage-distinctiveness | 0 | 0 | 3.3 | n/a | historical-score-movement-without-tracked-spend |
| long-run-non-repetition | 0 | 0 | 2.5 | n/a | historical-score-movement-without-tracked-spend |

## Charts

![Conformance score trends](reference-artifacts/analyses/conformance-economics/2026-05-15-d43b188a/score-trends.svg)

![Largest score deltas](reference-artifacts/analyses/conformance-economics/2026-05-15-d43b188a/largest-score-deltas.svg)

![Compute minutes by resource](reference-artifacts/analyses/conformance-economics/2026-05-15-d43b188a/compute-minutes-by-resource.svg)

![Cost per positive score point](reference-artifacts/analyses/conformance-economics/2026-05-15-d43b188a/cost-per-positive-score-point.svg)

![GPU-equivalent use by purpose](reference-artifacts/analyses/conformance-economics/2026-05-15-d43b188a/gpu-equivalent-use-by-purpose.svg)

![Local CPU use by purpose](reference-artifacts/analyses/conformance-economics/2026-05-15-d43b188a/cpu-use-by-purpose.svg)

![Gameplay improvement by project part](reference-artifacts/analyses/conformance-economics/2026-05-15-d43b188a/gameplay-improvement-by-project-part.svg)

## Codex / OpenAI Accounting

- Latest Codex quota snapshot: 2026-05-08T17:14:03.471Z
- General 5h left: 92%
- General weekly left: 86%
- Model 5h left: 100%
- Model weekly left: 100%

| Cloud/model measure | Current logged value |
| --- | --- |
| Codex resource runs | 7 |
| Model/API resource runs | 2 |
| GPU-equivalent resource runs | 8 |
| Declared model calls | 0 |
| Declared input tokens | 0 |
| Declared output tokens | 0 |
| Declared model minutes | 25 |

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