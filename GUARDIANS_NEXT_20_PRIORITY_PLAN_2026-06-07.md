# Guardians Next 23 Priority Plan

Date: 2026-06-07

This preserves the current step-by-step improvement queue that existed before
the Watch/Rival enablement pivot. It remains the carried-forward gameplay and
review plan for `Galaxy Guardians`.

## Next 23

1. Add the actual compact target-selection trace artifact for the last
   `15s` before a whole-run death.
   Hope: turn vague stage-2 failure into precise decision evidence.

2. Include target chosen, target lane, player lane, intended move axis,
   urgent-shot state, and dive-threat state.
   Hope: make persona behavior explainable instead of inferred.

3. Regenerate the canonical fast whole-run with that trace.
   Hope: make the whole-run lane the main truth source for the next tune pass.

4. Use the trace to find whether Intermediate is overcommitting to formation
   targets after the first clear.
   Hope: isolate the likely stage-2 mistake pattern.

5. Test one narrow target-abandon rule for early stage-2 recovery.
   Hope: improve survival without flattening pressure.

6. Re-run the fast whole-run immediately after that change.
   Hope: keep tuning measured, not speculative.

7. Keep the change only if score, time, or stage progression improve without
   broad softening.
   Hope: avoid fake wins.

8. If it helps, refresh the watchable canonical artifact.
   Hope: keep human review synchronized with the best machine baseline.

9. If it fails, reject it quickly again.
   Hope: protect the branch from weak runtime drift.

10. Add a short per-loss "what was being chased" summary to the digest.
    Hope: improve post-run diagnosis speed.

11. Preserve stage-1 clear capability as a non-regression rule.
    Hope: avoid fixing stage 2 by breaking the opening.

12. Avoid broad attack/bullet reductions.
    Hope: preserve source-like pressure.

13. Avoid broad lane clamps unless the trace proves they are needed.
    Hope: keep fixes narrow and honest.

14. Keep the current watchable baseline as the known-good reference.
    Hope: always have a stable comparison point.

15. Once stage-2 improves, move back toward `midrun-stage-five-stress`.
    Hope: return to the strongest known gameplay bottleneck.

16. Use the same loop there: diagnose, one narrow fix, measure, keep or
    reject.
    Hope: repeat the same disciplined process deeper in the game.

17. Treat alien ship pace and missile pace as first-class conformance signals
    for every stage-five movement candidate.
    Hope: keep future changes close to Galaxian timing instead of only
    improving survival or visual activity.

18. For alien ships, report dive duration, x/y span, lower-field threat share,
    and routeability in the same candidate artifact.
    Hope: make it impossible to promote a faster or denser dive pattern that
    stops reading like a fair Galaxian attack.

19. For missiles, report enemy missile velocity, enemy missile cadence, player
    missile velocity, and single-shot cooldown whenever pressure changes.
    Hope: preserve the classic single-shot / readable bullet-speed feel while
    stage-five pressure improves.

20. Keep improving machine-readable summaries before adding more prose notes.
    Hope: make future sessions faster and more objective.

21. Move large in-use Guardians review videos into the iCloud-protected
    artifact library once their canonical/latest role is clear.
    Hope: keep expensive captures available across MacBooks without bloating
    GitHub.
    Note: use the library buckets deliberately:
    `00-temporary-throwaway`, `01-transient-in-use`, `02-documentation`,
    `03-production`.

22. Define retention rules for timestamped runs vs `latest-*` aliases and for
    private Git repo vs iCloud library placement.
    Hope: reduce evidence sprawl and make storage decisions predictable.

23. Only after gameplay improvement resumes should audio become a top lane
    again.
    Hope: keep effort aligned with the real current bottleneck.

## Immediate Reorder For The Next Session

Because the next session is meant to start on Watch and Rival work, the
execution order should be:

1. make Watch first-class for Guardians
2. keep Rival explicitly disabled but correctly capability-modeled
3. once Watch is stable, return to the stage-2 and stage-5 gameplay queue above
4. keep `stage-five-galaxian-closeness` current when touching alien movement,
   enemy missiles, player missiles, or single-shot cadence

## New Release-Blocking Platform Note

- High-score surfaces while playing `Galaxy Guardians` must be owned and labeled
  as `Galaxy Guardians`, not `Aurora Galactica`. There is a current bug where
  the high-score path can still read as Aurora-shaped during Guardians play.
  Fix this before any stronger Guardians release positioning.
