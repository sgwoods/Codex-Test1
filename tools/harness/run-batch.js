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
    { scenario: 'stage1-opening', personas: ['novice','advanced','expert'], repeats: 1, seedBase: 1100 },
    { scenario: 'stage2-opening', personas: ['novice','advanced','expert'], repeats: 1, seedBase: 2100 },
    { scenario: 'stage3-challenge-persona', personas: ['novice','advanced','expert'], repeats: 1, seedBase: 3100 },
    { scenario: 'stage4-five-ships', personas: ['novice','advanced','expert'], repeats: 1, seedBase: 4100 },
    { scenario: 'stage4-survival', personas: ['novice','advanced','expert'], repeats: 1, seedBase: 4200 }
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

function summarize(batch){
  const report = {
    createdAt: new Date().toISOString(),
    profile: batch.profile,
    runs: batch.runs,
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
    const personaBucket = report.aggregate.byPersona[persona] || (report.aggregate.byPersona[persona] = { runs: 0, shipLost: 0, avgEndingStage: 0, avgSurvivalRatio: 0, avgChallengeHitRate: 0, scenarios: {} });
    const scenarioBucket = personaBucket.scenarios[scenario] || (personaBucket.scenarios[scenario] = { runs: 0, shipLost: 0, endingStage: [], survivalRatio: [], challengeHitRate: [] });
    const losses = (run.analysis?.shipLost || []).length;
    const survivalRatio = run.duration ? Math.min(1, (run.analysis?.duration || 0) / run.duration) : 0;
    const challengeRates = (run.analysis?.challengeClears || []).map(c => c.total ? c.hits / c.total : 0);
    personaBucket.runs++;
    personaBucket.shipLost += losses;
    scenarioBucket.runs++;
    scenarioBucket.shipLost += losses;
    scenarioBucket.endingStage.push(run.state?.stage || 0);
    scenarioBucket.survivalRatio.push(survivalRatio);
    scenarioBucket.challengeHitRate.push(...challengeRates);
  }
  for(const persona of Object.keys(report.aggregate.byPersona)){
    const bucket = report.aggregate.byPersona[persona];
    const scenarios = Object.values(bucket.scenarios);
    bucket.avgEndingStage = +avg(scenarios.flatMap(s => s.endingStage)).toFixed(3);
    bucket.avgSurvivalRatio = +avg(scenarios.flatMap(s => s.survivalRatio)).toFixed(3);
    bucket.avgChallengeHitRate = +avg(scenarios.flatMap(s => s.challengeHitRate)).toFixed(3);
    for(const [name, scenario] of Object.entries(bucket.scenarios)){
      bucket.scenarios[name] = {
        runs: scenario.runs,
        avgShipLosses: +(scenario.shipLost / Math.max(1, scenario.runs)).toFixed(3),
        avgEndingStage: +avg(scenario.endingStage).toFixed(3),
        avgSurvivalRatio: +avg(scenario.survivalRatio).toFixed(3),
        avgChallengeHitRate: +avg(scenario.challengeHitRate).toFixed(3)
      };
    }
  }
  return report;
}

async function main(){
  const args = parseArgs(process.argv.slice(2));
  const profile = PROFILES[args.profile || 'default'];
  if(args.help || !profile){
    console.log('Usage: npm run harness:batch -- --profile personas|quick|fidelity|default|deep');
    process.exit(args.help ? 0 : 1);
  }

  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const outDir = path.join(OUT_BASE, `batch-${args.profile || 'default'}-${stamp}`);
  fs.mkdirSync(outDir, { recursive: true });

  const batch = { profile: args.profile || 'default', runs: [], results: [] };
  for(const item of profile){
    const personas = item.personas && item.personas.length ? item.personas : [item.persona || null];
    for(let pIndex=0;pIndex<personas.length;pIndex++){
      const persona = personas[pIndex];
      for(let i=0;i<item.repeats;i++){
        const seed = item.seedBase + i + 1 + (persona ? pIndex * 100 : 0);
        const harnessArgs = ['--scenario', item.scenario, '--seed', String(seed), '--out', outDir];
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
