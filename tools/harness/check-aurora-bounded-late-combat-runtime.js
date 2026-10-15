#!/usr/bin/env node
const assert = require('assert/strict');
const fs = require('fs');
const path = require('path');
const { createHash } = require('crypto');
const { execFileSync } = require('child_process');
const { ROOT, withHarnessPage } = require('./browser-check-util');
const { DIST_DEV } = require('../build/paths');
const hash = value => createHash('sha256').update(value).digest('hex');

async function main(){
 const html = fs.readFileSync(path.join(DIST_DEV, 'index.html'), 'utf8');
 const capped = 'const combatEffectiveStage=stage=>Math.min(stage,30);';
 assert.equal(html.split(capped).length, 2, 'Exact candidate ceiling in built bundle');
 const comparison = html.replace(capped, 'const combatEffectiveStage=stage=>stage;');
 function instrument(bundle){
  const changes = [
   [' sfx.enemyShot();', " window.__boundedProbe?.bullets.push({stage:S.stage,clock:S.stageClock,kind,vx,vy});\n sfx.enemyShot();"],
   [" logEvent('enemy_attack_start',", " window.__boundedProbe?.launches.push({stage:S.stage,clock:S.stageClock,cooldown:e.cool,mode});\n logEvent('enemy_attack_start',"],
   ['function spawnStage(state){', 'window.__boundedSpawnStage=spawnStage;\nfunction spawnStage(state){'],
   ['function updateEnemyBullets(state,dt,p){', 'function updateEnemyBullets(state,dt,p){\n if(window.__boundedProbe)window.__boundedProbe.updateCalls++;']
  ];
  for(const [from, to] of changes){ assert.equal(bundle.split(from).length, 2); bundle = bundle.replace(from, to); }
  return bundle;
 }
 const results = [], errors = [];
 for(const original of [true, false]){
  for(const stage of [30, 32, 62, 126, 3, 31, 35, 39]){
   const challenge = [3, 31, 35, 39].includes(stage);
   const result = await withHarnessPage({ skipStart: true }, async ({ page }) => {
    {
     await page.route('**/index.html', route => route.fulfill({ contentType: 'text/html', body: instrument(original ? comparison : html) }));
     await page.reload({ waitUntil: 'domcontentloaded' });
     await page.waitForFunction(() => !!window.__galagaHarness__);
    }
    const pageErrors = [];
    page.on('pageerror', error => pageErrors.push(String(error)));
    const r = await page.evaluate(({ stage, challenge }) => {
     const h = window.__galagaHarness__, seed = 18000 + stage, dt = 1 / 60;
     h.start({ controlledClock: true, stageMode: 'internal', stage: Math.min(stage, 99),
      startKind: challenge ? 'challenge' : 'level', challengeStage: (stage + 1) / 4,
      ships: 9, persona: challenge ? null : 'professional', expertPlays: 'human',
      playerTwo: false, autoVideo: false, seed });
     const state = currentAuroraRuntimeState();
     if(stage > 99){ state.stage = stage; window.__boundedSpawnStage(state); }
     const initial = h.state();
     const bullets = [], launches = [], samples = [], progression = [];
     window.__boundedProbe = { bullets, launches, updateCalls: 0 };
     let updates = 0, maxUpdateError = 0, ticks = 0;
     try{
      for(; ticks < 3600; ticks++){
       const s = currentAuroraRuntimeState();
       const previous = s.eb.map(b => ({ b, x: b.x, y: b.y, vx: b.vx, vy: b.vy }));
       const updateCalls = window.__boundedProbe.updateCalls;
       h.advanceFor(dt, { step: dt, stopOnGameOver: true });
       const now = h.state();
       for(const row of previous){
        if(window.__boundedProbe.updateCalls > updateCalls && s.eb.includes(row.b)){
         updates++;
         maxUpdateError = Math.max(maxUpdateError, Math.abs(row.b.x - row.x - row.vx * dt),
          Math.abs(row.b.y - row.y - row.vy * dt));
        }
       }
       if(ticks % 60 === 0)samples.push({ stage: s.stage, clock: s.stageClock, simT: s.simT,
        score: s.score, lives: s.lives, bullets: s.eb.map(b => ({ x: b.x, y: b.y, vx: b.vx, vy: b.vy })),
        enemies: s.e.map(e => ({ id: e.id, hp: e.hp, x: e.x, y: e.y, cool: e.cool, dive: e.dive })) });
       if(now.stage !== stage){ progression.push({ stage: now.stage, clock: now.stageClock, simT: now.simT }); break; }
       if(!now.started)break;
      }
     }finally{ delete window.__boundedProbe; }
     return { stage, challenge, seed, initial, ticks, elapsed: (ticks + 1) * dt,
      final: h.state(), bullets, launches, samples, progression, updates, maxUpdateError,
      setup: stage > 99 ? 'Actual runtime stage assignment followed by spawnStage; launch UI capped at99.' : 'Harness fresh start.' };
    }, { stage, challenge });
    return { ...r, pageErrors };
   });
   results.push({ variant: original ? 'uncapped-comparison' : 'candidate', ...result });
  }
 }
 function check(fn){ try{ fn(); }catch(error){ errors.push(String(error)); } }
 for(const r of results){
  check(() => {
   assert.equal(r.initial.stage, r.stage); assert.equal(r.initial.challenge, r.challenge);
   assert.equal(r.initial.seed, r.seed); assert.equal(r.pageErrors.length, 0);
   if(r.challenge){
    assert.equal(r.bullets.length, 0); assert.equal(r.launches.length, 0);
    assert.equal(r.progression[0]?.stage, r.stage + 1, 'Natural challenge progression');
   }else{
    assert(r.bullets.length > 0); assert(r.launches.length > 0); assert(r.updates > 0);
    assert(r.maxUpdateError < 1e-9, 'Real retained projectile displacement');
    if(r.variant === 'candidate'){
     r.bullets.forEach(b => assert(Number.isFinite(b.vy) && b.vy > 0 && b.vy <= 301));
     const assigned = r.launches.filter(a => a.mode === 'dive' || a.mode === 'capture');
     assert(assigned.length > 0, 'New cooldown assignment observed');
     assigned.forEach(a => assert(Number.isFinite(a.cooldown) && a.cooldown >= 1.9 && a.cooldown <= 4.2));
    }
   }
  });
 }
 for(const stage of [30, 3, 31, 35, 39]){
  check(() => {
   const a = results.find(r => r.stage === stage && r.variant === 'uncapped-comparison');
   const b = results.find(r => r.stage === stage && r.variant === 'candidate');
   for(const field of ['bullets', 'launches', 'samples', 'progression', 'ticks'])assert.deepEqual(b[field], a[field], `Exact runtime comparison stage${stage} ${field}`);
  });
 }
 const out = path.join(ROOT, 'reference-artifacts/analyses/bounded-late-combat-runtime', new Date().toISOString().replace(/[:.]/g, '-'));
 fs.mkdirSync(out, { recursive: true });
 const report = { baseline: execFileSync('git', ['rev-parse', 'HEAD'], { cwd: ROOT, encoding: 'utf8' }).trim(),
  buildInfo: JSON.parse(fs.readFileSync(path.join(DIST_DEV, 'build-info.json'))),
  methodHash: hash(fs.readFileSync(__filename)), candidateBundleHash: hash(html), comparisonBundleHash: hash(comparison),
  instrumentedCandidateHash: hash(instrument(html)), instrumentedComparisonHash: hash(instrument(comparison)),
  comparisonMethod: 'Same complete built runtime with effective-stage helper replaced by identity; not separate historical build.',
  limitations: ['One seed per stage, controlled60Hz, maximum60s; normal runs may game-over without clearing.',
   'Stage126 uses actual spawnStage after test-only stage assignment; not natural progression to126.',
   'No fairness/perfect feasibility/audibility/reference-fidelity acceptance. Retained bullets on actual bullet-update ticks only for displacement checks.',
   'Cooldown bounds concern newly assigned dive/capture cooldowns; existing escort countdowns may legitimately be negative.'],
  results, errors, passed: errors.length === 0 };
 fs.writeFileSync(path.join(out, 'report.json'), JSON.stringify(report, null, 2) + '\n');
 console.log(JSON.stringify({ out, passed: report.passed, errors, results: results.map(r => ({ variant: r.variant,
  stage: r.stage, ticks: r.ticks, shots: r.bullets.length, kinds: [...new Set(r.bullets.map(b => b.kind))],
  launches: r.launches.length, updates: r.updates, maxUpdateError: r.maxUpdateError, progression: r.progression })) }, null, 2));
 assert.equal(errors.length, 0, errors.join('\n'));
}
main().catch(error => { console.error(error.stack || error); process.exitCode = 1; });
