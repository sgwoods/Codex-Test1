#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..', '..');
const SOURCE_ROOT = path.join(ROOT, 'reference-artifacts', 'analyses', 'aurora-level-expansion-cycle');
const OUT_ROOT = path.join(ROOT, 'reference-artifacts', 'analyses', 'level-arc-opportunity-windows');

const OUTCOME_SKILL_ROUTE_MAP = Object.freeze({
  'late-run-cleanup-or-failure': ['late-run-natural-squadron-reward'],
  'late-run-escort-variant': ['late-run-natural-escort-reward']
});

function ensureDir(dir){
  fs.mkdirSync(dir, { recursive: true });
}

function readJson(file){
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function writeJson(file, data){
  fs.writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`);
}

function clamp(value, min = 0, max = 1){
  return Math.max(min, Math.min(max, value));
}

function round(value, digits = 2){
  return Number.isFinite(value) ? +value.toFixed(digits) : 0;
}

function rel(file){
  return path.relative(ROOT, file).replace(/\\/g, '/');
}

function gitShortCommit(){
  try{
    return execFileSync('git', ['-C', ROOT, 'rev-parse', '--short', 'HEAD'], { encoding: 'utf8' }).trim();
  }catch{
    return 'unknown';
  }
}

function collectFiles(root, targetName){
  const fullRoot = path.join(ROOT, root);
  if(!fs.existsSync(fullRoot)) return [];
  const found = [];
  function walk(dir){
    for(const entry of fs.readdirSync(dir, { withFileTypes: true })){
      const full = path.join(dir, entry.name);
      if(entry.isDirectory()) walk(full);
      else if(entry.isFile() && entry.name === targetName) found.push(full);
    }
  }
  walk(fullRoot);
  return found.sort((a, b) => {
    const delta = fs.statSync(a).mtimeMs - fs.statSync(b).mtimeMs;
    return delta || a.localeCompare(b);
  });
}

function latestReport(dir){
  const found = collectFiles(dir, 'report.json');
  return found.length ? found[found.length - 1] : null;
}

function average(values){
  const finite = values.filter(Number.isFinite);
  return finite.length ? finite.reduce((sum, value) => sum + value, 0) / finite.length : 0;
}

function eventCounts(events){
  const counts = new Map();
  for(const event of events.events || []){
    counts.set(event.event_family, (counts.get(event.event_family) || 0) + 1);
  }
  return counts;
}

function missingFamilies(events){
  return (events.event_family_coverage || [])
    .filter(item => !item.observed)
    .map(item => item.family);
}

function pressureIndex(trace, events, duration){
  const summary = trace.summary || {};
  const counts = eventCounts(events);
  const attackRate = ((counts.get('enemy_dive_start') || 0) + (counts.get('escort_dive_start') || 0) + (counts.get('flank_dive_start') || 0)) / Math.max(duration || 1, 1);
  const projectileRate = (counts.get('enemy_projectile') || 0) / Math.max(duration || 1, 1);
  const lossSignal = counts.get('player_hit') ? 1 : 0;
  return round(10 * clamp(
    (0.24 * clamp((summary.max_attackers || 0) / 5))
    + (0.18 * clamp((summary.max_enemy_bullets || 0) / 3))
    + (0.24 * clamp(attackRate / 1.5))
    + (0.14 * clamp(projectileRate / 1.4))
    + (0.2 * lossSignal)
  ), 1);
}

function baseRewardIndex(manifest, trace, events, duration){
  const counts = eventCounts(events);
  const score = manifest.final_state?.score || trace.summary?.final_score || 0;
  const scoreRate = score / Math.max(duration || 1, 1);
  const challengeResult = counts.get('challenge_result') ? 1 : 0;
  const challengeHits = counts.get('challenge_enemy_hit') || 0;
  const escortStarts = counts.get('escort_dive_start') || 0;
  const waveClear = counts.get('wave_clear') ? 1 : 0;
  return round(10 * clamp(
    (0.28 * clamp(scoreRate / 220))
    + (0.22 * clamp(challengeHits / 40))
    + (0.18 * challengeResult)
    + (0.16 * clamp(escortStarts / 6))
    + (0.16 * waveClear)
  ), 1);
}

function outcomeRewardIndex(outcome){
  if(!outcome) return 0;
  const special = clamp((outcome.specialAttackCount || 0) / 1);
  const bonus = clamp((outcome.specialAttackBonus || 0) / 1600);
  const score = clamp((outcome.score || 0) / 2400);
  const bossDamage = clamp((outcome.bossDamageCount || outcome.specialAttackCount || 0) / 2);
  const survival = outcome.collisionLosses ? 0 : 1;
  return round(10 * clamp(
    (0.3 * special)
    + (0.24 * bonus)
    + (0.22 * score)
    + (0.14 * bossDamage)
    + (0.1 * survival)
  ), 1);
}

function bestSkillRouteOutcome(id, outcomeById){
  const aliases = OUTCOME_SKILL_ROUTE_MAP[id] || [];
  const candidates = aliases
    .map(alias => outcomeById[alias])
    .filter(Boolean)
    .map(outcome => Object.assign({ skillRewardIndex: outcomeRewardIndex(outcome) }, outcome))
    .sort((a, b) => b.skillRewardIndex - a.skillRewardIndex || (b.score || 0) - (a.score || 0));
  return candidates[0] || null;
}

function combinedRewardIndex(baseReward, skillReward){
  if(!skillReward) return baseReward;
  return round(Math.max(baseReward, (baseReward * 0.5) + (skillReward * 0.5)), 1);
}

function identityIndex(events, trace){
  const coverage = events.event_family_coverage || [];
  const observed = coverage.filter(item => item.observed).length;
  const coverageScore = coverage.length ? observed / coverage.length : 0;
  const counts = eventCounts(events);
  const roleCount = ['enemy_dive_start', 'escort_dive_start', 'flank_dive_start', 'challenge_enemy_path', 'challenge_enemy_hit', 'challenge_result']
    .filter(role => counts.get(role) > 0)
    .length;
  const visualState = new Set((trace.samples || []).map(sample => sample.stagePresentation?.id).filter(Boolean)).size;
  return round(10 * clamp(
    (0.5 * coverageScore)
    + (0.35 * clamp(roleCount / 4))
    + (0.15 * clamp(visualState / 3))
  ), 1);
}

function semanticMissingFamilies(missing, outcome){
  return missing.filter(family => {
    if(family === 'player_hit') return !(outcome?.losses > 0);
    if(family === 'wave_clear') return !(outcome?.clears > 0 || outcome?.losses > 0);
    if(family === 'game_over') return false;
    return true;
  });
}

function loadWindow(dir, outcomeById){
  const manifest = readJson(path.join(dir, 'source-manifest.json'));
  const trace = readJson(path.join(dir, 'trace', 'trace.json'));
  const events = readJson(path.join(dir, 'events', 'reference-events.json'));
  const duration = manifest.duration_s || trace.duration_s || 1;
  const counts = eventCounts(events);
  const visualMissing = missingFamilies(events);
  const id = path.basename(dir);
  const outcome = outcomeById[id] || null;
  const skillRouteOutcome = bestSkillRouteOutcome(id, outcomeById);
  const missing = semanticMissingFamilies(visualMissing, outcome);
  const pressure = pressureIndex(trace, events, duration);
  const baselineReward = baseRewardIndex(manifest, trace, events, duration);
  const skillReward = outcomeRewardIndex(skillRouteOutcome);
  const reward = combinedRewardIndex(baselineReward, skillReward);
  const identity = identityIndex(events, trace);
  const opportunityScore = round(10 - ((identity * 0.42) + (reward * 0.28) + (pressure * 0.12) + ((missing.length ? 0 : 10) * 0.18)), 1);
  return {
    id,
    role: null,
    scenario: manifest.scenario,
    stage: manifest.config?.stage || trace.summary?.final_stage || null,
    challenge: !!manifest.config?.challenge,
    duration,
    score: manifest.final_state?.score || trace.summary?.final_score || 0,
    finalLives: manifest.final_state?.lives || trace.summary?.final_lives || 0,
    promotedEventCount: manifest.promoted_event_count || events.events?.length || 0,
    missingFamilies: missing,
    visualMissingFamilies: visualMissing,
    outcomeProbe: outcome ? {
      score10: outcome.outcomeScore10,
      losses: outcome.losses,
      clears: outcome.clears,
      collisionLosses: outcome.collisionLosses,
      attacks: outcome.attacks,
      bullets: outcome.bullets,
      firstLoss: outcome.lossSignatures?.[0] || null
    } : null,
    skillRouteProbe: skillRouteOutcome ? {
      id: skillRouteOutcome.id,
      scenario: skillRouteOutcome.scenario,
      outcomeScore10: skillRouteOutcome.outcomeScore10,
      rewardIndex: skillRouteOutcome.skillRewardIndex,
      score: skillRouteOutcome.score,
      losses: skillRouteOutcome.losses,
      collisionLosses: skillRouteOutcome.collisionLosses,
      specialAttackCount: skillRouteOutcome.specialAttackCount,
      specialAttackBonus: skillRouteOutcome.specialAttackBonus,
      firstLoss: skillRouteOutcome.lossSignatures?.[0] || null
    } : null,
    eventCounts: Object.fromEntries([...counts.entries()].sort()),
    pressureIndex: pressure,
    baselineRewardIndex: baselineReward,
    skillRouteRewardIndex: skillReward,
    rewardIndex: reward,
    identityIndex: identity,
    opportunityScore,
    artifacts: {
      manifest: rel(path.join(dir, 'source-manifest.json')),
      trace: rel(path.join(dir, 'trace', 'trace.json')),
      events: rel(path.join(dir, 'events', 'reference-events.json'))
    }
  };
}

function roleForWindow(plan, id){
  return (plan.windows || []).find(win => win.window_id === id)?.role || null;
}

function pressureCurveRead(windows){
  const regular = windows.filter(win => !win.challenge).sort((a, b) => (a.stage || 0) - (b.stage || 0));
  const adjacent = [];
  for(let i = 1; i < regular.length; i += 1){
    adjacent.push({
      from: regular[i - 1].id,
      to: regular[i].id,
      fromStage: regular[i - 1].stage,
      toStage: regular[i].stage,
      delta: round(regular[i].pressureIndex - regular[i - 1].pressureIndex, 1)
    });
  }
  const regressions = adjacent.filter(item => item.delta < -1);
  const late = regular.filter(win => win.stage >= 10);
  return {
    regularWindowCount: regular.length,
    meanRegularPressure: round(average(regular.map(win => win.pressureIndex)), 1),
    adjacent,
    regressions,
    latePressureSpread: round(Math.max(...late.map(win => win.pressureIndex), 0) - Math.min(...late.map(win => win.pressureIndex), 0), 1)
  };
}

function opportunityList(windows, stageSignature){
  const opportunities = [];
  const byId = Object.fromEntries(windows.map(win => [win.id, win]));
  for(const win of windows){
    if(win.missingFamilies.length){
      opportunities.push({
        id: `${win.id}-missing-event-coverage`,
        priority: win.missingFamilies.includes('wave_clear') || win.missingFamilies.includes('player_hit') ? 'high' : 'medium',
        window: win.id,
        score: round(6 + Math.min(win.missingFamilies.length, 4)),
        problem: `${win.id} does not yet observe ${win.missingFamilies.join(', ')}.`,
        strategy: 'Add or widen deterministic evidence windows before gameplay tuning so the harness can distinguish missing behavior from absent conformance.',
        successMeasure: 'The same window reports full planned event-family coverage and level-arc identity/readiness scores rise without weakening survival checks.'
      });
    }
    if(!win.challenge && win.stage >= 10 && win.rewardIndex < 4){
      opportunities.push({
        id: `${win.id}-late-reward-thinness`,
        priority: 'high',
        window: win.id,
        score: round(10 - win.rewardIndex, 1),
        problem: `${win.id} has late-stage pressure evidence but low reward/opportunity signal (${win.rewardIndex}/10).`,
        strategy: 'Measure boss/escort score opportunities, hit-before-loss events, and clear/failure outcomes; then add one visible late-stage reward window rather than increasing raw attack density.',
        successMeasure: 'Reward index reaches 5+/10 while pressure index does not increase by more than 1 point unless survival evidence also improves.'
      });
    }
  }
  const closest = stageSignature.summary?.closestRegularPair || stageSignature.summary?.closestPair || null;
  if(closest && closest.distance < 0.16){
    const a = byId[closest.a];
    const b = byId[closest.b];
    opportunities.push({
      id: 'closest-regular-stage-signature-gap',
      priority: 'high',
      window: `${closest.a}/${closest.b}`,
      score: round(10 * clamp((0.16 - closest.distance) / 0.16), 1),
      problem: `${closest.a} and ${closest.b} are too similar by computed gameplay signature distance (${closest.distance}).`,
      strategy: 'Use the feature trace to add one distinct movement/reward grammar to the weaker window, then rerun stage-signature distance.',
      successMeasure: 'Closest regular pair distance rises above 0.16 and signatureScore10 improves without increasing exact pressure-loss regressions.',
      currentRead: {
        [closest.a]: a ? { stage: a.stage, pressureIndex: a.pressureIndex, rewardIndex: a.rewardIndex, identityIndex: a.identityIndex } : null,
        [closest.b]: b ? { stage: b.stage, pressureIndex: b.pressureIndex, rewardIndex: b.rewardIndex, identityIndex: b.identityIndex } : null
      }
    });
  }
  const challenge = windows.find(win => win.challenge);
  if(challenge && challenge.rewardIndex >= 9 && challenge.identityIndex >= 9){
    opportunities.push({
      id: 'challenge-stage-depth-next-layer',
      priority: 'medium',
      window: challenge.id,
      score: 4.5,
      problem: 'The first challenge window is measurable and reward-rich, but it still represents a single challenge grammar family.',
      strategy: 'Add a second challenge motion family or rank variant after late-stage repetition is addressed; preserve the current perfect/result signal as the baseline.',
      successMeasure: 'Challenge identity remains 9+/10 and a second challenge evidence window becomes distinct from the first by stage-signature analysis.'
    });
  }
  return opportunities.sort((a, b) => b.score - a.score || a.id.localeCompare(b.id));
}

function scoreSummary(windows, pressureCurve, opportunities, stageSignature, outcomeReport){
  const coverage = average(windows.map(win => win.missingFamilies.length ? 0 : 1));
  const identity = average(windows.map(win => win.identityIndex / 10));
  const reward = average(windows.map(win => win.rewardIndex / 10));
  const rewardEvidence = clamp((outcomeReport.summary?.rewardWindows || 0) / 2);
  const pressureShape = pressureCurve.regressions.length
    ? clamp(1 - (pressureCurve.regressions.length / Math.max(pressureCurve.adjacent.length, 1)))
    : 1;
  const signature = (stageSignature.summary?.signatureScore10 || 0) / 10;
  return round(10 * clamp(
    (0.28 * coverage)
    + (0.24 * identity)
    + (0.12 * reward)
    + (0.06 * rewardEvidence)
    + (0.16 * pressureShape)
    + (0.14 * signature)
  ), 1);
}

function buildReadme(report){
  const lines = [
    '# Level Arc Opportunity Windows',
    '',
    'This artifact turns Aurora level-expansion evidence into ranked, measurable work items. It is meant to reduce subjective gameplay tuning by pointing to the next window where computation says conformance value is likely.',
    '',
    `- Score: ${report.summary.score10}/10`,
    `- Windows: ${report.summary.windowCount}`,
    `- Full coverage windows: ${report.summary.fullCoverageWindows}/${report.summary.windowCount}`,
    `- Mean pressure index: ${report.summary.meanPressureIndex}/10`,
    `- Mean reward index: ${report.summary.meanRewardIndex}/10`,
    `- Mean identity index: ${report.summary.meanIdentityIndex}/10`,
    `- Skill-route reward windows: ${report.summary.skillRouteRewardWindows}`,
    `- Outcome reward windows: ${report.summary.outcomeRewardWindows}`,
    `- Outcome special reward bonus: ${report.summary.outcomeSpecialRewardBonus}`,
    `- Highest priority opportunity: ${report.summary.highestPriorityOpportunity?.id || 'none'}`,
    '',
    '## Problem',
    '',
    report.problem,
    '',
    '## Strategy',
    '',
    report.strategy,
    '',
    '## Success Measure',
    '',
    report.successMeasure,
    '',
    '## Ranked Opportunities',
    ''
  ];
  for(const item of report.opportunities){
    lines.push(`### ${item.id}`);
    lines.push(`- Priority: ${item.priority}`);
    lines.push(`- Window: ${item.window}`);
    lines.push(`- Score: ${item.score}`);
    lines.push(`- Problem: ${item.problem}`);
    lines.push(`- Strategy: ${item.strategy}`);
    lines.push(`- Success measure: ${item.successMeasure}`);
    lines.push('');
  }
  lines.push('## Window Reads');
  lines.push('');
  lines.push('| Window | Stage | Pressure | Reward | Identity | Missing Families |');
  lines.push('| --- | ---: | ---: | ---: | ---: | --- |');
  for(const win of report.windows){
    const rewardRead = win.skillRouteProbe
      ? `${win.rewardIndex} (base ${win.baselineRewardIndex}; skill ${win.skillRouteRewardIndex})`
      : String(win.rewardIndex);
    lines.push(`| ${win.id} | ${win.challenge ? `${win.stage} challenge` : win.stage} | ${win.pressureIndex} | ${rewardRead} | ${win.identityIndex} | ${win.missingFamilies.join(', ') || 'none'} |`);
  }
  lines.push('');
  lines.push('## Pressure Curve');
  lines.push('');
  for(const item of report.pressureCurve.adjacent){
    lines.push(`- ${item.from} -> ${item.to}: ${item.delta >= 0 ? '+' : ''}${item.delta}`);
  }
  lines.push('');
  return `${lines.join('\n')}\n`;
}

function main(){
  ensureDir(OUT_ROOT);
  if(!fs.existsSync(SOURCE_ROOT)) throw new Error(`Missing source root ${SOURCE_ROOT}`);
  const planPath = path.join(SOURCE_ROOT, 'aurora-four-window-cycle.plan.json');
  const plan = fs.existsSync(planPath) ? readJson(planPath) : { windows: [] };
  const stageSignaturePath = latestReport('reference-artifacts/analyses/stage-signature-distance');
  const stageSignature = stageSignaturePath ? readJson(stageSignaturePath) : { summary: {} };
  const outcomePath = latestReport('reference-artifacts/analyses/level-arc-outcome-probes');
  const outcomeReport = outcomePath ? readJson(outcomePath) : { probes: [] };
  const outcomeById = Object.fromEntries((outcomeReport.probes || []).map(probe => [probe.id, probe]));
  const windows = fs.readdirSync(SOURCE_ROOT, { withFileTypes: true })
    .filter(entry => entry.isDirectory())
    .map(entry => path.join(SOURCE_ROOT, entry.name))
    .filter(dir => fs.existsSync(path.join(dir, 'source-manifest.json')))
    .filter(dir => fs.existsSync(path.join(dir, 'trace', 'trace.json')))
    .filter(dir => fs.existsSync(path.join(dir, 'events', 'reference-events.json')))
    .sort()
    .map(dir => loadWindow(dir, outcomeById))
    .map(win => Object.assign(win, { role: roleForWindow(plan, win.id) }));
  const pressureCurve = pressureCurveRead(windows);
  const opportunities = opportunityList(windows, stageSignature);
  const score10 = scoreSummary(windows, pressureCurve, opportunities, stageSignature, outcomeReport);
  const commit = gitShortCommit();
  const stamp = new Date().toISOString().slice(0, 10);
  const outDir = path.join(OUT_ROOT, `${stamp}-${commit}`);
  ensureDir(outDir);
  const report = {
    generatedAt: new Date().toISOString(),
    commit,
    problem: 'Aurora needs a Galaga-like level arc: stages should become more distinct, reward-bearing, and learnable over time rather than repeating a similar pressure loop.',
    strategy: 'Compute opportunity windows from deterministic evidence by combining event-family coverage, pressure shape, reward signal, identity signal, and stage-signature distance before choosing a gameplay change.',
    successMeasure: 'Future work should raise the opportunity-window score, reduce missing event families, increase closest regular-stage signature distance, and improve level-arc score without hiding Stage 4 exact replay gaps.',
    evidence: {
      sourceRoot: rel(SOURCE_ROOT),
      stageSignatureReport: stageSignaturePath ? rel(stageSignaturePath) : null,
      outcomeProbeReport: outcomePath ? rel(outcomePath) : null
    },
    summary: {
      score10,
      windowCount: windows.length,
      fullCoverageWindows: windows.filter(win => !win.missingFamilies.length).length,
      meanPressureIndex: round(average(windows.map(win => win.pressureIndex)), 1),
      meanRewardIndex: round(average(windows.map(win => win.rewardIndex)), 1),
      meanIdentityIndex: round(average(windows.map(win => win.identityIndex)), 1),
      skillRouteRewardWindows: windows.filter(win => win.skillRouteProbe).length,
      outcomeRewardWindows: outcomeReport.summary?.rewardWindows || 0,
      outcomeSpecialRewardBonus: outcomeReport.summary?.totalSpecialAttackBonus || 0,
      highestPriorityOpportunity: opportunities[0] || null,
      pressureCurve
    },
    pressureCurve,
    windows,
    opportunities
  };
  writeJson(path.join(outDir, 'report.json'), report);
  fs.writeFileSync(path.join(outDir, 'README.md'), buildReadme(report));
  console.log(JSON.stringify({
    ok: true,
    outDir,
    score10,
    highestPriorityOpportunity: report.summary.highestPriorityOpportunity?.id || null
  }, null, 2));
}

main();
