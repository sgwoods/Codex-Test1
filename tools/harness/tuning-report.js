#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

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

function readJson(file){ return JSON.parse(fs.readFileSync(file, 'utf8')); }

function loadBatch(dir){
  const root = path.resolve(dir);
  const batchReport = readJson(path.join(root, 'batch-report.json'));
  const runs = [];
  for(const entry of fs.readdirSync(root, { withFileTypes: true })){
    if(!entry.isDirectory()) continue;
    const summary = path.join(root, entry.name, 'summary.json');
    if(fs.existsSync(summary)) runs.push(readJson(summary));
  }
  return { root, batchReport, runs };
}

function avg(arr){
  if(!arr.length) return 0;
  return arr.reduce((a,b)=>a+b,0)/arr.length;
}

function scenarioRuns(runs, name){
  return runs.filter(r => (r.name || '').startsWith(name));
}

function stageFromState(run){ return run.state?.stage || 0; }

function makeFinding(priority, title, detail){
  return { priority, title, detail };
}

function buildReport(batch){
  const findings = [];
  const allRuns = batch.runs;
  const challengeRuns = scenarioRuns(allRuns, 'stage3-challenge');
  const stageRuns = scenarioRuns(allRuns, 'stage4-five-ships');

  const audioFailures = allRuns.filter(r => r.analysis?.video?.audio === false).length;
  if(audioFailures){
    findings.push(makeFinding(1, 'Recorder audio is still unreliable', `${audioFailures}/${allRuns.length} generated videos had no audio track.`));
  }

  const challengeRates = challengeRuns.flatMap(r => (r.analysis?.challengeClears || []).map(c => c.total ? c.hits / c.total : 0));
  const challengeAvg = avg(challengeRates);
  if(challengeRates.length){
    if(challengeAvg < 0.25) findings.push(makeFinding(1, 'Challenge-stage scoring is too low', `Average challenge hit rate is ${(challengeAvg*100).toFixed(1)}%, which is still well below a comfortable scoring window.`));
    else if(challengeAvg < 0.4) findings.push(makeFinding(2, 'Challenge-stage scoring is improving but still low', `Average challenge hit rate is ${(challengeAvg*100).toFixed(1)}%; patterns likely still need clearer lanes or more forgiving timing.`));
  }

  const stageShipLosses = stageRuns.map(r => (r.analysis?.shipLost || []).length);
  const stageLossAvg = avg(stageShipLosses);
  if(stageShipLosses.length){
    if(stageLossAvg >= 3) findings.push(makeFinding(1, 'Stage 4/5 pressure is too punishing', `Average ship losses in the stage-pressure scenario are ${stageLossAvg.toFixed(2)} per run.`));
    else if(stageLossAvg >= 2) findings.push(makeFinding(2, 'Stage 4/5 pressure still bunches up', `Average ship losses in the stage-pressure scenario are ${stageLossAvg.toFixed(2)} per run.`));
  }

  const stageProgress = stageRuns.map(stageFromState);
  const progressAvg = avg(stageProgress);
  if(stageProgress.length && progressAvg < 5){
    findings.push(makeFinding(2, 'Stage progression in the five-ship scenario is shallow', `Average ending stage is ${progressAvg.toFixed(2)}, suggesting later-stage survivability still limits useful comparison time.`));
  }

  if(!findings.length){
    findings.push(makeFinding(3, 'No obvious harness regressions', 'Audio, challenge scoring, and later-stage survivability all look within expected ranges for this batch.'));
  }

  findings.sort((a,b)=>a.priority-b.priority);
  const report = {
    createdAt: new Date().toISOString(),
    batchDir: batch.root,
    summary: {
      runs: allRuns.length,
      audioFailures,
      challengeAverageHitRate: +challengeAvg.toFixed(4),
      stagePressureAverageShipLosses: +stageLossAvg.toFixed(4),
      stagePressureAverageEndingStage: +progressAvg.toFixed(4)
    },
    findings
  };
  return report;
}

if(require.main === module){
  const args = parseArgs(process.argv.slice(2));
  if(args.help || !args.batch){
    console.log('Usage: node tools/harness/tuning-report.js --batch /absolute/path/to/batch-dir');
    process.exit(args.help ? 0 : 1);
  }
  const report = buildReport(loadBatch(args.batch));
  const out = path.join(path.resolve(args.batch), 'tuning-report.json');
  fs.writeFileSync(out, JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
}

module.exports = { buildReport, loadBatch };
