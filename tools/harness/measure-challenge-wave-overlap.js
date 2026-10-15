#!/usr/bin/env node
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { createHash } = require('node:crypto');
const { execFileSync } = require('node:child_process');
const { ROOT, withHarnessPage } = require('./browser-check-util');
const { DIST_DEV } = require('../build/paths');

async function main(){
  const hash = file => createHash('sha256').update(fs.readFileSync(file)).digest('hex');
  const commit = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: ROOT, encoding: 'utf8' }).trim();
  const build = JSON.parse(fs.readFileSync(path.join(DIST_DEV, 'build-info.json'), 'utf8'));
  assert.equal(build.commit, commit);
  const bundleHash = hash(path.join(DIST_DEV, 'index.html'));
  const result = await withHarnessPage({ skipStart: true, stage: 31 }, async ({ page }) => page.evaluate(() => {
    const h = window.__galagaHarness__;
    h.start({ controlledClock: true, stageMode: 'display', startKind: 'challenge', challengeStage: 8,
      stage: 31, ships: 3, persona: null, expertPlays: 'human', playerTwo: false,
      autoVideo: false, seed: 9131, graphicsTheme: 'classic-arcade' });
    const initial = h.snapshot(), formation = h.challengeFormationState();
    const targets = new Map(formation.enemies.map(e => [e.id, { id: e.id, wave: e.wave, lane: e.lane,
      bounds: h.challengeSpriteBounds(e.id), visibleFrames: 0, fullFrames: 0,
      firstVisible: null, lastVisible: null, firstFull: null, longestFullFrames: 0, run: 0 }]));
    const waves = Array.from({ length: 5 }, (_, wave) => ({ wave, firstVisible: null,
      lastVisible: null, visibleFrames: 0, peakVisibleTargets: 0 }));
    const overlapFrames = [0, 0, 0, 0, 0, 0], samples = [];
    let maxEnemyBullets = 0, maxAttackers = 0, completed = false;
    for(let frame = 0; frame < 2700; frame++){
      const state = h.snapshot(), current = h.challengeFormationState();
      if(!state.challenge || !current.enemies.length){ completed = true; break; }
      maxEnemyBullets = Math.max(maxEnemyBullets, state.counts.enemyBullets);
      maxAttackers = Math.max(maxAttackers, state.counts.attackers);
      const visibleByWave = [0, 0, 0, 0, 0];
      const fullThisFrame = new Set();
      for(const e of current.enemies){
        const target = targets.get(e.id), b = target.bounds;
        if(!b)throw new Error('Missing sprite bounds');
        if(e.spawn > 0 && !e.referenceLeadIn)continue;
        const x = Math.round(e.x), y = Math.round(e.y);
        const visible = x + b.right > 0 && x + b.left < 280 && y + b.bottom > 0 && y + b.top < 360;
        const full = x + b.left >= 0 && x + b.right <= 280 && y + b.top >= 0 && y + b.bottom <= 360;
        if(visible){
          visibleByWave[e.wave]++;
          target.visibleFrames++;
          if(target.firstVisible === null)target.firstVisible = frame / 60;
          target.lastVisible = frame / 60;
        }
        if(full){
          fullThisFrame.add(e.id);
          target.fullFrames++;
          if(target.firstFull === null)target.firstFull = frame / 60;
        }
      }
      for(const target of targets.values()){
        target.run = fullThisFrame.has(target.id) ? target.run + 1 : 0;
        target.longestFullFrames = Math.max(target.longestFullFrames, target.run);
      }
      for(const wave of waves){
        const count = visibleByWave[wave.wave];
        if(count){
          if(wave.firstVisible === null)wave.firstVisible = frame / 60;
          wave.lastVisible = frame / 60;
          wave.visibleFrames++;
          wave.peakVisibleTargets = Math.max(wave.peakVisibleTargets, count);
        }
      }
      overlapFrames[visibleByWave.filter(count => count > 0).length]++;
      if(frame % 6 === 0)samples.push({ seconds: frame / 60, visibleByWave });
      h.advanceFor(1 / 60, { step: 1 / 60, stopOnGameOver: false });
    }
    return { initial, final: h.snapshot(), layout: formation.layout, targets: [...targets.values()],
      waves, overlapFrames, samples, completed, maxEnemyBullets, maxAttackers, events: h.sessionEvents(20000) };
  }));
  assert(result.completed);
  assert.equal(result.targets.length, 40);
  assert.equal(result.initial.stage, 31);
  assert.equal(result.initial.watchMode, false);
  assert.equal(result.layout.groups, 5);
  assert(!(result.layout.motionSpecGroups || []).some(group => Number.isFinite(group?.spawnOffsetS)),
    'Analytical offsets must not be shadowed by motion-spec offsets');
  assert(result.targets.every(t => t.fullFrames > 0));
  assert.equal(result.maxEnemyBullets, 0);
  assert.equal(result.maxAttackers, 0);
  assert.equal(result.final.lives, result.initial.lives);
  assert.equal(hash(path.join(DIST_DEV, 'index.html')), bundleHash);
  const referenceRelativeArrivals = [0, 3.8, 7.2, 10, 13.8];
  const proposal = result.waves.map((wave, index) => {
    const currentOffset = result.layout.groupSpawnOffsets?.[index] ?? index * result.layout.waveDelay;
    const desiredFirstVisible = result.waves[0].firstVisible + referenceRelativeArrivals[index];
    return { wave: index, currentOffset, desiredFirstVisible,
      proposedOffset: +(currentOffset + desiredFirstVisible - wave.firstVisible).toFixed(3) };
  });
  assert(proposal.every(row => Number.isFinite(row.proposedOffset) && row.proposedOffset >= 0));
  const out = path.join(ROOT, 'reference-artifacts/analyses/challenge-wave-overlap',
    `${new Date().toISOString().replace(/[:.]/g, '-')}-${commit.slice(0, 8)}`);
  fs.mkdirSync(out, { recursive: true });
  const report = { commit, build, bundleHash, methodHash: hash(__filename), result, proposal,
    method: 'Natural Stage31 challenge launch, stationary/no-fire, seed9131,60Hz; conservative open/closed pose union translated into280x360 playfield.',
    limitations: ['Geometry is not perceptual readability, pixel occlusion or routeability.',
      'Reference arrivals are provisional preview brackets, not authenticated wave correspondence.',
      'Proposal is analytical and unexecuted; scheduling may couple with global challenge time.',
      'No source gameplay edits or release acceptance.'] };
  fs.writeFileSync(path.join(out, 'report.json'), JSON.stringify(report, null, 2) + '\n');
  console.log(JSON.stringify({ out, waves: result.waves, overlapSeconds: result.overlapFrames.map(n => n / 60),
    minContinuousFullSeconds: Math.min(...result.targets.map(t => t.longestFullFrames / 60)), proposal }, null, 2));
}
main().catch(error => { console.error(error); process.exitCode = 1; });
