#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..', '..');
const ANALYSES = path.join(ROOT, 'reference-artifacts', 'analyses');
const OUT_ROOT = path.join(ANALYSES, 'aurora-audio-promotion-stability-gate');
const CANDIDATE_ROOT = path.join(ANALYSES, 'aurora-audio-cue-candidates');
const PRECHECK_ROOT = path.join(ANALYSES, 'aurora-audio-promotion-precheck');
const RISK_STABILITY = path.join(ANALYSES, 'aurora-audio-risk-stability', 'latest.json');
const EVENT_GAP = path.join(ANALYSES, 'aurora-audio-event-gap', 'latest.json');

const CANDIDATE_FILES = Object.freeze({
  challengePerfect: 'latest-challenge-perfect.json',
  challengeTransition: 'latest-challenge-transition.json',
  gameOver: 'latest-game-over.json',
  rescueJoin: 'latest-rescue-join.json',
  playerHit: 'latest-player-hit-focus.json',
  stagePulse: 'latest-formation-pulse.json',
  enemyHit: 'latest-enemy-hit.json',
  enemyBoom: 'latest-enemy-boom.json',
  bossHit: 'latest-boss-hit.json',
  bossBoom: 'latest-boss-boom.json'
});

function argValue(name, fallback = ''){
  const prefix = `--${name}=`;
  const inline = process.argv.find(arg => arg.startsWith(prefix));
  if(inline) return inline.slice(prefix.length);
  const index = process.argv.indexOf(`--${name}`);
  if(index >= 0 && process.argv[index + 1]) return process.argv[index + 1];
  return fallback;
}

function ensureDir(dir){
  fs.mkdirSync(dir, { recursive: true });
}

function readJson(file){
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function writeJson(file, value){
  ensureDir(path.dirname(file));
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
}

function rel(file){
  return path.relative(ROOT, file).split(path.sep).join('/');
}

function round(value, digits = 3){
  return Number.isFinite(+value) ? +(+value).toFixed(digits) : null;
}

function git(args, fallback = ''){
  try{
    return execFileSync('git', ['-C', ROOT, ...args], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
  }catch{
    return fallback;
  }
}

function walkReports(root){
  const reports = [];
  function walk(dir){
    if(!fs.existsSync(dir)) return;
    for(const entry of fs.readdirSync(dir, { withFileTypes: true })){
      const full = path.join(dir, entry.name);
      if(entry.isDirectory()) walk(full);
      else if(entry.isFile() && entry.name === 'report.json') reports.push(full);
    }
  }
  walk(root);
  return reports.sort((a, b) => fs.statSync(a).mtimeMs - fs.statSync(b).mtimeMs || a.localeCompare(b));
}

function latestPrecheck(cue){
  return walkReports(PRECHECK_ROOT)
    .map(file => {
      try{
        const report = readJson(file);
        return report.cue === cue ? { file, report } : null;
      }catch{
        return null;
      }
    })
    .filter(Boolean)
    .pop() || null;
}

function latestCandidate(cue){
  const fileName = CANDIDATE_FILES[cue];
  if(!fileName) return null;
  const file = path.join(CANDIDATE_ROOT, fileName);
  if(!fs.existsSync(file)) return null;
  const report = readJson(file);
  return { file, report };
}

function cueRiskRow(eventGap, cue){
  return (eventGap?.comparedCueRisks || []).find(row => row.cue === cue) || null;
}

function stabilityRow(stability, cue){
  return (stability?.cues || []).find(row => row.cue === cue) || null;
}

function candidateId(candidate){
  return candidate?.report?.decision?.best || candidate?.report?.decision?.measuredBest || '';
}

function precheckDelta(precheck){
  const current = precheck?.report?.decision?.currentCueRow || null;
  const simulated = precheck?.report?.decision?.simulatedCueRow || null;
  return {
    cueGapImprovement10: Number.isFinite(+current?.gapRisk10) && Number.isFinite(+simulated?.gapRisk10)
      ? round(+current.gapRisk10 - +simulated.gapRisk10, 2)
      : null,
    worstSegmentImprovement10: Number.isFinite(+current?.worstSegmentRisk10) && Number.isFinite(+simulated?.worstSegmentRisk10)
      ? round(+current.worstSegmentRisk10 - +simulated.worstSegmentRisk10, 2)
      : null,
    averageWorstSegmentDelta10: precheck?.report?.decision?.summaryDelta?.averageWorstSegmentRisk10 ?? null
  };
}

function noiseFloor(row){
  const range = Math.max(+row?.gapRiskRange10 || 0, +row?.worstSegmentRange10 || 0);
  const sd = Math.max(+row?.gapRiskStddev10 || 0, +row?.worstSegmentStddev10 || 0);
  return {
    measuredRange10: round(range, 2),
    measuredStddev10: round(sd, 2),
    requiredCueGapWin10: round(Math.max(row?.volatile ? 0.35 : 0.12, range * (row?.volatile ? 0.65 : 0.25), sd * 2), 2),
    requiredSegmentWin10: round(Math.max(row?.volatile ? 0.18 : 0.08, (+row?.worstSegmentRange10 || 0) * (row?.volatile ? 0.45 : 0.2), (+row?.worstSegmentStddev10 || 0) * 1.5), 2)
  };
}

function globalStabilityRead(stability){
  const cueCount = +stability?.summary?.cueCount || 0;
  const volatileCueCount = +stability?.summary?.volatileCueCount || 0;
  const volatileShare = cueCount ? volatileCueCount / cueCount : 0;
  return {
    cueCount,
    volatileCueCount,
    volatileShare: round(volatileShare, 3),
    mostVolatileCue: stability?.summary?.mostVolatileCue || '',
    mostVolatileRange10: stability?.summary?.mostVolatileRange10 ?? null,
    unstable: cueCount >= 8 && volatileShare >= .45
  };
}

function gateCue({ cue, candidate, precheck, stability, eventGap, globalStability }){
  const candidateDecision = candidate?.report?.decision || null;
  const riskRow = cueRiskRow(eventGap, cue);
  const stable = stabilityRow(stability, cue);
  const noise = noiseFloor(stable || {});
  const delta = precheckDelta(precheck);
  const blockers = [];
  const warnings = [];
  const wins = [];

  if(!candidate) blockers.push('No focused candidate report exists for this cue.');
  else if(candidateDecision?.keep !== true) blockers.push(candidateDecision?.reason || 'Focused candidate did not clear keeper gates.');

  if(!precheck) blockers.push('No full-theme promotion precheck exists for this cue.');
  else if(precheck.report?.decision?.allowRuntimeTrial !== true) blockers.push(`Promotion precheck rejected: ${(precheck.report?.decision?.blockers || []).join('; ') || 'blocked by full-theme guardrail'}.`);

  if(!stable) blockers.push('No repeated event-gap stability row exists for this cue.');
  else if(stable.volatile){
    warnings.push(`Cue is volatile across repeated full-theme reads (${noise.measuredRange10}/10 range); single-run wins must clear the noise floor.`);
  }

  if(globalStability?.unstable){
    blockers.push(`Global audio scoring is unstable (${globalStability.volatileCueCount}/${globalStability.cueCount} cues volatile; most volatile ${globalStability.mostVolatileCue} ${globalStability.mostVolatileRange10}/10), so runtime promotion is blocked until scorer/capture stability improves.`);
  }

  if(Number.isFinite(+delta.cueGapImprovement10)){
    if(delta.cueGapImprovement10 >= noise.requiredCueGapWin10) wins.push(`Cue gap win ${delta.cueGapImprovement10}/10 clears ${noise.requiredCueGapWin10}/10 stability threshold.`);
    else blockers.push(`Cue gap win ${delta.cueGapImprovement10}/10 does not clear ${noise.requiredCueGapWin10}/10 stability threshold.`);
  }else if(precheck){
    blockers.push('Promotion precheck did not expose a comparable cue-gap delta.');
  }

  if(Number.isFinite(+delta.worstSegmentImprovement10)){
    if(delta.worstSegmentImprovement10 >= noise.requiredSegmentWin10) wins.push(`Worst-segment win ${delta.worstSegmentImprovement10}/10 clears ${noise.requiredSegmentWin10}/10 stability threshold.`);
    else if(delta.worstSegmentImprovement10 >= -0.05) warnings.push(`Worst-segment win ${delta.worstSegmentImprovement10}/10 is neutral but does not clear the ${noise.requiredSegmentWin10}/10 threshold.`);
    else blockers.push(`Worst segment worsens by ${Math.abs(delta.worstSegmentImprovement10)}/10.`);
  }

  if(Number.isFinite(+delta.averageWorstSegmentDelta10) && delta.averageWorstSegmentDelta10 > 0.03){
    blockers.push(`Theme average worst-segment risk worsens by ${delta.averageWorstSegmentDelta10}/10.`);
  }

  const status = blockers.length
    ? 'stability-gate-reject'
    : 'stability-gate-runtime-trial-allowed';

  return {
    cue,
    status,
    allowRuntimeTrial: status === 'stability-gate-runtime-trial-allowed',
    promoteRuntime: false,
    candidate: candidate ? {
      artifact: rel(candidate.file),
      id: candidateId(candidate),
      decisionStatus: candidateDecision?.status || '',
      keep: candidateDecision?.keep === true,
      reason: candidateDecision?.reason || ''
    } : null,
    precheck: precheck ? {
      artifact: rel(precheck.file),
      status: precheck.report?.decision?.status || '',
      allowRuntimeTrial: precheck.report?.decision?.allowRuntimeTrial === true,
      blockers: precheck.report?.decision?.blockers || [],
      wins: precheck.report?.decision?.wins || []
    } : null,
    currentRisk: riskRow ? {
      gapRisk10: round(riskRow.gapRisk10, 2),
      worstSegmentRisk10: round(riskRow.worstSegmentRisk10, 2),
      worstSegmentRole: riskRow.worstSegmentRole || ''
    } : null,
    stability: stable ? {
      medianGapRisk10: stable.medianGapRisk10,
      gapRiskRange10: stable.gapRiskRange10,
      worstSegmentRange10: stable.worstSegmentRange10,
      stabilityScore10: stable.stabilityScore10,
      volatile: stable.volatile
    } : null,
    noiseFloor: noise,
    deltas: delta,
    blockers,
    warnings,
    wins,
    nextStep: blockers.length
      ? `Do not promote ${cue}. Preserve the candidate/precheck evidence and either stabilize measurement or generate a candidate whose full-theme win exceeds the current stability threshold.`
      : `Run a guarded live runtime trial for ${cue}; promote only if live audio comparison, event-gap rollup, cue alignment, and quality scoring still hold or improve.`
  };
}

function markdown(report){
  const lines = [
    '# Aurora Audio Promotion Stability Gate',
    '',
    `Generated: \`${report.generatedAt}\``,
    '',
    '## Why This Exists',
    '',
    report.problem,
    '',
    '## Decision Summary',
    '',
    `- Cues evaluated: ${report.summary.cueCount}`,
    `- Runtime trials allowed: ${report.summary.runtimeTrialAllowedCount}`,
    `- Stability rejections: ${report.summary.rejectedCount}`,
    `- Global promotion block: ${report.summary.globalPromotionBlocked ? 'yes' : 'no'} (${report.summary.globalVolatileCueCount} volatile cues; share ${report.summary.globalVolatileCueShare})`,
    `- Most important next step: ${report.nextStep}`,
    '',
    '| Cue | Status | Current Risk | Stability | Candidate Delta | Gate Read |',
    '| --- | --- | ---: | --- | --- | --- |'
  ];
  for(const row of report.cues){
    lines.push(`| \`${row.cue}\` | \`${row.status}\` | ${row.currentRisk?.gapRisk10 ?? 'n/a'} | range ${row.noiseFloor.measuredRange10 ?? 'n/a'}, threshold ${row.noiseFloor.requiredCueGapWin10 ?? 'n/a'} | cue ${row.deltas.cueGapImprovement10 ?? 'n/a'}, segment ${row.deltas.worstSegmentImprovement10 ?? 'n/a'} | ${row.blockers[0] || row.wins[0] || 'clear'} |`);
  }
  lines.push('', '## Cue Details', '');
  for(const row of report.cues){
    lines.push(`### ${row.cue}`, '');
    if(row.blockers.length) lines.push(...row.blockers.map(item => `- Blocker: ${item}`));
    if(row.warnings.length) lines.push(...row.warnings.map(item => `- Warning: ${item}`));
    if(row.wins.length) lines.push(...row.wins.map(item => `- Win: ${item}`));
    lines.push(`- Next: ${row.nextStep}`, '');
  }
  return `${lines.join('\n')}\n`;
}

function main(){
  if(!fs.existsSync(RISK_STABILITY)) throw new Error('Missing audio risk stability report. Run npm run harness:analyze:aurora-audio-risk-stability.');
  if(!fs.existsSync(EVENT_GAP)) throw new Error('Missing audio event-gap report. Run npm run harness:analyze:aurora-audio-event-gap.');
  const cues = String(argValue('cues', 'challengePerfect,gameOver,challengeTransition'))
    .split(',')
    .map(item => item.trim())
    .filter(Boolean);
  const stability = readJson(RISK_STABILITY);
  const eventGap = readJson(EVENT_GAP);
  const generatedAt = new Date().toISOString();
  const commit = git(['rev-parse', '--short', 'HEAD'], 'unknown');
  const dirty = git(['status', '--short'], '').trim().length > 0;
  const globalStability = globalStabilityRead(stability);
  const rows = cues.map(cue => gateCue({
    cue,
    candidate: latestCandidate(cue),
    precheck: latestPrecheck(cue),
    stability,
    eventGap,
    globalStability
  }));
  const rejected = rows.filter(row => row.status === 'stability-gate-reject');
  const allowed = rows.filter(row => row.allowRuntimeTrial);
  const outDir = path.join(OUT_ROOT, `${generatedAt.slice(0, 10)}-${commit}${dirty ? '-dirty' : ''}-${generatedAt.slice(11, 19).replace(/:/g, '')}`);
  const report = {
    schemaVersion: 1,
    artifactType: 'aurora-audio-promotion-stability-gate',
    generatedAt,
    branch: git(['branch', '--show-current'], ''),
    commit,
    dirty,
    problem: 'Focused audio candidate loops are not trustworthy enough by themselves because full-theme audio event-gap reads have measurable capture and segmentation variance. This gate requires a candidate precheck to beat the cue-specific measured noise floor before runtime audio can be tried.',
    strategy: 'Join focused candidate decisions, full-theme promotion prechecks, latest event-gap risk, and repeated event-gap stability. For volatile cues, require the full-theme improvement to exceed the measured repeated-read range/stddev threshold; never promote runtime audio from this gate alone.',
    successMeasure: 'A cue clears this gate only if it has a keeper candidate, a passing promotion precheck, no aggregate regression, and a full-theme cue/worst-segment win large enough to exceed repeated-read variance.',
    summary: {
      cueCount: rows.length,
      runtimeTrialAllowedCount: allowed.length,
      rejectedCount: rejected.length,
      globalVolatileCueCount: globalStability.volatileCueCount,
      globalVolatileCueShare: globalStability.volatileShare,
      globalPromotionBlocked: globalStability.unstable,
      mostImportantCue: rejected[0]?.cue || allowed[0]?.cue || rows[0]?.cue || '',
      highestMedianGapCue: stability.summary?.highestMedianGapCue || '',
      highestMedianGapRisk10: stability.summary?.highestMedianGapRisk10 ?? null
    },
    source: {
      riskStability: rel(RISK_STABILITY),
      eventGap: rel(EVENT_GAP),
      candidateRoot: rel(CANDIDATE_ROOT),
      precheckRoot: rel(PRECHECK_ROOT)
    },
    globalStability,
    cues: rows,
    nextStep: rejected.length
      ? rejected[0].nextStep
      : (allowed.length ? allowed[0].nextStep : 'Generate focused candidate loops, promotion prechecks, and repeated stability evidence before trying runtime audio.')
  };
  writeJson(path.join(outDir, 'report.json'), report);
  fs.writeFileSync(path.join(outDir, 'README.md'), markdown(report));
  writeJson(path.join(OUT_ROOT, 'latest.json'), report);
  console.log(JSON.stringify({
    ok: true,
    report: rel(path.join(outDir, 'report.json')),
    latest: rel(path.join(OUT_ROOT, 'latest.json')),
    summary: report.summary,
    nextStep: report.nextStep
  }, null, 2));
}

try{
  main();
}catch(err){
  console.error(err && err.stack || err);
  process.exit(1);
}
