#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..', '..');
const SOURCE_ROOT = path.join(ROOT, 'reference-artifacts', 'analyses', 'aurora-level-expansion-cycle');
const OUT_ROOT = path.join(ROOT, 'reference-artifacts', 'analyses', 'stage-signature-distance');

const EVENT_FAMILIES = [
  'stage_start',
  'formation_entry',
  'player_move',
  'player_shot',
  'enemy_dive_start',
  'flank_dive_start',
  'escort_dive_start',
  'enemy_projectile',
  'player_hit',
  'wave_clear',
  'game_over',
  'challenge_wave_start',
  'challenge_enemy_path',
  'challenge_enemy_hit',
  'challenge_result'
];

function ensureDir(dir){
  fs.mkdirSync(dir, { recursive: true });
}

function readJson(file){
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function writeJson(file, data){
  fs.writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`);
}

function round(value, digits = 3){
  return Number.isFinite(value) ? +value.toFixed(digits) : 0;
}

function clamp(value, min = 0, max = 1){
  return Math.max(min, Math.min(max, value));
}

function gitShortCommit(){
  try{
    return execFileSync('git', ['-C', ROOT, 'rev-parse', '--short', 'HEAD'], { encoding: 'utf8' }).trim();
  }catch{
    return 'unknown';
  }
}

function normalize(value, max){
  return clamp((value || 0) / max);
}

function average(values){
  const finite = values.filter(Number.isFinite);
  return finite.length ? finite.reduce((sum, value) => sum + value, 0) / finite.length : 0;
}

function uniqueSampleValues(samples, key){
  const out = new Set();
  for(const sample of samples){
    const value = sample[key];
    if(Array.isArray(value)){
      for(const item of value) if(item) out.add(String(item));
    }else if(value){
      out.add(String(value));
    }
  }
  return out;
}

function eventFamilies(events){
  const observed = new Set();
  for(const entry of events.event_family_coverage || []){
    if(entry.observed) observed.add(entry.family);
  }
  for(const event of events.events || []){
    if(event.event_family) observed.add(event.event_family);
  }
  return observed;
}

function eventRates(events, duration){
  const counts = new Map();
  for(const family of EVENT_FAMILIES) counts.set(family, 0);
  for(const event of events.events || []){
    if(event.event_family && counts.has(event.event_family)){
      counts.set(event.event_family, counts.get(event.event_family) + 1);
    }
  }
  const denom = Math.max(duration || 1, 1);
  return Object.fromEntries([...counts.entries()].map(([family, count]) => [family, round(count / denom, 4)]));
}

function attackMix(events, duration){
  const attacks = (events.events || []).filter(event => event.runtime_type === 'enemy_attack_start');
  const byFamily = new Map();
  for(const key of ['boss', 'but', 'bee', 'rogue']) byFamily.set(key, 0);
  let escortCount = 0;
  for(const event of attacks){
    const family = event.entity_family || 'unknown';
    if(byFamily.has(family)) byFamily.set(family, byFamily.get(family) + 1);
    if(event.event_family === 'escort_dive_start') escortCount += 1;
  }
  const denom = Math.max(duration || 1, 1);
  const total = Math.max(attacks.length, 1);
  return {
    totalAttackRate: attacks.length / denom,
    escortAttackRate: escortCount / denom,
    escortAttackShare: escortCount / total,
    bossAttackShare: (byFamily.get('boss') || 0) / total,
    butterflyAttackShare: (byFamily.get('but') || 0) / total,
    beeAttackShare: (byFamily.get('bee') || 0) / total,
    firstAttackTime: attacks.length ? attacks[0].time_s || 0 : duration || 0
  };
}

function standardDeviation(values){
  if(values.length < 2) return 0;
  const mean = average(values);
  const variance = average(values.map(value => (value - mean) ** 2));
  return Math.sqrt(variance);
}

function loadWindow(dir){
  const trace = readJson(path.join(dir, 'trace', 'trace.json'));
  const events = readJson(path.join(dir, 'events', 'reference-events.json'));
  const manifest = readJson(path.join(dir, 'source-manifest.json'));
  const summary = trace.summary || {};
  const samples = trace.samples || [];
  const duration = trace.duration_s || manifest.duration_s || samples.at(-1)?.t || 1;
  const families = eventFamilies(events);
  const playerXs = samples.map(sample => sample.player_x).filter(Number.isFinite);
  const attackers = samples.map(sample => sample.attackers || 0);
  const bullets = samples.map(sample => sample.enemy_bullets || 0);
  const challengeEnemies = samples.map(sample => sample.challenge_enemies || sample.challengeEnemyCount || 0);
  const formationActive = samples.map(sample => sample.formation_active || 0);
	  const cueSet = new Set(samples.map(sample => sample.audioCue?.cue).filter(Boolean));
	  const stagePresentationSet = new Set(samples.map(sample => sample.stagePresentation?.id).filter(Boolean));
	  const formationPathFamilies = uniqueSampleValues(samples, 'formationPathFamilies');
	  const challengePathFamilies = uniqueSampleValues(samples, 'challengePathFamilies');
	  const formationEnemyTypes = uniqueSampleValues(samples, 'formationEnemyTypes');
	  const challengeEnemyTypes = uniqueSampleValues(samples, 'challengeEnemyTypes');
	  const attack = attackMix(events, duration);

  const features = {
    stage: normalize(manifest.config?.stage || summary.final_stage || 1, 20),
    isChallenge: manifest.config?.challenge || summary.final_challenge ? 1 : 0,
    duration: normalize(duration, 30),
    playerRange: normalize(summary.player_x_range || 0, 280),
    playerStd: normalize(standardDeviation(playerXs), 120),
    maxAttackers: normalize(summary.max_attackers || 0, 6),
    meanAttackers: normalize(average(attackers), 4),
    maxEnemyBullets: normalize(summary.max_enemy_bullets || 0, 4),
    meanEnemyBullets: normalize(average(bullets), 3),
    maxPlayerBullets: normalize(summary.max_player_bullets || 0, 3),
    maxChallengeEnemies: normalize(summary.max_challenge_enemies || 0, 40),
    meanChallengeEnemies: normalize(average(challengeEnemies), 30),
    formationActiveMean: normalize(average(formationActive), 40),
    finalScore: normalize(summary.final_score || 0, 6000),
    livesLost: normalize((manifest.config?.ships || 5) - (summary.final_lives || manifest.final_state?.lives || 0), 5),
    eventFamilyCoverage: normalize(families.size, EVENT_FAMILIES.length),
	    audioCueVariety: normalize(cueSet.size, 6),
	    stagePresentationVariety: normalize(stagePresentationSet.size, 4),
	    formationPathFamilyVariety: normalize(formationPathFamilies.size, 5),
	    challengePathFamilyVariety: normalize(challengePathFamilies.size, 5),
	    formationEnemyTypeVariety: normalize(formationEnemyTypes.size, 5),
	    challengeEnemyTypeVariety: normalize(challengeEnemyTypes.size, 5),
	    totalAttackRate: normalize(attack.totalAttackRate, 2),
    escortAttackRate: normalize(attack.escortAttackRate, 1),
    escortAttackShare: attack.escortAttackShare,
    bossAttackShare: attack.bossAttackShare,
    butterflyAttackShare: attack.butterflyAttackShare,
    beeAttackShare: attack.beeAttackShare,
    firstAttackTime: normalize(attack.firstAttackTime, Math.max(duration, 1))
  };
  for(const [family, rate] of Object.entries(eventRates(events, duration))){
    features[`eventRate:${family}`] = normalize(rate, 2);
  }
	  for(const family of EVENT_FAMILIES){
	    features[`eventPresent:${family}`] = families.has(family) ? 1 : 0;
	  }
	  for(const family of [...formationPathFamilies, ...challengePathFamilies]){
	    features[`pathFamily:${family}`] = 1;
	  }
	  for(const type of [...formationEnemyTypes, ...challengeEnemyTypes]){
	    features[`enemyType:${type}`] = 1;
	  }

  return {
    id: path.basename(dir),
    scenario: manifest.scenario,
    stage: manifest.config?.stage || summary.final_stage || null,
    stageBand: stageBand(manifest.config?.stage || summary.final_stage || 1, Boolean(manifest.config?.challenge || summary.final_challenge)),
    challenge: Boolean(manifest.config?.challenge || summary.final_challenge),
    duration,
    summary,
    observedEventFamilies: [...families].sort(),
    features
  };
}

function stageBand(stage, challenge){
  if(challenge) return 'challenge';
  if(stage <= 2) return 'early';
  if(stage < 10) return 'mid';
  return 'late';
}

function featureWeight(key){
	  if(key.startsWith('eventPresent:')) return 0.35;
	  if(key.startsWith('eventRate:')) return 1.8;
	  if(key.startsWith('pathFamily:')) return 2.2;
	  if(key.startsWith('enemyType:')) return 0.8;
	  if(key.endsWith('AttackRate') || key.endsWith('AttackShare')) return 1.7;
	  if(['maxAttackers', 'meanAttackers', 'maxEnemyBullets', 'meanEnemyBullets'].includes(key)) return 1.45;
	  if(['eventFamilyCoverage', 'firstAttackTime', 'stagePresentationVariety', 'formationPathFamilyVariety', 'challengePathFamilyVariety'].includes(key)) return 1.25;
	  if(['formationEnemyTypeVariety', 'challengeEnemyTypeVariety'].includes(key)) return 0.8;
  if(['livesLost', 'finalScore', 'maxChallengeEnemies', 'meanChallengeEnemies'].includes(key)) return 1.0;
  if(['stage', 'isChallenge', 'formationActiveMean', 'audioCueVariety'].includes(key)) return 0.75;
  if(['duration', 'playerRange', 'playerStd', 'maxPlayerBullets'].includes(key)) return 0.45;
  return 1;
}

function distance(a, b){
  const keys = [...new Set([...Object.keys(a.features), ...Object.keys(b.features)])].sort();
  let weightedSquared = 0;
  let totalWeight = 0;
  for(const key of keys){
    const weight = featureWeight(key);
    weightedSquared += weight * (((a.features[key] || 0) - (b.features[key] || 0)) ** 2);
    totalWeight += weight;
  }
  return round(Math.sqrt(weightedSquared / Math.max(totalWeight, 1)), 3);
}

function main(){
  ensureDir(OUT_ROOT);
  if(!fs.existsSync(SOURCE_ROOT)){
    throw new Error(`Missing source root ${SOURCE_ROOT}`);
  }
  const windows = fs.readdirSync(SOURCE_ROOT, { withFileTypes: true })
    .filter(entry => entry.isDirectory())
    .map(entry => path.join(SOURCE_ROOT, entry.name))
    .filter(dir => fs.existsSync(path.join(dir, 'trace', 'trace.json')))
    .filter(dir => fs.existsSync(path.join(dir, 'events', 'reference-events.json')))
    .filter(dir => fs.existsSync(path.join(dir, 'source-manifest.json')))
    .sort()
    .map(loadWindow);

  const pairs = [];
  for(let i = 0; i < windows.length; i += 1){
    for(let j = i + 1; j < windows.length; j += 1){
      pairs.push({
        a: windows[i].id,
        b: windows[j].id,
        aStage: windows[i].stage,
        bStage: windows[j].stage,
        aBand: windows[i].stageBand,
        bBand: windows[j].stageBand,
        distance: distance(windows[i], windows[j])
      });
    }
  }
  pairs.sort((a, b) => a.distance - b.distance || a.a.localeCompare(b.a) || a.b.localeCompare(b.b));
  const distances = pairs.map(pair => pair.distance);
  const minDistance = distances.length ? Math.min(...distances) : 0;
  const meanDistance = average(distances);
  const maxDistance = distances.length ? Math.max(...distances) : 0;
  const distinctPairRatio = pairs.length ? pairs.filter(pair => pair.distance >= 0.22).length / pairs.length : 0;
  const repetitionRisk = clamp(1 - (minDistance / 0.22));
  const regularPairs = pairs.filter(pair => pair.aBand !== 'challenge' && pair.bBand !== 'challenge');
  const midLatePairs = regularPairs.filter(pair => [pair.aBand, pair.bBand].sort().join('/') === 'late/mid');
  const sameBandRegularPairs = regularPairs.filter(pair => pair.aBand === pair.bBand);
  const meanRegularDistance = average(regularPairs.map(pair => pair.distance));
  const meanMidLateDistance = average(midLatePairs.map(pair => pair.distance));
  const signatureScore10 = round(10 * (
    (0.45 * clamp(meanDistance / 0.32))
    + (0.35 * distinctPairRatio)
    + (0.2 * clamp(minDistance / 0.22))
  ), 1);

  const stamp = new Date().toISOString().slice(0, 10);
  const commit = gitShortCommit();
  const outDir = path.join(OUT_ROOT, `${stamp}-${commit}`);
  ensureDir(outDir);
  const report = {
    generatedAt: new Date().toISOString(),
    commit,
    sourceRoot: path.relative(ROOT, SOURCE_ROOT),
    summary: {
      windowCount: windows.length,
      pairCount: pairs.length,
      minDistance: round(minDistance),
      meanDistance: round(meanDistance),
      maxDistance: round(maxDistance),
      distinctPairRatio: round(distinctPairRatio),
      repetitionRisk: round(repetitionRisk),
      signatureScore10,
      closestPair: pairs[0] || null,
      mostDistinctPair: pairs.at(-1) || null,
      regularWindowCount: windows.filter(window => window.stageBand !== 'challenge').length,
      meanRegularDistance: round(meanRegularDistance),
      minRegularDistance: regularPairs[0]?.distance || 0,
      closestRegularPair: regularPairs[0] || null,
      meanMidLateDistance: round(meanMidLateDistance),
      minMidLateDistance: midLatePairs[0]?.distance || 0,
      closestMidLatePair: midLatePairs[0] || null,
      closestSameBandRegularPair: sameBandRegularPairs[0] || null
    },
    windows,
    pairs
  };
  writeJson(path.join(outDir, 'report.json'), report);

  const lines = [
    '# Stage Signature Distance',
    '',
    'This artifact compares Aurora evidence windows as gameplay signatures so level-arc conformance can penalize repetition with computation instead of narrative judgment.',
    '',
    `- Windows: ${report.summary.windowCount}`,
    `- Pairs: ${report.summary.pairCount}`,
    `- Signature score: ${report.summary.signatureScore10}/10`,
    `- Mean distance: ${report.summary.meanDistance}`,
    `- Minimum distance: ${report.summary.minDistance}`,
    `- Distinct pair ratio: ${report.summary.distinctPairRatio}`,
    `- Repetition risk: ${report.summary.repetitionRisk}`,
    `- Closest pair: ${report.summary.closestPair ? `${report.summary.closestPair.a} / ${report.summary.closestPair.b} (${report.summary.closestPair.distance})` : 'n/a'}`,
    `- Most distinct pair: ${report.summary.mostDistinctPair ? `${report.summary.mostDistinctPair.a} / ${report.summary.mostDistinctPair.b} (${report.summary.mostDistinctPair.distance})` : 'n/a'}`,
    `- Regular windows: ${report.summary.regularWindowCount}`,
    `- Mean regular distance: ${report.summary.meanRegularDistance}`,
    `- Minimum regular distance: ${report.summary.minRegularDistance}`,
    `- Minimum mid/late distance: ${report.summary.minMidLateDistance}`,
    `- Closest mid/late pair: ${report.summary.closestMidLatePair ? `${report.summary.closestMidLatePair.a} / ${report.summary.closestMidLatePair.b} (${report.summary.closestMidLatePair.distance})` : 'n/a'}`,
    `- Closest same-band regular pair: ${report.summary.closestSameBandRegularPair ? `${report.summary.closestSameBandRegularPair.a} / ${report.summary.closestSameBandRegularPair.b} (${report.summary.closestSameBandRegularPair.distance})` : 'n/a'}`,
    '',
    '## Windows',
    ''
  ];
  for(const window of windows){
    lines.push(`### ${window.id}`);
    lines.push(`- Scenario: ${window.scenario}`);
    lines.push(`- Stage: ${window.stage}`);
    lines.push(`- Stage band: ${window.stageBand}`);
    lines.push(`- Challenge: ${window.challenge}`);
    lines.push(`- Observed event families: ${window.observedEventFamilies.join(', ') || 'none'}`);
    lines.push(`- Pressure read: max attackers ${window.summary.max_attackers || 0}, max enemy bullets ${window.summary.max_enemy_bullets || 0}, max challenge enemies ${window.summary.max_challenge_enemies || 0}`);
    lines.push('');
  }
  lines.push('## Pair Distances');
  lines.push('');
  lines.push('| Pair | Distance |');
  lines.push('| --- | ---: |');
  for(const pair of pairs){
    lines.push(`| ${pair.a} / ${pair.b} | ${pair.distance} |`);
  }
  lines.push('');
  fs.writeFileSync(path.join(outDir, 'README.md'), `${lines.join('\n')}\n`);
  console.log(JSON.stringify({ ok: true, outDir, signatureScore10 }, null, 2));
}

main();
