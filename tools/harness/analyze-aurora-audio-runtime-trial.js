#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..', '..');
const ANALYSES = path.join(ROOT, 'reference-artifacts', 'analyses');
const OUT_ROOT = path.join(ANALYSES, 'aurora-audio-runtime-trials');
const CANDIDATE_ROOT = path.join(ANALYSES, 'aurora-audio-cue-candidates');
const PRECHECK_ROOT = path.join(ANALYSES, 'aurora-audio-promotion-precheck');
const EVENT_GAP_ROOT = path.join(ANALYSES, 'aurora-audio-event-gap');
const QUALITY_ROOT = path.join(ANALYSES, 'quality-conformance');
const THEME_COMPARISON_ROOT = path.join(ANALYSES, 'aurora-audio-theme-comparison');
const LEDGER = path.join(ANALYSES, 'conformance-economics', 'run-ledger.jsonl');

const CANDIDATE_FILES = Object.freeze({
  stagePulse: 'latest-formation-pulse.json',
  enemyHit: 'latest-enemy-hit.json',
  enemyBoom: 'latest-enemy-boom.json',
  bossHit: 'latest-boss-hit.json',
  bossBoom: 'latest-boss-boom.json',
  rescueJoin: 'latest-rescue-join.json',
  playerHit: 'latest-player-hit-focus.json',
  challengePerfect: 'latest-challenge-perfect.json',
  challengeTransition: 'latest-challenge-transition.json',
  gameOver: 'latest-game-over.json'
});

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

function parseArgs(argv){
  const args = {};
  for(let index = 0; index < argv.length; index++){
    const token = argv[index];
    if(!token.startsWith('--')) continue;
    const key = token.slice(2);
    const next = argv[index + 1];
    if(!next || next.startsWith('--')){
      args[key] = true;
      continue;
    }
    args[key] = next;
    index++;
  }
  return args;
}

function walkFiles(dir, predicate){
  const files = [];
  function walk(current){
    if(!fs.existsSync(current)) return;
    for(const entry of fs.readdirSync(current, { withFileTypes: true })){
      const full = path.join(current, entry.name);
      if(entry.isDirectory()) walk(full);
      else if(entry.isFile() && predicate(full)) files.push(full);
    }
  }
  walk(dir);
  return files.sort((a, b) => fs.statSync(a).mtimeMs - fs.statSync(b).mtimeMs || a.localeCompare(b));
}

function latestReport(root){
  const reports = walkFiles(root, file => path.basename(file) === 'report.json');
  return reports.length ? reports[reports.length - 1] : null;
}

function latestMetrics(root){
  const metrics = walkFiles(root, file => path.basename(file) === 'metrics.json');
  return metrics.length ? metrics[metrics.length - 1] : null;
}

function latestQualityReport(){
  const reports = walkFiles(QUALITY_ROOT, file => path.basename(file) === 'report.json')
    .filter(file => !file.includes('-dirty/'));
  return reports.length ? reports[reports.length - 1] : latestReport(QUALITY_ROOT);
}

function latestPrecheck(cue){
  const reports = walkFiles(PRECHECK_ROOT, file => path.basename(file) === 'report.json')
    .map(file => {
      try{
        const report = readJson(file);
        return report.cue === cue ? { file, report } : null;
      }catch{
        return null;
      }
    })
    .filter(Boolean);
  return reports.length ? reports[reports.length - 1] : null;
}

function latestCandidate(cue){
  const fileName = CANDIDATE_FILES[cue];
  if(!fileName) return null;
  const file = path.join(CANDIDATE_ROOT, fileName);
  if(!fs.existsSync(file)) return null;
  const report = readJson(file);
  if(report.cue && report.cue !== cue) return null;
  return { file, report };
}

function eventGapCueRow(eventGap, cue){
  return (eventGap?.comparedCueRisks || []).find(row => row.cue === cue) || null;
}

function themeCueRow(theme, cue){
  const rows = Array.isArray(theme?.comparisons) ? theme.comparisons : [];
  return rows.find(row => row.cue === cue || row.runtimeCue === cue) || null;
}

function bestCandidateRow(candidateReport, candidateId){
  return (candidateReport?.candidates || []).find(row => row.id === candidateId) || null;
}

function readLedger(){
  if(!fs.existsSync(LEDGER)) return [];
  return fs.readFileSync(LEDGER, 'utf8')
    .split(/\n+/)
    .filter(Boolean)
    .map(line => {
      try{ return JSON.parse(line); }
      catch{ return null; }
    })
    .filter(Boolean);
}

function cueAxis(cue){
  return String(cue || '')
    .replace(/[A-Z]/g, match => `-${match.toLowerCase()}`)
    .replace(/^-/, '');
}

function trialLedgerEvidence(cue){
  const axis = cueAxis(cue);
  return readLedger()
    .filter(entry => (entry.axes || []).includes(axis))
    .filter(entry => /trial|post-revert|runtime/i.test(entry.notes || ''))
    .slice(-12)
    .map(entry => ({
      id: entry.id,
      command: (entry.command || []).join(' '),
      axes: entry.axes || [],
      resources: entry.resources || [],
      notes: entry.notes || '',
      wallSeconds: round(entry.measurement?.wallSeconds, 3),
      cpuSeconds: round(entry.measurement?.cpuSeconds, 3),
      exitCode: entry.measurement?.exitCode ?? null
    }));
}

function normalizeDecision(value){
  const raw = String(value || 'rejected').trim();
  if(/^runtime-trial-/.test(raw)) return raw;
  if(['accepted', 'rejected', 'inconclusive'].includes(raw)) return `runtime-trial-${raw}`;
  return raw;
}

function decisionNextStep(cue, status, candidateId){
  if(status === 'runtime-trial-rejected' && cue === 'challengePerfect'){
    return `Preserve ${candidateId} as a focused keeper, but do not promote it directly. Next generate a safer Challenge Perfect ceremony-tail family that keeps the measured onset/body subclip, reduces tail/overlap collapse under live capture, and must hold or improve audio score, event-gap rollup, cue alignment, and overall quality.`;
  }
  if(status === 'runtime-trial-rejected'){
    return `Keep the rejected ${cue} trial as generator evidence. The next candidate must explicitly address the failed live gates before another runtime promotion attempt.`;
  }
  if(status === 'runtime-trial-accepted'){
    return `Keep ${cue} under release guardrails and rerun full quality, event-gap, and cue-alignment checks after adjacent audio changes.`;
  }
  return `Run another guarded runtime trial for ${cue} only after the candidate, precheck, and full-theme evidence are refreshed.`;
}

function markdown(report){
  const lines = [
    `# Aurora Audio Runtime Trial: ${report.cue} ${report.decision.status.replace('runtime-trial-', '')}`,
    '',
    `Generated: \`${report.generatedAt}\``,
    `Commit: \`${report.commit}${report.dirty ? ' (dirty)' : ''}\``,
    '',
    '## Decision',
    '',
    `\`${report.cue}\` candidate \`${report.candidate}\` is \`${report.decision.status}\`.`,
    '',
    report.decision.reason,
    '',
    '## Gate Evidence',
    '',
    '| Gate | Artifact / Read |',
    '| --- | --- |',
    `| Focused candidate loop | \`${report.trialCandidateEvidence.focusedCandidateReport || 'missing'}\`; ${report.trialCandidateEvidence.candidateDecisionStatus || 'unknown'} |`,
    `| Promotion precheck | \`${report.trialCandidateEvidence.promotionPrecheck || 'missing'}\`; ${report.trialCandidateEvidence.precheckStatus || 'unknown'} |`,
    `| Full audio comparison | \`${report.runtimeTrialEvidence.audioThemeComparison || 'missing'}\`; latest cue risk ${report.runtimeTrialEvidence.themeCueRisk10 ?? 'n/a'}/10 |`,
    `| Event-gap rollup | \`${report.postTrialEvidence.eventGap || 'missing'}\`; current highest ${report.postTrialEvidence.currentHighestRiskCue || 'n/a'} ${report.postTrialEvidence.currentHighestRisk10 ?? 'n/a'}/10 |`,
    `| Quality score | \`${report.postTrialEvidence.quality || 'missing'}\`; audio ${report.postTrialEvidence.currentAudioScore10 ?? 'n/a'}/10, overall ${report.postTrialEvidence.currentOverallScore10 ?? 'n/a'}/10 |`,
    '',
    '## Learning',
    '',
    ...report.learning.map(item => `- ${item}`),
    '',
    '## Next Step',
    '',
    report.nextStep,
    ''
  ];
  return `${lines.join('\n')}\n`;
}

function main(){
  const args = parseArgs(process.argv.slice(2));
  const cue = String(args.cue || 'challengePerfect');
  const candidate = latestCandidate(cue);
  const candidateDecision = candidate?.report?.decision || null;
  const candidateId = String(args['candidate-id'] || candidateDecision?.best || candidateDecision?.measuredBest || 'unknown-candidate');
  const candidateRow = bestCandidateRow(candidate?.report, candidateId);
  const precheck = latestPrecheck(cue);
  const eventGapPath = fs.existsSync(path.join(EVENT_GAP_ROOT, 'latest.json'))
    ? path.join(EVENT_GAP_ROOT, 'latest.json')
    : latestReport(EVENT_GAP_ROOT);
  const eventGap = eventGapPath ? readJson(eventGapPath) : null;
  const eventGapRow = eventGapCueRow(eventGap, cue);
  const qualityPath = latestQualityReport();
  const quality = qualityPath ? readJson(qualityPath) : null;
  const audioCategory = (quality?.categories || []).find(category => category.id === 'audio') || null;
  const themePath = latestMetrics(THEME_COMPARISON_ROOT);
  const theme = themePath ? readJson(themePath) : null;
  const themeRow = themeCueRow(theme, cue);
  const status = normalizeDecision(args.decision || args.status || 'rejected');
  const promoteRuntime = status === 'runtime-trial-accepted';
  const reason = String(args.reason || (
    status === 'runtime-trial-rejected' && cue === 'challengePerfect'
      ? 'Guarded runtime trial evidence showed the focused Challenge Perfect keeper was not release-safe: the live/full-theme recapture still left Challenge Perfect as the highest audio risk, so the runtime cue was reverted and the candidate remains generator evidence only.'
      : `${cue} runtime trial recorded as ${status}; see gate evidence and next step.`
  ));
  const generatedAt = new Date().toISOString();
  const commit = git(['rev-parse', '--short', 'HEAD'], 'unknown');
  const branch = git(['branch', '--show-current'], '');
  const dirty = git(['status', '--short'], '').trim().length > 0;
  const nextStep = String(args['next-step'] || decisionNextStep(cue, status, candidateId));
  const report = {
    schemaVersion: 1,
    artifactType: 'aurora-audio-runtime-trial-decision',
    generatedAt,
    branch,
    commit,
    dirty,
    cue,
    candidate: candidateId,
    decision: {
      status,
      promoteRuntime,
      reason
    },
    problem: cue === 'challengePerfect'
      ? 'Challenge Perfect is still the highest measured audio cue risk. Focused/offline candidate scoring can find a strong onset/body match, but live runtime capture can still collapse the ceremony tail or shift segment boundaries enough to fail release-facing scoring.'
      : `${cue} needs a durable record of runtime-trial decisions so focused candidate wins do not become automatic runtime promotions.`,
    strategy: 'Treat focused candidate loops and promotion prechecks as proposal gates only. Accept runtime audio changes only after live/full-theme comparison, event-gap rollup, cue-alignment guardrails, and quality scoring hold or improve; persist rejected trials so future generators avoid repeating failed strategies.',
    trialCandidateEvidence: {
      focusedCandidateReport: candidate ? rel(candidate.file) : null,
      candidateDecisionStatus: candidateDecision?.status || null,
      candidateKeep: candidateDecision?.keep === true,
      candidateBest: candidateDecision?.best || null,
      measuredBest: candidateDecision?.measuredBest || null,
      riskDelta10: round(candidateDecision?.riskDelta, 2),
      segmentRiskDelta10: round(candidateDecision?.segmentRiskDelta, 2),
      candidateRisk10: round(candidateRow?.risk10, 2),
      candidateWorstSegmentRisk10: round(candidateRow?.worstSegmentRisk10, 2),
      candidateKeeperRead: candidateRow?.keeperRead || '',
      promotionPrecheck: precheck ? rel(precheck.file) : null,
      precheckStatus: precheck?.report?.decision?.status || null,
      allowRuntimeTrial: precheck?.report?.decision?.allowRuntimeTrial === true,
      promoteRuntime: precheck?.report?.decision?.promoteRuntime === true,
      precheckWins: precheck?.report?.decision?.wins || [],
      precheckBlockers: precheck?.report?.decision?.blockers || []
    },
    runtimeTrialEvidence: {
      audioThemeComparison: themePath ? rel(themePath) : null,
      themeAverageWorstSegmentRisk10: round(theme?.summary?.averageWorstSegmentRisk10, 2),
      themeCueRisk10: round(themeRow?.comparisons?.auroraVsReferenceActive ? eventGapRow?.gapRisk10 : eventGapRow?.gapRisk10, 2),
      themeCueWorstSegmentRisk10: round((themeRow?.segmentRoleComparisons || []).reduce((max, row) => Math.max(max, +row.auroraSegmentRisk10 || 0), 0), 2),
      ledger: rel(LEDGER),
      trialLedgerRows: trialLedgerEvidence(cue)
    },
    postTrialEvidence: {
      eventGap: eventGapPath ? rel(eventGapPath) : null,
      quality: qualityPath ? rel(qualityPath) : null,
      currentOverallScore10: round(quality?.summary?.overallScore10, 2),
      currentAudioScore10: round(audioCategory?.score10, 2),
      currentHighestRiskCue: eventGap?.summary?.highestRiskCue || null,
      currentHighestRisk10: round(eventGap?.summary?.highestRisk10, 2),
      currentHighestSegmentRiskCue: eventGap?.summary?.highestSegmentRiskCue || null,
      currentHighestSegmentRiskRole: eventGap?.summary?.highestSegmentRiskRole || null,
      currentAverageWorstSegmentRisk10: round(eventGap?.summary?.averageWorstSegmentRisk10, 2),
      currentCueGapRisk10: round(eventGapRow?.gapRisk10, 2),
      currentCueWorstSegmentRisk10: round(eventGapRow?.worstSegmentRisk10, 2),
      currentSemanticScore10: round(eventGapRow?.semanticScore10, 2)
    },
    learning: [
      'Focused cue similarity and promotion precheck are necessary but not sufficient for release-safe runtime promotion.',
      'Runtime audio candidates must be validated through the same full-theme live capture and quality gates that drive release scoring.',
      `${cue} candidate history should guide the next generator pass, but rejected runtime decisions must block direct promotion until the failed gate is specifically addressed.`
    ],
    nextStep
  };
  const stamp = generatedAt.slice(0, 10);
  const time = generatedAt.slice(11, 19).replace(/:/g, '');
  const safeCue = cueAxis(cue);
  const safeStatus = status.replace(/^runtime-trial-/, '');
  const outDir = path.join(OUT_ROOT, `${stamp}-${commit}${dirty ? '-dirty' : ''}-${time}-${safeCue}-${safeStatus}`);
  writeJson(path.join(outDir, 'report.json'), report);
  fs.writeFileSync(path.join(outDir, 'README.md'), markdown(report));
  writeJson(path.join(OUT_ROOT, 'latest.json'), {
    latest: rel(path.join(outDir, 'report.json'))
  });
  console.log(JSON.stringify({
    ok: true,
    report: rel(path.join(outDir, 'report.json')),
    latest: rel(path.join(OUT_ROOT, 'latest.json')),
    decision: report.decision,
    nextStep: report.nextStep
  }, null, 2));
}

main();
