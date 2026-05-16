#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const OUT = path.join(ROOT, 'CONFORMANCE_METRICS_OVERVIEW.md');
const LEGACY_OUT = path.join(ROOT, 'CONFORMANCE_METRIC_OVERVIEW.md');
const AURORA_ROOT = path.join(ROOT, 'reference-artifacts', 'analyses', 'quality-conformance');
const AURORA_AUDIO_CONTRACT = path.join(ROOT, 'reference-artifacts', 'analyses', 'aurora-audio-cue-contracts', 'latest.json');
const AURORA_ALIEN_ENTRY_CHALLENGE = path.join(ROOT, 'reference-artifacts', 'analyses', 'alien-entry-challenge-variation', 'latest.json');
const AURORA_CHALLENGE_STAGE = path.join(ROOT, 'reference-artifacts', 'analyses', 'challenge-stage-conformance', 'latest.json');
const GUARDIANS_CONFORMANCE = path.join(ROOT, 'reference-artifacts', 'analyses', 'galaxy-guardians-identity', 'reference-conformance-0.1.json');
const GUARDIANS_PLAYTEST = path.join(ROOT, 'reference-artifacts', 'analyses', 'galaxy-guardians-identity', 'playtest-conformance-review-0.1.json');

function rel(file){
  return path.relative(ROOT, file).split(path.sep).join('/');
}

function readJson(file){
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function readOptionalJson(file){
  if(!fs.existsSync(file)) return null;
  try{
    return readJson(file);
  }catch{
    return null;
  }
}

function walkReports(dir){
  const found = [];
  function walk(current){
    if(!fs.existsSync(current)) return;
    for(const entry of fs.readdirSync(current, { withFileTypes: true })){
      const full = path.join(current, entry.name);
      if(entry.isDirectory()) walk(full);
      else if(entry.isFile() && entry.name === 'report.json') found.push(full);
    }
  }
  walk(dir);
  return found.sort((a, b) => {
    const delta = fs.statSync(a).mtimeMs - fs.statSync(b).mtimeMs;
    return delta || a.localeCompare(b);
  });
}

function latestAuroraReport(){
  const reports = walkReports(AURORA_ROOT);
  if(!reports.length) throw new Error(`No Aurora quality-conformance reports found in ${rel(AURORA_ROOT)}`);
  const committed = reports.filter(file => !file.includes('-dirty/'));
  return (committed.length ? committed : reports)[(committed.length ? committed : reports).length - 1];
}

function mdEscape(value){
  return String(value ?? '')
    .replace(/\|/g, '\\|')
    .replace(/\n+/g, '<br>');
}

function score(value){
  return value == null ? '--' : `${value}/10`;
}

function buildTable(headers, rows){
  const head = `| ${headers.map(mdEscape).join(' | ')} |`;
  const rule = `| ${headers.map(() => '---').join(' | ')} |`;
  const body = rows.map(row => `| ${row.map(mdEscape).join(' | ')} |`);
  return [head, rule, ...body].join('\n');
}

function categoryScore(report, id, fallback = 0){
  const category = (report.categories || []).find(item => item.id === id);
  return category?.score10 ?? fallback;
}

function audioContractSummary(){
  return readOptionalJson(AURORA_AUDIO_CONTRACT);
}

function releaseTargetSections(aurora, guardians, guardiansPlaytest, alienEntryChallenge, challengeStage){
  const auroraOverallScore = aurora.summary.overallScore10;
  const auroraAudio = categoryScore(aurora, 'audio', 6.1);
  const auroraMovement = categoryScore(aurora, 'movement', 8);
  const auroraStage1Timing = categoryScore(aurora, 'stage1-timing', 8.5);
  const auroraChallengeTiming = categoryScore(aurora, 'challenge-timing', 8.4);
  const auroraFormationBoss = categoryScore(aurora, 'formation-boss-grammar', 0);
  const auroraShell = categoryScore(aurora, 'ui-shell', 9.2);
  const auroraAlienChallenge = alienEntryChallenge?.summary?.score10 ?? null;
  const auroraDedicatedChallenge = challengeStage?.summary?.score10 ?? null;
  const auroraChallengeInterest = challengeStage?.summary?.interestingFactorScore10 ?? null;
  const guardiansReferenceScore = guardians.summary.referenceConformanceScore10;
  const guardiansPlaytestScore = guardiansPlaytest.summary.playtestWeightedConformanceScore10;
  const guardiansAudio = (guardiansPlaytest.categories || []).find(category => category.id === 'audio-character')?.playtestWeightedScore10 || 0;
  const guardiansMotion = (guardiansPlaytest.categories || []).find(category => category.id === 'motion-pressure')?.playtestWeightedScore10 || 0;
  const guardiansVisual = (guardiansPlaytest.categories || []).find(category => category.id === 'visual-identity')?.playtestWeightedScore10 || 0;
  const guardiansAudioReference = (guardians.categories || []).find(category => category.id === 'audio-reference-character')?.score10 || 0;
  const releaseTargets = buildTable(
    ['Release cluster / focus', 'Aurora target', 'Aurora focus metrics', 'Guardians target', 'Guardians focus metrics', 'Release decision meaning'],
    [
      ['Current dev baseline', score(auroraOverallScore), `audio ${auroraAudio}; movement ${auroraMovement}; boss/formation ${auroraFormationBoss || 'pending'}; broad alien/challenge ${auroraAlienChallenge == null ? 'pending' : auroraAlienChallenge}; dedicated challenge-stage ${auroraDedicatedChallenge == null ? 'pending' : auroraDedicatedChallenge}; stage opening ${auroraStage1Timing}; challenge timing ${auroraChallengeTiming}; shell integrity ${auroraShell}`, `${guardiansReferenceScore}/10 reference; ${guardiansPlaytestScore}/10 playtest`, `maturity ${guardians.summary.referenceMaturityScore10}; gate coverage ${guardians.summary.implementationGateCoverageScore10}; public readiness ${guardians.summary.publicReleaseReadinessScore10}; audio feel ${guardiansAudio}`, 'Baseline for the next beta-candidate discussion, now weighted by local playtest feel.'],
      ['`1.3` Fidelity and Trust', '9.0/10', 'audio >= 7.2; movement >= 8.6; trust/fairness >= 9.3; shell integrity >= 9.4', `${guardiansReferenceScore}/10 reference; ${guardiansPlaytestScore}/10 playtest`, `rack timing >= 6.2; movement pressure ${guardiansMotion}; visual identity ${guardiansVisual}; audio feel ${guardiansAudio}`, 'Aurora can move beta if the weakest feel gaps improve and Guardians stays out of production but credible as a beta preview.'],
      ['`1.4` Arcade Depth / Guardians 0.1 Preview', '9.2/10', 'level-depth >= 8.4; boss/formation grammar >= 8.0; challenge-stage identity >= 8.6; later-level variation >= 8.2; audio >= 7.6', '7.8/10 reference; 7.0/10 playtest', 'frame-derived rack timing >= 7.2; dive paths >= 7.2; alien visuals >= 7.0; audio feel >= 7.0', 'Aurora gains real stage-by-stage depth; Guardians becomes a strong first preview, not a reskinned Aurora.'],
      ['`1.5` Flight Recorder and Shared Evidence', '9.3/10', 'replay/video evidence >= 8.8; published-run traceability >= 8.5; reference-event mapping >= 8.6', '8.2/10', 'source-video extraction >= 8.4; waveform/audio comparison >= 6.8; event-log durability >= 9.0', 'Shared video and evidence become release infrastructure for both applications.'],
      ['`1.6` Message to Pilot / Platform Shell', '9.4/10', 'popup containment >= 9.6; message channel >= 8.8; shell copy ownership >= 9.5', '8.5/10', 'platform integration >= 9.5; preview messaging >= 8.8; pack-boundary durability 10.0', 'Platinum feels like a coherent cabinet shell across multiple games.'],
      ['`2.0` Multi-Game Platinum Candidate', '9.5/10', 'arcade-depth stability >= 9.0; release evidence >= 9.2; pilot/replay operations >= 9.0', '9.0/10', 'playable conformance >= 8.6; scoring/progression >= 8.8; audio/visual identity >= 8.5; public readiness >= 8.5', 'Platinum can credibly claim more than one serious game experience.']
    ]
  );

  const metricTargets = buildTable(
    ['Metric family', 'Aurora current', 'Aurora next target', 'Guardians current', 'Guardians next target', 'Why it matters'],
    [
      ['Movement and pressure', score(auroraMovement), '8.6/10 in `1.3`; 8.8/10 in `1.4`', '6.2/10 playtest; 6.2/10 reference category', 'browser-reviewed runtime tuning in `1.3`; 7.2/10 playtest in `1.4`', 'This is the strongest direct feel signal during live play.'],
      ['Audio identity / acoustic fit', score(auroraAudio), '7.2/10 in `1.3`; 7.6/10 in `1.4`', `${guardiansAudio}/10 playtest; ${guardiansAudioReference}/10 reference category`, 'human-listened cue cleanup in `1.3`; 7.0/10 playtest in `1.4`', 'Audio is the weakest shared conformance area today.'],
      ['Visual identity', `${score(auroraShell)} shell integrity; game sprites not separately scored in the roll-up`, 'add a visible arcade-depth visual score in `1.4`', '6.7/10 playtest; 6.8/10 reference category', 'browser-reviewed component-sprite polish in `1.3`; 7.0/10 playtest in `1.4`', 'Guardians especially needs recognizably distinct alien silhouettes before beta-facing preview.'],
      ['Boss entry and formation grammar', auroraFormationBoss ? score(auroraFormationBoss) : 'new scorer pending', '>=8.0 first gate in `1.4`; >=9.0 with path/rack extraction', 'rack timing 6.2/10 reference category', 'frame-derived rack timing >=7.2; dive paths >=7.2', 'Boss entry, escort composition, formation settling, and challenge set pieces are the arcade choreography players recognize by stage.'],
      ['Alien entry and broad challenge planning variation', auroraAlienChallenge == null ? 'new scorer pending' : score(auroraAlienChallenge), '>=8.6/10 in `1.4`; arrival-versus-appearance and pattern novelty both above 7.5/10', 'not yet a separate Guardians roll-up', 'add first-visible arrival, entry side, target group, exit, and bonus-opportunity labels', 'This catches the gap players notice when challenge aliens feel like they appear rather than arrive through learnable arcade set pieces.'],
      ['Dedicated challenge-stage set-piece conformance', auroraDedicatedChallenge == null ? 'new scorer pending' : `${score(auroraDedicatedChallenge)}; interesting factor ${score(auroraChallengeInterest)}`, '>=6.0/10 in the next local/dev pass; >=9.2/10 when stage-by-stage reference labels and temporal windows cover late challenge stages', 'not yet a separate Guardians roll-up', 'create the same challenge-stage harness once Guardians has its Galaxian rack/challenge equivalents promoted', 'This is the stricter score for actual challenge-stage arrival, alien novelty, choreography, and bonus-opportunity readability. It is intentionally lower than the broad planning score.'],
      ['Stage / rack / wave timing', `stage opening ${auroraStage1Timing}; challenge timing ${auroraChallengeTiming}`, 'challenge and later-stage targets >= 8.6 in `1.4`', 'rack timing 6.2/10', 'browser-reviewed rack timing in `1.3`; 7.2/10 in `1.4`', 'Timing separates authentic arcade pressure from approximate motion.'],
      ['Scoring and progression', 'progression/persona 8.8; shot/hit 10.0', 'level-depth and scoring stability >= 9.0 by `2.0`', 'single-shot threat/scoring 7.5', '7.6 in `1.4`; 8.8 by `2.0`', 'Guardians should not publish persistent scoreboards until scoring is reference-aligned.'],
      ['Evidence and replay durability', 'scorecard artifacts exist; video publishing is not yet a full product surface', 'replay/video evidence >= 8.8 in `1.5`', 'evidence durability 9.7', 'human-approved sprite/cue extraction durability >= 9.7 in `1.5`', 'Shared videos and source-controlled artifacts should become normal release evidence.'],
      ['Platform boundaries and shell containment', 'shell integrity 9.2', 'popup/message/shell containment >= 9.6 in `1.6`', 'platform boundaries 10.0', 'keep 10.0 through `2.0`', 'Game work must not leak mechanics across applications; shared behavior belongs in Platinum.']
    ]
  );

  return [
    '## Release Cluster Conformance Targets',
    '',
    'These are planning targets, not release promises. They give each upcoming cluster a measurable quality bar so Aurora and Guardians can improve for different reasons without blurring their application boundaries. Aurora targets use the release-quality scorecard. Guardians targets use the preview-reference scorecard until it becomes a public playable game.',
    '',
    releaseTargets,
    '',
    '```mermaid',
    'xychart-beta',
    '  title "Overall Conformance Targets By Release Cluster"',
    '  x-axis ["Current", "1.3", "1.4", "1.5", "1.6", "2.0"]',
    '  y-axis "Score / 10" 0 --> 10',
    `  line "Aurora Galactica" [${auroraOverallScore}, 9.0, 9.2, 9.3, 9.4, 9.5]`,
    `  line "Galaxy Guardians Reference" [${guardiansReferenceScore}, ${guardiansReferenceScore}, 7.8, 8.2, 8.5, 9.0]`,
    `  line "Galaxy Guardians Playtest" [${guardiansPlaytestScore}, ${guardiansPlaytestScore}, 7.0, 8.0, 8.4, 8.8]`,
    '```',
    '',
    '## Application Metric Target Matrix',
    '',
    metricTargets
  ];
}

function main(){
  const auroraReportPath = latestAuroraReport();
  const aurora = readJson(auroraReportPath);
  const guardians = readJson(GUARDIANS_CONFORMANCE);
  const guardiansPlaytest = readJson(GUARDIANS_PLAYTEST);
  const audioContract = audioContractSummary();
  const alienEntryChallenge = readOptionalJson(AURORA_ALIEN_ENTRY_CHALLENGE);
  const challengeStage = readOptionalJson(AURORA_CHALLENGE_STAGE);
  const generatedAt = new Date().toISOString();

  const overallTable = buildTable(
    ['Game / scope', 'Primary score', 'Secondary scores', 'Status', 'Weakest current area', 'Evidence'],
    [
      [
        'Aurora Galactica current dev line',
        score(aurora.summary.overallScore10),
        `strongest ${aurora.summary.strongestCategory.label} ${score(aurora.summary.strongestCategory.score10)}; weakest ${aurora.summary.weakestCategory.label} ${score(aurora.summary.weakestCategory.score10)}${alienEntryChallenge ? `; broad alien/challenge variation ${score(alienEntryChallenge.summary.score10)}` : ''}${challengeStage ? `; dedicated challenge-stage conformance ${score(challengeStage.summary.score10)}` : ''}${audioContract ? `; audio contract readiness ${score(audioContract.summary.averageReadinessScore10)}` : ''}`,
        audioContract ? 'release-quality conformance score plus audio cue-contract read' : 'release-quality conformance score',
        `${aurora.summary.weakestCategory.label} (${score(aurora.summary.weakestCategory.score10)})`,
        [
          rel(auroraReportPath),
          audioContract ? rel(AURORA_AUDIO_CONTRACT) : null,
          challengeStage ? rel(AURORA_CHALLENGE_STAGE) : null
        ].filter(Boolean).join('; ')
      ],
      [
        'Galaxy Guardians 0.1 playable preview',
        score(guardians.summary.referenceConformanceScore10),
        `playtest weighted ${score(guardiansPlaytest.summary.playtestWeightedConformanceScore10)}; maturity ${score(guardians.summary.referenceMaturityScore10)}; gate coverage ${score(guardians.summary.implementationGateCoverageScore10)}; public readiness ${score(guardians.summary.publicReleaseReadinessScore10)}`,
        guardians.status,
        (guardians.categories || []).slice().sort((a, b) => a.score10 - b.score10)[0]?.label || '--',
        rel(GUARDIANS_CONFORMANCE)
      ]
    ]
  );

  const guardiansTable = buildTable(
    ['Metric', 'Weight', 'Reference score', 'Evidence level', 'Current read', 'Remaining gap'],
    (guardians.categories || []).map(category => [
      category.label,
      category.weight,
      score(category.score10),
      category.evidenceLevel,
      category.currentRead,
      category.remainingGap
    ])
  );

  const playtestTable = buildTable(
    ['Metric', 'Weight', 'Previous official', 'Playtest before pass', 'Current playtest score', 'Compelling target', 'Metric set'],
    (guardiansPlaytest.categories || []).map(category => [
      category.label,
      category.weight,
      score(category.previousOfficialScore10),
      score(category.playtestAdjustedBeforePass10),
      score(category.playtestWeightedScore10),
      score(category.compellingPreviewTarget10),
      (category.metricSet || []).join(', ')
    ])
  );

  const auroraTable = buildTable(
    ['Metric', 'Score', 'Evidence', 'Current read'],
    [
      ...(aurora.categories || []).map(category => [
      category.label,
      score(category.score10),
      category.id === 'audio' && audioContract
        ? [...(category.evidence || []), 'audio-cue-contracts', 'audio-promotion-precheck'].join(', ')
        : (category.evidence || []).join(', '),
      category.id === 'audio' && audioContract
        ? `${category.read} Cue-contract readiness is ${score(audioContract.summary.averageReadinessScore10)}; latest contract next step: ${audioContract.nextStep}`
        : category.read
      ]),
      ...(alienEntryChallenge ? [[
        'Alien entry and broad challenge planning variation',
        score(alienEntryChallenge.summary.score10),
        `${rel(AURORA_ALIEN_ENTRY_CHALLENGE)}, stage-signature-distance report, formation-boss path-family comparison`,
        `${alienEntryChallenge.summary.problem} Weakest metric: ${alienEntryChallenge.summary.weakestMetric?.label || 'unknown'} (${score(alienEntryChallenge.summary.weakestMetric?.score10)}).`
      ]] : []),
      ...(challengeStage ? [[
        'Dedicated challenge-stage set-piece conformance',
        `${score(challengeStage.summary.score10)}; interesting factor ${score(challengeStage.summary.interestingFactorScore10)}`,
        `${rel(AURORA_CHALLENGE_STAGE)}, ${rel(path.join(ROOT, 'CHALLENGE_STAGE_CONFORMANCE_ANALYSIS.md'))}, challenge-stage correspondence and motion-profile harnesses`,
        `${challengeStage.summary.weakestFinding} Player meaning: ${challengeStage.summary.playerMeaning} Next recommended step: ${challengeStage.improvementPlan?.[0] || 'continue reference-labeled trajectory and novelty extraction.'}`
      ]] : [])
    ]
  );

  const lines = [
    '# Conformance Metrics Overview',
    '',
    `Generated: \`${generatedAt}\``,
    '',
    'This document summarizes the current conformance scoring model for both the shipped Aurora application and the Galaxy Guardians 0.1 development preview. Aurora uses the release-quality scorecard; Guardians uses both a reference-conformance preview metric set and a stricter playtest-weighted score because its Galaxian evidence is still being promoted from source footage into frame-level/audio-level measurements.',
    '',
    '## Overall Comparison',
    '',
    overallTable,
    '',
    '## Galaxy Guardians First-Class Promotion Read',
    '',
    'Near-parity for `Galaxy Guardians` means process parity before score parity. The game should keep its own ingestion package, conformance metrics, score/progression/result identity, manual-review loop, and candidate-review path even while its absolute score remains lower than Aurora. The maintained Galaxy-specific strategy is in [GALAXY_GUARDIANS_FIRST_CLASS_CONFORMANCE_PLAN.md](GALAXY_GUARDIANS_FIRST_CLASS_CONFORMANCE_PLAN.md), and the standing aggregate process gate is `npm run harness:check:galaxy-guardians-first-class-conformance`.',
    '',
    `Current read: reference ${score(guardians.summary.referenceConformanceScore10)}, playtest ${score(guardiansPlaytest.summary.playtestWeightedConformanceScore10)}, maturity ${score(guardians.summary.referenceMaturityScore10)}, gate coverage ${score(guardians.summary.implementationGateCoverageScore10)}, public readiness ${score(guardians.summary.publicReleaseReadinessScore10)}.`,
    '',
    ...releaseTargetSections(aurora, guardians, guardiansPlaytest, alienEntryChallenge, challengeStage),
    '',
    '## Galaxy Guardians 0.1 Preview Metrics',
    '',
    guardiansTable,
    '',
    '## Galaxy Guardians Playtest-Weighted Metrics',
    '',
    playtestTable,
    '',
    '## Aurora Galactica Current Metrics',
    '',
    auroraTable,
    '',
    '## Guardians Scoring Decision',
    '',
    'Guardians preview scoring should exist locally now, and it does: the dev runtime awards points by alien role, formation/dive state, and flagship escort count, with a harnessed contract in `npm run harness:check:galaxy-guardians-threat-scoring`. Persisted leaderboard submission should wait until the Galaxian score-advance table, wave progression, and public-release scoring policy are closer to reference conformance.',
    '',
    '## Current Guardians Promotion Priorities',
    '',
    ...(guardians.nextMetricPromotions || []).map(item => `- ${item}`)
  ];

  const output = `${lines.join('\n')}\n`;
  fs.writeFileSync(OUT, output);
  fs.writeFileSync(LEGACY_OUT, output);
  console.log(JSON.stringify({
    ok: true,
    output: rel(OUT),
    legacyOutput: rel(LEGACY_OUT),
    auroraReport: rel(auroraReportPath),
    guardiansConformance: rel(GUARDIANS_CONFORMANCE),
    guardiansPlaytest: rel(GUARDIANS_PLAYTEST),
    alienEntryChallenge: alienEntryChallenge ? rel(AURORA_ALIEN_ENTRY_CHALLENGE) : null,
    challengeStage: challengeStage ? rel(AURORA_CHALLENGE_STAGE) : null,
    auroraOverallScore10: aurora.summary.overallScore10,
    guardiansReferenceScore10: guardians.summary.referenceConformanceScore10
  }, null, 2));
}

main();
