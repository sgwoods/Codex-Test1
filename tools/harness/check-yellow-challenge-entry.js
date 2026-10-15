#!/usr/bin/env node
const assert = require('assert/strict');
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const { createHash } = require('crypto');
const { ROOT, withHarnessPage, ensureLaneBuildFresh } = require('./browser-check-util');
const { DIST_DEV } = require('../build/paths');

async function main(){
  execFileSync(process.execPath, [path.join(ROOT, 'tools/build/build-index.js')], { cwd: ROOT, stdio: 'pipe' });
  ensureLaneBuildFresh(DIST_DEV);
  const commit = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: ROOT, encoding: 'utf8' }).trim();
  const hash = file => createHash('sha256').update(fs.readFileSync(file)).digest('hex');
  const results = [];
  for(const stage of [27, 31, 35, 39]){
    const result = await withHarnessPage({ stage, skipStart: true }, async ({ page }) => page.evaluate(stage => {
      const h = window.__galagaHarness__;
      h.start({ controlledClock: true, stageMode: 'display', startKind: 'challenge',
        challengeStage: (stage + 1) / 4, stage, ships: 3, persona: null,
        expertPlays: 'human', playerTwo: false, autoVideo: false, seed: 9100 + stage });
      const initial = h.challengeFormationState();
      const lives = h.snapshot().lives;
      const rows = new Map(initial.enemies.map(e => [e.id, { id: e.id, wave: e.wave,
        lane: e.lane, pathFamily: e.pathFamily, bounds: h.challengeSpriteBounds(e.id),
        fullFrames: 0, entryJoinSteps: [], exitJoinSteps: [], previous: null }]));
      const forbidden = new Map();
      let maximumEnemyBullets = 0, maximumAttackers = 0, shipLoss = false, completed = false;
      let frames = 0;
      for(; frames < 3600; frames++){
        h.advanceFor(1 / 60, { step: 1 / 60, stopOnGameOver: false });
        const state = h.snapshot();
        maximumEnemyBullets = Math.max(maximumEnemyBullets, state.counts.enemyBullets);
        maximumAttackers = Math.max(maximumAttackers, state.counts.attackers);
        shipLoss ||= state.lives !== lives;
        for(const event of h.recentEvents({ count: 200 })){
          if(['enemy_bullet_fired', 'enemy_attack_start', 'ship_lost', 'challenge_enemy_contact', 'player_shot'].includes(event.type)){
            forbidden.set(JSON.stringify(event), event);
          }
        }
        const formation = h.challengeFormationState();
        for(const e of formation.enemies){
          const row = rows.get(e.id);
          if(!row || e.spawn > 0) continue;
          const b = row.bounds;
          if(!b) throw new Error('Missing sprite bounds');
          if(Math.round(e.x) + b.left >= 0 && Math.round(e.x) + b.right <= 280 &&
            Math.round(e.y) + b.top >= 0 && Math.round(e.y) + b.bottom <= 360) row.fullFrames++;
          const u = e.tm + e.phaseOffsetS + e.lanePhaseOffsetS;
          if(row.previous && row.pathFamily === 'yellow-diagonal-fan'){
            for(const [boundary, key] of [[3.15, 'entryJoinSteps'], [9.7, 'exitJoinSteps']]){
              if(row.previous.u < boundary && u >= boundary){
                row[key].push({ from: row.previous, to: { x: e.x, y: e.y, u },
                  distance: Math.hypot(e.x - row.previous.x, e.y - row.previous.y) });
              }
            }
          }
          row.previous = { x: e.x, y: e.y, u };
        }
        if(!formation.enemies.length){ completed = true; break; }
      }
      const targets = [...rows.values()].map(({ previous, bounds, ...row }) => row);
      const contacts = [...forbidden.values()].filter(e => e.type === 'challenge_enemy_contact');
      const yellow = targets.filter(t => t.pathFamily === 'yellow-diagonal-fan');
      const geometricPassed = initial.stage === stage && targets.length === 40 && completed &&
        targets.every(t => t.fullFrames > 0) && yellow.length > 0 && yellow.every(t =>
          t.entryJoinSteps.length === 1 && [...t.entryJoinSteps, ...t.exitJoinSteps].every(s => s.distance < 12));
      const combatFree = !maximumEnemyBullets && !maximumAttackers && !shipLoss &&
        [...forbidden.values()].every(e => e.type === 'challenge_enemy_contact');
      const yellowSafetyPassed = combatFree && contacts.every(e => !yellow.some(t => t.id === e.id));
      return { stage, actualStage: initial.stage, expectedTargets: targets.length,
        geometricPassed, yellowSafetyPassed, globalSafetyPassed: combatFree && contacts.length === 0,
        initialSpawnDelays: initial.enemies.map(e => e.spawn), completed, elapsedSeconds: (frames + 1) / 60,
        missing: targets.filter(e => !e.fullFrames).map(e => e.id), targets,
        maximumEnemyBullets, maximumAttackers, shipLoss, forbiddenEvents: [...forbidden.values()] };
    }, stage));
    results.push(result);
  }
  const out = path.join(ROOT, 'reference-artifacts/analyses/yellow-challenge-entry',
    `${new Date().toISOString().replace(/[:.]/g, '-')}-${commit.slice(0, 8)}`);
  fs.mkdirSync(out, { recursive: true });
  const report = { commit, generatedAt: new Date().toISOString(),
    methodHash: hash(__filename), bundleHash: hash(path.join(DIST_DEV, 'index.html')),
    sourceHash: hash(path.join(ROOT, 'src/js/06-enemy-behavior.js')),
    method: 'Normal development challenge launch; original spawn delays; 60Hz no-input runtime; rendered sprite bounds and phase-boundary displacement.',
    limitations: ['Single seed per stage, not full playthrough or professional routeability.',
      '12px join threshold catches teleport-scale jumps; it is not a reference-derived speed limit.',
      'Exit joins may be unobserved when targets leave the playfield earlier.'], results };
  fs.writeFileSync(path.join(out, 'report.json'), JSON.stringify(report, null, 2) + '\n');
  // Validate every stage's geometry before enforcing the separate global safety gate.
  for(const r of results){
    assert.equal(r.actualStage, r.stage);
    assert.equal(r.expectedTargets, 40);
    assert(r.initialSpawnDelays.some(delay => delay > 0), 'Natural spawn delays must remain present');
    assert(r.completed, 'Challenge targets must finish');
    assert.equal(r.missing.length, 0, 'All targets must fully enter');
    assert.equal(r.maximumEnemyBullets, 0);
    assert.equal(r.maximumAttackers, 0);
    assert.equal(r.shipLoss, false);
    const yellow = r.targets.filter(t => t.pathFamily === 'yellow-diagonal-fan');
    assert(yellow.length > 0);
    for(const target of yellow){
      assert.equal(target.entryJoinSteps.length, 1, 'Every yellow entry join must be observed');
      for(const step of [...target.entryJoinSteps, ...target.exitJoinSteps]) assert(step.distance < 12, 'Phase join must not teleport');
    }
  }
  console.log(JSON.stringify({ geometricPassed: results.every(r => r.geometricPassed),
    yellowSafetyPassed: results.every(r => r.yellowSafetyPassed),
    globalSafetyPassed: results.every(r => r.globalSafetyPassed), out,
    stages: results.map(r => ({ stage: r.stage,
    targets: r.expectedTargets, missing: r.missing.length, maximumJoinStep: Math.max(...r.targets.flatMap(t => [...t.entryJoinSteps, ...t.exitJoinSteps].map(s => s.distance))) })) }, null, 2));
  assert(results.every(r => r.globalSafetyPassed), 'Global no-contact safety remains failed; see persisted per-stage verdicts');
}
main().catch(err => { console.error(err); process.exitCode = 1; });
