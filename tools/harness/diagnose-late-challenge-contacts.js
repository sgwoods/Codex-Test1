#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const { createHash } = require('crypto');
const { ROOT, withHarnessPage } = require('./browser-check-util');
const { DIST_DEV } = require('../build/paths');

async function main(){
  execFileSync(process.execPath, [path.join(ROOT, 'tools/build/build-index.js')], { cwd: ROOT, stdio: 'pipe' });
  const commit = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: ROOT, encoding: 'utf8' }).trim();
  const hash = file => createHash('sha256').update(fs.readFileSync(file)).digest('hex');
  const results = [];
  for(const stage of [31, 35, 39]){
    results.push(await withHarnessPage({ skipStart: true, stage }, async ({ page }) => page.evaluate(stage => {
      const h = window.__galagaHarness__;
      h.start({ controlledClock: true, stageMode: 'display', startKind: 'challenge',
        challengeStage: (stage + 1) / 4, stage, ships: 3, persona: null,
        expertPlays: 'human', playerTwo: false, autoVideo: false, seed: 9100 + stage });
      const initial = h.snapshot();
      const samples = [], contacts = new Map();
      const rows = new Map(h.challengeFormationState().enemies.map(e => [e.id, {
        id: e.id, pathFamily: e.pathFamily, bounds: h.challengeSpriteBounds(e.id),
        trajectory: [], fullFrames: 0, longestFullFrames: 0, currentFullFrames: 0,
        maximumSpeed: 0, crowdedFrames: 0, previous: null
      }]));
      let maximumEnemyBullets = 0, maximumAttackers = 0, completed = false;
      for(let frame = 0; frame < 3600; frame++){
        h.advanceFor(1 / 60, { step: 1 / 60, stopOnGameOver: false });
        const state = h.snapshot();
        maximumEnemyBullets = Math.max(maximumEnemyBullets, state.counts.enemyBullets);
        maximumAttackers = Math.max(maximumAttackers, state.counts.attackers);
        for(const event of h.recentEvents({ count: 200 })){
          if(event.type === 'challenge_enemy_contact') contacts.set(event.id, event);
        }
        const formation = h.challengeFormationState();
        for(const e of formation.enemies){
          if(e.spawn > 0) continue;
          const diagnostic = h.challengeContactDiagnostics(e.id);
          samples.push({ simT: state.simT, ...diagnostic });
          const row = rows.get(e.id), b = row.bounds;
          if(!b) throw new Error('Missing sprite bounds');
          const full = Math.round(e.x) + b.left >= 0 && Math.round(e.x) + b.right <= 280 &&
            Math.round(e.y) + b.top >= 0 && Math.round(e.y) + b.bottom <= 360;
          row.currentFullFrames = full ? row.currentFullFrames + 1 : 0;
          row.fullFrames += full ? 1 : 0;
          row.longestFullFrames = Math.max(row.longestFullFrames, row.currentFullFrames);
          if(row.previous) row.maximumSpeed = Math.max(row.maximumSpeed,
            Math.hypot(e.x - row.previous.x, e.y - row.previous.y) * 60);
          const crowded = full && formation.enemies.some(other => other.id !== e.id && other.spawn <= 0 &&
            Math.abs(other.x - e.x) < 16 && Math.abs(other.y - e.y) < 16);
          row.crowdedFrames += crowded ? 1 : 0;
          row.trajectory.push({ t: state.simT, x: e.x, y: e.y, u: diagnostic.u,
            phase: diagnostic.phase, bias: diagnostic.appliedBias, full,
            bodyOverlap: diagnostic.bodyOverlap, zeroBiasOverlap: diagnostic.sameFrameZeroBiasOverlap, crowded });
          row.previous = { x: e.x, y: e.y };
        }
        if(!formation.enemies.length){ completed = true; break; }
      }
      return { stage, initial, final: h.snapshot(), completed, maximumEnemyBullets,
        maximumAttackers, contacts: [...contacts.values()], samples,
        targets: [...rows.values()].map(({ previous, currentFullFrames, bounds, ...row }) => ({ ...row,
          fullSeconds: row.fullFrames / 60, longestFullSeconds: row.longestFullFrames / 60 })) };
    }, stage)));
  }
  const out = path.join(ROOT, 'reference-artifacts/analyses/late-challenge-contacts',
    `${new Date().toISOString().replace(/[:.]/g, '-')}-${commit.slice(0, 8)}`);
  fs.mkdirSync(out, { recursive: true });
  const report = { commit, generatedAt: new Date().toISOString(),
    methodHash: hash(__filename), bundleHash: hash(path.join(DIST_DEV, 'index.html')),
    sourceHashes: Object.fromEntries(['06-enemy-behavior.js', '90-harness.js', '05-player-combat.js'].map(f => [f, hash(path.join(ROOT, 'src/js', f))])),
    method: 'Normal challenge launch, 60Hz stationary human/no-fire. Every active target sampled throughout its runtime trajectory; no ship-band sampling filter.',
    limitations: ['Same-frame bias subtraction is a diagnostic, not a simulated alternate trajectory.',
      'Drawn pose union is an unrotated geometric estimate, not a pixel-overlap proof.',
      'Crowding means centers within 16px on both axes, not reference-derived readability or a scoreable shooting window.',
      'Zero-bias overlap remains same-frame subtraction, not a simulated candidate or accepted repair.',
      'Single seed per stage; primary Challenge 8 tracks censor the lower field; no separate reference for Challenges 9/10.'], results };
  fs.writeFileSync(path.join(out, 'report.json'), JSON.stringify(report, null, 2) + '\n');
  console.log(JSON.stringify({ out, stages: results.map(r => ({ stage: r.stage,
    contacts: r.contacts.length, completed: r.completed,
    contactSamples: r.samples.filter(s => s.bodyOverlap).map(s => ({ id: s.id,
      time: s.simT, path: s.pathFamily, u: s.u, phase: s.phase,
      y: s.y, preBiasY: s.preBiasY, bias: s.appliedBias,
      zeroBiasOverlap: s.sameFrameZeroBiasOverlap })) })) }, null, 2));
}
main().catch(err => { console.error(err); process.exitCode = 1; });
