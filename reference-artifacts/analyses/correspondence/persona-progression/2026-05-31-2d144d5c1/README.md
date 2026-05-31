# Persona Progression Correspondence

This artifact compares shipped local baseline and current candidate progression outcomes across persona-driven challenge and full-run evidence.

## Sources

- Profile: `tools/harness/reference-profiles/persona-progression-correspondence.json`
- Baseline root: `dist/production`
- Current root: `dist/dev`

## Summary

- Passed persona checks: 14/20
- Current progression order preserved: no
- Baseline progression order preserved: no

## Personas

### novice
- Baseline full run: stage=5, score=32940, lives=0, shipLost=4
- Current full run: stage=2, score=4570, lives=0, shipLost=3
- Baseline challenge: hitRate=0, losses=0, cleared=no
- Current challenge: hitRate=0.85, losses=0, cleared=yes
- Check challenge cleared: yes
- Check full-run stage: no
- Check full-run score: no
- Check challenge hit rate: yes
- Check challenge losses: yes

### advanced
- Baseline full run: stage=5, score=33180, lives=0, shipLost=4
- Current full run: stage=4, score=18320, lives=0, shipLost=3
- Baseline challenge: hitRate=0, losses=0, cleared=no
- Current challenge: hitRate=0.95, losses=0, cleared=yes
- Check challenge cleared: yes
- Check full-run stage: yes
- Check full-run score: no
- Check challenge hit rate: yes
- Check challenge losses: yes

### expert
- Baseline full run: stage=8, score=49500, lives=0, shipLost=2
- Current full run: stage=8, score=31900, lives=0, shipLost=3
- Baseline challenge: hitRate=0, losses=0, cleared=no
- Current challenge: hitRate=0.975, losses=0, cleared=yes
- Check challenge cleared: yes
- Check full-run stage: yes
- Check full-run score: no
- Check challenge hit rate: yes
- Check challenge losses: yes

### professional
- Baseline full run: stage=6, score=45330, lives=0, shipLost=4
- Current full run: stage=2, score=8260, lives=0, shipLost=3
- Baseline challenge: hitRate=0, losses=0, cleared=no
- Current challenge: hitRate=0.975, losses=0, cleared=yes
- Check challenge cleared: yes
- Check full-run stage: no
- Check full-run score: no
- Check challenge hit rate: yes
- Check challenge losses: yes

## Progression Order

- novice -> advanced: stage=ok, score=ok, challengeHitRate=ok
- advanced -> expert: stage=ok, score=ok, challengeHitRate=ok
- expert -> professional: stage=no, score=no, challengeHitRate=ok

## Read

- This correspondence report is about progression evidence, not exact arcade timing.
- The key question is whether stronger personas still travel farther, score better, and survive the first challenge more cleanly.
- Use this alongside stage timing, spacing, capture/rescue, and challenge timing before shaping a controlled next candidate.
