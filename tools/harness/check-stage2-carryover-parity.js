#!/usr/bin/env node
const { withHarnessPage } = require('./browser-check-util');

const EXPECTED = Object.freeze([
  Object.freeze({ type: 'enemy_damaged', id: 126498299, enemyType: 'boss', column: 6, row: 0, hpAfter: 1 }),
  Object.freeze({ type: 'enemy_attack_start', id: 443447211, enemyType: 'but', column: 4, row: 1, mode: 'dive', targetLane: 5 }),
  Object.freeze({ type: 'enemy_attack_start', id: 698410380, enemyType: 'but', column: 1, row: 1, mode: 'dive', targetLane: 6 }),
  Object.freeze({ type: 'enemy_attack_start', id: 222777900, enemyType: 'boss', column: 3, row: 0, mode: 'dive', targetLane: 5 }),
  Object.freeze({ type: 'enemy_attack_start', id: 667316348, enemyType: 'but', column: 3, row: 1, mode: 'escort', lead: 222777900, offset: -30 }),
  Object.freeze({ type: 'enemy_attack_start', id: 424328851, enemyType: 'but', column: 1, row: 0, mode: 'escort', lead: 222777900, offset: 30 }),
  Object.freeze({ type: 'enemy_damaged', id: 222777900, enemyType: 'boss', column: 3, row: 0, hpAfter: 1 }),
  Object.freeze({ type: 'enemy_lower_field', id: 667316348, enemyType: 'but', column: 3, row: 1, stageClock: 7.9 }),
  Object.freeze({ type: 'enemy_attack_start', id: 803229860, enemyType: 'but', column: 8, row: 0, mode: 'dive', targetLane: 3 }),
  Object.freeze({ type: 'enemy_damaged', id: 75739848, enemyType: 'boss', column: 5, row: 0, hpAfter: 1 }),
  Object.freeze({ type: 'enemy_attack_start', id: 332057669, enemyType: 'bee', column: 5, row: 2, mode: 'dive', targetLane: 5 }),
  Object.freeze({ type: 'enemy_damaged', id: 563479182, enemyType: 'boss', column: 4, row: 0, hpAfter: 1 })
]);

function fail(message, payload){
  console.error(message);
  if(payload) console.error(JSON.stringify(payload, null, 2));
  process.exit(1);
}

function normalizeEvent(event){
  const base = {
    type: event.type,
    id: event.id ?? event.enemyId ?? null,
    enemyType: event.enemyType ?? null,
    column: event.column ?? null,
    row: event.row ?? null
  };
  if(event.type === 'enemy_damaged'){
    base.hpAfter = event.hpAfter ?? null;
  }
  if(event.type === 'enemy_attack_start'){
    base.mode = event.mode ?? null;
    base.targetLane = event.targetLane ?? null;
    base.lead = event.lead ?? null;
    base.offset = event.offset ?? null;
  }
  if(event.type === 'enemy_lower_field'){
    base.stageClock = event.stageClock == null ? null : +(+event.stageClock).toFixed(1);
  }
  return base;
}

async function captureRelevantEvents(page){
  return page.evaluate(() => {
    const h = window.__galagaHarness__;
    h.setControlledClock(1);
    let reachedStage2 = false;
    for(let i = 0; i < 6000; i++){
      const snap = h.snapshot();
      const formation = h.formationState();
      if(!reachedStage2 && snap.stage === 2 && !snap.challenge && snap.stageClock === 0 && snap.timers?.nextStageT === 0 && formation.targets?.length === 40){
        reachedStage2 = true;
      }
      if(reachedStage2 && snap.stage === 2 && snap.stageClock >= 8.2){
        const recent = h.recentEvents({ count: 240 });
        let seenSpawn = false;
        const relevant = [];
        for(const event of recent){
          if(event.type === 'stage_spawn' && event.stage === 2){
            seenSpawn = true;
            continue;
          }
          if(!seenSpawn || event.stage !== 2) continue;
          if(['enemy_damaged', 'enemy_attack_start', 'enemy_lower_field', 'ship_lost'].includes(event.type)){
            relevant.push(event);
          }
          if(relevant.length >= 20) break;
        }
        return {
          snapshot: snap,
          relevant
        };
      }
      h.advanceFor(1 / 60, { step: 1 / 60, stopOnGameOver: true });
    }
    return {
      error: 'failed to reach the stage-2 carryover sample window',
      snapshot: h.snapshot(),
      relevant: h.recentEvents({ count: 60 })
    };
  });
}

async function main(){
  const rootArgIndex=process.argv.indexOf('--root');
  const root=rootArgIndex>=0?process.argv[rootArgIndex+1]:null;
  const result = await withHarnessPage({ stage: 1, ships: 3, challenge: false, seed: 51301, persona: 'professional', root }, async ({ page }) => {
    return captureRelevantEvents(page);
  });

  if(result.error) fail(result.error, result);

  const actual = result.relevant.slice(0, EXPECTED.length).map(normalizeEvent);
  const expected = EXPECTED.map(event => ({ ...event }));
  if(JSON.stringify(actual) !== JSON.stringify(expected)){
    fail('stage-2 carryover behavior drifted away from the shipped production baseline', {
      snapshot: result.snapshot,
      expected,
      actual,
      raw: result.relevant.slice(0, EXPECTED.length)
    });
  }

  console.log(JSON.stringify({ ok: true, snapshot: result.snapshot, actual }, null, 2));
}

module.exports = {
  EXPECTED,
  normalizeEvent,
  captureRelevantEvents
};

main().catch(err => fail(err && err.stack || String(err)));
