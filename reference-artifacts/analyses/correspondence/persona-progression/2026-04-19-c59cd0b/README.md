# Persona Progression Correspondence

This artifact compares shipped local baseline and current candidate progression outcomes across persona-driven challenge and full-run evidence.

## Sources

- Profile: `tools/harness/reference-profiles/persona-progression-correspondence.json`
- Baseline root: `dist/production`
- Current root: `dist/dev`

## Summary

- Passed persona checks: 20/20
- Current progression order preserved: no
- Baseline progression order preserved: yes

## Personas

### novice
- Baseline full run: stage=2, score=6830, lives=0, shipLost=3
- Current full run: stage=3, score=13400, lives=0, shipLost=3
- Baseline challenge: hitRate=0.875, losses=0, cleared=yes
- Current challenge: hitRate=0.875, losses=0, cleared=yes
- Check challenge cleared: yes
- Check full-run stage: yes
- Check full-run score: yes
- Check challenge hit rate: yes
- Check challenge losses: yes

### advanced
- Baseline full run: stage=2, score=7060, lives=0, shipLost=3
- Current full run: stage=6, score=39300, lives=0, shipLost=3
- Baseline challenge: hitRate=1, losses=0, cleared=yes
- Current challenge: hitRate=1, losses=0, cleared=yes
- Check challenge cleared: yes
- Check full-run stage: yes
- Check full-run score: yes
- Check challenge hit rate: yes
- Check challenge losses: yes

### expert
- Baseline full run: stage=2, score=8310, lives=0, shipLost=3
- Current full run: stage=6, score=42120, lives=0, shipLost=3
- Baseline challenge: hitRate=1, losses=0, cleared=yes
- Current challenge: hitRate=1, losses=0, cleared=yes
- Check challenge cleared: yes
- Check full-run stage: yes
- Check full-run score: yes
- Check challenge hit rate: yes
- Check challenge losses: yes

### professional
- Baseline full run: stage=5, score=37210, lives=0, shipLost=4
- Current full run: stage=5, score=32570, lives=0, shipLost=4
- Baseline challenge: hitRate=1, losses=0, cleared=yes
- Current challenge: hitRate=1, losses=0, cleared=yes
- Check challenge cleared: yes
- Check full-run stage: yes
- Check full-run score: yes
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

