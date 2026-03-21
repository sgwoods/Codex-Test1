#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const { buildReport, loadBatch } = require('./tuning-report');

const ROOT = path.resolve(__dirname, '..', '..');
const HARNESS = path.join(__dirname, 'run-gameplay.js');
const OUT_BASE = path.join(ROOT, 'harness-artifacts');

const PROFILES = {
  quick: [
    { scenario: 'stage3-challenge', repeats: 1, seedBase: 3000 },
    { scenario: 'stage4-five-ships', repeats: 1, seedBase: 4000 },
    { scenario: 'stage4-survival', repeats: 1, seedBase: 4100 }
  ],
  fidelity: [
    { scenario: 'stage1-descent', repeats: 1, seedBase: 2000 },
    { scenario: 'rescue-dual', repeats: 1, seedBase: 5000 },
    { scenario: 'second-capture-current', repeats: 1, seedBase: 6000 },
    { scenario: 'repeat-capture-stage', repeats: 1, seedBase: 6010 },
    { scenario: 'stage12-variety', repeats: 1, seedBase: 12000 }
  ],
  default: [
    { scenario: 'stage3-challenge', repeats: 2, seedBase: 3000 },
    { scenario: 'stage4-five-ships', repeats: 2, seedBase: 4000 },
    { scenario: 'stage4-survival', repeats: 2, seedBase: 4100 }
  ],
  deep: [
    { scenario: 'stage3-challenge', repeats: 3, seedBase: 3000 },
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
      shipLost: 0
    }
  };
  for(const run of batch.results){
    report.aggregate.totalDuration += run.analysis?.duration || 0;
    if(run.analysis?.video?.audio === false) report.aggregate.audioFailures++;
    for(const c of run.analysis?.challengeClears || []) report.aggregate.challengeHits.push({ scenario: run.name, hits: c.hits, total: c.total, stage: c.stage });
    report.aggregate.shipLost += (run.analysis?.shipLost || []).length;
  }
  return report;
}

async function main(){
  const args = parseArgs(process.argv.slice(2));
  const profile = PROFILES[args.profile || 'default'];
  if(args.help || !profile){
    console.log('Usage: npm run harness:batch -- --profile quick|default|deep');
    process.exit(args.help ? 0 : 1);
  }

  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const outDir = path.join(OUT_BASE, `batch-${args.profile || 'default'}-${stamp}`);
  fs.mkdirSync(outDir, { recursive: true });

  const batch = { profile: args.profile || 'default', runs: [], results: [] };
  for(const item of profile){
    for(let i=0;i<item.repeats;i++){
      const seed = item.seedBase + i + 1;
      const result = await runHarness(['--scenario', item.scenario, '--seed', String(seed), '--out', outDir]);
      batch.runs.push({ scenario: item.scenario, seed });
      batch.results.push(result);
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
