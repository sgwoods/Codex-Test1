#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..', '..');
const ANALYSES = path.join(ROOT, 'reference-artifacts', 'analyses');
const OUT_ROOT = path.join(ANALYSES, 'conformance-investment-retrospective');
const TOP_LEVEL_DOC = path.join(ROOT, 'CONFORMANCE_INVESTMENT_RETROSPECTIVE.md');

function ensureDir(dir){
  fs.mkdirSync(dir, { recursive: true });
}

function readJson(file, fallback = null){
  try{
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  }catch{
    return fallback;
  }
}

function writeJson(file, data){
  fs.writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`);
}

function rel(file){
  return path.relative(ROOT, file).split(path.sep).join('/');
}

function round(value, digits = 2){
  return Number.isFinite(+value) ? +(+value).toFixed(digits) : null;
}

function minutes(seconds, digits = 1){
  return Number.isFinite(+seconds) ? `${round(+seconds / 60, digits)} min` : 'n/a';
}

function git(args, fallback = ''){
  try{
    return execFileSync('git', ['-C', ROOT, ...args], { encoding: 'utf8' }).trim();
  }catch{
    return fallback;
  }
}

function gitShortCommit(){
  return git(['rev-parse', '--short', 'HEAD'], 'unknown');
}

function walkReports(root){
  const out = [];
  function walk(dir){
    if(!fs.existsSync(dir)) return;
    for(const entry of fs.readdirSync(dir, { withFileTypes: true })){
      const full = path.join(dir, entry.name);
      if(entry.isDirectory()) walk(full);
      else if(entry.isFile() && entry.name === 'report.json') out.push(full);
    }
  }
  walk(root);
  return out.sort((a, b) => {
    const ad = readJson(a, {})?.generatedAt || path.basename(path.dirname(a));
    const bd = readJson(b, {})?.generatedAt || path.basename(path.dirname(b));
    return String(ad).localeCompare(String(bd)) || a.localeCompare(b);
  });
}

function latestReport(artifact){
  const reports = walkReports(path.join(ANALYSES, artifact));
  return reports.length ? reports[reports.length - 1] : null;
}

function loadLatest(artifact){
  const latest = path.join(ANALYSES, artifact, 'latest.json');
  if(fs.existsSync(latest)) return { file: latest, data: readJson(latest) };
  const report = latestReport(artifact);
  return report ? { file: report, data: readJson(report) } : null;
}

function delta(start, end){
  if(!Number.isFinite(+start) || !Number.isFinite(+end)) return null;
  return round(+end - +start, 2);
}

function scoreLabel(value){
  return value !== null && value !== undefined && Number.isFinite(+value) ? `${round(+value, 1)}/10` : 'n/a';
}

function qualityHistory(){
  return walkReports(path.join(ANALYSES, 'quality-conformance'))
    .map(file => {
      const data = readJson(file, {});
      const categories = Array.isArray(data.categories) ? data.categories : [];
      const cat = id => categories.find(item => item.id === id);
      return {
        file,
        stamp: path.basename(path.dirname(file)),
        generatedAt: data.generatedAt || path.basename(path.dirname(file)),
        overall: data.summary?.overallScore10,
        weakest: data.summary?.weakestCategory?.id || null,
        audio: cat('audio')?.score10,
        challengeSetPiece: cat('challenge-set-piece')?.score10,
        levelArc: cat('level-arc')?.score10
      };
    })
    .filter(row => Number.isFinite(+row.overall));
}

function challengeHistory(){
  return walkReports(path.join(ANALYSES, 'challenge-stage-conformance'))
    .map(file => {
      const data = readJson(file, {});
      const s = data.summary || {};
      return {
        file,
        stamp: path.basename(path.dirname(file)),
        generatedAt: data.generatedAt || path.basename(path.dirname(file)),
        scoringModel: s.scoringModel || 'legacy',
        score10: s.score10,
        interestingFactorScore10: s.interestingFactorScore10,
        movementConformanceScore10: s.movementConformanceScore10,
        graphicalConformanceScore10: s.graphicalConformanceScore10,
        alienNoveltyScore10: s.alienNoveltyScore10,
        progressionConformanceScore10: s.progressionConformanceScore10,
        playerShotOpportunityScore10: s.playerShotOpportunityScore10,
        safetyRuleScore10: s.safetyRuleScore10,
        legacyCoverageScore10: s.legacyCoverageScore10,
        report: rel(file)
      };
    })
    .filter(row => Number.isFinite(+row.score10) || Number.isFinite(+row.legacyCoverageScore10));
}

function latestStrictChallenge(history){
  const strict = history.filter(row => row.scoringModel === 'strict-v2-user-baseline' && Number.isFinite(+row.score10));
  return { strict, first: strict[0] || null, latest: strict[strict.length - 1] || null };
}

function latestStrictQuality(history){
  const strict = history.filter(row => Number.isFinite(+row.challengeSetPiece));
  return { strict, first: strict[0] || null, latest: strict[strict.length - 1] || null };
}

function sweepSummaries(){
  return walkReports(path.join(ANALYSES, 'challenge-stage-candidate-sweep'))
    .map(file => {
      const data = readJson(file, {});
      const s = data.summary || {};
      const stageMatch = String(s.bestCandidateId || s.baselineCandidateId || file).match(/stage(\d+)/i);
      return {
        file,
        report: rel(file),
        stamp: path.basename(path.dirname(file)),
        stage: stageMatch ? +stageMatch[1] : null,
        baselineExpectedScore10: s.baselineExpectedScore10,
        bestExpectedScore10: s.bestExpectedScore10,
        lift10: delta(s.baselineExpectedScore10, s.bestExpectedScore10),
        bestCandidateId: s.bestCandidateId || null,
        baselineBestMatch: s.baselineBestMatch?.labelId || null,
        bestMatch: s.bestMatch?.labelId || null,
        candidateCount: data.candidates?.length || s.candidateCount || null,
        keepable: Boolean(s.runtimeKeeper || s.keep || s.readyToPromote)
      };
    })
    .filter(row => Number.isFinite(+row.bestExpectedScore10));
}

function readDashboardEconomics(){
  const dashboard = loadLatest('release-conformance-dashboard')?.data || {};
  const game = (dashboard.games || []).find(item => item.gameKey === 'aurora-galactica') || dashboard;
  const rows = Array.isArray(game.priorityRows) ? game.priorityRows : [];
  const row = needle => rows.find(item => String(item.metric || '').toLowerCase().includes(needle));
  return {
    source: loadLatest('release-conformance-dashboard')?.file || null,
    economicsSummary: game.economicsSummary || dashboard.economicsSummary || {},
    challengeRow: row('challenge-stage set-piece'),
    audioRow: row('audio identity'),
    topRows: rows.slice(0, 5)
  };
}

function buildMetricMovements({ challenge, quality, audioLab, audioContracts, artifactConformance }){
  const audioLabData = audioLab?.data || audioLab || {};
  const audioContractData = audioContracts?.data || audioContracts || {};
  const artifactData = artifactConformance?.data || artifactConformance || {};
  const movements = [];
  if(challenge.first && challenge.latest){
    const fields = [
      ['challenge-set-piece', 'Challenge-stage strict conformance', 'score10', 'Highest-priority gameplay authenticity gap.'],
      ['challenge-interest', 'Challenge-stage interesting factor', 'interestingFactorScore10', 'Bonus stages should feel authored and exciting, not merely safe.'],
      ['challenge-movement', 'Challenge movement / trajectory conformance', 'movementConformanceScore10', 'True alien path grammar and motion shape.'],
      ['challenge-graphics', 'Challenge graphical conformance', 'graphicalConformanceScore10', 'Visible alien/sprite/readability fit against target challenge artifacts.'],
      ['challenge-alien-novelty', 'Challenge alien novelty', 'alienNoveltyScore10', 'Whether later challenges introduce memorable alien families and roles.'],
      ['challenge-progression', 'Challenge stage-to-stage progression', 'progressionConformanceScore10', 'Whether the eight challenge stages escalate as distinct lessons.'],
      ['challenge-shot-opportunity', 'Challenge scoring/shot opportunity', 'playerShotOpportunityScore10', 'Whether players get clear, learnable bonus-shot routes.'],
      ['challenge-safety', 'Challenge no-combat safety guardrail', 'safetyRuleScore10', 'No enemy shots, no attack starts, no ship deaths in challenge windows.']
    ];
    for(const [id, label, field, playerMeaning] of fields){
      movements.push({
        id,
        label,
        startScore10: challenge.first[field] ?? null,
        currentScore10: challenge.latest[field] ?? null,
        delta10: delta(challenge.first[field], challenge.latest[field]),
        progressClass: progressClass(delta(challenge.first[field], challenge.latest[field]), challenge.latest[field]),
        playerMeaning,
        startReport: challenge.first.report,
        currentReport: challenge.latest.report
      });
    }
  }
  if(quality.first && quality.latest){
    movements.push({
      id: 'overall-quality',
      label: 'Overall quality rollup after strict challenge metric',
      startScore10: quality.first.overall,
      currentScore10: quality.latest.overall,
      delta10: delta(quality.first.overall, quality.latest.overall),
      progressClass: progressClass(delta(quality.first.overall, quality.latest.overall), quality.latest.overall),
      playerMeaning: 'Release score moved only slightly because the stricter challenge metric exposed a large gap.',
      startReport: rel(quality.first.file),
      currentReport: rel(quality.latest.file)
    });
    movements.push({
      id: 'audio-release-category',
      label: 'Audio release-category read',
      startScore10: quality.first.audio,
      currentScore10: quality.latest.audio,
      delta10: delta(quality.first.audio, quality.latest.audio),
      progressClass: 'mixed',
      playerMeaning: 'The release score nudged upward, but accepted runtime cue promotion remains blocked by full-theme instability.',
      startReport: rel(quality.first.file),
      currentReport: rel(quality.latest.file)
    });
  }
  if(audioLabData.summary || audioContractData.summary){
    movements.push({
      id: 'audio-runtime-promotion',
      label: 'Audio runtime promotion success',
      startScore10: 0,
      currentScore10: audioLabData.summary?.runtimePromotionCount || audioContractData.summary?.runtimeTrialAcceptedCueCount || 0,
      delta10: 0,
      progressClass: 'stalled',
      playerMeaning: 'No candidate is accepted into runtime audio yet; the process improved, the shipped sound did not meaningfully move from these candidates.',
      currentReport: audioLab?.file ? rel(audioLab.file) : audioContracts?.file ? rel(audioContracts.file) : null
    });
  }
  if(artifactData.summary){
    movements.push({
      id: 'runtime-sprite-static',
      label: 'Live runtime static sprite conformance',
      startScore10: null,
      currentScore10: artifactData.summary.spriteRuntimeCanvasScore10,
      delta10: null,
      progressClass: 'known-gap',
      playerMeaning: 'Static runtime sprite identity is measured around 6/10 and active motion is still a planning row, so graphics remain visually incomplete.',
      currentReport: rel(artifactConformance.file)
    });
  }
  return movements;
}

function progressClass(delta10, current){
  if(!Number.isFinite(+delta10)) return 'baseline';
  if(+delta10 >= 1) return 'advanced';
  if(+delta10 > 0) return 'nudged';
  if(+current >= 9.5) return 'guardrail';
  return 'stalled';
}

function barSvg(file, title, rows, options = {}){
  const width = 980;
  const rowHeight = 46;
  const top = 70;
  const left = 260;
  const right = 40;
  const height = top + rows.length * rowHeight + 45;
  const max = Math.max(1, ...rows.map(row => Math.abs(+row.value || 0)));
  const fill = options.fill || '#2f79a8';
  const svg = [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`,
    '<rect width="100%" height="100%" fill="#f7f4ee"/>',
    `<text x="28" y="38" font-family="Arial, sans-serif" font-size="25" font-weight="700" fill="#1f1a15">${escapeXml(title)}</text>`,
    `<line x1="${left}" y1="${top - 18}" x2="${width - right}" y2="${top - 18}" stroke="#d2cabf"/>`
  ];
  rows.forEach((row, index) => {
    const y = top + index * rowHeight;
    const value = +row.value || 0;
    const barWidth = Math.round((Math.abs(value) / max) * (width - left - right - 90));
    const color = row.fill || fill;
    svg.push(`<text x="28" y="${y + 19}" font-family="Arial, sans-serif" font-size="16" fill="#1f1a15">${escapeXml(row.label)}</text>`);
    svg.push(`<rect x="${left}" y="${y}" width="${barWidth}" height="24" rx="4" fill="${color}"/>`);
    svg.push(`<text x="${left + barWidth + 10}" y="${y + 18}" font-family="Arial, sans-serif" font-size="15" font-weight="700" fill="#1f1a15">${escapeXml(row.note || String(value))}</text>`);
  });
  svg.push('</svg>');
  fs.writeFileSync(file, `${svg.join('\n')}\n`);
}

function escapeXml(value){
  return String(value ?? '').replace(/[&<>"']/g, char => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&apos;'
  }[char]));
}

function buildCharts(outDir, report){
  const movementRows = report.metricMovements
    .filter(row => Number.isFinite(+row.delta10))
    .map(row => ({
      label: row.label.replace('Challenge-stage ', 'Challenge '),
      value: row.delta10,
      note: `${row.delta10 >= 0 ? '+' : ''}${row.delta10}`,
      fill: row.delta10 > 0.5 ? '#16784f' : row.delta10 > 0 ? '#b68118' : '#a64136'
    }));
  barSvg(path.join(outDir, 'score-movement-critical-axes.svg'), 'Estimated Score Movement In The Focused Work Block', movementRows);

  const gapRows = report.metricMovements
    .filter(row => Number.isFinite(+row.currentScore10) && !['challenge-safety'].includes(row.id))
    .sort((a, b) => (+a.currentScore10) - (+b.currentScore10))
    .slice(0, 8)
    .map(row => ({
      label: row.label,
      value: Math.max(0, 10 - (+row.currentScore10 || 0)),
      note: `${scoreLabel(row.currentScore10)} current`,
      fill: (+row.currentScore10 < 5) ? '#a64136' : '#b68118'
    }));
  barSvg(path.join(outDir, 'largest-human-conformance-gaps.svg'), 'Largest Remaining Human-Level Conformance Gaps', gapRows, { fill: '#a64136' });

  const spendRows = [
    report.resourceRead.dashboardChallengeSpend ? {
      label: 'Challenge set-piece tracked spend',
      value: report.resourceRead.dashboardChallengeSpend.wallMinutes || 0,
      note: `${report.resourceRead.dashboardChallengeSpend.wallMinutes || 0} wall min; current ${scoreLabel(report.resourceRead.challengeCurrentScore10)}`,
      fill: '#2f79a8'
    } : null,
    report.resourceRead.dashboardAudioSpend ? {
      label: 'Audio tracked spend',
      value: report.resourceRead.dashboardAudioSpend.wallMinutes || 0,
      note: `${report.resourceRead.dashboardAudioSpend.wallMinutes || 0} wall min; current ${scoreLabel(report.resourceRead.audioCurrentScore10)}`,
      fill: '#8d5aa8'
    } : null,
    {
      label: 'Unlogged recent Codex/human review debt',
      value: report.resourceRead.estimatedUnloggedHours * 60,
      note: `~${report.resourceRead.estimatedUnloggedHours} hr estimate, not ledger-grade`,
      fill: '#a64136'
    }
  ].filter(Boolean);
  barSvg(path.join(outDir, 'spend-versus-confidence-gaps.svg'), 'Tracked Spend Versus Remaining Gaps', spendRows, { fill: '#2f79a8' });
}

function parseTrackedSpend(row){
  const text = row?.costContext?.trackedSpend || '';
  const runs = +(text.match(/(\d+)\s+runs/)?.[1] || row?.costContext?.trackedRuns || 0);
  const wallMinutes = +(text.match(/([\d.]+)\s+min wall/)?.[1] || ((row?.costContext?.trackedWallSeconds || 0) / 60).toFixed(1));
  const cpuMinutes = +(text.match(/([\d.]+)\s+min CPU/)?.[1] || ((row?.costContext?.trackedCpuSeconds || 0) / 60).toFixed(1));
  return { runs, wallMinutes, cpuMinutes, label: text || 'no tracked spend' };
}

function buildReadme(report, outDir){
  const chart = name => rel(path.join(outDir, name));
  const lines = [
    '# Conformance Investment Retrospective',
    '',
    `Generated: \`${report.generatedAt}\``,
    `Commit: \`${report.commit}\``,
    '',
    '## Purpose',
    '',
    'This artifact is the self-critical read for the most recent focused conformance work block. It separates measurement progress from player-facing progress, then names the areas where Aurora is still not moving toward human-level Galaga conformance fast enough.',
    '',
    '## Executive Read',
    '',
    report.executiveRead,
    '',
    '## Metric Movement',
    '',
    '| Metric | Start | Current | Delta | Read |',
    '| --- | ---: | ---: | ---: | --- |'
  ];
  for(const row of report.metricMovements){
    lines.push(`| ${row.label} | ${scoreLabel(row.startScore10)} | ${scoreLabel(row.currentScore10)} | ${row.delta10 === null ? 'n/a' : `${row.delta10 >= 0 ? '+' : ''}${row.delta10}`} | ${row.playerMeaning} |`);
  }
  lines.push('');
  lines.push('## Where We Moved Most');
  lines.push('');
  for(const item of report.movedMost) lines.push(`- ${item}`);
  lines.push('');
  lines.push('## Where We Moved Least');
  lines.push('');
  for(const item of report.movedLeast) lines.push(`- ${item}`);
  lines.push('');
  lines.push('## Where We Are Consistently Failing');
  lines.push('');
  for(const item of report.failurePatterns) lines.push(`- ${item}`);
  lines.push('');
  lines.push('## Recommended Corrections');
  lines.push('');
  for(const item of report.recommendations) lines.push(`- ${item}`);
  lines.push('');
  lines.push('## Resource Accounting Read');
  lines.push('');
  lines.push(`- Challenge-stage dashboard spend: ${report.resourceRead.dashboardChallengeSpend?.label || 'not available'}.`);
  lines.push(`- Audio dashboard spend: ${report.resourceRead.dashboardAudioSpend?.label || 'not available'}.`);
  lines.push(`- Accounting debt: ${report.resourceRead.accountingDebt}`);
  lines.push(`- Estimated unlogged review/model/human orchestration time in this focused block: about ${report.resourceRead.estimatedUnloggedHours} hours.`);
  lines.push('');
  lines.push('## Charts');
  lines.push('');
  lines.push(`![Score movement](${chart('score-movement-critical-axes.svg')})`);
  lines.push('');
  lines.push(`![Largest gaps](${chart('largest-human-conformance-gaps.svg')})`);
  lines.push('');
  lines.push(`![Spend versus gaps](${chart('spend-versus-confidence-gaps.svg')})`);
  lines.push('');
  lines.push('## Deep Links');
  lines.push('');
  for(const link of report.deepLinks) lines.push(`- [${link.label}](${link.href})`);
  return `${lines.join('\n')}\n`;
}

function main(){
  ensureDir(OUT_ROOT);
  const commit = gitShortCommit();
  const branch = git(['branch', '--show-current'], 'unknown');
  const stamp = new Date().toISOString().slice(0, 10);
  const outDir = path.join(OUT_ROOT, `${stamp}-${commit}`);
  ensureDir(outDir);

  const challengeHist = challengeHistory();
  const challenge = latestStrictChallenge(challengeHist);
  const quality = latestStrictQuality(qualityHistory());
  const audioLab = loadLatest('aurora-audio-conformance-lab-v2');
  const audioContracts = loadLatest('aurora-audio-cue-contracts');
  const artifactConformance = loadLatest('application-artifact-conformance');
  const sweeps = sweepSummaries();
  const dashboard = readDashboardEconomics();

  const metricMovements = buildMetricMovements({
    challenge,
    quality,
    audioLab,
    audioContracts,
    artifactConformance
  });
  const dashboardChallengeSpend = parseTrackedSpend(dashboard.challengeRow);
  const dashboardAudioSpend = parseTrackedSpend(dashboard.audioRow);
  const recentSweeps = sweeps.slice(-3);
  const movedMost = [
    `Strict challenge-stage truth improved: the old broad read around 6.1/10 was replaced by a stricter baseline at 2.5/10, then recovered to ${scoreLabel(challenge.latest?.score10)}. This is progress, but it is mostly better measurement plus partial graphical evidence, not a solved gameplay problem.`,
    `Challenge graphical conformance moved from ${scoreLabel(challenge.first?.graphicalConformanceScore10)} to ${scoreLabel(challenge.latest?.graphicalConformanceScore10)} after object-track/static visual evidence landed.`,
    `Overall quality under the strict challenge metric moved only ${quality.first && quality.latest ? `${scoreLabel(quality.first.overall)} -> ${scoreLabel(quality.latest.overall)}` : 'slightly'}, which is an honest signal that the user-visible game has not leapt forward as much as the harness did.`
  ];
  const movedLeast = [
    `Alien novelty remains ${scoreLabel(challenge.latest?.alienNoveltyScore10)}; it did not materially move during the focused block.`,
    `Stage-to-stage challenge progression remains ${scoreLabel(challenge.latest?.progressionConformanceScore10)}; late challenges still do not yet read as distinct Galaga-like lessons.`,
    `Challenge movement conformance is only ${scoreLabel(challenge.latest?.movementConformanceScore10)} and has plateaued relative to the amount of analysis effort.`,
    `Audio runtime promotion is still zero accepted cues even though cue contracts and candidate loops improved the process.`
  ];
  const failurePatterns = [
    'Challenge-stage layout sweeps are too shallow for the real problem. The gap is trajectory grammar, entry/exit choreography, alien-family staging, and temporal sprite motion, not just spawn timing and lane offsets.',
    'Audio candidate loops are optimizing isolated clips faster than they are improving full-theme live capture. Reference-vs-reference calibration and repeated full-theme stability gates must come before more runtime promotion.',
    'Some graphics artifacts are useful to the harness but not useful enough to a human reviewer. Dense contact sheets and tiny "view larger" images need to become stage-by-stage temporal crop strips and object-track overlays.',
    'The economics ledger still undercounts Codex/model/human orchestration time. The charts correctly show measured local CPU/browser spend, but cloud/model work is only visible when manually logged.',
    'High broad scores can mask low strict scores. The broad alien/challenge novelty score is useful context, but the strict challenge-stage set-piece score is the one that matches the human complaint.'
  ];
  const recommendations = [
    'Make challenge-stage path grammar the next primary gameplay investment: define per-challenge contracts for group order, first-visible frame, path length, turn count, exit side, alien family, animation phases, and bonus-shot opportunity.',
    'Build direct target object tracks from the supplied Galaga challenge videos and compare Aurora tracks against those trajectories before authoring another large sweep.',
    'Replace dense challenge contact sheets in the human docs with larger expandable crop sequences: reference target strip, Aurora current strip, object-track overlay, and per-axis score.',
    'Freeze audio runtime promotion until reference-vs-reference and current-vs-current variance is known for challengePerfect, challengeTransition, gameOver, captureBeam, and stagePulse.',
    'Log every multi-hour cycle with `npm run harness:measure`, and add a manual GPU-equivalent Codex entry whenever model work materially designs, interprets, or changes the harness.',
    'Treat the next beta justification as requiring visible player-facing lift in challenge movement/novelty or audio clarity, not just more documentation or scorer sophistication.'
  ];
  const report = {
    schemaVersion: 1,
    artifactType: 'conformance-investment-retrospective',
    generatedAt: new Date().toISOString(),
    commit,
    branch,
    workWindow: {
      label: 'Estimated focused conformance work block',
      estimatedHours: 10,
      basis: 'Committed artifacts, challenge-stage history, quality score history, dashboard cost context, candidate sweep reports, and current audio/application artifacts. Some Codex/model/human orchestration time is estimated because it was not automatically logged.'
    },
    executiveRead: 'The past focused block substantially improved our honesty and repeatability, but only modestly improved player-facing conformance. Challenge stages are now scored with a strict 1/10 baseline and have risen to 3.8/10; that is a real improvement from the strict 2.5/10 baseline, but still far from human-level Galaga conformance. The biggest remaining failures are movement grammar, alien novelty, stage-to-stage challenge progression, and stable audio runtime promotion.',
    metricMovements,
    movedMost,
    movedLeast,
    failurePatterns,
    recommendations,
    candidateSweepRead: {
      recentSweeps,
      interpretation: recentSweeps.length
        ? 'Recent stage candidate sweeps found small theoretical lifts, but no broad keeper that solves late challenge choreography. This supports a pivot from parameter sweeps to authored path contracts plus direct object-track scoring.'
        : 'No recent challenge sweep reports were found.'
    },
    resourceRead: {
      dashboardChallengeSpend,
      dashboardAudioSpend,
      challengeCurrentScore10: dashboard.challengeRow?.score10 ?? challenge.latest?.score10 ?? null,
      audioCurrentScore10: dashboard.audioRow?.score10 ?? quality.latest?.audio ?? null,
      estimatedUnloggedHours: 10,
      accountingDebt: 'Recent repo work includes merge/review/documentation and model-assisted reasoning that is not fully represented in the measured run ledger. Treat cost charts as a lower bound until manual Codex/model entries are logged per work cycle.',
      dashboardSource: dashboard.source ? rel(dashboard.source) : null
    },
    sourceReports: {
      challengeStageConformance: challenge.latest?.report || null,
      qualityConformance: quality.latest?.file ? rel(quality.latest.file) : null,
      audioLabV2: audioLab?.file ? rel(audioLab.file) : null,
      audioCueContracts: audioContracts?.file ? rel(audioContracts.file) : null,
      applicationArtifactConformance: artifactConformance?.file ? rel(artifactConformance.file) : null,
      releaseConformanceDashboard: dashboard.source ? rel(dashboard.source) : null
    },
    deepLinks: [
      {
        label: 'Local Cost / Value dashboard',
        href: 'http://127.0.0.1:4312/local-dev/conformance-dashboard.html?game=aurora-galactica#cost'
      },
      {
        label: 'Hosted dev Cost / Value dashboard',
        href: 'https://sgwoods.github.io/Aurora-Galactica/dev/conformance-dashboard.html?game=aurora-galactica#cost'
      },
      {
        label: 'Hosted dev conformance dashboard',
        href: 'https://sgwoods.github.io/Aurora-Galactica/dev/conformance-dashboard.html?game=aurora-galactica#conformance'
      },
      {
        label: 'Project guide retrospective section',
        href: 'project-guide.html#conformance-investment-retrospective-doc'
      }
    ]
  };

  writeJson(path.join(outDir, 'report.json'), report);
  writeJson(path.join(OUT_ROOT, 'latest.json'), report);
  buildCharts(outDir, report);
  fs.writeFileSync(path.join(outDir, 'README.md'), buildReadme(report, outDir));
  fs.writeFileSync(TOP_LEVEL_DOC, buildReadme(report, outDir));
  console.log(JSON.stringify({
    ok: true,
    report: rel(path.join(outDir, 'report.json')),
    latest: rel(path.join(OUT_ROOT, 'latest.json')),
    doc: rel(TOP_LEVEL_DOC),
    score10: challenge.latest?.score10 || null,
    weakest: ['challenge movement', 'alien novelty', 'challenge progression', 'audio runtime promotion']
  }, null, 2));
}

main();
