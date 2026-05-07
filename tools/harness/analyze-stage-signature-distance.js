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
    stagePresentationVariety: normalize(stagePresentationSet.size, 4)
  };
  for(const [family, rate] of Object.entries(eventRates(events, duration))){
    features[`eventRate:${family}`] = normalize(rate, 2);
  }

  return {
    id: path.basename(dir),
    scenario: manifest.scenario,
    stage: manifest.config?.stage || summary.final_stage || null,
    challenge: Boolean(manifest.config?.challenge || summary.final_challenge),
    duration,
    summary,
    observedEventFamilies: [...families].sort(),
    features
  };
}

function distance(a, b){
  const keys = [...new Set([...Object.keys(a.features), ...Object.keys(b.features)])].sort();
  const squared = keys.map(key => ((a.features[key] || 0) - (b.features[key] || 0)) ** 2);
  return round(Math.sqrt(squared.reduce((sum, value) => sum + value, 0) / Math.max(keys.length, 1)), 3);
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
      mostDistinctPair: pairs.at(-1) || null
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
    '',
    '## Windows',
    ''
  ];
  for(const window of windows){
    lines.push(`### ${window.id}`);
    lines.push(`- Scenario: ${window.scenario}`);
    lines.push(`- Stage: ${window.stage}`);
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
