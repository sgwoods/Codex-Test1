#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..', '..');
const ANALYSES = path.join(ROOT, 'reference-artifacts', 'analyses');
const OUT_ROOT = path.join(ANALYSES, 'aurora-audio-conformance-lab-v2');
const EVENT_GAP_ROOT = path.join(ANALYSES, 'aurora-audio-event-gap');
const CANDIDATE_ROOT = path.join(ANALYSES, 'aurora-audio-cue-candidates');
const QUALITY_ROOT = path.join(ANALYSES, 'quality-conformance');
const CONTRACT_ROOT = path.join(ANALYSES, 'aurora-audio-cue-contracts');
const CONTRACT_PATH = path.join(ROOT, 'reference-artifacts', 'contracts', 'audio', 'aurora-audio-cue-contracts.json');
const GUIDE_PATH = path.join(ROOT, 'application-guide.json');
const AURORA_PACK_PATH = path.join(ROOT, 'src', 'js', '13-aurora-game-pack.js');

const CUE_FAMILIES = [
  {
    id: 'formation-stage-ambience',
    label: 'Formation / Stage Ambience',
    priority: 1,
    cues: ['stagePulse'],
    goal: 'Make the board cadence create Galaga-like pressure without crowding combat cues.',
    userMeaning: 'Players should feel the alien rack is alive and advancing even before an immediate threat fires.',
    candidateFiles: {
      stagePulse: 'latest-formation-pulse.json'
    }
  },
  {
    id: 'impact-explosion-feedback',
    label: 'Impact / Explosion Feedback',
    priority: 2,
    cues: ['enemyHit', 'bossHit', 'enemyBoom', 'bossBoom'],
    goal: 'Separate hit confirmation, boss damage, normal destruction, and boss destruction so combat outcomes are legible.',
    userMeaning: 'Players should immediately understand hit, damage, destruction, and boss hierarchy from sound alone.',
    candidateFiles: {
      enemyHit: 'latest-enemy-hit.json',
      bossHit: 'latest-boss-hit.json',
      enemyBoom: 'latest-enemy-boom.json',
      bossBoom: 'latest-boss-boom.json'
    }
  },
  {
    id: 'reward-loss-feedback',
    label: 'Reward / Loss Feedback',
    priority: 3,
    cues: ['playerHit', 'rescueJoin', 'challengePerfect'],
    goal: 'Make ship loss, rescue reward, and perfect challenge events emotionally clear and arcade-readable.',
    userMeaning: 'Players should hear regret, reward, and celebration as distinct state changes.',
    candidateFiles: {
      playerHit: 'latest-player-hit-focus.json',
      rescueJoin: 'latest-rescue-join.json',
      challengePerfect: 'latest.json'
    }
  }
];

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

function mean(values){
  const numeric = values.map(Number).filter(Number.isFinite);
  return numeric.length ? numeric.reduce((sum, value) => sum + value, 0) / numeric.length : null;
}

function git(args, fallback = ''){
  try{
    return execFileSync('git', ['-C', ROOT, ...args], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
  }catch{
    return fallback;
  }
}

function walkReports(dir, filename = 'report.json'){
  const out = [];
  function walk(current){
    if(!fs.existsSync(current)) return;
    for(const entry of fs.readdirSync(current, { withFileTypes: true })){
      const full = path.join(current, entry.name);
      if(entry.isDirectory()) walk(full);
      else if(entry.isFile() && entry.name === filename) out.push(full);
    }
  }
  walk(dir);
  return out.sort((a, b) => fs.statSync(a).mtimeMs - fs.statSync(b).mtimeMs || a.localeCompare(b));
}

function latestReport(dir, filename = 'report.json'){
  const reports = walkReports(dir, filename);
  return reports.length ? reports[reports.length - 1] : null;
}

function latestQualityReport(){
  const reports = walkReports(QUALITY_ROOT).filter(file => !file.includes('-dirty/'));
  return reports.length ? reports[reports.length - 1] : latestReport(QUALITY_ROOT);
}

function candidateReport(fileName, cue){
  if(!fileName) return null;
  const file = path.join(CANDIDATE_ROOT, fileName);
  if(!fs.existsSync(file)) return null;
  const report = readJson(file);
  if(cue && report.cue && report.cue !== cue) return null;
  return { file, report };
}

function qualityAudioSummary(){
  const qualityPath = latestQualityReport();
  if(!qualityPath) return { path: null, category: null, summary: null };
  const report = readJson(qualityPath);
  const category = (report.categories || []).find(item => item.id === 'audio') || null;
  return {
    path: qualityPath,
    category,
    summary: report.summary || null
  };
}

function guideMaps(){
  const guide = readJson(GUIDE_PATH);
  const contextsById = new Map((guide.audioContexts || []).map(item => [item.id, item]));
  const comparisonByCue = new Map();
  for(const set of guide.comparisonSets || []){
    const context = contextsById.get(set.entryId) || {};
    const cue = context.preview?.cue || context.cue || '';
    if(!cue) continue;
    if(!comparisonByCue.has(cue)) comparisonByCue.set(cue, []);
    comparisonByCue.get(cue).push({ set, context });
  }
  return { comparisonByCue };
}

function cueRiskRows(eventGap){
  return new Map((eventGap?.comparedCueRisks || []).map(row => [row.cue, row]));
}

function topCandidateRows(report, limit = 5){
  return (report?.candidates || [])
    .filter(row => row.id !== 'baseline-current')
    .slice()
    .sort((a, b) => (+a.risk10 || 99) - (+b.risk10 || 99) || (+a.worstSegmentRisk10 || 99) - (+b.worstSegmentRisk10 || 99))
    .slice(0, limit)
    .map(row => ({
      id: row.id,
      label: row.label,
      risk10: round(row.risk10, 2),
      worstSegmentRole: row.worstSegmentRole || '',
      worstSegmentRisk10: round(row.worstSegmentRisk10, 2),
      durationGapSeconds: round(row.durationGapSeconds, 3),
      centroidGapHz: round(row.centroidGapHz, 1),
      bandShapeGap: round(row.bandShapeGap, 4),
      cadencePressureScore10: round(row.cadencePressure?.score10, 2),
      keeperRead: row.keeperRead || ''
    }));
}

function promotedRuntimeSpec(cue, report){
  const bestId = report?.decision?.best;
  if(!bestId) return null;
  const best = (report.candidates || []).find(row => row.id === bestId);
  const spec = best?.spec || null;
  if(!fs.existsSync(AURORA_PACK_PATH)) return null;
  const source = fs.readFileSync(AURORA_PACK_PATH, 'utf8');
  if(Array.isArray(spec?.layers) && spec.layers.length){
    const cueSourcePresent = source.includes(`${cue}:Object.freeze`);
    const refs = [];
    const refRe = /referenceAudioCue\('([^']+)'\,\{([^}]*)\}\)/g;
    let refMatch;
    while((refMatch = refRe.exec(source))){
      const opts = {};
      for(const part of refMatch[2].split(',')){
        const [key, raw] = part.split(':').map(value => String(value || '').trim());
        if(!key || !raw) continue;
        const numeric = Number(raw.startsWith('.') ? `0${raw}` : raw);
        opts[key] = Number.isFinite(numeric) ? numeric : raw;
      }
      refs.push({ referenceClip: refMatch[1], opts });
    }
    const layerMatched = spec.layers.every(layer => refs.some(ref => {
      if(ref.referenceClip !== layer.referenceClip) return false;
      const clipStartMatch = Math.abs((ref.opts.clipStart ?? NaN) - +layer.clipStart) < .001;
      const clipDurationMatch = Math.abs((ref.opts.clipDuration ?? NaN) - +layer.clipDuration) < .001;
      const delayMatch = !Number.isFinite(+layer.delay) || Math.abs((ref.opts.delay ?? 0) - +layer.delay) < .001;
      const volumeMatch = !Number.isFinite(+layer.referenceVolume) || Math.abs((ref.opts.referenceVolume ?? NaN) - +layer.referenceVolume) < .011;
      return clipStartMatch && clipDurationMatch && delayMatch && volumeMatch;
    }));
    if(cueSourcePresent && layerMatched){
      return {
        status: 'runtime-promoted-layered',
        source: rel(AURORA_PACK_PATH),
        best: bestId,
        spec: {
          cooldownMs: spec.cooldownMs,
          scheduledDuration: spec.scheduledDuration,
          layers: spec.layers.map(layer => ({
            referenceClip: layer.referenceClip,
            referenceVolume: layer.referenceVolume,
            clipStart: layer.clipStart,
            clipDuration: layer.clipDuration,
            delay: layer.delay
          }))
        }
      };
    }
    return null;
  }
  if(!spec?.referenceClip || !Number.isFinite(+spec.clipStart) || !Number.isFinite(+spec.clipDuration)) return null;
  const re = new RegExp(`${cue}:referenceAudioCue\\('([^']+)'\\,\\{([^}]*)\\}\\)`, 'g');
  let match;
  while((match = re.exec(source))){
    if(match[1] !== spec.referenceClip) continue;
    const opts = {};
    for(const part of match[2].split(',')){
      const [key, raw] = part.split(':').map(value => String(value || '').trim());
      if(!key || !raw) continue;
      const numeric = Number(raw.startsWith('.') ? `0${raw}` : raw);
      opts[key] = Number.isFinite(numeric) ? numeric : raw;
    }
    const clipStartMatch = Math.abs((opts.clipStart ?? NaN) - +spec.clipStart) < .001;
    const clipDurationMatch = Math.abs((opts.clipDuration ?? NaN) - +spec.clipDuration) < .001;
    const cooldownMatch = !Number.isFinite(+spec.cooldownMs) || Math.abs((opts.cooldownMs ?? NaN) - +spec.cooldownMs) < 1;
    const volumeMatch = !Number.isFinite(+spec.referenceVolume) || Math.abs((opts.referenceVolume ?? NaN) - +spec.referenceVolume) < .011;
    if(clipStartMatch && clipDurationMatch && cooldownMatch && volumeMatch){
      return {
        status: 'runtime-promoted',
        source: rel(AURORA_PACK_PATH),
        best: bestId,
        spec: {
          referenceClip: spec.referenceClip,
          cooldownMs: spec.cooldownMs,
          referenceVolume: spec.referenceVolume,
          clipStart: spec.clipStart,
          clipDuration: spec.clipDuration
        }
      };
    }
  }
  return null;
}

function cueMapping(cue, comparisonByCue){
  const matches = comparisonByCue.get(cue) || [];
  return matches.map(({ set, context }) => ({
    entryId: set.entryId,
    comparisonSet: set.id,
    label: set.label || context.label || cue,
    runtimeCue: cue,
    referenceClip: set.referenceClip || '',
    referenceWindow: set.referenceWindow || null,
    referenceSegmentation: set.referenceSegmentation || null,
    mappingStatus: context.mappingStatus || '',
    mappingConfidence: context.mappingConfidence || ''
  }));
}

function cueArtifact({ cue, family, comparisonByCue, risks }){
  const risk = risks.get(cue) || null;
  const candidate = candidateReport(family.candidateFiles?.[cue], cue);
  const decision = candidate?.report?.decision || null;
  const runtimePromotion = candidate && decision?.keep ? promotedRuntimeSpec(cue, candidate.report) : null;
  const mapping = cueMapping(cue, comparisonByCue);
  const accepted = !!decision?.keep;
  return {
    cue,
    playerMeaning: risk?.playerMeaning || family.userMeaning,
    semanticClass: risk?.semanticClass || 'pending-semantic-class',
    currentRisk: risk ? {
      gapRisk10: round(risk.gapRisk10, 2),
      worstSegmentRole: risk.worstSegmentRole || '',
      worstSegmentRisk10: round(risk.worstSegmentRisk10, 2),
      semanticScore10: round(risk.semanticScore10, 2),
      recommendation: risk.recommendation || ''
    } : null,
    targetReference: mapping.map(item => ({
      comparisonSet: item.comparisonSet,
      referenceClip: item.referenceClip,
      referenceWindow: item.referenceWindow,
      referenceSegmentation: item.referenceSegmentation
    })),
    runtimeMapping: mapping.map(item => ({
      entryId: item.entryId,
      runtimeCue: item.runtimeCue,
      mappingStatus: item.mappingStatus,
      mappingConfidence: item.mappingConfidence
    })),
    candidateHistory: candidate ? {
      artifact: rel(candidate.file),
      title: candidate.report.title || '',
      candidateCount: (candidate.report.candidates || []).length,
      repetitions: candidate.report.repetitions || 1,
      topCandidates: topCandidateRows(candidate.report),
      decision
    } : {
      artifact: null,
      candidateCount: 0,
      repetitions: 0,
      topCandidates: [],
      decision: {
        status: 'not-yet-swept',
        keep: false,
        reason: 'No focused candidate loop artifact exists yet for this cue.'
      }
    },
    decision: candidate ? {
      status: decision?.status || 'unknown',
      keep: accepted,
      acceptedRuntimePromotion: !!runtimePromotion,
      runtimePromotion,
      best: decision?.best || null,
      measuredBest: decision?.measuredBest || null,
      reason: decision?.reason || ''
    } : {
      status: 'candidate-loop-missing',
      keep: false,
      acceptedRuntimePromotion: false,
      best: null,
      measuredBest: null,
      reason: 'Requires a focused candidate loop before runtime promotion can be considered.'
    }
  };
}

function familyDecision(family, cues){
  const acceptedCueCount = cues.filter(cue => cue.decision.keep).length;
  const sweptCueCount = cues.filter(cue => cue.candidateHistory.candidateCount > 0).length;
  const missingCueCount = cues.length - sweptCueCount;
  const highestRiskCue = cues
    .filter(cue => cue.currentRisk)
    .slice()
    .sort((a, b) => (+b.currentRisk.gapRisk10 || 0) - (+a.currentRisk.gapRisk10 || 0))[0] || null;
  const noKeeperCueCount = cues.filter(cue => cue.candidateHistory.candidateCount > 0 && !cue.decision.keep).length;
  const runtimePromotionReady = acceptedCueCount > 0 && family.id !== 'formation-stage-ambience';
  return {
    status: acceptedCueCount ? 'keeper-found-awaiting-full-promotion-gates' : (sweptCueCount ? 'swept-no-runtime-keeper' : 'candidate-loop-needed'),
    acceptedCueCount,
    sweptCueCount,
    missingCueCount,
    noKeeperCueCount,
    highestRiskCue: highestRiskCue?.cue || '',
    highestRisk10: round(highestRiskCue?.currentRisk?.gapRisk10, 2),
    runtimePromotionReady,
    recommendation: runtimePromotionReady
      ? `Review accepted ${family.label} cue(s) against final theme comparison, semantic score, and overall quality before editing runtime audio.`
      : (highestRiskCue
        ? `Continue candidate generation for ${highestRiskCue.cue}; current risk ${round(highestRiskCue.currentRisk.gapRisk10, 2)}/10.`
        : `Add focused candidate loops for ${family.label}.`)
  };
}

function familyArtifact({ family, comparisonByCue, risks }){
  const cues = family.cues.map(cue => cueArtifact({ cue, family, comparisonByCue, risks }));
  const averageRisk10 = round(mean(cues.map(cue => cue.currentRisk?.gapRisk10)), 2);
  const averageWorstSegmentRisk10 = round(mean(cues.map(cue => cue.currentRisk?.worstSegmentRisk10)), 2);
  return {
    id: family.id,
    label: family.label,
    priority: family.priority,
    problem: family.goal,
    playerMeaning: family.userMeaning,
    scoreContext: {
      averageRisk10,
      averageWorstSegmentRisk10,
      cueCount: cues.length,
      sweptCueCount: cues.filter(cue => cue.candidateHistory.candidateCount > 0).length
    },
    cues,
    decision: familyDecision(family, cues)
  };
}

function markdown(report){
  const lines = [
    '# Aurora Audio Conformance Lab v2',
    '',
    `Generated: ${report.generatedAt}`,
    `Commit: ${report.commit}${report.dirty ? ' (dirty)' : ''}`,
    '',
    '## Summary',
    '',
    `- Audio score: ${report.summary.audioScore10 ?? 'n/a'}/10`,
    `- Semantic audio: ${report.summary.semanticScore10 ?? 'n/a'}/10`,
    `- Highest current risk: ${report.summary.highestRiskCue || 'n/a'} ${report.summary.highestRisk10 ?? 'n/a'}/10`,
    `- Cue-contract readiness: ${report.summary.contractReadinessScore10 ?? 'n/a'}/10`,
    `- Contract blocked cues: ${report.summary.contractBlockedCueCount ?? 'n/a'}`,
    `- Runtime promotions accepted by this lab: ${report.summary.runtimePromotionCount}`,
    '',
    '## Cue Families',
    '',
    '| Family | Cues | Swept | Accepted keepers | Average risk | Decision | Next |',
    '| --- | --- | ---: | ---: | ---: | --- | --- |'
  ];
  for(const family of report.families){
    lines.push(`| ${family.label} | ${family.cues.map(cue => cue.cue).join(', ')} | ${family.decision.sweptCueCount}/${family.cues.length} | ${family.decision.acceptedCueCount} | ${family.scoreContext.averageRisk10 ?? 'n/a'} | ${family.decision.status} | ${family.decision.recommendation} |`);
  }
  lines.push('', '## Promotion Rule', '', report.promotionRule, '');
  return `${lines.join('\n')}\n`;
}

function main(){
  const generatedAt = new Date().toISOString();
  const commit = git(['rev-parse', '--short', 'HEAD'], 'unknown');
  const branch = git(['branch', '--show-current'], '');
  const dirty = git(['status', '--short'], '').trim().length > 0;
  const eventGapPath = fs.existsSync(path.join(EVENT_GAP_ROOT, 'latest.json'))
    ? path.join(EVENT_GAP_ROOT, 'latest.json')
    : latestReport(EVENT_GAP_ROOT);
  if(!eventGapPath) throw new Error('Run npm run harness:analyze:aurora-audio-event-gap before the lab v2 analyzer.');
  const eventGap = readJson(eventGapPath);
  const contractAnalysisPath = fs.existsSync(path.join(CONTRACT_ROOT, 'latest.json'))
    ? path.join(CONTRACT_ROOT, 'latest.json')
    : latestReport(CONTRACT_ROOT);
  const contractAnalysis = contractAnalysisPath ? readJson(contractAnalysisPath) : null;
  const qualityAudio = qualityAudioSummary();
  const { comparisonByCue } = guideMaps();
  const risks = cueRiskRows(eventGap);
  const families = CUE_FAMILIES.map(family => familyArtifact({ family, comparisonByCue, risks }));
  const runtimePromotionCount = families.reduce((sum, family) => sum + family.cues.filter(cue => cue.decision.keep && cue.decision.acceptedRuntimePromotion).length, 0);
  const keeperCueCount = families.reduce((sum, family) => sum + family.cues.filter(cue => cue.decision.keep).length, 0);
  const sweptCueCount = families.reduce((sum, family) => sum + family.cues.filter(cue => cue.candidateHistory.candidateCount > 0).length, 0);
  const cueCount = families.reduce((sum, family) => sum + family.cues.length, 0);
  const report = {
    schemaVersion: 1,
    artifactType: 'aurora-audio-conformance-lab-v2',
    generatedAt,
    branch,
    commit,
    dirty,
    problem: 'Aurora audio is the current weakest quality category; stagePulse onset and acoustic event matching are the highest measured risks.',
    strategy: 'Group cue families by player meaning, attach current event-gap risk, attach focused candidate-loop history, and allow runtime promotion only after measured keeper gates plus full audio/semantic/quality checks.',
    successMeasure: 'Move audio toward 7.5+/10 while preserving 9/9 cue alignment, semantic audio near 9.78/10, and overall quality >= 9.2/10.',
    promotionRule: 'This analyzer records keeper candidates but does not edit runtime cue definitions. Runtime promotion requires a keeper, a refreshed full theme comparison, no cue-alignment regression, no semantic regression, and overall quality >= 9.2.',
    source: {
      eventGap: rel(eventGapPath),
      quality: qualityAudio.path ? rel(qualityAudio.path) : null,
      applicationGuide: rel(GUIDE_PATH),
      audioCueContracts: fs.existsSync(CONTRACT_PATH) ? rel(CONTRACT_PATH) : null,
      contractAnalysis: contractAnalysisPath ? rel(contractAnalysisPath) : null,
      candidateRoot: rel(CANDIDATE_ROOT)
    },
    summary: {
      audioScore10: round(qualityAudio.category?.score10, 2),
      overallScore10: round(qualityAudio.summary?.overallScore10, 2),
      semanticScore10: round(eventGap.summary?.semanticAverageScore10 ?? qualityAudio.category?.details?.semanticEventScore10, 2),
      averageWorstSegmentRisk10: round(eventGap.summary?.averageWorstSegmentRisk10, 2),
      highestRiskCue: eventGap.summary?.highestRiskCue || '',
      highestRisk10: round(eventGap.summary?.highestRisk10, 2),
      highestSegmentRiskCue: eventGap.summary?.highestSegmentRiskCue || '',
      highestSegmentRiskRole: eventGap.summary?.highestSegmentRiskRole || '',
      cueCount,
      sweptCueCount,
      keeperCueCount,
      runtimePromotionCount,
      candidateLoopCoverage: round(cueCount ? sweptCueCount / cueCount : 0, 3),
      contractReadinessScore10: round(contractAnalysis?.summary?.averageReadinessScore10, 2),
      contractBlockedCueCount: contractAnalysis?.summary?.blockedCueCount ?? null,
      contractRuntimeTrialAllowedCueCount: contractAnalysis?.summary?.runtimeTrialAllowedCueCount ?? null,
      nextGap: eventGap.nextStep || ''
    },
    families,
    nextStep: contractAnalysis?.nextStep || eventGap.nextStep || 'Run the next focused audio candidate loop, then rebuild this lab artifact.'
  };
  const outDir = path.join(OUT_ROOT, `${generatedAt.slice(0, 10)}-${commit}${dirty ? '-dirty' : ''}`);
  writeJson(path.join(outDir, 'report.json'), report);
  fs.writeFileSync(path.join(outDir, 'README.md'), markdown(report));
  writeJson(path.join(OUT_ROOT, 'latest.json'), report);
  console.log(JSON.stringify({
    ok: true,
    report: rel(path.join(outDir, 'report.json')),
    latest: rel(path.join(OUT_ROOT, 'latest.json')),
    summary: report.summary
  }, null, 2));
}

main();
