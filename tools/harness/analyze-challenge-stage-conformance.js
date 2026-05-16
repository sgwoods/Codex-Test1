#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const { withHarnessPage } = require('./browser-check-util');

const ROOT = path.resolve(__dirname, '..', '..');
const ANALYSES = path.join(ROOT, 'reference-artifacts', 'analyses');
const OUT_ROOT = path.join(ANALYSES, 'challenge-stage-conformance');
const CHALLENGE_STAGES = [3, 7, 11, 15, 19];
const SAMPLE_TIMES = [0, 0.7, 1.4, 2.5, 4.2, 6.0];

const STAGE_INTENT = {
  3: {
    challengeNumber: 1,
    windowId: 'challenge-stage-candidate',
    expectedReferenceLabels: ['challenge-1-arrival-group-1', 'challenge-1-late-wave-group-4'],
    expectedFirstWaveTypes: ['bee', 'but'],
    forbiddenFirstWaveTypes: ['boss', 'rogue'],
    target: 'First Galaga-style challenging stage: readable bonus set piece, no fire, no ship loss, upper-band mirrored entries, bee/butterfly line waves, visible arrival/peel-off.',
    criticalExpectation: 'Should teach the player that challenge stages are safe, scoreable pattern reads rather than combat waves.'
  },
  7: {
    challengeNumber: 2,
    windowId: 'challenge-stage-scorpion-cross',
    expectedReferenceLabels: ['challenge-2-arrival-group-1'],
    target: 'Second challenge should feel denser and more novel than challenge 1 while staying nonlethal and non-shooting.',
    criticalExpectation: 'Should introduce a stronger mixed-family visual grammar and a learnable crossing pattern.'
  },
  11: {
    challengeNumber: 3,
    windowId: 'challenge-stage-stingray-hook',
    expectedReferenceLabels: ['challenge-3-arrival-group-1'],
    target: 'Third challenge should make the new visual family and boss-led novelty obvious, with larger sweep vocabulary and no attacks.',
    criticalExpectation: 'Should read as a later Galaga challenge with alien novelty and a distinct high-bonus route.'
  },
  15: {
    challengeNumber: 4,
    windowId: 'challenge-stage-boss-led-loop',
    expectedReferenceLabels: ['challenge-3-arrival-group-1'],
    target: 'Later challenge should increase set-piece complexity, boss-led grouping, path length, and visual novelty without becoming combat.',
    criticalExpectation: 'Should feel authored as a new late-game challenge, not only a faster or denser version of earlier waves.'
  },
  19: {
    challengeNumber: 5,
    windowId: 'challenge-stage-crown-split-cascade',
    expectedReferenceLabels: [],
    target: 'Very-late challenge should have a specialty cascade identity and a supported reference window before it is trusted.',
    criticalExpectation: 'Should become an explicit late-game challenge contract with its own reference contact sheet and trajectory labels.'
  }
};

function ensureDir(dir){
  fs.mkdirSync(dir, { recursive: true });
}

function readJson(file, fallback = null){
  try{
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  }catch{
    return fallback;
  }
}

function writeJson(file, value){
  ensureDir(path.dirname(file));
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
}

function writeText(file, value){
  ensureDir(path.dirname(file));
  fs.writeFileSync(file, String(value).replace(/\r\n/g, '\n').trimEnd() + '\n');
}

function rel(file){
  return path.relative(ROOT, file).split(path.sep).join('/');
}

function round(value, digits = 1){
  return Number.isFinite(+value) ? +(+value).toFixed(digits) : null;
}

function clamp(value, min = 0, max = 1){
  return Math.max(min, Math.min(max, Number.isFinite(+value) ? +value : 0));
}

function average(values){
  const finite = values.filter(value => Number.isFinite(+value)).map(Number);
  return finite.length ? finite.reduce((sum, value) => sum + value, 0) / finite.length : null;
}

function gitShortCommit(){
  try{
    return execFileSync('git', ['-C', ROOT, 'rev-parse', '--short', 'HEAD'], { encoding: 'utf8' }).trim();
  }catch{
    return 'unknown';
  }
}

function gitBranch(){
  try{
    return execFileSync('git', ['-C', ROOT, 'branch', '--show-current'], { encoding: 'utf8' }).trim();
  }catch{
    return 'unknown';
  }
}

function challengeMatches(){
  const pathFamily = readJson(path.join(ANALYSES, 'formation-boss-path-family-comparison', 'latest.json'), {});
  const matches = pathFamily?.summary?.referenceTrajectoryComparison?.matches;
  return Array.isArray(matches) ? matches.filter(match => match.challenge) : [];
}

function challengeReferenceLabels(){
  const labels = readJson(path.join(ANALYSES, 'galaga-path-reference-labels', 'latest.json'), {});
  const accepted = Array.isArray(labels.acceptedLabels) ? labels.acceptedLabels : [];
  return accepted.filter(label => label.kind === 'challengeEntry');
}

function alienVariationRead(){
  return readJson(path.join(ANALYSES, 'alien-entry-challenge-variation', 'latest.json'), {});
}

function layoutSignature(layout){
  if(!layout) return 'layout pending';
  const lanes = Array.isArray(layout.laneTypes) ? layout.laneTypes.join(', ') : 'lane types pending';
  return `${layout.id || 'unknown'} / ${layout.pathFamily || 'unknown'}; lanes ${lanes}`;
}

function familySet(firstWave){
  return Array.from(new Set((firstWave || []).map(item => item.family).filter(Boolean))).sort();
}

function typeSet(firstWave){
  return Array.from(new Set((firstWave || []).map(item => item.type).filter(Boolean))).sort();
}

function typeSequence(firstWave){
  return (firstWave || []).map(item => item.type).filter(Boolean).join(', ');
}

function distinctCount(values){
  return new Set(values.filter(Boolean)).size;
}

function groupIdentity(runtime){
  const groups = Array.isArray(runtime?.groupSignatures) ? runtime.groupSignatures : [];
  if(!groups.length){
    return {
      score10: 0,
      component: 0,
      distinctTypeSequences: 0,
      distinctPathSignatures: 0,
      groupCount: 0,
      read: 'Group identity pending; no wave signatures were captured.'
    };
  }
  const typeKeys = groups.map(group => (group.types || []).join('|'));
  const pathKeys = groups.map(group => (group.pathFamilies || []).join('|'));
  const spawnSpans = groups.map(group => +group.spawnSpan || 0).filter(Number.isFinite);
  const avgSpawnSpan = average(spawnSpans);
  const distinctTypeSequences = distinctCount(typeKeys);
  const distinctPathSignatures = distinctCount(pathKeys);
  const typeRatio = groups.length ? distinctTypeSequences / groups.length : 0;
  const pathRatio = groups.length ? distinctPathSignatures / groups.length : 0;
  const timingSpread = clamp(avgSpawnSpan / 0.5);
  const score10 = round(10 * ((0.42 * typeRatio) + (0.34 * pathRatio) + (0.24 * timingSpread)), 1);
  return {
    score10,
    component: round(clamp(score10 / 10) * 0.9, 2),
    distinctTypeSequences,
    distinctPathSignatures,
    groupCount: groups.length,
    avgSpawnSpan: round(avgSpawnSpan, 3),
    read: `${distinctTypeSequences}/${groups.length} wave type signatures and ${distinctPathSignatures}/${groups.length} path signatures; average within-wave spawn span ${round(avgSpawnSpan, 2)}s.`
  };
}

function summarizeMotion(samples){
  const populated = samples.filter(sample => sample.activeCount > 0);
  return {
    sampleCount: samples.length,
    activeSamples: populated.length,
    minActive: populated.length ? Math.min(...populated.map(sample => sample.activeCount)) : 0,
    maxActive: populated.length ? Math.max(...populated.map(sample => sample.activeCount)) : 0,
    meanActive: round(average(populated.map(sample => sample.activeCount)), 1),
    xRange: round(average(populated.map(sample => sample.xRange)), 3),
    yRange: round(average(populated.map(sample => sample.yRange)), 3),
    lowerFieldShare: round(average(populated.map(sample => sample.lowerFieldShare)), 3)
  };
}

async function runtimeProbeForStage(stage){
  return withHarnessPage({ stage, ships: 3, challenge: false, seed: 9100 + stage }, async ({ page }) => {
    return page.evaluate(({ stage, sampleTimes }) => {
      const h = window.__galagaHarness__;
      h.setupChallengeMotionProfileTest({ stage });
      const starting = h.state();
      const initialFormation = h.challengeFormationState();
      const initialFirstWave = (initialFormation.enemies || [])
        .filter(e => e.wave === 0)
        .sort((a, b) => a.lane - b.lane)
        .map(e => ({
          lane: e.lane,
          type: e.type,
          family: e.family,
          pathFamily: e.pathFamily,
          x: +(+e.x || 0).toFixed(2),
          y: +(+e.y || 0).toFixed(2),
          tm: +(+e.tm || 0).toFixed(3),
          spawnPlan: +(+e.spawnPlan || 0).toFixed(2)
        }));
      const initialGroupSignatures = Object.values((initialFormation.enemies || []).reduce((acc, e) => {
        const key = String(e.wave || 0);
        if(!acc[key]) acc[key] = { group: e.wave || 0, types: [], families: [], pathFamilies: [], spawnPlans: [] };
        acc[key].types[e.lane || 0] = e.type || '';
        acc[key].families[e.lane || 0] = e.family || '';
        acc[key].pathFamilies[e.lane || 0] = e.pathFamily || '';
        acc[key].spawnPlans.push(+e.spawnPlan || 0);
        return acc;
      }, {})).sort((a, b) => a.group - b.group).map(group => {
        const spawnPlans = group.spawnPlans.filter(Number.isFinite);
        return {
          group: group.group,
          types: group.types.filter(Boolean),
          families: Array.from(new Set(group.families.filter(Boolean))).sort(),
          pathFamilies: Array.from(new Set(group.pathFamilies.filter(Boolean))).sort(),
          spawnSpan: spawnPlans.length ? +(Math.max(...spawnPlans) - Math.min(...spawnPlans)).toFixed(3) : 0
        };
      });
      const samples = [];
      let previous = 0;
      for(const t of sampleTimes){
        const delta = Math.max(0, t - previous);
        if(delta) h.advanceFor(delta, { step: 1 / 60, stopOnGameOver: false });
        previous = t;
        const formation = h.challengeFormationState();
        const active = formation.enemies || [];
        const xs = active.map(e => +e.x).filter(Number.isFinite);
        const ys = active.map(e => +e.y).filter(Number.isFinite);
        const lowerFieldCount = active.filter(e => +e.y > 180).length;
        samples.push({
          t,
          activeCount: active.length,
          xRange: xs.length ? +(Math.max(...xs) - Math.min(...xs)).toFixed(2) : 0,
          yRange: ys.length ? +(Math.max(...ys) - Math.min(...ys)).toFixed(2) : 0,
          lowerFieldShare: active.length ? +(lowerFieldCount / active.length).toFixed(3) : 0
        });
      }
      const formation = h.challengeFormationState();
      const finalState = h.state();
      const recent = h.recentEvents({ count: 500 }) || [];
      const eventCounts = {
        enemyShots: recent.filter(e => e.type === 'enemy_shot' || e.type === 'enemy_bullet').length,
        enemyAttackStarts: recent.filter(e => e.type === 'enemy_attack_start').length,
        shipLosses: recent.filter(e => e.type === 'ship_loss' || e.type === 'player_loss').length,
        challengeContacts: recent.filter(e => e.type === 'challenge_enemy_contact').length
      };
      return {
        ok: true,
        stage,
        challengeAtStart: !!starting.challenge,
        challengeAtEnd: !!finalState.challenge,
        livesAtStart: starting.lives,
        livesAtEnd: finalState.lives,
        scoreAtEnd: finalState.score,
        layout: initialFormation.layout || formation.layout,
        initialEnemyCount: initialFormation.enemies.length,
        activeEnemyCount: formation.enemies.length,
        firstWave: initialFirstWave,
        groupSignatures: initialGroupSignatures,
        samples,
        motionSummary: samples.length ? null : {},
        eventCounts,
        ruleConformance: {
          noEnemyShots: eventCounts.enemyShots === 0,
          noAttackStarts: eventCounts.enemyAttackStarts === 0,
          noShipLosses: eventCounts.shipLosses === 0 && finalState.lives === starting.lives
        }
      };
    }, { stage, sampleTimes: SAMPLE_TIMES });
  });
}

async function collectRuntimeProbes(){
  const rows = [];
  for(const stage of CHALLENGE_STAGES){
    const probe = await runtimeProbeForStage(stage);
    probe.motionSummary = summarizeMotion(probe.samples || []);
    rows.push(probe);
  }
  return rows;
}

function stageScore(stage, runtime, match){
  const intent = STAGE_INTENT[stage];
  const bestScore = Number(match?.bestMatch?.score10 || 0);
  const bestLabel = match?.bestMatch?.labelId || '';
  const expectedHit = intent.expectedReferenceLabels.includes(bestLabel);
  const types = typeSet(runtime?.firstWave || []);
  const families = familySet(runtime?.firstWave || []);
  const safetyPass = runtime?.ruleConformance?.noEnemyShots && runtime?.ruleConformance?.noAttackStarts && runtime?.ruleConformance?.noShipLosses;
  const hasReference = !!bestLabel && (intent.expectedReferenceLabels.length > 0);
  const lateReferenceGap = stage >= 19 && !intent.expectedReferenceLabels.length;
  const base = 1.0;
  const safety = safetyPass ? 1.0 : 0;
  const trajectory = clamp(bestScore / 10) * 2.0;
  const expectedMatch = expectedHit ? 0.55 : 0;
  const typeNovelty = clamp(types.length / 4) * 1.05;
  const familyNovelty = families.some(family => family !== 'classic') ? 0.55 : 0;
  const referenceEvidence = hasReference ? 0.35 : 0;
  const latePenalty = lateReferenceGap ? -0.45 : 0;
  const group = groupIdentity(runtime);
  const expectedTypes = intent.expectedFirstWaveTypes || null;
  const forbiddenTypes = intent.forbiddenFirstWaveTypes || [];
  const lineContractHit = expectedTypes
    ? types.length > 0
      && types.every(type => expectedTypes.includes(type))
      && !types.some(type => forbiddenTypes.includes(type))
    : false;
  const adjustedTypeNovelty = expectedTypes
    ? (lineContractHit ? 1.05 : typeNovelty * 0.62)
    : typeNovelty;
  const score = clamp(base + safety + trajectory + expectedMatch + adjustedTypeNovelty + familyNovelty + referenceEvidence + group.component + latePenalty, 0, 10);
  const interest = clamp(score - (expectedHit ? 0 : 0.35), 1, 10);
  return {
    conformanceScore10: round(score, 1),
    interestingFactor10: round(interest, 1),
    scoreComponents: {
      baseline: base,
      safety,
      trajectory: round(trajectory, 2),
      expectedReferenceMatch: expectedMatch,
      alienTypeNovelty: round(adjustedTypeNovelty, 2),
      firstChallengeLineContract: lineContractHit ? 0.35 : 0,
      visualFamilyNovelty: familyNovelty,
      groupWaveIdentity: group.component,
      referenceEvidence,
      lateReferencePenalty: latePenalty
    },
    groupIdentity: group,
    expectedReferenceHit: expectedHit
  };
}

function criticalGaps(stage, runtime, match, score){
  const intent = STAGE_INTENT[stage];
  const gaps = [];
  const bestLabel = match?.bestMatch?.labelId || '';
  if(!score.expectedReferenceHit && intent.expectedReferenceLabels.length){
    gaps.push(`Best reference match is ${bestLabel || 'missing'}, not expected ${intent.expectedReferenceLabels.join(' or ')}.`);
  }
  if(stage === 3){
    const types = typeSet(runtime?.firstWave || []);
    if(types.some(type => ['boss', 'rogue'].includes(type))){
      gaps.push('First challenge still mixes boss or rogue entries into the opening lane sequence; the original first challenge reads more like a clean bonus pattern language than combat grammar.');
    }
  }
  if(stage === 7){
    gaps.push('Cross-sweep identity is visible in labels, but the measured vector still lands closest to the same challenge-2 reference as most other challenge stages.');
  }
  if(stage === 11){
    gaps.push('Dragonfly family appears, but sprite-motion novelty and tracked Galaga challenge-3 path phases are not yet scored.');
  }
  if(stage === 15){
    if(score.expectedReferenceHit){
      gaps.push('Boss-led-loop now lands on the challenge-3 reference, but late-stage reference labels and high-bonus readability probes are still thin.');
    }else{
      gaps.push('Boss-led-loop has the strongest runtime spread, yet it still best-matches challenge 2 and lacks a late-stage Galaga contact-sheet target.');
    }
  }
  if(stage === 19){
    if(match?.bestMatch?.labelId){
      gaps.push('Stage 19 now has crown-split-cascade runtime path extraction, but Galaga late-challenge reference labels and high-bonus readability probes are still missing.');
    }else{
      gaps.push('Stage 19 has a configured crown-split-cascade, but durable path extraction and Galaga late-challenge reference labels are missing.');
    }
  }
  if(!runtime?.ruleConformance?.noEnemyShots || !runtime?.ruleConformance?.noAttackStarts || !runtime?.ruleConformance?.noShipLosses){
    gaps.push('Challenge safety rule failed or was not measured in this probe.');
  }
  return gaps;
}

function nextActionsForStage(stage){
  if(stage === 3){
    return [
      'Protect the first-challenge bee/butterfly line contract, then tune path length, turn count, and rack-slot precision against challenge-1 arrival and late-wave labels.',
      'Add contact-sheet comparison for first-visible frame, entry side, exit side, lane occupancy, and group timing so the next tuning pass can improve trajectory precision without subjective guessing.'
    ];
  }
  if(stage === 7){
    return [
      'Tune challenge 2 toward the denser mixed-novelty-line reference instead of relying on a generic cross-sweep.',
      'Score separate group identities so stage 7 is not just a slightly wider stage 3.'
    ];
  }
  if(stage === 11){
    return [
      'Promote challenge-3 boss-led reference phases and score dragonfly visual novelty as animation, not only family label.',
      'Add motion windows for wing flaps, pulsing, dive/rotation silhouette, and challenge-only nonlethal arrival.'
    ];
  }
  if(stage === 15){
    return [
      'Capture or label later Galaga challenge references, then make boss-led-loop a late-stage contract with stronger exits and bonus route clarity.',
      'Add high-bonus readability probes so later challenge complexity stays learnable.'
    ];
  }
  return [
    'Promote the stage-19 evidence window into a late-challenge reference-label target before treating crown-split-cascade as conformant.',
    'Promote mosquito/crown visual novelty into runtime sprite-motion scoring.'
  ];
}

function makeStageRow(stage, runtime, match, referenceLabels){
  const intent = STAGE_INTENT[stage];
  const bestLabel = match?.bestMatch?.labelId || '';
  const referenceTarget = referenceLabels.find(label => label.labelId === bestLabel)
    || referenceLabels.find(label => intent.expectedReferenceLabels.includes(label.labelId))
    || null;
  const score = stageScore(stage, runtime, match);
  const firstWave = runtime?.firstWave || [];
  return {
    stage,
    challengeNumber: intent.challengeNumber,
    auroraWindowId: intent.windowId,
    auroraLayoutId: runtime?.layout?.id || null,
    pathFamily: runtime?.layout?.pathFamily || null,
    laneTypes: runtime?.layout?.laneTypes || [],
    runtimeFirstWaveTypes: typeSequence(firstWave),
    runtimeGroupSignatures: runtime?.groupSignatures || [],
    runtimeVisualFamilies: familySet(firstWave),
    galagaTarget: intent.target,
    criticalExpectation: intent.criticalExpectation,
    expectedReferenceLabels: intent.expectedReferenceLabels,
    bestReferenceMatch: match?.bestMatch || null,
    referenceMatchScore10: round(match?.bestMatch?.score10, 1),
    runtimeVector: match?.runtimeVector || null,
    galagaReferenceAnchor: referenceTarget?.sourceAnchor || match?.bestMatch?.sourceAnchor || null,
    galagaReferenceMeaning: referenceTarget?.bonusOpportunity || null,
    safetyProbe: runtime ? {
      noEnemyShots: !!runtime.ruleConformance?.noEnemyShots,
      noAttackStarts: !!runtime.ruleConformance?.noAttackStarts,
      noShipLosses: !!runtime.ruleConformance?.noShipLosses,
      eventCounts: runtime.eventCounts || {}
    } : null,
    motionProbe: runtime ? runtime.motionSummary : null,
    currentRead: runtime
      ? `${layoutSignature(runtime.layout)}; first-wave types ${typeSequence(firstWave) || 'pending'}; visual families ${familySet(firstWave).join(', ') || 'pending'}; group identity ${score.groupIdentity.score10}/10.`
      : 'Runtime probe pending.',
    graphicsRead: runtime
      ? `Current graphics show ${familySet(firstWave).join(', ') || 'no'} family styling with ${typeSet(firstWave).join(', ') || 'no'} alien types. This is still a proxy for visual identity; no active sprite-motion phase score is attached to the challenge window yet.`
      : 'Graphics runtime probe pending.',
    movementRead: match
      ? `Trajectory vector best-match score ${round(match.bestMatch?.score10, 1)}/10 against ${bestLabel || 'no label'}; xRange ${match.runtimeVector?.xRange}, yRange ${match.runtimeVector?.yRange}, pathLength ${match.runtimeVector?.pathLength}.`
      : 'No reference trajectory comparison row was found for this stage.',
    alienVariationRead: runtime
      ? `Opening wave exposes ${typeSet(firstWave).length} type(s) and ${familySet(firstWave).join(', ') || 'no'} visual family labels. Group identity: ${score.groupIdentity.read} Active sprite-motion novelty remains a separate unscored gap.`
      : 'Alien variation probe pending.',
    groupIdentityRead: score.groupIdentity.read,
    groupIdentityScore10: score.groupIdentity.score10,
    criticalGaps: criticalGaps(stage, runtime, match, score),
    nextActions: nextActionsForStage(stage),
    interestingFactor10: score.interestingFactor10,
    conformanceScore10: score.conformanceScore10,
    expectedReferenceHit: score.expectedReferenceHit,
    scoreComponents: score.scoreComponents,
    evidence: [
      'reference-artifacts/analyses/galaga-path-reference-labels/latest.json',
      'reference-artifacts/analyses/formation-boss-path-family-comparison/latest.json',
      'reference-artifacts/analyses/alien-entry-challenge-variation/latest.json',
      runtime?.layout ? 'browser-backed challengeFormationState runtime probe' : 'runtime probe pending'
    ]
  };
}

function buildMarkdown(report){
  const rows = report.stageRows || [];
  const tableRows = rows.map(row => {
    const gapCell = row.criticalGaps.length
      ? row.criticalGaps.join('<br>')
      : 'Reference target hit; remaining work is trajectory precision and active motion scoring.';
    return `| ${row.stage} | ${row.challengeNumber} | ${row.interestingFactor10}/10 | ${row.conformanceScore10}/10 | ${row.groupIdentityScore10 ?? 'n/a'}/10 | ${row.bestReferenceMatch?.labelId || 'pending'} (${row.referenceMatchScore10 ?? 'n/a'}/10) | ${row.pathFamily || 'pending'} | ${row.safetyProbe?.noEnemyShots && row.safetyProbe?.noAttackStarts && row.safetyProbe?.noShipLosses ? 'pass' : 'pending/fail'} | ${gapCell} |`;
  }).join('\n');
  const stageSections = rows.map(row => `
## Stage ${row.stage} / Challenge ${row.challengeNumber}

**Current score:** interesting factor ${row.interestingFactor10}/10; challenge conformance ${row.conformanceScore10}/10.

**Original target:** ${row.galagaTarget}

**Aurora current:** ${row.currentRead}

**Graphics read:** ${row.graphicsRead}

**Movement read:** ${row.movementRead}

**Alien variation read:** ${row.alienVariationRead}

**Group identity read:** ${row.groupIdentityRead || 'Group identity pending.'}

**Safety rule:** ${row.safetyProbe ? `enemy shots ${row.safetyProbe.eventCounts.enemyShots}, attack starts ${row.safetyProbe.eventCounts.enemyAttackStarts}, ship losses ${row.safetyProbe.eventCounts.shipLosses}` : 'runtime probe pending'}.

**Critical gaps:**
${row.criticalGaps.length ? row.criticalGaps.map(gap => `- ${gap}`).join('\n') : '- Reference target hit; remaining work is trajectory precision, lane timing, and active sprite-motion scoring.'}

**Next actions:**
${row.nextActions.map(action => `- ${action}`).join('\n')}
`).join('\n');

  return `# Challenge Stage Conformance Analysis

Generated: ${report.generatedAt}
Commit: ${report.commit}
Branch: ${report.branch}

## Executive Summary

This is a deliberately critical challenge-stage readout. The prior alien-entry score can look healthy because it rewards coverage and broad stage signatures. This report applies a harsher "interesting factor" lens that starts every challenge stage at 1.0/10 and only adds credit for measured no-combat rule conformance, Galaga-reference trajectory match, stage-specific visual/alien novelty, and durable reference evidence.

Current result: **${report.summary.interestingFactorScore10}/10 interesting factor** and **${report.summary.score10}/10 challenge-stage conformance**. The strongest rule finding is that current probes show no enemy shots, no attack starts, and no ship losses during sampled challenge windows. The weakest player-facing finding is that ${report.summary.weakestFinding}

## Method

- Runtime challenge states were sampled through the browser-backed Aurora harness using \`challengeFormationState()\`.
- Reference targets came from media-backed Galaga path labels and contact sheets.
- Existing path-family comparison supplied best-match vector scores against labeled Galaga challenge entries, with challenge windows scored on arrival-phase geometry plus alien-role semantics.
- Challenge path-slot extraction suppresses player fire for challenge windows, so trajectory comparison measures authored alien motion instead of bullet-truncated player-score fragments.
- Safety is measured separately from interest: no shots/no kills is necessary, but it does not make a challenge visually conformant.
- Prior 24-second evidence windows can include post-challenge normal play, so enemy bullets/attackers in those older windows are not treated as challenge-rule failures here.

## Stage Summary

| Stage | Challenge | Interest | Score | Group Identity | Best Reference Match | Aurora Path Family | No-Shot/No-Kill | Critical Gap |
| --- | --- | ---: | ---: | ---: | --- | --- | --- | --- |
${tableRows}

${stageSections}

## Plan To Improve

1. Tighten the scorer first: separate first-visible arrival side, entry side, exit side, group index, no-fire/no-kill rule, path similarity, alien family novelty, and sprite-motion novelty.
2. ${report.summary.stage3ExpectedReferenceHit ? 'Protect the stage 3 first-challenge reference hit, then improve its path-length and rack-slot precision against challenge-1 arrival/late-wave labels.' : 'Implement stage 3 against the first Galaga challenge target: top-right bee-line entry, late top-left butterfly wave, clean peel-off exits, bonus-stage readable grouping, no combat grammar.'}
3. Implement stage 7 as the second challenge: denser mixed-novelty-line behavior with a measured increase in crossing path depth and learnable timing.
4. Implement stage 11 as the third challenge: boss-led/dragonfly novelty with explicit animation-phase scoring for flapping, pulsing, and silhouette changes.
5. Capture or label later Galaga challenge references before claiming stage 15/19 maturity; then tune boss-led-loop and crown-split-cascade against those references.
6. Promote challenge-stage contact sheets and motion SVGs into the Application Guide so a reviewer can see the actual visual delta, not only score text.

## Success Criteria

- Raise challenge-stage interesting factor from ${report.summary.interestingFactorScore10}/10 toward 6.0/10 without regressing no-shot/no-kill guardrails.
- ${report.summary.stage3ExpectedReferenceHit ? 'Keep stage 3 best-matching challenge-1 references while improving its raw trajectory score.' : 'Make stage 3 best-match challenge-1 references instead of challenge 2.'}
- Preserve 0 enemy shots, 0 enemy attack starts, and 0 ship losses during challenge windows.
- Add stage 19 late-reference labels and high-bonus readability probes before treating the late challenge as conformant.
- Add sprite-motion scoring for challenge enemies so visual novelty is active-motion evidence, not only a family label.
`;
}

async function buildReport(){
  const commit = gitShortCommit();
  const branch = gitBranch();
  const generatedAt = new Date().toISOString();
  const runtimeProbes = await collectRuntimeProbes();
  const matches = challengeMatches();
  const referenceLabels = challengeReferenceLabels();
  const alienVariation = alienVariationRead();
  const rows = CHALLENGE_STAGES.map(stage => {
    const runtime = runtimeProbes.find(probe => probe.stage === stage);
    const intent = STAGE_INTENT[stage];
    const match = matches.find(item => item.stage === stage || item.windowId === intent.windowId) || null;
    return makeStageRow(stage, runtime, match, referenceLabels);
  });
  const stage3Row = rows.find(row => row.stage === 3);
  const stage3ExpectedReferenceHit = !!stage3Row?.expectedReferenceHit;
  const challenge2BestMatchCount = rows.filter(row => row.bestReferenceMatch?.labelId === 'challenge-2-arrival-group-1').length;
  const weakestFinding = stage3ExpectedReferenceHit
    ? `challenge stages are still not authored enough as memorable Galaga-like set pieces: ${challenge2BestMatchCount} sampled stage(s) still best-match the same Galaga challenge-2 reference, stage 3 now lands on the first-challenge bee-line reference but needs stronger trajectory precision, active sprite-motion novelty is unscored, and stage 19 lacks reference grounding.`
    : `challenge stages are still not authored enough as memorable Galaga-like set pieces: most measured runtime vectors best-match the same Galaga challenge-2 reference, stage 3 does not read as the original first challenge, active sprite-motion novelty is unscored, and stage 19 lacks reference grounding.`;
  const summary = {
    score10: round(average(rows.map(row => row.conformanceScore10)), 1),
    interestingFactorScore10: round(average(rows.map(row => row.interestingFactor10)), 1),
    confidence: 'medium',
    resolution: 'stage-by-stage browser runtime probe plus media-backed Galaga challenge labels and current path-vector comparison',
    startingAssumption: 'Each challenge stage starts at 1.0/10 interesting factor and must earn credit through measured safety, path reference match, visual novelty, alien variety, and durable evidence.',
    strongestFinding: 'Sampled challenge windows preserve the Galaga-like no-shot/no-ship-loss rule.',
    stage3ExpectedReferenceHit,
    challenge2BestMatchCount,
    weakestFinding,
    playerMeaning: 'A player should experience challenging stages as safe but tense score exhibitions with memorable entry routes and alien novelty. Aurora currently has the safety rule, but the visual choreography is not yet distinctive enough.',
    designerMeaning: 'Design work should move from broad path-family labels to explicit per-challenge contracts: group order, entry side, exit side, alien family, motion phases, bonus opportunity, and result feedback.',
    sourceScores: {
      alienEntryChallengeVariation: alienVariation?.score10 ?? null,
      challengeArrivalVsAppearance: (alienVariation?.metrics || []).find(item => item.id === 'challenge-arrival-vs-appearance')?.score10 ?? null,
      challengePatternNoveltyDepth: (alienVariation?.metrics || []).find(item => item.id === 'challenge-pattern-novelty-depth')?.score10 ?? null
    }
  };
  return {
    schemaVersion: 1,
    artifactType: 'challenge-stage-conformance',
    generatedAt,
    commit,
    branch,
    challengeStages: CHALLENGE_STAGES,
    summary,
    stageRows: rows,
    referenceLabels: referenceLabels.map(label => ({
      labelId: label.labelId,
      challengeNumber: label.challengeNumber,
      groupIndex: label.groupIndex,
      entityFamily: label.entityFamily,
      entrySide: label.entrySide,
      exitSide: label.exitSide,
      sourceAnchor: label.sourceAnchor,
      bonusOpportunity: label.bonusOpportunity,
      confidenceScore: label.confidenceScore,
      comparisonVector: label.comparisonVector
    })),
    sourceArtifacts: {
      galagaPathReferenceLabels: 'reference-artifacts/analyses/galaga-path-reference-labels/latest.json',
      pathFamilyComparison: 'reference-artifacts/analyses/formation-boss-path-family-comparison/latest.json',
      alienEntryChallengeVariation: 'reference-artifacts/analyses/alien-entry-challenge-variation/latest.json',
      challengeCollisionGuardrail: 'tools/harness/check-challenge-collision.js',
      challengeMotionProfileGuardrail: 'tools/harness/check-challenge-motion-profile.js'
    },
    improvementPlan: [
      'Separate rule conformance from interest conformance in challenge metrics.',
      'Stage 3: implement reference-labeled first-challenge entry and peel-off groups.',
      'Stage 7: deepen challenge-2 mixed-novelty pattern and group scoring.',
      'Stage 11: add active sprite-motion scoring around dragonfly/boss-led novelty.',
      'Stage 15/19: acquire or label late challenge reference targets before late-stage tuning.',
      'Publish contact sheets, trajectory SVGs, and per-stage critical gaps in generated docs.'
    ]
  };
}

async function main(){
  const report = await buildReport();
  const stamp = `${report.generatedAt.slice(0, 10)}-${report.commit}`;
  const outDir = path.join(OUT_ROOT, stamp);
  const reportPath = path.join(outDir, 'report.json');
  const readmePath = path.join(outDir, 'README.md');
  const latestPath = path.join(OUT_ROOT, 'latest.json');
  const topLevelReportPath = path.join(ROOT, 'CHALLENGE_STAGE_CONFORMANCE_ANALYSIS.md');
  const markdown = buildMarkdown(report);
  writeJson(reportPath, report);
  writeText(readmePath, markdown);
  writeJson(latestPath, report);
  writeText(topLevelReportPath, markdown);
  console.log(JSON.stringify({
    ok: true,
    score10: report.summary.score10,
    interestingFactorScore10: report.summary.interestingFactorScore10,
    report: rel(reportPath),
    latest: rel(latestPath),
    markdown: rel(topLevelReportPath)
  }, null, 2));
}

main().catch(err => {
  console.error(err && err.stack || String(err));
  process.exit(1);
});
