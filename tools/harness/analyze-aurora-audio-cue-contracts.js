#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..', '..');
const ANALYSES = path.join(ROOT, 'reference-artifacts', 'analyses');
const CONTRACT_PATH = path.join(ROOT, 'reference-artifacts', 'contracts', 'audio', 'aurora-audio-cue-contracts.json');
const GUIDE_PATH = path.join(ROOT, 'application-guide.json');
const EVENT_GAP_LATEST = path.join(ANALYSES, 'aurora-audio-event-gap', 'latest.json');
const PRECHECK_ROOT = path.join(ANALYSES, 'aurora-audio-promotion-precheck');
const CANDIDATE_ROOT = path.join(ANALYSES, 'aurora-audio-cue-candidates');
const QUALITY_ROOT = path.join(ANALYSES, 'quality-conformance');
const OUT_ROOT = path.join(ANALYSES, 'aurora-audio-cue-contracts');

const CANDIDATE_FILES = Object.freeze({
  stagePulse: 'latest-formation-pulse.json',
  enemyHit: 'latest-enemy-hit.json',
  enemyBoom: 'latest-enemy-boom.json',
  bossHit: 'latest-boss-hit.json',
  bossBoom: 'latest-boss-boom.json',
  rescueJoin: 'latest-rescue-join.json',
  playerHit: 'latest-player-hit-focus.json',
  challengePerfect: 'latest.json'
});

function readJson(file){
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function writeJson(file, value){
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
}

function rel(file){
  return path.relative(ROOT, file).split(path.sep).join('/');
}

function round(value, digits = 3){
  return Number.isFinite(+value) ? +(+value).toFixed(digits) : null;
}

function clamp(value, min, max){
  return Math.max(min, Math.min(max, value));
}

function git(args, fallback = ''){
  try{
    return execFileSync('git', ['-C', ROOT, ...args], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
  }catch{
    return fallback;
  }
}

function walkFiles(dir, name){
  const files = [];
  function walk(current){
    if(!fs.existsSync(current)) return;
    for(const entry of fs.readdirSync(current, { withFileTypes: true })){
      const full = path.join(current, entry.name);
      if(entry.isDirectory()) walk(full);
      else if(entry.isFile() && (!name || entry.name === name)) files.push(full);
    }
  }
  walk(dir);
  return files.sort((a, b) => fs.statSync(a).mtimeMs - fs.statSync(b).mtimeMs || a.localeCompare(b));
}

function latestReport(root){
  const files = walkFiles(root, 'report.json');
  return files.length ? files[files.length - 1] : null;
}

function latestQualityReport(){
  return latestReport(QUALITY_ROOT);
}

function guideMaps(){
  const guide = readJson(GUIDE_PATH);
  const contextById = new Map((guide.audioContexts || []).map(entry => [entry.id, entry]));
  const contextByCue = new Map();
  for(const context of guide.audioContexts || []){
    const cue = context.preview?.cue || context.cue;
    if(cue && !contextByCue.has(cue)) contextByCue.set(cue, context);
  }
  const comparisonsByCue = new Map();
  for(const set of guide.comparisonSets || []){
    const context = contextById.get(set.entryId);
    const cue = context?.preview?.cue || context?.cue;
    if(!cue) continue;
    if(!comparisonsByCue.has(cue)) comparisonsByCue.set(cue, []);
    comparisonsByCue.get(cue).push(set);
  }
  const eventsByCue = new Map();
  for(const event of guide.audioEventMatrix || []){
    const context = contextById.get(event.entryId);
    const cue = context?.preview?.cue || context?.cue;
    if(!cue) continue;
    if(!eventsByCue.has(cue)) eventsByCue.set(cue, []);
    eventsByCue.get(cue).push(event);
  }
  return { contextByCue, comparisonsByCue, eventsByCue };
}

function latestCandidate(cue){
  const fileName = CANDIDATE_FILES[cue];
  if(!fileName) return null;
  const file = path.join(CANDIDATE_ROOT, fileName);
  if(!fs.existsSync(file)) return null;
  try{
    const report = readJson(file);
    if(report.cue && report.cue !== cue) return null;
    return { file, report };
  }catch{
    return null;
  }
}

function latestPrecheck(cue){
  const reports = walkFiles(PRECHECK_ROOT, 'report.json')
    .map(file => {
      try{
        const report = readJson(file);
        return report.cue === cue ? { file, report } : null;
      }catch{
        return null;
      }
    })
    .filter(Boolean);
  reports.sort((a, b) => fs.statSync(a.file).mtimeMs - fs.statSync(b.file).mtimeMs || a.file.localeCompare(b.file));
  return reports.length ? reports[reports.length - 1] : null;
}

function assetPathExists(file){
  const direct = path.join(ROOT, file);
  if(fs.existsSync(direct)) return true;
  if(String(file).startsWith('assets/')){
    return fs.existsSync(path.join(ROOT, 'src', file));
  }
  return false;
}

function eventGapRows(){
  if(!fs.existsSync(EVENT_GAP_LATEST)) return new Map();
  const report = readJson(EVENT_GAP_LATEST);
  return new Map((report.comparedCueRisks || []).map(row => [row.cue, row]));
}

function scoreCompleteness(contract){
  const checks = [
    !!contract.semanticClass,
    !!contract.playerMeaning,
    !!contract.designerMeaning,
    !!contract.eventShape?.structure,
    (contract.eventShape?.segments || []).length > 0,
    !!contract.eventShape?.trigger,
    !!contract.eventShape?.overlapPolicy,
    !!contract.targetGrounding?.comparisonSet,
    (contract.targetGrounding?.referenceClips || []).length > 0,
    !!contract.themeLatitude?.defaultLane,
    (contract.themeLatitude?.strictInvariants || []).length > 0,
    (contract.themeLatitude?.variantAllowances || []).length > 0,
    (contract.themeLatitude?.forbiddenChanges || []).length > 0,
    (contract.ingestionRequirements || []).length > 0,
    (contract.nextLearningQuestions || []).length > 0
  ];
  return round(10 * checks.filter(Boolean).length / checks.length, 2);
}

function scoreReference({ contract, comparisons, riskRow }){
  const expected = contract.targetGrounding?.comparisonSet;
  const comparison = comparisons.find(item => item.id === expected) || comparisons[0] || null;
  const clipsExist = (contract.targetGrounding?.referenceClips || []).every(assetPathExists);
  const checks = [
    !!comparison,
    clipsExist,
    !!comparison?.referenceClip,
    !!comparison?.referenceWindow,
    !!comparison?.referenceSegmentation,
    !!riskRow,
    Number.isFinite(+riskRow?.semanticScore10),
    Number.isFinite(+riskRow?.worstSegmentRisk10)
  ];
  return {
    score10: round(10 * checks.filter(Boolean).length / checks.length, 2),
    comparisonSetFound: !!comparison,
    referenceClipsExist: clipsExist,
    hasReferenceWindow: !!comparison?.referenceWindow,
    hasReferenceSegmentation: !!comparison?.referenceSegmentation
  };
}

function scoreRuntime({ candidate, precheck, riskRow }){
  const candidateDecision = candidate?.report?.decision || null;
  const precheckDecision = precheck?.report?.decision || null;
  const checks = [
    !!riskRow,
    !!candidate,
    !!candidateDecision,
    candidateDecision?.status !== 'candidate-loop-missing',
    !!precheck,
    !!precheckDecision,
    precheckDecision?.allowRuntimeTrial === true || precheckDecision?.status === 'precheck-reject',
    Number.isFinite(+riskRow?.gapRisk10)
  ];
  return {
    score10: round(10 * checks.filter(Boolean).length / checks.length, 2),
    candidateStatus: candidateDecision?.status || 'missing',
    candidateKeep: candidateDecision?.keep === true,
    precheckStatus: precheckDecision?.status || 'missing',
    allowRuntimeTrial: precheckDecision?.allowRuntimeTrial === true,
    promoteRuntime: precheckDecision?.promoteRuntime === true
  };
}

function scoreTheme(contract, themeLanes){
  const lane = contract.themeLatitude?.defaultLane;
  const checks = [
    !!lane,
    !!themeLanes[lane],
    (contract.themeLatitude?.strictInvariants || []).length >= 2,
    (contract.themeLatitude?.variantAllowances || []).length >= 1,
    (contract.themeLatitude?.forbiddenChanges || []).length >= 1
  ];
  return round(10 * checks.filter(Boolean).length / checks.length, 2);
}

function statusFor({ riskRow, candidate, precheck, readinessScore10 }){
  const candidateDecision = candidate?.report?.decision || null;
  const precheckDecision = precheck?.report?.decision || null;
  if(precheckDecision?.status === 'precheck-reject') return 'blocked-by-promotion-precheck';
  if(candidateDecision?.keep === false) return 'candidate-loop-needs-new-strategy';
  if(precheckDecision?.allowRuntimeTrial === true) return 'runtime-trial-allowed-not-promoted';
  if((+riskRow?.worstSegmentRisk10 || 0) >= 6.5) return 'highest-risk-contract-target';
  if(readinessScore10 >= 8) return 'contract-ready-for-next-candidate-cycle';
  return 'contract-needs-evidence';
}

function measuredCandidateRead(candidate){
  const decision = candidate?.report?.decision || null;
  const candidateId = decision?.best || decision?.measuredBest || '';
  const row = (candidate?.report?.candidates || []).find(item => item.id === candidateId) || null;
  return {
    candidateId,
    risk10: row?.risk10 ?? null,
    worstSegmentRisk10: row?.worstSegmentRisk10 ?? null,
    cadencePressureScore10: row?.cadencePressure?.score10 ?? null,
    maskingSeparationScore10: row?.maskingSeparation?.score10 ?? null,
    keeperRead: row?.keeperRead || ''
  };
}

function recommendation({ contract, riskRow, candidate, precheck, runtime, status }){
  if(contract.cue === 'stagePulse'){
    const measured = measuredCandidateRead(candidate);
    if(precheck?.report?.decision?.status === 'precheck-reject' && measured.candidateId){
      if(/^cadence-phase-/.test(measured.candidateId)){
        return `Do not promote ${measured.candidateId}; the phase/envelope family produced a near miss but failed repeat stability and masking. Preserve the evidence and move effort to higher-return impact, loss, or composite-cue scoring before another stagePulse runtime trial.`;
      }
      if((+measured.cadencePressureScore10 || 0) < 3 && (+measured.maskingSeparationScore10 || 0) < 3){
        return `Do not promote ${measured.candidateId}; the targeted low-brightness/stability family lost pressure-bed character and still failed masking. Move to phase/envelope-aware or reference-subclip candidates.`;
      }
      return `Do not promote ${measured.candidateId}; the latest stagePulse pass improved local risk but still failed masking/stability gates. Build a lower-brightness, lower-variance pressure-bed family before another runtime trial.`;
    }
    return 'Attack stagePulse onset with a contract-aware candidate family that measures pressure cadence, onset band shape, and masking against combat cues.';
  }
  if(contract.cue === 'playerHit'){
    return 'Build composite loss-cue scoring before any runtime promotion: onset/body/tail should be scheduled and scored separately against restart and gameOver overlap.';
  }
  if(status === 'blocked-by-promotion-precheck'){
    return 'Do not promote runtime audio; add candidate diversity or broaden segmentation before another measured trial.';
  }
  if(runtime.allowRuntimeTrial){
    return 'Run a measured runtime trial only if it can be recaptured immediately with full event-gap, cue-alignment, and quality scoring.';
  }
  if((+riskRow?.gapRisk10 || 0) >= 4){
    return `Generate the next candidate loop for ${contract.cue}, then run promotion precheck before touching runtime audio.`;
  }
  return 'Keep this cue as a guardrail while higher-risk audio contracts are improved.';
}

function evaluateContract({ contract, maps, risks, themeLanes }){
  const comparisons = maps.comparisonsByCue.get(contract.cue) || [];
  const events = maps.eventsByCue.get(contract.cue) || [];
  const context = maps.contextByCue.get(contract.cue) || null;
  const riskRow = risks.get(contract.cue) || null;
  const candidate = latestCandidate(contract.cue);
  const precheck = latestPrecheck(contract.cue);
  const completenessScore10 = scoreCompleteness(contract);
  const reference = scoreReference({ contract, comparisons, riskRow });
  const runtime = scoreRuntime({ candidate, precheck, riskRow });
  const themeLatitudeScore10 = scoreTheme(contract, themeLanes);
  const readinessScore10 = round(
    .22 * completenessScore10
    + .26 * reference.score10
    + .32 * runtime.score10
    + .2 * themeLatitudeScore10,
    2
  );
  const status = statusFor({ riskRow, candidate, precheck, readinessScore10 });
  return {
    cue: contract.cue,
    family: contract.family,
    priority: contract.priority,
    semanticClass: contract.semanticClass,
    playerMeaning: contract.playerMeaning,
    eventShape: contract.eventShape,
    themeLatitude: contract.themeLatitude,
    scores: {
      completenessScore10,
      referenceGroundingScore10: reference.score10,
      runtimeEvidenceScore10: runtime.score10,
      themeLatitudeScore10,
      readinessScore10
    },
    currentRisk: riskRow ? {
      gapRisk10: round(riskRow.gapRisk10, 2),
      worstSegmentRole: riskRow.worstSegmentRole || '',
      worstSegmentRisk10: round(riskRow.worstSegmentRisk10, 2),
      semanticScore10: round(riskRow.semanticScore10, 2),
      recommendation: riskRow.recommendation || ''
    } : null,
    evidence: {
      applicationContextPresent: !!context,
      eventMatrixRows: events.length,
      comparisonSets: comparisons.map(item => item.id),
      reference,
      candidate: candidate ? {
        artifact: rel(candidate.file),
        status: candidate.report?.decision?.status || 'unknown',
        keep: candidate.report?.decision?.keep === true,
        best: candidate.report?.decision?.best || null,
        measuredBest: candidate.report?.decision?.measuredBest || null,
        reason: candidate.report?.decision?.reason || ''
      } : null,
      promotionPrecheck: precheck ? {
        artifact: rel(precheck.file),
        status: precheck.report?.decision?.status || 'unknown',
        allowRuntimeTrial: precheck.report?.decision?.allowRuntimeTrial === true,
        promoteRuntime: precheck.report?.decision?.promoteRuntime === true,
        blockers: precheck.report?.decision?.blockers || [],
        wins: precheck.report?.decision?.wins || []
      } : null
    },
    status,
    recommendation: recommendation({ contract, riskRow, candidate, precheck, runtime, status }),
    nextLearningQuestions: contract.nextLearningQuestions || []
  };
}

function nextStepFor(highest, cues){
  if(highest?.cue === 'stagePulse'){
    const stagePulse = cues.find(row => row.cue === 'stagePulse');
    const measured = measuredCandidateRead(latestCandidate('stagePulse'));
    if(stagePulse?.evidence?.promotionPrecheck?.status === 'precheck-reject' && measured.candidateId){
      if(/^cadence-phase-/.test(measured.candidateId)){
        return `StagePulse candidate ${measured.candidateId} is a phase/envelope near miss, but repeat stability and masking reject promotion. Preserve it as generator evidence and prioritize higher user-impact audio gaps such as playerHit body/composite loss cues before another stagePulse runtime trial.`;
      }
      if((+measured.cadencePressureScore10 || 0) < 3 && (+measured.maskingSeparationScore10 || 0) < 3){
        return `StagePulse candidate ${measured.candidateId} confirms that simple low-brightness stabilization loses pressure-bed character and still fails masking. Next try phase/envelope-aware synthesis or reference-subclip candidates, then rerun focused repeats and promotion precheck.`;
      }
      return `StagePulse candidate ${measured.candidateId} is a measured near miss: full-theme precheck shows improvement, but focused masking/stability gates reject promotion. Next build a stronger low-brightness, low-variance pressure-bed generator, then rerun focused repeats and promotion precheck.`;
    }
    return 'Run a contract-aware stagePulse onset candidate pass that scores pressure cadence, onset band shape, and masking against shots/hits before any runtime promotion trial.';
  }
  return `Run a contract-aware candidate pass for ${highest?.cue || 'the highest-risk cue'}, then rerun promotion precheck and live validation.`;
}

function markdown(report){
  const lines = [
    '# Aurora Audio Cue Contract Analysis',
    '',
    `Generated: \`${report.generatedAt}\``,
    `Commit: \`${report.commit}${report.dirty ? ' (dirty)' : ''}\``,
    '',
    '## Problem',
    '',
    report.problem,
    '',
    '## Strategy',
    '',
    report.strategy,
    '',
    '## Summary',
    '',
    `- Contracts: ${report.summary.contractCount}`,
    `- Average readiness: ${report.summary.averageReadinessScore10}/10`,
    `- Highest risk cue: ${report.summary.highestRiskCue} (${report.summary.highestRisk10}/10)`,
    `- Runtime-trial allowed cues: ${report.summary.runtimeTrialAllowedCueCount}`,
    `- Blocked cues: ${report.summary.blockedCueCount}`,
    '',
    '## Cue Contracts',
    '',
    '| Priority | Cue | Family | Readiness | Risk | Status | Recommendation |',
    '| ---: | --- | --- | ---: | ---: | --- | --- |'
  ];
  report.cues
    .slice()
    .sort((a, b) => a.priority - b.priority || (+b.currentRisk?.gapRisk10 || 0) - (+a.currentRisk?.gapRisk10 || 0))
    .forEach(row => {
      lines.push(`| ${row.priority} | ${row.cue} | ${row.family} | ${row.scores.readinessScore10} | ${row.currentRisk?.gapRisk10 ?? 'n/a'} | ${row.status} | ${row.recommendation} |`);
    });
  lines.push(
    '',
    '## Process Position',
    '',
    report.processPosition,
    '',
    '## Recommended Next Step',
    '',
    report.nextStep,
    ''
  );
  return `${lines.join('\n')}\n`;
}

function main(){
  if(!fs.existsSync(CONTRACT_PATH)) throw new Error(`Missing audio cue contracts: ${rel(CONTRACT_PATH)}`);
  const generatedAt = new Date().toISOString();
  const commit = git(['rev-parse', '--short', 'HEAD'], 'unknown');
  const branch = git(['branch', '--show-current'], '');
  const dirty = git(['status', '--short'], '').trim().length > 0;
  const contracts = readJson(CONTRACT_PATH);
  const maps = guideMaps();
  const risks = eventGapRows();
  const cues = (contracts.cueContracts || []).map(contract => evaluateContract({
    contract,
    maps,
    risks,
    themeLanes: contracts.themeLanes || {}
  }));
  const qualityPath = latestQualityReport();
  const quality = qualityPath ? readJson(qualityPath) : null;
  const audioCategory = (quality?.categories || []).find(category => category.id === 'audio') || null;
  const highest = cues
    .filter(row => row.currentRisk)
    .slice()
    .sort((a, b) => (+b.currentRisk.gapRisk10 || 0) - (+a.currentRisk.gapRisk10 || 0))[0] || null;
  const blocked = cues.filter(row => /blocked|needs-new-strategy/.test(row.status));
  const runtimeTrialAllowed = cues.filter(row => row.evidence.promotionPrecheck?.allowRuntimeTrial);
  const averageReadinessScore10 = round(cues.reduce((sum, row) => sum + (+row.scores.readinessScore10 || 0), 0) / Math.max(cues.length, 1), 2);
  const report = {
    schemaVersion: 1,
    artifactType: 'aurora-audio-cue-contract-analysis',
    generatedAt,
    branch,
    commit,
    dirty,
    problem: 'Aurora audio needs a formal contract layer so ingestion, candidate generation, runtime logging, comparison, promotion, and theme variation all optimize the same player-facing meaning rather than isolated waveform similarity.',
    strategy: 'Load the audio cue contracts, join them to application guide mappings, event-gap risks, focused candidate reports, promotion prechecks, and current quality scoring, then identify which cue families need stronger evidence or a different generation strategy.',
    successMeasure: 'A cue contract is ready for runtime work when semantic meaning, reference grounding, runtime evidence, and theme latitude all score strongly, and runtime promotion remains blocked until live recapture holds the full quality gates.',
    source: {
      contracts: rel(CONTRACT_PATH),
      applicationGuide: rel(GUIDE_PATH),
      eventGap: fs.existsSync(EVENT_GAP_LATEST) ? rel(EVENT_GAP_LATEST) : null,
      quality: qualityPath ? rel(qualityPath) : null
    },
    summary: {
      contractCount: cues.length,
      averageReadinessScore10,
      audioScore10: round(audioCategory?.score10, 2),
      acousticEventScore10: round(audioCategory?.details?.acousticEventScore10, 2),
      semanticEventScore10: round(audioCategory?.details?.semanticEventScore10, 2),
      highestRiskCue: highest?.cue || '',
      highestRisk10: round(highest?.currentRisk?.gapRisk10, 2),
      highestWorstSegmentCue: cues.slice().sort((a, b) => (+b.currentRisk?.worstSegmentRisk10 || 0) - (+a.currentRisk?.worstSegmentRisk10 || 0))[0]?.cue || '',
      runtimeTrialAllowedCueCount: runtimeTrialAllowed.length,
      blockedCueCount: blocked.length,
      compositeCueCount: cues.filter(row => /composite|phrase/.test(row.eventShape?.structure || '')).length
    },
    cues,
    processPosition: 'The audio process now separates contract readiness from runtime promotion. Current evidence says contracts can guide the next candidate cycle, but no cue should ship from synthetic or focused evidence alone.',
    nextStep: nextStepFor(highest, cues)
  };
  const runClock = generatedAt.slice(11, 19).replace(/:/g, '');
  const outDir = path.join(OUT_ROOT, `${generatedAt.slice(0, 10)}-${commit}${dirty ? '-dirty' : ''}-${runClock}`);
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

main();
