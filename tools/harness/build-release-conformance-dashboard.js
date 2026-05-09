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

function fileExists(file){
  return fs.existsSync(path.join(ROOT, file));
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

function countFiles(dir, predicate = () => true){
  let count = 0;
  const root = path.resolve(ROOT, dir);
  function walk(current){
    if(!fs.existsSync(current)) return;
    for(const entry of fs.readdirSync(current, { withFileTypes: true })){
      const full = path.join(current, entry.name);
      if(entry.isDirectory()) walk(full);
      else if(entry.isFile() && predicate(full)) count++;
    }
  }
  walk(root);
  return count;
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

function levelArcScore(categoryRead, levelArcReport){
  return Number.isFinite(+levelArcReport?.summary?.score10)
    ? +levelArcReport.summary.score10
    : categoryRead?.score10;
}

function levelArcSubmetric(levelArcReport, id){
  return (levelArcReport?.submetrics || levelArcReport?.summary?.submetrics || []).find(item => item.id === id) || null;
}

function score(value){
  return Number.isFinite(+value) ? `${(+value).toFixed(1).replace(/\.0$/, '')}/10` : '--';
}

function minutes(value){
  return Number.isFinite(+value) ? `${(+value / 60).toFixed(1).replace(/\.0$/, '')} min` : '--';
}

function megabytes(value){
  return Number.isFinite(+value) ? `${(+value / 1000000).toFixed(1).replace(/\.0$/, '')} MB` : '--';
}

function scoreGap(current, targetText){
  const match = String(targetText || '').match(/(\d+(?:\.\d+)?)/);
  if(!match || !Number.isFinite(+current)) return '--';
  const gap = Math.max(0, +match[1] - +current);
  return gap ? `+${gap.toFixed(1).replace(/\.0$/, '')}` : 'at target';
}

function inferredResources(metric){
  const text = String(metric || '').toLowerCase();
  const resources = ['cpu'];
  if(/visual|frame|popup|arcade|entry|challenge|stage|level|pressure|movement/.test(text)) resources.push('browser');
  if(/audio/.test(text)) resources.push('model-api', 'openai-api');
  if(/visual|graphics|frame/.test(text)) resources.push('gpu');
  return Array.from(new Set(resources)).join(', ');
}

function metricAxisKeys(metric){
  const text = String(metric || '').toLowerCase();
  if(text.includes('audio identity')) return ['audio'];
  if(text.includes('alien entry and challenge')) return ['alien-entry', 'level-arc', 'conformance-loop'];
  if(text.includes('stage 4 pressure')) return ['stage4-pressure'];
  if(text.includes('level arc')) return ['level-arc', 'conformance-loop'];
  if(text.includes('boss entry') || text.includes('formation grammar')) return ['level-arc', 'conformance-loop'];
  if(text.includes('visual look')) return ['visual-look'];
  if(text.includes('alien entry')) return ['level-arc', 'quality-score'];
  if(text.includes('challenge-stage variation')) return ['level-arc', 'quality-score'];
  if(text.includes('progression')) return ['quality-score'];
  if(text.includes('stage 1 opening timing')) return ['quality-score'];
  if(text.includes('arcade console frame') || text.includes('popup') || text.includes('leaderboard')) return ['quality-score'];
  if(text.includes('dive fairness')) return ['stage4-pressure', 'quality-score'];
  if(text.includes('player movement') || text.includes('shot and hit') || text.includes('stage 1 opening geometry') || text.includes('capture and rescue') || text.includes('challenge-stage timing')) return ['quality-score'];
  return ['quality-score'];
}

function investmentForMetric(metric, investmentById){
  const text = String(metric || '').toLowerCase();
  if(text.includes('audio identity')) return investmentById['audio-reference-segmentation'] || null;
  if(text.includes('alien entry and challenge')) return investmentById['alien-entry-challenge-variation'] || investmentById['formation-boss-reference-path-comparison'] || null;
  if(text.includes('boss entry') || text.includes('formation grammar')) return investmentById['formation-boss-frame-labeled-reference-paths'] || investmentById['formation-boss-reference-path-comparison'] || investmentById['formation-boss-path-slot-extraction'] || null;
  if(text.includes('stage 4 pressure')) return investmentById['stage4-pressure-exact-replay'] || null;
  if(text.includes('level arc')) return investmentById['level-arc-opportunity-coverage'] || investmentById['stage12-natural-reward-window'] || null;
  if(text.includes('stage 1 opening timing')) return investmentById['stage1-timing-polish'] || null;
  if(text.includes('visual look') || text.includes('arcade console frame') || text.includes('popup') || text.includes('leaderboard')) return investmentById['ui-graphics-polish'] || null;
  return null;
}

function sumAxisSpend(economics, axisKeys){
  const byAxis = economics.summary?.ledger?.byAxis || {};
  return axisKeys.reduce((sum, key) => {
    const item = byAxis[key] || {};
    return {
      runs: sum.runs + (item.runs || 0),
      wallSeconds: sum.wallSeconds + (item.wallSeconds || 0),
      cpuSeconds: sum.cpuSeconds + (item.cpuSeconds || 0)
    };
  }, { runs: 0, wallSeconds: 0, cpuSeconds: 0 });
}

function compactSpend(value){
  if(!value || !value.runs) return 'no dedicated spend tracked';
  return `${value.runs} runs; ${minutes(value.wallSeconds)} wall; ${minutes(value.cpuSeconds)} CPU`;
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
  const scoreContext = metricScoreContext(metric, normalizedScore);
  return {
    rank,
    metric,
    explanation: metricExplanation(metric),
    scoreContext,
    score10: normalizedScore,
    current: score(score10),
    target,
    status,
    why,
    effort,
    next,
    evidence
  };
}

function updateRowCells(item){
  const cost = item.costContext || {};
  item.cells = [
    item.rank,
    item.metric,
    item.current,
    item.scoreContext?.confidence || '',
    item.scoreContext?.resolution || '',
    cost.summary || '',
    cost.trackedSpend || '',
    item.target,
    item.status,
    item.why,
    item.effort,
    item.next,
    item.evidence
  ];
  return item;
}

function costSummary(costClass, resources){
  return `${costClass || 'unclassified'}; ${resources || 'cpu'}`;
}

function addCostContext(item, economics, investmentById){
  const axisKeys = metricAxisKeys(item.metric);
  const candidate = investmentForMetric(item.metric, investmentById);
  const axisSpend = sumAxisSpend(economics, axisKeys);
  const measured = axisSpend.runs ? axisSpend : (candidate?.measuredComputeHistory || axisSpend);
  const expectedResources = inferredResources(item.metric);
  const costClass = candidate?.costClass || (/guardrail/i.test(item.effort || '') ? 'guardrail' : 'estimated');
  const expectedLift10 = Number.isFinite(+candidate?.expectedLift10) ? +candidate.expectedLift10 : null;
  const expectedOverallLift10 = Number.isFinite(+candidate?.expectedOverallLift10) ? +candidate.expectedOverallLift10 : null;
  const investmentScore = Number.isFinite(+candidate?.investmentScore) ? +candidate.investmentScore : null;
  item.costContext = {
    costClass,
    expectedResources,
    trackedAxes: axisKeys,
    trackedSpend: compactSpend(measured),
    trackedRuns: measured.runs || 0,
    trackedWallSeconds: measured.wallSeconds || 0,
    trackedCpuSeconds: measured.cpuSeconds || 0,
    expectedLift10,
    expectedOverallLift10,
    investmentScore,
    gapToTarget: scoreGap(item.score10, item.target),
    summary: costSummary(costClass, expectedResources),
    valueCostRead: candidate
      ? `Expected lift ${expectedLift10}/10 on metric, ${expectedOverallLift10}/10 overall; investment score ${investmentScore}.`
      : (/guardrail/i.test(item.effort || '')
        ? 'Guardrail spend: value is preventing regression rather than raising the score.'
        : 'Estimated cost/value; dedicated investment candidate not yet generated.')
  };
  return updateRowCells(item);
}

function scoreMeaning(score10){
  if(!Number.isFinite(+score10)) return 'Planning estimate or unscored proxy; useful for prioritization, not release proof.';
  if(+score10 >= 9.95) return 'No known measured gap under the current scorer and evidence coverage. This is a guardrail pass, not proof of perfection.';
  if(+score10 >= 9) return 'Strong measured conformance with known remaining risk mostly in narrower edge cases, coverage, or polish.';
  if(+score10 >= 8) return 'Good conformance, but the gap is likely visible to attentive players or designers in some scenarios.';
  if(+score10 >= 7) return 'Material conformance gap with meaningful user-experience or reference-identity impact.';
  return 'Major conformance gap or immature metric requiring stronger evidence before release confidence.';
}

function metricScoreContext(metric, score10){
  const text = String(metric || '').toLowerCase();
  const base = {
    confidence: 'medium',
    resolution: 'scorer-backed artifact with selected harness windows',
    scoreMeaning: scoreMeaning(score10)
  };
  if(text.includes('visual look')){
    return {
      confidence: 'medium-low',
      resolution: 'first-pass visual scorer when available; still needs reference-backed contact sheets and sprite/style sub-scorers',
      scoreMeaning: scoreMeaning(score10)
    };
  }
  if(text.includes('alien entry and challenge')){
    return {
      confidence: 'medium',
      resolution: 'dedicated planning scorer using stage-signature distance, runtime path-family signatures, challenge-window coverage, alien-family novelty, and reference-comparison readiness',
      scoreMeaning: scoreMeaning(score10)
    };
  }
  if(text.includes('alien entry')){
    return {
      confidence: 'medium',
      resolution: 'composite proxy from opening timing, geometry, and movement grammar',
      scoreMeaning: scoreMeaning(score10)
    };
  }
  if(text.includes('challenge-stage variation')){
    return {
      confidence: 'medium',
      resolution: 'composite proxy from challenge timing, challenge identity, and non-repetition',
      scoreMeaning: scoreMeaning(score10)
    };
  }
  if(text.includes('audio identity')){
    return {
      confidence: 'medium-high',
      resolution: '21 cue/event comparisons with waveform, spectral, overlap, alignment, and semantic event-mapping features',
      scoreMeaning: scoreMeaning(score10)
    };
  }
  if(text.includes('level arc')){
    return {
      confidence: 'medium-high',
      resolution: 'multi-submetric level-arc report with stage families, challenge layers, pressure, reward, and persona evidence',
      scoreMeaning: scoreMeaning(score10)
    };
  }
  if(text.includes('boss entry') || text.includes('formation grammar')){
    return {
      confidence: 'medium',
      resolution: 'first-class boss/formation scorer using stage-window event grammar, boss timing, escort composition, challenge identity, and explicit path/slot measurement debt',
      scoreMeaning: scoreMeaning(score10)
    };
  }
  if(text.includes('stage 4 pressure')){
    return {
      confidence: 'medium',
      resolution: 'narrow pressure/loss replay windows; exact replay coverage still limited',
      scoreMeaning: scoreMeaning(score10)
    };
  }
  if(text.includes('arcade console frame') || text.includes('popup') || text.includes('leaderboard')){
    return {
      confidence: 'medium',
      resolution: 'UI shell proxy; dedicated visual/modal rubric still needed',
      scoreMeaning: scoreMeaning(score10)
    };
  }
  if(text.includes('dive fairness')){
    return {
      confidence: 'medium-high',
      resolution: 'seed/persona safety guardrails and pressure-sensitive collision checks',
      scoreMeaning: scoreMeaning(score10)
    };
  }
  if(text.includes('player movement')){
    return {
      confidence: 'high-current-pass',
      resolution: 'reference trace plus controlled movement harness checks; expert micro-feel can still exceed scorer resolution',
      scoreMeaning: scoreMeaning(score10)
    };
  }
  if(text.includes('shot and hit')){
    return {
      confidence: 'high-current-pass',
      resolution: 'functional combat-response guardrails; audiovisual semantics are scored separately',
      scoreMeaning: scoreMeaning(score10)
    };
  }
  if(text.includes('stage 1 opening geometry')){
    return {
      confidence: 'high-current-pass',
      resolution: 'opening formation geometry checks; later-stage entry variation is separate',
      scoreMeaning: scoreMeaning(score10)
    };
  }
  if(text.includes('capture and rescue')){
    return {
      confidence: 'high-current-pass',
      resolution: 'rule/state harness checks; feedback clarity and reward feel are separate',
      scoreMeaning: scoreMeaning(score10)
    };
  }
  if(text.includes('challenge-stage timing')){
    return {
      confidence: 'high-current-pass',
      resolution: 'challenge timing deltas within tolerance; variation and teaching value are separate',
      scoreMeaning: scoreMeaning(score10)
    };
  }
  return base;
}

function metricExplanation(metric){
  const text = String(metric || '').toLowerCase();
  const fallback = {
    calculation: 'Score is read from the latest generated conformance artifact for this metric or from the dashboard composite proxy when the metric has not yet been promoted to a dedicated scorer.',
    grounding: 'Best-case grounding is a canonical reference window or scorer-backed harness report with provenance, repeatable scenarios, and current Aurora comparison artifacts.',
    meaning: 'For a player or designer, this metric says whether this part of the experience feels intentional, readable, fair, and close to the Galaga-like target rather than merely functional.'
  };
  if(text.includes('audio identity')){
    return {
      calculation: 'Release audio score blends cue identity, reference spectral similarity, reference-window precision, overlap, and event alignment from audio cue comparison artifacts.',
      grounding: 'Best-case grounding comes from labeled Galaga-family reference audio clips, segmented Aurora runtime captures, cue/event logs, waveform and spectral measurements, and per-cue gap analysis.',
      meaning: 'Players hear whether shots, hits, explosions, boss damage, capture, rescue, and challenge results communicate the right event at the right moment. Designers use it to protect feedback clarity and arcade identity.'
    };
  }
  if(text.includes('level arc')){
    return {
      calculation: 'Level arc is read from the level-arc conformance report, combining stage distinctiveness, challenge-stage identity, later-stage complexity, pressure curve, reward/rescue layering, and learning/mastery windows.',
      grounding: 'Best-case grounding is multi-stage reference evidence plus Aurora harness windows for stage families, challenge layers, stage signatures, pressure/loss windows, and persona progression.',
      meaning: 'Players feel whether the game grows, teaches, surprises, and rewards mastery over time. Designers use it to detect repetition, flat difficulty, or escalation without reward.'
    };
  }
  if(text.includes('boss entry') || text.includes('formation grammar')){
    return {
      calculation: 'Boss/formation grammar is read from the dedicated formation-boss-grammar report, blending boss entry timing, boss/escort composition, formation settle evidence, challenge pattern identity, stage variation, and path-shape precision.',
      grounding: 'Current grounding comes from Aurora level-expansion event logs, trace summaries, stage-signature distance, runtime path/slot extraction, heuristic path-family comparison, and the formation/boss grammar reference profile. Best-case grounding adds frame-labeled Galaga boss/escort/challenge paths and rack slot coordinates.',
      meaning: 'Players feel whether each stage has recognizable arcade choreography: bosses enter with readable intent, escorts matter, formations settle convincingly, and challenge stages teach memorable set pieces.'
    };
  }
  if(text.includes('alien entry and challenge')){
    return {
      calculation: 'Dedicated scorer blends regular-stage signature distance, entry path-family specificity, challenging-stage trajectory variation, challenge alien novelty, and readiness for reference-grounded path comparison.',
      grounding: 'Current grounding comes from stage-signature distance, formation/boss grammar reports, runtime path/slot extraction, and heuristic path-family comparison. Best-case grounding adds Galaga-family contact sheets and frame-labeled challenge/entry path families across several stages.',
      meaning: 'Players feel this as whether levels and challenge stages are authored, surprising, and learnable. Designers use it to prevent repetitive entry waves and to make challenge stages introduce new alien motion, scoring, and mastery opportunities.'
    };
  }
  if(text.includes('visual look')){
    return {
      calculation: 'Current score is an estimated planning value until a dedicated visual conformance scorer lands; it is informed by UI shell checks, screenshots, contact sheets, and known visual debt.',
      grounding: 'Best-case grounding will compare reference and Aurora contact sheets across start, attract, gameplay, score, popup, and game-over surfaces with palette, typography, density, sprite readability, and layout checks.',
      meaning: 'Players decide at a glance whether the game feels like a polished arcade object. Designers use it to align readability, theme, typography, and visual hierarchy before subjective tuning.'
    };
  }
  if(text.includes('stage 4 pressure')){
    return {
      calculation: 'Score is the current weakest level-arc pressure submetric, focused on whether known pressure/loss windows reproduce as exact or same-window replay events under controlled harness runs.',
      grounding: 'Best-case grounding is source pressure/loss windows, frozen seeds, replayable input paths, collision diagnostics, and repeated current-vs-source pressure curve comparisons.',
      meaning: 'Players should feel pressure that is learnable and fair, not random. Designers use it to tune threat density, dodge lanes, and failure recovery without creating arbitrary deaths.'
    };
  }
  if(text.includes('alien entry')){
    return {
      calculation: 'Composite proxy: 45% stage-opening timing fidelity, 35% stage-opening geometry fidelity, and 20% movement-grammar expansion until alien entry is promoted to its own scorer.',
      grounding: 'Best-case grounding will use reference and Aurora stage-entry contact sheets, rack timing traces, path-family labels, formation geometry, and early/mid/late level comparisons.',
      meaning: 'Players read the whole level from the first entry pattern. Designers use it to make stages feel authored, recognizable, and increasingly sophisticated before combat fully starts.'
    };
  }
  if(text.includes('challenge-stage variation')){
    return {
      calculation: 'Composite proxy: 45% challenge timing fidelity, 35% challenge-stage identity, and 20% long-run non-repetition until a dedicated challenge-variation scorer exists.',
      grounding: 'Best-case grounding is reference challenge-stage footage, alien/path family labels, bonus opportunity windows, result feedback timing, and Aurora stage-to-stage variation traces.',
      meaning: 'Players should experience challenge stages as learnable bonus set pieces that introduce new motion and scoring opportunities. Designers use it to prevent bonus rounds from becoming repetitive pauses.'
    };
  }
  if(text.includes('progression')){
    return {
      calculation: 'Score is read from the progression/persona quality category, including persona safety checks, stage ordering, and whether different skill profiles see an appropriate ramp.',
      grounding: 'Best-case grounding comes from controlled persona runs, stage snapshots, loss/recovery traces, and reference-informed expectations for learning, mastery, and escalation.',
      meaning: 'Players should feel the game becoming harder for understandable reasons. Designers use it to keep novice, advanced, and expert experiences coherent across a long session.'
    };
  }
  if(text.includes('stage 1 opening timing')){
    return {
      calculation: 'Score is read from the stage-1 opening timing category, comparing measured Aurora event timing against reference opening-window timing metrics and tolerances.',
      grounding: 'Best-case grounding is a canonical stage-1 reference window with event timestamps, Aurora controlled-clock captures, and delta reports for first entry, arrival, and first dive timing.',
      meaning: 'Players form their first feel judgment in the opening seconds. Designers use it to lock the initial rhythm before tuning deeper complexity.'
    };
  }
  if(text.includes('arcade console frame')){
    return {
      calculation: 'Current score uses the UI shell quality category as a proxy until the frame gets its own arcade-style rubric.',
      grounding: 'Best-case grounding will score cabinet rails, bezel proportions, button density, labels, build/date treatment, chroming, responsive fit, and visual consistency across local/dev/beta/prod surfaces.',
      meaning: 'Players experience the frame as the cabinet around every game. Designers use it to make the platform feel trustworthy, arcade-native, and not like a generic web wrapper.'
    };
  }
  if(text.includes('popup') || text.includes('leaderboard')){
    return {
      calculation: 'Current score uses the UI shell suite as a proxy until help, score, account, feedback, leaderboard, and game-over modals get a modal-specific scorer.',
      grounding: 'Best-case grounding will compare each modal surface for layout, typography, arcade tone, score clarity, keyboard/controller ergonomics, and no-overlap responsive behavior.',
      meaning: 'Players rely on these screens to understand scoring, recover from a run, file feedback, and trust records. Designers use it to keep utility surfaces polished without breaking arcade immersion.'
    };
  }
  if(text.includes('dive fairness')){
    return {
      calculation: 'Score is read from the dive-safety quality category and associated harness checks for unfair collision, lane, and persona safety regressions.',
      grounding: 'Best-case grounding is repeated persona/seed sweeps, collision windows, near-miss traces, and pressure diagnostics after every risky movement or threat change.',
      meaning: 'Players accept hard deaths when they feel earned. Designers use it as a guardrail so added pressure does not become unfairness.'
    };
  }
  if(text.includes('player movement')){
    return {
      calculation: 'Score is read from the player-movement correspondence category, comparing movement traces and control response against the reference-derived movement target.',
      grounding: 'Best-case grounding is reference movement traces, Aurora controlled input traces, speed/position deltas, and regression checks across viewport and persona modes.',
      meaning: 'Players feel this as the basic trust in the ship. Designers use it as a do-not-regress foundation for every other gameplay improvement.'
    };
  }
  if(text.includes('shot and hit')){
    return {
      calculation: 'Score is read from the combat-responsiveness category, covering shot timing, hit registration, close-shot behavior, and event feedback guardrails.',
      grounding: 'Best-case grounding is controlled shot/hit scenarios, close-contact tests, event logs, and paired visual/audio feedback timing.',
      meaning: 'Players need shots and impacts to feel immediate and legible. Designers use it to protect core combat feel while improving explosions and sound semantics.'
    };
  }
  if(text.includes('stage 1 opening geometry')){
    return {
      calculation: 'Score is read from the stage-1 opening geometry category, comparing formation layout and opening positions against the reference geometry target.',
      grounding: 'Best-case grounding is reference contact sheets, Aurora opening captures, formation coordinate traces, and geometry tolerance checks.',
      meaning: 'Players read formation authenticity before they consciously notice details. Designers use it as the locked baseline for alien-entry and formation work.'
    };
  }
  if(text.includes('capture and rescue')){
    return {
      calculation: 'Score is read from the capture/rescue quality category, including capture, no-leak, rescue, and rule-boundary harness checks.',
      grounding: 'Best-case grounding is reference capture/rescue behavior, controlled Aurora scenarios, event logs, state assertions, and score/reward feedback traces.',
      meaning: 'Players see capture and rescue as a signature Galaga risk/reward mechanic. Designers use it as a hard identity guardrail while improving feedback and scoring opportunities.'
    };
  }
  if(text.includes('challenge-stage timing')){
    return {
      calculation: 'Score is read from the challenge-stage timing category, comparing Aurora challenge entry, transition, result, and timing metrics against reference tolerances.',
      grounding: 'Best-case grounding is reference challenge-stage timing windows, Aurora controlled-clock scenarios, result feedback traces, and pass/fail delta reports.',
      meaning: 'Players need bonus stages to feel rhythmic and fair. Designers use this as the timing guardrail while adding more challenge-stage variety.'
    };
  }
  return fallback;
}

function tableObjects(headers, rows){
  return rows.map(row => {
    const cells = row.cells || row;
    return Object.fromEntries(headers.map((header, index) => [header, cells[index] ?? '']));
  });
}

function ingestionRow({ rank, source, axis, artifactType, coverage, annotationStatus, confidence, linkedMetric, anchor, next }){
  return {
    rank,
    source,
    axis,
    artifactType,
    coverage,
    annotationStatus,
    confidence,
    linkedMetric,
    anchor,
    next,
    cells: [rank, source, axis, artifactType, coverage, annotationStatus, confidence, linkedMetric, anchor, next]
  };
}

function buildIngestionRows({ quality, audio, levelArc, visualLook, qualityPath, levelArcPath, visualLookPath }){
  const evidenceCyclePath = 'reference-artifacts/analyses/evidence-cycle-dashboard/evidence-cycle-dashboard.json';
  const evidenceCycle = fileExists(evidenceCyclePath) ? readJson(path.join(ROOT, evidenceCyclePath)) : null;
  const audioClipCount = countFiles('src/assets/reference-audio', file => file.endsWith('.m4a'));
  const sourceManifestCount = countFiles('reference-artifacts/analyses', file => file.endsWith('source-manifest.json'));
  const eventLogCount = countFiles('reference-artifacts/analyses', file => file.endsWith('reference-events.json'));
  const contactSheetCount = countFiles('reference-artifacts/analyses', file => /contact-sheet|contact-\d+|opening-contact/.test(path.basename(file)));
  const stage4LossPath = latestReport('aurora-stage4-loss-windows');
  const stage4Loss = stage4LossPath ? readJson(stage4LossPath) : null;
  const audioGapPath = latestReport('aurora-audio-event-gap');
  const audioGap = audioGapPath ? readJson(audioGapPath) : null;
  const rows = [
    ingestionRow({
      rank: 1,
      source: 'Galaga-family reference audio clips',
      axis: 'audio identity / event feedback',
      artifactType: 'reference m4a cue clips',
      coverage: `${audioClipCount} clips`,
      annotationStatus: 'clipped, mapped, partially scored',
      confidence: 'medium-high',
      linkedMetric: 'Audio identity, event feedback, and cue alignment',
      anchor: 'src/assets/reference-audio',
      next: 'Add finer event labels for explosion, impact, boss damage, immunity/entry, capture, and rescue semantics.'
    }),
    ingestionRow({
      rank: 2,
      source: 'Aurora audio cue comparison and event-gap reports',
      axis: 'audio cue scoring',
      artifactType: 'waveform/spectral/alignment/semantic reports',
      coverage: `${audio?.details?.totalReferenceItems || audioGap?.summary?.comparedCueCount || 0} compared cues; semantic ${audioGap?.summary?.semanticAverageScore10 || audio?.details?.semanticEventScore10 || 'n/a'}/10; ${audioGap?.summary?.semanticAttentionCueCount ?? audio?.details?.semanticAttentionCueCount ?? 'n/a'} attention rows`,
      annotationStatus: 'semantic-scored',
      confidence: 'medium-high',
      linkedMetric: 'Audio identity, event feedback, and cue alignment',
      anchor: audioGapPath ? rel(audioGapPath) : rel(qualityPath),
      next: audioGap?.nextStep || 'Tune the highest-risk runtime cue after rerunning audio comparison and semantic event-gap analysis.'
    }),
    ingestionRow({
      rank: 3,
      source: 'Boss entry and formation grammar scorer',
      axis: 'formation grammar / boss entry / challenge identity',
      artifactType: 'event grammar, timing, stage-signature, and measurement-debt report',
      coverage: levelArc.summary?.formationBossGrammarWindowCount
        ? `${levelArc.summary.formationBossGrammarWindowCount} boss/formation windows`
        : (levelArc.evidence?.formationBossGrammarReport ? 'tracked boss/formation report' : 'pending'),
      annotationStatus: levelArc.evidence?.formationBossGrammarReport ? 'scored' : 'pending',
      confidence: 'medium',
      linkedMetric: 'Boss entry and formation grammar',
      anchor: levelArc.evidence?.formationBossGrammarReport || 'reference-artifacts/analyses/formation-boss-grammar-conformance',
      next: 'Promote frame-level boss/escort path traces and formation rack slot coordinates so visual choreography can be scored directly.'
    }),
    ingestionRow({
      rank: 4,
      source: 'Level arc and encounter-shape evidence',
      axis: 'level arc / challenge / reward',
      artifactType: 'stage signatures, pressure windows, persona reports',
      coverage: `${levelArc.summary?.stageFamilyBlueprintCount || 0}/6 stage families; ${levelArc.summary?.evidenceWindowCount || 0}/6 evidence windows`,
      annotationStatus: 'scored',
      confidence: 'medium-high',
      linkedMetric: 'Level arc and encounter shape',
      anchor: levelArcPath ? rel(levelArcPath) : rel(qualityPath),
      next: 'Add more long-play reference windows and expert-route scoring for challenge/reward opportunities.'
    }),
    ingestionRow({
      rank: 5,
      source: 'Stage 4 pressure and loss-window diagnostics',
      axis: 'pressure / fairness',
      artifactType: 'loss windows, replay geometry, collision traces',
      coverage: `${stage4Loss?.summary?.totalWindows || 3} promoted windows`,
      annotationStatus: 'mined, replay-diagnostic',
      confidence: 'medium',
      linkedMetric: 'Stage 4 pressure exact replay / pressure curve precision',
      anchor: stage4LossPath ? rel(stage4LossPath) : (levelArcPath ? rel(levelArcPath) : rel(qualityPath)),
      next: 'Improve exact replay matching and preserve per-frame attacker/player/shot geometry for candidate tuning.'
    }),
    ingestionRow({
      rank: 6,
      source: 'Aurora visual look screenshots',
      axis: 'visual look / UI readability',
      artifactType: 'browser screenshots plus DOM/canvas metrics',
      coverage: `${visualLook?.summary?.surfaceCount || 0} surfaces`,
      annotationStatus: visualLook ? 'first-pass scored' : 'missing scorer',
      confidence: visualLook?.summary?.confidence || 'low',
      linkedMetric: 'Overall visual look and feel',
      anchor: visualLookPath ? rel(visualLookPath) : 'reference-artifacts/analyses/aurora-visual-look-conformance',
      next: 'Add Galaga-family visual contact-sheet comparison, sprite readability labels, and model-assisted visual critique.'
    }),
    ingestionRow({
      rank: 7,
      source: 'Aurora evidence-cycle windows',
      axis: 'general ingestion framework',
      artifactType: 'manifests, contact sheets, traces, event logs, audio timelines',
      coverage: `${evidenceCycle?.aurora_level_expansion?.window_count || 0} planned windows`,
      annotationStatus: evidenceCycle?.aurora_level_expansion?.status || 'not generated',
      confidence: 'medium',
      linkedMetric: 'Level arc / challenge variation / visual look',
      anchor: evidenceCyclePath,
      next: 'Refresh evidence-cycle dashboard and promote window status into a canonical reference-corpus manifest.'
    }),
    ingestionRow({
      rank: 8,
      source: 'Reference manifests and event logs inventory',
      axis: 'source provenance / annotation coverage',
      artifactType: 'source-manifest.json and reference-events.json',
      coverage: `${sourceManifestCount} manifests; ${eventLogCount} event logs`,
      annotationStatus: 'mixed',
      confidence: 'mixed',
      linkedMetric: 'All conformance metrics',
      anchor: 'reference-artifacts/analyses',
      next: 'Normalize provenance, duration, source confidence, and linked metric fields into a generated corpus manifest.'
    }),
    ingestionRow({
      rank: 9,
      source: 'Reference contact sheets and frame evidence',
      axis: 'visual / motion / entry formation',
      artifactType: 'contact sheets and still frames',
      coverage: `${contactSheetCount} contact/frame evidence files`,
      annotationStatus: 'extracted, partially labeled',
      confidence: 'medium',
      linkedMetric: 'Visual look, alien entry, challenge variation',
      anchor: 'reference-artifacts/analyses',
      next: 'Attach contact-sheet families to metric rows and add image-level comparison scores.'
    })
  ];
  return rows;
}

function buildIngestionSummary(rows){
  const highConfidenceCount = rows.filter(row => /high/.test(String(row.confidence).toLowerCase())).length;
  const mixedOrLowConfidenceCount = rows.filter(row => /mixed|low/.test(String(row.confidence).toLowerCase())).length;
  const scoredOrPromotedCount = rows.filter(row => /scored|mapped|generated|clipped|diagnostic|extracted/.test(String(row.annotationStatus).toLowerCase())).length;
  const firstGap = rows.find(row => /low|mixed/.test(String(row.confidence).toLowerCase())) || rows[0] || {};
  return {
    sourceFamilyCount: rows.length,
    highConfidenceCount,
    mixedOrLowConfidenceCount,
    scoredOrPromotedCount,
    nextBestUpgrade: firstGap.next || 'Promote the next evidence family into a scorer-backed artifact.',
    framing: 'Ingestion turns reference media and Aurora runtime captures into repeatable evidence: clips, contact sheets, traces, event logs, labels, scores, confidence, and next missing annotations.'
  };
}

function optionalJson(relPath){
  const full = path.join(ROOT, relPath);
  if(!fs.existsSync(full)) return null;
  return readJson(full);
}

function buildGalaxyGuardiansProfile(){
  const identityRoot = 'reference-artifacts/analyses/galaxy-guardians-identity';
  const audioLabPath = 'reference-artifacts/analyses/audio-conformance-lab/galaxy-guardians-preview/audio-conformance-lab-0.1.json';
  const referencePath = `${identityRoot}/reference-conformance-0.1.json`;
  const candidatePath = `${identityRoot}/candidate-0.1.json`;
  const playtestPath = `${identityRoot}/playtest-conformance-review-0.1.json`;
  const visualPath = `${identityRoot}/visual-readability-0.1.json`;
  const audioLab = optionalJson(audioLabPath);
  const reference = optionalJson(referencePath);
  const candidate = optionalJson(candidatePath);
  const playtest = optionalJson(playtestPath);
  const visual = optionalJson(visualPath);
  const artifactCount = countFiles(identityRoot, file => file.endsWith('.json'));
  const cueCount = audioLab?.summary?.cueCount || candidate?.candidateGate?.requiredRuntimeCueIds?.length || 0;
  const requiredEvents = candidate?.candidateGate?.requiredRuntimeEvents?.length || 0;
  const releaseRead = reference?.summary?.releaseRead || playtest?.summary?.releaseRead || 'Galaxy Guardians is tracked as a preview/ingestion game, not a public release candidate.';
  const referenceScore = reference?.summary?.referenceConformanceScore10 ?? null;
  const playtestScore = playtest?.summary?.playtestWeightedConformanceScore10 ?? reference?.summary?.playtestWeightedConformanceScore10 ?? null;
  const publicReadinessScore = reference?.summary?.publicReleaseReadinessScore10 ?? null;
  const audioScore = audioLab?.summary?.overallAudioConformanceScore10 ?? null;
  const visualStatus = visual?.status || 'visual readability contract pending';
  const gates = [
    ['Preview reference conformance', Number.isFinite(+referenceScore) ? score(referenceScore) : '--', '>=7.5 for compelling preview', releaseRead],
    ['Playtest-weighted conformance', Number.isFinite(+playtestScore) ? score(playtestScore) : '--', '>=7.0 for preview confidence', playtest?.summary?.releaseRead || 'Needs live browser/playback review before a beta-facing claim.'],
    ['Public release readiness', Number.isFinite(+publicReadinessScore) ? score(publicReadinessScore) : 'not release scored', 'defer', 'Preview game remains intentionally non-production.'],
    ['Audio conformance lab', Number.isFinite(+audioScore) ? score(audioScore) : '--', '>=7.0 preview target', audioLab?.summary?.reusablePlatformRead || 'Reusable game-configured audio lab.']
  ];
  const rows = [
    row({
      rank: 1,
      metric: 'Preview reference conformance',
      score10: referenceScore,
      target: '>=7.5 compelling preview',
      status: 'Measured preview artifact; not public release art',
      why: 'Keeps the second game grounded in Galaxian-style evidence instead of Aurora inheritance.',
      effort: 'Medium; 2-4 hrs browser/playback review plus focused scorer promotion',
      next: 'Human-review cue windows and browser play feel, then rerun reference conformance before widening public claims.',
      evidence: referencePath
    }),
    row({
      rank: 2,
      metric: 'Playable-preview conformance and feel',
      score10: playtestScore,
      target: '>=7.0 preview confidence',
      status: 'Playtest-weighted preview score',
      why: 'A preview can be technically present yet still not compelling enough to represent the game family.',
      effort: 'Medium-high; 3-5 hrs with local browser/video review',
      next: 'Run a motion-feel pass against formation entry, dive pacing, player shots, and loss feedback.',
      evidence: playtestPath
    }),
    row({
      rank: 3,
      metric: 'Audio lab cue identity',
      score10: audioScore,
      target: '>=7.0 preview target',
      status: 'Reusable Platinum audio conformance lab',
      why: 'This is the first evidence that ingestion-derived cue targets can score a non-Aurora game.',
      effort: 'Low-medium; 1-2 hrs listening review plus cue-window refinements',
      next: 'Review weakest cue and promote accepted cue windows as reusable per-game audio targets.',
      evidence: audioLabPath
    }),
    row({
      rank: 4,
      metric: 'Public release readiness',
      score10: publicReadinessScore,
      target: 'deferred until full game path exists',
      status: 'Intentionally low preview/public boundary score',
      why: 'Protects Platinum from presenting a preview as a shipped second game before rules, stages, scoring, and polish are ready.',
      effort: 'High; multi-cycle game construction after preview acceptance',
      next: 'Keep public playable claims disabled until ingestion, runtime, scoring, and harness coverage support a real release path.',
      evidence: referencePath
    })
  ].map(item => updateRowCells(item));
  const ingestionRows = [
    ingestionRow({
      rank: 1,
      source: 'Galaxy Guardians identity artifacts',
      axis: 'reference conformance / runtime identity',
      artifactType: 'game-owned preview contracts',
      coverage: `${artifactCount} JSON artifacts`,
      annotationStatus: 'preview-scored',
      confidence: 'medium',
      linkedMetric: 'Preview reference conformance',
      anchor: identityRoot,
      next: 'Promote the strongest contracts into a reusable new-game ingestion manifest.'
    }),
    ingestionRow({
      rank: 2,
      source: 'Galaxy Guardians audio conformance lab',
      axis: 'audio cue identity',
      artifactType: 'waveform/spectrogram cue comparisons',
      coverage: `${cueCount} cue targets`,
      annotationStatus: audioLab ? 'scored' : 'missing',
      confidence: audioLab ? 'medium-high' : 'low',
      linkedMetric: 'Audio lab cue identity',
      anchor: audioLabPath,
      next: 'Use the lab as the template for game-selectable audio scoring across future packs.'
    }),
    ingestionRow({
      rank: 3,
      source: 'Candidate 0.1 runtime gate',
      axis: 'runtime events / surfaces',
      artifactType: 'required events, surfaces, cues, forbidden Aurora capabilities',
      coverage: `${requiredEvents} required runtime events`,
      annotationStatus: candidate ? 'gate-defined' : 'missing',
      confidence: 'medium',
      linkedMetric: 'Playable-preview conformance and feel',
      anchor: candidatePath,
      next: 'Generate dashboard maturity submetrics directly from required events and implemented evidence.'
    }),
    ingestionRow({
      rank: 4,
      source: 'Visual readability contract',
      axis: 'sprite / formation readability',
      artifactType: 'runtime readability and sprite distinction rules',
      coverage: visual?.visualRequirements?.requiredVisualIds?.length ? `${visual.visualRequirements.requiredVisualIds.length} visual IDs` : 'visual IDs tracked',
      annotationStatus: visualStatus,
      confidence: 'medium',
      linkedMetric: 'Preview reference conformance',
      anchor: visualPath,
      next: 'Tie sprite-component extraction and visual readability into a scored dashboard submetric.'
    })
  ];
  return {
    gameKey: 'galaxy-guardians-preview',
    gameName: 'Galaxy Guardians',
    gameStatus: 'Preview / ingestion',
    currentInvestment: 'Paused while Aurora remains the active conformance investment; ready for measured preview review when we switch back.',
    releaseRead,
    scoreSemantics: {
      headline: 'Galaxy Guardians scores are preview/ingestion scores, not public-release conformance claims.',
      tenOutOfTen: 'A high preview score would mean the current preview contracts are satisfied, not that a full Galaxian-style game is complete.',
      confidence: 'Confidence is tied to source manifests, runtime gates, audio lab artifacts, and live play review.',
      resolution: 'Current resolution is preview-slice level; full-game progression, scoring, and release readiness remain separate gaps.'
    },
    releaseGate: tableObjects(['Gate', 'Current', 'Target', 'Notes'], gates),
    priorityRows: rows.map(({ cells, ...entry }) => entry),
    ingestionSummary: buildIngestionSummary(ingestionRows),
    ingestionRows: ingestionRows.map(({ cells, ...entry }) => entry),
    economicsSummary: {
      measuredRuns: 0,
      wallSeconds: 0,
      cpuSeconds: 0,
      metricPointCount: 0,
      deltaCount: 0,
      charts: []
    },
    sourceReports: {
      referenceConformance: referencePath,
      playtestReview: fs.existsSync(path.join(ROOT, playtestPath)) ? playtestPath : null,
      audioLab: fs.existsSync(path.join(ROOT, audioLabPath)) ? audioLabPath : null,
      candidateGate: fs.existsSync(path.join(ROOT, candidatePath)) ? candidatePath : null,
      visualReadability: fs.existsSync(path.join(ROOT, visualPath)) ? visualPath : null
    },
    newFirstClassAxes: [
      'Preview reference conformance: reference maturity, implementation gate coverage, and public-release boundary.',
      'Audio cue identity: reusable game-configured cue scoring from isolated reference windows.',
      'Runtime event and surface gate: required events, score table, attract text, and forbidden Aurora capabilities.',
      'Visual readability: sprite distinction, formation visibility, and hit feedback at preview scale.'
    ]
  };
}

function resourceRows(economics){
  const byResource = economics.summary?.ledger?.byResource || {};
  return Object.entries(byResource)
    .map(([resource, value]) => [
      resource,
      value.runs || 0,
      minutes(value.wallSeconds),
      minutes(value.cpuSeconds)
    ])
    .sort((a, b) => parseFloat(String(b[2])) - parseFloat(String(a[2])));
}

function axisRows(economics){
  const byAxis = economics.summary?.ledger?.byAxis || {};
  return Object.entries(byAxis)
    .map(([axis, value]) => [
      axis,
      value.runs || 0,
      minutes(value.wallSeconds),
      minutes(value.cpuSeconds)
    ])
    .sort((a, b) => parseFloat(String(b[2])) - parseFloat(String(a[2])))
    .slice(0, 8);
}

function nextEstimateRows(rows){
  return rows.slice(0, 8).map(item => [
    item.rank,
    item.metric,
    item.current,
    item.target,
    scoreGap(item.score10, item.target),
    item.effort,
    item.costContext?.expectedResources || inferredResources(item.metric),
    item.costContext?.trackedSpend || 'no dedicated spend tracked',
    item.costContext?.valueCostRead || '',
    item.next
  ]);
}

function main(){
  const qualityPath = latestCommittedQualityReport();
  if(!qualityPath) throw new Error('No quality-conformance report found.');
  const priorityPath = latestReport('conformance-investment-priorities');
  const levelArcPath = latestReport('level-arc-conformance');
  const economicsPath = latestReport('conformance-economics');
  const visualLookPath = latestReport('aurora-visual-look-conformance');
  const alienEntryChallengePath = latestReport('alien-entry-challenge-variation');
  const quality = readJson(qualityPath);
  const priority = priorityPath ? readJson(priorityPath) : { candidates: [] };
  const levelArc = levelArcPath ? readJson(levelArcPath) : { summary: {} };
  const economics = economicsPath ? readJson(economicsPath) : { summary: {} };
  const visualLook = visualLookPath ? readJson(visualLookPath) : null;
  const alienEntryChallenge = alienEntryChallengePath ? readJson(alienEntryChallengePath) : null;

  const audio = category(quality, 'audio');
  const formationBoss = category(quality, 'formation-boss-grammar');
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
  const levelArcCandidate = investmentById['level-arc-opportunity-coverage'] || investmentById['stage12-natural-reward-window'];
  const stage4Candidate = investmentById['stage4-pressure-exact-replay'];

  const currentLevelArcScore = levelArcScore(level, levelArc);
  const alienEntryScore = Math.min(10, ((stage1Timing?.score10 || 0) * 0.45) + ((stage1Geometry?.score10 || 0) * 0.35) + (levelArcSubmetric(levelArc, 'movement-grammar-expansion')?.score10 || 8.4) * 0.2);
  const challengeVariationScore = Math.min(10, ((challengeTiming?.score10 || 0) * 0.45) + (levelArcSubmetric(levelArc, 'challenge-stage-identity')?.score10 || 8.4) * 0.35 + (levelArcSubmetric(levelArc, 'long-run-non-repetition')?.score10 || 8.2) * 0.2);
  const alienEntryChallengeScore = Number.isFinite(+alienEntryChallenge?.summary?.score10)
    ? +alienEntryChallenge.summary.score10
    : Math.min(alienEntryScore, challengeVariationScore);
  const visualLookScore = Number.isFinite(+visualLook?.summary?.score10) ? +visualLook.summary.score10 : 7.4;
  const visualLookStatus = visualLook
    ? `Measured visual scorer; ${visualLook.summary?.confidence || 'medium-low'} confidence`
    : 'Estimated; needs dedicated visual conformance scorer';
  const visualLookResolution = visualLook?.summary?.resolution || 'Estimated planning value until scorer lands.';
  const frontDoorScore = 8.0;
  const popupScore = uiShell?.score10 || 0;
  const arcadeFrameScore = uiShell?.score10 || 0;

  const baseRows = [
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
      metric: 'Alien entry and challenge-stage novelty',
      score10: alienEntryChallengeScore,
      target: '7.5 first gate; 9.0+ mature',
      status: alienEntryChallenge ? 'Dedicated long-cycle scorer; high-priority gameplay-authenticity gap' : 'Needs dedicated scorer refresh',
      why: 'Regular-stage alien entry, challenge-stage trajectories, and new-alien introduction are not yet sufficiently varied or reference-grounded; this is a first-order Galaga conformance gap.',
      effort: 'High; long-cycle CPU/browser extraction plus reference contact-sheet and path-labeling pass',
      next: alienEntryChallenge?.summary?.weakestMetric
        ? `Attack ${alienEntryChallenge.summary.weakestMetric.label}: ${alienEntryChallenge.summary.weakestMetric.currentRead}`
        : 'Run alien-entry/challenge-variation scorer after path extraction and challenge evidence expansion.',
      evidence: alienEntryChallengePath ? rel(alienEntryChallengePath) : `${rel(qualityPath)}; ${levelArcPath ? rel(levelArcPath) : 'level-arc not found'}`
    }),
    row({
      rank: 3,
      metric: 'Level arc and encounter shape',
      score10: currentLevelArcScore,
      target: '8.8-9.0',
      status: 'Measured release category',
      why: 'Controls whether long play feels like Galaga-like escalation rather than repeated pressure.',
      effort: 'Medium-high; 2-5 hrs',
      next: levelArcCandidate?.nextAction || levelArc.summary?.nextRecommendedWork?.[0] || 'Run level-arc candidate loop.',
      evidence: levelArcPath ? rel(levelArcPath) : rel(qualityPath)
    }),
    row({
      rank: 4,
      metric: 'Boss entry and formation grammar',
      score10: formationBoss?.score10,
      target: '8.0-8.5 first gate; 9.0+ with path/slot extraction',
      status: 'Measured release category; new first-class axis',
      why: 'Boss entries, escorts, formation settling, and challenge set pieces are core Galaga choreography and directly affect whether stages feel authored.',
      effort: 'Medium-high; 2-5 hrs, then recurring low-cost guardrail',
      next: formationBoss?.details?.weakestMetric
        ? `Advance ${formationBoss.details.weakestMetric.label}: ${formationBoss.details.weakestMetric.currentRead}`
        : 'Run formation/boss grammar analysis and promote path/slot evidence.',
      evidence: rel(qualityPath)
    }),
    row({
      rank: 5,
      metric: 'Overall visual look and feel: gameplay, start page, typography complexity',
      score10: visualLookScore,
      target: '8.4-8.8',
      status: visualLookStatus,
      why: 'A high score can still feel off if start text, density, contrast, alien readability, and arcade typography do not cohere.',
      effort: visualLook ? 'Medium; next pass should add reference-backed contact sheets and GPU/model-assisted review' : 'Medium; 2-4 hrs, screenshot/contact-sheet driven',
      next: visualLook ? 'Promote reference-backed visual contact sheets and add sprite/popup/style sub-scorers.' : 'Create a visual-look scorer covering start/attract page, gameplay readability, typography density, color discipline, and reference contact sheets.',
      evidence: visualLookPath ? rel(visualLookPath) : 'UI shell suite plus generated frame/contact-sheet artifacts'
    }),
    row({
      rank: 6,
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
      rank: 7,
      metric: 'Alien entry to levels: formation, timing, and methods',
      score10: alienEntryChallenge?.metrics?.find(metric => metric.id === 'regular-stage-entry-variation')?.score10
        || (Number.isFinite(+formationBoss?.score10) ? formationBoss.score10 : alienEntryScore),
      target: '9.0-9.4 with path and rack-slot scorer',
      status: alienEntryChallenge ? 'Dedicated alien-entry submetric' : (formationBoss ? 'Measured through boss/formation grammar category' : 'Composite proxy: stage opening timing + geometry + movement grammar'),
      why: 'Entry formations and rack timing are a first-order arcade authenticity signal before combat even starts.',
      effort: 'Medium; 1-3 hrs plus visual review',
      next: alienEntryChallenge ? 'Raise regular-stage minimum signature distance and add stage-specific alien entry scripts before retuning broad level arc.' : 'Promote stage-entry contact sheets, path labels, and formation slot coordinates across early/mid/late levels.',
      evidence: alienEntryChallengePath ? rel(alienEntryChallengePath) : `${rel(qualityPath)}; ${levelArcPath ? rel(levelArcPath) : 'level-arc not found'}`
    }),
    row({
      rank: 8,
      metric: 'Challenge-stage variation and new alien/formations introduction',
      score10: alienEntryChallenge?.metrics?.find(metric => metric.id === 'challenge-trajectory-variation')?.score10
        || challengeVariationScore,
      target: '9.0-9.4 with dedicated scorer',
      status: alienEntryChallenge ? 'Dedicated challenge trajectory/novelty submetric' : 'Composite proxy: challenge timing + challenge identity + non-repetition',
      why: 'Challenge stages should teach new motion/reward patterns, not only pause normal combat.',
      effort: 'Medium-high; 2-4 hrs',
      next: alienEntryChallenge ? 'Expand challenge evidence to at least four windows, then add distinct sweep/arc/lane/boss-led trajectory families.' : 'Add a challenge-variation metric for alien type introduction, path families, result feedback, and bonus opportunity clarity.',
      evidence: alienEntryChallengePath ? rel(alienEntryChallengePath) : `${rel(qualityPath)}; ${levelArcPath ? rel(levelArcPath) : 'level-arc not found'}`
    }),
    row({
      rank: 9,
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
      rank: 10,
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
      rank: 11,
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
      rank: 12,
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
      rank: 13,
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
      rank: 14,
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
      rank: 15,
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
      rank: 16,
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
      rank: 17,
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
      rank: 18,
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
  const rows = baseRows.map(item => addCostContext(item, economics, investmentById));

  const generatedAt = new Date().toISOString();
  const releaseGate = [
    ['Overall quality', score(quality.summary?.overallScore10), '>=9.3', 'Full score refresh after all major cycles'],
    ['Audio identity', score(audio?.score10), '>=7.5', 'Primary user-experience gap'],
    ['Level arc', score(currentLevelArcScore), '>=8.8', 'Long-play gameplay-quality gate'],
    ['Alien entry and challenge-stage novelty', score(alienEntryChallengeScore), '>=7.5 first gate; >=9.0 mature', 'New high-priority long-cycle gameplay-authenticity gate'],
    ['Boss entry and formation grammar', score(formationBoss?.score10), '>=8.0 first gate; >=9.0 mature', 'New measured gate for stage choreography'],
    ['Alien entry / formations', `${score(alienEntryChallenge?.metrics?.find(metric => metric.id === 'regular-stage-entry-variation')?.score10 || alienEntryScore)} measured`, '>=9.2 with path/rack scorer', 'Now backed by dedicated alien-entry/challenge variation scorer'],
    ['Challenge variation', `${score(alienEntryChallenge?.metrics?.find(metric => metric.id === 'challenge-trajectory-variation')?.score10 || challengeVariationScore)} measured`, '>=9.2 with dedicated scorer', 'New explicit gate'],
    ['Visual look and feel', score(visualLookScore), '>=8.4', visualLook ? 'New explicit gate; first-pass scorer measured' : 'New explicit gate; currently estimated'],
    ['Arcade frame and popup surfaces', score(Math.min(arcadeFrameScore, popupScore)), '>=9.4', 'Split from generic UI shell before final gate'],
    ['No-regression guardrails', 'movement/combat/capture >=10; challenge timing >=9.8', 'Maintain', 'Hard blockers']
  ];

  const releaseGateHeaders = ['Gate', 'Current', 'Target', 'Notes'];
  const priorityHeaders = ['Priority', 'Metric', 'Current', 'Confidence', 'Resolution', 'Cost / resources', 'Tracked spend', 'Major-gate target', 'Measurement status', 'Why this matters', 'Effort / time estimate', 'Recommended next step', 'Evidence'];
  const resourceHeaders = ['Resource', 'Measured runs', 'Wall time', 'CPU time'];
  const axisHeaders = ['Axis', 'Measured runs', 'Wall time', 'CPU time'];
  const nextEstimateHeaders = ['Priority', 'Metric', 'Current', 'Target', 'Gap to target', 'Estimated effort', 'Expected resources', 'Tracked spend', 'Value / cost read', 'Next action'];
  const ingestionHeaders = ['Priority', 'Source / evidence family', 'Axis', 'Artifact type', 'Coverage', 'Annotation status', 'Confidence', 'Linked metric', 'Anchor', 'Missing next'];
  const economicsDir = economicsPath ? path.dirname(economicsPath) : null;
  const economicsCharts = economicsDir ? [
    path.join(economicsDir, 'score-trends.svg'),
    path.join(economicsDir, 'largest-score-deltas.svg'),
    path.join(economicsDir, 'compute-minutes-by-resource.svg'),
    path.join(economicsDir, 'cost-per-positive-score-point.svg')
  ].filter(fs.existsSync).map(rel) : [];
  const resourceSpendRows = resourceRows(economics);
  const axisSpendRows = axisRows(economics);
  const nextRows = nextEstimateRows(rows);
  const ingestionRows = buildIngestionRows({ quality, audio, levelArc, visualLook, qualityPath, levelArcPath, visualLookPath });
  const ingestionSummary = buildIngestionSummary(ingestionRows);
  const evidenceCyclePath = 'reference-artifacts/analyses/evidence-cycle-dashboard/evidence-cycle-dashboard.json';
  const sourceReports = {
    quality: rel(qualityPath),
    investmentPriority: priorityPath ? rel(priorityPath) : null,
    levelArc: levelArcPath ? rel(levelArcPath) : null,
    economics: economicsPath ? rel(economicsPath) : null,
    alienEntryChallenge: alienEntryChallengePath ? rel(alienEntryChallengePath) : null,
    visualLook: visualLookPath ? rel(visualLookPath) : null,
    evidenceCycle: fileExists(evidenceCyclePath) ? evidenceCyclePath : null
  };
  const commit = git('rev-parse --short HEAD', 'unknown');
  const branch = git('branch --show-current', '');
  const dirty = git('status --short', '').trim().length > 0;
  const reportDir = path.join(DASHBOARD_ANALYSIS_ROOT, `${generatedAt.slice(0, 10)}-${commit}${dirty ? '-dirty' : ''}`);
  const auroraGame = {
    gameKey: 'aurora-galactica',
    gameName: 'Aurora Galactica',
    gameStatus: 'Active conformance investment',
    currentInvestment: 'Current focus: raise Aurora gameplay/audio/level-arc/visual conformance toward the next major release gate.',
    releaseRead: 'Aurora is the shipped first Platinum game and the current subject of long-cycle conformance scoring.',
    releaseGate: tableObjects(releaseGateHeaders, releaseGate),
    priorityRows: rows.map(({ cells, ...entry }) => entry),
    economicsSummary: {
      latestOverallScore10: economics.summary?.latestOverallScore10 ?? null,
      latestLevelArcScore10: economics.summary?.latestLevelArcScore10 ?? null,
      metricPointCount: economics.summary?.metricPointCount || 0,
      deltaCount: economics.summary?.deltaCount || 0,
      measuredRuns: economics.summary?.ledger?.runs || 0,
      wallSeconds: economics.summary?.ledger?.wallSeconds || 0,
      cpuSeconds: economics.summary?.ledger?.cpuSeconds || 0,
      artifactBytes: economics.summary?.ledger?.artifactBytes || 0,
      charts: economicsCharts
    },
    ingestionSummary,
    ingestionRows: ingestionRows.map(({ cells, ...entry }) => entry),
    scoreSemantics: {
      headline: 'An x/10 score is a measured rollup at the current scorer resolution, not a claim of arcade-perfect behavior.',
      tenOutOfTen: '10/10 means no known measured gap under the current scorer and evidence coverage. It remains a guardrail pass until broader reference, expert-play, and edge-case evidence says otherwise.',
      confidence: 'Confidence estimates how much trust to place in the score as a release signal.',
      resolution: 'Resolution describes how fine-grained the scorer currently is and which blind spots may remain.'
    },
    sourceReports,
    newFirstClassAxes: [
      'Alien entry to levels: formation layout, timing, path method, and whether different stages enter differently.',
      'Boss entry and formation grammar: boss timing, escort composition, formation settle evidence, challenge pattern identity, stage variation, and path/slot precision.',
      'Challenge-stage variation: new alien types, new entry formations/styles, path families, reward/result feedback, and teaching value.',
      'Overall visual look and feel: gameplay readability, start/attract typography density, copy complexity, color discipline, and reference contact sheets.',
      'Arcade console frame UI: cabinet frame, bezel/rails, build/date trust signals, button density, and arcade-style containment.',
      'Popup/help/scoring surfaces: help, scoring, leaderboard, account, feedback, and game-over result formatting as their own modal-quality family.'
    ]
  };
  const galaxyGuardiansGame = buildGalaxyGuardiansProfile();
  const dashboardData = {
    schemaVersion: 2,
    artifactType: 'release-conformance-dashboard',
    generatedAt,
    commit,
    branch,
    dirty,
    activeGameKey: 'aurora-galactica',
    games: [
      auroraGame,
      galaxyGuardiansGame
    ],
    sourceReports,
    scoreSemantics: {
      headline: 'An x/10 score is a measured rollup at the current scorer resolution, not a claim of arcade-perfect behavior.',
      tenOutOfTen: '10/10 means no known measured gap under the current scorer and evidence coverage. It remains a guardrail pass until broader reference, expert-play, and edge-case evidence says otherwise.',
      confidence: 'Confidence estimates how much trust to place in the score as a release signal.',
      resolution: 'Resolution describes how fine-grained the scorer currently is and which blind spots may remain.'
    },
    equalQualityCategoryWeight: equalWeight,
    releaseGate: tableObjects(releaseGateHeaders, releaseGate),
    priorityRows: rows.map(({ cells, ...entry }) => entry),
    priorityTable: tableObjects(priorityHeaders, rows),
    economicsSummary: {
      latestOverallScore10: economics.summary?.latestOverallScore10 ?? null,
      latestLevelArcScore10: economics.summary?.latestLevelArcScore10 ?? null,
      metricPointCount: economics.summary?.metricPointCount || 0,
      deltaCount: economics.summary?.deltaCount || 0,
      measuredRuns: economics.summary?.ledger?.runs || 0,
      wallSeconds: economics.summary?.ledger?.wallSeconds || 0,
      cpuSeconds: economics.summary?.ledger?.cpuSeconds || 0,
      artifactBytes: economics.summary?.ledger?.artifactBytes || 0,
      charts: economicsCharts
    },
    resourceSpendTable: tableObjects(resourceHeaders, resourceSpendRows),
    axisSpendTable: tableObjects(axisHeaders, axisSpendRows),
    nextGoalEstimateTable: tableObjects(nextEstimateHeaders, nextRows),
    ingestionSummary,
    ingestionRows: ingestionRows.map(({ cells, ...entry }) => entry),
    ingestionTable: tableObjects(ingestionHeaders, ingestionRows),
    newFirstClassAxes: [
      'Alien entry to levels: formation layout, timing, path method, and whether different stages enter differently.',
      'Boss entry and formation grammar: boss timing, escort composition, formation settle evidence, challenge pattern identity, stage variation, and path/slot precision.',
      'Challenge-stage variation: new alien types, new entry formations/styles, path families, reward/result feedback, and teaching value.',
      'Overall visual look and feel: gameplay readability, start/attract typography density, copy complexity, color discipline, and reference contact sheets.',
      'Arcade console frame UI: cabinet frame, bezel/rails, build/date trust signals, button density, and arcade-style containment.',
      'Popup/help/scoring surfaces: help, scoring, leaderboard, account, feedback, and game-over result formatting as their own modal-quality family.'
    ],
    maintenanceRules: [
      'Refresh this artifact after each full quality score, investment-priority run, or major conformance loop.',
      'Before a serious /dev, /beta, or /production release candidate, refresh npm run harness:analyze:conformance-economics and npm run harness:build:release-conformance-dashboard so release docs include conformance, resource/time, chart, past-goal, and next-goal reads.',
      'Any long-cycle local compute or model/API/GPU-assisted assessment should be wrapped with npm run harness:measure and declared with its axis and resource classes.',
      'Ship the read-only conformance dashboard with each dev/beta/production lane; keep raw ingestion workspaces and unreviewed evidence engineering-owned unless a Root-gated evidence browser is explicitly approved.',
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
    'Local dashboard: `http://127.0.0.1:4312/local-dev/conformance-dashboard.html` after `npm run local:resume`. Release-lane dashboard: `conformance-dashboard.html` is generated into `dist/dev`, copied through beta/production promotion, and published with the lane bundle.',
    '',
    '## Game Scope',
    '',
    `The dashboard data is game-selectable. Current default: \`${auroraGame.gameName}\` (${auroraGame.gameStatus}). Available game profiles: ${dashboardData.games.map(game => `\`${game.gameName}\``).join(', ')}.`,
    '',
    'Aurora remains the active investment target, but Galaxy Guardians is also represented as a preview/ingestion profile so the dashboard can switch subjects as the conformance project rotates between games.',
    '',
    '## Current Release Gate',
    '',
    table(releaseGateHeaders, releaseGate),
    '',
    '## How To Read Scores',
    '',
    'An `x/10` score is a measured roll-up at the current scorer resolution, not a claim of arcade-perfect behavior. A `10/10` metric means no known measured gap under the current harness and evidence coverage. It should be treated as a guardrail pass until broader reference, expert-play, visual, audio, and edge-case evidence increases confidence.',
    '',
    table(
      ['Read', 'Meaning'],
      [
        ['10/10', 'No known measured gap under the current scorer. Protect as a guardrail; do not read as perfect.'],
        ['9.x', 'Strong measured conformance with remaining risk mostly in edge cases, coverage, or polish.'],
        ['8.x', 'Good conformance, but attentive players or designers may notice scenario-specific gaps.'],
        ['7.x', 'Material conformance gap with user-experience or reference-identity impact.'],
        ['Confidence', 'How much trust to place in this score as a release signal.'],
        ['Resolution', 'How fine-grained the scorer is and what kinds of blind spots may remain.']
      ]
    ),
    '',
    '## Priority Table',
    '',
    table(
      priorityHeaders,
      rows
    ),
    '',
    '## Conformance Analysis And Economics',
    '',
    'Every release candidate should include both a conformance read and a resource/time read. The goal is to understand not only whether Aurora moved closer to Galaga-like conformance, but what local compute, browser/video work, GPU/model/API assistance, artifact volume, and retry cost were spent to get there.',
    '',
    table(
      ['Measure', 'Current read', 'Release-documentation use'],
      [
        ['Latest overall conformance', score(economics.summary?.latestOverallScore10 ?? quality.summary?.overallScore10), 'Primary quality roll-up for release notes and scorecards'],
        ['Latest level-arc conformance', score(economics.summary?.latestLevelArcScore10 ?? level?.score10), 'Long-play gameplay-shape gate'],
        ['Metric points scanned', economics.summary?.metricPointCount || 0, 'History depth behind score trends'],
        ['Score deltas found', economics.summary?.deltaCount || 0, 'Past-goal movement available for review'],
        ['Measured runs', economics.summary?.ledger?.runs || 0, 'Tracked harness/model/local compute work'],
        ['Tracked wall time', minutes(economics.summary?.ledger?.wallSeconds), 'Human clock-time planning input'],
        ['Tracked CPU time', minutes(economics.summary?.ledger?.cpuSeconds), 'Local compute-cost planning input'],
        ['Tracked artifact growth', megabytes(economics.summary?.ledger?.artifactBytes), 'Evidence volume and storage/review-cost proxy']
      ]
    ),
    '',
    '### Resource And Time Usage',
    '',
    resourceSpendRows.length
      ? table(resourceHeaders, resourceSpendRows)
      : '_No measured resource ledger entries yet. Wrap meaningful runs with `npm run harness:measure`._',
    '',
    '### Past Goal Spend By Axis',
    '',
    axisSpendRows.length
      ? table(axisHeaders, axisSpendRows)
      : '_No measured axis ledger entries yet._',
    '',
    '### Next Goal Estimates',
    '',
    table(nextEstimateHeaders, nextRows),
    '',
    '## Ingestion Framework View',
    '',
    'This view tracks the evidence pipeline behind the conformance scores: source media, extracted artifacts, annotation state, confidence, linked metric, and the next missing upgrade. It is intended to make long-cycle compute work easier to choose and easier to defend.',
    '',
    table(
      ['Read', 'Current value'],
      [
        ['Evidence families tracked', ingestionSummary.sourceFamilyCount],
        ['Scored or promoted families', ingestionSummary.scoredOrPromotedCount],
        ['High-confidence families', ingestionSummary.highConfidenceCount],
        ['Mixed or low-confidence families', ingestionSummary.mixedOrLowConfidenceCount],
        ['Next best ingestion upgrade', ingestionSummary.nextBestUpgrade]
      ]
    ),
    '',
    table(ingestionHeaders, ingestionRows),
    '',
    '### Charts',
    '',
    economicsCharts.length
      ? economicsCharts.map(chart => `![${path.basename(chart, '.svg')}](${chart})`).join('\n\n')
      : '_Run `npm run harness:analyze:conformance-economics` to refresh score, delta, and resource charts._',
    '',
    '## New First-Class Axes Added',
    '',
    '- Alien entry to levels: formation layout, timing, path method, and whether different stages enter differently.',
    '- Boss entry and formation grammar: boss timing, escort composition, formation settle evidence, challenge pattern identity, stage variation, and path/slot precision.',
    '- Challenge-stage variation: new alien types, new entry formations/styles, path families, reward/result feedback, and teaching value.',
    '- Overall visual look and feel: gameplay readability, start/attract typography density, copy complexity, color discipline, and reference contact sheets.',
    '- Arcade console frame UI: cabinet frame, bezel/rails, build/date trust signals, button density, and arcade-style containment.',
    '- Popup/help/scoring surfaces: help, scoring, leaderboard, account, feedback, and game-over result formatting as their own modal-quality family.',
    '',
    '## Maintenance Rules',
    '',
    '- Refresh this artifact after each full quality score, investment-priority run, or major conformance loop.',
    '- Before a serious `/dev`, `/beta`, or `/production` release candidate, refresh `npm run harness:analyze:conformance-economics` and `npm run harness:build:release-conformance-dashboard` so release docs include conformance, resource/time, chart, past-goal, and next-goal reads.',
    '- Any long-cycle local compute or model/API/GPU-assisted assessment should be wrapped with `npm run harness:measure` and declared with its axis and resource classes.',
    '- Ship the read-only conformance dashboard with each `/dev`, `/beta`, and `/production` lane; keep raw ingestion workspaces and unreviewed evidence engineering-owned unless a Root-gated evidence browser is explicitly approved.',
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
