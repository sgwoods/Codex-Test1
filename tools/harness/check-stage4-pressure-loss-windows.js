#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..', '..');
const HARNESS = path.join(__dirname, 'run-gameplay.js');
const OUT_ROOT = path.join(ROOT, 'reference-artifacts', 'analyses', 'aurora-stage4-loss-windows');
const RISK_ROOT = path.join(ROOT, 'reference-artifacts', 'analyses', 'aurora-stage4-pressure-risk');
const RUN_OUT = path.join(ROOT, 'harness-artifacts', 'checks', 'stage4-pressure-loss-windows');

const WINDOWS = [
  {
    id: 'stage4-survival-boss-lane7',
    scenario: 'stage4-survival-boss-lane7-loss-window',
    expected: {
      cause: 'enemy_collision',
      sourceType: 'boss',
      playerLane: 7,
      sourceLane: 7,
      sourceColumn: 5,
      stageClock: [13.65, 14.05],
      hitBeforeCollision: true
    }
  },
  {
    id: 'stage4-five-ships-but-lane2',
    scenario: 'stage4-five-ships-but-lane2-loss-window',
    expected: {
      cause: 'enemy_collision',
      sourceType: 'but',
      playerLane: 2,
      sourceLane: 2,
      sourceColumn: 5,
      stageClock: [15.05, 15.45],
      hitBeforeCollision: false
    }
  },
  {
    id: 'stage4-five-ships-boss-lane6',
    scenario: 'stage4-five-ships-boss-lane6-loss-window',
    expected: {
      cause: 'enemy_collision',
      sourceType: 'boss',
      playerLane: 6,
      sourceLane: 6,
      sourceColumn: 5,
      stageClock: [18.3, 18.75],
      hitBeforeCollision: false
    }
  }
];

function fail(message, payload){
  console.error(message);
  if(payload) console.error(JSON.stringify(payload, null, 2));
  process.exit(1);
}

function readJson(file){
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function writeJson(file, data){
  fs.writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`);
}

function ensureDir(dir){
  fs.mkdirSync(dir, { recursive: true });
}

function rel(file){
  return path.relative(ROOT, file);
}

function git(args){
  const run = spawnSync('git', ['-C', ROOT, ...args], { encoding: 'utf8' });
  return run.status === 0 ? run.stdout.trim() : '';
}

function shortCommit(){
  return git(['rev-parse', '--short', 'HEAD']) || 'unknown';
}

function runScenario(name){
  const args = [
    HARNESS,
    '--scenario', name,
    '--out', RUN_OUT,
    '--auto-video', '0'
  ];
  const run = spawnSync(process.execPath, args, {
    cwd: ROOT,
    encoding: 'utf8',
    timeout: 90000
  });
  if(run.status !== 0){
    const err = new Error('loss-window scenario run failed');
    err.payload = { name, status: run.status, signal: run.signal, stdout: run.stdout, stderr: run.stderr };
    throw err;
  }
  try{
    return JSON.parse(run.stdout.trim());
  }catch(parseErr){
    parseErr.payload = { name, stdout: run.stdout, stderr: run.stderr };
    throw parseErr;
  }
}

function sessionPathFor(summary){
  const files = summary.files || [];
  const file = files.find(candidate => candidate.endsWith('.json') && !candidate.endsWith('-system-status.json'));
  return file && fs.existsSync(file) ? file : null;
}

function latestRiskReport(){
  if(!fs.existsSync(RISK_ROOT)) return null;
  const candidates = fs.readdirSync(RISK_ROOT)
    .map(name => path.join(RISK_ROOT, name, 'report.json'))
    .filter(file => fs.existsSync(file))
    .map(file => ({ file, stat: fs.statSync(file) }))
    .sort((a, b) => b.stat.mtimeMs - a.stat.mtimeMs);
  return candidates[0]?.file || null;
}

function recentEvents(events, t, seconds){
  return events.filter(event => event.t <= t && t - event.t <= seconds);
}

function nearbyEvents(events, t, seconds){
  return events.filter(event => Math.abs((event.t || 0) - t) <= seconds);
}

function compactNumber(value){
  return Number.isFinite(+value) ? +(+value).toFixed(3) : null;
}

function compactEvent(event){
  return {
    t: compactNumber(event.t),
    type: event.type,
    id: event.id ?? null,
    enemyId: event.enemyId ?? null,
    mode: event.mode || null,
    cause: event.cause || null,
    enemyType: event.enemyType || event.sourceType || null,
    dive: event.dive ?? event.sourceDive ?? event.enemyDive ?? null,
    playerLane: event.playerLane ?? null,
    originLane: event.originLane ?? null,
    targetLane: event.targetLane ?? null,
    enemyLane: event.enemyLane ?? event.sourceLane ?? event.lane ?? null,
    sourceColumn: event.sourceColumn ?? event.column ?? null,
    x: compactNumber(event.x),
    y: compactNumber(event.y),
    playerX: compactNumber(event.playerX),
    enemyX: compactNumber(event.enemyX),
    enemyY: compactNumber(event.enemyY)
  };
}

function relevantEvent(event){
  return [
    'enemy_attack_start',
    'enemy_lower_field',
    'enemy_bullet_fired',
    'enemy_damaged',
    'enemy_killed',
    'player_shot',
    'ship_lost'
  ].includes(event.type);
}

function attackTrail(events, loss){
  if(loss.enemyId == null) return [];
  return events
    .filter(event => (
      (event.id === loss.enemyId || event.enemyId === loss.enemyId) &&
      ['enemy_attack_start', 'enemy_lower_field', 'enemy_damaged', 'enemy_killed', 'ship_lost'].includes(event.type)
    ))
    .filter(event => event.t <= loss.t + 0.05)
    .map(compactEvent);
}

function enrichLoss(loss, session){
  const events = session?.events || [];
  const eventLoss = events.find(event =>
    event.type === 'ship_lost' &&
    Math.abs((event.t || 0) - (loss.t || 0)) <= 0.035 &&
    (!loss.cause || event.cause === loss.cause)
  ) || null;
  const enemyId = loss.enemyId ?? eventLoss?.enemyId ?? loss.sourceId ?? null;
  const sourceType = loss.sourceType || loss.enemyType || eventLoss?.enemyType || 'unknown';
  const sourceLane = loss.sourceLane ?? loss.enemyLane ?? eventLoss?.enemyLane ?? null;
  const sourceColumn = loss.sourceColumn ?? null;
  const attackStart = enemyId == null ? null : [...events].reverse().find(event =>
    event.type === 'enemy_attack_start' && event.id === enemyId && event.t <= loss.t
  );
  const lowerField = enemyId == null ? null : [...events].reverse().find(event =>
    event.type === 'enemy_lower_field' && event.id === enemyId && event.t <= loss.t
  );
  const priorDamage = enemyId == null ? [] : recentEvents(events, loss.t, 0.9)
    .filter(event => event.type === 'enemy_damaged' && event.id === enemyId)
    .map(compactEvent);
  const recentShots = recentEvents(events, loss.t, 0.7)
    .filter(event => event.type === 'player_shot')
    .map(compactEvent);
  return {
    t: compactNumber(loss.t),
    stageClock: compactNumber(loss.stageClock ?? loss.t),
    cause: loss.cause || eventLoss?.cause || 'unknown',
    enemyId,
    sourceType,
    sourceDive: loss.sourceDive ?? loss.enemyDive ?? eventLoss?.enemyDive ?? null,
    sourceMode: attackStart?.mode || null,
    playerLane: loss.playerLane ?? eventLoss?.playerLane ?? null,
    sourceLane,
    originLane: attackStart?.originLane ?? null,
    targetLane: attackStart?.targetLane ?? null,
    sourceColumn: sourceColumn ?? attackStart?.column ?? null,
    playerX: compactNumber(loss.playerX ?? eventLoss?.playerX),
    enemyX: compactNumber(loss.enemyX ?? eventLoss?.enemyX),
    enemyY: compactNumber(loss.enemyY ?? eventLoss?.enemyY),
    recentAttackStarts: loss.recentAttackStarts ?? 0,
    recentEnemyBullets: loss.recentEnemyBullets ?? 0,
    timeSinceAttackStart: attackStart ? compactNumber(loss.t - attackStart.t) : null,
    timeSinceLowerField: lowerField ? compactNumber(loss.t - lowerField.t) : null,
    hitBeforeCollision: priorDamage.length > 0,
    priorDamage,
    recentShots,
    nearbyEvents: nearbyEvents(events, loss.t, 0.4).filter(relevantEvent).map(compactEvent),
    attackTrail: attackTrail(events, { enemyId, t: loss.t })
  };
}

function inWindow(value, range){
  return Number.isFinite(+value) && value >= range[0] && value <= range[1];
}

function expectationChecks(loss, expected){
  return {
    cause: loss?.cause === expected.cause,
    sourceType: loss?.sourceType === expected.sourceType,
    playerLane: loss?.playerLane === expected.playerLane,
    sourceLane: loss?.sourceLane === expected.sourceLane,
    sourceColumn: loss?.sourceColumn === expected.sourceColumn,
    stageClock: inWindow(loss?.stageClock, expected.stageClock),
    hitBeforeCollision: loss?.hitBeforeCollision === expected.hitBeforeCollision
  };
}

function allTrue(values){
  return Object.values(values).every(Boolean);
}

function summarizeWindow(spec, summary){
  const sessionPath = sessionPathFor(summary);
  const session = sessionPath ? readJson(sessionPath).session : null;
  const losses = (summary.analysis?.shipLost || []).map(loss => enrichLoss(loss, session || { events: [] }));
  const checksByLoss = losses.map(loss => ({ loss, checks: expectationChecks(loss, spec.expected) }));
  const match = checksByLoss.find(entry => allTrue(entry.checks));
  return {
    id: spec.id,
    scenario: spec.scenario,
    expected: spec.expected,
    reproduced: !!match,
    bestLoss: match?.loss || losses[0] || null,
    checks: match?.checks || (checksByLoss[0]?.checks || expectationChecks(null, spec.expected)),
    lossCount: losses.length,
    lossCauseCounts: summary.analysis?.lossCauseCounts || {},
    eventCounts: summary.analysis?.eventCounts || {},
    state: {
      stage: summary.state?.stage ?? null,
      lives: summary.state?.lives ?? null,
      score: summary.state?.score ?? null,
      simT: compactNumber(summary.state?.simT)
    },
    runDir: summary.files?.length ? rel(path.dirname(summary.files[0])) : null,
    session: sessionPath ? rel(sessionPath) : null,
    losses
  };
}

function compactSourceLoss(loss){
  if(!loss) return null;
  return {
    runId: loss.runId || null,
    runDir: loss.runDir || null,
    t: compactNumber(loss.t),
    stageClock: compactNumber(loss.stageClock),
    cause: loss.cause || null,
    enemyId: loss.enemyId ?? null,
    sourceType: loss.sourceType || null,
    sourceDive: loss.sourceDive ?? null,
    sourceMode: loss.sourceMode || null,
    playerLane: loss.playerLane ?? null,
    sourceLane: loss.sourceLane ?? null,
    originLane: loss.originLane ?? null,
    targetLane: loss.targetLane ?? null,
    sourceColumn: loss.sourceColumn ?? null,
    playerX: compactNumber(loss.playerX),
    enemyX: compactNumber(loss.enemyX),
    enemyY: compactNumber(loss.enemyY),
    recentAttackStarts: loss.recentAttackStarts ?? 0,
    recentEnemyBullets: loss.recentEnemyBullets ?? 0,
    timeSinceAttackStart: compactNumber(loss.timeSinceAttackStart),
    timeSinceLowerField: compactNumber(loss.timeSinceLowerField),
    hitBeforeCollision: !!loss.hitBeforeCollision,
    priorDamage: loss.priorDamage || [],
    recentShots: loss.recentShots || [],
    nearbyEvents: loss.nearbyEvents || [],
    signature: loss.signature || null
  };
}

function summarizeSourceWindow(spec, riskReport){
  const losses = (riskReport?.losses || [])
    .filter(loss => allTrue(expectationChecks(loss, spec.expected)))
    .map(compactSourceLoss);
  return {
    found: losses.length > 0,
    matchCount: losses.length,
    representativeLoss: losses[0] || null,
    losses
  };
}

function buildReadme(report){
  const lines = [
    '# Aurora Stage 4 Loss Windows',
    '',
    `Generated: \`${report.generatedAt}\``,
    '',
    '## Problem',
    '',
    'The Stage 4 pressure gap is currently dominated by body-contact deaths during scoreable dive pressure, especially boss and butterfly paths that reach the player lane immediately after or near player shots.',
    '',
    '## Strategy',
    '',
    'This artifact promotes the highest-value Stage 4 pressure-risk signatures into short harness windows and records whether fresh replay probes reproduce the archived loss signatures. The source-window extraction is the current authority; replay mismatch is treated as a harness precision finding, not as proof that the pressure problem disappeared.',
    '',
    '## Success Criteria For This Phase',
    '',
    `- Source windows found: ${report.summary.sourceWindowsFound}/${report.summary.totalWindows}`,
    `- Fresh replay probes reproduced: ${report.summary.replayReproducedWindows}/${report.summary.totalWindows}`,
    `- Overall assessment gate: ${report.ok ? 'PASS' : 'FAIL'}`,
    '',
    'A pass here means the measurement problem improved and the replay reproducibility gap is measured. It does not mean gameplay conformance improved yet.',
    '',
    '## Window Results',
    ''
  ];
  for(const result of report.results){
    lines.push(`### ${result.id}`);
    lines.push(`- Scenario: \`${result.scenario}\``);
    lines.push(`- Archived source matches: ${result.source.found ? result.source.matchCount : 0}`);
    lines.push(`- Fresh replay reproduced expected signature: ${result.replay.reproduced ? 'yes' : 'no'}`);
    lines.push(`- Fresh replay loss count: ${result.replay.lossCount}`);
    if(result.source.representativeLoss){
      const loss = result.source.representativeLoss;
      lines.push(`- Source loss: \`${loss.cause}|${loss.sourceType}|playerLane:${loss.playerLane}|sourceLane:${loss.sourceLane}|sourceColumn:${loss.sourceColumn}|t:${loss.stageClock}|hitBefore:${loss.hitBeforeCollision}\``);
    }
    if(result.replay.bestLoss){
      const loss = result.replay.bestLoss;
      lines.push(`- Fresh replay nearest loss: \`${loss.cause}|${loss.sourceType}|playerLane:${loss.playerLane}|sourceLane:${loss.sourceLane}|sourceColumn:${loss.sourceColumn}|t:${loss.stageClock}|hitBefore:${loss.hitBeforeCollision}\``);
    }
    lines.push('');
  }
  lines.push('## Recommended Next Step');
  lines.push('');
  lines.push('- Add per-frame attacker path sampling for these promoted windows so the boss/butterfly path, player lane, and shot timing can be scored frame-by-frame before changing gameplay constants.');
  lines.push('- Then tune one pressure lever at a time and compare these windows plus the aggregate Stage 4 pressure gate.');
  lines.push('');
  return `${lines.join('\n')}\n`;
}

function main(){
  const riskReportFile = latestRiskReport();
  if(!riskReportFile) fail('no Stage 4 pressure-risk report found', { riskRoot: RISK_ROOT });
  const riskReport = readJson(riskReportFile);
  const outDir = path.join(OUT_ROOT, `${new Date().toISOString().slice(0, 10)}-${shortCommit()}`);
  const results = [];
  for(const spec of WINDOWS){
    let summary;
    try{
      summary = runScenario(spec.scenario);
    }catch(err){
      fail(err.message || 'loss-window scenario failed', err.payload || { scenario: spec.scenario });
    }
    results.push({
      id: spec.id,
      scenario: spec.scenario,
      expected: spec.expected,
      source: summarizeSourceWindow(spec, riskReport),
      replay: summarizeWindow(spec, summary)
    });
  }
  const report = {
    schema_version: 1,
    artifact_type: 'aurora-stage4-loss-window-assessment',
    generatedAt: new Date().toISOString(),
    branch: git(['branch', '--show-current']),
    commit: shortCommit(),
    sourceRiskReport: rel(riskReportFile),
    runOut: rel(RUN_OUT),
    problem: 'Stage 4 pressure creates body-contact losses in scoreable dive windows; aggregate pressure failure needs deterministic root-cause windows before tuning.',
    strategy: 'Promote top mined loss signatures into archived source windows, run short fresh replay probes, preserve event trails, and make replay mismatch explicit before future path/contact tuning.',
    successMeasure: 'All promoted source windows are found in archived evidence, and fresh replay probes produce measured reproducibility status for each specific loss signature.',
    summary: {
      totalWindows: results.length,
      sourceWindowsFound: results.filter(result => result.source.found).length,
      replayReproducedWindows: results.filter(result => result.replay.reproduced).length,
      replayProbeMode: 'realtime-no-video'
    },
    results
  };
  report.ok = report.summary.sourceWindowsFound === report.summary.totalWindows;

  ensureDir(outDir);
  const reportFile = path.join(outDir, 'report.json');
  const readmeFile = path.join(outDir, 'README.md');
  writeJson(reportFile, report);
  fs.writeFileSync(readmeFile, buildReadme(report));

  console.log(JSON.stringify({
    ok: report.ok,
    report: reportFile,
    readme: readmeFile,
    summary: report.summary,
    results: results.map(result => ({
      id: result.id,
      sourceFound: result.source.found,
      sourceMatchCount: result.source.matchCount,
      replayReproduced: result.replay.reproduced,
      replayLossCount: result.replay.lossCount,
      sourceLoss: result.source.representativeLoss && {
        cause: result.source.representativeLoss.cause,
        sourceType: result.source.representativeLoss.sourceType,
        playerLane: result.source.representativeLoss.playerLane,
        sourceLane: result.source.representativeLoss.sourceLane,
        sourceColumn: result.source.representativeLoss.sourceColumn,
        stageClock: result.source.representativeLoss.stageClock,
        hitBeforeCollision: result.source.representativeLoss.hitBeforeCollision
      },
      replayBestLoss: result.replay.bestLoss && {
        cause: result.replay.bestLoss.cause,
        sourceType: result.replay.bestLoss.sourceType,
        playerLane: result.replay.bestLoss.playerLane,
        sourceLane: result.replay.bestLoss.sourceLane,
        sourceColumn: result.replay.bestLoss.sourceColumn,
        stageClock: result.replay.bestLoss.stageClock,
        hitBeforeCollision: result.replay.bestLoss.hitBeforeCollision
      }
    }))
  }, null, 2));

  if(!report.ok) process.exit(1);
}

main();
