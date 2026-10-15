#!/usr/bin/env node
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { createHash } = require('node:crypto');
const { execFileSync } = require('node:child_process');
const { gzipSync } = require('node:zlib');
const { ROOT, withHarnessPage } = require('./browser-check-util');
const { DIST_DEV } = require('../build/paths');
const OFFSETS = [0, 3.593, 7.137, 9.997, 13.79];
const NATURAL = process.argv.includes('--natural');

async function runTrial(stage, candidate, persona='human'){
  return withHarnessPage({ skipStart: true, stage }, async ({ page }) => page.evaluate(({ stage, candidate, offsets, natural, persona }) => {
    const h = window.__galagaHarness__;
    h.start({ controlledClock: true, stageMode: 'display', startKind: 'challenge',
      challengeStage: (stage + 1) / 4, stage, ships: 3, persona: persona === 'human' ? null : persona, expertPlays: persona,
      playerTwo: false, autoVideo: false, seed: 9100 + stage, graphicsTheme: 'classic-arcade',
      ...(natural && stage===31 ? { challengeScheduleTrial: { stage: 31,
        groupSpawnOffsets: candidate ? offsets : [0,.86,1.72,2.58,3.44] } } : {}) });
    if(!natural)h.setupChallengeMotionProfileTest({ stage, layoutOverride: candidate ? { groupSpawnOffsets: offsets } : undefined });
    const initial = h.snapshot(), formation = h.challengeFormationState();
    if(candidate && JSON.stringify(formation.layout.groupSpawnOffsets) !== JSON.stringify(offsets))throw new Error('Candidate override did not apply');
    const targets = new Map(formation.enemies.map(e => [e.id, { id: e.id, wave: e.wave, lane: e.lane,
      bounds: h.challengeSpriteBounds(e.id), config: e, trace: [], fullFrames: 0,
      run: 0, longestFullFrames: 0, firstVisible: null }]));
    const overlapFrames = [0, 0, 0, 0, 0, 0], captures = [];
    let clear = null, spawn = null, maximumEnemyBullets = 0, maximumAttackers = 0;
    let firstArrival = null, lastVisible = null;
    let idleFrames = 0, idleRun = 0, maxIdleFrames = 0;
    for(let frame = 0; frame < 3000; frame++){
      const snap = h.snapshot(), current = h.challengeFormationState();
      const visible = [0, 0, 0, 0, 0], fullIds = new Set();
      if(snap.challenge){
        maximumEnemyBullets = Math.max(maximumEnemyBullets, snap.counts.enemyBullets);
        maximumAttackers = Math.max(maximumAttackers, snap.counts.attackers);
        for(const e of current.enemies){
          if(e.spawn > 0 && !e.referenceLeadIn)continue;
          const target = targets.get(e.id), b = target.bounds, x = Math.round(e.x), y = Math.round(e.y);
          target.trace.push({ tm: e.tm, x: e.x, y: e.y });
          if(x + b.right > 0 && x + b.left < 280 && y + b.bottom > 0 && y + b.top < 360){
            visible[e.wave]++;
            if(target.firstVisible === null)target.firstVisible = frame / 60;
            if(firstArrival === null)firstArrival = frame / 60;
            lastVisible = frame / 60;
          }
          if(x + b.left >= 0 && x + b.right <= 280 && y + b.top >= 0 && y + b.bottom <= 360){
            fullIds.add(e.id); target.fullFrames++;
          }
        }
        for(const t of targets.values()){
          t.run = fullIds.has(t.id) ? t.run + 1 : 0;
          t.longestFullFrames = Math.max(t.longestFullFrames, t.run);
        }
        if(current.enemies.length){
          const visibleWaves = visible.filter(n => n > 0).length;
          overlapFrames[visibleWaves]++;
          if(firstArrival !== null && !visibleWaves){idleFrames++; idleRun++; maxIdleFrames=Math.max(maxIdleFrames,idleRun)}
          else idleRun=0;
        }
      }
      if(stage === 31 && frame % 120 === 0 && snap.challenge && captures.length < 15){
        captures.push({ seconds: frame / 60, visible, png: document.getElementById('c').toDataURL('image/png') });
      }
      const events = h.sessionEvents(20000);
      clear = events.find(e => e.type === 'challenge_clear' && e.stage === stage) || clear;
      spawn = events.find(e => e.type === 'challenge_transition_spawn_commit' && e.stage === stage) || spawn;
      if(spawn)break;
      h.advanceFor(1 / 60, { step: 1 / 60, stopOnGameOver: false });
    }
    return { stage, candidate, persona, natural, initial, final: h.snapshot(), layout: formation.layout,
      targets: [...targets.values()], overlapFrames, captures, clear, spawn,
      firstArrival, lastVisible, maximumEnemyBullets, maximumAttackers, idleSeconds: idleFrames/60, maxIdleSeconds: maxIdleFrames/60,
      events: h.sessionEvents(20000), audioHistory: h.audioHistory(200) };
  }, { stage, candidate, offsets: OFFSETS, natural: NATURAL, persona }));
}

function compare(baseline, candidate){
  const pairs = baseline.targets.map(t => [t, candidate.targets.find(c => c.wave === t.wave && c.lane === t.lane)]);
  let maxPositionDelta = 0, maxLocalTimeDelta = 0, unmatchedTraceLengths = 0;
  let matchedSamples = 0, baselineSamples = 0, candidateSamples = 0;
  let minimumTargetCoverage = 1, duplicateLocalKeys = 0, maxSpawnDeltaError = 0;
  let shortestDwellDeltaFrames = Infinity;
  for(const [a, b] of pairs){
    assert(b);
    const stripSpawn = row => Object.fromEntries(Object.entries(row).filter(([key]) => !['spawn', 'spawnPlan'].includes(key)));
    assert.deepEqual(stripSpawn(a.config), stripSpawn(b.config), 'Non-spawn target configuration changed');
    const oldOffset = baseline.layout.groupSpawnOffsets?.[a.wave] ?? a.wave * baseline.layout.waveDelay;
    const newOffset = candidate.layout.groupSpawnOffsets?.[a.wave] ?? a.wave * candidate.layout.waveDelay;
    maxSpawnDeltaError = Math.max(maxSpawnDeltaError, Math.abs((b.config.spawnPlan - a.config.spawnPlan) - (newOffset - oldOffset)));
    if(a.trace.length !== b.trace.length)unmatchedTraceLengths++;
    shortestDwellDeltaFrames = Math.min(shortestDwellDeltaFrames, b.longestFullFrames - a.longestFullFrames);
    const indexed = new Map(b.trace.filter(p => p.tm > 0).map(p => [p.tm.toFixed(3), p]));
    duplicateLocalKeys += b.trace.filter(p => p.tm > 0).length - indexed.size;
    duplicateLocalKeys += a.trace.filter(p => p.tm > 0).length - new Set(a.trace.filter(p => p.tm > 0).map(p => p.tm.toFixed(3))).size;
    let targetMatches = 0;
    baselineSamples += a.trace.filter(p => p.tm > 0).length;
    candidateSamples += b.trace.filter(p => p.tm > 0).length;
    for(const p of a.trace.filter(p => p.tm > 0)){
      const q = indexed.get(p.tm.toFixed(3));
      if(!q)continue;
      matchedSamples++;
      targetMatches++;
      maxLocalTimeDelta = Math.max(maxLocalTimeDelta, Math.abs(p.tm - q.tm));
      maxPositionDelta = Math.max(maxPositionDelta, Math.hypot(p.x - q.x, p.y - q.y));
    }
    minimumTargetCoverage = Math.min(minimumTargetCoverage,
      targetMatches / Math.max(a.trace.filter(p => p.tm > 0).length, b.trace.filter(p => p.tm > 0).length));
  }
  return { maxPositionDelta, maxLocalTimeDelta, unmatchedTraceLengths, shortestDwellDeltaFrames,
    matchedSamples, baselineSamples, candidateSamples,
    minimumTargetCoverage, duplicateLocalKeys, maxSpawnDeltaError,
    localMatchCoverage: matchedSamples / Math.max(baselineSamples, candidateSamples),
    baselineOverlapSeconds: baseline.overlapFrames.map(n => n / 60),
    candidateOverlapSeconds: candidate.overlapFrames.map(n => n / 60),
    baselineCadence: baseline.spawn && baseline.clear ? baseline.spawn.t - baseline.clear.t : null,
    candidateCadence: candidate.spawn && candidate.clear ? candidate.spawn.t - candidate.clear.t : null,
    baselineDuration: baseline.clear?.t, candidateDuration: candidate.clear?.t };
}

async function main(){
  const hash = file => createHash('sha256').update(fs.readFileSync(file)).digest('hex');
  const commit = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: ROOT, encoding: 'utf8' }).trim();
  const build = JSON.parse(fs.readFileSync(path.join(DIST_DEV, 'build-info.json'), 'utf8'));
  assert.equal(build.commit, commit);
  const bundleHash = hash(path.join(DIST_DEV, 'index.html'));
  const sourceFiles = ['06-enemy-behavior.js', '09-stage-flow.js', '13-aurora-game-pack.js', '13-gameplay-adapter-registry.js', '90-harness.js'];
  const sourceHashes = Object.fromEntries(sourceFiles.map(f => [f, hash(path.join(ROOT, 'src/js', f))]));
  const baseline = await runTrial(31, false), candidate = await runTrial(31, true);
  const professional = NATURAL ? { baseline: await runTrial(31,false,'professional'), candidate: await runTrial(31,true,'professional') } : null;
  const stage3A = await runTrial(3, false), stage3B = await runTrial(3, false);
  const comparison = compare(baseline, candidate), stage3Repeat = compare(stage3A, stage3B);
  const out = path.join(ROOT, 'reference-artifacts/analyses/challenge-wave-schedule-trial',
    `${new Date().toISOString().replace(/[:.]/g, '-')}-${commit.slice(0, 8)}`);
  fs.mkdirSync(out, { recursive: true });
  for(const r of [baseline, candidate, ...(professional ? [professional.baseline, professional.candidate] : [])])for(const capture of r.captures){
    capture.file = `${r.persona}-${r.candidate ? 'candidate' : 'baseline'}-${capture.seconds}s.png`;
    fs.writeFileSync(path.join(out, capture.file), Buffer.from(capture.png.split(',')[1], 'base64'));
    delete capture.png; capture.sha256 = hash(path.join(out, capture.file));
  }
  assert.equal(hash(path.join(DIST_DEV, 'index.html')), bundleHash);
  for(const [f, expected] of Object.entries(sourceHashes))assert.equal(hash(path.join(ROOT, 'src/js', f)), expected);
  const checks = { entry: [baseline, candidate].every(r => r.targets.length === 40 && r.targets.every(t => t.fullFrames > 0)),
    safety: [baseline, candidate].every(r => r.maximumEnemyBullets === 0 && r.maximumAttackers === 0 && r.final.lives === r.initial.lives),
    localMotion: comparison.maxPositionDelta <= .001 && comparison.maxLocalTimeDelta <= .001 && comparison.minimumTargetCoverage >= .99 && comparison.duplicateLocalKeys === 0,
    scheduleApplied: comparison.maxSpawnDeltaError <= .010001,
    dwell: comparison.shortestDwellDeltaFrames >= 0,
    cadence: Math.abs((comparison.candidateCadence || 0) - 4.433) < .05 &&
      Math.abs((comparison.baselineCadence || 0) - (comparison.candidateCadence || 0)) < .05,
    stage3Repeat: stage3Repeat.maxPositionDelta === 0 && stage3Repeat.unmatchedTraceLengths === 0 };
  const report = { commit, build, bundleHash, sourceHashes, methodHash: hash(__filename), offsets: OFFSETS,
    baseline, candidate, professional, comparison, stage3Repeat, checks,
    limitations: [NATURAL ? 'Natural developer start with exact-stage development-only schedule launch configuration; no motion-profile normalization.' : 'Both conditions use the existing motion-profile hook after start; it regenerates targets and normalizes first-arrival delay. This is not a natural-launch override test.',
      'Motion compares common positive local-tm samples rounded to1ms, requiring >=99% coverage; unmatched removal-boundary samples remain reported.',
      'Spawn-plan readbacks are rounded to0.01s by the existing API; differences allow the combined0.01s rounding bound, while effective layout offsets are checked exactly.',
      'Stage3 repeat is a deterministic control, not a candidate override test on Stage3.',
      'Audio event history is not audible or canonical private-phrase verification.',
      'Provisional reference wave correspondence; no multi-seed routeability, fidelity or release acceptance.'] };
  fs.writeFileSync(path.join(out, 'report.json.gz'), gzipSync(JSON.stringify(report)));
  console.log(JSON.stringify({ out, comparison, stage3Repeat, checks,
    idle: { baseline: baseline.idleSeconds, candidate: candidate.idleSeconds, candidateMax: candidate.maxIdleSeconds },
    professional: professional ? Object.fromEntries(Object.entries(professional).map(([k,r])=>[k,{hits:r.clear?.hits,total:r.clear?.total,clear:r.clear?.t,idle:r.idleSeconds,maxIdle:r.maxIdleSeconds}])) : null }, null, 2));
  if(!Object.values(checks).every(Boolean))process.exitCode = 1;
}
main().catch(error => { console.error(error); process.exitCode = 1; });
