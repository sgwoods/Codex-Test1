# Strategic Beta Review

Updated: May 11, 2026

This is the maintained expert assessment for whether the project is on track
near-term and long-term before or after a major hosted `/beta` push. It is
written from the combined perspective of:

- an AI-forward software developer using Codex as a planning, coding, and
  synthesis partner
- a platform engineer protecting Platinum as a reusable host
- a game-conformance lead protecting Aurora, Galaxy Guardians, ingestion, and
  future games as separate but related workstreams

## Trigger

Refresh this review after every major hosted `/beta` push and before any
production promotion that claims a meaningful conformance step. Also refresh it
when a new game enters the serious ingestion path or when the conformance
economics change the recommended investment order.

The review should answer:

| Question | Why it matters |
| --- | --- |
| What player-visible improvement justifies this candidate? | Prevents release motion from becoming process motion. |
| Are the public docs, dashboard, and runtime evidence aligned? | Keeps the project story auditable and human-readable. |
| Are we improving reusable ingestion/platform capability, not only tuning one game? | Protects the long-term multi-game goal. |
| Are local CPU/browser, Codex, OpenAI/API, and artifact costs proportional to conformance gain? | Keeps the project honest about value versus compute spend. |
| Are current high scores, `10/10` rows, or proxy metrics hiding user-visible gaps? | Prevents metric comfort from replacing game feel. |

## Current Assessment

Use the hosted `1.3.0.1` `/dev` lane as the current beta-readiness review
package. It is now a real review increment, not just a future plan. If the
bundle is accepted, the beta publish should be requested from `imacm1 /
iMacM1`, which currently holds release authority. Keep the next larger beta
family centered on `1.4.0` arcade depth.

Current strengths:

- The strategy is sound: Codex/model reasoning designs better local harnesses,
  while local CPU/browser loops perform repeatable measurement.
- The release lane model is disciplined: `/dev`, `/beta`, and `/production`
  have distinct meanings and release authority is explicit.
- Aurora now has first-class conformance categories for audio, level arc,
  alien entry/challenge novelty, boss/formation grammar, visual look, and
  resource economics.
- Galaxy Guardians is correctly framed as a preview/ingestion proof rather
  than a shipped second game.

Current risks:

- Documentation freshness is a release risk. Game sections, audio cue windows,
  and public-page summaries can drift from runtime contracts unless checked.
- The overall `9.2/10` quality score can obscure player-visible gaps in audio
  identity, challenge-stage arrival authenticity, start/wait-mode polish,
  explosion feedback, and visual style.
- Audio conformance has consumed the largest measured local compute spend while
  the runtime score remains the weakest high-value category at `7.3/10`; the
  latest ship-loss promotion is a real user-visible lift, but the next audio
  work should still attack calibrated event gaps rather than simply sweeping
  more pleasant candidates.
- GPU-equivalent accounting is conceptually correct but still under-instruments
  Codex/model effort. Treat missing model usage as accounting debt, not proof
  that cloud/model compute was irrelevant.

## Beta-Readiness Standard

A beta candidate should have:

1. One coherent player-visible improvement bundle beyond hosted-dev parity.
2. A refreshed conformance dashboard and economics report.
3. User-visible docs that explain the improvement, current gaps, evidence,
   cost, and next investment.
4. No stale runtime-vs-doc cue contract mismatches.
5. Clear separation between Platinum platform capability, Aurora game-owned
   behavior, Galaxy Guardians preview status, and the ingestion framework.

## Next Recommended Investment

Before the next conformance compute cycle, finish the beta-request readiness
sprint:

- keep the detailed `1.3.0.1` release note, public project page, application
  guide, release dashboard, scorecards, and project guide aligned
- confirm `npm run build`, documentation freshness, and publish preflight are
  green from the source repo
- preserve the beta handoff rule: MacBook may prepare and push source/dev
  review work, but `imacm1` must perform beta publish unless authority changes
- record any docs/dashboard suggestions that are not part of the beta bundle as
  explicit next-plan items

Then return to the highest-value user experience work:

- audio/event feedback if the goal is immediate feel improvement
- alien/challenge-stage arrival and novelty if the goal is the strongest
  `1.4.0` arcade-depth story

## Maintenance Rule

Each major beta push should add a short dated entry below summarizing:

- candidate version and lane
- player-visible claim
- conformance scores and confidence changes
- local CPU/browser spend and GPU-equivalent spend
- documentation/dashboard freshness result
- strategic recommendation: proceed, hold, or redirect

## Review Log

| Date | Candidate / lane | Recommendation | Reason |
| --- | --- | --- | --- |
| May 11, 2026 | Hosted `/dev` `1.3.0.1` review line | Prepare beta request, authority-gated | Overall quality is `9.2/10`; audio is up to `7.3/10` with a measured ship-loss cue lift, dashboard/docs/economics are now part of the candidate story, and remaining gaps are understood enough to request a beta publish from `imacm1` if the review accepts the bundle. |
| May 10, 2026 | Local `1.3.0.1` dev-review preparation | Hold beta; continue hosted-dev and conformance work | Audio remains `7.1/10`, alien/challenge novelty and visual/event feedback remain player-visible gaps, and docs needed freshness checks before a serious beta claim. |
