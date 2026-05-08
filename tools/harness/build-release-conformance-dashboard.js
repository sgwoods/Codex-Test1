#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..', '..');
const OUT = path.join(ROOT, 'RELEASE_CONFORMANCE_DASHBOARD.md');
const ANALYSES = path.join(ROOT, 'reference-artifacts', 'analyses');
const DASHBOARD_ANALYSIS_ROOT = path.join(ANALYSES, 'release-conformance-dashboard');

function readJson(file){
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function ensureDir(dir){
  fs.mkdirSync(dir, { recursive: true });
}

function writeJson(file, value){
  ensureDir(path.dirname(file));
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
}

function rel(file){
  return path.relative(ROOT, file).split(path.sep).join('/');
}

function git(args, fallback = ''){
  try{
    return execSync(`git -C "${ROOT}" ${args}`, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
  }catch{
    return fallback;
  }
}

function walkReports(dir){
  const out = [];
  function walk(current){
    if(!fs.existsSync(current)) return;
    for(const entry of fs.readdirSync(current, { withFileTypes: true })){
      const full = path.join(current, entry.name);
      if(entry.isDirectory()) walk(full);
      else if(entry.isFile() && entry.name === 'report.json') out.push(full);
    }
  }
  walk(dir);
  return out.sort((a, b) => {
    const delta = fs.statSync(a).mtimeMs - fs.statSync(b).mtimeMs;
    return delta || a.localeCompare(b);
  });
}

function latestReport(artifact){
  const reports = walkReports(path.join(ANALYSES, artifact));
  if(!reports.length) return null;
  return reports[reports.length - 1];
}

function latestCommittedQualityReport(){
  const reports = walkReports(path.join(ANALYSES, 'quality-conformance'))
    .filter(file => !file.includes('-dirty/'));
  if(!reports.length) return null;
  return reports[reports.length - 1];
}

function category(report, id){
  return (report.categories || []).find(item => item.id === id) || null;
}

function score(value){
  return Number.isFinite(+value) ? `${(+value).toFixed(1).replace(/\.0$/, '')}/10` : '--';
}

function md(value){
  return String(value ?? '')
    .replace(/\|/g, '\\|')
    .replace(/\n+/g, '<br>');
}

function table(headers, rows){
  return [
    `| ${headers.map(md).join(' | ')} |`,
    `| ${headers.map(() => '---').join(' | ')} |`,
    ...rows.map(row => `| ${(row.cells || row).map(md).join(' | ')} |`)
  ].join('\n');
}

function row({ rank, metric, score10, target, status, why, effort, next, evidence }){
  const normalizedScore = Number.isFinite(+score10) ? +(+score10).toFixed(3) : null;
  return {
    rank,
    metric,
    score10: normalizedScore,
    current: score(score10),
    target,
    status,
    why,
    effort,
    next,
    evidence,
    cells: [rank, metric, score(score10), target, status, why, effort, next, evidence]
  };
}

function tableObjects(headers, rows){
  return rows.map(row => {
    const cells = row.cells || row;
    return Object.fromEntries(headers.map((header, index) => [header, cells[index] ?? '']));
  });
}

function main(){
  const qualityPath = latestCommittedQualityReport();
  if(!qualityPath) throw new Error('No quality-conformance report found.');
  const priorityPath = latestReport('conformance-investment-priorities');
  const levelArcPath = latestReport('level-arc-conformance');
  const economicsPath = latestReport('conformance-economics');
  const quality = readJson(qualityPath);
  const priority = priorityPath ? readJson(priorityPath) : { candidates: [] };
  const levelArc = levelArcPath ? readJson(levelArcPath) : { summary: {} };
  const economics = economicsPath ? readJson(economicsPath) : { summary: {} };

  const audio = category(quality, 'audio');
  const level = category(quality, 'level-arc');
  const stage1Timing = category(quality, 'stage1-timing');
  const stage1Geometry = category(quality, 'stage1-geometry');
  const progression = category(quality, 'progression');
  const challengeTiming = category(quality, 'challenge-timing');
  const uiShell = category(quality, 'ui-shell');
  const movement = category(quality, 'movement');
  const combat = category(quality, 'combat-responsiveness');
  const diveSafety = category(quality, 'dive-safety');
  const capture = category(quality, 'capture-rescue');

  const qualityCount = Math.max((quality.categories || []).length, 1);
  const equalWeight = +(1 / qualityCount).toFixed(3);
  const investmentById = Object.fromEntries((priority.candidates || []).map(item => [item.id, item]));
  const audioCandidate = investmentById['audio-reference-segmentation'];
  const stage12Candidate = investmentById['stage12-natural-reward-window'];
  const stage4Candidate = investmentById['stage4-pressure-exact-replay'];

  const alienEntryScore = Math.min(10, ((stage1Timing?.score10 || 0) * 0.45) + ((stage1Geometry?.score10 || 0) * 0.35) + ((levelArc.summary?.submetrics || []).find(m => m.id === 'movement-grammar-expansion')?.score10 || 8.4) * 0.2);
  const challengeVariationScore = Math.min(10, ((challengeTiming?.score10 || 0) * 0.45) + ((levelArc.summary?.submetrics || []).find(m => m.id === 'challenge-stage-identity')?.score10 || 8.4) * 0.35 + ((levelArc.summary?.submetrics || []).find(m => m.id === 'long-run-non-repetition')?.score10 || 8.2) * 0.2);
  const visualLookScore = 7.4;
  const frontDoorScore = 8.0;
  const popupScore = uiShell?.score10 || 0;
  const arcadeFrameScore = uiShell?.score10 || 0;

  const rows = [
    row({
      rank: 1,
      metric: 'Audio identity, event feedback, and cue alignment',
      score10: audio?.score10,
      target: '7.5-8.0',
      status: 'Measured release category; weakest axis',
      why: 'Largest current score gap and high user-experience impact: shots, explosions, boss damage, challenge results, capture/rescue feedback.',
      effort: 'High; 3-6 hrs local/model-assisted analysis',
      next: audioCandidate?.nextAction || 'Run audio segmentation and cue-matching cycle.',
      evidence: rel(qualityPath)
    }),
    row({
      rank: 2,
      metric: 'Level arc and encounter shape',
      score10: level?.score10,
      target: '8.8-9.0',
      status: 'Measured release category',
      why: 'Controls whether long play feels like Galaga-like escalation rather than repeated pressure.',
      effort: 'Medium-high; 2-5 hrs',
      next: stage12Candidate?.nextAction || 'Run level-arc candidate loop.',
      evidence: levelArcPath ? rel(levelArcPath) : rel(qualityPath)
    }),
    row({
      rank: 3,
      metric: 'Overall visual look and feel: gameplay, start page, typography complexity',
      score10: visualLookScore,
      target: '8.4-8.8',
      status: 'Estimated; needs dedicated visual conformance scorer',
      why: 'A high score can still feel off if start text, density, contrast, alien readability, and arcade typography do not cohere.',
      effort: 'Medium; 2-4 hrs, screenshot/contact-sheet driven',
      next: 'Create a visual-look scorer covering start/attract page, gameplay readability, typography density, color discipline, and reference contact sheets.',
      evidence: 'UI shell suite plus generated frame/contact-sheet artifacts'
    }),
    row({
      rank: 4,
      metric: 'Stage 4 pressure exact replay / pressure curve precision',
      score10: levelArc.summary?.weakestSubmetric?.score10 || 7.5,
      target: '8.2-8.6',
      status: 'Measured level-arc weak submetric',
      why: 'Pressure should be learnable and reproducible, not merely present in one run.',
      effort: 'Medium-high; prior runs ~12.8 min wall / 18.5 min CPU',
      next: stage4Candidate?.nextAction || 'Run focused Stage 4 pressure replay matching.',
      evidence: levelArcPath ? rel(levelArcPath) : rel(qualityPath)
    }),
    row({
      rank: 5,
      metric: 'Alien entry to levels: formation, timing, and methods',
      score10: alienEntryScore,
      target: '9.0-9.4 with dedicated scorer',
      status: 'Composite proxy: stage opening timing + geometry + movement grammar',
      why: 'Entry formations and rack timing are a first-order arcade authenticity signal before combat even starts.',
      effort: 'Medium; 1-3 hrs plus visual review',
      next: 'Promote alien-entry as its own scored submetric; compare stage-entry contact sheets and timing traces across early/mid/late levels.',
      evidence: `${rel(qualityPath)}; ${levelArcPath ? rel(levelArcPath) : 'level-arc not found'}`
    }),
    row({
      rank: 6,
      metric: 'Challenge-stage variation and new alien/formations introduction',
      score10: challengeVariationScore,
      target: '9.0-9.4 with dedicated scorer',
      status: 'Composite proxy: challenge timing + challenge identity + non-repetition',
      why: 'Challenge stages should teach new motion/reward patterns, not only pause normal combat.',
      effort: 'Medium-high; 2-4 hrs',
      next: 'Add a challenge-variation metric for alien type introduction, path families, result feedback, and bonus opportunity clarity.',
      evidence: `${rel(qualityPath)}; ${levelArcPath ? rel(levelArcPath) : 'level-arc not found'}`
    }),
    row({
      rank: 7,
      metric: 'Progression and persona depth',
      score10: progression?.score10,
      target: '9.1+',
      status: 'Measured release category',
      why: 'Keeps the game learnable across skill levels and supports later-stage quality.',
      effort: 'Low-medium; 1-2 hrs',
      next: 'Resolve remaining ordering edge case after higher-value audio/level-arc work.',
      evidence: rel(qualityPath)
    }),
    row({
      rank: 8,
      metric: 'Stage 1 opening timing fidelity',
      score10: stage1Timing?.score10,
      target: '8.8-9.2',
      status: 'Measured release category',
      why: 'First impression and direct reference feel.',
      effort: 'Low-medium; 1-2 hrs',
      next: 'Tune only after audio and level-arc priorities unless regressions appear.',
      evidence: rel(qualityPath)
    }),
    row({
      rank: 9,
      metric: 'Arcade console frame UI style',
      score10: arcadeFrameScore,
      target: '9.4-9.6',
      status: 'Measured as UI shell; needs separate arcade-frame style rubric',
      why: 'The cabinet frame is the constant product surface around every game.',
      effort: 'Medium; 1-3 hrs visual QA',
      next: 'Split frame style from generic shell integrity: rails, bezel density, labels, chroming, build/date treatment.',
      evidence: rel(qualityPath)
    }),
    row({
      rank: 10,
      metric: 'Popup/help/scoring/leaderboard surface formatting',
      score10: popupScore,
      target: '9.4-9.6',
      status: 'Measured through UI shell suite; needs modal-specific scoring',
      why: 'Popup surfaces carry learning, scoring trust, feedback, and player records.',
      effort: 'Low-medium; 1-2 hrs',
      next: 'Add modal-specific scorer for help, scoring, feedback, account, leaderboard, and game-over result screens.',
      evidence: rel(qualityPath)
    }),
    row({
      rank: 11,
      metric: 'Dive fairness and safety',
      score10: diveSafety?.score10,
      target: '9.3+',
      status: 'Measured release category',
      why: 'Protects user trust while pressure is increased.',
      effort: 'Guardrail; 30-90 min per risky gameplay cycle',
      next: 'Keep as required guardrail for pressure/reward changes.',
      evidence: rel(qualityPath)
    }),
    row({
      rank: 12,
      metric: 'Player movement conformance',
      score10: movement?.score10,
      target: 'Maintain 10',
      status: 'Measured release category',
      why: 'Core control feel is already excellent.',
      effort: 'Guardrail only',
      next: 'Do not tune unless a new reference metric proves a gap.',
      evidence: rel(qualityPath)
    }),
    row({
      rank: 13,
      metric: 'Shot and hit responsiveness',
      score10: combat?.score10,
      target: 'Maintain 10',
      status: 'Measured release category',
      why: 'Core combat response is already excellent.',
      effort: 'Guardrail only',
      next: 'Protect during explosion/audio/event feedback work.',
      evidence: rel(qualityPath)
    }),
    row({
      rank: 14,
      metric: 'Stage 1 opening geometry fidelity',
      score10: stage1Geometry?.score10,
      target: 'Maintain 10',
      status: 'Measured release category',
      why: 'Formation geometry is already locked.',
      effort: 'Guardrail only',
      next: 'Protect during alien-entry visual work.',
      evidence: rel(qualityPath)
    }),
    row({
      rank: 15,
      metric: 'Capture and rescue rule fidelity',
      score10: capture?.score10,
      target: 'Maintain 10',
      status: 'Measured release category',
      why: 'Strong Galaga identity mechanic; should not regress while feedback improves.',
      effort: 'Guardrail only',
      next: 'Use as release blocker for capture/rescue-adjacent audio or explosion changes.',
      evidence: rel(qualityPath)
    }),
    row({
      rank: 16,
      metric: 'Challenge-stage timing fidelity',
      score10: challengeTiming?.score10,
      target: 'Maintain 9.8+',
      status: 'Measured release category',
      why: 'Timing is strong; variation is the gap, not baseline timing.',
      effort: 'Guardrail only',
      next: 'Preserve while adding challenge variation scoring.',
      evidence: rel(qualityPath)
    })
  ];

  const generatedAt = new Date().toISOString();
  const releaseGate = [
    ['Overall quality', score(quality.summary?.overallScore10), '>=9.3', 'Full score refresh after all major cycles'],
    ['Audio identity', score(audio?.score10), '>=7.5', 'Primary user-experience gap'],
    ['Level arc', score(level?.score10), '>=8.8', 'Long-play gameplay-quality gate'],
    ['Alien entry / formations', `${score(alienEntryScore)} composite`, '>=9.2 with dedicated scorer', 'New explicit gate'],
    ['Challenge variation', `${score(challengeVariationScore)} composite`, '>=9.2 with dedicated scorer', 'New explicit gate'],
    ['Visual look and feel', score(visualLookScore), '>=8.4', 'New explicit gate; currently estimated'],
    ['Arcade frame and popup surfaces', score(Math.min(arcadeFrameScore, popupScore)), '>=9.4', 'Split from generic UI shell before final gate'],
    ['No-regression guardrails', 'movement/combat/capture >=10; challenge timing >=9.8', 'Maintain', 'Hard blockers']
  ];

  const releaseGateHeaders = ['Gate', 'Current', 'Target', 'Notes'];
  const priorityHeaders = ['Priority', 'Metric', 'Current', 'Major-gate target', 'Measurement status', 'Why this matters', 'Effort / time estimate', 'Recommended next step', 'Evidence'];
  const sourceReports = {
    quality: rel(qualityPath),
    investmentPriority: priorityPath ? rel(priorityPath) : null,
    levelArc: levelArcPath ? rel(levelArcPath) : null,
    economics: economicsPath ? rel(economicsPath) : null
  };
  const commit = git('rev-parse --short HEAD', 'unknown');
  const branch = git('branch --show-current', '');
  const dirty = git('status --short', '').trim().length > 0;
  const reportDir = path.join(DASHBOARD_ANALYSIS_ROOT, `${generatedAt.slice(0, 10)}-${commit}${dirty ? '-dirty' : ''}`);
  const dashboardData = {
    schemaVersion: 1,
    artifactType: 'release-conformance-dashboard',
    generatedAt,
    commit,
    branch,
    dirty,
    sourceReports,
    equalQualityCategoryWeight: equalWeight,
    releaseGate: tableObjects(releaseGateHeaders, releaseGate),
    priorityRows: rows.map(({ cells, ...entry }) => entry),
    priorityTable: tableObjects(priorityHeaders, rows),
    newFirstClassAxes: [
      'Alien entry to levels: formation layout, timing, path method, and whether different stages enter differently.',
      'Challenge-stage variation: new alien types, new entry formations/styles, path families, reward/result feedback, and teaching value.',
      'Overall visual look and feel: gameplay readability, start/attract typography density, copy complexity, color discipline, and reference contact sheets.',
      'Arcade console frame UI: cabinet frame, bezel/rails, build/date trust signals, button density, and arcade-style containment.',
      'Popup/help/scoring surfaces: help, scoring, leaderboard, account, feedback, and game-over result formatting as their own modal-quality family.'
    ],
    maintenanceRules: [
      'Refresh this artifact after each full quality score, investment-priority run, or major conformance loop.',
      'Keep the local dashboard generated from this artifact data; do not link or publish it through player-facing Platinum surfaces until explicitly approved.',
      'Treat rows marked estimated/composite as measurement debt: useful for planning, but not release-proof until backed by a harness.',
      'Keep user-facing release gates separate from harness-learning wins. A rejected candidate still belongs in artifacts when it teaches the loop what not to keep.',
      'Prefer work with a large score gap, high user-experience impact, reusable ingestion/harness value, and clear guardrails.'
    ]
  };

  writeJson(path.join(reportDir, 'report.json'), dashboardData);
  writeJson(path.join(DASHBOARD_ANALYSIS_ROOT, 'latest.json'), dashboardData);

  const lines = [
    '# Release Conformance Dashboard',
    '',
    `Generated: \`${generatedAt}\``,
    '',
    'This is the primary at-a-glance planning artifact for Aurora conformance work. It answers what we are trying to improve, why it matters, how close it is to a significant user-facing release gate, and what the next investment should be.',
    '',
    'Local internal dashboard: `http://127.0.0.1:4312/local-dev/conformance-dashboard.html` after `npm run local:resume`. Refresh the underlying local page data with `npm run dev:conformance-dashboard` when running a live planning cycle.',
    '',
    '## Current Release Gate',
    '',
    table(releaseGateHeaders, releaseGate),
    '',
    '## Priority Table',
    '',
    table(
      priorityHeaders,
      rows
    ),
    '',
    '## New First-Class Axes Added',
    '',
    '- Alien entry to levels: formation layout, timing, path method, and whether different stages enter differently.',
    '- Challenge-stage variation: new alien types, new entry formations/styles, path families, reward/result feedback, and teaching value.',
    '- Overall visual look and feel: gameplay readability, start/attract typography density, copy complexity, color discipline, and reference contact sheets.',
    '- Arcade console frame UI: cabinet frame, bezel/rails, build/date trust signals, button density, and arcade-style containment.',
    '- Popup/help/scoring surfaces: help, scoring, leaderboard, account, feedback, and game-over result formatting as their own modal-quality family.',
    '',
    '## Maintenance Rules',
    '',
    '- Refresh this artifact after each full quality score, investment-priority run, or major conformance loop.',
    '- Keep the local dashboard generated from this artifact data; do not link or publish it through player-facing Platinum surfaces until explicitly approved.',
    '- Treat rows marked estimated/composite as measurement debt: useful for planning, but not release-proof until backed by a harness.',
    '- Keep user-facing release gates separate from harness-learning wins. A rejected candidate still belongs in artifacts when it teaches the loop what not to keep.',
    '- Prefer work with a large score gap, high user-experience impact, reusable ingestion/harness value, and clear guardrails.',
    '',
    '## Evidence Index',
    '',
    `- Quality report: \`${rel(qualityPath)}\``,
    priorityPath ? `- Investment priority report: \`${rel(priorityPath)}\`` : '- Investment priority report: not found',
    levelArcPath ? `- Level-arc report: \`${rel(levelArcPath)}\`` : '- Level-arc report: not found',
    economicsPath ? `- Economics report: \`${rel(economicsPath)}\`` : '- Economics report: not found',
    `- Equal current quality-category weight: \`${equalWeight}\``
  ];

  fs.writeFileSync(OUT, `${lines.join('\n')}\n`);
  console.log(JSON.stringify({
    ok: true,
    output: rel(OUT),
    data: rel(path.join(DASHBOARD_ANALYSIS_ROOT, 'latest.json')),
    report: rel(path.join(reportDir, 'report.json')),
    qualityReport: rel(qualityPath),
    priorityReport: priorityPath ? rel(priorityPath) : null,
    levelArcReport: levelArcPath ? rel(levelArcPath) : null,
    economicsReport: economicsPath ? rel(economicsPath) : null,
    overallScore10: quality.summary?.overallScore10 || null
  }, null, 2));
}

main();
