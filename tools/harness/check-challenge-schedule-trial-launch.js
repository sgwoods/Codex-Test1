#!/usr/bin/env node
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const { createHash } = require('node:crypto');
const { ROOT, withHarnessPage } = require('./browser-check-util');
const { DIST_DEV } = require('../build/paths');
const OFFSETS = [0,3.593,7.137,9.997,13.79];

async function check(root, kind){
  return withHarnessPage({ root, skipStart: true, stage: 31 }, async ({ page }) => page.evaluate(({ kind, offsets }) => {
    const h = window.__galagaHarness__;
    const cfg = { controlledClock: true, stageMode: 'display', startKind: 'challenge',
      challengeStage: 8, stage: 31, ships: 3, expertPlays: 'human', autoVideo: false, seed: 9131 };
    let rejected = false;
    if(kind === 'ordinary'){
      h.start(cfg);
    }else if(kind === 'direct'){
      try{ window.startActiveGamePack({ ...cfg, challengeScheduleTrial: { stage: 31, groupSpawnOffsets: offsets } }); }
      catch(error){ if(!String(error).includes('Challenge schedule trial'))throw error; rejected=true; }
    }else{
      const trial = { stage: 31, groupSpawnOffsets: offsets };
      if(kind === 'invalid')trial.groupSpawnOffsets = [0,1,2,3];
      if(kind === 'stage3'){cfg.stage=3;cfg.challengeStage=1;trial.stage=3;}
      try{ h.start({ ...cfg, challengeScheduleTrial: trial }); }
      catch(error){ if(!String(error).includes('Challenge schedule trial'))throw error; rejected=true; }
    }
    const snapshot = h.snapshot(), formation = h.challengeFormationState();
    return { kind, rejected, started: snapshot.started, stage: snapshot.stage,
      otherStagesUnchanged: [3,27,30,32,35,39].every(stage => {
        const pack=currentGamePack();
        const expected=pack.challengeLayouts.filter(layout=>stage>=layout.fromStage).at(-1);
        return pack.challengeLayoutForStage(stage)===expected;
      }),
      offsets: formation.layout?.groupSpawnOffsets || null,
      overrideCleared: currentAuroraRuntimeState().harnessChallengeLayoutOverride == null };
  }, { kind, offsets: OFFSETS }));
}

async function main(){
  const results = [];
  for(const kind of ['valid','ordinary','invalid','stage3','direct'])results.push(await check(DIST_DEV,kind));
  assert.deepEqual(results[0].offsets, OFFSETS);
  assert(results[0].started && results[0].overrideCleared);
  assert(results[1].started && results[1].overrideCleared);
  assert.deepEqual(results[1].offsets,OFFSETS);
  assert(results.every(r=>r.otherStagesUnchanged));
  assert(results.slice(2).every(r=>r.rejected && !r.started));
  const fixture = fs.mkdtempSync(path.join(os.tmpdir(),'aurora-schedule-channel-'));
  fs.cpSync(DIST_DEV,fixture,{recursive:true});
  const index=path.join(fixture,'index.html'), original=fs.readFileSync(index,'utf8');
  assert(original.includes("INITIAL_BUILD_CHANNEL='development'") && original.includes("releaseChannel:'development'"));
  fs.writeFileSync(index,original.replace("INITIAL_BUILD_CHANNEL='development'","INITIAL_BUILD_CHANNEL='production beta'")
    .replace("releaseChannel:'development'","releaseChannel:'production beta'"));
  const denied = await check(fixture,'nondevelopment');
  assert(denied.rejected && !denied.started);
  results.push(denied);
  const commit=execFileSync('git',['rev-parse','HEAD'],{cwd:ROOT,encoding:'utf8'}).trim();
  const out=path.join(ROOT,'reference-artifacts/analyses/challenge-schedule-trial-launch',`${new Date().toISOString().replace(/[:.]/g,'-')}-${commit.slice(0,8)}`);
  fs.mkdirSync(out,{recursive:true});
  const report={ok:true,commit,results,methodHash:createHash('sha256').update(fs.readFileSync(__filename)).digest('hex'),
    limitation:'Nondevelopment check is a temporary channel fixture, not a full packaged beta build; ordinary is a fresh-launch control, not a UI restart test.'};
  fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(report,null,2)+'\n');
  console.log(JSON.stringify({out,...report},null,2));
}
main().catch(error=>{console.error(error);process.exitCode=1;});
