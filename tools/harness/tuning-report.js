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
function runDuration(run){ return +((run.analysis?.duration || 0)); }
function configDuration(run){ return +((run.duration || 0)); }
function survivalRatio(run){
  const planned = configDuration(run);
  if(!planned) return 0;
  return Math.min(1, runDuration(run) / planned);
}
function endScore(run){ return +(run.state?.score || 0); }

function makeFinding(priority, title, detail){
  return { priority, title, detail };
}

function avgLossField(runs, pick){
  const vals = runs.flatMap(run => (run.analysis?.shipLost || []).map(pick)).filter(v => Number.isFinite(v));
  return avg(vals);
}

function totalCauseCount(runs, cause){
  return runs.reduce((sum, run) => sum + (run.analysis?.lossCauseCounts?.[cause] || 0), 0);
}

function buildReport(batch){
  const findings = [];
  const allRuns = batch.runs;
  const challengeRuns = scenarioRuns(allRuns, 'stage3-challenge');
  const stageRuns = scenarioRuns(allRuns, 'stage4-five-ships');
  const survivalRuns = scenarioRuns(allRuns, 'stage4-survival');
  const descentRuns = scenarioRuns(allRuns, 'stage1-descent');
  const rescueRuns = scenarioRuns(allRuns, 'rescue-dual');
  const secondCaptureRuns = scenarioRuns(allRuns, 'second-capture-current');
  const varietyRuns = scenarioRuns(allRuns, 'stage12-variety');

  const audioFailures = allRuns.filter(r => r.analysis?.video?.audio === false).length;
  if(audioFailures){
    findings.push(makeFinding(1, 'Recorder audio is still unreliable', `${audioFailures}/${allRuns.length} generated videos had no audio track.`));
  }

  const challengeRates = challengeRuns.flatMap(r => (r.analysis?.challengeClears || []).map(c => c.total ? c.hits / c.total : 0));
  const challengeAvg = avg(challengeRates);
  const challengeUpperBand = avg(challengeRuns.flatMap(r => (r.analysis?.challengeClears || []).map(c => +c.avgUpperBandTime).filter(v => Number.isFinite(v))));
  if(challengeRates.length){
    if(challengeAvg < 0.25) findings.push(makeFinding(1, 'Challenge-stage scoring is too low', `Average challenge hit rate is ${(challengeAvg*100).toFixed(1)}%, which is still well below a comfortable scoring window.`));
    else if(challengeAvg < 0.4) findings.push(makeFinding(2, 'Challenge-stage scoring is improving but still low', `Average challenge hit rate is ${(challengeAvg*100).toFixed(1)}%; patterns likely still need clearer lanes or more forgiving timing.`));
  }
  if(challengeUpperBand){
    findings.push(makeFinding(3, 'Challenge upper-band dwell time is now measurable', `Average upper-band dwell time is ${challengeUpperBand.toFixed(2)}s per target before the challenge clears.`));
  }

  const stageShipLosses = stageRuns.map(r => (r.analysis?.shipLost || []).length);
  const stageLossAvg = avg(stageShipLosses);
  const stageSurvival = stageRuns.map(survivalRatio);
  const stageSurvivalAvg = avg(stageSurvival);
  const stageScores = stageRuns.map(endScore);
  const stageScoreAvg = avg(stageScores);
  const stageFirstLossAvg = avg(stageRuns.map(r => (r.analysis?.shipLost || [])[0]?.t).filter(v => Number.isFinite(v)));
  const stageRecentAttackAvg = avgLossField(stageRuns, loss => loss.recentAttackStarts);
  const stageRecentBulletAvg = avgLossField(stageRuns, loss => loss.recentEnemyBullets);
  const stageActiveAttackersAvg = avgLossField(stageRuns, loss => loss.snapshot?.attackers || 0);
  const stageMinGapAvg = avg(stageRuns.map(run => run.analysis?.stageLossClusters?.['4']?.minGap).filter(v => Number.isFinite(v)));
  const stageBulletDeaths = totalCauseCount(stageRuns, 'enemy_bullet');
  const stageCollisionDeaths = totalCauseCount(stageRuns, 'enemy_collision');
  if(stageShipLosses.length){
    if(stageLossAvg >= 3 && stageSurvivalAvg < 0.9) findings.push(makeFinding(1, 'Stage 4/5 pressure is too punishing', `Average ship losses are ${stageLossAvg.toFixed(2)} per run and survival reaches only ${(stageSurvivalAvg*100).toFixed(1)}% of the scenario window.`));
    else if(stageLossAvg >= 4) findings.push(makeFinding(2, 'Stage 4/5 survives longer but still costs too many ships', `Average ship losses are ${stageLossAvg.toFixed(2)} per run even though survival reaches ${(stageSurvivalAvg*100).toFixed(1)}% of the scenario window.`));
    else if(stageLossAvg >= 2) findings.push(makeFinding(2, 'Stage 4/5 pressure still bunches up', `Average ship losses in the stage-pressure scenario are ${stageLossAvg.toFixed(2)} per run.`));
    if(stageFirstLossAvg && stageFirstLossAvg < 10) findings.push(makeFinding(1, 'Stage 4 opens too aggressively', `First ship loss arrives around ${stageFirstLossAvg.toFixed(2)}s on average, which is too early for the five-ship benchmark.`));
    if(stageRecentAttackAvg >= 2.5 || stageActiveAttackersAvg >= 2) findings.push(makeFinding(2, 'Stage 4 losses are happening under stacked pressure', `At loss moments there are about ${stageRecentAttackAvg.toFixed(2)} recent attack starts and ${stageActiveAttackersAvg.toFixed(2)} active attackers on average.`));
    if(stageMinGapAvg && stageMinGapAvg < 3.5) findings.push(makeFinding(2, 'Stage 4 deaths are still clustering too tightly', `Average minimum time between Stage 4 ship losses is ${stageMinGapAvg.toFixed(2)}s.`));
    if(stageCollisionDeaths > stageBulletDeaths) findings.push(makeFinding(2, 'Stage 4 losses skew toward direct collisions', `${stageCollisionDeaths} collision deaths vs ${stageBulletDeaths} bullet deaths were recorded in the stage-pressure scenario.`));
  }

  const stageProgress = stageRuns.map(stageFromState);
  const progressAvg = avg(stageProgress);
  if(stageProgress.length && progressAvg < 5){
    const survivalTxt = stageSurvival.length ? ` Survival averages ${(stageSurvivalAvg*100).toFixed(1)}% of the scenario window.` : '';
    findings.push(makeFinding(2, 'Stage progression in the five-ship scenario is shallow', `Average ending stage is ${progressAvg.toFixed(2)}, suggesting later-stage survivability still limits useful comparison time.${survivalTxt}`));
  }

  const survivalShipLosses = survivalRuns.map(r => (r.analysis?.shipLost || []).length);
  const survivalLossAvg = avg(survivalShipLosses);
  const survivalProgress = survivalRuns.map(stageFromState);
  const survivalProgressAvg = avg(survivalProgress);
  const survivalWindow = survivalRuns.map(survivalRatio);
  const survivalWindowAvg = avg(survivalWindow);
  const survivalBulletDeaths = totalCauseCount(survivalRuns, 'enemy_bullet');
  const survivalCollisionDeaths = totalCauseCount(survivalRuns, 'enemy_collision');
  if(survivalRuns.length){
    if(survivalWindowAvg < 0.95) findings.push(makeFinding(1, 'Stage 4 survival scenario still ends too early', `Average survival reaches only ${(survivalWindowAvg*100).toFixed(1)}% of the scenario window.`));
    else if(survivalLossAvg >= 3) findings.push(makeFinding(2, 'Stage 4 survival scenario still spends too many ships', `Average ship losses are ${survivalLossAvg.toFixed(2)} per run in the lower-input survival scenario.`));
    if(survivalProgressAvg < 5) findings.push(makeFinding(2, 'Stage 4 survival scenario is not progressing far enough', `Average ending stage is ${survivalProgressAvg.toFixed(2)} in the survival scenario.`));
    if(survivalCollisionDeaths > survivalBulletDeaths) findings.push(makeFinding(2, 'Stage 4 survival losses skew toward collisions', `${survivalCollisionDeaths} collision deaths vs ${survivalBulletDeaths} bullet deaths were recorded in the survival scenario.`));
  }

  const descentAvgs = descentRuns.map(r => r.analysis?.descent?.avgToLowerField || 0).filter(v => v > 0);
  const descentAvg = avg(descentAvgs);
  if(descentRuns.length && descentAvg){
    findings.push(makeFinding(3, 'Stage 1 descent speed baseline is now measurable', `Average time from attack start to lower-field crossing is ${descentAvg.toFixed(2)}s in the descent scenario. Use this as a comparison point against original Galaga footage.`));
  }

  const rescueCaptures = rescueRuns.map(r => r.analysis?.captureMetrics?.fightersRescued || 0);
  const dualCounts = rescueRuns.map(r => r.analysis?.dualMetrics?.count || 0);
  const dualSpread = rescueRuns.map(r => r.analysis?.dualMetrics?.avgSpread || 0).filter(v => v > 0);
  const dualSpreadAvg = avg(dualSpread);
  if(rescueRuns.length){
    if(avg(rescueCaptures) < 1) findings.push(makeFinding(1, 'Rescue scenario is not producing a rescued fighter', 'The rescue-dual scenario did not consistently trigger a rescue event.'));
    else if(avg(dualCounts) < 1) findings.push(makeFinding(1, 'Rescue scenario is not exercising dual-fire mode', 'A fighter was rescued, but no dual-fire shots were recorded afterward.'));
    else if(dualSpreadAvg > 24) findings.push(makeFinding(2, 'Dual-fighter shot spread still looks wide', `Average dual-shot spread is ${dualSpreadAvg.toFixed(1)}px in the rescue scenario.`));
  }

  if(secondCaptureRuns.length){
    const captures = secondCaptureRuns.map(r => r.analysis?.captureMetrics?.fightersCaptured || 0);
    const starts = secondCaptureRuns.map(r => r.analysis?.captureMetrics?.captureStarts || 0);
    if(avg(captures) >= 1 || avg(starts) >= 1){
      findings.push(makeFinding(2, 'Current game allows a second capture attempt with one fighter already carried', `The second-capture scenario recorded ${avg(starts).toFixed(1)} capture starts and ${avg(captures).toFixed(1)} completed captures on average.`));
    }else{
      findings.push(makeFinding(3, 'Current game appears to block second capture in the dedicated scenario', 'The second-capture scenario did not record a new capture start or completed capture.'));
    }
  }

  if(varietyRuns.length){
    const nonClassicBands = varietyRuns.flatMap(r => r.analysis?.varietyMetrics?.nonClassicBands || []);
    const nonClassicFamilies = varietyRuns.flatMap(r => r.analysis?.varietyMetrics?.nonClassicFamilies || []);
    if(!nonClassicBands.length || !nonClassicFamilies.length){
      findings.push(makeFinding(2, 'Later-stage variety scenario is not surfacing distinct enemy families', 'The dedicated later-stage variety scenario did not record any non-classic stage bands or enemy families.'));
    }else{
      findings.push(makeFinding(3, 'Later-stage variety is now measurable', `Observed bands: ${[...new Set(nonClassicBands)].join(', ')}. Observed families: ${[...new Set(nonClassicFamilies)].join(', ')}.`));
    }
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
      challengeAverageUpperBandTime: +challengeUpperBand.toFixed(4),
      stagePressureAverageShipLosses: +stageLossAvg.toFixed(4),
      stagePressureAverageEndingStage: +progressAvg.toFixed(4),
      stagePressureAverageSurvivalRatio: +stageSurvivalAvg.toFixed(4),
      stagePressureAverageEndScore: +stageScoreAvg.toFixed(2),
      stagePressureAverageFirstLossTime: +stageFirstLossAvg.toFixed(4),
      stagePressureAverageRecentAttackStartsAtLoss: +stageRecentAttackAvg.toFixed(4),
      stagePressureAverageRecentEnemyBulletsAtLoss: +stageRecentBulletAvg.toFixed(4),
      stagePressureAverageActiveAttackersAtLoss: +stageActiveAttackersAvg.toFixed(4),
      stagePressureAverageMinLossGap: +stageMinGapAvg.toFixed(4),
      stagePressureBulletDeaths: stageBulletDeaths,
      stagePressureCollisionDeaths: stageCollisionDeaths,
      stageSurvivalAverageShipLosses: +survivalLossAvg.toFixed(4),
      stageSurvivalAverageEndingStage: +survivalProgressAvg.toFixed(4),
      stageSurvivalAverageSurvivalRatio: +survivalWindowAvg.toFixed(4),
      stageSurvivalBulletDeaths: survivalBulletDeaths,
      stageSurvivalCollisionDeaths: survivalCollisionDeaths,
      stage1AverageDescentToLowerField: +descentAvg.toFixed(4),
      rescueAverageDualSpread: +dualSpreadAvg.toFixed(4),
      laterStageVarietyBands: [...new Set(varietyRuns.flatMap(r => r.analysis?.varietyMetrics?.nonClassicBands || []))],
      laterStageVarietyFamilies: [...new Set(varietyRuns.flatMap(r => r.analysis?.varietyMetrics?.nonClassicFamilies || []))]
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
