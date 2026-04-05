#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const { buildReport, loadBatch } = require('./tuning-report');

const ROOT = path.resolve(__dirname, '..', '..');
const HARNESS = path.join(__dirname, 'run-gameplay.js');
const OUT_BASE = path.join(ROOT, 'harness-artifacts');

const PROFILES = {
  personas: [
    { scenario: 'stage1-opening', personas: ['novice','advanced','expert','professional'], repeats: 1, seedBase: 1100 },
    { scenario: 'stage2-opening', personas: ['novice','advanced','expert','professional'], repeats: 1, seedBase: 2100 },
    { scenario: 'stage3-challenge-persona', personas: ['novice','advanced','expert','professional'], repeats: 1, seedBase: 3100 },
    { scenario: 'stage4-five-ships', personas: ['novice','advanced','expert','professional'], repeats: 1, seedBase: 4100 },
    { scenario: 'stage4-survival', personas: ['novice','advanced','expert','professional'], repeats: 1, seedBase: 4200 }
  ],
  distribution: [
    { scenario: 'full-run-persona', personas: ['novice','advanced','expert','professional'], repeats: 1, seedBase: 51000 }
  ],
  quick: [
    { scenario: 'stage3-transition', repeats: 1, seedBase: 3000 },
    { scenario: 'stage4-five-ships', repeats: 1, seedBase: 4000 },
    { scenario: 'stage4-survival', repeats: 1, seedBase: 4100 }
  ],
  fidelity: [
    { scenario: 'stage3-challenge', repeats: 1, seedBase: 3002 },
    { scenario: 'stage6-regular', repeats: 1, seedBase: 6000 },
    { scenario: 'stage7-challenge', repeats: 1, seedBase: 7000 },
    { scenario: 'stage3-transition', repeats: 1, seedBase: 3000 },
    { scenario: 'stage1-descent', repeats: 1, seedBase: 2000 },
    { scenario: 'rescue-dual', repeats: 1, seedBase: 5000 },
    { scenario: 'capture-rescue-dual', repeats: 1, seedBase: 5006 },
    { scenario: 'carried-boss-diving-release', repeats: 1, seedBase: 5008 },
    { scenario: 'carried-boss-formation-hostile', repeats: 1, seedBase: 5010 },
    { scenario: 'natural-capture-cycle', repeats: 1, seedBase: 5012 },
    { scenario: 'stage4-capture-pressure', repeats: 1, seedBase: 5020 },
    { scenario: 'second-capture-current', repeats: 1, seedBase: 6000 },
    { scenario: 'repeat-capture-stage', repeats: 1, seedBase: 6010 },
    { scenario: 'stage12-variety', repeats: 1, seedBase: 12000 }
  ],
  default: [
    { scenario: 'stage3-transition', repeats: 2, seedBase: 3000 },
    { scenario: 'stage4-five-ships', repeats: 2, seedBase: 4000 },
    { scenario: 'stage4-survival', repeats: 2, seedBase: 4100 }
  ],
  deep: [
    { scenario: 'stage3-transition', repeats: 3, seedBase: 3000 },
    { scenario: 'stage4-five-ships', repeats: 3, seedBase: 4000 },
    { scenario: 'stage4-survival', repeats: 3, seedBase: 4100 }
  ]
};

function parseArgs(argv){
  const args = {};
  for(let i=0;i<argv.length;i++){
    const a = argv[i];
    if(!a.startsWith('--')) continue;
    const key = a.slice(2);
    const next = argv[i+1];
    if(!next || next.startsWith('--')) args[key] = true;
    else { args[key] = next; i++; }
  }
  return args;
}

function runHarness(args){
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [HARNESS, ...args], { cwd: ROOT, stdio: ['ignore', 'pipe', 'pipe'] });
    let out = '', err = '';
    child.stdout.on('data', d => out += d);
    child.stderr.on('data', d => err += d);
    child.on('close', code => {
      if(code !== 0) return reject(new Error(err || out || `harness exited ${code}`));
      try{ resolve(JSON.parse(out.trim())); }
      catch(e){ reject(new Error(`Could not parse harness output:\n${out}\n${err}`)); }
    });
  });
}

function avg(arr){
  if(!arr.length) return 0;
  return arr.reduce((a,b)=>a+b,0)/arr.length;
}

function percentile(arr, p){
  if(!arr.length) return 0;
  const sorted = [...arr].sort((a,b)=>a-b);
  const idx = (sorted.length - 1) * p;
  const lo = Math.floor(idx);
  const hi = Math.ceil(idx);
  if(lo === hi) return sorted[lo];
  const frac = idx - lo;
  return sorted[lo] + (sorted[hi] - sorted[lo]) * frac;
}

function statSeries(arr, digits=3){
  if(!arr.length){
    return { count: 0, avg: 0, median: 0, min: 0, max: 0, p10: 0, p90: 0 };
  }
  const fix = n => +n.toFixed(digits);
  return {
    count: arr.length,
    avg: fix(avg(arr)),
    median: fix(percentile(arr, 0.5)),
    min: fix(Math.min(...arr)),
    max: fix(Math.max(...arr)),
    p10: fix(percentile(arr, 0.1)),
    p90: fix(percentile(arr, 0.9))
  };
}

function addCounts(into, next){
  for(const [key, value] of Object.entries(next || {})){
    into[key] = (into[key] || 0) + value;
  }
}

function addPressure(into, next){
  if(!next) return;
  into.attacks += next.attacks || 0;
  into.bullets += next.bullets || 0;
  into.shipLosses += next.shipLosses || 0;
  into.bulletDeaths += next.bulletDeaths || 0;
  into.collisionDeaths += next.collisionDeaths || 0;
  into.lossesWithBulletsOnScreen += next.lossesWithBulletsOnScreen || 0;
  into.lossesWithoutBulletsOnScreen += next.lossesWithoutBulletsOnScreen || 0;
  into.lossesWithRecentEnemyBullets += next.lossesWithRecentEnemyBullets || 0;
  into.lossesWithoutRecentEnemyBullets += next.lossesWithoutRecentEnemyBullets || 0;
  if(Number.isFinite(next.avgRecentEnemyBulletsAtLoss)) into._recentEnemyBulletsAtLoss.push(next.avgRecentEnemyBulletsAtLoss);
  if(Number.isFinite(next.avgAttackersOnScreenAtLoss)) into._attackersOnScreenAtLoss.push(next.avgAttackersOnScreenAtLoss);
}

function makePressureBucket(){
  return {
    attacks: 0,
    bullets: 0,
    shipLosses: 0,
    bulletDeaths: 0,
    collisionDeaths: 0,
    lossesWithBulletsOnScreen: 0,
    lossesWithoutBulletsOnScreen: 0,
    lossesWithRecentEnemyBullets: 0,
    lossesWithoutRecentEnemyBullets: 0,
    _recentEnemyBulletsAtLoss: [],
    _attackersOnScreenAtLoss: []
  };
}

function finalizePressure(bucket){
  bucket.bulletsPerAttack = bucket.attacks ? +(bucket.bullets / bucket.attacks).toFixed(3) : 0;
  bucket.avgRecentEnemyBulletsAtLoss = +avg(bucket._recentEnemyBulletsAtLoss).toFixed(3);
  bucket.avgAttackersOnScreenAtLoss = +avg(bucket._attackersOnScreenAtLoss).toFixed(3);
  delete bucket._recentEnemyBulletsAtLoss;
  delete bucket._attackersOnScreenAtLoss;
  return bucket;
}

function summarize(batch){
  const report = {
    createdAt: new Date().toISOString(),
    profile: batch.profile,
    runs: batch.runs,
    findings: [],
    aggregate: {
      totalRuns: batch.runs.length,
      totalDuration: 0,
      audioFailures: 0,
      challengeHits: [],
      shipLost: 0,
      byPersona: {}
    }
  };
  for(const run of batch.results){
    report.aggregate.totalDuration += run.analysis?.duration || 0;
    if(run.analysis?.video?.audio === false) report.aggregate.audioFailures++;
    for(const c of run.analysis?.challengeClears || []) report.aggregate.challengeHits.push({ scenario: run.name, hits: c.hits, total: c.total, stage: c.stage });
    report.aggregate.shipLost += (run.analysis?.shipLost || []).length;
    const persona = run.persona || 'default';
    const scenario = run.name;
    const personaBucket = report.aggregate.byPersona[persona] || (report.aggregate.byPersona[persona] = {
      runs: 0,
      shipLost: 0,
      gameOvers: 0,
      avgEndingStage: 0,
      avgSurvivalRatio: 0,
      avgChallengeHitRate: 0,
      scenarios: {},
      endingStage: [],
      survivalRatio: [],
      challengeHitRate: [],
      score: [],
      duration: [],
      livesLeft: [],
      stageClears: [],
      lossCauseCounts: {},
      pressure: makePressureBucket(),
      pressureByStage: {}
    });
    const scenarioBucket = personaBucket.scenarios[scenario] || (personaBucket.scenarios[scenario] = {
      runs: 0,
      shipLost: 0,
      gameOvers: 0,
      endingStage: [],
      survivalRatio: [],
      challengeHitRate: [],
      score: [],
      duration: [],
      livesLeft: [],
      stageClears: [],
      lossCauseCounts: {},
      pressure: makePressureBucket(),
      pressureByStage: {}
    });
    const losses = (run.analysis?.shipLost || []).length;
    const survivalRatio = run.duration ? Math.min(1, (run.analysis?.duration || 0) / run.duration) : 0;
    const challengeRates = (run.analysis?.challengeClears || []).map(c => c.total ? c.hits / c.total : 0);
    const endingStage = run.state?.stage || 0;
    const score = +(run.state?.score || 0);
    const duration = +(run.analysis?.duration || 0);
    const livesLeft = +(run.state?.lives || 0);
    const stageClears = (run.analysis?.stageClears || []).length;
    const gameOver = !run.state?.started && livesLeft === 0;
    personaBucket.runs++;
    personaBucket.shipLost += losses;
    personaBucket.gameOvers += gameOver ? 1 : 0;
    personaBucket.endingStage.push(endingStage);
    personaBucket.survivalRatio.push(survivalRatio);
    personaBucket.challengeHitRate.push(...challengeRates);
    personaBucket.score.push(score);
    personaBucket.duration.push(duration);
    personaBucket.livesLeft.push(livesLeft);
    personaBucket.stageClears.push(stageClears);
    addCounts(personaBucket.lossCauseCounts, run.analysis?.lossCauseCounts || {});
    addPressure(personaBucket.pressure, run.analysis?.bulletPressure?.overall);
    for(const [stage, metrics] of Object.entries(run.analysis?.bulletPressure?.byStage || {})){
      const stageBucket = personaBucket.pressureByStage[stage] || (personaBucket.pressureByStage[stage] = makePressureBucket());
      addPressure(stageBucket, metrics);
    }
    scenarioBucket.runs++;
    scenarioBucket.shipLost += losses;
    scenarioBucket.gameOvers += gameOver ? 1 : 0;
    scenarioBucket.endingStage.push(endingStage);
    scenarioBucket.survivalRatio.push(survivalRatio);
    scenarioBucket.challengeHitRate.push(...challengeRates);
    scenarioBucket.score.push(score);
    scenarioBucket.duration.push(duration);
    scenarioBucket.livesLeft.push(livesLeft);
    scenarioBucket.stageClears.push(stageClears);
    addCounts(scenarioBucket.lossCauseCounts, run.analysis?.lossCauseCounts || {});
    addPressure(scenarioBucket.pressure, run.analysis?.bulletPressure?.overall);
    for(const [stage, metrics] of Object.entries(run.analysis?.bulletPressure?.byStage || {})){
      const stageBucket = scenarioBucket.pressureByStage[stage] || (scenarioBucket.pressureByStage[stage] = makePressureBucket());
      addPressure(stageBucket, metrics);
    }
  }
  for(const persona of Object.keys(report.aggregate.byPersona)){
    const bucket = report.aggregate.byPersona[persona];
    const scenarios = Object.values(bucket.scenarios);
    bucket.avgEndingStage = +avg(bucket.endingStage).toFixed(3);
    bucket.avgSurvivalRatio = +avg(bucket.survivalRatio).toFixed(3);
    bucket.avgChallengeHitRate = +avg(bucket.challengeHitRate).toFixed(3);
    bucket.avgScore = +avg(bucket.score).toFixed(2);
    bucket.avgDuration = +avg(bucket.duration).toFixed(3);
    bucket.avgLivesLeft = +avg(bucket.livesLeft).toFixed(3);
    bucket.avgStageClears = +avg(bucket.stageClears).toFixed(3);
    bucket.avgShipLosses = +(bucket.shipLost / Math.max(1, bucket.runs)).toFixed(3);
    bucket.gameOverRate = +(bucket.gameOvers / Math.max(1, bucket.runs)).toFixed(3);
    bucket.scoreStats = statSeries(bucket.score, 2);
    bucket.durationStats = statSeries(bucket.duration, 3);
    bucket.endingStageStats = statSeries(bucket.endingStage, 3);
    bucket.livesLeftStats = statSeries(bucket.livesLeft, 3);
    bucket.stageClearStats = statSeries(bucket.stageClears, 3);
    bucket.pressure = finalizePressure(bucket.pressure);
    bucket.pressureByStage = Object.fromEntries(Object.entries(bucket.pressureByStage).map(([stage, pressure]) => [stage, finalizePressure(pressure)]));
    bucket.stageReachRates = {};
    const maxStage = Math.max(1, ...bucket.endingStage);
    for(let stage=2; stage<=maxStage; stage++){
      bucket.stageReachRates[stage] = +(bucket.endingStage.filter(v => v >= stage).length / Math.max(1, bucket.runs)).toFixed(3);
    }
    for(const [name, scenario] of Object.entries(bucket.scenarios)){
      bucket.scenarios[name] = {
        runs: scenario.runs,
        avgShipLosses: +(scenario.shipLost / Math.max(1, scenario.runs)).toFixed(3),
        gameOverRate: +(scenario.gameOvers / Math.max(1, scenario.runs)).toFixed(3),
        avgEndingStage: +avg(scenario.endingStage).toFixed(3),
        avgSurvivalRatio: +avg(scenario.survivalRatio).toFixed(3),
        avgChallengeHitRate: +avg(scenario.challengeHitRate).toFixed(3),
        avgScore: +avg(scenario.score).toFixed(2),
        avgDuration: +avg(scenario.duration).toFixed(3),
        avgLivesLeft: +avg(scenario.livesLeft).toFixed(3),
        avgStageClears: +avg(scenario.stageClears).toFixed(3),
        scoreStats: statSeries(scenario.score, 2),
        durationStats: statSeries(scenario.duration, 3),
        endingStageStats: statSeries(scenario.endingStage, 3),
        livesLeftStats: statSeries(scenario.livesLeft, 3),
        stageClearStats: statSeries(scenario.stageClears, 3),
        lossCauseCounts: scenario.lossCauseCounts,
        pressure: finalizePressure(scenario.pressure),
        pressureByStage: Object.fromEntries(Object.entries(scenario.pressureByStage).map(([stage, pressure]) => [stage, finalizePressure(pressure)]))
      };
    }
    delete bucket.endingStage;
    delete bucket.survivalRatio;
    delete bucket.challengeHitRate;
    delete bucket.score;
    delete bucket.duration;
    delete bucket.livesLeft;
    delete bucket.stageClears;
  }
  const ordered = ['novice','advanced','expert','professional'].filter(k => report.aggregate.byPersona[k]);
  for(let i=1;i<ordered.length;i++){
    const prev = report.aggregate.byPersona[ordered[i-1]];
    const next = report.aggregate.byPersona[ordered[i]];
    if(next.avgScore < prev.avgScore){
      report.findings.push({
        priority: 1,
        title: `${next.runs > 1 ? 'Higher-skill distribution regressed' : 'Higher-skill sample underperformed'}`,
        detail: `${ordered[i]} averaged ${next.avgScore.toFixed(2)} points versus ${prev.avgScore.toFixed(2)} for ${ordered[i-1]}.`
      });
    }
    if(next.avgEndingStage < prev.avgEndingStage){
      report.findings.push({
        priority: 1,
        title: 'Persona progression is out of order',
        detail: `${ordered[i]} averaged ending stage ${next.avgEndingStage.toFixed(2)} versus ${prev.avgEndingStage.toFixed(2)} for ${ordered[i-1]}.`
      });
    }
  }
  for(const persona of ordered){
    const bucket = report.aggregate.byPersona[persona];
    if(bucket.shipLost > 0 && (bucket.lossCauseCounts.enemy_collision || 0) === bucket.shipLost){
      report.findings.push({
        priority: 2,
        title: `${persona} deaths are collision-dominated`,
        detail: `All ${bucket.shipLost} recorded ship losses for ${persona} came from enemy collisions.`
      });
    }
    if(bucket.pressure.shipLosses > 0 && bucket.pressure.lossesWithoutBulletsOnScreen === bucket.pressure.shipLosses){
      report.findings.push({
        priority: 2,
        title: `${persona} losses happen without bullets on screen`,
        detail: `All ${bucket.pressure.shipLosses} ship losses for ${persona} happened with zero enemy bullets visible in the nearest snapshot.`
      });
    }
  }
  report.findings.sort((a,b)=>a.priority-b.priority);
  return report;
}

async function main(){
  const args = parseArgs(process.argv.slice(2));
  const profile = PROFILES[args.profile || 'default'];
  if(args.help || !profile){
    console.log('Usage: npm run harness:batch -- --profile personas|distribution|quick|fidelity|default|deep [--repeats N]');
    process.exit(args.help ? 0 : 1);
  }
  const repeatMul = Math.max(1, parseInt(args.repeats || '1', 10) || 1);

  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const outDir = path.join(OUT_BASE, `batch-${args.profile || 'default'}-${stamp}`);
  fs.mkdirSync(outDir, { recursive: true });

  const batch = { profile: args.profile || 'default', runs: [], results: [] };
  for(const item of profile){
    const personas = item.personas && item.personas.length ? item.personas : [item.persona || null];
    for(let i=0;i<item.repeats * repeatMul;i++){
      for(let pIndex=0;pIndex<personas.length;pIndex++){
        const persona = personas[pIndex];
        const seed = item.seedBase + i + 1 + (persona ? pIndex * 100 : 0);
        const harnessArgs = ['--scenario', item.scenario, '--seed', String(seed), '--out', outDir, '--auto-video', '0'];
        if(persona) harnessArgs.push('--persona', persona);
        const result = await runHarness(harnessArgs);
        batch.runs.push({ scenario: item.scenario, persona, seed });
        batch.results.push(result);
      }
    }
  }

  const report = summarize(batch);
  fs.writeFileSync(path.join(outDir, 'batch-report.json'), JSON.stringify(report, null, 2));
  const tuning = buildReport(loadBatch(outDir));
  fs.writeFileSync(path.join(outDir, 'tuning-report.json'), JSON.stringify(tuning, null, 2));
  console.log(JSON.stringify({ outDir, report, tuning }, null, 2));
}

main().catch(err => {
  console.error(err && err.stack || String(err));
  process.exit(1);
});
