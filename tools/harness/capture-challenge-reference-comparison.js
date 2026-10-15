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
  const out = path.join(ROOT, 'reference-artifacts/analyses/challenge-reference-comparison',
    `${new Date().toISOString().replace(/[:.]/g, '-')}-${commit.slice(0, 8)}`);
  fs.mkdirSync(out, { recursive: true });
  const results = [];
  for(const mode of ['professional', 'human']){
    const result = await withHarnessPage({ skipStart: true, stage: 31 }, async ({ page }) => page.evaluate(mode => {
      const h = window.__galagaHarness__;
      h.start({ controlledClock: true, stageMode: 'display', startKind: 'challenge',
        challengeStage: 8, stage: 31, ships: 3, persona: mode === 'professional' ? mode : null,
        expertPlays: mode, playerTwo: false, autoVideo: false, seed: 9131, graphicsTheme: 'classic-arcade' });
      const initial = h.snapshot(), atmosphere = h.state().visualAtmosphere;
      if(atmosphere.overrideThemeId !== 'classic-arcade')throw new Error('Theme mismatch');
      const captures = [], arrivals = new Map();
      for(let frame = 0; frame <= 1080; frame++){
        const formation = h.challengeFormationState();
        if(formation.challenge)for(const enemy of formation.enemies){
          if(enemy.spawn > 0)continue;
          if(!arrivals.has(enemy.id))arrivals.set(enemy.id, { id: enemy.id, wave: enemy.wave, lane: enemy.lane,
            firstCenterSeconds: null, firstPoseUnionSeconds: null });
          const arrival = arrivals.get(enemy.id);
          if(arrival.firstCenterSeconds === null && enemy.x >= 0 && enemy.x <= 280 && enemy.y >= 0 && enemy.y <= 360)arrival.firstCenterSeconds = frame / 60;
          if(arrival.firstPoseUnionSeconds === null){
            const bounds = h.challengeSpriteBounds(enemy.id);
            if(bounds && Math.round(enemy.x) + bounds.right > 0 && Math.round(enemy.x) + bounds.left < 280 &&
              Math.round(enemy.y) + bounds.bottom > 0 && Math.round(enemy.y) + bounds.top < 360)arrival.firstPoseUnionSeconds = frame / 60;
          }
        }
        if(frame % 30 === 0)captures.push({ frame, secondsSinceLaunch: frame / 60,
          snapshot: h.snapshot(), formation: h.challengeFormationState(),
          challengeResult: h.state().ch ? JSON.parse(JSON.stringify(h.state().ch)) : null,
          png: document.getElementById('c').toDataURL('image/png') });
        if(frame < 1080)h.advanceFor(1 / 60, { step: 1 / 60, stopOnGameOver: false });
      }
      return { mode, initial, atmosphere, final: h.snapshot(), captures, arrivals: [...arrivals.values()],
        events: h.sessionEvents(20000) };
    }, mode));
    for(const capture of result.captures){
      capture.file = `${mode}-${String(capture.frame).padStart(4, '0')}.png`;
      fs.writeFileSync(path.join(out, capture.file), Buffer.from(capture.png.split(',')[1], 'base64'));
      delete capture.png;
      capture.sha256 = hash(path.join(out, capture.file));
    }
    results.push(result);
  }
  assert.equal(hash(path.join(DIST_DEV, 'index.html')), bundleHash);
  const report = { commit, build, bundleHash, methodHash: hash(__filename), results,
    method: 'Natural developer Challenge 8 launch; single fighter, seed 9131, classic arcade; controlled 60Hz, half-second full-canvas samples for 18 seconds.',
    limitations: ['Professional is an Aurora pilot, not a matched original player input.',
      'Human condition is stationary/no-fire, not matched to perfect-play footage.',
      'Half-second samples do not prove full-entry dwell or complete routes; event history may be bounded.',
      'Arrival ledger uses60Hz centers and a conservative two-pose sprite union, not exact rendered-pixel onset.',
      'No audio, routeability, conformance or release acceptance is implied.'] };
  fs.writeFileSync(path.join(out, 'report.json'), JSON.stringify(report, null, 2) + '\n');
  console.log(JSON.stringify({ out, modes: results.map(r => ({ mode: r.mode, initial: r.initial, final: r.final, captures: r.captures.length })) }));
}
main().catch(error => { console.error(error); process.exitCode = 1; });
