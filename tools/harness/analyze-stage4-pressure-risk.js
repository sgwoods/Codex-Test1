#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..', '..');
const DEFAULT_INPUT_ROOT = path.join(ROOT, 'harness-artifacts', 'checks', 'stage-pressure-balance');
const OUT_ROOT = path.join(ROOT, 'reference-artifacts', 'analyses', 'aurora-stage4-pressure-risk');
const TARGET_SCENARIOS = new Set(['stage4-five-ships', 'stage4-survival']);

function fail(message, payload){
  console.error(message);
  if(payload) console.error(JSON.stringify(payload, null, 2));
  process.exit(1);
}

function parseArgs(argv){
  const args = {};
  for(let i = 0; i < argv.length; i++){
    const arg = argv[i];
    if(!arg.startsWith('--')) continue;
    const key = arg.slice(2);
    const next = argv[i + 1];
    if(!next || next.startsWith('--')) args[key] = true;
    else { args[key] = next; i++; }
  }
  return args;
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

function gitShortCommit(){
  const run = spawnSync('git', ['-C', ROOT, 'rev-parse', '--short', 'HEAD'], { encoding: 'utf8' });
  return run.status === 0 ? run.stdout.trim() : 'unknown';
}

function runScenarioName(dirName){
  for(const scenario of TARGET_SCENARIOS){
    if(dirName.startsWith(`${scenario}-`)) return scenario;
  }
  return null;
}

function listCandidateRunDirs(inputRoot, limit){
  if(!fs.existsSync(inputRoot)) return [];
  const dirs = fs.readdirSync(inputRoot)
    .map(name => {
      const full = path.join(inputRoot, name);
      const stat = fs.statSync(full);
      const scenario = stat.isDirectory() ? runScenarioName(name) : null;
      return { name, full, stat, scenario };
    })
    .filter(entry => entry.scenario && fs.existsSync(path.join(entry.full, 'summary.json')))
    .sort((a, b) => b.stat.mtimeMs - a.stat.mtimeMs);
  return Number.isFinite(limit) && limit > 0 ? dirs.slice(0, limit) : dirs;
}

function compactArtifactQuality(q){
  return {
    ok: q?.ok === true,
    issues: q?.issues || [],
    expectedDuration: q?.expectedDuration ?? null,
    formatDuration: q?.formatDuration ?? null,
    drift: q?.drift ?? null,
    size: q?.size ?? null,
    repaired: !!q?.repaired
  };
}

function relative(file){
  return path.relative(ROOT, file);
}

function resolveSessionPath(runDir, summary){
  const fromFiles = (summary.files || []).find(file => file.endsWith('.json') && !file.endsWith('-system-status.json'));
  if(fromFiles){
    if(path.isAbsolute(fromFiles) && fs.existsSync(fromFiles)) return fromFiles;
    const local = path.join(runDir, path.basename(fromFiles));
    if(fs.existsSync(local)) return local;
  }
  const fallback = fs.readdirSync(runDir).find(name => name.endsWith('.json') && name.includes('session') && !name.endsWith('-system-status.json'));
  return fallback ? path.join(runDir, fallback) : null;
}

function recentEvents(events, t, windowSec){
  return events.filter(event => event.t <= t && t - event.t <= windowSec);
}

function nearbyEvents(events, t, windowSec){
  return events.filter(event => Math.abs((event.t || 0) - t) <= windowSec);
}

function relevantNearbyEvent(event){
  return [
    'enemy_attack_start',
    'enemy_lower_field',
    'enemy_bullet_fired',
    'enemy_damaged',
    'enemy_killed',
    'player_shot',
    'ship_lost',
    'capture_started',
    'fighter_captured'
  ].includes(event.type);
}

function compactEvent(event){
  return {
    t: event.t ?? null,
    type: event.type,
    id: event.id ?? null,
    enemyId: event.enemyId ?? null,
    mode: event.mode || null,
    cause: event.cause || null,
    enemyType: event.enemyType || event.sourceType || null,
    sourceDive: event.sourceDive ?? event.dive ?? null,
    playerLane: event.playerLane ?? null,
    originLane: event.originLane ?? null,
    targetLane: event.targetLane ?? null,
    enemyLane: event.enemyLane ?? event.sourceLane ?? event.lane ?? null,
    sourceColumn: event.sourceColumn ?? event.column ?? null,
    x: Number.isFinite(+event.x) ? +(+event.x).toFixed(2) : null,
    y: Number.isFinite(+event.y) ? +(+event.y).toFixed(2) : null,
    enemyX: Number.isFinite(+event.enemyX) ? +(+event.enemyX).toFixed(2) : null,
    enemyY: Number.isFinite(+event.enemyY) ? +(+event.enemyY).toFixed(2) : null
  };
}

function enrichLoss(loss, run, session){
  const events = session?.events || [];
  const shipLossEvent = events.find(event =>
    event.type === 'ship_lost' &&
    Math.abs((event.t || 0) - (loss.t || 0)) <= 0.025 &&
    (!loss.cause || event.cause === loss.cause)
  ) || null;
  const enemyId = loss.enemyId ?? shipLossEvent?.enemyId ?? loss.sourceId ?? null;
  const sourceType = loss.sourceType || loss.enemyType || shipLossEvent?.enemyType || 'unknown';
  const sourceDive = loss.sourceDive ?? loss.enemyDive ?? shipLossEvent?.enemyDive ?? null;
  const playerLane = loss.playerLane ?? shipLossEvent?.playerLane ?? null;
  const sourceLane = loss.sourceLane ?? loss.enemyLane ?? shipLossEvent?.enemyLane ?? null;
  const playerX = loss.playerX ?? shipLossEvent?.playerX ?? null;
  const enemyX = loss.enemyX ?? shipLossEvent?.enemyX ?? null;
  const enemyY = loss.enemyY ?? shipLossEvent?.enemyY ?? null;
  const attackStart = enemyId == null ? null : [...events].reverse().find(event =>
    event.type === 'enemy_attack_start' && event.id === enemyId && event.t <= loss.t
  );
  const lowerField = enemyId == null ? null : [...events].reverse().find(event =>
    event.type === 'enemy_lower_field' && event.id === enemyId && event.t <= loss.t
  );
  const priorDamage = enemyId == null ? [] : recentEvents(events, loss.t, 0.9)
    .filter(event => event.type === 'enemy_damaged' && event.id === enemyId)
    .map(compactEvent);
  const recentShots = recentEvents(events, loss.t, 0.6)
    .filter(event => event.type === 'player_shot')
    .slice(-4)
    .map(compactEvent);
  const localEvents = nearbyEvents(events, loss.t, 0.35)
    .filter(relevantNearbyEvent)
    .map(compactEvent);
  const hitBeforeCollision = priorDamage.length > 0;
  const signature = [
    run.scenario,
    loss.cause || 'unknown',
    sourceType,
    `playerLane:${playerLane ?? 'na'}`,
    `sourceLane:${sourceLane ?? 'na'}`,
    `sourceColumn:${loss.sourceColumn ?? 'na'}`,
    `recentAttacks:${loss.recentAttackStarts ?? 0}`,
    hitBeforeCollision ? 'hit-before-loss' : 'no-hit-before-loss'
  ].join('|');
  return {
    runId: run.id,
    runDir: run.dir,
    scenario: run.scenario,
    persona: run.persona,
    seed: run.seed,
    usableVideo: run.artifactQuality.ok,
    t: loss.t ?? null,
    stageClock: loss.stageClock ?? loss.t ?? null,
    cause: loss.cause || 'unknown',
    enemyId,
    sourceType,
    sourceDive,
    sourceMode: attackStart?.mode || null,
    playerLane,
    sourceLane,
    originLane: attackStart?.originLane ?? null,
    targetLane: attackStart?.targetLane ?? null,
    sourceColumn: loss.sourceColumn ?? attackStart?.column ?? null,
    playerX,
    enemyX,
    enemyY,
    recentAttackStarts: loss.recentAttackStarts ?? 0,
    recentEnemyBullets: loss.recentEnemyBullets ?? 0,
    attackersOnSnapshot: loss.snapshot?.attackers ?? null,
    enemyBulletsOnSnapshot: loss.snapshot?.enemyBullets ?? null,
    playerBulletsOnSnapshot: loss.snapshot?.playerBullets ?? null,
    timeSinceAttackStart: attackStart ? +(loss.t - attackStart.t).toFixed(3) : null,
    timeSinceLowerField: lowerField ? +(loss.t - lowerField.t).toFixed(3) : null,
    hitBeforeCollision,
    priorDamage,
    recentShots,
    nearbyEvents: localEvents,
    signature
  };
}

function countBy(items, keyFn){
  const out = {};
  for(const item of items){
    const key = keyFn(item);
    out[key] = (out[key] || 0) + 1;
  }
  return out;
}

function topEntries(counts, limit=10){
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, limit)
    .map(([key, count]) => ({ key, count }));
}

function average(values){
  const nums = values.filter(value => Number.isFinite(value));
  return nums.length ? +(nums.reduce((sum, value) => sum + value, 0) / nums.length).toFixed(3) : null;
}

function summarizeRuns(runs, losses){
  const usableRuns = runs.filter(run => run.artifactQuality.ok);
  const unusableRuns = runs.filter(run => !run.artifactQuality.ok);
  const byScenario = {};
  for(const scenario of TARGET_SCENARIOS){
    const scenarioRuns = runs.filter(run => run.scenario === scenario);
    const scenarioLosses = losses.filter(loss => loss.scenario === scenario);
    byScenario[scenario] = {
      runs: scenarioRuns.length,
      usableRuns: scenarioRuns.filter(run => run.artifactQuality.ok).length,
      unusableRuns: scenarioRuns.filter(run => !run.artifactQuality.ok).length,
      losses: scenarioLosses.length,
      avgLossesPerUsableRun: average(scenarioRuns.filter(run => run.artifactQuality.ok).map(run => run.losses)),
      causeCounts: countBy(scenarioLosses, loss => loss.cause),
      sourceTypeCounts: countBy(scenarioLosses, loss => loss.sourceType),
      hitBeforeCollisionCount: scenarioLosses.filter(loss => loss.hitBeforeCollision).length
    };
  }
  return {
    runsScanned: runs.length,
    usableRuns: usableRuns.length,
    unusableRuns: unusableRuns.length,
    totalLosses: losses.length,
    totalCollisionLosses: losses.filter(loss => loss.cause === 'enemy_collision').length,
    totalBulletLosses: losses.filter(loss => loss.cause === 'enemy_bullet').length,
    hitBeforeCollisionCount: losses.filter(loss => loss.hitBeforeCollision).length,
    avgRecentAttackStartsAtLoss: average(losses.map(loss => loss.recentAttackStarts)),
    avgRecentEnemyBulletsAtLoss: average(losses.map(loss => loss.recentEnemyBullets)),
    byScenario,
    causeCounts: countBy(losses, loss => loss.cause),
    sourceTypeCounts: countBy(losses, loss => loss.sourceType),
    playerLaneCounts: countBy(losses, loss => String(loss.playerLane ?? 'unknown')),
    sourceLaneCounts: countBy(losses, loss => String(loss.sourceLane ?? 'unknown')),
    topSignatures: topEntries(countBy(losses, loss => loss.signature), 12),
    videoQualityIssues: countBy(unusableRuns.flatMap(run => run.artifactQuality.issues.length ? run.artifactQuality.issues : ['unknown']), issue => issue)
  };
}

function buildReadme(report){
  const lines = [
    '# Aurora Stage 4 Pressure Risk',
    '',
    `Generated: \`${report.generatedAt}\``,
    '',
    '## Problem',
    '',
    'Stage 4 pressure still fails independently of challenge-stage safety. This report mines recent pressure artifacts to make collision and bullet-loss patterns measurable before another gameplay tuning pass.',
    '',
    '## Sources',
    '',
    `- Input root: \`${report.inputRoot}\``,
    `- Runs scanned: ${report.summary.runsScanned}`,
    `- Usable video-backed runs: ${report.summary.usableRuns}`,
    `- Unusable video-backed runs: ${report.summary.unusableRuns}`,
    '',
    '## Risk Summary',
    '',
    `- Total losses: ${report.summary.totalLosses}`,
    `- Collision losses: ${report.summary.totalCollisionLosses}`,
    `- Bullet losses: ${report.summary.totalBulletLosses}`,
    `- Hit-before-collision cases: ${report.summary.hitBeforeCollisionCount}`,
    `- Avg recent attack starts at loss: ${String(report.summary.avgRecentAttackStartsAtLoss)}`,
    `- Avg recent enemy bullets at loss: ${String(report.summary.avgRecentEnemyBulletsAtLoss)}`,
    '',
    '## Scenario Breakdown',
    ''
  ];
  for(const [scenario, entry] of Object.entries(report.summary.byScenario)){
    lines.push(`### ${scenario}`);
    lines.push(`- Runs: ${entry.runs}`);
    lines.push(`- Usable runs: ${entry.usableRuns}`);
    lines.push(`- Losses: ${entry.losses}`);
    lines.push(`- Avg losses per usable run: ${String(entry.avgLossesPerUsableRun)}`);
    lines.push(`- Causes: \`${JSON.stringify(entry.causeCounts)}\``);
    lines.push(`- Source roles: \`${JSON.stringify(entry.sourceTypeCounts)}\``);
    lines.push(`- Hit-before-collision: ${entry.hitBeforeCollisionCount}`);
    lines.push('');
  }
  lines.push('## Top Loss Signatures');
  lines.push('');
  for(const entry of report.summary.topSignatures){
    lines.push(`- ${entry.count}x \`${entry.key}\``);
  }
  lines.push('');
  lines.push('## Recommended Next Step');
  lines.push('');
  for(const step of report.recommendedNextSteps) lines.push(`- ${step}`);
  lines.push('');
  return `${lines.join('\n')}\n`;
}

function main(){
  const args = parseArgs(process.argv.slice(2));
  const inputRoot = path.resolve(ROOT, args.input || DEFAULT_INPUT_ROOT);
  const limit = args.limit === undefined ? 32 : Number(args.limit);
  const outDir = path.join(OUT_ROOT, `${new Date().toISOString().slice(0, 10)}-${gitShortCommit()}`);
  const candidates = listCandidateRunDirs(inputRoot, Number.isFinite(limit) ? limit : 0);
  if(!candidates.length) fail('no Stage 4 pressure artifacts found', { inputRoot });

  const runs = [];
  const losses = [];
  for(const candidate of candidates){
    const summaryPath = path.join(candidate.full, 'summary.json');
    const summary = readJson(summaryPath);
    const sessionPath = resolveSessionPath(candidate.full, summary);
    const session = sessionPath ? readJson(sessionPath).session : null;
    const run = {
      id: path.basename(candidate.full),
      dir: relative(candidate.full),
      scenario: candidate.scenario,
      persona: summary.persona || summary.config?.persona || null,
      seed: summary.seed ?? null,
      duration: summary.duration ?? null,
      artifactQuality: compactArtifactQuality(summary.artifactQuality),
      endingStage: summary.state?.stage ?? null,
      lives: summary.state?.lives ?? null,
      score: summary.state?.score ?? null,
      losses: (summary.analysis?.shipLost || []).length,
      lossCauseCounts: summary.analysis?.lossCauseCounts || {},
      bulletPressure: summary.analysis?.bulletPressure?.overall || {},
      eventCounts: summary.analysis?.eventCounts || {},
      session: sessionPath ? relative(sessionPath) : null
    };
    runs.push(run);
    for(const loss of summary.analysis?.shipLost || []){
      losses.push(enrichLoss(loss, run, session || { events: [] }));
    }
  }

  const summary = summarizeRuns(runs, losses);
  const report = {
    schema_version: 1,
    artifact_type: 'aurora-stage4-pressure-risk-analysis',
    generatedAt: new Date().toISOString(),
    inputRoot: relative(inputRoot),
    sourceRunLimit: Number.isFinite(limit) && limit > 0 ? limit : null,
    branch: spawnSync('git', ['-C', ROOT, 'branch', '--show-current'], { encoding: 'utf8' }).stdout.trim(),
    commit: gitShortCommit(),
    summary,
    runs,
    losses,
    recommendedNextSteps: [
      'Promote the top loss signatures into deterministic loss-window scenarios before changing regular-stage collision or dive semantics.',
      'Add path-trace/contact-sheet extraction for boss and but dive losses around 12-19 seconds in Stage 4.',
      'Treat video-quality failures as harness evidence debt; usable-run thresholds should report artifact-quality reasons separately from gameplay failures.',
      'Tune only one lever at a time after the risk report identifies whether the dominant gap is boss dive path, but dive path, bullet timing, or player automation crossing behavior.'
    ]
  };

  ensureDir(outDir);
  const reportFile = path.join(outDir, 'report.json');
  const readmeFile = path.join(outDir, 'README.md');
  writeJson(reportFile, report);
  fs.writeFileSync(readmeFile, buildReadme(report));
  console.log(JSON.stringify({
    ok: true,
    outDir,
    report: reportFile,
    readme: readmeFile,
    summary
  }, null, 2));
}

main();
