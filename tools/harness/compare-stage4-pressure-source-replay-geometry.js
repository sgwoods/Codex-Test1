#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..', '..');
const LOSS_ROOT = path.join(ROOT, 'reference-artifacts', 'analyses', 'aurora-stage4-loss-windows');
const GEOMETRY_ROOT = path.join(ROOT, 'reference-artifacts', 'analyses', 'aurora-stage4-pressure-geometry');
const OUT_ROOT = path.join(ROOT, 'reference-artifacts', 'analyses', 'aurora-stage4-pressure-source-replay-comparison');

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

function latestReport(root){
  if(!fs.existsSync(root)) return null;
  const candidates = fs.readdirSync(root)
    .map(name => path.join(root, name, 'report.json'))
    .filter(file => fs.existsSync(file))
    .map(file => ({ file, mtime: fs.statSync(file).mtimeMs }))
    .sort((a, b) => b.mtime - a.mtime);
  return candidates[0]?.file || null;
}

function compact(value){
  return Number.isFinite(+value) ? +(+value).toFixed(3) : null;
}

function laneFor(x){
  const clamped = Math.max(0, Math.min(280, +x || 0));
  return Math.max(0, Math.min(9, Math.round((clamped / 280) * 9)));
}

function enemyDims(type){
  if(type === 'boss') return { w: 38, h: 30 };
  if(type === 'but') return { w: 34, h: 27 };
  if(type === 'rogue') return { w: 35, h: 28 };
  return { w: 32, h: 26 };
}

function enemyCollisionHitbox(type, dive, stage = 4, challenge = false){
  const d = enemyDims(type);
  const scale = challenge ? 0.18 : (stage === 4 ? (dive === 1 ? 0.11 : 0.095) : stage >= 5 ? (dive === 1 ? 0.14 : 0.12) : 0.18);
  return { w: d.w * scale, h: d.h * scale };
}

function sourceContact(loss){
  if(!loss) return null;
  const playerX = +loss.playerX;
  const playerY = 340;
  const enemyX = +loss.enemyX;
  const enemyY = +loss.enemyY;
  const he = enemyCollisionHitbox(loss.sourceType, loss.sourceDive, 4, false);
  const hp = { w: 7, h: 6 };
  const dx = Math.abs(enemyX - playerX);
  const dy = Math.abs(enemyY - playerY);
  const marginX = dx - (he.w + hp.w);
  const marginY = dy - (he.h + hp.h);
  return {
    stageClock: compact(loss.stageClock),
    enemyId: loss.enemyId ?? null,
    type: loss.sourceType || null,
    column: loss.sourceColumn ?? null,
    lane: loss.sourceLane ?? null,
    dive: loss.sourceDive ?? null,
    player: {
      x: compact(playerX),
      y: compact(playerY),
      lane: loss.playerLane ?? laneFor(playerX)
    },
    x: compact(enemyX),
    y: compact(enemyY),
    dx: compact(dx),
    dy: compact(dy),
    marginX: compact(marginX),
    marginY: compact(marginY),
    contactScore: compact(Math.max(marginX, marginY)),
    colliding: marginX < 0 && marginY < 0,
    hitBeforeCollision: !!loss.hitBeforeCollision
  };
}

function bestTarget(sample, key){
  const targets = sample?.[key] || [];
  return targets.length ? targets.slice().sort((a, b) => a.contactScore - b.contactScore)[0] : null;
}

function bestReplayThreat(samples){
  const candidates = [];
  for(const sample of samples || []){
    const expected = bestTarget(sample, 'expectedTargets');
    const lane = bestTarget(sample, 'laneTargets');
    if(expected) candidates.push(Object.assign({ kind: 'expectedTarget', stageClock: sample.stageClock, player: sample.player }, expected));
    if(lane) candidates.push(Object.assign({ kind: 'laneThreat', stageClock: sample.stageClock, player: sample.player }, lane));
  }
  return candidates.length ? candidates.sort((a, b) => a.contactScore - b.contactScore)[0] : null;
}

function nearestSample(samples, stageClock){
  return (samples || []).slice().sort((a, b) => Math.abs(a.stageClock - stageClock) - Math.abs(b.stageClock - stageClock))[0] || null;
}

function sourceSessionFile(runDir){
  const dir = path.resolve(ROOT, runDir || '');
  if(!fs.existsSync(dir)) return null;
  const file = fs.readdirSync(dir).find(name => /^neo-galaga-session.*\.json$/.test(name) && !name.includes('system-status'));
  return file ? path.join(dir, file) : null;
}

function compactEvent(event){
  return {
    t: compact(event.t),
    type: event.type || '',
    id: event.id ?? null,
    enemyId: event.enemyId ?? null,
    enemyType: event.enemyType || null,
    column: event.column ?? null,
    lane: event.lane ?? event.enemyLane ?? null,
    playerLane: event.playerLane ?? null,
    x: compact(event.x ?? event.playerX),
    y: compact(event.y ?? event.enemyY ?? event.bulletY),
    enemyX: compact(event.enemyX),
    enemyY: compact(event.enemyY),
    cause: event.cause || null
  };
}

function sourceTrail(loss){
  const file = sourceSessionFile(loss?.runDir);
  if(!file) return { session: null, events: [] };
  const session = readJson(file).session;
  const t = +loss.stageClock || +loss.t || 0;
  const id = loss.enemyId;
  const events = (session.events || [])
    .filter(event => event.t >= t - 0.9 && event.t <= t + 0.35)
    .filter(event => (
      event.type === 'player_shot' ||
      event.type === 'ship_lost' ||
      event.id === id ||
      event.enemyId === id ||
      event.type === 'enemy_lower_field' ||
      event.type === 'enemy_bullet_fired'
    ))
    .map(compactEvent);
  return { session: rel(file), events };
}

function classifyWindow({ source, replayAtLossExpected, replayAtLossLane, replayBest }){
  if(!replayBest) return 'fresh replay did not expose a comparable attacker or lane threat';
  if(replayBest.colliding) return 'fresh replay reached collision geometry; mismatch is likely export/signature timing';
  if(replayBest.contactScore <= 4) return 'fresh replay nearly reproduced the source pressure; small drift could decide the loss';
  if(replayBest.contactScore <= 12) return 'fresh replay preserved close pressure but stayed outside collision bounds';
  const expected = replayAtLossExpected || {};
  if(source?.y >= 300 && expected.y != null && expected.y < 120){
    return 'expected source attacker is phase-diverged in fresh replay, staying high while source was in the player band';
  }
  if(replayAtLossLane?.player?.lane != null && source?.player?.lane != null && Math.abs(replayAtLossLane.player.lane - source.player.lane) >= 2){
    return 'fresh replay player lane diverged from the source loss lane';
  }
  return 'fresh replay path geometry diverged enough to remove the source collision';
}

function compareWindow(lossResult, geometryResult){
  const sourceLoss = lossResult.source.representativeLoss;
  const source = sourceContact(sourceLoss);
  const samples = geometryResult.samples || [];
  const atLoss = nearestSample(samples, source?.stageClock || 0);
  const replayAtLossExpected = bestTarget(atLoss, 'expectedTargets');
  const replayAtLossLane = bestTarget(atLoss, 'laneTargets');
  const replayBest = bestReplayThreat(samples);
  const trail = sourceTrail(sourceLoss);
  return {
    id: lossResult.id,
    scenario: lossResult.scenario,
    source: {
      runDir: sourceLoss.runDir,
      session: trail.session,
      contact: source,
      trail: trail.events
    },
    replay: {
      sampleWindow: geometryResult.sampleWindow,
      sampleCount: samples.length,
      nearestAtSourceLoss: atLoss ? {
        stageClock: atLoss.stageClock,
        player: atLoss.player,
        expectedTarget: replayAtLossExpected,
        laneThreat: replayAtLossLane
      } : null,
      bestThreat: replayBest,
      geometrySummary: geometryResult.summary
    },
    deltas: {
      sourceToReplayBestContactScore: replayBest && source ? compact(replayBest.contactScore - source.contactScore) : null,
      sourceToReplayAtLossExpectedContactScore: replayAtLossExpected && source ? compact(replayAtLossExpected.contactScore - source.contactScore) : null,
      sourceToReplayAtLossLaneContactScore: replayAtLossLane && source ? compact(replayAtLossLane.contactScore - source.contactScore) : null,
      replayBestTimingDelta: replayBest && source ? compact(replayBest.stageClock - source.stageClock) : null,
      replayAtLossPlayerLaneDelta: atLoss?.player && source?.player ? atLoss.player.lane - source.player.lane : null,
      replayAtLossPlayerXDelta: atLoss?.player && source?.player ? compact(atLoss.player.x - source.player.x) : null
    },
    diagnosis: classifyWindow({ source, replayAtLossExpected, replayAtLossLane, replayBest })
  };
}

function buildReadme(report){
  const lines = [
    '# Aurora Stage 4 Source vs Replay Geometry',
    '',
    `Generated: \`${report.generatedAt}\``,
    '',
    '## Problem',
    '',
    'Archived Stage 4 pressure losses are real, but current fresh replay probes often miss the loss. We need to know whether the miss comes from attacker phase, player lane drift, or preserved-but-nonlethal near pressure.',
    '',
    '## Strategy',
    '',
    'Compare each representative source loss geometry against the nearest and strongest sampled fresh-replay geometry from the promoted Stage 4 pressure windows.',
    '',
    '## Success Measure',
    '',
    'Every promoted window receives a source/replay delta and a divergence diagnosis before gameplay constants are tuned.',
    '',
    '## Results',
    ''
  ];
  for(const result of report.results){
    const source = result.source.contact;
    const best = result.replay.bestThreat;
    lines.push(`### ${result.id}`);
    lines.push(`- Source contact score: ${source?.contactScore} at t=${source?.stageClock}`);
    lines.push(`- Replay best contact score: ${best?.contactScore ?? 'n/a'} at t=${best?.stageClock ?? 'n/a'} (${best?.kind || 'none'})`);
    lines.push(`- Replay best timing delta: ${result.deltas.replayBestTimingDelta ?? 'n/a'}`);
    lines.push(`- Replay player lane delta at source loss time: ${result.deltas.replayAtLossPlayerLaneDelta ?? 'n/a'}`);
    lines.push(`- Diagnosis: ${result.diagnosis}`);
    lines.push('');
  }
  lines.push('## Recommended Next Step');
  lines.push('');
  const near = report.results.filter(result => result.replay.bestThreat && result.replay.bestThreat.contactScore <= 12);
  const far = report.results.filter(result => !result.replay.bestThreat || result.replay.bestThreat.contactScore > 12);
  if(near.length){
    lines.push(`- Preserve and refine close-pressure windows first: ${near.map(result => `\`${result.id}\``).join(', ')}.`);
  }
  if(far.length){
    lines.push(`- Improve deterministic replay/action sampling before treating high-divergence windows as gameplay tuning targets: ${far.map(result => `\`${result.id}\``).join(', ')}.`);
  }
  if(!near.length && !far.length){
    lines.push('- No promoted windows were classified for follow-up.');
  }
  lines.push('');
  return `${lines.join('\n')}\n`;
}

function main(){
  const lossFile = latestReport(LOSS_ROOT);
  const geometryFile = latestReport(GEOMETRY_ROOT);
  if(!lossFile) fail('no Stage 4 loss-window report found', { root: LOSS_ROOT });
  if(!geometryFile) fail('no Stage 4 geometry report found', { root: GEOMETRY_ROOT });
  const lossReport = readJson(lossFile);
  const geometryReport = readJson(geometryFile);
  const geometryById = new Map((geometryReport.results || []).map(result => [result.id, result]));
  const results = (lossReport.results || []).map(result => {
    const geometry = geometryById.get(result.id);
    if(!geometry) fail('geometry report missing promoted window', { id: result.id, geometryFile });
    return compareWindow(result, geometry);
  });
  const report = {
    schema_version: 1,
    artifact_type: 'aurora-stage4-pressure-source-replay-comparison',
    generatedAt: new Date().toISOString(),
    branch: git(['branch', '--show-current']),
    commit: shortCommit(),
    sourceLossReport: rel(lossFile),
    sourceGeometryReport: rel(geometryFile),
    problem: 'Stage 4 pressure source losses must be compared with fresh replay geometry before gameplay constants are changed.',
    strategy: 'Compute source collision geometry from representative archived loss events and compare it with nearest and strongest fresh replay geometry samples.',
    successMeasure: 'Every promoted Stage 4 window receives a source/replay geometry delta and divergence diagnosis.',
    results
  };
  report.summary = {
    totalWindows: results.length,
    comparedWindows: results.filter(result => result.source.contact && result.replay.bestThreat).length,
    nearReplayWindows: results.filter(result => result.replay.bestThreat && result.replay.bestThreat.contactScore <= 12).length,
    sourceCollisionWindows: results.filter(result => result.source.contact?.colliding).length
  };
  report.ok = report.summary.comparedWindows === report.summary.totalWindows;

  const outDir = path.join(OUT_ROOT, `${new Date().toISOString().slice(0, 10)}-${shortCommit()}`);
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
      sourceContactScore: result.source.contact?.contactScore ?? null,
      replayBestContactScore: result.replay.bestThreat?.contactScore ?? null,
      replayBestTimingDelta: result.deltas.replayBestTimingDelta,
      replayAtLossPlayerLaneDelta: result.deltas.replayAtLossPlayerLaneDelta,
      diagnosis: result.diagnosis
    }))
  }, null, 2));

  if(!report.ok) process.exit(1);
}

main();
