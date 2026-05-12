# Persona Performance Distribution

This artifact summarizes repeated seeded full-run gameplay for the generic Platinum persona vocabulary. The personas are platform-level test players; each game maps those personas onto game-owned scenarios and success criteria.

Generated: `2026-05-12T12:34:45.552Z`
Source batch: `harness-artifacts/batch-distribution-2026-05-12T11-25-22-111Z`

## Summary

| Persona | Runs | Score avg/median | Stage avg/median | Time avg | Score/min avg | Losses avg | Challenge hit avg |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Beginner (novice) | 30 | 14201 / 16005 | 3.7 / 4 | 1.39 min | 9840 | 2.93 | 56.4% |
| Intermediate (advanced) | 30 | 20868 / 21205 | 4.33 / 5 | 1.6 min | 12011 | 3.27 | 61.3% |
| Expert (expert) | 30 | 41090 / 40885 | 6.87 / 6 | 2.51 min | 16351 | 3.27 | 97.2% |
| Professional (professional) | 30 | 42944 / 40915 | 6.33 / 6 | 2.26 min | 19227 | 3.73 | 98.0% |

## Read

- Use this as distributional evidence, not as a single perfect-play claim.
- The strongest persona should generally reach later stages and score more over the same seed count.
- If the ladder is out of order, recalibrate the persona policy or widen the seed distribution before tuning core gameplay.
- Recording evidence: session-only distribution batch; This persona distribution prioritized local CPU throughput and deterministic JSON/session logs; it should not be read as recorder audio proof.

## Chart

![Persona performance distribution](performance-lines.svg)

## Findings

- P1: Persona stage progression is out of order: Professional averaged stage 6.33, below Expert at 6.87.

